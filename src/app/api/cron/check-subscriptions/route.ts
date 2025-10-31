// app/api/cron/check-subscriptions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { updateUserPlanCache } from '@/app/libs/subscriptionChecker';

import { PLAN_PRICES, BillingPeriod } from '@/app/libs/subscriptionConstants';
import {
  sendRenewalReminderEmail,
  sendTrialExpiringEmail,
} from '@/app/libs/newsletter/email';

/**
 * GET /api/cron/check-subscriptions
 * Verifica assinaturas expirando e envia notificações
 *
 * DEVE SER CHAMADO POR UM CRON JOB EXTERNO (Vercel Cron, etc)
 * Recomendado: Executar 1x por dia
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar autorização do cron (via secret)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('[Cron] Starting subscription check...');

    const now = new Date();
    const results = {
      trialsExpiring: 0,
      trialsExpired: 0,
      renewalsReminder: 0,
      subscriptionsExpired: 0,
      errors: [] as string[],
    };

    // ==================== 1. VERIFICAR TRIALS EXPIRANDO ====================
    // Buscar trials que expiram em 3 dias
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const trialsExpiringSoon = await prisma.subscription.findMany({
      where: {
        status: 'TRIAL',
        trialEndDate: {
          gte: now,
          lte: threeDaysFromNow,
        },
      },
      include: {
        user: true,
      },
    });

    console.log(
      `[Cron] Found ${trialsExpiringSoon.length} trials expiring soon`
    );

    for (const subscription of trialsExpiringSoon) {
      try {
        const daysRemaining = Math.ceil(
          (subscription.trialEndDate!.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        // Verificar se já enviou email hoje (para não spammar)
        const lastHistory = await prisma.subscriptionHistory.findFirst({
          where: {
            subscriptionId: subscription.id,
            action: 'TRIAL_EXPIRING_NOTIFICATION',
            createdAt: {
              gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // últimas 24h
            },
          },
        });

        if (!lastHistory) {
          const userName =
            `${subscription.user.firstName || ''} ${subscription.user.lastName || ''}`.trim() ||
            'Usuário';
          if (!subscription.user.email) {
            return NextResponse.json(
              {
                error: 'Email não inserido',
              },
              { status: 500 }
            );
          }
          await sendTrialExpiringEmail({
            userEmail: subscription.user.email,
            userName,
            planType: subscription.planType,
            trialEndDate: subscription.trialEndDate,
          });

          // Registrar que enviou
          await prisma.subscriptionHistory.create({
            data: {
              subscriptionId: subscription.id,
              userId: subscription.userId,
              action: 'TRIAL_EXPIRING_NOTIFICATION' as any,
              fromPlan: subscription.planType as any,
              toPlan: subscription.planType as any,
              reason: `Email enviado: Trial expira em ${daysRemaining} dias`,
            },
          });

          results.trialsExpiring++;
        }
      } catch (error) {
        console.error(
          `[Cron] Error processing trial ${subscription.id}:`,
          error
        );
        results.errors.push(`Trial ${subscription.id}: ${error}`);
      }
    }

    // ==================== 2. EXPIRAR TRIALS ====================
    const expiredTrials = await prisma.subscription.findMany({
      where: {
        status: 'TRIAL',
        trialEndDate: {
          lt: now,
        },
      },
      include: {
        user: true,
      },
    });

    console.log(`[Cron] Found ${expiredTrials.length} expired trials`);

    for (const subscription of expiredTrials) {
      try {
        // Atualizar para EXPIRED
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'EXPIRED',
          },
        });

        // Atualizar cache do usuário para FREE
        await updateUserPlanCache(subscription.userId);

        // Registrar histórico
        await prisma.subscriptionHistory.create({
          data: {
            subscriptionId: subscription.id,
            userId: subscription.userId,
            action: 'EXPIRED',
            fromPlan: subscription.planType as any,
            toPlan: 'FREE',
            fromPrice: subscription.price,
            toPrice: 0,
            reason: 'Trial expirado',
          },
        });

        results.trialsExpired++;
      } catch (error) {
        console.error(`[Cron] Error expiring trial ${subscription.id}:`, error);
        results.errors.push(`Expire trial ${subscription.id}: ${error}`);
      }
    }

    // ==================== 3. LEMBRETE DE RENOVAÇÃO ====================
    // Buscar assinaturas que renovam em 7 dias
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const renewalsSoon = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        autoRenew: true,
        endDate: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      include: {
        user: true,
      },
    });

    console.log(`[Cron] Found ${renewalsSoon.length} renewals in 7 days`);

    for (const subscription of renewalsSoon) {
      try {
        // Verificar se já enviou lembrete
        const lastReminder = await prisma.subscriptionHistory.findFirst({
          where: {
            subscriptionId: subscription.id,
            action: 'RENEWAL_REMINDER_SENT' as any,
            createdAt: {
              gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // últimos 7 dias
            },
          },
        });

        if (!lastReminder && subscription.endDate) {
          const userName =
            `${subscription.user.firstName || ''} ${subscription.user.lastName || ''}`.trim() ||
            'Usuário';
          if (!subscription.user.email) {
            return NextResponse.json(
              {
                error: 'Email não inserido',
              },
              { status: 500 }
            );
          }
          const amount =
            subscription.billingPeriod === BillingPeriod.MONTHLY
              ? PLAN_PRICES[subscription.planType as keyof typeof PLAN_PRICES]
                  ?.MONTHLY || 0
              : PLAN_PRICES[subscription.planType as keyof typeof PLAN_PRICES]
                  ?.YEARLY_TOTAL || 0;

          await sendRenewalReminderEmail({
            userEmail: subscription.user.email,
            userName,
            planType: subscription.planType,
            renewalDate: subscription.endDate,
            amount,
          });

          // Registrar
          await prisma.subscriptionHistory.create({
            data: {
              subscriptionId: subscription.id,
              userId: subscription.userId,
              action: 'RENEWAL_REMINDER_SENT' as any,
              fromPlan: subscription.planType as any,
              toPlan: subscription.planType as any,
              reason: 'Lembrete de renovação enviado',
            },
          });

          results.renewalsReminder++;
        }
      } catch (error) {
        console.error(
          `[Cron] Error sending renewal reminder ${subscription.id}:`,
          error
        );
        results.errors.push(`Renewal reminder ${subscription.id}: ${error}`);
      }
    }

    // ==================== 4. EXPIRAR ASSINATURAS ====================
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: now,
        },
      },
      include: {
        user: true,
      },
    });

    console.log(
      `[Cron] Found ${expiredSubscriptions.length} expired subscriptions`
    );

    for (const subscription of expiredSubscriptions) {
      try {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'EXPIRED',
          },
        });

        await updateUserPlanCache(subscription.userId);

        await prisma.subscriptionHistory.create({
          data: {
            subscriptionId: subscription.id,
            userId: subscription.userId,
            action: 'EXPIRED',
            fromPlan: subscription.planType as any,
            toPlan: 'FREE',
            fromPrice: subscription.price,
            toPrice: 0,
            reason: 'Assinatura expirada',
          },
        });

        results.subscriptionsExpired++;
      } catch (error) {
        console.error(
          `[Cron] Error expiring subscription ${subscription.id}:`,
          error
        );
        results.errors.push(`Expire subscription ${subscription.id}: ${error}`);
      }
    }

    console.log('[Cron] Check completed:', results);

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error) {
    console.error('[GET /api/cron/check-subscriptions] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao executar cron job' },
      { status: 500 }
    );
  }
}
