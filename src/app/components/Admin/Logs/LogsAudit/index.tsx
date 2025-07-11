// app/components/Admin/Logs/LogsAudit.tsx
'use client';

import { useState, useEffect } from 'react';
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
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import {
  AdminBarChart,
  MetricCard,
} from '@/app/components/Admin/Charts/AdminCharts';

interface LogEntry {
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

interface AuditEvent {
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

interface LogStats {
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

export default function LogsAudit() {
  const [activeTab, setActiveTab] = useState('system');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [filters, setFilters] = useState({
    level: 'all',
    category: 'all',
    service: 'all',
    timeRange: '24h',
    search: '',
    userId: '',
  });
  const [loading, setLoading] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Mock data
  const mockLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      level: 'error',
      category: 'system',
      service: 'api',
      action: 'upload_file',
      message: 'Failed to upload file: disk space full',
      userId: 'user123',
      userName: 'João Silva',
      ipAddress: '192.168.1.100',
      endpoint: '/api/upload',
      statusCode: 500,
      duration: 5420,
      details: {
        fileName: 'score.pdf',
        fileSize: '2.4MB',
        error: 'ENOSPC: no space left on device',
      },
      sessionId: 'sess_abc123',
      traceId: 'trace_xyz789',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      level: 'warn',
      category: 'performance',
      service: 'database',
      action: 'slow_query',
      message: 'Slow query detected: SELECT * FROM works WHERE...',
      duration: 2350,
      details: {
        query: 'SELECT * FROM works WHERE composer_id = ? AND epoch_id = ?',
        params: ['comp123', 'epoch456'],
        executionTime: 2350,
        rowsExamined: 15000,
      },
      traceId: 'trace_slow123',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      level: 'info',
      category: 'audit',
      service: 'auth',
      action: 'user_login',
      message: 'User login successful',
      userId: 'user456',
      userName: 'Maria Santos',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: {
        loginMethod: 'email',
        rememberMe: true,
        location: 'São Paulo, BR',
      },
      sessionId: 'sess_def456',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      level: 'error',
      category: 'security',
      service: 'auth',
      action: 'failed_login',
      message: 'Failed login attempt: invalid password',
      ipAddress: '192.168.1.99',
      userAgent: 'curl/7.68.0',
      details: {
        email: 'admin@site.com',
        attempts: 5,
        blocked: true,
        reason: 'brute_force_protection',
      },
      traceId: 'trace_security789',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      level: 'info',
      category: 'user',
      service: 'app',
      action: 'create_annotation',
      message: 'User created new annotation',
      userId: 'user789',
      userName: 'Pedro Costa',
      ipAddress: '192.168.1.102',
      details: {
        workId: 'work123',
        annotationType: 'technical',
        length: 245,
      },
      sessionId: 'sess_ghi789',
    },
  ];

