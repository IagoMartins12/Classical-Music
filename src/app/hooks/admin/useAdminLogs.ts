// app/hooks/useAdminLogs.ts
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
  }>;
  performanceMetrics: {
    avgResponseTime: number;
    slowQueries: number;
    failedRequests: number;
  };
}

interface UseAdminLogsReturn {
  logs: LogEntry[];
  stats: LogStats | null;
  loading: boolean;
  error: string | null;
  refreshLogs: (filters?: any) => Promise<void>;
  refreshStats: () => Promise<void>;
  exportLogs: (format?: 'csv' | 'json') => Promise<void>;
}

export const useAdminLogs = (): UseAdminLogsReturn => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        action: 'logs',
        ...filters,
      });

      const response = await fetch(`/api/admin/logs?${searchParams}`);

      if (!response.ok) {
        throw new Error('Erro ao carregar logs');
      }

      const data = await response.json();

      if (data.success) {
        setLogs(data.logs);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/logs?action=stats');

      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas');
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas de logs:', err);
    }
  }, []);

  const exportLogs = useCallback(
    async (format: 'csv' | 'json' = 'csv') => {
      try {
        const csvContent = [
          'Timestamp,Level,Category,Service,Action,Message,User,IP,Status',
          ...logs.map(
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
        a.download = `logs_${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Erro ao exportar logs:', err);
        setError('Erro ao exportar logs');
      }
    },
    [logs]
  );

  const refreshLogs = useCallback(
    async (filters?: any) => {
      return fetchLogs(filters);
    },
    [fetchLogs]
  );

  const refreshStats = useCallback(async () => {
    return fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [fetchLogs, fetchStats]);

  return {
    logs,
    stats,
    loading,
    error,
    refreshLogs,
    refreshStats,
    exportLogs,
  };
};
