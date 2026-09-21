// app/hooks/admin/useAdminLogs.ts
import { useCallback, useState } from 'react';
import { adminKeys, useAdminInfinite, useAdminQuery } from './query';
import { LogCategory, LogLevel } from '@/app/libs/logging/systemLogger';
import {
  type ApiAuditEntry,
  type AuditFilters,
  exportAuditEntries,
  getAuditSummary,
  listAuditEntries,
} from '@/app/requests/admin/operations';

// Interfaces dos tipos de log
export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  traceId?: string;
  userId?: string;
  userName?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  query?: {
    model: string;
    operation: string;
    duration?: number;
    sql?: string;
  };
  metadata?: Record<string, any>;
}

export interface LogStats {
  overview: {
    totalLogs: number;
    errorRate: number;
    avgDuration: number;
    slowQueries: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<LogCategory, number>;
    topErrors: Array<{
      message: string;
      count: number;
      lastSeen: string;
    }>;
  };
  queryPerformance?: {
    slowQueries: number;
    avgDuration: number;
    topSlowModels: Array<{
      model: string;
      avgDuration: number;
      count: number;
    }>;
    topSlowOperations: Array<{
      operation: string;
      avgDuration: number;
      count: number;
    }>;
    hourlyStats: Array<{
      hour: number;
      count: number;
      avgDuration: number;
    }>;
  };
  availableDates: string[];
  searchedDates: string[];
}

export interface LogFilters {
  level?: LogLevel;
  category?: LogCategory;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}

export interface LogPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface DeleteLogsResult {
  deletedCount: number;
  errors: string[];
}

export interface CleanupResult {
  deletedCount: number;
  errors: string[];
}

export interface TestLoggingResult {
  traceId: string;
  message: string;
}

const RETENTION_MESSAGE =
  'A trilha de auditoria tem retenção automática (tarefa de manutenção "audit.prune"); não se apaga pelo painel.';

function toLogEntry(entry: ApiAuditEntry & { actorName?: string }): LogEntry {
  const target = entry.entityType
    ? `${entry.entityType}${entry.entityId ? ` ${entry.entityId}` : ''}`
    : '';

  return {
    id: entry.id,
    timestamp: entry.createdAt,
    level: entry.success ? LogLevel.INFO : LogLevel.ERROR,
    category: LogCategory.AUDIT,
    message: [entry.action, target].filter(Boolean).join(' — '),
    traceId: entry.requestId ?? undefined,
    userId: entry.actorId ?? undefined,
    userName: entry.actorName,
    ipAddress: entry.ipAddress ?? undefined,
    userAgent: entry.userAgent ?? undefined,
    metadata: entry.metadata ?? undefined,
  };
}

// Só existe a categoria "auditoria"; nível erro é "ação que falhou".
const toAuditFilters = (filters: LogFilters): AuditFilters => ({
  onlyFailures: filters.level === LogLevel.ERROR,
  search: filters.search,
  dateFrom: filters.dateFrom,
  dateTo: filters.dateTo,
  userId: filters.userId,
});

const hasNoMatch = (filters: LogFilters) =>
  (filters.category !== undefined && filters.category !== LogCategory.AUDIT) ||
  (filters.level !== undefined &&
    filters.level !== LogLevel.ERROR &&
    filters.level !== LogLevel.INFO);

const zeros = <T extends string>(values: T[]) =>
  Object.fromEntries(values.map((value) => [value, 0])) as Record<T, number>;

/**
 * Logs do painel = trilha de auditoria da API (`/admin/audit`). O log de
 * aplicação da API vai para a saída padrão e para o Sentry, fora do painel.
 */
/** Entradas por página da trilha — o mesmo do legado. */
const PAGE_SIZE = 50;

/**
 * Trilha de auditoria no painel.
 *
 * A lista é por cursor (`useAdminInfinite`): o "carregar mais" pede a fatia
 * seguinte a partir do id do último registro mostrado, em vez de mandar a
 * API reler todas as páginas anteriores. Trocar o filtro troca a chave, e a
 * lista recomeça sozinha.
 */
