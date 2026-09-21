/**
 * Peças para os componentes que liam a rota do legado como `fetch`.
 *
 * `asFetchResponse` devolve `ok`, `status` e `json()`, para a troca para a API
 * não mexer na lógica deles: erro da API vira `{ success: false, error }` com a
 * mensagem dela, como o legado respondia; erro de conexão continua subindo.
 */
import { ApiError } from '@/app/libs/api/client';

export interface FetchLikeResponse {
  ok: boolean;
  status: number;
  // Como o `Response.json()` que os componentes usavam: eles leem os campos direto.

  json: () => Promise<any>;
}

export async function asFetchResponse<T>(
  request: Promise<T>,
  onSuccess: (data: T) => unknown = (data) => data
): Promise<FetchLikeResponse> {
  try {
    const payload = onSuccess(await request);

    return { ok: true, status: 200, json: async () => payload };
  } catch (error) {
    if (error instanceof ApiError) {
      const payload = { success: false, error: error.message };

      return { ok: false, status: error.status, json: async () => payload };
    }

    throw error;
  }
}

/**
 * Troca `null` por `undefined` nos campos de primeiro nível: os tipos das telas
 * usam campo opcional, e a API manda `null` quando não há valor.
 */
export function withoutNulls<T extends object>(
  item: T
): { [K in keyof T]: Exclude<T[K], null> } {
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => [key, value ?? undefined])
  ) as { [K in keyof T]: Exclude<T[K], null> };
}
