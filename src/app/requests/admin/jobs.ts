/**
 * Jobs da fila (`/admin/jobs/*`): o estado de uma rodada e as rodadas
 * recentes de uma fila. Scraper, manutenção, backup e newsletter rodam todos
 * na fila — a API responde 202 com o id, e o resto se lê aqui.
 */
import { apiFetch } from '@/app/libs/api/client';

export type Fila = 'scraper' | 'maintenance' | 'newsletter' | 'notifications';

export type EstadoDoJob =
  | 'waiting'
  | 'delayed'
  | 'active'
  | 'completed'
  | 'failed'
  | 'unknown'
  | string;

export interface Job<R = unknown> {
  queue: Fila;
  jobId: string;
  job: string;
  state: EstadoDoJob;
  progress: { percent: number; message: string | null } | null;
  attemptsMade: number;
  requestedBy: string | null;
  requestedAt: string | null;
  processedAt: string | null;
  finishedAt: string | null;
  result: R | null;
  failedReason: string | null;
  payload?: Record<string, unknown> | null;
}

export const terminou = (j: Pick<Job, 'state'> | null | undefined) =>
  j?.state === 'completed' || j?.state === 'failed';

export const getJob = <R = unknown>(fila: Fila, id: string) =>
  apiFetch<Job<R>>(`/admin/jobs/${fila}/${id}`, { cache: 'no-store' });

export const getJobsRecentes = <R = unknown>(
  fila: Fila,
  filtro?: { job?: string; limit?: number }
) =>
  apiFetch<{ jobs: Job<R>[] }>(`/admin/jobs/${fila}/recent`, {
    cache: 'no-store',
    query: { job: filtro?.job, limit: filtro?.limit ?? 10 },
  }).then((r) => r.jobs);