export function useAdminLogs() {
  const [filters, setFiltersState] = useState<LogFilters>({});

  const list = useAdminInfinite(
    adminKeys.list('audit', filters),
    async (cursor) => {
      // Filtro que a trilha não tem: lista vazia, sem ir ao servidor.
      if (hasNoMatch(filters)) {
        return { items: [] as LogEntry[], total: 0, nextCursor: null };
      }

      const data = await listAuditEntries(
        PAGE_SIZE,
        toAuditFilters(filters),
        cursor
      );
      const entries = data.entries.map(toLogEntry);

      return {
        items:
          filters.level === LogLevel.INFO
            ? entries.filter((entry) => entry.level === LogLevel.INFO)
            : entries,
        total: data.total,
        nextCursor: data.nextCursor,
      };
    }
  );

  const summary = useAdminQuery(
    adminKeys.list('audit-summary', filters.dateFrom ?? null),
    async () => {
      const since = filters.dateFrom
        ? new Date(filters.dateFrom).getTime()
        : undefined;
      const days = since
        ? Math.min(365, Math.max(1, Math.ceil((Date.now() - since) / 86400000)))
        : 30;
      const data = await getAuditSummary(days);

      return {
        overview: {
          totalLogs: data.total,
          errorRate: data.failureRate ?? 0,
          avgDuration: 0,
          slowQueries: 0,
          byLevel: {
            ...zeros(Object.values(LogLevel) as LogLevel[]),
            [LogLevel.ERROR]: data.failures,
            [LogLevel.INFO]: data.total - data.failures,
          },
          byCategory: {
            ...zeros(Object.values(LogCategory) as LogCategory[]),
            [LogCategory.AUDIT]: data.total,
          },
          topErrors: [],
        },
        availableDates: [],
        searchedDates: [],
      } as LogStats;
    }
  );

  const setFilters = useCallback((newFilters: Partial<LogFilters>) => {
    setFiltersState((previous) => ({ ...previous, ...newFilters }));
  }, []);

  const refreshLogs = useCallback(async () => {
    await Promise.all([list.refetch(), summary.refetch()]);
  }, [list, summary]);

  const loadMoreLogs = useCallback(async () => {
    list.loadMore();
  }, [list]);

  const deleteLogs = useCallback(
    async (_dates: string[]): Promise<DeleteLogsResult> => {
      throw new Error(RETENTION_MESSAGE);
    },
    []
  );

  const cleanupOldLogs = useCallback(
    async (_days: number): Promise<CleanupResult> => {
      throw new Error(RETENTION_MESSAGE);
    },
    []
  );

  const exportLogs = useCallback(
    async (format: 'csv' | 'json') => {
      await exportAuditEntries(format, toAuditFilters(filters));
    },
    [filters]
  );

  const testLogging = useCallback(async (): Promise<TestLoggingResult> => {
    throw new Error(
      'O log de teste não existe na API: a trilha só registra ações reais.'
    );
  }, []);

  const getLevelIcon = (level: LogLevel) => {
    const icons = {
      [LogLevel.ERROR]: 'FiAlertTriangle',
      [LogLevel.WARN]: 'FiInfo',
      [LogLevel.INFO]: 'FiCheckCircle',
      [LogLevel.DEBUG]: 'FiSettings',
      [LogLevel.TRACE]: 'FiActivity',
    };
    return icons[level] || 'FiInfo';
  };

  const getLevelColor = (level: LogLevel) => {
    const colors = {
      [LogLevel.ERROR]: 'text-accent-red border-accent-red bg-accent-red/10',
      [LogLevel.WARN]:
        'text-accent-amber border-accent-amber bg-accent-amber/10',
      [LogLevel.INFO]: 'text-accent-blue border-accent-blue bg-accent-blue/10',
      [LogLevel.DEBUG]:
        'text-accent-purple border-accent-purple bg-accent-purple/10',
      [LogLevel.TRACE]:
        'text-theme-tertiary border-theme-tertiary bg-theme-secondary',
    };
    return colors[level] || colors[LogLevel.INFO];
  };

  const getCategoryIcon = (category: LogCategory) => {
    const icons = {
      [LogCategory.API]: 'FiGlobe',
      [LogCategory.DATABASE]: 'FiDatabase',
      [LogCategory.AUTH]: 'FiLock',
      [LogCategory.SECURITY]: 'FiShield',
      [LogCategory.PERFORMANCE]: 'FiZap',
      [LogCategory.ADMIN]: 'FiSettings',
      [LogCategory.SYSTEM]: 'FiServer',
      [LogCategory.AUDIT]: 'FiFileText',
    };
    return icons[category] || 'FiInfo';
  };

  const getRelativeTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}m atrás`;
    return `${seconds}s atrás`;
  };

  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    return `${(duration / 60000).toFixed(1)}m`;
  };

  return {
    logs: list.items,
    stats: summary.data ?? null,
    loading: list.loading || list.fetching,
    error: list.error ?? summary.error,
    filters,
    pagination: {
      // "Página" é só quantas fatias já vieram; quem manda é o cursor.
      page: Math.max(1, Math.ceil(list.items.length / PAGE_SIZE)),
      limit: PAGE_SIZE,
      total: list.total ?? list.items.length,
      hasMore: list.hasMore,
    } satisfies LogPagination,
    setFilters,
    refreshLogs,
    loadMoreLogs,
    deleteLogs,
    cleanupOldLogs,
    exportLogs,
    testLogging,
    getLevelIcon,
    getLevelColor,
    getCategoryIcon,
    getRelativeTime,
    formatDuration,
  };
}
