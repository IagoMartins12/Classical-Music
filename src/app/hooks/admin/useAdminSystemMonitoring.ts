// app/hooks/admin/useSystemMonitoring.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

export interface SystemMetrics {
  server: {
    cpu: { usage: number; cores: number; load: number[]; temperature?: number };
    memory: { used: number; total: number; percentage: number };
    disk: { used: number; total: number; percentage: number };
    uptime: number;
    processes: number;
    platform: string;
    hostname: string;
  };
  database: {
    connections: { active: number; max: number; percentage: number };
    queries: { slow: number; average: number; total: number };
    size: { tables: number; indexes: number; total: string };
    performance: { reads: number; writes: number; locks: number };
    memory: { resident: number; virtual: number };
    cache: { hitRatio: number; size: number };
  };
  cache: {
    redis?: { memory: number; hits: number; misses: number; ratio: number };
    application: { size: number; entries: number; hitRate: number };
    cdn: { requests: number; bandwidth: string; hitRate: number };
  };
  network: {
    requests: { current: number; peak: number; avg: number };
    bandwidth: { incoming: number; outgoing: number; total: number };
    errors: { rate: number; total: number; codes: Record<string, number> };
    latency: { p50: number; p95: number; p99: number };
    connections: number;
  };
  application: {
    users: { active: number; peak: number; concurrent: number };
    sessions: { total: number; avg_duration: number; bounce_rate: number };
    features: { uploads: number; annotations: number; studies: number };
    errors: { count: number; rate: number; critical: number };
    performance: { avgResponseTime: number; slowQueries: number };
  };
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  category: 'performance' | 'security' | 'storage' | 'network';
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  service: string;
  message: string;
  details?: any;
}

export interface SystemMonitoringState {
  metrics: SystemMetrics | null;
  alerts: Alert[];
  logs: LogEntry[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isConnected: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface UseSystemMonitoringReturn extends SystemMonitoringState {
  // Ações básicas
  refreshMetrics: () => Promise<void>;
  clearCache: () => Promise<void>;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;

  // Estatísticas detalhadas
  getDetailedStats: () => Promise<any>;

  // Utilitários
  getHealthStatus: () => 'healthy' | 'warning' | 'critical';
  getActiveAlerts: () => Alert[];
  getCriticalAlerts: () => Alert[];

  // Formatação
  formatUptime: (seconds: number) => string;
  formatBytes: (bytes: number) => string;
  formatPercentage: (value: number) => string;
}

export const useSystemMonitoring = (): UseSystemMonitoringReturn => {
  const [state, setState] = useState<SystemMonitoringState>({
    metrics: null,
    alerts: [],
    logs: [],
    loading: false,
    error: null,
    lastUpdated: null,
    isConnected: false,
    autoRefresh: true,
    refreshInterval: 30, // segundos
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Função para buscar métricas
  const fetchMetrics = useCallback(
    async (showLoading = true) => {
      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      if (showLoading) {
        setState((prev) => ({ ...prev, loading: true, error: null }));
      }

      try {
        const response = await fetch('/api/admin/system', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Acesso não autorizado');
          }
          if (response.status === 403) {
            throw new Error('Permissão negada');
          }
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          setState((prev) => ({
            ...prev,
            metrics: data.metrics,
            alerts: data.alerts || [],
            logs: data.logs || [],
            loading: false,
            error: null,
            lastUpdated: new Date(),
            isConnected: true,
          }));
        } else {
          throw new Error(data.error || 'Erro ao carregar métricas');
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Requisição cancelada, não é um erro
        }

        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          isConnected: false,
        }));

        console.error('Erro ao buscar métricas:', err);

        // Retry automático após erro
        if (state.autoRefresh) {
          retryTimeoutRef.current = setTimeout(() => {
            fetchMetrics(false);
          }, 10000); // Retry após 10 segundos
        }
      }
    },
    [state.autoRefresh]
  );

