// app/api/subscription/current/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { checkUserSubscription } from '@/app/libs/subscriptionChecker';

/**
 * GET /api/subscription/current
 * Retorna a assinatura atual do usuário logado
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        currentPlan: true,
        planExpiresAt: true,
        isTrialActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar assinatura completa
    const subscriptionCheck = await checkUserSubscription();

    // Buscar histórico recente
    const history = await prisma.subscriptionHistory.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Buscar pagamentos recentes
    const payments = await prisma.payment.findMany({
      where: {
        subscription: {
          userId: user.id,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      include: {
        subscription: {
          select: {
            planType: true,
            billingPeriod: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        currentPlan: user.currentPlan,
        planExpiresAt: user.planExpiresAt,
        isTrialActive: user.isTrialActive,
      },
      subscription: subscriptionCheck.subscription,
      plan: {
        type: subscriptionCheck.plan,
        isValid: subscriptionCheck.isValid,
        isTrialActive: subscriptionCheck.isTrialActive,
        trialDaysRemaining: subscriptionCheck.trialDaysRemaining,
        expiresAt: subscriptionCheck.expiresAt,
        features: subscriptionCheck.features,
      },
      history,
      recentPayments: payments,
    });
  } catch (error) {
    console.error('[GET /api/subscription/current] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar assinatura' },
      { status: 500 }
    );
  }
}
