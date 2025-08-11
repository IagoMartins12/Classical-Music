// app/components/Admin/Logs/LogsAudit/index.tsx
'use client';

import { useState } from 'react';
import {
  FiFileText,
  FiShield,
  FiActivity,
  FiUser,
  FiDatabase,
  FiServer,
  FiAlertTriangle,
  FiInfo,
  FiCheckCircle,
  FiX,
  FiDownload,
  FiSearch,
  FiEye,
  FiSettings,
  FiTrash2,
  FiBarChart2,
  FiTarget,
  FiRefreshCw,
  FiFilter,
  FiGlobe,
  FiLock,
  FiZap,
  FiLoader,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import {
  AdminBarChart,
  MetricCard,
} from '@/app/components/Admin/Charts/AdminCharts';
import {
  useAdminLogs,
  TestLoggingResult,
} from '@/app/hooks/admin/useAdminLogs';
import { formatNumber } from '../../Utils';
import toast from 'react-hot-toast';
import { LogCategory, LogLevel } from '@/app/libs/logging/systemLogger';
import LogsCleanup from '../LogsCleanup';

export default function LogsAudit() {
  const {
    logs,
    stats,
    loading,
    error,
    filters,
    pagination,
    setFilters,
    refreshLogs,
    loadMoreLogs,
    exportLogs,
    testLogging,
    getLevelIcon,
    getRelativeTime,
    getLevelColor,
    getCategoryIcon,
    formatDuration,
  } = useAdminLogs();

  const [activeTab, setActiveTab] = useState('logs');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [showCleanup, setShowCleanup] = useState(false);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);

  const handleExportLogs = async (format: 'csv' | 'json') => {
    try {
      await exportLogs(format);
      toast.success(`Logs exportados em formato ${format.toUpperCase()}!`);
      setBulkActionOpen(false);
    } catch {
      toast.error('Erro ao exportar logs');
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshLogs();
      toast.success('Logs atualizados com sucesso!');
    } catch {
      toast.error('Erro ao atualizar logs');
    }
  };

  const handleTestLogging = async () => {
    try {
      const result: TestLoggingResult = await testLogging();
      toast.success(`Log de teste criado! Trace ID: ${result.traceId}`);
    } catch {
      toast.error('Erro ao criar log de teste');
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      FiAlertTriangle,
      FiInfo,
      FiSettings,
      FiActivity,
      FiCheckCircle,
      FiServer,
      FiShield,
      FiFileText,
      FiUser,
      FiDatabase,
      FiGlobe,
      FiLock,
      FiZap,
    };
    return iconMap[iconName] || FiInfo;
  };

  const renderSystemLogs = () => (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-theme-secondary rounded-xl">
        <div className="relative flex-1 min-w-64">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar nos logs..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="input-classical-2 pl-10 w-full"
          />
        </div>

        <Select
          value={filters.level || 'all'}
          onChange={(e) =>
            setFilters({
              level:
                e.target.value === 'all'
                  ? undefined
                  : (e.target.value as LogLevel),
            })
          }
          options={[
            { value: 'all', label: 'Todos os Níveis' },
            { value: LogLevel.ERROR, label: 'Errors' },
            { value: LogLevel.WARN, label: 'Warnings' },
            { value: LogLevel.INFO, label: 'Info' },
            { value: LogLevel.DEBUG, label: 'Debug' },
            { value: LogLevel.TRACE, label: 'Trace' },
          ]}
          className="input-classical-2 min-w-40"
        />

        <Select
          value={filters.category || 'all'}
          onChange={(e) =>
            setFilters({
              category:
                e.target.value === 'all'
                  ? undefined
                  : (e.target.value as LogCategory),
            })
          }
          options={[
            { value: 'all', label: 'Todas as Categorias' },
            { value: LogCategory.API, label: 'API' },
            { value: LogCategory.DATABASE, label: 'Database' },
            { value: LogCategory.AUTH, label: 'Auth' },
            { value: LogCategory.SECURITY, label: 'Security' },
            { value: LogCategory.PERFORMANCE, label: 'Performance' },
            { value: LogCategory.ADMIN, label: 'Admin' },
            { value: LogCategory.SYSTEM, label: 'System' },
            { value: LogCategory.AUDIT, label: 'Audit' },
          ]}
          className="input-classical-2 min-w-48"
        />

        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => setFilters({ dateFrom: e.target.value })}
            className="input-classical-2"
          />
          <span className="text-theme-tertiary">até</span>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => setFilters({ dateTo: e.target.value })}
            className="input-classical-2"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<FiRefreshCw className={loading ? 'animate-spin' : ''} />}
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Atualizando...' : 'Atualizar'}
          </Button>

          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FiDownload />}
              onClick={() => setBulkActionOpen(!bulkActionOpen)}
            >
              Exportar
            </Button>

            {bulkActionOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-theme-elevated border border-theme-secondary rounded-xl shadow-lg z-10">
                <div className="p-2">
                  <button
                    onClick={() => handleExportLogs('csv')}
                    className="w-full text-left px-3 py-2 text-sm text-theme-primary hover:bg-theme-secondary rounded-lg"
                  >
                    Exportar como CSV
                  </button>
                  <button
                    onClick={() => handleExportLogs('json')}
                    className="w-full text-left px-3 py-2 text-sm text-theme-primary hover:bg-theme-secondary rounded-lg"
                  >
                    Exportar como JSON
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FiTrash2 />}
            onClick={() => setShowCleanup(true)}
          >
            Gerenciar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            leftIcon={<FiSettings />}
            onClick={handleTestLogging}
          >
            Teste
          </Button>
        </div>
      </div>

      {/* Info da busca */}
      {(filters.search ||
        filters.level ||
        filters.category ||
        filters.dateFrom ||
        filters.dateTo) && (
        <div className="flex items-center justify-between p-3 bg-accent-blue/10 border border-accent-blue rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-accent-blue">
            <FiFilter className="w-4 h-4" />
            <span>
              Filtros ativos:{' '}
              {[
                filters.search && `"${filters.search}"`,
                filters.level && filters.level,
                filters.category && filters.category,
                (filters.dateFrom || filters.dateTo) && 'período',
              ]
                .filter(Boolean)
                .join(', ')}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({})}
            leftIcon={<FiX />}
          >
            Limpar Filtros
          </Button>
        </div>
      )}

      {/* Lista de Logs */}
      {loading && logs.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-theme-primary font-medium mt-4">
              Carregando logs...
            </p>
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <FiFileText className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-theme-primary mb-2">
            Nenhum log encontrado
          </h3>
          <p className="text-theme-secondary">
            Ajuste os filtros para encontrar os logs desejados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const LevelIcon = getIconComponent(getLevelIcon(log.level));
            const CategoryIcon = getIconComponent(
              getCategoryIcon(log.category)
            );

            return (
              <div
                key={log.id}
                className="p-4 bg-theme-secondary rounded-xl hover:bg-theme-primary/50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getLevelColor(
                      log.level
                    )}`}
                  >
                    <LevelIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(
                          log.level
                        )}`}
                      >
                        {log.level}
                      </span>
                      <span className="text-xs text-theme-tertiary flex items-center space-x-1">
                        <CategoryIcon className="w-3 h-3" />
                        <span>{log.category}</span>
                      </span>
                      {log.method && log.path && (
                        <span className="text-xs text-theme-tertiary">
                          {log.method} {log.path}
                        </span>
                      )}
                      <span className="text-xs text-theme-tertiary">
                        {getRelativeTime(log.timestamp)}
                      </span>
                      {log.traceId && (
                        <span className="text-xs text-theme-tertiary font-mono bg-theme-primary px-1 rounded">
                          {log.traceId.slice(0, 8)}
                        </span>
                      )}
                    </div>

                    <p className="text-theme-primary font-medium mb-2">
                      {log.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-theme-secondary">
                      {log.userName && <span>Usuário: {log.userName}</span>}
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      {log.statusCode && (
                        <span
                          className={
                            log.statusCode >= 400
                              ? 'text-accent-red'
                              : log.statusCode >= 300
                              ? 'text-accent-amber'
                              : 'text-accent-green'
                          }
                        >
                          Status: {log.statusCode}
                        </span>
                      )}
                      {log.duration && (
                        <span
                          className={
                            log.duration > 5000
                              ? 'text-accent-red'
                              : log.duration > 1000
                              ? 'text-accent-amber'
                              : 'text-theme-secondary'
                          }
                        >
                          {formatDuration(log.duration)}
                        </span>
                      )}
                      {log.query && (
                        <span className="text-theme-tertiary">
                          DB: {log.query.model}.{log.query.operation}
                        </span>
                      )}
                    </div>

                    {(log.error || log.metadata || log.query) &&
                      showDetails === log.id && (
                        <div className="mt-3 p-3 bg-theme-primary rounded-lg space-y-2">
                          {log.error && (
                            <div>
                              <p className="text-xs font-medium text-accent-red mb-1">
                                Erro:
                              </p>
                              <pre className="text-xs text-theme-secondary font-mono overflow-x-auto whitespace-pre-wrap">
                                {log.error.message}
                                {log.error.stack && (
                                  <details className="mt-2">
                                    <summary className="cursor-pointer text-accent-blue">
                                      Stack Trace
                                    </summary>
                                    <pre className="mt-1 text-xs">
                                      {log.error.stack}
                                    </pre>
                                  </details>
                                )}
                              </pre>
                            </div>
                          )}

                          {log.query && (
                            <div>
                              <p className="text-xs font-medium text-accent-blue mb-1">
                                Query:
                              </p>
                              <pre className="text-xs text-theme-secondary font-mono overflow-x-auto">
                                {JSON.stringify(log.query, null, 2)}
                              </pre>
                            </div>
                          )}

                          {log.metadata && (
                            <div>
                              <p className="text-xs font-medium text-theme-primary mb-1">
                                Metadata:
                              </p>
                              <pre className="text-xs text-theme-secondary font-mono overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<FiEye />}
                      onClick={() =>
                        setShowDetails(showDetails === log.id ? null : log.id)
                      }
                    >
                      {showDetails === log.id ? 'Ocultar' : 'Detalhes'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Load More Button */}
          {pagination.hasMore && (
            <div className="text-center pt-6">
              <Button
                variant="secondary"
                onClick={loadMoreLogs}
                disabled={loading}
                leftIcon={
                  loading ? <FiLoader className="animate-spin" /> : undefined
                }
              >
                {loading
                  ? 'Carregando...'
                  : `Carregar mais logs (${
                      pagination.total - logs.length
                    } restantes)`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderStatistics = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-theme-primary">
        Estatísticas dos Logs
      </h3>

      {!stats ? (
        <div className="text-center flex flex-col gap-2 items-center py-12">
          <LoadingSpinner size="lg" />
          <p className="text-theme-primary font-medium mt-4">
            Calculando estatísticas...
          </p>
        </div>
      ) : (
        <>
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total de Logs"
              value={formatNumber(stats.overview.totalLogs)}
              change={{ value: 15.2, isPositive: true }}
              icon={FiFileText}
              color="#3B82F6"
            />

            <MetricCard
              title="Taxa de Erro"
              value={`${stats.overview.errorRate.toFixed(1)}%`}
              change={{ value: -2.3, isPositive: true }}
              icon={FiAlertTriangle}
              color="#F59E0B"
            />

            <MetricCard
              title="Tempo Médio"
              value={formatDuration(stats.overview.avgDuration)}
              change={{ value: -12.1, isPositive: true }}
              icon={FiActivity}
              color="#8B5CF6"
            />

            <MetricCard
              title="Queries Lentas"
              value={formatNumber(stats.overview.slowQueries)}
              change={{ value: 8.7, isPositive: false }}
              icon={FiDatabase}
              color="#EF4444"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnimatedCard className="classical-card p-6">
              <AdminBarChart
                data={Object.entries(stats.overview.byLevel).map(
                  ([level, count]) => ({
                    name: level,
                    value: count,
                  })
                )}
                title="Logs por Nível"
                subtitle="Distribuição dos logs por severidade"
                color="#3B82F6"
                height={300}
              />
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6">
              <AdminBarChart
                data={Object.entries(stats.overview.byCategory).map(
                  ([category, count]) => ({
                    name: category,
                    value: count,
                  })
                )}
                title="Logs por Categoria"
                subtitle="Distribuição dos logs por categoria"
                color="#10B981"
                height={300}
              />
            </AnimatedCard>
          </div>

          {/* Performance de Queries */}
          {stats.queryPerformance && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AnimatedCard className="classical-card p-6">
                <h4 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiZap className="w-5 h-5 text-accent-amber" />
                  <span>Modelos Mais Lentos</span>
                </h4>

                {stats.queryPerformance.topSlowModels.length === 0 ? (
                  <div className="text-center py-8">
                    <FiCheckCircle className="w-12 h-12 text-accent-green mx-auto mb-4" />
                    <p className="text-theme-secondary">
                      Boa performance geral!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.queryPerformance.topSlowModels.map(
                      (model, index) => (
                        <div
                          key={model.model}
                          className="flex items-center space-x-3 p-3 bg-theme-secondary rounded-xl"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-accent-red to-accent-amber rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-theme-primary">
                              {model.model}
                            </p>
                            <p className="text-sm text-theme-tertiary">
                              {formatDuration(model.avgDuration)} •{' '}
                              {model.count} queries
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </AnimatedCard>

              <AnimatedCard className="classical-card p-6">
                <AdminBarChart
                  data={stats.queryPerformance.hourlyStats.map(
                    ({ hour, avgDuration }) => ({
                      name: `${hour.toString().padStart(2, '0')}h`,
                      value: avgDuration,
                    })
                  )}
                  title="Performance por Hora"
                  subtitle="Tempo médio de resposta ao longo do dia"
                  color="#8B5CF6"
                  height={300}
                />
              </AnimatedCard>
            </div>
          )}

          {/* Top Errors */}
          <AnimatedCard className="classical-card p-6">
            <h4 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
              <FiTarget className="w-5 h-5 text-accent-red" />
              <span>Principais Erros</span>
            </h4>

            {stats.overview.topErrors.length === 0 ? (
              <div className="text-center py-8">
                <FiCheckCircle className="w-12 h-12 text-accent-green mx-auto mb-4" />
                <p className="text-theme-secondary">
                  Nenhum erro frequente detectado!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.overview.topErrors.map((error, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-theme-secondary rounded-xl"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-red to-accent-amber rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-theme-primary">
                        {error.message}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-theme-tertiary">
                        <span>{error.count} ocorrências</span>
                        <span>Último: {getRelativeTime(error.lastSeen)}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<FiSearch />}
                      onClick={() =>
                        setFilters({ search: error.message.slice(0, 30) })
                      }
                    >
                      Buscar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </AnimatedCard>

          {/* Informações dos Arquivos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedCard className="classical-card p-6 text-center">
              <div className="text-3xl font-bold text-accent-blue mb-2">
                {stats.availableDates.length}
              </div>
              <div className="text-theme-tertiary">Arquivos de Log</div>
              <div className="text-xs text-theme-secondary mt-1">
                Últimos {Math.min(stats.availableDates.length, 30)} dias
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6 text-center">
              <div className="text-3xl font-bold text-accent-green mb-2">
                {stats.availableDates[0] || 'N/A'}
              </div>
              <div className="text-theme-tertiary">Arquivo Mais Recente</div>
              <div className="text-xs text-theme-secondary mt-1">
                Último arquivo de log
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6 text-center">
              <div className="text-3xl font-bold text-accent-amber mb-2">
                {stats.searchedDates.length}
              </div>
              <div className="text-theme-tertiary">Arquivos Pesquisados</div>
              <div className="text-xs text-theme-secondary mt-1">
                Na consulta atual
              </div>
            </AnimatedCard>
          </div>
        </>
      )}
    </div>
  );

  const tabs = [
    { id: 'logs', label: 'Logs do Sistema', icon: FiServer },
    { id: 'stats', label: 'Estatísticas', icon: FiBarChart2 },
  ];

  if (error) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <AnimatedCard className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-amber rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="w-8 h-8 text-theme-primary" />
            </div>
            <h3 className="text-xl font-bold text-theme-primary mb-2">
              Erro ao Carregar Logs
            </h3>
            <p className="text-theme-secondary mb-4">{error}</p>
            <Button
              variant="primary"
              onClick={handleRefresh}
              leftIcon={<FiRefreshCw />}
            >
              Tentar Novamente
            </Button>
          </AnimatedCard>
        </div>
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
              <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiFileText className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Sistema de Logs
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle mb-6">
              Monitoramento completo e em tempo real do sistema
            </p>

            {/* Status Summary */}
            {stats && (
              <div className="flex items-center justify-center space-x-8 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-theme-primary">
                    {formatNumber(stats.overview.totalLogs)}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Total de Logs
                  </div>
                </div>

                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${
                      stats.overview.errorRate < 5
                        ? 'text-accent-green'
                        : stats.overview.errorRate < 15
                        ? 'text-accent-amber'
                        : 'text-accent-red'
                    }`}
                  >
                    {stats.overview.errorRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Taxa de Erro
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-blue">
                    {stats.availableDates.length}
                  </div>
                  <div className="text-sm text-theme-tertiary">Arquivos</div>
                </div>
              </div>
            )}
          </div>
        </AnimatedItem>

        {/* Tabs */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-wrap gap-2 mb-8 p-2 bg-theme-elevated rounded-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-theme-primary shadow-lg'
                    : 'text-theme-tertiary hover:text-theme-primary hover:bg-theme-secondary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </AnimatedItem>

        {/* Content */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard className="classical-card p-8">
            {activeTab === 'logs' && renderSystemLogs()}
            {activeTab === 'stats' && renderStatistics()}
          </AnimatedCard>
        </AnimatedItem>
      </AnimatedContainer>

      {/* Modal de Limpeza */}
      {showCleanup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-theme-elevated rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto w-full">
            <div className="p-6">
              <LogsCleanup onClose={() => setShowCleanup(false)} />
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
