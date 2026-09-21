/**
 * Assinatura e cupom pela API, chamados do navegador.
 *
 * O legado tinha dois checkouts — `/api/stripe/checkout` (o que a página de
 * preços usa) e `/api/subscription/create` — e a API juntou os dois em
 * `POST /subscription/create`: plano pago volta com `payment.checkoutUrl` do
 * Stripe; o FREE volta sem pagamento.
 */
import { ApiError, apiFetch, type ApiRequest } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';
import type { BillingPeriod, PlanType } from '@/app/libs/subscriptionConstants';

type SubscriptionAction = ApiSchema<'SubscriptionActionResponseDto'>;
type CurrentSubscription = ApiSchema<'CurrentSubscriptionResponseDto'>;
type CouponValidation = ApiSchema<'CouponValidationResponseDto'>;

/** Erro da API vira `Error` com a mensagem dela, como o `result.error` do legado. */
async function call<T>(
  path: string,
  request: ApiRequest,
  fallbackMessage: string
): Promise<T> {
  try {
    return await apiFetch<T>(path, request);
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message || fallbackMessage);
    }

    throw error;
  }
}

export function getCurrentSubscription() {
  return call<CurrentSubscription>(
    '/subscription/current',
    {},
    'Erro ao buscar assinatura'
  );
}

export function createSubscriptionRequest(
  planType: PlanType,
  billingPeriod?: BillingPeriod,
  couponCode?: string
) {
  return call<SubscriptionAction>(
    '/subscription/create',
    {
      method: 'POST',
      // Cupom vazio seria validado (e recusado) pela API.
      body: { planType, billingPeriod, couponCode: couponCode || undefined },
    },
    'Erro ao criar assinatura'
  );
}

export function upgradeSubscriptionRequest(
  newPlanType: PlanType,
  billingPeriod: BillingPeriod
) {
  return call<SubscriptionAction>(
    '/subscription/upgrade',
    { method: 'POST', body: { newPlanType, billingPeriod } },
    'Erro ao alterar plano'
  );
}

export function cancelSubscriptionRequest(reason?: string, feedback?: string) {
  return call<SubscriptionAction>(
    '/subscription/cancel',
    { method: 'POST', body: { reason, feedback } },
    'Erro ao cancelar assinatura'
  );
}

export function reactivateSubscriptionRequest() {
  return call<SubscriptionAction>(
    '/subscription/reactivate',
    { method: 'POST' },
    'Erro ao reativar assinatura'
  );
}

/** Cupom que não serve volta com `valid: false` e o motivo em `error`, como no legado. */
export async function validateCouponRequest(
  code: string,
  planType: PlanType,
  billingPeriod: BillingPeriod
) {
  const result = await call<CouponValidation>(
    '/coupon/validate',
    { method: 'POST', body: { code, planType, billingPeriod } },
    'Cupom inválido'
  );

  // O legado sempre mandava `message` (válido) ou `error` (inválido).
  return {
    ...result,
    message: result.message ?? '',
    error: result.error ?? '',
  };
}

/**
 * Confirma o pagamento quando o Stripe devolve a pessoa ao site. Idempotente:
 * se o webhook já confirmou, a API não duplica nada.
 */
export function confirmCheckoutSession(sessionId: string) {
  return apiFetch<{ success: true }>('/stripe/success', {
    query: { session_id: sessionId },
    cache: 'no-store',
  });
}
