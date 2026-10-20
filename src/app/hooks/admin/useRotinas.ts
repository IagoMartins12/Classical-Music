'use client';

import {
  dispararRotina,
  getExecucao,
  getHistorico,
  getRotinas,
  pararExecucao,
  type Execucao,
} from '@/app/requests/admin/rotinas';
import { adminKeys, useAdminMutation, useAdminQuery } from './query';

const ATIVA = ['queued', 'running'];
export const estaAtiva = (e: Pick<Execucao, 'status'> | null | undefined) =>
  !!e && ATIVA.includes(e.status);

/** As rotinas; enquanto alguma roda, a lista se atualiza sozinha. */
export const useRotinas = () =>
  useAdminQuery(adminKeys.list('rotinas', {}), getRotinas, {
    staleTime: 0,
    refetchInterval: (rotinas) =>
      rotinas?.some((r) => r.active) ? 4000 : false,
  });

/** Uma execução, com o log; acompanha de perto enquanto não termina. */
export const useExecucao = (runId: string | null) =>
  useAdminQuery(
    adminKeys.list('rotinas', { run: runId }),
    () => getExecucao(runId as string),
    {
      enabled: !!runId,
      staleTime: 0,
      refetchInterval: (e) => (estaAtiva(e) ? 3000 : false),
    }
  );

export const useHistorico = (job: string | null) =>
  useAdminQuery(
    adminKeys.list('rotinas', { historico: job }),
    () => getHistorico(job as string),
    { enabled: !!job, staleTime: 0 }
  );

export const useDispararRotina = () =>
  useAdminMutation(dispararRotina, ['rotinas']);
export const usePararExecucao = () =>
  useAdminMutation(pararExecucao, ['rotinas']);
