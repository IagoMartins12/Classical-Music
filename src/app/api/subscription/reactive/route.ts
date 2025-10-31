// app/api/subscription/reactivate/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { updateUserPlanCache } from '@/app/libs/subscriptionChecker';

/**
 * POST /api/subscription/reactivate
 * Reativa uma assinatura cancelada (antes do fim do período)
 */
export async function POST() {
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
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar assinatura cancelada (mas ainda ativa)
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'CANCELLED',
        endDate: { gte: new Date() }, // Ainda não expirou
      },
      orderBy: {
        cancelledAt: 'desc',
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura cancelada encontrada ou já expirou' },
        { status: 404 }
      );
    }

    // Reativar assinatura
    const reactivatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        cancelledAt: null,
        autoRenew: true,
        metadata: {
          ...((subscription.metadata as any) || {}),
          reactivatedAt: new Date(),
          reactivatedBy: 'user',
        },
      },
    });

    // Criar histórico
    await prisma.subscriptionHistory.create({
      data: {
        subscriptionId: subscription.id,
        userId: user.id,
        action: 'REACTIVATED',
        fromPlan: 'FREE',
        toPlan: subscription.planType as any,
        fromPrice: 0,
        toPrice: subscription.price,
        reason: 'Reativação pelo usuário',
      },
    });

    // Atualizar cache
    await updateUserPlanCache(user.id);

    revalidateTag(`subscription-${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Assinatura reativada com sucesso!',
      subscription: reactivatedSubscription,
    });
  } catch (error) {
    console.error('[POST /api/subscription/reactivate] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao reativar assinatura' },
      { status: 500 }
    );
  }
}
