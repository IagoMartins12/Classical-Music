/**
 * Peças comuns dos requests do painel (`/admin/*` da API).
 *
 * As telas do painel liam as rotas `/api/admin/*` do Next, com paginação
 * própria (`pages`, `hasMore`) e filtros por período (`7d`, `3m`, `all`…). A
 * API pagina com `totalPages` e filtra por datas ou por dias; estas funções
 * fazem a ponte sem mexer nas telas.
 */
import { apiUrl, refreshSession } from '@/app/libs/api/client';

export type AdminPeriod = '7d' | '30d' | '3m' | '6m' | '1y' | 'all' | string;

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginação das listas grandes (usuários, auditoria, envios), que a API
 * responde por cursor. `total` e `totalPages` vêm nulos a partir da segunda
 * fatia: contar a base inteira a cada rolagem é justamente o custo que o
 * cursor evita, e o total já veio na primeira.
 */
export interface ApiCursorPagination {
  page: number;
  limit: number;
  total: number | null;
  totalPages: number | null;
  nextCursor: string | null;
}

const PERIOD_DAYS: Record<string, number> = {
  '24h': 1,
  '1d': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '3m': 90,
  '6m': 180,
  '1y': 365,
};

/** Dias do período; `undefined` para "todos os dados". */
export function periodDays(period?: AdminPeriod): number | undefined {
  return period ? PERIOD_DAYS[period] : undefined;
}

/** Início do período em ISO, para os filtros `from` da API. */
export function periodStart(period?: AdminPeriod): string | undefined {
  const days = periodDays(period);
  return days
    ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    : undefined;
}

/** A análise de usuários e da newsletter aceita só 7d, 30d, 90d e 1y. */
export function analyticsPeriod(
  period?: AdminPeriod
): '7d' | '30d' | '90d' | '1y' {
  const days = periodDays(period);
  if (!days) return '1y';
  if (days <= 7) return '7d';
  if (days <= 30) return '30d';
  if (days <= 90) return '90d';
  return '1y';
}

/** Paginação no formato que as telas do painel liam, com os nomes das duas versões. */
export function legacyPagination(pagination: ApiPagination) {
  return {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    pages: pagination.totalPages,
    totalPages: pagination.totalPages,
    hasMore: pagination.page < pagination.totalPages,
    hasNext: pagination.page < pagination.totalPages,
    hasPrev: pagination.page > 1,
  };
}

/** Nome para exibir: nome e sobrenome, senão o usuário, senão o e-mail. */
export function displayName(user: {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  email?: string | null;
  name?: string | null;
}): string {
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return full || user.name || user.username || user.email || '';
}

export const isObjectId = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

/** Número positivo, ou `undefined` (a API recusa 0 e texto nos filtros mínimos). */
export function positiveInt(value: unknown): number | undefined {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

/**
 * Baixa um arquivo da API (exportações). O `apiFetch` lê JSON; aqui a
 * resposta vira arquivo. Sessão vencida renova uma vez, como no `apiFetch`.
 */
export async function downloadFromApi(
  path: string,
  query: Record<string, string | number | boolean | undefined>,
  filename: string
): Promise<void> {
  const url = apiUrl(path, query);
  let response = await fetch(url, { credentials: 'include' });

  if (response.status === 401 && (await refreshSession())) {
    response = await fetch(url, { credentials: 'include' });
  }

  if (!response.ok) {
    let message = 'Erro ao exportar';
    try {
      message = (await response.json()).message ?? message;
    } catch {
      // resposta sem corpo JSON: fica a mensagem genérica
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}
