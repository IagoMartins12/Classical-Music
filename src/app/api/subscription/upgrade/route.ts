// app/api/subscription/upgrade/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import {
  PlanType,
  getPlanChangeType,
  calculateFinalPrice,
} from '@/app/libs/subscriptionConstants';
import { createCheckoutSession } from '@/app/libs/stripeClient';
import { updateUserPlanCache } from '@/app/libs/subscriptionChecker';
import { sendPlanChangedEmail } from '@/app/libs/newsletter/email';

/**
 * POST /api/subscription/upgrade
 * Faz upgrade ou downgrade de plano (Stripe)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { newPlanType, billingPeriod } = body;

    // Validações básicas
    if (!newPlanType || !Object.values(PlanType).includes(newPlanType)) {
      return NextResponse.json(
        { error: 'Tipo de plano inválido' },
        { status: 400 }
      );
    }

    if (newPlanType !== PlanType.FREE && !billingPeriod) {
      return NextResponse.json(
        { error: 'Período de cobrança obrigatório para planos pagos' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        currentPlan: true,
      },
    });
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar assinatura atual
    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ['TRIAL', 'ACTIVE'] },
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
    });
    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura ativa encontrada' },
        { status: 404 }
      );
    }

    const currentPlan = currentSubscription.planType as PlanType;
    const changeType = getPlanChangeType(currentPlan, newPlanType);

    if (changeType === 'SAME') {
      return NextResponse.json(
        { error: 'Você já está neste plano' },
        { status: 400 }
      );
    }

    // Calcular novo preço
    const { finalPrice } = calculateFinalPrice(newPlanType, billingPeriod);
    const now = new Date();
    const userName =
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuário';
    if (!user.email) {
      return NextResponse.json(
        {
          error: 'Email não inserido',
        },
        { status: 500 }
      );
    }
    // ⚙️ DOWNGRADE → só agenda pro final do ciclo
    if (changeType === 'DOWNGRADE') {
      await prisma.subscription.update({
        where: { id: currentSubscription.id },
        data: {
          autoRenew: false,
          metadata: {
            ...((currentSubscription.metadata as any) || {}),
            pendingDowngrade: newPlanType,
            downgradeReason: 'Solicitação do usuário',
          },
        },
      });

      await prisma.subscriptionHistory.create({
        data: {
          subscriptionId: currentSubscription.id,
          userId: user.id,
          action: 'DOWNGRADED',
          fromPlan: currentPlan,
          toPlan: newPlanType,
          fromPrice: currentSubscription.price,
          toPrice: finalPrice,
          reason: `Downgrade agendado para ${currentSubscription.endDate?.toLocaleDateString('pt-BR')}`,
        },
      });

      await sendPlanChangedEmail({
        userEmail: user.email,
        userName,
        fromPlan: currentPlan,
        toPlan: newPlanType,
        changeType: 'DOWNGRADE',
      });

      revalidateTag(`subscription-${user.id}`);

      return NextResponse.json({
        success: true,
        message: `Downgrade agendado. Você continuará no plano ${currentPlan} até ${currentSubscription.endDate?.toLocaleDateString('pt-BR')}`,
        currentSubscription,
        scheduledDowngrade: {
          newPlan: newPlanType,
          effectiveDate: currentSubscription.endDate,
        },
      });
    }

    // ⚙️ UPGRADE → novo checkout Stripe
    const sessionResult = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      userName,
      planType: newPlanType,
      billingPeriod,
    });

    if (!sessionResult.success) {
      return NextResponse.json(
        {
          error: 'Erro ao criar sessão de pagamento no Stripe',
          details: sessionResult.error,
        },
        { status: 500 }
      );
    }

    // Cancelar assinatura anterior
    await prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: now,
        autoRenew: false,
        metadata: {
          ...((currentSubscription.metadata as any) || {}),
          cancelReason: 'Upgrade para novo plano',
        },
      },
    });

    // Criar nova assinatura pendente (aguardando pagamento)
    const newSubscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planType: newPlanType,
        billingPeriod,
        status: 'TRIAL', // aguardando confirmação
        startDate: now,
        endDate: null,
        trialEndDate: null,
        price: finalPrice,
        autoRenew: true,
        stripeSessionId: sessionResult.sessionId,
        stripeCheckoutUrl: sessionResult.url,
      },
    });

    // Histórico
    await prisma.subscriptionHistory.create({
      data: {
        subscriptionId: newSubscription.id,
        userId: user.id,
        action: 'UPGRADED',
        fromPlan: currentPlan,
        toPlan: newPlanType,
        fromPrice: currentSubscription.price,
        toPrice: finalPrice,
        reason: 'Upgrade imediato via Stripe',
      },
    });

    // Cache e revalidação
    await updateUserPlanCache(user.id);
    revalidateTag(`subscription-${user.id}`);

    // Email de upgrade
    await sendPlanChangedEmail({
      userEmail: user.email,
      userName,
      fromPlan: currentPlan,
      toPlan: newPlanType,
      changeType: 'UPGRADE',
    });

    return NextResponse.json({
      success: true,
      subscription: newSubscription,
      payment: {
        sessionId: sessionResult.sessionId,
        checkoutUrl: sessionResult.url,
      },
      message: 'Redirecionando para pagamento do upgrade...',
    });
  } catch (error) {
    console.error('[POST /api/subscription/upgrade] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar upgrade/downgrade', details: String(error) },
      { status: 500 }
    );
  }
}
