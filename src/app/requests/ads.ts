/**
 * Anúncios pela API, chamados do navegador. A resposta da busca já tem o
 * formato do legado (`{ success, ads, count }`).
 */
import { apiFetch } from '@/app/libs/api/client';
import { pick } from '@/app/requests/api-result';

export function getAds(params: URLSearchParams) {
  return apiFetch<{
    success: boolean;
    ads: any[];
    count: number;
    error?: string;
  }>('/ads', {
    query: Object.fromEntries(params),
    cache: 'no-store',
  });
}

/**
 * Impressão, clique ou hover. A API recusa campo desconhecido: dos dados que a
 * tela junta (horário, posição, navegador, origem), só `duration`, `pageUrl` e
 * `pageTitle` seguem.
 */
export function trackAdEvent(adId: string, event: string, data: object = {}) {
  return apiFetch<void>('/ads', {
    method: 'POST',
    body: {
      adId,
      event,
      data: pick(data, ['duration', 'pageUrl', 'pageTitle']),
    },
  });
}
