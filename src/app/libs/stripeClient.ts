// app/libs/stripeClient.ts
import Stripe from 'stripe';
import {
  PlanType,
  BillingPeriod,
  calculateFinalPrice,
  getPlanName,
  getBillingPeriodName,
} from './subscriptionConstants';

// Configuração do cliente Stripe
// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2025-10-29.clover',
//   timeout: 5000,
// });

const isProduction = process.env.NODE_ENV === 'production';

export function getStripeClient() {
  const isProduction = process.env.NODE_ENV === 'production';

  const key = isProduction
    ? process.env.STRIPE_SECRET_KEY //depois retirar o TEST
    : process.env.STRIPE_SECRET_KEY_TEST;

  if (!key) {
    throw new Error('Stripe API key não definida');
  }

  return new Stripe(key, {
    apiVersion: '2025-10-29.clover',
  });
}

export const STRIPE_WEBHOOK_SECRET = isProduction
  ? process.env.STRIPE_WEBHOOK_SECRET! //depois retirar o TEST
  : process.env.STRIPE_WEBHOOK_SECRET_TEST!;

export const getAppUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXT_PUBLIC_APP_URL_PROD)
      throw new Error('NEXT_PUBLIC_APP_URL_PROD não definido');
    return process.env.NEXT_PUBLIC_APP_URL_PROD;
  } else {
    if (!process.env.NEXT_PUBLIC_APP_URL)
      throw new Error('NEXT_PUBLIC_APP_URL não definido');
    return process.env.NEXT_PUBLIC_APP_URL;
  }
};

/**

/**
 * Interface para criação de sessão de checkout (assinatura)
 */
export interface CreateCheckoutSessionData {
  userId: string;
  userEmail: string;
  userName: string;
  planType: PlanType;
  billingPeriod: BillingPeriod;
  couponCode?: string;
}

/**
 * Cria uma sessão de checkout no Stripe (assinatura)
 */
export async function createCheckoutSession(data: CreateCheckoutSessionData) {
  try {
    const { userId, userEmail, planType, billingPeriod, couponCode } = data;

    // Calcular valores (mantendo sua lógica)
    const { originalPrice, discount, finalPrice } = calculateFinalPrice(
      planType,
      billingPeriod,
      couponCode
        ? {
            type: 'PERCENTAGE',
            discountValue: 20,
          }
        : undefined
    );

    // Nome do plano e período
    const planName = getPlanName(planType);
    const periodName = getBillingPeriodName(billingPeriod);

    // Criar ou usar um produto Stripe (você pode cachear IDs no DB)
    const product = await getStripeClient().products.create({
      name: `Opus Atlas - ${planName}`,
      description: `Assinatura ${periodName}`,
    });

    // Criar preço recorrente
    const price = await getStripeClient().prices.create({
      product: product.id,
      unit_amount: Math.round(finalPrice * 100), // centavos
      currency: 'brl',
      recurring: {
        interval: billingPeriod === BillingPeriod.YEARLY ? 'year' : 'month',
      },
    });

    // Criar sessão de checkout
    const session = await getStripeClient().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card', 'pix'],
      customer_email: userEmail,
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: {
        user_id: userId,
        plan_type: planType,
        billing_period: billingPeriod,
        original_price: originalPrice,
        discount,
        final_price: finalPrice,
        coupon_code: couponCode || null,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/cancel`,
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
      amount: finalPrice,
    };
  } catch (error) {
    console.error('[createCheckoutSession] Error:', error);
    return {
      success: false,
      error: 'Erro ao criar sessão de checkout no Stripe',
      details: error,
    };
  }
}

/**
 * Busca informações de uma sessão de checkout
 */
export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await getStripeClient().checkout.sessions.retrieve(
      sessionId,
      {
        expand: ['subscription', 'payment_intent'],
      }
    );

    return {
      success: true,
      session,
    };
  } catch (error) {
    console.error('[getCheckoutSession] Error:', error);
    return {
      success: false,
      error: 'Erro ao buscar sessão do Stripe',
      details: error,
    };
  }
}

/**
 * Processa notificação de webhook do Stripe
 */
export async function processStripeWebhook(
  body: Buffer,
  signature: string | string[] | undefined
) {
  try {
    // const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const endpointSecret =
      'sk_test_51SOLnFGmqGOcpsPeoopGs0b7xusrqGQfMlp9mDe4YGQC5VGo8ItsLTOCGNP8sjDxeDhLeJ2h8KajQYOcRhq1QwK800Q292E0mp';

    const event = getStripeClient().webhooks.constructEvent(
      body,
      signature!,
      endpointSecret
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          success: true,
          type: 'checkout_completed',
          sessionId: session.id,
          subscriptionId: session.subscription,
          status: session.payment_status,
          customerEmail: session.customer_email,
          metadata: session.metadata,
        };
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        return {
          success: true,
          type: 'payment_failed',
          //   subscriptionId: invoice.subscription,
          customerEmail: invoice.customer_email,
        };
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        return {
          success: true,
          type: 'subscription_cancelled',
          subscriptionId: sub.id,
          //   customerEmail: sub.customer_email,
          status: sub.status,
        };
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return { success: true, type: event.type };
    }
  } catch (error) {
    console.error('[processStripeWebhook] Error:', error);
    return {
      success: false,
      error: 'Erro ao processar webhook do Stripe',
      details: error,
    };
  }
}

/**
 * Verifica se um pagamento foi aprovado
 */
export function isPaymentApproved(status: string): boolean {
  return status === 'paid' || status === 'complete';
}

/**
 * Verifica se um pagamento foi rejeitado
 */
export function isPaymentRejected(status: string): boolean {
  return status === 'failed' || status === 'canceled' || status === 'unpaid';
}

/**
 * Verifica se um pagamento está pendente
 */
export function isPaymentPending(status: string): boolean {
  return status === 'pending' || status === 'requires_payment_method';
}

/**
 * Mapeia status do Stripe para status interno
 */
export function mapStripeStatusToInternal(stripeStatus: string): string {
  const map: Record<string, string> = {
    paid: 'APPROVED',
    complete: 'APPROVED',
    failed: 'REJECTED',
    canceled: 'CANCELLED',
    unpaid: 'PENDING',
    requires_payment_method: 'PENDING',
  };
  return map[stripeStatus] || 'PENDING';
}

/**
 * Mapeia método de pagamento do Stripe
 */
export function mapStripePaymentMethod(methodType: string): string {
  const map: Record<string, string> = {
    card: 'CREDIT_CARD',
    pix: 'PIX',
    boleto: 'BOLETO',
    cashapp: 'CASH_APP',
    paypal: 'PAYPAL',
  };
  return map[methodType] || 'CREDIT_CARD';
}
