// app/hooks/admin/useSystemMonitoring.ts
import { useCallback, useState } from 'react';
import { adminKeys, useAdminQuery } from './query';
import toast from 'react-hot-toast';
import {
  type ApiMaintenanceHealth,
  type ApiReadiness,
  getMaintenanceHealth,
  getReadiness,
} from '@/app/requests/admin/operations';

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

/**
 * Monta as métricas da tela com o que a API mede: prontidão do banco e do
 * cache (`/health/ready`), tamanho do banco, disco do servidor do banco,
 * registros e filas (`/admin/maintenance/health`). CPU, memória do processo,
 * rede e sessões não são expostos ao painel e ficam zerados; os alertas saem
 * de verificações que falharam, disco cheio, filas com falha e busca sem índice.
 */
const formatSize = (bytes: number) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
};

function buildMetrics(
  ready: ApiReadiness,
  health: ApiMaintenanceHealth
): SystemMetrics {
  const disk = health.databaseHostDisk;
  const dbResponse =
    ready.details?.database?.responseTimeMs ??
    ready.info?.database?.responseTimeMs ??
    0;
  const failedJobs = health.queues.reduce(
    (sum, queue) => sum + (queue.counts.failed ?? 0),
    0
  );

  return {
    server: {
      cpu: { usage: 0, cores: 0, load: [] },
      memory: { used: 0, total: 0, percentage: 0 },
      disk: {
        used: disk?.usedBytes ?? 0,
        total: disk?.totalBytes ?? 0,
        percentage: disk?.usedPercent ?? 0,
      },
      uptime: 0,
      processes: 0,
      platform: '',
      hostname: '',
    },
    database: {
      connections: { active: 0, max: 0, percentage: 0 },
      queries: { slow: 0, average: dbResponse, total: 0 },
      size: {
        tables: health.database.collections,
        indexes: health.database.indexes,
        total: formatSize(health.database.dataSizeBytes),
      },
      performance: { reads: 0, writes: 0, locks: 0 },
      memory: { resident: 0, virtual: 0 },
      cache: { hitRatio: 0, size: health.database.indexSizeBytes },
    },
    cache: {
      application: { size: 0, entries: 0, hitRate: 0 },
      cdn: { requests: 0, bandwidth: '', hitRate: 0 },
    },
    network: {
      requests: { current: 0, peak: 0, avg: 0 },
      bandwidth: { incoming: 0, outgoing: 0, total: 0 },
      errors: { rate: 0, total: 0, codes: {} },
      latency: { p50: 0, p95: 0, p99: 0 },
      connections: 0,
    },
    application: {
      users: { active: 0, peak: 0, concurrent: 0 },
      sessions: { total: 0, avg_duration: 0, bounce_rate: 0 },
      features: { uploads: 0, annotations: 0, studies: 0 },
      errors: { count: failedJobs, rate: 0, critical: 0 },
      performance: { avgResponseTime: dbResponse, slowQueries: 0 },
    },
  };
}

function buildAlerts(
  ready: ApiReadiness,
  health: ApiMaintenanceHealth
): Alert[] {
  const now = new Date();
  const alerts: Alert[] = [];

  for (const [name, check] of Object.entries({ ...ready.error })) {
    alerts.push({
      id: `health-${name}`,
      type: 'critical',
      title: `${name} fora do ar`,
      message: check.message ?? `A verificação de ${name} falhou`,
      timestamp: now,
      resolved: false,
      category: 'performance',
    });
  }

  if ((health.databaseHostDisk?.usedPercent ?? 0) >= 80) {
    alerts.push({
      id: 'disk',
      type:
        (health.databaseHostDisk?.usedPercent ?? 0) >= 95
          ? 'critical'
          : 'warning',
      title: 'Disco do banco quase cheio',
      message: `${health.databaseHostDisk?.usedPercent}% em uso`,
      timestamp: now,
      resolved: false,
      category: 'storage',
    });
  }

  for (const queue of health.queues) {
    if ((queue.counts.failed ?? 0) > 0) {
      alerts.push({
        id: `queue-${queue.queue}`,
        type: 'warning',
        title: `Fila ${queue.queue} com falhas`,
        message: `${queue.counts.failed} job(s) falharam`,
        timestamp: now,
        resolved: false,
        category: 'performance',
      });
    }
  }

  if (!health.search.allIndexed) {
    alerts.push({
      id: 'search-index',
      type: 'warning',
      title: 'Busca sem índice de texto',
      message: 'Alguma coleção de busca está sem o índice de texto',
      timestamp: now,
      resolved: false,
      category: 'performance',
    });
  }

  return alerts;
}

