// app/requests/portal/common.ts — base do portal (professor e aluno) pela API (Etapa 4)
//
// Isomórfico: a página servidora passa o token do cookie (`getServerAccessToken`)
// e o navegador vai pelos cookies da sessão. Dado de uma pessoa só, então
// sempre `no-store`.
import { apiFetch } from '@/app/libs/api/client';

type QueryValue = string | number | boolean | null | undefined;
export type PortalQuery = Record<string, QueryValue>;

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OffsetPagination {
  offset: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface PersonName {
  firstName?: string | null;
  lastName?: string | null;
}

/** Aluno ou professor como a API aninha em aulas e tarefas. */
export interface ApiParticipant {
  id: string;
  userId: string;
  user: PersonName & { image: string | null };
}

export function portalGet<T>(
  path: string,
  query?: PortalQuery,
  token?: string
): Promise<T> {
  return apiFetch<T>(path, { query, token, cache: 'no-store' });
}

export function personName(user?: PersonName | null): string {
  return `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
}

export function orUndefined<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}

export function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

export function toOptionalDate(value?: string | Date | null): Date | undefined {
  return value ? toDate(value) : undefined;
}

/** O legado paginava por deslocamento; a API, por página. */
export function pageOf(offset = 0, limit = 50): number {
  return Math.floor(offset / Math.max(1, limit)) + 1;
}

export function offsetPagination(
  pagination: ApiPagination,
  offset: number,
  received: number
): OffsetPagination {
  return {
    offset,
    limit: pagination.limit,
    total: pagination.total,
    hasMore: offset + received < pagination.total,
  };
}

/**
 * Junta as páginas de uma listagem até o teto, para as telas que o legado
 * montava com tudo de uma vez. `truncated` avisa quando o teto cortou.
 */
export async function collectPages<T>(
  path: string,
  key: string,
  query: PortalQuery,
  token?: string,
  { limit = 100, maxPages = 10 }: { limit?: number; maxPages?: number } = {}
): Promise<{ items: T[]; total: number; truncated: boolean }> {
  const items: T[] = [];
  let total = 0;

  for (let page = 1; page <= maxPages; page++) {
    const response = await portalGet<
      Record<string, unknown> & { pagination: ApiPagination }
    >(path, { ...query, page, limit }, token);

    items.push(...((response[key] as T[] | undefined) ?? []));
    total = response.pagination.total;

    if (page >= response.pagination.totalPages) break;
  }

  return { items, total, truncated: items.length < total };
}

/** "12 dias", "3 meses", "1 ano e 2 meses" — o texto que o legado mostrava. */
export function relationshipDuration(
  start: string | Date,
  now: Date = new Date()
): string {
  const days = Math.ceil(
    Math.abs(now.getTime() - toDate(start).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days < 30) return `${days} dias`;

  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }

  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const yearsText = `${years} ${years === 1 ? 'ano' : 'anos'}`;

  return months > 0
    ? `${yearsText} e ${months} ${months === 1 ? 'mês' : 'meses'}`
    : yearsText;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

interface EventColors {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

/**
 * Cores do calendário por status, como o legado pintava. O aluno vê falta em
 * vermelho e cancelamento em cinza; o professor, o contrário. Para o aluno, a
 * aula agendada das próximas 24h fica roxa.
 */
export function lessonColors(
  status: string,
  perspective: 'teacher' | 'student',
  start?: Date
): EventColors {
  const colors: EventColors = {
    backgroundColor: '#3B82F6',
    borderColor: '#1D4ED8',
    textColor: '#FFFFFF',
  };

  if (status === 'COMPLETED') {
    return { ...colors, backgroundColor: '#10B981', borderColor: '#059669' };
  }

  if (perspective === 'teacher') {
    if (status === 'CANCELLED') {
      return { ...colors, backgroundColor: '#EF4444', borderColor: '#DC2626' };
    }
    if (status === 'NO_SHOW') {
      return {
        backgroundColor: '#F59E0B',
        borderColor: '#D97706',
        textColor: '#000000',
      };
    }
    if (status === 'RESCHEDULED') {
      return { ...colors, backgroundColor: '#8B5CF6', borderColor: '#7C3AED' };
    }
    return colors;
  }

  if (status === 'CANCELLED') {
    return { ...colors, backgroundColor: '#6B7280', borderColor: '#4B5563' };
  }
  if (status === 'NO_SHOW') {
    return { ...colors, backgroundColor: '#EF4444', borderColor: '#DC2626' };
  }
  if (status === 'RESCHEDULED') {
    return {
      backgroundColor: '#F59E0B',
      borderColor: '#D97706',
      textColor: '#000000',
    };
  }

  if (status === 'SCHEDULED' && start) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    if (start >= today && start <= tomorrow) {
      return { ...colors, backgroundColor: '#8B5CF6', borderColor: '#7C3AED' };
    }
  }

  return colors;
}
