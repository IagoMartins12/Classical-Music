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

/** Cria ou refaz o espelho do cupom no Stripe; o motivo de uma falha volta em `stripeSyncError`. */
export function syncCouponRequest(couponId: string) {
  return apiFetch<{
    stripeCouponId: string | null;
    stripeSyncError: string | null;
  }>(`/admin/coupons/${couponId}/sync`, { method: 'POST' });
}

// ---- Preços de plano

export interface LadoDoStripe {
  id: string;
  valor: number;
}

/** Um plano pago, no painel e no Stripe. */
export interface PrecoNoStripe {
  planType: string;
  painel: { monthly: number; yearly: number } | null;
  stripe: { monthly: LadoDoStripe | null; yearly: LadoDoStripe | null };
  productId: string | null;
  /** De onde o checkout tira o Price: da versão no banco ou do `.env`. */
  fonte: 'banco' | 'ambiente' | null;
  emDia: boolean;
  problema: string | null;
  sincronizadoEm: string | null;
  origem: 'painel' | 'stripe' | null;
}

export const getPrecosNoStripe = () =>
  apiFetch<{ configurado: boolean; planos: PrecoNoStripe[] }>(
    '/admin/plan-pricing/stripe',
    { cache: 'no-store' }
  );

/** Painel → Stripe: cria o Price que falta e arquiva o anterior. */
export const enviarPrecoAoStripe = (plano: string) =>
  apiFetch(`/admin/plan-pricing/${plano}/push`, { method: 'POST' });

/** Stripe → painel: versão nova com o que vale lá. */
export const trazerPrecoDoStripe = (plano: string) =>
  apiFetch<{ adotado: boolean; motivo: string }>(
    `/admin/plan-pricing/${plano}/pull`,
    { method: 'POST' }
  );

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
 * Os preços padrão que a rota "seed" do legado gravava, atualizados para a
 * tabela em vigor (mesma de `seed-plan-pricing.ts` na API e de `PLAN_PRICES`):
 * anual por dez meses, ~16% de desconto nos três planos. Os valores do legado
 * (29 / 79 / 149) não valem mais.
 *
 * **Por aqui o preço não é digitado, é derivado:** a rota só aceita o mensal e
 * o desconto anual, e a API calcula o anual (`monthly × 12 × (1 - desconto)`).
 * Só existem mensal e anual: são os períodos que o Stripe vende. Valores terminados em `,90` não saem exatos — 19,90 com
 * 16,3% dá 199,85, não 199,90. Para bater com o Stripe no centavo, use
 * `npm run seed:pricing:hml` na API, que grava cada período diretamente.
 */
const DEFAULT_PLAN_PRICES = [
  {
    planType: 'PLUS',
    monthlyPrice: 19.9,
    yearlyDiscount: 16.3,
    trialDays: 7,
    displayOrder: 1,
    description: 'Para alunos dedicados que querem acelerar sua evolução',
  },
  {
    planType: 'MENTOR',
    monthlyPrice: 39.9,
    yearlyDiscount: 16.5,
    trialDays: 14,
    displayOrder: 2,
    description: 'Para professores iniciantes que querem organizar suas aulas',
  },
  {
    planType: 'MAESTRO',
    monthlyPrice: 79.9,
    yearlyDiscount: 16.6,
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
