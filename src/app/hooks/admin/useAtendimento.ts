'use client';

import {
  atualizarChamado,
  getChamados,
  type Chamado,
  type SituacaoDoChamado,
} from '@/app/requests/admin/atendimento';
import { adminKeys, useAdminInfinite, useAdminMutation } from './query';

/** A fila de atendimento por página; o `extra` leva as contagens. */
export function useAtendimento(
  status: SituacaoDoChamado | 'all',
  search: string
) {
  return useAdminInfinite<Chamado>(
    adminKeys.list('atendimento', { status, search }),
    async (cursor) => {
      const page = cursor ? Number(cursor) : 1;
      const fila = await getChamados({ status, search, page });
      return {
        items: fila.tickets,
        total: fila.pagination.total,
        nextCursor: page < fila.pagination.totalPages ? String(page + 1) : null,
        extra: fila.counts,
      };
    }
  );
}

export const useAtualizarChamado = () =>
  useAdminMutation(atualizarChamado, ['atendimento']);
