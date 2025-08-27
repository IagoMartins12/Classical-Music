// app/components/Admin/System/SystemPerformance.tsx
'use client';

import { useState } from 'react';
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
  FiSettings,
  FiTrendingUp,
  FiClock,
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

import toast from 'react-hot-toast';
import {
  AlertUtils,
  LogUtils,
  useSystemMonitoring,
} from '@/app/hooks/admin/useAdminSystemMonitoring';
import LoadingAdminState from '../../Common/LoadingState';
import Modal from '@/app/components/Modal';

export default function SystemPerformance() {
  const {
    metrics,
    logs,
    loading,
    error,
    lastUpdated,
    isConnected,
    autoRefresh,
    refreshInterval,
    refreshMetrics,
    clearCache,
    setAutoRefresh,
    setRefreshInterval,
    getHealthStatus,
    getActiveAlerts,
    getCriticalAlerts,
    formatUptime,
    formatPercentage,
    getDetailedStats,
  } = useSystemMonitoring();

  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [detailedStats, setDetailedStats] = useState<any>(null);

  const healthStatus = getHealthStatus();
  const activeAlerts = getActiveAlerts();
  const criticalAlerts = getCriticalAlerts();

  // Função para obter estatísticas detalhadas
  const handleGetDetailedStats = async () => {
    setShowDetailedStats(true);
    const stats = await getDetailedStats();
    setDetailedStats(stats);
  };

  // Função para exportar dados
  const handleExportData = async () => {
    if (!metrics) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      metrics,
      alerts: activeAlerts,
      logs: logs.slice(0, 100), // Últimos 100 logs
      healthStatus,
      detailedStats,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `system-metrics-${
      new Date().toISOString().split('T')[0]
    }.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success('Dados exportados com sucesso!');
  };

  // Função para obter cor do status de saúde
  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-accent-green bg-accent-green/10 border-accent-green';
      case 'warning':
        return 'text-accent-amber bg-accent-amber/10 border-accent-amber';
      case 'critical':
        return 'text-accent-red bg-accent-red/10 border-accent-red';
      default:
        return 'text-theme-tertiary bg-theme-secondary border-theme-secondary';
    }
  };

  // Função para obter ícone do status
  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5" />;
      case 'critical':
        return <FiAlertTriangle className="w-5 h-5" />;
      default:
        return <FiActivity className="w-5 h-5" />;
    }
  };

  if (error) {
    return (
      <PageContainer showBackground={true}>
        <AnimatedContainer delay={0.1}>
          <div className="text-center py-16">
            <FiAlertTriangle className="w-16 h-16 text-accent-red mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-theme-primary mb-4">
              Erro ao Carregar Métricas
            </h1>
            <p className="text-theme-secondary mb-6">{error}</p>
            <Button onClick={refreshMetrics} variant="primary">
              Tentar Novamente
            </Button>
          </div>
        </AnimatedContainer>
      </PageContainer>
    );
  }

  if (loading && !metrics) {
    return (
      <PageContainer showBackground={true}>
        <LoadingAdminState loadingName="metricas do sistema" />
      </PageContainer>
    );
  }

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

            {/* Status de Saúde */}
            <div className="mt-6 flex items-center justify-center">
              <div
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl border ${getHealthStatusColor(
                  healthStatus
                )}`}
              >
                {getHealthStatusIcon(healthStatus)}
                <span className="font-medium">
                  Sistema:{' '}
                  {healthStatus === 'healthy'
                    ? 'Saudável'
                    : healthStatus === 'warning'
                    ? 'Atenção'
                    : 'Crítico'}
                </span>
              </div>

              {!isConnected && (
                <div className="ml-4 inline-flex items-center space-x-2 px-4 py-2 rounded-xl border border-accent-red bg-accent-red/10 text-accent-red">
                  <FiAlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Desconectado</span>
                </div>
              )}
            </div>
          </div>
        </AnimatedItem>

        {/* Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-4">
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

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<FiTrendingUp />}
                onClick={handleGetDetailedStats}
                disabled={loading}
              >
                Estatísticas
              </Button>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiDownload />}
                onClick={handleExportData}
                disabled={loading || !metrics}
              >
                Exportar
              </Button>

              <Button
                variant="ghost"
                size="sm"
                leftIcon={<FiSettings />}
                onClick={clearCache}
                disabled={loading}
              >
                Limpar Cache
              </Button>

              <Button
                variant="primary"
                size="sm"
                leftIcon={
                  <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                }
                onClick={refreshMetrics}
                disabled={loading}
              >
                {loading ? 'Carregando...' : 'Atualizar'}
              </Button>
            </div>
          </div>
        </AnimatedItem>

        {/* Última Atualização */}
        {lastUpdated && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="text-center mb-6">
              <p className="text-sm text-theme-tertiary flex items-center justify-center space-x-2">
                <FiClock className="w-4 h-4" />
                <span>
                  Última atualização: {lastUpdated.toLocaleString('pt-BR')}
                </span>
              </p>
            </div>
          </AnimatedItem>
        )}

        {/* System Status Overview */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="CPU Usage"
              value={
                metrics ? formatPercentage(metrics.server.cpu.usage) : 'N/A'
              }
              change={{
                value: metrics
                  ? metrics.server.cpu.usage > 70
                    ? 5.2
                    : -2.3
                  : 0,
                isPositive: metrics ? metrics.server.cpu.usage <= 70 : true,
              }}
              icon={FiCpu}
              color={
                metrics && metrics.server.cpu.usage > 80 ? '#EF4444' : '#F59E0B'
              }
              subtitle={metrics ? `${metrics.server.cpu.cores} cores` : ''}
            />

            <MetricCard
              title="Memory Usage"
              value={
                metrics
                  ? formatPercentage(metrics.server.memory.percentage)
                  : 'N/A'
              }
              change={{
                value: metrics
                  ? metrics.server.memory.percentage > 80
                    ? 3.1
                    : -1.2
                  : 0,
                isPositive: metrics
                  ? metrics.server.memory.percentage <= 80
                  : true,
              }}
              icon={FiHardDrive}
              color={
                metrics && metrics.server.memory.percentage > 90
                  ? '#EF4444'
                  : '#3B82F6'
              }
              subtitle={
                metrics
                  ? `${metrics.server.memory.used}GB / ${metrics.server.memory.total}GB`
                  : ''
              }
            />

            <MetricCard
              title="Response Time"
              value={
                metrics
                  ? `${metrics.application.performance.avgResponseTime}ms`
                  : 'N/A'
              }
              change={{
                value: metrics
                  ? metrics.application.performance.avgResponseTime > 1000
                    ? 15.4
                    : -8.4
                  : 0,
                isPositive: metrics
                  ? metrics.application.performance.avgResponseTime <= 1000
                  : true,
              }}
              icon={FiZap}
              color="#8B5CF6"
              subtitle="Tempo médio"
            />

            <MetricCard
              title="Active Users"
              value={
                metrics
                  ? metrics.application.users.concurrent.toString()
                  : 'N/A'
              }
              change={{
                value: metrics ? 12.5 : 0,
                isPositive: true,
              }}
              icon={FiUsers}
              color="#10B981"
              subtitle={
                metrics ? `${metrics.application.users.active} hoje` : ''
              }
            />
          </div>
        </AnimatedItem>

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="mb-8">
              <AnimatedCard className="classical-card p-6 border-l-4 border-accent-red">
                <div className="flex items-center space-x-3 mb-4">
                  <FiAlertTriangle className="w-6 h-6 text-accent-red" />
                  <h3 className="text-xl font-bold text-theme-primary">
                    Alertas Críticos ({criticalAlerts.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {criticalAlerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 bg-accent-red/10 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-accent-red rounded-full animate-pulse" />
                        <div>
                          <h4 className="font-medium text-theme-primary">
                            {alert.title}
                          </h4>
                          <p className="text-sm text-theme-secondary">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-theme-tertiary">
                        {AlertUtils.formatAlertTime(alert.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedCard>
            </div>
          </AnimatedItem>
        )}

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
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-accent-amber">
                      {metrics
                        ? formatPercentage(metrics.server.cpu.usage)
                        : 'N/A'}
                    </span>
                    {metrics?.server.cpu.temperature && (
                      <span className="text-xs text-theme-tertiary">
                        {metrics.server.cpu.temperature}°C
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-theme-secondary h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-theme-elevated rounded-full transition-all duration-1000"
                    style={{ width: `${metrics?.server.cpu.usage || 0}%` }}
                  />
                </div>
                <div className="text-xs text-theme-tertiary mt-1">
                  {metrics?.server.cpu.cores} cores • Load:{' '}
                  {metrics?.server.cpu.load.map((l) => l.toFixed(1)).join(', ')}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-theme-primary">
                    Memory
                  </span>
                  <span className="text-sm font-bold text-accent-blue">
                    {metrics
                      ? `${metrics.server.memory.used}GB / ${metrics.server.memory.total}GB`
                      : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-theme-secondary h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-theme-elevated rounded-full transition-all duration-1000"
                    style={{
                      width: `${metrics?.server.memory.percentage || 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-theme-primary">
                    Disk Space
                  </span>
                  <span className="text-sm font-bold text-accent-green">
                    {metrics
                      ? `${metrics.server.disk.used}GB / ${metrics.server.disk.total}GB`
                      : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-theme-secondary h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-theme-elevated  rounded-full transition-all duration-1000"
                    style={{
                      width: `${metrics?.server.disk.percentage || 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-theme-secondary">
                <div className="text-center">
                  <div className="text-lg font-bold text-accent-purple">
                    {metrics ? formatUptime(metrics.server.uptime) : 'N/A'}
                  </div>
                  <div className="text-xs text-theme-tertiary">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-accent-blue">
                    {metrics?.server.processes || 0}
                  </div>
                  <div className="text-xs text-theme-tertiary">Processes</div>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-theme-secondary">
                <div className="text-sm text-theme-tertiary">
                  {metrics?.server.platform} • {metrics?.server.hostname}
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
                    {metrics?.database.connections.active || 0}
                  </div>
                  <div className="text-xs text-theme-tertiary">
                    Conexões Ativas
                  </div>
                </div>
                <div className="text-center p-3 bg-theme-secondary rounded-xl">
                  <div className="text-lg font-bold text-accent-green">
                    {metrics?.database.queries.average.toFixed(1) || 0}ms
                  </div>
                  <div className="text-xs text-theme-tertiary">Query Média</div>
                </div>
                <div className="text-center p-3 bg-theme-secondary rounded-xl">
                  <div className="text-lg font-bold text-accent-amber">
                    {metrics?.database.queries.slow || 0}
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
                    {metrics?.database.size.total || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                  <span className="text-sm text-theme-primary">
                    Collections
                  </span>
                  <span className="font-medium text-theme-primary">
                    {metrics?.database.size.tables || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                  <span className="text-sm text-theme-primary">
                    Cache Hit Rate
                  </span>
                  <span className="font-medium text-theme-primary">
                    {metrics?.database.cache.hitRatio.toFixed(1) || 0}%
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-theme-secondary">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold text-accent-green">
                      {metrics?.database.performance.reads || 0}
                    </div>
                    <div className="text-xs text-theme-tertiary">Reads/min</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-accent-blue">
                      {metrics?.database.performance.writes || 0}
                    </div>
                    <div className="text-xs text-theme-tertiary">
                      Writes/min
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-accent-red">
                      {metrics?.database.performance.locks || 0}
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
              {activeAlerts.length > 0 && (
                <span className="bg-accent-red text-white text-xs px-2 py-1 rounded-full">
                  {activeAlerts.length}
                </span>
              )}
            </h3>

            <div className="space-y-3">
              {activeAlerts.length === 0 ? (
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
                activeAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border-l-4 rounded-xl ${AlertUtils.getAlertColor(
                      alert.type
                    )}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-lg">
                        {AlertUtils.getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-theme-primary">
                          {alert.title}
                        </h4>
                        <p className="text-sm text-theme-secondary mt-1">
                          {alert.message}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-theme-tertiary">
                          <span>
                            {AlertUtils.formatAlertTime(alert.timestamp)}
                          </span>
                          <span className="capitalize">{alert.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {activeAlerts.length > 5 && (
              <div className="text-center mt-4">
                <Button variant="ghost" size="sm">
                  Ver Mais {activeAlerts.length - 5} Alertas
                </Button>
              </div>
            )}
          </AnimatedCard>

          {/* Recent Logs */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
              <FiFileText className="w-5 h-5 text-accent-blue" />
              <span>Logs Recentes</span>
            </h3>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-center py-6">
                  <FiFileText className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                  <p className="text-theme-primary font-medium">
                    Nenhum log disponível
                  </p>
                </div>
              ) : (
                logs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-theme-secondary rounded-xl"
                  >
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
                            className={`text-xs font-medium uppercase tracking-wider ${LogUtils.getLogLevelColor(
                              log.level
                            )}`}
                          >
                            {log.level}
                          </span>
                          <span className="text-xs text-theme-tertiary">
                            {log.service}
                          </span>
                          <span className="text-xs text-theme-tertiary">
                            {LogUtils.formatLogTime(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-theme-primary">
                          {log.message}
                        </p>
                        {log.details && (
                          <details className="mt-2">
                            <summary className="text-xs text-theme-tertiary cursor-pointer hover:text-theme-primary">
                              Ver detalhes
                            </summary>
                            <pre className="text-xs text-theme-tertiary mt-1 font-mono bg-theme-primary/5 p-2 rounded">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button variant="ghost" size="sm" className="w-full mt-4">
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
                  {metrics?.network.requests.current || 0}
                </div>
                <div className="text-sm text-theme-tertiary">Requests/min</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">
                    Latência P50
                  </span>
                  <span className="font-medium text-accent-green">
                    {metrics?.network.latency.p50 || 0}ms
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">
                    Latência P95
                  </span>
                  <span className="font-medium text-accent-amber">
                    {metrics?.network.latency.p95 || 0}ms
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">Error Rate</span>
                  <span className="font-medium text-accent-red">
                    {metrics?.network.errors.rate.toFixed(2) || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">Bandwidth</span>
                  <span className="font-medium text-accent-blue">
                    {metrics?.network.bandwidth.total.toFixed(1) || 0} Mbps
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">
                    Connections
                  </span>
                  <span className="font-medium text-accent-purple">
                    {metrics?.network.connections || 0}
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
                  {metrics?.cache.application.hitRate.toFixed(1) || 0}%
                </div>
                <div className="text-sm text-theme-tertiary">Hit Rate</div>
              </div>

              <div className="space-y-3">
                {metrics?.cache.redis && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-theme-primary">
                        Redis Memory
                      </span>
                      <span className="font-medium text-accent-blue">
                        {metrics.cache.redis.memory}MB
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-theme-primary">
                        Redis Hit Rate
                      </span>
                      <span className="font-medium text-accent-green">
                        {metrics.cache.redis.ratio.toFixed(1)}%
                      </span>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">App Cache</span>
                  <span className="font-medium text-accent-purple">
                    {metrics?.cache.application.size.toFixed(1) || 0}MB
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">Entries</span>
                  <span className="font-medium text-accent-blue">
                    {metrics?.cache.application.entries.toLocaleString() || 0}
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
                    {metrics?.application.users.concurrent || 0}
                  </div>
                  <div className="text-xs text-theme-tertiary">Online</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">
                    Uploads Hoje
                  </span>
                  <span className="font-medium text-accent-purple">
                    {metrics?.application.features.uploads || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">Anotações</span>
                  <span className="font-medium text-accent-blue">
                    {metrics?.application.features.annotations || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">
                    Taxa de Erro
                  </span>
                  <span className="font-medium text-accent-red">
                    {metrics?.application.errors.rate.toFixed(2) || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-primary">Resp. Time</span>
                  <span className="font-medium text-accent-amber">
                    {metrics?.application.performance.avgResponseTime || 0}ms
                  </span>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Detailed Stats Modal */}
        {showDetailedStats && detailedStats && (
          <Modal
            isOpen={showDetailedStats}
            onClose={() => setShowDetailedStats(false)}
            maxWidth="4xl"
          >
            <div className=" rounded-xl p-6 ">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-theme-primary">
                  Estatísticas Detalhadas
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Requests por Status
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(detailedStats.byStatus || {}).map(
                      ([status, count]) => (
                        <div key={status} className="flex justify-between">
                          <span className="text-theme-secondary">{status}</span>
                          <span className="font-medium">{count as string}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Top Endpoints</h3>
                  <div className="space-y-2">
                    {Object.entries(detailedStats.byPath || {})
                      .slice(0, 10)
                      .map(([path, count]) => (
                        <div key={path} className="flex justify-between">
                          <span className="text-theme-secondary truncate">
                            {path}
                          </span>
                          <span className="font-medium">{count as string}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-blue">
                    {detailedStats.total || 0}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Total Requests
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-green">
                    {detailedStats.avgDuration?.toFixed(0) || 0}ms
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Avg Duration
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-red">
                    {detailedStats.slowRequests || 0}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Slow Requests
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
}
