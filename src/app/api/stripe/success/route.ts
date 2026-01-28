import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { getStripeClient } from '@/app/libs/stripeClient';
/**
 * GET /api/stripe/success?session_id=xxx
 * Confirma pagamento após retorno do Stripe
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id ausente' },
        { status: 400 }
      );
    }

    const session = await getStripeClient().checkout.sessions.retrieve(
      sessionId,
      {
        expand: ['subscription', 'customer'],
      }
    );

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Pagamento não concluído' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: { stripeSessionId: session.id },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Assinatura não encontrada' },
        { status: 404 }
      );
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        stripeSubscriptionId:
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id,
        stripeCustomerId:
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id,
        startDate: new Date(),
      },
    });

    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        stripeSessionId: session.id,
        amount: (session.amount_total ?? 0) / 100,
        finalAmount: (session.amount_total ?? 0) / 100,
        currency: session.currency?.toUpperCase() ?? 'BRL',
        status: 'APPROVED',
        paymentMethod: 'CREDIT_CARD',
        paidAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[STRIPE SUCCESS ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao confirmar pagamento' },
      { status: 500 }
    );
  }
}