  const mockAuditEvents: AuditEvent[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      userId: 'admin123',
      userName: 'Admin User',
      action: 'update_user_permissions',
      resource: 'user',
      resourceId: 'user456',
      changes: {
        before: { canUpload: false, role: 'user' },
        after: { canUpload: true, role: 'contributor' },
      },
      ipAddress: '192.168.1.50',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      sessionId: 'admin_sess_123',
      success: true,
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      userId: 'user123',
      userName: 'João Silva',
      action: 'upload_composer',
      resource: 'composer',
      resourceId: 'comp789',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      sessionId: 'sess_abc123',
      success: true,
      metadata: {
        composerName: 'Claude Debussy',
        epoch: 'Impressionist',
        uploadSize: '1.2MB',
      },
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 40 * 60 * 1000),
      userId: 'mod456',
      userName: 'Moderator',
      action: 'reject_upload',
      resource: 'work',
      resourceId: 'work456',
      ipAddress: '192.168.1.75',
      userAgent: 'Mozilla/5.0 (Ubuntu; Linux x86_64)',
      sessionId: 'mod_sess_456',
      success: true,
      metadata: {
        reason: 'insufficient_metadata',
        uploaderUserId: 'user789',
      },
    },
  ];

  const mockStats: LogStats = {
    total: 15647,
    byLevel: {
      error: 234,
      warn: 567,
      info: 12456,
      debug: 2156,
      trace: 234,
    },
    byCategory: {
      system: 4567,
      security: 234,
      audit: 1234,
      performance: 567,
      user: 8234,
      api: 811,
    },
    byService: {
      api: 5678,
      database: 2345,
      auth: 1234,
      cache: 567,
      upload: 789,
      others: 5034,
    },
    last24h: 2456,
    errorRate: 1.5,
    topErrors: [
      {
        message: 'Database connection timeout',
        count: 45,
        lastSeen: new Date(Date.now() - 2 * 60 * 1000),
      },
      {
        message: 'File upload failed: size limit exceeded',
        count: 32,
        lastSeen: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        message: 'Authentication token expired',
        count: 28,
        lastSeen: new Date(Date.now() - 8 * 60 * 1000),
      },
    ],
    performanceMetrics: {
      avgResponseTime: 245,
      slowQueries: 12,
      failedRequests: 89,
    },
  };

  useEffect(() => {
    setLogs(mockLogs);
    setAuditEvents(mockAuditEvents);
    setStats(mockStats);
  }, []);

  const getLevelColor = (level: string) => {
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
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return FiAlertTriangle;
      case 'warn':
        return FiAlertTriangle;
      case 'info':
        return FiInfo;
      case 'debug':
        return FiSettings;
      case 'trace':
        return FiActivity;
      default:
        return FiInfo;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system':
        return FiServer;
      case 'security':
        return FiShield;
      case 'audit':
        return FiFileText;
      case 'performance':
        return FiActivity;
      case 'user':
        return FiUser;
      case 'api':
        return FiDatabase;
      default:
        return FiActivity;
    }
  };

  const filterLogs = (logList: LogEntry[]) => {
    return logList.filter((log) => {
      if (filters.level !== 'all' && log.level !== filters.level) return false;
      if (filters.category !== 'all' && log.category !== filters.category)
        return false;
      if (filters.service !== 'all' && log.service !== filters.service)
        return false;
      if (filters.userId && log.userId !== filters.userId) return false;
      if (
        filters.search &&
        !log.message.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;

      // Time range filter
      const now = new Date();
      const logTime = new Date(log.timestamp);
      const timeDiff = now.getTime() - logTime.getTime();

      switch (filters.timeRange) {
        case '1h':
          return timeDiff <= 60 * 60 * 1000;
        case '24h':
          return timeDiff <= 24 * 60 * 60 * 1000;
        case '7d':
          return timeDiff <= 7 * 24 * 60 * 60 * 1000;
        case '30d':
          return timeDiff <= 30 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });
  };

  const handleExportLogs = () => {
    const selectedLogData =
      selectedLogs.size > 0
        ? logs.filter((log) => selectedLogs.has(log.id))
        : filterLogs(logs);

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
  };

  const renderSystemLogs = () => {
    const filteredLogs = filterLogs(logs);

    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-theme-secondary rounded-xl">
          <div className="relative flex-1 min-w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar nos logs..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="input-classical-2 pl-10 w-full"
            />
          </div>

          <Select
            value={filters.level}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, level: e.target.value }))
            }
            options={[
              { value: 'all', label: 'Todos os Níveis' },
              { value: 'error', label: 'Errors' },
              { value: 'warn', label: 'Warnings' },
              { value: 'info', label: 'Info' },
              { value: 'debug', label: 'Debug' },
            ]}
            className="input-classical-2"
          />

          <Select
            value={filters.category}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, category: e.target.value }))
            }
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
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, timeRange: e.target.value }))
            }
            options={[
              { value: '1h', label: 'Última hora' },
              { value: '24h', label: 'Últimas 24h' },
              { value: '7d', label: 'Últimos 7 dias' },
              { value: '30d', label: 'Últimos 30 dias' },
              { value: 'all', label: 'Todos' },
            ]}
            className="input-classical-2"
          />

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FiDownload />}
            onClick={handleExportLogs}
          >
            Exportar
          </Button>
        </div>

        {/* Selection Actions */}
        {selectedLogs.size > 0 && (
          <div className="flex items-center justify-between p-4 bg-accent-blue/10 border border-accent-blue rounded-xl">
            <span className="text-accent-blue font-medium">
              {selectedLogs.size} logs selecionados
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="secondary" size="sm" leftIcon={<FiArchive />}>
                Arquivar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiTrash2 />}
                className="text-accent-red hover:bg-accent-red/10"
              >
                Deletar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLogs(new Set())}
              >
                Limpar Seleção
              </Button>
            </div>
          </div>
        )}

        {/* Logs List */}
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const LevelIcon = getLevelIcon(log.level);
            const CategoryIcon = getCategoryIcon(log.category);

            return (
              <div
                key={log.id}
                className="p-4 bg-theme-secondary rounded-xl hover:bg-theme-primary/50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedLogs.has(log.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedLogs);
                      if (e.target.checked) {
                        newSelected.add(log.id);
                      } else {
                        newSelected.delete(log.id);
                      }
                      setSelectedLogs(newSelected);
                    }}
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
                        {log.timestamp.toLocaleString('pt-BR')}
                      </span>
                      {log.traceId && (
                        <span className="text-xs text-theme-tertiary font-mono">
                          {log.traceId}
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
                        <pre className="text-xs text-theme-secondary font-mono overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

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
            );
          })}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <FiFileText className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-theme-primary mb-2">
              Nenhum log encontrado
            </h3>
            <p className="text-theme-secondary">
              Ajuste os filtros para encontrar os logs desejados.
            </p>
          </div>
        )}
      </div>
    );
  };

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
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, userId: e.target.value }))
            }
            className="input-classical-2"
          />
          <Button variant="secondary" size="sm" leftIcon={<FiDownload />}>
            Exportar Auditoria
          </Button>
        </div>
      </div>

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
                    {event.action}
                  </h4>
                  <span className="text-sm text-theme-tertiary">
                    {event.resource}{' '}
                    {event.resourceId && `(${event.resourceId})`}
                  </span>
                  <span className="text-xs text-theme-tertiary">
                    {event.timestamp.toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-theme-secondary mb-3">
                  <div>Usuário: {event.userName}</div>
                  <div>IP: {event.ipAddress}</div>
                  <div>Sessão: {event.sessionId.slice(0, 8)}...</div>
                  <div>Status: {event.success ? 'Sucesso' : 'Falha'}</div>
                </div>

                {event.changes && (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs font-medium text-theme-primary mb-1">
                        Antes:
                      </p>
                      <pre className="text-xs text-theme-secondary bg-theme-primary p-2 rounded">
                        {JSON.stringify(event.changes.before, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-theme-primary mb-1">
                        Depois:
                      </p>
                      <pre className="text-xs text-theme-secondary bg-theme-primary p-2 rounded">
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
    </div>
  );

  const renderStatistics = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-theme-primary">
        Estatísticas dos Logs
      </h3>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Logs"
          value={stats?.total || 0}
          change={{ value: 15.2, isPositive: true }}
          icon={FiFileText}
          color="#3B82F6"
        />

        <MetricCard
          title="Logs (24h)"
          value={stats?.last24h || 0}
          change={{ value: 8.7, isPositive: true }}
          icon={FiClock}
          color="#10B981"
        />

        <MetricCard
          title="Taxa de Erro"
          value={`${stats?.errorRate.toFixed(1)}%`}
          change={{ value: -2.3, isPositive: true }}
          icon={FiAlertTriangle}
          color="#F59E0B"
        />

        <MetricCard
          title="Tempo Médio"
          value={`${stats?.performanceMetrics.avgResponseTime}ms`}
          change={{ value: -12.1, isPositive: true }}
          icon={FiActivity}
          color="#8B5CF6"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnimatedCard className="classical-card p-6">
          <AdminBarChart
            data={Object.entries(stats?.byLevel || {}).map(
              ([level, count]) => ({
                name: level.toUpperCase(),
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
            data={Object.entries(stats?.byCategory || {}).map(
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

      {/* Top Errors */}
      <AnimatedCard className="classical-card p-6">
        <h4 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
          <FiTarget className="w-5 h-5 text-accent-red" />
          <span>Principais Erros</span>
        </h4>

        <div className="space-y-3">
          {stats?.topErrors.map((error, index) => (
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
                  <span>Último: {error.lastSeen.toLocaleString('pt-BR')}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<FiSearch />}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, search: error.message }))
                }
              >
                Buscar
              </Button>
            </div>
          ))}
        </div>
      </AnimatedCard>
    </div>
  );

  const tabs = [
    { id: 'system', label: 'Logs do Sistema', icon: FiServer },
    { id: 'audit', label: 'Auditoria', icon: FiShield },
    { id: 'stats', label: 'Estatísticas', icon: FiBarChart2 },
  ];

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
            <p className="text-xl text-theme-secondary classical-subtitle">
              Monitoramento e rastreamento de atividades
            </p>
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
