// app/api/subscription/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { sendSubscriptionCancelledEmail } from '@/app/libs/newsletter/email';

/**
 * POST /api/subscription/cancel
 * Cancela a assinatura (acesso continua até o fim do período pago)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { reason, feedback } = body;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar assinatura ativa
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ['TRIAL', 'ACTIVE'] },
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura ativa encontrada' },
        { status: 404 }
      );
    }

    // Plano FREE não pode ser "cancelado"
    if (subscription.planType === 'FREE') {
      return NextResponse.json(
        { error: 'Plano gratuito não pode ser cancelado' },
        { status: 400 }
      );
    }

    const now = new Date();

    // Atualizar assinatura
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: now,
        autoRenew: false,
        metadata: {
          ...((subscription.metadata as any) || {}),
          cancelReason: reason || 'Não informado',
          cancelFeedback: feedback || null,
          cancelledBy: 'user',
        },
      },
    });

    // Criar histórico
    await prisma.subscriptionHistory.create({
      data: {
        subscriptionId: subscription.id,
        userId: user.id,
        action: 'CANCELLED',
        fromPlan: subscription.planType as any,
        toPlan: 'FREE',
        fromPrice: subscription.price,
        toPrice: 0,
        reason: reason || 'Cancelamento solicitado pelo usuário',
        metadata: {
          feedback,
          cancelledAt: now,
        },
      },
    });

    // Enviar email de confirmação
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
    await sendSubscriptionCancelledEmail({
      userEmail: user.email,
      userName,
      planType: subscription.planType,
    });

    revalidateTag(`subscription-${user.id}`);

    return NextResponse.json({
      success: true,
      message: subscription.endDate
        ? `Assinatura cancelada. Você terá acesso até ${subscription.endDate.toLocaleDateString('pt-BR')}`
        : 'Assinatura cancelada com sucesso',
      subscription: updatedSubscription,
      accessUntil: subscription.endDate || now,
    });
  } catch (error) {
    console.error('[POST /api/subscription/cancel] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao cancelar assinatura' },
      { status: 500 }
    );
  }
}
