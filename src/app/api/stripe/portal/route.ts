import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST!, {
  apiVersion: '2025-10-29.clover',
});

/**
 * POST /api/stripe/portal
 * Redireciona usuário para o Portal do Stripe
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
        stripeCustomerId: { not: null },
      },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura ativa encontrada' },
        { status: 400 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: process.env.NEXT_PUBLIC_APP_URL!,
    });

    return NextResponse.json({
      success: true,
      url: portalSession.url,
    });
  } catch (error) {
    console.error('[STRIPE PORTAL ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao abrir portal do Stripe' },
      { status: 500 }
    );
  }
}
