/**
 * Operação do painel pela API: trilha de auditoria (no lugar dos logs em
 * arquivo), saúde do sistema e relatórios.
 *
 * - **Logs:** o legado lia arquivos de log do disco do servidor do Next. A
 *   API manda log para a saída padrão e para o Sentry; o que o painel mostra é
 *   a trilha de auditoria (`/admin/audit`) — cada ação administrativa, com
 *   autor, alvo e se deu certo. Apagar log não existe: a trilha tem retenção
 *   automática (tarefa `audit.prune`).
 * - **Sistema:** a API expõe a prontidão (`/health/ready`), o estado do banco,
 *   do disco e das filas (`/admin/maintenance/health`, `/admin/jobs/queues`).
 *   CPU, memória do processo e rede não aparecem ao painel (`/metrics` é do
 *   Prometheus, com chave): ficam zerados.
 * - **Relatórios:** CSV gerado da foto do momento, baixado pela API.
 */
import { ApiError, apiFetch } from '@/app/libs/api/client';
import { downloadFromApi, displayName } from '@/app/requests/admin/common';

const noStore = { cache: 'no-store' as const };

// ---- Auditoria

export interface ApiAuditEntry {
  id: string;
  actorId: string | null;
  actorRole: number | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string | null;
  success: boolean;
  createdAt: string;
  actor?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
}

export interface AuditFilters {
  onlyFailures?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}

function auditQuery(filters: AuditFilters) {
  return {
    onlyFailures: filters.onlyFailures || undefined,
    actionPrefix: filters.search?.trim() || undefined,
    from: filters.dateFrom || undefined,
    to: filters.dateTo || undefined,
    actorId: filters.userId || undefined,
  };
}

/**
 * Uma fatia da trilha. `cursor` é o id do último item já mostrado: a API
 * continua dali e não conta a base de novo, então `total` só vem na primeira.
 */
export async function listAuditEntries(
  limit: number,
  filters: AuditFilters,
  cursor?: string
) {
  const data = await apiFetch<{
    entries: ApiAuditEntry[];
    pagination: {
      page: number;
      limit: number;
      total: number | null;
      totalPages: number | null;
      nextCursor: string | null;
    };
  }>('/admin/audit', {
    query: { cursor, limit: Math.min(limit, 100), ...auditQuery(filters) },
    ...noStore,
  });

  return {
    entries: data.entries.map((entry) => ({
      ...entry,
      actorName: entry.actor ? displayName(entry.actor) : undefined,
    })),
    total: data.pagination.total,
    nextCursor: data.pagination.nextCursor,
  };
}

export function getAuditSummary(days: number) {
  return apiFetch<{
    period: { days: number; since: string };
    total: number;
    failures: number;
    failureRate: number | null;
    byAction: { action: string; count?: number; total?: number }[];
    topActors: unknown[];
  }>('/admin/audit/summary', { query: { days }, ...noStore });
}

export function exportAuditEntries(
  format: 'csv' | 'json',
  filters: AuditFilters
) {
  return downloadFromApi(
    '/admin/audit/export',
    { format, ...auditQuery(filters) },
    `auditoria-${new Date().toISOString().split('T')[0]}.${format}`
  );
}

// ---- Saúde do sistema

export interface ApiReadiness {
  status: string;
  info?: Record<string, { status: string; responseTimeMs?: number }>;
  error?: Record<string, { status: string; message?: string }>;
  details?: Record<
    string,
    { status: string; responseTimeMs?: number; message?: string }
  >;
}

export interface ApiMaintenanceHealth {
  database: {
    collections: number;
    documents: number;
    dataSizeBytes: number;
    storageSizeBytes: number;
    indexes: number;
    indexSizeBytes: number;
  };
  databaseHostDisk: {
    totalBytes: number;
    usedBytes: number;
    usedPercent: number;
  } | null;
  records: Record<string, number>;
  search: {
    collections: { collection: string; textIndex: boolean }[];
    allIndexed: boolean;
  };
  queues: {
    queue: string;
    paused: boolean;
    workers: number;
    counts: Record<string, number>;
    oldestWaitingSeconds: number | null;
  }[];
  measuredAt: string;
}

/** Prontidão: a API responde 503 quando algo está fora — o corpo diz o quê. */
export async function getReadiness(): Promise<ApiReadiness> {
  try {
    return await apiFetch<ApiReadiness>('/health/ready', noStore);
  } catch (error) {
    if (error instanceof ApiError && error.status === 503) {
      return {
        status: 'error',
        details: {},
        error: { api: { status: 'down', message: error.message } },
      };
    }
    throw error;
  }
}

export const getMaintenanceHealth = () =>
  apiFetch<ApiMaintenanceHealth>('/admin/maintenance/health', noStore);

// ---- Relatórios

export interface ApiReportResult {
  id: string;
  name: string;
  type: string;
  format: 'csv';
  period: string;
  generatedAt: string;
  status: 'ready' | 'failed' | 'generating';
  size?: string | null;
  downloadUrl: string | null;
  error?: string | null;
}

export function listReports() {
  return apiFetch<{
    stats: {
      totalUsers: number;
      totalWorks: number;
      totalComposers: number;
      totalAnnotations: number;
      activeUsers: number;
      newUsers: number;
      uploads: number;
      totalScores: number;
    };
    results: ApiReportResult[];
  }>('/admin/reports', noStore);
}

const REPORT_PERIODS: Record<string, string> = {
  '7d': '7d',
  week: '7d',
  '30d': '30d',
  month: '30d',
  '90d': '90d',
  quarter: '90d',
  '3m': '90d',
  '1y': '1y',
  year: '1y',
};

/** A API gera CSV dos três tipos que tem; o período vai para 7d, 30d, 90d ou 1y. */
export function generateReportRequest(type: string, period: string) {
  return apiFetch<ApiReportResult>('/admin/reports', {
    method: 'POST',
    body: { type, period: REPORT_PERIODS[period] ?? '30d' },
  });
}

export function deleteReportRequest(id: string) {
  return apiFetch(`/admin/reports/${id}`, { method: 'DELETE' });
}

export function downloadReportRequest(report: {
  id: string;
  name: string;
  period: string;
}) {
  return downloadFromApi(
    `/admin/reports/${report.id}/download`,
    {},
    `${report.name}_${report.period}.csv`
  );
}