async function loadSystemState() {
  const [ready, health] = await Promise.all([
    getReadiness(),
    getMaintenanceHealth(),
  ]);
  return {
    ready,
    health,
    metrics: buildMetrics(ready, health),
    alerts: buildAlerts(ready, health),
  };
}

/**
 * Monitoramento do sistema. Uma consulta só (prontidão + saúde), guardada
 * pelo TanStack Query e revalidada no intervalo escolhido na tela — sem o
 * `setInterval` que corria mesmo com a aba escondida.
 */
export const useSystemMonitoring = (): UseSystemMonitoringReturn => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  const system = useAdminQuery(adminKeys.area('system'), loadSystemState, {
    refetchInterval:
      autoRefresh && refreshInterval > 0 ? refreshInterval * 1000 : false,
  });

  const metrics = system.data?.metrics ?? null;
  const alerts = system.data?.alerts ?? [];

  // A API invalida o cache na escrita; não há limpeza manual.
  const clearCache = useCallback(async () => {
    toast.error(
      'A API invalida o cache sozinha, a cada escrita; não há limpeza manual.'
    );
  }, []);

  const getDetailedStats = useCallback(async () => {
    try {
      return system.data?.health ?? (await getMaintenanceHealth());
    } catch (error) {
      console.error('Erro ao obter estatísticas detalhadas:', error);
      return null;
    }
  }, [system.data]);

  const getHealthStatus = useCallback(():
    | 'healthy'
    | 'warning'
    | 'critical' => {
    if (!metrics) return 'warning';
    if (alerts.some((alert) => alert.type === 'critical' && !alert.resolved))
      return 'critical';
    if (alerts.some((alert) => !alert.resolved)) return 'warning';
    return 'healthy';
  }, [metrics, alerts]);

  const getActiveAlerts = useCallback(
    (): Alert[] => alerts.filter((alert) => !alert.resolved),
    [alerts]
  );

  const getCriticalAlerts = useCallback(
    (): Alert[] =>
      alerts.filter((alert) => alert.type === 'critical' && !alert.resolved),
    [alerts]
  );

  const formatUptime = useCallback((seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, []);

  const formatBytes = useCallback(
    (bytes: number): string => formatSize(bytes),
    []
  );

  const formatPercentage = useCallback(
    (value: number): string => `${value.toFixed(1)}%`,
    []
  );

  return {
    metrics,
    alerts,
    logs: [],
    loading: system.loading,
    error: system.error,
    lastUpdated: system.updatedAt,
    isConnected: system.data?.ready.status === 'ok',
    autoRefresh,
    refreshInterval,
    refreshMetrics: system.refetch,
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

// Estado do sistema em intervalo curto (30 s: a medida do banco não é leve).
// Divide a consulta com o painel acima: a chave é a mesma, então é uma
// chamada só, não duas.
export const useRealTimeStats = () => {
  const system = useAdminQuery(adminKeys.area('system'), loadSystemState, {
    refetchInterval: 30_000,
  });

  return {
    data: system.data
      ? {
          success: true,
          metrics: system.data.metrics,
          alerts: system.data.alerts,
        }
      : null,
    connected: !system.error && !!system.data,
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
