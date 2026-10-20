'use client';

import {
  getContribuicoes,
  reprovarContribuicao,
  type Contribuicao,
  type RecorteContribuicoes,
  type TipoDeContribuicao,
} from '@/app/requests/admin/contribuicoes';
import { adminKeys, useAdminInfinite, useAdminMutation } from './query';

/** As contribuições, por cursor; o `extra` leva as duas contagens. */
export function useContribuicoes(
  status: RecorteContribuicoes,
  kind: TipoDeContribuicao | undefined,
  search: string
) {
  return useAdminInfinite<Contribuicao>(
    adminKeys.list('contribuicoes', { status, kind, search }),
    async (cursor) => {
      const fila = await getContribuicoes({ status, kind, search, cursor });
      return {
        items: fila.items,
        total: fila.counts[status],
        nextCursor: fila.nextCursor,
        extra: fila.counts,
      };
    }
  );
}

/** Reprovar muda a fila, o catálogo, o XP de quem contribuiu e a auditoria. */
export const useReprovarContribuicao = () =>
  useAdminMutation(reprovarContribuicao, [
    'contribuicoes',
    'catalogo',
    'usuarios',
    'auditoria',
  ]);
