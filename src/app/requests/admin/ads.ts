/**
 * Anúncios no painel (`/admin/ads*` da API), no formato das telas.
 *
 * Diferenças que as telas sentem:
 * - impressões e cliques vêm somados por anúncio (`performance`); não há série
 *   por dia, páginas nem países — o gráfico de um anúncio fica vazio;
 * - a imagem sobe primeiro por `POST /uploads/file` (tipo `AD_MEDIA`) e é
 *   ligada ao anúncio depois; a API não tem versões por tela nem vídeo de
 *   anúncio (o vídeo segue pela rota do legado);
 * - o clone nasce como rascunho e sem mídia; o que mais foi alterado no modal
 *   vai num `PATCH` logo depois.
 */
import { apiFetch } from '@/app/libs/api/client';
import { pick } from '@/app/requests/api-result';
import {
  type ApiPagination,
  legacyPagination,
} from '@/app/requests/admin/common';
import type { Advertisement, AdsStats } from '@/app/hooks/admin/useAds';

const AD_KEYS = [
  'title',
  'description',
  'content',
  'ctaText',
  'linkType',
  'targetUrl',
  'isExternal',
  'type',
  'placement',
  'status',
  'targetType',
  'targetUserLevel',
  'instrumentId',
  'advertiserName',
  'advertiserEmail',
  'advertiserPhone',
  'advertiserWebsite',
  'startDate',
  'endDate',
  'showOnMobile',
  'showOnTablet',
  'showOnDesktop',
];

// Campo vazio no formulário é "sem valor": a API recusa texto vazio em data,
// e-mail, URL e id.
const OPTIONAL_KEYS = [
  'description',
  'content',
  'ctaText',
  'targetUrl',
  'instrumentId',
  'advertiserEmail',
  'advertiserPhone',
  'advertiserWebsite',
  'startDate',
  'endDate',
];

const CLONE_KEYS = ['title', 'placement', 'type', 'targetType', 'instrumentId'];

interface ApiAd extends Omit<
  Advertisement,
  'totalImpressions' | 'totalClicks' | 'ctr'
> {
  performance?: { impressions: number; clicks: number; ctr: number | null };
}

function toAdvertisement(ad: ApiAd): Advertisement {
  return {
    ...ad,
    totalImpressions: ad.performance?.impressions ?? 0,
    totalClicks: ad.performance?.clicks ?? 0,
    ctr: ad.performance?.ctr ?? 0,
  };
}

const adBody = (data: Record<string, unknown>) =>
  pick(data, AD_KEYS, OPTIONAL_KEYS);

export async function listAds(
  page: number,
  filters: Record<string, string | undefined>
) {
  const data = await apiFetch<{ ads: ApiAd[]; pagination: ApiPagination }>(
    '/admin/ads',
    {
      query: {
        page,
        limit: 20,
        search: filters.search || undefined,
        status: filters.status || undefined,
        type: filters.type || undefined,
        placement: filters.placement || undefined,
        targetType: filters.targetType || undefined,
      },
      cache: 'no-store',
    }
  );
  const pagination = legacyPagination(data.pagination);

  return {
    ads: data.ads.map(toAdvertisement),
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: pagination.pages,
    },
  };
}

export async function createAdRequest(data: Record<string, unknown>) {
  return toAdvertisement(
    await apiFetch<ApiAd>('/admin/ads', { method: 'POST', body: adBody(data) })
  );
}

export async function updateAdRequest(
  id: string,
  data: Record<string, unknown>
) {
  return toAdvertisement(
    await apiFetch<ApiAd>(`/admin/ads/${id}`, {
      method: 'PATCH',
      body: adBody(data),
    })
  );
}

export function deleteAdRequest(id: string) {
  return apiFetch<void>(`/admin/ads/${id}`, { method: 'DELETE' });
}

