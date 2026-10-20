/**
 * A moderação das contribuições do acervo no painel: as que estão em vigor
 * (nascem aprovadas) e as reprovadas (`/admin/contributions`).
 */
import { apiFetch } from '@/app/libs/api/client';

export type RecorteContribuicoes = 'live' | 'reverted';
export type TipoDeContribuicao = 'BIO' | 'VIDEO' | 'CURIOSITY' | 'CORRECTION';

export interface Contribuicao {
  id: string;
  kind: TipoDeContribuicao;
  /** O campo escrito (`bio`, `videoUrl`…); vazio numa curiosidade. */
  field: string | null;
  entityType: 'composer' | 'work';
  entityId: string;
  entityName: string | null;
  before: unknown;
  after: unknown;
  /** O texto da curiosidade, quando ela ainda existe. */
  curiosity: string | null;
  source: string | null;
  xp: number;
  xpGrantedAt: string | null;
  revertedAt: string | null;
  createdAt: string;
  author: { id: string; name: string; username: string; email: string };
}

export interface FilaDeContribuicoes {
  items: Contribuicao[];
  counts: { live: number; reverted: number };
  nextCursor: string | null;
}

export const getContribuicoes = (filtros: {
  status: RecorteContribuicoes;
  kind?: TipoDeContribuicao;
  search?: string;
  cursor?: string;
}) =>
  apiFetch<FilaDeContribuicoes>('/admin/contributions', {
    query: {
      status: filtros.status,
      kind: filtros.kind,
      search: filtros.search || undefined,
      cursor: filtros.cursor,
      limit: 20,
    },
    cache: 'no-store',
  });

/** Desfaz, devolve o XP e avisa o autor com o motivo. */
export const reprovarContribuicao = (id: string, reason: string) =>
  apiFetch<{ id: string; xpReturned: number }>(
    `/admin/contributions/${id}/reject`,
    { method: 'POST', body: { reason } }
  );
