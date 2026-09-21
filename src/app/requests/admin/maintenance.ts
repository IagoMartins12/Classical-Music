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
  summary: Record<string, number>;
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
