import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/app/libs/prismadb';
import { Prisma } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});
type StripeInvoiceWithSubscription = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null;
};
export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature error:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      /**
       * ✅ Checkout finalizado
       */
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode !== 'subscription') break;

        await prisma.subscription.updateMany({
          where: { stripeSessionId: session.id },
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

        break;
      }

      /**
       * 💰 Pagamento bem-sucedido
       */
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as StripeInvoiceWithSubscription;

        const stripeSubId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id;

        if (!stripeSubId) break;

        const subscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: stripeSubId },
        });

        if (!subscription) break;

        const paidAt = invoice.status_transitions?.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000)
          : new Date();

        await prisma.payment.create({
          data: {
            subscriptionId: subscription.id,
            amount: invoice.amount_paid / 100,
            finalAmount: invoice.amount_paid / 100,
            currency: invoice.currency.toUpperCase(),
            status: 'APPROVED',
            paymentMethod: 'CREDIT_CARD',
            paidAt,
            metadata: invoice as unknown as Prisma.InputJsonValue,
          },
        });

        break;
      }

      /**
       * ❌ Falha no pagamento
       */
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        await prisma.payment.create({
          data: {
            subscriptionId: 'TEMP', // opcional
            amount: invoice.amount_due / 100,
            finalAmount: invoice.amount_due / 100,
            currency: invoice.currency.toUpperCase(),
            status: 'FAILED',
            metadata: invoice as unknown as Prisma.InputJsonValue,
          },
        });

        break;
      }

      /**
       * 🚫 Assinatura cancelada
       */
      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as Stripe.Subscription;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: stripeSub.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            autoRenew: false,
          },
        });

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