  // Função para limpar cache
  const clearCache = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'clear_cache' }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Cache limpo com sucesso');
        // Atualizar métricas após limpar cache
        await fetchMetrics();
      } else {
        throw new Error(data.error || 'Erro ao limpar cache');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao limpar cache: ${errorMessage}`);
      console.error('Erro ao limpar cache:', error);
    }
  }, [fetchMetrics]);

  // Função para obter estatísticas detalhadas
  const getDetailedStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'get_detailed_stats' }),
      });

      const data = await response.json();

      if (data.success) {
        return data.stats;
      } else {
        throw new Error(data.error || 'Erro ao obter estatísticas');
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas detalhadas:', error);
      return null;
    }
  }, []);

  // Função para atualizar auto-refresh
  const setAutoRefresh = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, autoRefresh: enabled }));
  }, []);

  // Função para atualizar intervalo de refresh
  const setRefreshInterval = useCallback((interval: number) => {
    setState((prev) => ({ ...prev, refreshInterval: interval }));
  }, []);

  // Função para obter status de saúde geral
  const getHealthStatus = useCallback(():
    | 'healthy'
    | 'warning'
    | 'critical' => {
    if (!state.metrics) return 'warning';

    const { metrics } = state;
    const criticalAlerts = state.alerts.filter(
      (a) => a.type === 'critical' && !a.resolved
    );

    if (criticalAlerts.length > 0) return 'critical';

    // Verificar métricas críticas
    if (
      metrics.server.cpu.usage > 90 ||
      metrics.server.memory.percentage > 95 ||
      metrics.server.disk.percentage > 95 ||
      metrics.database.connections.percentage > 95 ||
      metrics.application.errors.critical > 0
    ) {
      return 'critical';
    }

    // Verificar métricas de warning
    if (
      metrics.server.cpu.usage > 70 ||
      metrics.server.memory.percentage > 80 ||
      metrics.server.disk.percentage > 80 ||
      metrics.database.connections.percentage > 80 ||
      metrics.application.errors.count > 10
    ) {
      return 'warning';
    }

    return 'healthy';
  }, [state.metrics, state.alerts]);

  // Função para obter alertas ativos
  const getActiveAlerts = useCallback((): Alert[] => {
    return state.alerts.filter((alert) => !alert.resolved);
  }, [state.alerts]);

  // Função para obter alertas críticos
  const getCriticalAlerts = useCallback((): Alert[] => {
    return state.alerts.filter(
      (alert) => alert.type === 'critical' && !alert.resolved
    );
  }, [state.alerts]);

  // Utilitários de formatação
  const formatUptime = useCallback((seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }, []);

  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const formatPercentage = useCallback((value: number): string => {
    return `${value.toFixed(1)}%`;
  }, []);

  // Função pública para refresh manual
  const refreshMetrics = useCallback(async () => {
    await fetchMetrics(true);
  }, [fetchMetrics]);

  // Configurar auto-refresh
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (state.autoRefresh && state.refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchMetrics(false);
      }, state.refreshInterval * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.autoRefresh, state.refreshInterval, fetchMetrics]);

  // Carregar métricas iniciais
  useEffect(() => {
    fetchMetrics(true);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Notificações para alertas críticos
  useEffect(() => {
    const criticalAlerts = getCriticalAlerts();

    if (criticalAlerts.length > 0 && state.lastUpdated) {
      const latestAlert = criticalAlerts[0];
      const alertTime = new Date(latestAlert.timestamp).getTime();
      const lastUpdate = state.lastUpdated.getTime();

      // Mostrar notificação apenas para alertas novos (últimos 2 minutos)
      if (alertTime > lastUpdate - 2 * 60 * 1000) {
        toast.error(`Alerta Crítico: ${latestAlert.title}`, {
          duration: 10000,
          position: 'top-right',
        });
      }
    }
  }, [state.alerts, state.lastUpdated, getCriticalAlerts]);

  return {
    ...state,
    refreshMetrics,
    clearCache,
    setAutoRefresh,
    setRefreshInterval,
    getDetailedStats,
    getHealthStatus,
    getActiveAlerts,
    getCriticalAlerts,
    formatUptime,
    formatBytes,
    formatPercentage,
  };
};

// Hook para estatísticas em tempo real (usando WebSocket se disponível)
export const useRealTimeStats = () => {
  const [realtimeData, setRealtimeData] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Implementar WebSocket para dados em tempo real
    // Por enquanto, usar polling mais frequente
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/admin/system', {
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          setRealtimeData(data);
          setConnected(true);
        }
      } catch (error) {
        setConnected(false);
      }
    }, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return {
    data: realtimeData,
    connected,
  };
};

// Utilitários para alertas
export const AlertUtils = {
  getAlertColor: (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'text-accent-red bg-accent-red/10 border-accent-red';
      case 'warning':
        return 'text-accent-amber bg-accent-amber/10 border-accent-amber';
      case 'info':
        return 'text-accent-blue bg-accent-blue/10 border-accent-blue';
      default:
        return 'text-theme-tertiary bg-theme-secondary border-theme-secondary';
    }
  },

  getAlertIcon: (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📝';
    }
  },

  formatAlertTime: (timestamp: Date) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
};

// Utilitários para logs
export const LogUtils = {
  getLogLevelColor: (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-accent-red';
      case 'warn':
        return 'text-accent-amber';
      case 'info':
        return 'text-accent-blue';
      case 'debug':
        return 'text-theme-tertiary';
      default:
        return 'text-theme-secondary';
    }
  },

  formatLogTime: (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR');
  },
};
