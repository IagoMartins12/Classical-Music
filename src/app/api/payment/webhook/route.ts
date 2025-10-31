import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import Stripe from 'stripe';
import { revalidateTag } from 'next/cache';
import { updateUserPlanCache } from '@/app/libs/subscriptionChecker';
import { prepareInvoiceData } from '@/app/libs/invoiceGenerator';
import { BillingPeriod } from '@/app/libs/subscriptionConstants';
import { sendPaymentApprovedEmail } from '@/app/libs/newsletter/email';

const stripe = new Stripe(
  'sk_test_51SOLnFGmqGOcpsPeoopGs0b7xusrqGQfMlp9mDe4YGQC5VGo8ItsLTOCGNP8sjDxeDhLeJ2h8KajQYOcRhq1QwK800Q292E0mp',
  {
    apiVersion: '2025-10-29.clover',
  }
);

/**
 * POST /api/payment/webhook
 * Webhook oficial do Stripe
 */
export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json(
      { error: 'Assinatura de webhook ausente' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const buf = await req.arrayBuffer();

    // event = stripe.webhooks.constructEvent(
    //   Buffer.from(buf),
    //   sig,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // );
    event = stripe.webhooks.constructEvent(
      Buffer.from(buf),
      sig,
      'sk_test_51SOLnFGmqGOcpsPeoopGs0b7xusrqGQfMlp9mDe4YGQC5VGo8ItsLTOCGNP8sjDxeDhLeJ2h8KajQYOcRhq1QwK800Q292E0mp'
    );
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    console.log(`[Webhook] Event received: ${event.type}`);

    switch (event.type) {
      /**
       * Usuário completou o checkout → pagamento confirmado
       */
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const subscription = await prisma.subscription.findFirst({
          where: { stripeSessionId: session.id },
          include: { user: true, coupon: true },
        });

        if (!subscription) {
          console.error(
            '[Webhook] Subscription not found for session:',
            session.id
          );
          return NextResponse.json(
            { error: 'Assinatura não encontrada' },
            { status: 404 }
          );
        }

        // Evita duplicação
        const existingPayment = await prisma.payment.findFirst({
          where: { stripeSessionId: session.id },
        });
        if (existingPayment) {
          console.log(
            '[Webhook] Payment already exists for session:',
            session.id
          );
          return NextResponse.json({ success: true });
        }

        // Criar pagamento
        const payment = await prisma.payment.create({
          data: {
            subscriptionId: subscription.id,
            amount: subscription.price ?? 0,
            finalAmount: subscription.price ?? 0,
            currency: 'BRL',
            status: 'APPROVED',
            paymentMethod: 'CREDIT_CARD',
            stripeSessionId: session.id,
            // stripePaymentIntentId: session.payment_intent as string,
            payerEmail: session.customer_email || subscription.user.email,
            paidAt: new Date(),
          },
        });

        console.log('[Webhook] Payment created:', payment.id);

        // Calcular endDate (mensal ou anual)
        const now = new Date();
        const endDate =
          subscription.billingPeriod === BillingPeriod.YEARLY
            ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
            : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        // Atualizar assinatura para ACTIVE
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'ACTIVE',
            startDate: now,
            endDate,
            stripeSubscriptionId: session.subscription as string,
          },
        });

        // Criar histórico
        await prisma.subscriptionHistory.create({
          data: {
            subscriptionId: subscription.id,
            userId: subscription.userId,
            action: 'RENEWED',
            fromPlan: subscription.planType,
            toPlan: subscription.planType,
            fromPrice: subscription.price,
            toPrice: subscription.price,
            reason: 'Pagamento confirmado via Stripe',
          },
        });

        // Atualizar cache
        await updateUserPlanCache(subscription.userId);

        // Gerar invoice
        const invoiceData = prepareInvoiceData(
          subscription,
          payment,
          subscription.user
        );
        // const invoiceHTML = generateInvoiceHTML(invoiceData);

        const invoice = await prisma.invoice.create({
          data: {
            subscriptionId: subscription.id,
            paymentId: payment.id,
            invoiceNumber: invoiceData.invoiceNumber,
            amount: invoiceData.amount,
            taxAmount: invoiceData.taxAmount,
            totalAmount: invoiceData.totalAmount,
            status: 'PAID',
            issueDate: invoiceData.issueDate,
            dueDate: invoiceData.dueDate,
            paidAt: now,
            customerName: invoiceData.customerName,
            customerEmail: invoiceData.customerEmail,
            customerDocument: invoiceData.customerDocument,
            customerAddress: invoiceData.customerAddress,
            customerCity: invoiceData.customerCity,
            customerState: invoiceData.customerState,
            customerZipCode: invoiceData.customerZipCode,
            description: invoiceData.serviceDescription,
            // TODO: upload PDF e salvar invoice.pdfUrl
          },
        });
        if (!subscription.user.email) {
          return NextResponse.json(
            {
              error: 'Email não inserido',
            },
            { status: 500 }
          );
        }
        // Enviar email de confirmação
        await sendPaymentApprovedEmail({
          userEmail: subscription.user.email,
          userName:
            `${subscription.user.firstName || ''} ${subscription.user.lastName || ''}`.trim() ||
            'Usuário',
          planType: subscription.planType,
          billingPeriod: subscription.billingPeriod || undefined,
          amount: payment.finalAmount,
          invoiceUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoice/${invoice.id}`,
        });

        console.log('[Webhook] Payment confirmed, subscription activated.');
        revalidateTag(`subscription-${subscription.userId}`);
        break;
      }

      /**
       * Pagamento falhou
       */
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.id as string;

        const subscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subId },
        });

        if (!subscription) return NextResponse.json({ success: true });

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'EXPIRED' },
        });

        console.warn('[Webhook] Payment failed, subscription expired.');
        break;
      }

      /**
       * Assinatura cancelada pelo usuário
       */
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;

        const subscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });

        if (!subscription) return NextResponse.json({ success: true });

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
          },
        });

        console.warn('[Webhook] Subscription cancelled.');
        break;
      }

      default:
        console.log(`[Webhook] Ignored event: ${event.type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/payment/webhook] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/webhook
 * Endpoint de validação do Stripe (opcional)
 */
export async function GET() {
  return NextResponse.json({ message: 'Stripe webhook is active' });
}
