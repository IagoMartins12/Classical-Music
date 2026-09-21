/**
 * Cupons e preços de plano no painel (`/admin/coupons*`, `/admin/plan-pricing`).
 *
 * As telas leem as respostas como liam o `fetch` (`ok`, `json()`); o formato
 * vem de `asFetchResponse`. A API recusa campo vazio onde espera número ou
 * texto: o corpo sai só com o que foi preenchido.
 */
import { apiFetch } from '@/app/libs/api/client';
import { pick } from '@/app/requests/api-result';
import { asFetchResponse } from '@/app/requests/fetch-like';

const COUPON_KEYS = [
  'type',
  'discountValue',
  'maxDiscount',
  'applicablePlans',
  'validFrom',
  'validUntil',
  'maxUses',
  'maxUsesPerUser',
  'extraTrialDays',
  'description',
  'isActive',
];

function couponBody(data: Record<string, unknown>) {
  const body = pick(data, COUPON_KEYS, ['description']);

  // "Sem limite de usos" é `null` na API; `pick` descarta `null`.
  if (data.maxUses === null) {
    body.maxUses = null;
  }

  return body;
}

export function listCouponsRequest() {
  return asFetchResponse(
    apiFetch('/admin/coupons', { query: { limit: 100 }, cache: 'no-store' })
  );
}

/** O código só entra na criação; a API não troca o código de um cupom existente. */
export function saveCouponRequest(
  couponId: string | undefined,
  data: Record<string, unknown>
) {
  return asFetchResponse(
    couponId
      ? apiFetch(`/admin/coupons/${couponId}`, {
          method: 'PATCH',
          body: couponBody(data),
        })
      : apiFetch('/admin/coupons', {
          method: 'POST',
          body: { code: data.code, ...couponBody(data) },
        })
  );
}

export function toggleCouponRequest(couponId: string) {
  return asFetchResponse(
    apiFetch(`/admin/coupons/${couponId}/toggle`, { method: 'PATCH' })
  );
}

export function deleteCouponRequest(couponId: string) {
  return asFetchResponse(
    apiFetch(`/admin/coupons/${couponId}`, { method: 'DELETE' })
  );
}

// ---- Preços de plano

export function listPlanPricingRequest() {
  return apiFetch<unknown[]>('/admin/plan-pricing', { cache: 'no-store' });
}

export function setPlanPricingRequest(data: Record<string, unknown>) {
  return apiFetch('/admin/plan-pricing', {
    method: 'POST',
    body: pick(
      data,
      [
        'planType',
        'monthlyPrice',
        'quarterlyDiscount',
        'biannualDiscount',
        'yearlyDiscount',
        'trialDays',
        'description',
        'displayOrder',
      ],
      ['description']
    ),
  });
}

/**
 * Os preços padrão que a rota "seed" do legado gravava. A API não tem seed:
 * cada preço vira uma versão por `POST /admin/plan-pricing`.
 */
const DEFAULT_PLAN_PRICES = [
  {
    planType: 'PLUS',
    monthlyPrice: 29.0,
    quarterlyDiscount: 10,
    biannualDiscount: 15,
    yearlyDiscount: 20,
    trialDays: 7,
    displayOrder: 1,
    description: 'Para alunos dedicados que querem acelerar sua evolução',
  },
  {
    planType: 'MENTOR',
    monthlyPrice: 79.0,
    quarterlyDiscount: 10,
    biannualDiscount: 15,
    yearlyDiscount: 20,
    trialDays: 14,
    displayOrder: 2,
    description: 'Para professores iniciantes que querem organizar suas aulas',
  },
  {
    planType: 'MAESTRO',
    monthlyPrice: 149.0,
    quarterlyDiscount: 10,
    biannualDiscount: 15,
    yearlyDiscount: 20,
    trialDays: 30,
    displayOrder: 3,
    description: 'Para professores profissionais com alunos ilimitados',
  },
];

export async function seedDefaultPlanPrices() {
  for (const plan of DEFAULT_PLAN_PRICES) {
    await setPlanPricingRequest(plan);
  }
}
