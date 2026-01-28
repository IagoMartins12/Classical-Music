import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getAppUrl, getStripeClient } from '@/app/libs/stripeClient';

/**
 * POST /api/stripe/checkout
 * Cria uma sessão de checkout no Stripe
 */
export async function POST(req: NextRequest) {
  try {
    const sessionAuth = await getServerSession(authOptions);

    if (!sessionAuth?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { planType, billingPeriod } = await req.json();

    if (!planType || !billingPeriod) {
      return NextResponse.json(
        { error: 'Plano ou período inválido' },
        { status: 400 }
      );
    }

    // ⚠️ USE PRICE_ID (price_xxx), NÃO prod_xxx
    const PRICE_IDS: Record<string, Record<string, string>> = {
      PLUS: {
        MONTHLY: 'price_1SOMWIGmqGOcpsPecTQeNsGd',
        YEARLY: 'price_1SmJuuGmqGOcpsPeAbZqLjO9',
      },
      MENTOR: {
        MONTHLY: 'price_1SONWWGmqGOcpsPeGbNNxDZs',
        YEARLY: 'price_1SmJtUGmqGOcpsPesdXCrlAs',
      },
      MAESTRO: {
        MONTHLY: 'price_1SONWNGmqGOcpsPexlJSeMQ9',
        YEARLY: 'price_1SmJu7GmqGOcpsPeJm99HJZS',
      },
    };

    const priceId = PRICE_IDS?.[planType]?.[billingPeriod];

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID não configurado' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: sessionAuth.user.email },
      select: { id: true, email: true },
    });

    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const successUrl = `${getAppUrl()}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${getAppUrl()}/pricing`;

    console.log('successUrl', successUrl); // veja se está correto

    const checkoutSession = await getStripeClient().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        planType,
        billingPeriod,
      },
      locale: 'pt', //
    });

    // Registro provisório
    await prisma.subscription.create({
      data: {
        userId: user.id,
        planType,
        billingPeriod,
        status: 'TRIAL', // aguardando confirmação Stripe
        stripeSessionId: checkoutSession.id,
        stripeCheckoutUrl: checkoutSession.url,
      },
    });

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('[STRIPE CHECKOUT ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao criar checkout' },
      { status: 500 }
    );
  }
}
