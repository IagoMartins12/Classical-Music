// app/components/Admin/Logs/LogsAudit.tsx
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
  FiClock,
  FiEye,
  FiSettings,
  FiTrash2,
  FiArchive,
  FiBarChart2,
  FiTarget,
  FiRefreshCw,
  FiFilter,
  FiMoreVertical,
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
import { useAdminLogs } from '@/app/hooks/admin/useAdminLogs';
import { formatNumber } from '@/app/hooks/admin/useAdminStats';
import toast from 'react-hot-toast';
import LoadingAdminState from '../../Common/LoadingState';

export default function LogsAudit() {
  const {
    logs,
    auditEvents,
    stats,
    loading,
    error,
    filters,
    selectedLogs,
    pagination,
    refreshLogs,
    setFilters,
    toggleLogSelection,
    selectAllLogs,
    clearSelection,
    exportLogs,
    archiveLogs,
    deleteLogs,
    loadMoreLogs,
    getFilteredLogs,
    getLevelColor,
    getLevelIcon,
    getCategoryIcon,
    formatTimestamp,
    getRelativeTime,
  } = useAdminLogs();

  const [activeTab, setActiveTab] = useState('system');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);

  const handleExportLogs = async (format: 'csv' | 'json') => {
    try {
      await exportLogs(format);
      toast.success(`Logs exportados em formato ${format.toUpperCase()}!`);
    } catch (error) {
      toast.error('Erro ao exportar logs');
    }
  };

  const handleBulkArchive = async () => {
    try {
      await archiveLogs(Array.from(selectedLogs));
      toast.success(`${selectedLogs.size} logs arquivados com sucesso!`);
      setBulkActionOpen(false);
    } catch (error) {
      toast.error('Erro ao arquivar logs');
    }
  };

  const handleBulkDelete = async () => {
    if (
      window.confirm(
        `Tem certeza que deseja deletar ${selectedLogs.size} logs? Esta ação não pode ser desfeita.`
      )
    ) {
      try {
        await deleteLogs(Array.from(selectedLogs));
        toast.success(`${selectedLogs.size} logs deletados com sucesso!`);
        setBulkActionOpen(false);
      } catch (error) {
        toast.error('Erro ao deletar logs');
      }
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshLogs();
      toast.success('Logs atualizados com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar logs');
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
    };
    return iconMap[iconName] || FiInfo;
  };

  const filteredLogs = getFilteredLogs();

  const renderSystemLogs = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-theme-secondary rounded-xl">
        <div className="relative flex-1 min-w-64">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar nos logs..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="input-classical-2 pl-10 w-full"
          />
        </div>

        <Select
          value={filters.level}
          onChange={(e) => setFilters({ level: e.target.value })}
          options={[
            { value: 'all', label: 'Todos os Níveis' },
            { value: 'error', label: 'Errors' },
            { value: 'warn', label: 'Warnings' },
            { value: 'info', label: 'Info' },
            { value: 'debug', label: 'Debug' },
            { value: 'trace', label: 'Trace' },
          ]}
          className="input-classical-2"
        />

        <Select
          value={filters.category}
          onChange={(e) => setFilters({ category: e.target.value })}
          options={[
            { value: 'all', label: 'Todas as Categorias' },
            { value: 'system', label: 'Sistema' },
            { value: 'security', label: 'Segurança' },
            { value: 'audit', label: 'Auditoria' },
            { value: 'performance', label: 'Performance' },
            { value: 'user', label: 'Usuário' },
            { value: 'api', label: 'API' },
          ]}
          className="input-classical-2"
        />

        <Select
          value={filters.timeRange}
          onChange={(e) => setFilters({ timeRange: e.target.value })}
          options={[
            { value: '1h', label: 'Última hora' },
            { value: '24h', label: 'Últimas 24h' },
            { value: '7d', label: 'Últimos 7 dias' },
            { value: '30d', label: 'Últimos 30 dias' },
            { value: 'all', label: 'Todos' },
          ]}
          className="input-classical-2"
        />

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
        </div>
      </div>

      {/* Selection Actions */}
      {selectedLogs.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-accent-blue/10 border border-accent-blue rounded-xl">
          <span className="text-accent-blue font-medium">
            {selectedLogs.size} logs selecionados
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FiArchive />}
              onClick={handleBulkArchive}
              disabled={loading}
            >
              Arquivar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FiTrash2 />}
              className="text-accent-red hover:bg-accent-red/10"
              onClick={handleBulkDelete}
              disabled={loading}
            >
              Deletar
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Limpar Seleção
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Selection */}
      {filteredLogs.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-theme-secondary/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={
                selectedLogs.size === filteredLogs.length &&
                filteredLogs.length > 0
              }
              onChange={(e) => {
                if (e.target.checked) {
                  selectAllLogs();
                } else {
                  clearSelection();
                }
              }}
              className="w-4 h-4 text-brand-primary bg-theme-secondary border-theme-primary rounded focus:ring-brand-primary focus:ring-2"
            />
            <span className="text-sm text-theme-primary font-medium">
              Selecionar todos os logs visíveis ({filteredLogs.length})
            </span>
          </div>

          <div className="text-sm text-theme-tertiary">
            Mostrando {filteredLogs.length} de {pagination.total} logs
          </div>
        </div>
      )}

      {/* Logs List */}
      {loading && filteredLogs.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-theme-primary font-medium mt-4">
              Carregando logs...
            </p>
          </div>
        </div>
      ) : filteredLogs.length === 0 ? (
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
          {filteredLogs.map((log) => {
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
                  <input
                    type="checkbox"
                    checked={selectedLogs.has(log.id)}
                    onChange={() => toggleLogSelection(log.id)}
                    className="w-4 h-4 text-brand-primary bg-theme-secondary border-theme-primary rounded focus:ring-brand-primary focus:ring-2 mt-1"
                  />

                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${getLevelColor(
                      log.level
                    )}`}
                  >
                    <LevelIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(
                          log.level
                        )}`}
                      >
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-theme-tertiary flex items-center space-x-1">
                        <CategoryIcon className="w-3 h-3" />
                        <span>{log.category}</span>
                      </span>
                      <span className="text-xs text-theme-tertiary">
                        {log.service}
                      </span>
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
                      {log.endpoint && <span>Endpoint: {log.endpoint}</span>}
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
                            log.duration > 1000
                              ? 'text-accent-red'
                              : log.duration > 500
                              ? 'text-accent-amber'
                              : 'text-theme-secondary'
                          }
                        >
                          Duração: {log.duration}ms
                        </span>
                      )}
                    </div>

                    {log.details && showDetails === log.id && (
                      <div className="mt-3 p-3 bg-theme-primary rounded-lg">
                        <pre className="text-xs text-theme-secondary font-mono overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
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

                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FiMoreVertical />}
                      />
                    </div>
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
                  loading ? <FiRefreshCw className="animate-spin" /> : undefined
                }
              >
                {loading
                  ? 'Carregando...'
                  : `Carregar mais logs (${
                      pagination.total - filteredLogs.length
                    } restantes)`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderAuditEvents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-theme-primary">
          Eventos de Auditoria
        </h3>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Filtrar por usuário..."
            value={filters.userId}
            onChange={(e) => setFilters({ userId: e.target.value })}
            className="input-classical-2"
          />
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FiDownload />}
            onClick={() => handleExportLogs('json')}
          >
            Exportar Auditoria
          </Button>
        </div>
      </div>

      {auditEvents.length === 0 ? (
        <div className="text-center py-12">
          <FiShield className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-theme-primary mb-2">
            Nenhum evento de auditoria
          </h3>
          <p className="text-theme-secondary">
            Eventos de auditoria aparecerão aqui conforme as atividades do
            sistema.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {auditEvents.map((event) => (
            <div key={event.id} className="p-4 bg-theme-secondary rounded-xl">
              <div className="flex items-start space-x-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    event.success
                      ? 'text-accent-green bg-accent-green/10'
                      : 'text-accent-red bg-accent-red/10'
                  }`}
                >
                  {event.success ? (
                    <FiCheckCircle className="w-5 h-5" />
                  ) : (
                    <FiX className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-theme-primary">
                      {event.action
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </h4>
                    <span className="text-sm text-theme-tertiary">
                      {event.resource}{' '}
                      {event.resourceId &&
                        `(${event.resourceId.slice(0, 8)}...)`}
                    </span>
                    <span className="text-xs text-theme-tertiary">
                      {formatTimestamp(new Date(event.timestamp))}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-theme-secondary mb-3">
                    <div>Usuário: {event.userName}</div>
                    <div>Sessão: {event.sessionId.slice(0, 8)}...</div>
                    <div>IP: {event.ipAddress}</div>
                    <div>Status: {event.success ? 'Sucesso' : 'Falha'}</div>
                  </div>

                  {event.changes && (
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-xs font-medium text-theme-primary mb-1">
                          Antes:
                        </p>
                        <pre className="text-xs text-theme-secondary bg-theme-primary p-2 rounded overflow-x-auto">
                          {JSON.stringify(event.changes.before, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-theme-primary mb-1">
                          Depois:
                        </p>
                        <pre className="text-xs text-theme-secondary bg-theme-primary p-2 rounded overflow-x-auto">
                          {JSON.stringify(event.changes.after, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {event.metadata && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-theme-primary mb-1">
                        Metadata:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <span
                            key={key}
                            className="text-xs bg-theme-primary px-2 py-1 rounded text-theme-secondary"
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {event.errorMessage && (
                    <div className="mt-3 p-2 bg-accent-red/10 border border-accent-red rounded">
                      <p className="text-sm text-accent-red">
                        {event.errorMessage}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
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
        <div className="text-center py-12">
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
              value={formatNumber(stats.total)}
              change={{ value: 15.2, isPositive: true }}
              icon={FiFileText}
              color="#3B82F6"
            />

            <MetricCard
              title="Logs (24h)"
              value={formatNumber(stats.last24h)}
              change={{ value: 8.7, isPositive: true }}
              icon={FiClock}
              color="#10B981"
            />

            <MetricCard
              title="Taxa de Erro"
              value={`${stats.errorRate.toFixed(1)}%`}
              change={{ value: -2.3, isPositive: true }}
              icon={FiAlertTriangle}
              color="#F59E0B"
            />

            <MetricCard
              title="Tempo Médio"
              value={`${stats.performanceMetrics.avgResponseTime}ms`}
              change={{ value: -12.1, isPositive: true }}
              icon={FiActivity}
              color="#8B5CF6"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnimatedCard className="classical-card p-6">
              <AdminBarChart
                data={Object.entries(stats.byLevel).map(([level, count]) => ({
                  name: level.toUpperCase(),
                  value: count,
                }))}
                title="Logs por Nível"
                subtitle="Distribuição dos logs por severidade"
                color="#3B82F6"
                height={300}
              />
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6">
              <AdminBarChart
                data={Object.entries(stats.byCategory).map(
                  ([category, count]) => ({
                    name: category.charAt(0).toUpperCase() + category.slice(1),
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

          {/* Activity by Hour */}
          <AnimatedCard className="classical-card p-6">
            <AdminBarChart
              data={stats.activityByHour.map(({ hour, count }) => ({
                name: `${hour.toString().padStart(2, '0')}h`,
                value: count,
              }))}
              title="Atividade por Hora"
              subtitle="Distribuição dos logs ao longo do dia"
              color="#8B5CF6"
              height={250}
            />
          </AnimatedCard>

          {/* Top Errors */}
          <AnimatedCard className="classical-card p-6">
            <h4 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
              <FiTarget className="w-5 h-5 text-accent-red" />
              <span>Principais Erros</span>
            </h4>

            {stats.topErrors.length === 0 ? (
              <div className="text-center py-8">
                <FiCheckCircle className="w-12 h-12 text-accent-green mx-auto mb-4" />
                <p className="text-theme-secondary">
                  Nenhum erro frequente detectado!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.topErrors.map((error, index) => (
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
                        <span
                          className={`px-2 py-1 rounded text-xs ${getLevelColor(
                            error.level
                          )}`}
                        >
                          {error.level.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<FiSearch />}
                      onClick={() =>
                        setFilters({ search: error.message.slice(0, 20) })
                      }
                    >
                      Buscar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </AnimatedCard>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedCard className="classical-card p-6 text-center">
              <div className="text-3xl font-bold text-accent-blue mb-2">
                {formatNumber(stats.performanceMetrics.slowQueries)}
              </div>
              <div className="text-theme-tertiary">Consultas Lentas</div>
              <div className="text-xs text-theme-secondary mt-1">
                Acima de 1000ms
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6 text-center">
              <div className="text-3xl font-bold text-accent-amber mb-2">
                {formatNumber(stats.performanceMetrics.failedRequests)}
              </div>
              <div className="text-theme-tertiary">Requisições Falhadas</div>
              <div className="text-xs text-theme-secondary mt-1">
                Status 4xx/5xx
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6 text-center">
              <div className="text-3xl font-bold text-accent-green mb-2">
                {stats.performanceMetrics.avgResponseTime}ms
              </div>
              <div className="text-theme-tertiary">Tempo Médio</div>
              <div className="text-xs text-theme-secondary mt-1">
                Todas as requisições
              </div>
            </AnimatedCard>
          </div>
        </>
      )}
    </div>
  );

  const tabs = [
    { id: 'system', label: 'Logs do Sistema', icon: FiServer },
    { id: 'audit', label: 'Auditoria', icon: FiShield },
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

  if (loading) {
    return (
      <PageContainer showBackground>
        <LoadingAdminState loadingName="logs" />
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
              Logs & Auditoria
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle mb-6">
              Monitoramento completo de atividades do sistema
            </p>

            {/* Status Summary */}
            {stats && (
              <div className="flex items-center justify-center space-x-8 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-theme-primary">
                    {formatNumber(stats.total)}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Total de Logs
                  </div>
                </div>

                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${
                      stats.errorRate < 5
                        ? 'text-accent-green'
                        : stats.errorRate < 15
                        ? 'text-accent-amber'
                        : 'text-accent-red'
                    }`}
                  >
                    {stats.errorRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Taxa de Erro
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-blue">
                    {formatNumber(stats.last24h)}
                  </div>
                  <div className="text-sm text-theme-tertiary">Últimas 24h</div>
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
            {activeTab === 'system' && renderSystemLogs()}
            {activeTab === 'audit' && renderAuditEvents()}
            {activeTab === 'stats' && renderStatistics()}
          </AnimatedCard>
        </AnimatedItem>
      </AnimatedContainer>
    </PageContainer>
  );
}
