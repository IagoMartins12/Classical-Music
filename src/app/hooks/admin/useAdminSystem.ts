// app/hooks/useAdminSystem.ts
import { useState, useEffect, useCallback } from 'react';

export interface SystemMetrics {
  server: {
    cpu: { usage: number; cores: number; load: number[] };
    memory: { used: number; total: number; percentage: number };
    disk: { used: number; total: number; percentage: number };
    uptime: number;
    processes: number;
  };
  database: {
    connections: { active: number; max: number; percentage: number };
    queries: { slow: number; average: number; total: number };
    size: { tables: number; indexes: number; total: string };
    performance: { reads: number; writes: number; locks: number };
  };
  cache: {
    redis: { memory: number; hits: number; misses: number; ratio: number };
    application: { size: number; entries: number; hitRate: number };
    cdn: { requests: number; bandwidth: string; hitRate: number };
  };
  network: {
    requests: { current: number; peak: number; avg: number };
    bandwidth: { incoming: number; outgoing: number; total: number };
    errors: { rate: number; total: number; codes: Record<string, number> };
    latency: { p50: number; p95: number; p99: number };
  };
  application: {
    users: { active: number; peak: number; concurrent: number };
    sessions: { total: number; avg_duration: number; bounce_rate: number };
    features: { uploads: number; annotations: number; studies: number };
    errors: { count: number; rate: number; critical: number };
  };
}

interface UseAdminSystemReturn {
  metrics: SystemMetrics | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  autoRefresh: boolean;
  setAutoRefresh: (enabled: boolean) => void;
}

export const useAdminSystem = (): UseAdminSystemReturn => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/system');

      if (!response.ok) {
        throw new Error('Erro ao carregar métricas do sistema');
      }

      const data = await response.json();

      if (data.success) {
        setMetrics(data.metrics);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar métricas do sistema:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    return fetchData();
  }, [fetchData]);

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    metrics,
    loading,
    error,
    refreshData,
    autoRefresh,
    setAutoRefresh,
  };
};
