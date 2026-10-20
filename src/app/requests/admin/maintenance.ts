/**
 * Manutenção pela API (`/admin/maintenance/*` e `/admin/jobs/*`).
 *
 * Toda tarefa roda na fila: executar responde na hora com o id do job, e o
 * resultado é lido depois em `GET /admin/jobs/maintenance/:jobId`. Tarefa que
 * apaga só aplica com `confirm: true` (sem ele, a API simula).
 */
import { apiFetch } from '@/app/libs/api/client';

const noStore = { cache: 'no-store' as const };

export interface ApiMaintenanceTask {
  id: string;
  name: string;
  description: string;
  category: string;
  impact: 'low' | 'medium' | 'high';
  destructive: boolean;
  suggestedCron: string | null;
  schedule: { cron: string | null; nextRunAt: string | null } | null;
}

export interface ApiMaintenanceSchedule {
  schedulerId: string;
  taskId: string;
  cron: string | null;
  timezone: string | null;
  nextRunAt: string | null;
}

export interface MaintenanceOutcome {
  /** Contagens e, em algumas tarefas, texto (o nome do arquivo gerado). */
  summary: Record<string, number | string>;
  sample?: string[];
  warnings?: string[];
}

export const listMaintenanceTasks = () =>
  apiFetch<{ tasks: ApiMaintenanceTask[]; timezone: string }>(
    '/admin/maintenance/tasks',
    noStore
  );

export const listMaintenanceSchedules = () =>
  apiFetch<{ schedules: ApiMaintenanceSchedule[]; timezone: string }>(
    '/admin/maintenance/schedules',
    noStore
  );

export function runMaintenanceTask(taskId: string, confirm: boolean) {
  return apiFetch<{ jobId: string; dryRun: boolean; aviso?: string }>(
    `/admin/maintenance/tasks/${taskId}/run`,
    { method: 'POST', body: { confirm } }
  );
}

export function setMaintenanceSchedule(taskId: string, cron: string) {
  return apiFetch(`/admin/maintenance/schedules/${taskId}`, {
    method: 'PUT',
    body: { cron },
  });
}

export function deleteMaintenanceSchedule(taskId: string) {
  return apiFetch(`/admin/maintenance/schedules/${taskId}`, {
    method: 'DELETE',
  });
}

interface JobView {
  jobId: string;
  state: string;
  result: MaintenanceOutcome | null;
  failedReason: string | null;
}

/** Espera o job terminar (até ~1 min, lendo a cada segundo) e devolve o resultado. */
export async function waitForMaintenanceJob(
  jobId: string
): Promise<MaintenanceOutcome> {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const job = await apiFetch<JobView>(
      `/admin/jobs/maintenance/${jobId}`,
      noStore
    );

    if (job.state === 'completed') {
      return job.result ?? { summary: {} };
    }
    if (job.state === 'failed') {
      throw new Error(job.failedReason ?? 'A tarefa falhou');
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error('A tarefa ainda está rodando; confira de novo em instantes');
}

// ---- Histórico de execuções (`task_runs`)

/** Uma execução de tarefa: quem disparou, quanto levou, o que mudou. */
export interface ExecucaoDeTarefa {
  id: string;
  queue: string;
  task: string;
  taskName: string;
  trigger: 'agendado' | 'manual';
  requestedBy: string | null;
  requestedByName: string | null;
  jobId: string;
  attempt: number;
  status: 'ok' | 'falhou';
  dryRun: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  summary: Record<string, unknown> | null;
  sample: string[];
  warnings: string[];
  error: string | null;
}

export interface FiltroDeExecucoes {
  task?: string;
  trigger?: string;
  status?: string;
  from?: string;
  to?: string;
}

export const listarExecucoes = (f: FiltroDeExecucoes, page = 1) =>
  apiFetch<{
    items: ExecucaoDeTarefa[];
    pagination: { page: number; total: number; totalPages: number };
  }>('/admin/maintenance/runs', {
    cache: 'no-store',
    query: { ...f, page, limit: 30 },
  });

export interface ResumoDeTarefa {
  task: string;
  taskName: string;
  total: number;
  falhas: number;
  agendadas: number;
  manuais: number;
  ultimaEm: string;
  ultimoStatus: 'ok' | 'falhou';
  ultimoGatilho: 'agendado' | 'manual';
}

export const resumoDasExecucoes = () =>
  apiFetch<{ tarefas: ResumoDeTarefa[] }>('/admin/maintenance/runs/summary', {
    cache: 'no-store',
  }).then((r) => r.tarefas);

/** Os escolhidos, ou todos antes de uma data (de uma tarefa ou de todas). */
export const apagarExecucoes = (c: {
  ids?: string[];
  before?: string;
  task?: string;
}) =>
  apiFetch<{ apagados: number }>('/admin/maintenance/runs/delete', {
    method: 'POST',
    body: c,
  });

// ---- Arquivos órfãos

export interface ArquivoOrfao {
  id: string;
  /** `dono-removido`: órfão de certeza. `sem-dono`: nunca declarou dono. */
  motivo: 'dono-removido' | 'sem-dono';
  url: string | null;
  publicId: string;
  tipoDeArquivo: string;
  kind: string;
  formato: string | null;
  bytes: number | null;
  largura: number | null;
  altura: number | null;
  pasta: string;
  criadoEm: string;
  dono: {
    tipo: string;
    id: string | null;
    nome: string | null;
    removidoEm: string | null;
  } | null;
  enviadoPor: {
    id: string;
    nome: string | null;
    email: string | null;
    imagem: string | null;
  } | null;
}

export interface FiltroDeOrfaos {
  de?: string;
  ate?: string;
  tipo?: string;
}

export const listarOrfaos = (f: FiltroDeOrfaos, page = 1) =>
  apiFetch<{
    items: ArquivoOrfao[];
    resumo: { total: number; bytes: number; porTipo: Record<string, number> };
    pagination: { page: number; total: number; totalPages: number };
  }>('/admin/maintenance/orphans', {
    cache: 'no-store',
    query: { ...f, page, limit: 40 },
  });

/** Confere de novo e remove do armazenamento; até 200 por vez. */
export const removerOrfaos = (ids: string[]) =>
  apiFetch<{
    removidos: number;
    ids: string[];
    recusados: Array<{ id: string; motivo: string }>;
  }>('/admin/maintenance/orphans/delete', {
    method: 'POST',
    body: { ids },
  });
