// app/hooks/admin/useAdminLogs.ts
import { useState, useEffect, useCallback } from 'react';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  category: 'system' | 'security' | 'audit' | 'performance' | 'user' | 'api';
  service: string;
  action: string;
  message: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  statusCode?: number;
  duration?: number;
  details?: any;
  sessionId?: string;
  traceId?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: {
    before: any;
    after: any;
  };
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  success: boolean;
  errorMessage?: string;
  metadata?: any;
}

export interface LogStats {
  total: number;
  byLevel: Record<string, number>;
  byCategory: Record<string, number>;
  byService: Record<string, number>;
  last24h: number;
  errorRate: number;
  topErrors: Array<{
    message: string;
    count: number;
    lastSeen: Date;
    level: string;
  }>;
  performanceMetrics: {
    avgResponseTime: number;
    slowQueries: number;
    failedRequests: number;
  };
  activityByHour: Array<{
    hour: number;
    count: number;
  }>;
}

export interface LogFilters {
  level: string;
  category: string;
  service: string;
  timeRange: string;
  search: string;
  userId: string;
  startDate?: Date;
  endDate?: Date;
}

interface UseAdminLogsReturn {
  // Data
  logs: LogEntry[];
  auditEvents: AuditEvent[];
  stats: LogStats | null;

  // State
  loading: boolean;
  error: string | null;
  filters: LogFilters;
  selectedLogs: Set<string>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };

  // Actions
  refreshLogs: () => Promise<void>;
  setFilters: (filters: Partial<LogFilters>) => void;
  toggleLogSelection: (logId: string) => void;
  selectAllLogs: () => void;
  clearSelection: () => void;
  exportLogs: (format: 'csv' | 'json') => Promise<void>;
  archiveLogs: (logIds: string[]) => Promise<void>;
  deleteLogs: (logIds: string[]) => Promise<void>;
  loadMoreLogs: () => Promise<void>;

  // Utilities
  getFilteredLogs: () => LogEntry[];
  getLevelColor: (level: string) => string;
  getLevelIcon: (level: string) => string;
  getCategoryIcon: (category: string) => string;
  formatTimestamp: (date: Date) => string;
  getRelativeTime: (date: Date) => string;
}

const DEFAULT_FILTERS: LogFilters = {
  level: 'all',
  category: 'all',
  service: 'all',
  timeRange: '24h',
  search: '',
  userId: '',
};

