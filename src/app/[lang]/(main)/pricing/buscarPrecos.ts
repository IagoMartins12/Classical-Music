import { apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';
import { normalizarPrecos, type Precos } from './precos';

/**
 * Preços da API (`GET /pricing`).
 *
 * **Sem preços padrão quando a API falha, de propósito.** A página fica em
 * cache por uma hora: uma tabela embutida faria o site anunciar, com HTTP 200
 * e em cache, valores que podem não estar à venda. Deixando o erro subir, o
 * Next devolve 500 e não guarda nada. O `buildFallback` vazio só existe para
 * o build do CI, que não tem API.
 */
export async function buscarPrecos(): Promise<Precos | null> {
  const r = await apiFetch<ApiSchema<'PricingResponseDto'>>('/pricing', {
    next: { revalidate: 3600, tags: ['billing'] },
    buildFallback: { success: true, data: {} },
  });
  if (Object.keys(r.data).length === 0) return null;
  return normalizarPrecos(r.data);
}
