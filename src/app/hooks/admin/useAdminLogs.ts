// app/hooks/admin/useAdminLogs.ts
import { useState, useEffect, useCallback } from 'react';
import { LogCategory, LogLevel } from '@/app/libs/logging/systemLogger';

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

// Tipos de retorno para as operações
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

export function useAdminLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<LogFilters>({});
  const [pagination, setPagination] = useState<LogPagination>({
    page: 1,
    limit: 50,
    total: 0,
    hasMore: false,
  });

  // Função para buscar logs
  const fetchLogs = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set('page', reset ? '1' : pagination.page.toString());
        params.set('limit', pagination.limit.toString());

        if (filters.level) params.set('level', filters.level);
        if (filters.category) params.set('category', filters.category);
        if (filters.search) params.set('search', filters.search);
        if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.set('dateTo', filters.dateTo);
        if (filters.userId) params.set('userId', filters.userId);

        const response = await fetch(`/api/admin/logs?${params}`);
        if (!response.ok) {
          throw new Error(`Erro ao buscar logs: ${response.statusText}`);
        }

        const data = await response.json();

        if (reset) {
          setLogs(data.logs);
          setPagination({
            page: 1,
            limit: pagination.limit,
            total: data.total,
            hasMore: data.hasMore,
          });
        } else {
          setLogs((prev) => [...prev, ...data.logs]);
          setPagination((prev) => ({
            ...prev,
            page: prev.page + 1,
            hasMore: data.hasMore,
          }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.page, pagination.limit]
  );

  // Função para buscar estatísticas
  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);

      const response = await fetch(`/api/admin/logs?${params}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar estatísticas: ${response.statusText}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  }, [filters.dateFrom, filters.dateTo]);

  // Função para definir filtros e reiniciar busca
  const setFilters = useCallback((newFilters: Partial<LogFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Função para recarregar logs
  const refreshLogs = useCallback(async () => {
    await Promise.all([fetchLogs(true), fetchStats()]);
  }, [fetchLogs, fetchStats]);

  // Função para carregar mais logs
  const loadMoreLogs = useCallback(async () => {
    if (!pagination.hasMore || loading) return;
    await fetchLogs(false);
  }, [fetchLogs, pagination.hasMore, loading]);

  // Função para deletar logs
  const deleteLogs = useCallback(
    async (dates: string[]): Promise<DeleteLogsResult> => {
      try {
        const response = await fetch('/api/admin/logs/cleanup', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dates }),
        });

        if (!response.ok) {
          throw new Error(`Erro ao deletar logs: ${response.statusText}`);
        }

        const result = await response.json();
        await refreshLogs(); // Atualizar logs após deletar
        return result;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Erro desconhecido'
        );
      }
    },
    [refreshLogs]
  );

  // Função para limpeza automática
  const cleanupOldLogs = useCallback(
    async (days: number): Promise<CleanupResult> => {
      try {
        const response = await fetch('/api/admin/logs/cleanup/auto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ days }),
        });

        if (!response.ok) {
          throw new Error(`Erro na limpeza automática: ${response.statusText}`);
        }

        const result = await response.json();
        await refreshLogs(); // Atualizar logs após limpeza
        return result;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Erro desconhecido'
        );
      }
    },
    [refreshLogs]
  );

  // Função para exportar logs
  const exportLogs = useCallback(
    async (format: 'csv' | 'json') => {
      try {
        const params = new URLSearchParams();
        params.set('format', format);
        if (filters.level) params.set('level', filters.level);
        if (filters.category) params.set('category', filters.category);
        if (filters.search) params.set('search', filters.search);
        if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.set('dateTo', filters.dateTo);

        const response = await fetch(`/api/admin/logs/export?${params}`);
        if (!response.ok) {
          throw new Error(`Erro ao exportar logs: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `logs-${
          new Date().toISOString().split('T')[0]
        }.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Erro desconhecido'
        );
      }
    },
    [filters]
  );

  // Função para teste de logging
  const testLogging = useCallback(async (): Promise<TestLoggingResult> => {
    try {
      const response = await fetch('/api/admin/logs/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar log de teste: ${response.statusText}`);
      }

      const result = await response.json();
      await refreshLogs(); // Atualizar logs após criar teste
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }, [refreshLogs]);

  // Funções utilitárias para UI
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
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();

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

  // Efeito para carregar dados iniciais
  useEffect(() => {
    refreshLogs();
  }, [filters]);

  return {
    logs,
    stats,
    loading,
    error,
    filters,
    pagination,
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