export async function cloneAdRequest(
  id: string,
  modifications: Record<string, unknown>
) {
  const clone = await apiFetch<ApiAd>(`/admin/ads/${id}/clone`, {
    method: 'POST',
    body: pick(modifications, CLONE_KEYS, ['instrumentId']),
  });

  const rest = Object.fromEntries(
    Object.entries(adBody(modifications)).filter(
      ([key]) => !CLONE_KEYS.includes(key)
    )
  );

  return Object.keys(rest).length > 0
    ? updateAdRequest(clone.id, rest)
    : toAdvertisement(clone);
}

/** Totais do anúncio no formato do modal de estatísticas; sem série por dia. */
export async function getAdStatsRequest(id: string) {
  const ad = await apiFetch<ApiAd>(`/admin/ads/${id}`, { cache: 'no-store' });

  return {
    totals: {
      impressions: ad.performance?.impressions ?? 0,
      clicks: ad.performance?.clicks ?? 0,
      ctr: ad.performance?.ctr ?? 0,
      avgHoverTime: 0,
    },
    chartData: [],
    topPages: [],
    topCountries: [],
  };
}

export async function getAdsOverview(): Promise<AdsStats> {
  const data = await apiFetch<{
    byStatus: Record<string, number>;
    total: number;
    impressions: number;
    clicks: number;
    ctr: number | null;
  }>('/admin/ads/overview', { cache: 'no-store' });

  return {
    totalAds: data.total,
    activeAds: data.byStatus.ACTIVE ?? 0,
    pausedAds: data.byStatus.PAUSED ?? 0,
    draftAds: data.byStatus.DRAFT ?? 0,
    impressions30d: data.impressions,
    clicks30d: data.clicks,
    avgCTR: data.ctr ?? 0,
  };
}

/** No formato que os modais liam: `hasConflict` e, havendo, a mensagem em `conflicts`. */
export async function checkAdConflict(query: {
  type: string;
  placement: string;
  targetType: string;
  instrumentId?: string;
  excludeId?: string;
}) {
  const data = await apiFetch<{
    hasConflict: boolean;
    conflictingAd: { id: string; title: string } | null;
  }>('/admin/ads/check-conflict', {
    query: {
      type: query.type,
      placement: query.placement,
      targetType: query.targetType,
      instrumentId: query.instrumentId || undefined,
      excludeAdId: query.excludeId || undefined,
    },
    cache: 'no-store',
  });

  const message = data.conflictingAd
    ? `Já existe um anúncio nesta combinação: "${data.conflictingAd.title}".`
    : undefined;

  return {
    hasConflict: data.hasConflict,
    conflictingAd: data.conflictingAd,
    message,
    conflicts: message ? [{ message }] : [],
  };
}

/**
 * Mídia do anúncio: sobe por `/uploads/file` e é ligada ao anúncio. A resposta
 * segue o formato do legado (`success`, `data`) para as telas.
 *
 * Vale para imagem e vídeo. A tela de envio mandava o vídeo para a rota do
 * legado, com um comentário dizendo que "a API ainda não aceita" — ela aceita:
 * `AdminAdsService.attachMedia` grava em `videoUrl` quando `kind` é `video`.
 */
export async function uploadAdMedia(
  adId: string,
  file: File,
  kind: 'image' | 'video' = 'image'
) {
  const form = new FormData();
  form.append('file', file);
  form.append('kind', 'AD_MEDIA');
  form.append('scopeId', adId);

  const asset = await apiFetch<{ id: string }>('/uploads/file', {
    method: 'POST',
    body: form,
  });
  const ad = await apiFetch<ApiAd>(`/admin/ads/${adId}/media`, {
    method: 'POST',
    body: { assetId: asset.id, kind },
  });

  return { success: true, data: toAdvertisement(ad) };
}

export function removeAdMedia(adId: string, kind: 'image' | 'video') {
  return apiFetch(`/admin/ads/${adId}/media`, {
    method: 'DELETE',
    query: { kind },
  });
}

export function listInstruments() {
  return apiFetch<{ id: string; name: string; category: string | null }[]>(
    '/instruments'
  );
}
