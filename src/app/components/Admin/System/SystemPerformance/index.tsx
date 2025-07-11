// app/components/Admin/System/SystemPerformance.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiServer,
  FiCpu,
  FiHardDrive,
  FiWifi,
  FiDatabase,
  FiActivity,
  FiZap,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiDownload,
  FiUsers,
  FiFileText,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import { MetricCard } from '@/app/components/Admin/Charts/AdminCharts';

interface SystemMetrics {
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

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  category: 'performance' | 'security' | 'storage' | 'network';
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  service: string;
  message: string;
  details?: any;
}

export default function SystemPerformance() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [loading, setLoading] = useState(false);

  // Mock data para demonstração
  const mockMetrics: SystemMetrics = {
    server: {
      cpu: { usage: 34.7, cores: 8, load: [1.2, 1.5, 1.8] },
      memory: { used: 6.2, total: 16, percentage: 38.75 },
      disk: { used: 145.6, total: 500, percentage: 29.12 },
      uptime: 2847200, // seconds (33 days)
      processes: 127,
    },
    database: {
      connections: { active: 23, max: 100, percentage: 23 },
      queries: { slow: 12, average: 45.2, total: 15847 },
      size: { tables: 28, indexes: 156, total: '2.4 GB' },
      performance: { reads: 1247, writes: 345, locks: 2 },
    },
    cache: {
      redis: { memory: 512, hits: 8967, misses: 234, ratio: 97.5 },
      application: { size: 1.2, entries: 5634, hitRate: 89.3 },
      cdn: { requests: 45782, bandwidth: '234 GB', hitRate: 92.1 },
    },
    network: {
      requests: { current: 156, peak: 892, avg: 234 },
      bandwidth: { incoming: 45.7, outgoing: 23.4, total: 69.1 },
      errors: {
        rate: 0.02,
        total: 45,
        codes: { '404': 23, '500': 12, '503': 8, '429': 2 },
      },
      latency: { p50: 125, p95: 456, p99: 789 },
    },
    application: {
      users: { active: 2847, peak: 4521, concurrent: 567 },
      sessions: { total: 15634, avg_duration: 24.5, bounce_rate: 23.4 },
      features: { uploads: 234, annotations: 567, studies: 1234 },
      errors: { count: 23, rate: 0.01, critical: 2 },
    },
  };

  const mockAlerts: Alert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'Alto Uso de CPU',
      message: 'Uso de CPU está acima de 80% nos últimos 15 minutos',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      resolved: false,
      category: 'performance',
    },
    {
      id: '2',
      type: 'critical',
      title: 'Erro de Conexão com Database',
      message: 'Falha na conexão com o banco de dados principal',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      resolved: true,
      category: 'storage',
    },
    {
      id: '3',
      type: 'info',
      title: 'Backup Concluído',
      message: 'Backup automático concluído com sucesso',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      resolved: true,
      category: 'storage',
    },
  ];

  const mockLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      level: 'error',
      service: 'api',
      message: 'Failed to process upload request',
      details: { userId: 'user123', fileSize: '2.4MB', error: 'DISK_FULL' },
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      level: 'warn',
      service: 'cache',
      message: 'Redis memory usage above 90%',
      details: { usage: '463MB', total: '512MB' },
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      level: 'info',
      service: 'auth',
      message: 'User login successful',
      details: { userId: 'user456', ip: '192.168.1.100' },
    },
  ];

  useEffect(() => {
    setMetrics(mockMetrics);
    setAlerts(mockAlerts);
    setLogs(mockLogs);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing metrics...');
      // Simular atualização de métricas
      setMetrics((prev) => ({
        ...prev!,
        server: {
          ...prev!.server,
          cpu: { ...prev!.server.cpu, usage: Math.random() * 100 },
          memory: { ...prev!.server.memory, percentage: Math.random() * 100 },
        },
      }));
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getAlertColor = (type: string) => {
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
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return FiAlertTriangle;
      case 'warning':
        return FiAlertTriangle;
      case 'info':
        return FiCheckCircle;
      default:
        return FiCheckCircle;
    }
  };

  const getLogLevelColor = (level: string) => {
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
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiServer className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Sistema & Performance
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Monitoramento em tempo real da infraestrutura
            </p>
          </div>
        </AnimatedItem>

        {/* Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center space-x-4">
              <Select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                options={[
                  { value: '5m', label: 'Últimos 5 min' },
                  { value: '1h', label: 'Última hora' },
                  { value: '24h', label: 'Últimas 24h' },
                  { value: '7d', label: 'Últimos 7 dias' },
                ]}
                className="input-classical-2"
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-brand-primary bg-theme-secondary border-theme-primary rounded focus:ring-brand-primary focus:ring-2"
                />
                <label
                  htmlFor="autoRefresh"
                  className="text-sm text-theme-primary"
                >
                  Auto-refresh
                </label>
              </div>

              <Select
                value={refreshInterval.toString()}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                options={[
                  { value: '10', label: '10s' },
                  { value: '30', label: '30s' },
                  { value: '60', label: '1min' },
                  { value: '300', label: '5min' },
                ]}
                className="input-classical-2"
                disabled={!autoRefresh}
              />
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="sm" leftIcon={<FiDownload />}>
                Exportar Logs
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FiRefreshCw />}
                onClick={() => setLoading(!loading)}
              >
                Atualizar
              </Button>
            </div>
          </div>
        </AnimatedItem>

        {/* System Status Overview */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="CPU Usage"
              value={`${metrics?.server.cpu.usage.toFixed(1)}%`}
              change={{ value: 2.3, isPositive: false }}
              icon={FiCpu}
              color="#F59E0B"
            />

            <MetricCard
              title="Memory Usage"
              value={`${metrics?.server.memory.percentage.toFixed(1)}%`}
              change={{ value: -1.2, isPositive: true }}
              icon={FiHardDrive}
              color="#3B82F6"
            />

            <MetricCard
              title="Active Users"
              value={metrics?.application.users.active || 0}
              change={{ value: 15.7, isPositive: true }}
              icon={FiUsers}
              color="#10B981"
            />

            <MetricCard
              title="Response Time"
              value={`${metrics?.network.latency.p50}ms`}
              change={{ value: -8.4, isPositive: true }}
              icon={FiZap}
              color="#8B5CF6"
            />
          </div>
        </AnimatedItem>

        {/* Resource Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Server Resources */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
              <FiServer className="w-5 h-5 text-accent-green" />
              <span>Recursos do Servidor</span>
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-theme-primary">
                    CPU Usage
                  </span>
                  <span className="text-sm font-bold text-accent-amber">
                    {metrics?.server.cpu.usage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-theme-secondary h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-amber to-accent-red rounded-full transition-all duration-1000"
                    style={{ width: `${metrics?.server.cpu.usage}%` }}
                  />
                </div>
                <div className="text-xs text-theme-tertiary mt-1">
                  {metrics?.server.cpu.cores} cores • Load:{' '}
                  {metrics?.server.cpu.load.join(', ')}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-theme-primary">
                    Memory
                  </span>
                  <span className="text-sm font-bold text-accent-blue">
                    {metrics?.server.memory.used}GB /{' '}
                    {metrics?.server.memory.total}GB
                  </span>
                </div>
                <div className="w-full bg-theme-secondary h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full transition-all duration-1000"
                    style={{ width: `${metrics?.server.memory.percentage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-theme-primary">
                    Disk Space
                  </span>
                  <span className="text-sm font-bold text-accent-green">
                    {metrics?.server.disk.used}GB / {metrics?.server.disk.total}
                    GB
                  </span>
                </div>
                <div className="w-full bg-theme-secondary h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-green to-accent-blue rounded-full transition-all duration-1000"
                    style={{ width: `${metrics?.server.disk.percentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-theme-secondary">
                <div className="text-center">
                  <div className="text-lg font-bold text-accent-purple">
                    {formatUptime(metrics?.server.uptime || 0)}
                  </div>
                  <div className="text-xs text-theme-tertiary">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-accent-blue">
                    {metrics?.server.processes}
                  </div>
                  <div className="text-xs text-theme-tertiary">Processes</div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Database Performance */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
              <FiDatabase className="w-5 h-5 text-accent-blue" />
              <span>Performance da Database</span>
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-theme-secondary rounded-xl">
                  <div className="text-lg font-bold text-accent-blue">
                    {metrics?.database.connections.active}
                  </div>
                  <div className="text-xs text-theme-tertiary">
                    Conexões Ativas
                  </div>
                </div>
                <div className="text-center p-3 bg-theme-secondary rounded-xl">
                  <div className="text-lg font-bold text-accent-green">
                    {metrics?.database.queries.average.toFixed(1)}ms
                  </div>
                  <div className="text-xs text-theme-tertiary">Query Média</div>
                </div>
                <div className="text-center p-3 bg-theme-secondary rounded-xl">
                  <div className="text-lg font-bold text-accent-amber">
                    {metrics?.database.queries.slow}
                  </div>
                  <div className="text-xs text-theme-tertiary">
                    Queries Lentas
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                  <span className="text-sm text-theme-primary">
                    Database Size
                  </span>
                  <span className="font-medium text-theme-primary">
                    {metrics?.database.size.total}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                  <span className="text-sm text-theme-primary">Tables</span>
                  <span className="font-medium text-theme-primary">
                    {metrics?.database.size.tables}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                  <span className="text-sm text-theme-primary">Indexes</span>
                  <span className="font-medium text-theme-primary">
                    {metrics?.database.size.indexes}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-theme-secondary">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold text-accent-green">
                      {metrics?.database.performance.reads}
                    </div>
                    <div className="text-xs text-theme-tertiary">Reads/min</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-accent-blue">
                      {metrics?.database.performance.writes}
                    </div>
                    <div className="text-xs text-theme-tertiary">
                      Writes/min
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-accent-red">
                      {metrics?.database.performance.locks}
                    </div>
                    <div className="text-xs text-theme-tertiary">Locks</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Alerts and Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* System Alerts */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
              <FiAlertTriangle className="w-5 h-5 text-accent-red" />
              <span>Alertas do Sistema</span>
            </h3>

            <div className="space-y-3">
              {alerts.filter((a) => !a.resolved).length === 0 ? (
                <div className="text-center py-6">
                  <FiCheckCircle className="w-8 h-8 text-accent-green mx-auto mb-2" />
                  <p className="text-theme-primary font-medium">
                    Nenhum alerta ativo
                  </p>
                  <p className="text-sm text-theme-tertiary">
                    Sistema funcionando normalmente
                  </p>
                </div>
              ) : (
                alerts
                  .filter((a) => !a.resolved)
                  .slice(0, 5)
                  .map((alert) => {
                    const AlertIcon = getAlertIcon(alert.type);
                    return (
                      <div
                        key={alert.id}
                        className={`p-4 border-l-4 rounded-xl ${getAlertColor(
                          alert.type
                        )}`}
                      >
                        <div className="flex items-start space-x-3">
                          <AlertIcon className="w-5 h-5 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-theme-primary">
                              {alert.title}
                            </h4>
                            <p className="text-sm text-theme-secondary mt-1">
                              {alert.message}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-theme-tertiary">
                              <span>
                                {new Date(alert.timestamp).toLocaleString(
                                  'pt-BR'
                                )}
                              </span>
                              <span className="capitalize">
                                {alert.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4"
              onClick={() => console.log('Ver todos os alertas')}
            >
              Ver Todos os Alertas
            </Button>
          </AnimatedCard>

          {/* Recent Logs */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
              <FiFileText className="w-5 h-5 text-accent-blue" />
              <span>Logs Recentes</span>
            </h3>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="p-3 bg-theme-secondary rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        log.level === 'error'
                          ? 'bg-accent-red'
                          : log.level === 'warn'
                          ? 'bg-accent-amber'
                          : log.level === 'info'
                          ? 'bg-accent-blue'
                          : 'bg-theme-tertiary'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span
                          className={`text-xs font-medium uppercase tracking-wider ${getLogLevelColor(
                            log.level
                          )}`}
                        >
                          {log.level}
                        </span>
                        <span className="text-xs text-theme-tertiary">
                          {log.service}
                        </span>
                        <span className="text-xs text-theme-tertiary">
                          {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-theme-primary">
                        {log.message}
                      </p>
                      {log.details && (
                        <pre className="text-xs text-theme-tertiary mt-1 font-mono">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4"
              onClick={() => console.log('Ver todos os logs')}
            >
              Ver Logs Completos
            </Button>
          </AnimatedCard>
        </div>

        {/* Network and Application Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Network Performance */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
              <FiWifi className="w-5 h-5 text-accent-purple" />
              <span>Rede</span>
            </h3>

            <div className="space-y-4">
              <div className="text-center p-3 bg-theme-secondary rounded-xl">
                <div className="text-2xl font-bold text-accent-purple">
                  {metrics?.network.requests.current}
                </div>
                <div className="text-sm text-theme-tertiary">Requests/min</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">
                    Latência P50
                  </span>
                  <span className="font-medium text-accent-green">
                    {metrics?.network.latency.p50}ms
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">
                    Latência P95
                  </span>
                  <span className="font-medium text-accent-amber">
                    {metrics?.network.latency.p95}ms
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">Error Rate</span>
                  <span className="font-medium text-accent-red">
                    {(metrics?.network.errors.rate ?? 0 * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">Bandwidth</span>
                  <span className="font-medium text-accent-blue">
                    {metrics?.network.bandwidth.total} Mbps
                  </span>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Cache Performance */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
              <FiZap className="w-5 h-5 text-accent-green" />
              <span>Cache</span>
            </h3>

            <div className="space-y-4">
              <div className="text-center p-3 bg-theme-secondary rounded-xl">
                <div className="text-2xl font-bold text-accent-green">
                  {metrics?.cache.redis.ratio.toFixed(1)}%
                </div>
                <div className="text-sm text-theme-tertiary">Hit Rate</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">
                    Redis Memory
                  </span>
                  <span className="font-medium text-accent-blue">
                    {metrics?.cache.redis.memory}MB
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">App Cache</span>
                  <span className="font-medium text-accent-purple">
                    {metrics?.cache.application.hitRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">
                    CDN Hit Rate
                  </span>
                  <span className="font-medium text-accent-green">
                    {metrics?.cache.cdn.hitRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">
                    CDN Requests
                  </span>
                  <span className="font-medium text-accent-amber">
                    {metrics?.cache.cdn.requests.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Application Stats */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
              <FiActivity className="w-5 h-5 text-accent-amber" />
              <span>Aplicação</span>
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-theme-secondary rounded-lg">
                  <div className="text-lg font-bold text-accent-blue">
                    {metrics?.application.users.concurrent}
                  </div>
                  <div className="text-xs text-theme-tertiary">Online</div>
                </div>
                <div className="text-center p-2 bg-theme-secondary rounded-lg">
                  <div className="text-lg font-bold text-accent-green">
                    {metrics?.application.sessions.avg_duration.toFixed(1)}m
                  </div>
                  <div className="text-xs text-theme-tertiary">
                    Sessão Média
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">
                    Uploads Hoje
                  </span>
                  <span className="font-medium text-accent-purple">
                    {metrics?.application.features.uploads}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">Anotações</span>
                  <span className="font-medium text-accent-blue">
                    {metrics?.application.features.annotations}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">
                    Sessões de Estudo
                  </span>
                  <span className="font-medium text-accent-green">
                    {metrics?.application.features.studies}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">
                    Taxa de Erro
                  </span>
                  <span className="font-medium text-accent-red">
                    {(metrics?.application.errors.rate ?? 0 * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </AnimatedContainer>
    </PageContainer>
  );
}
