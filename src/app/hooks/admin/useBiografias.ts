'use client';

import {
  getBiografias,
  revisarBiografia,
  type BiografiaParaRevisar,
  type RecorteBiografias,
} from '@/app/requests/admin/biografias';
import { adminKeys, useAdminInfinite, useAdminMutation } from './query';

/** A fila de biografias, por cursor; o `extra` leva as duas contagens. */
export function useBiografias(status: RecorteBiografias, search: string) {
  return useAdminInfinite<BiografiaParaRevisar>(
    adminKeys.list('biografias', { status, search }),
    async (cursor) => {
      const fila = await getBiografias({ status, search, cursor });
      return {
        items: fila.items,
        total: fila.counts[status],
        nextCursor: fila.nextCursor,
        extra: fila.counts,
      };
    }
  );
}

/** Aprovar muda a fila, o retrato do cadastro e a trilha de auditoria. */
export const useRevisarBiografia = () =>
  useAdminMutation(revisarBiografia, ['biografias', 'catalogo', 'auditoria']);