export const useAdminLogs = (): UseAdminLogsReturn => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<LogFilters>(DEFAULT_FILTERS);
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    hasMore: false,
  });

  // Fetch logs with current filters and pagination
  const fetchLogs = useCallback(
    async (isLoadMore = false) => {
      if (loading) return;

      setLoading(true);
      if (!isLoadMore) {
        setError(null);
      }

      try {
        const queryParams = new URLSearchParams({
          page: isLoadMore ? (pagination.page + 1).toString() : '1',
          limit: pagination.limit.toString(),
          level: filters.level,
          category: filters.category,
          service: filters.service,
          timeRange: filters.timeRange,
          search: filters.search,
          userId: filters.userId,
        });

        if (filters.startDate) {
          queryParams.append('startDate', filters.startDate.toISOString());
        }
        if (filters.endDate) {
          queryParams.append('endDate', filters.endDate.toISOString());
        }

        const response = await fetch(`/api/admin/logs?${queryParams}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Acesso não autorizado');
          }
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          if (isLoadMore) {
            setLogs((prev) => [...prev, ...data.logs]);
            setPagination((prev) => ({
              ...prev,
              page: prev.page + 1,
              hasMore: data.pagination.hasMore,
            }));
          } else {
            setLogs(data.logs);
            setAuditEvents(data.auditEvents || []);
            setStats(data.stats);
            setPagination({
              page: 1,
              limit: pagination.limit,
              total: data.pagination.total,
              hasMore: data.pagination.hasMore,
            });
          }
        } else {
          throw new Error(data.error || 'Erro ao carregar logs');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error('Erro ao buscar logs:', err);
      } finally {
        setLoading(false);
      }
    },
    [loading, filters, pagination.limit, pagination.page]
  );

  // Export logs
  const exportLogs = useCallback(
    async (format: 'csv' | 'json') => {
      try {
        const selectedLogData =
          selectedLogs.size > 0
            ? logs.filter((log) => selectedLogs.has(log.id))
            : logs;

        if (format === 'csv') {
          const csvContent = [
            'Timestamp,Level,Category,Service,Action,Message,User,IP,Status',
            ...selectedLogData.map(
              (log) =>
                `${log.timestamp.toISOString()},${log.level},${log.category},${
                  log.service
                },${log.action},"${log.message}",${log.userName || ''},${
                  log.ipAddress || ''
                },${log.statusCode || ''}`
            ),
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        } else if (format === 'json') {
          const jsonContent = JSON.stringify(selectedLogData, null, 2);
          const blob = new Blob([jsonContent], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `logs_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        console.error('Erro ao exportar logs:', err);
        setError('Erro ao exportar logs');
      }
    },
    [logs, selectedLogs]
  );

  // Archive logs
  const archiveLogs = useCallback(async (logIds: string[]) => {
    try {
      const response = await fetch('/api/admin/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'archive',
          logIds,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove archived logs from current view
        setLogs((prev) => prev.filter((log) => !logIds.includes(log.id)));
        setSelectedLogs(new Set());
      } else {
        throw new Error(data.error || 'Erro ao arquivar logs');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    }
  }, []);

  // Delete logs
  const deleteLogs = useCallback(async (logIds: string[]) => {
    try {
      const response = await fetch('/api/admin/logs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logIds,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove deleted logs from current view
        setLogs((prev) => prev.filter((log) => !logIds.includes(log.id)));
        setSelectedLogs(new Set());
      } else {
        throw new Error(data.error || 'Erro ao deletar logs');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    }
  }, []);

  // Load more logs (pagination)
  const loadMoreLogs = useCallback(async () => {
    if (pagination.hasMore && !loading) {
      await fetchLogs(true);
    }
  }, [fetchLogs, pagination.hasMore, loading]);

  // Set filters and reset pagination
  const setFilters = useCallback((newFilters: Partial<LogFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedLogs(new Set());
  }, []);

  // Selection utilities
  const toggleLogSelection = useCallback((logId: string) => {
    setSelectedLogs((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(logId)) {
        newSelected.delete(logId);
      } else {
        newSelected.add(logId);
      }
      return newSelected;
    });
  }, []);

  const selectAllLogs = useCallback(() => {
    setSelectedLogs(new Set(logs.map((log) => log.id)));
  }, [logs]);

  const clearSelection = useCallback(() => {
    setSelectedLogs(new Set());
  }, []);

  // Refresh logs
  const refreshLogs = useCallback(async () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    return fetchLogs();
  }, [fetchLogs]);

  // Get filtered logs (client-side filtering for search)
  const getFilteredLogs = useCallback(() => {
    if (!filters.search) return logs;

    const searchLower = filters.search.toLowerCase();
    return logs.filter(
      (log) =>
        log.message.toLowerCase().includes(searchLower) ||
        log.userName?.toLowerCase().includes(searchLower) ||
        log.service.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower)
    );
  }, [logs, filters.search]);

  // Utility functions
  const getLevelColor = useCallback((level: string): string => {
    switch (level) {
      case 'error':
        return 'text-accent-red bg-accent-red/10';
      case 'warn':
        return 'text-accent-amber bg-accent-amber/10';
      case 'info':
        return 'text-accent-blue bg-accent-blue/10';
      case 'debug':
        return 'text-accent-purple bg-accent-purple/10';
      case 'trace':
        return 'text-theme-tertiary bg-theme-secondary';
      default:
        return 'text-theme-tertiary bg-theme-secondary';
    }
  }, []);

  const getLevelIcon = useCallback((level: string): string => {
    switch (level) {
      case 'error':
        return 'FiAlertTriangle';
      case 'warn':
        return 'FiAlertTriangle';
      case 'info':
        return 'FiInfo';
      case 'debug':
        return 'FiSettings';
      case 'trace':
        return 'FiActivity';
      default:
        return 'FiInfo';
    }
  }, []);

  const getCategoryIcon = useCallback((category: string): string => {
    switch (category) {
      case 'system':
        return 'FiServer';
      case 'security':
        return 'FiShield';
      case 'audit':
        return 'FiFileText';
      case 'performance':
        return 'FiActivity';
      case 'user':
        return 'FiUser';
      case 'api':
        return 'FiDatabase';
      default:
        return 'FiActivity';
    }
  }, []);

  const formatTimestamp = useCallback((date: Date): string => {
    return date.toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, []);

  const getRelativeTime = useCallback(
    (date: Date): string => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (minutes < 1) return 'Agora mesmo';
      if (minutes < 60) return `${minutes}min atrás`;
      if (hours < 24) return `${hours}h atrás`;
      if (days < 7) return `${days}d atrás`;

      return formatTimestamp(date);
    },
    [formatTimestamp]
  );

  // Load logs when filters change
  useEffect(() => {
    fetchLogs();
  }, [
    filters.level,
    filters.category,
    filters.service,
    filters.timeRange,
    filters.userId,
  ]);

  // Auto-refresh every 30 seconds for recent logs
  useEffect(() => {
    if (filters.timeRange === '1h' || filters.timeRange === '24h') {
      const interval = setInterval(() => {
        if (!loading && pagination.page === 1) {
          fetchLogs();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [fetchLogs, loading, pagination.page, filters.timeRange]);

  return {
    // Data
    logs,
    auditEvents,
    stats,

    // State
    loading,
    error,
    filters,
    selectedLogs,
    pagination,

    // Actions
    refreshLogs,
    setFilters,
    toggleLogSelection,
    selectAllLogs,
    clearSelection,
    exportLogs,
    archiveLogs,
    deleteLogs,
    loadMoreLogs,

    // Utilities
    getFilteredLogs,
    getLevelColor,
    getLevelIcon,
    getCategoryIcon,
    formatTimestamp,
    getRelativeTime,
  };
};
