import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return new NextResponse('Missing Stripe signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // 🔥 RAW BODY (OBRIGATÓRIO)
    const body = await req.text();

    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('❌ Webhook error:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // ✅ Evento validado
  console.log('✅ Webhook recebido:', event.type);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log('💰 Checkout finalizado:', session.id);
      break;
    }

    default:
      console.log(`ℹ️ Evento ignorado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
