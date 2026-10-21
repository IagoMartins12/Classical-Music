/**
 * Rotinas do acervo pela API (`/admin/catalog-jobs/*`): correções em lote do
 * catálogo que antes só rodavam no terminal. Disparar responde na hora; o
 * andamento e o log vêm de `GET /admin/catalog-jobs/runs/:id`.
 */
import { apiFetch } from '@/app/libs/api/client';

const noStore = { cache: 'no-store' as const };

export type EstadoDaExecucao =
  | 'queued'
  | 'running'
  | 'ok'
  | 'failed'
  | 'stopped'
  | 'interrupted';

export interface Execucao {
  id: string;
  job: string;
  jobName: string;
  status: EstadoDaExecucao;
  apply: boolean;
  args: Record<string, string | number> | null;
  stopRequested: boolean;
  progress: { done: number; total: number | null; message: string | null };
  summary: Record<string, number | string> | null;
  sample: string[];
  warnings: string[];
  error: string | null;
  queuedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  heartbeatAt: string | null;
  /** Só na leitura de uma execução. */
  log?: string[];
}

export interface ParametroDaRotina {
  key: 'limit' | 'pause';
  label: string;
  help: string;
  placeholder: string;
}

export interface Rotina {
  id: string;
  name: string;
  description: string;
  group:
    | 'compositores'
    | 'obras'
    | 'partituras'
    | 'colecoes'
    | 'blog'
    | 'auditoria';
  destructive: boolean;
  slow: boolean;
  external: boolean;
  params: ParametroDaRotina[];
  active: Execucao | null;
  last: Execucao | null;
}

export const getRotinas = () =>
  apiFetch<Rotina[]>('/admin/catalog-jobs', noStore);

export const getExecucao = (runId: string) =>
  apiFetch<Execucao>(`/admin/catalog-jobs/runs/${runId}`, noStore);

export const getHistorico = (job: string) =>
  apiFetch<Execucao[]>(`/admin/catalog-jobs/${job}/runs`, noStore);

export interface DisparoDeRotina {
  apply: boolean;
  confirm?: boolean;
  limit?: number;
  pause?: number;
}

export const dispararRotina = (job: string, body: DisparoDeRotina) =>
  apiFetch<Execucao>(`/admin/catalog-jobs/${job}/run`, {
    method: 'POST',
    body,
  });

export const pararExecucao = (runId: string) =>
  apiFetch<Execucao>(`/admin/catalog-jobs/runs/${runId}/stop`, {
    method: 'POST',
  });
