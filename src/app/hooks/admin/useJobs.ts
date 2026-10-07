'use client';

import {
  getJob,
  getJobsRecentes,
  terminou,
  type Fila,
  type Job,
} from '@/app/requests/admin/jobs';
import { adminKeys, useAdminQuery } from './query';

/**
 * O estado de uma rodada, relido a cada 1,5 s enquanto ela não termina.
 * Terminou, para de perguntar.
 */
export function useJob<R = unknown>(fila: Fila, id: string | null) {
  return useAdminQuery<Job<R>>(
    adminKeys.list('jobs', { fila, id }),
    () => getJob<R>(fila, id as string),
    {
      enabled: !!id,
      staleTime: 0,
      refetchInterval: (dado) => (terminou(dado) ? false : 1500),
    }
  );
}

/** As últimas rodadas; relê a cada 5 s se alguma ainda está em andamento. */
export function useJobsRecentes<R = unknown>(
  fila: Fila,
  filtro?: { job?: string; limit?: number },
  ativo = true
) {
  return useAdminQuery<Job<R>[]>(
    adminKeys.list('jobs', { fila, recentes: filtro ?? {} }),
    () => getJobsRecentes<R>(fila, filtro),
    {
      enabled: ativo,
      staleTime: 0,
      refetchInterval: (dado) =>
        dado?.some((j) => !terminou(j)) ? 5000 : false,
    }
  );
}
