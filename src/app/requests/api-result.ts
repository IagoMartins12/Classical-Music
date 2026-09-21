/**
 * Peças comuns dos requests que o navegador faz à API no lugar das rotas
 * `/api/*` do legado.
 *
 * `ApiResult` faz o papel do `response.ok` do `fetch` que as telas usavam, para
 * a troca não mexer na lógica delas: erro da API vira `ok: false`; erro de
 * conexão continua subindo como exceção.
 */
import { ApiError } from '@/app/libs/api/client';

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

export async function toResult<T>(request: Promise<T>): Promise<ApiResult<T>> {
  try {
    return { ok: true, data: await request };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, status: error.status, error: error.message };
    }

    throw error;
  }
}

/**
 * Copia do objeto só as chaves que a API aceita (ela recusa campo desconhecido),
 * sem `undefined` nem `null`. As de `omitIfEmpty` também saem quando vêm `''`:
 * para data, número, enum e id, vazio no formulário quer dizer "sem valor", e a
 * API recusaria o `''`.
 */
export function pick(
  source: object,
  keys: readonly string[],
  omitIfEmpty: readonly string[] = []
): Record<string, unknown> {
  const values = source as Record<string, unknown>;
  const body: Record<string, unknown> = {};

  for (const key of keys) {
    const value = values[key];

    if (value === undefined || value === null) {
      continue;
    }

    if (value === '' && omitIfEmpty.includes(key)) {
      continue;
    }

    body[key] = value;
  }

  return body;
}
