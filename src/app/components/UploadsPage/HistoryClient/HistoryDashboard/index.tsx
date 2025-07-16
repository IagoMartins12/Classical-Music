// app/components/Dashboard/HistoryDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiActivity,
  FiTrendingUp,
  FiTrendingDown,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiUser,
  FiMusic,
  FiFile,
  FiCalendar,
  FiClock,
  FiDownload,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import Select from '@/app/components/Common/Select';
import { useToast } from '@/app/hooks/useToast';

interface HistoryDashboardProps {
  userId?: string;
  isAdmin?: boolean;
}

interface DashboardStats {
  overview: {
    totalActions: number;
    actionsToday: number;
    actionsThisWeek: number;
    actionsThisMonth: number;
  };
  breakdown: {
    byEntityType: Record<string, number>;
    byAction: Record<string, number>;
  };
  dailyActivity: Array<{
    date: string;
    create: number;
    update: number;
    delete: number;
    total: number;
  }>;
  trends: {
    daily: { value: number; direction: 'up' | 'down' | 'stable' };
    weekly: { value: number; direction: 'up' | 'down' | 'stable' };
    monthly: { value: number; direction: 'up' | 'down' | 'stable' };
  };
  recentActions: Array<{
    id: string;
    entityType: string;
    action: string;
    createdAt: string;
    reason?: string;
  }>;
}

const HistoryDashboard = ({
  userId,
  isAdmin = false,
}: HistoryDashboardProps) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedMetric, setSelectedMetric] = useState('total');

  const toast = useToast();
  useEffect(() => {
    fetchStats();
  }, [userId, selectedPeriod]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(userId && { userId }),
      });

      const response = await fetch(`/api/uploads/history/stats?${params}`);

      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch('/api/uploads/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          filters: { userId },
        }),
      });

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'history-export.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'history-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar dados');
    }
  };

  // Cores para gráficos
  const colors = {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#06B6D4',
  };

  const actionColors = {
    create: colors.success,
    update: colors.info,
    delete: colors.danger,
  };

  const entityColors = {
    composer: colors.primary,
    work: colors.secondary,
    score: colors.warning,
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  if (error || !stats) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-theme-secondary mb-4">
            {error || 'Dados não disponíveis'}
          </p>
          <button onClick={fetchStats} className="btn-classical-primary">
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-theme-primary classical-title">
                Dashboard do Histórico
              </h1>
              <p className="text-theme-secondary">
                Análise detalhada da atividade de uploads
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Select
                options={[
                  { value: '7', label: 'Últimos 7 dias' },
                  { value: '30', label: 'Últimos 30 dias' },
                  { value: '90', label: 'Últimos 90 dias' },
                ]}
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-40"
              />

              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => exportData('json')}
                    className="btn-classical-secondary text-sm"
                  >
                    <FiDownload className="w-4 h-4 mr-1" />
                    JSON
                  </button>
                  <button
                    onClick={() => exportData('csv')}
                    className="btn-classical-secondary text-sm"
                  >
                    <FiDownload className="w-4 h-4 mr-1" />
                    CSV
                  </button>
                </div>
              )}

              <button onClick={fetchStats} className="btn-classical-secondary">
                <FiRefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </AnimatedItem>

        {/* Overview Cards */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AnimatedCard className="classical-card p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiActivity className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.overview.totalActions.toLocaleString()}
              </div>
              <div className="text-sm text-theme-tertiary">Total de Ações</div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.overview.actionsToday}
              </div>
              <div className="text-sm text-theme-tertiary flex items-center justify-center">
                Hoje
                {stats.trends.daily.direction === 'up' && (
                  <FiTrendingUp className="w-3 h-3 text-accent-green ml-1" />
                )}
                {stats.trends.daily.direction === 'down' && (
                  <FiTrendingDown className="w-3 h-3 text-accent-red ml-1" />
                )}
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-amber rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiClock className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.overview.actionsThisWeek}
              </div>
              <div className="text-sm text-theme-tertiary flex items-center justify-center">
                Esta Semana
                {stats.trends.weekly.direction === 'up' && (
                  <FiTrendingUp className="w-3 h-3 text-accent-green ml-1" />
                )}
                {stats.trends.weekly.direction === 'down' && (
                  <FiTrendingDown className="w-3 h-3 text-accent-red ml-1" />
                )}
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-brand-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiActivity className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.overview.actionsThisMonth}
              </div>
              <div className="text-sm text-theme-tertiary flex items-center justify-center">
                Este Mês
                {stats.trends.monthly.direction === 'up' && (
                  <FiTrendingUp className="w-3 h-3 text-accent-green ml-1" />
                )}
                {stats.trends.monthly.direction === 'down' && (
                  <FiTrendingDown className="w-3 h-3 text-accent-red ml-1" />
                )}
              </div>
            </AnimatedCard>
          </div>
        </AnimatedItem>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activity Timeline */}
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-theme-primary">
                  Atividade no Tempo
                </h3>
                <Select
                  options={[
                    { value: 'total', label: 'Total' },
                    { value: 'separated', label: 'Por Ação' },
                  ]}
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="w-32"
                />
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {selectedMetric === 'total' ? (
                    <AreaChart data={stats.dailyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                          })
                        }
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        labelFormatter={(value) =>
                          new Date(value).toLocaleDateString('pt-BR')
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke={colors.primary}
                        fill={colors.primary}
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  ) : (
                    <LineChart data={stats.dailyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                          })
                        }
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        labelFormatter={(value) =>
                          new Date(value).toLocaleDateString('pt-BR')
                        }
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="create"
                        stroke={actionColors.create}
                        name="Criações"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="update"
                        stroke={actionColors.update}
                        name="Atualizações"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="delete"
                        stroke={actionColors.delete}
                        name="Exclusões"
                        strokeWidth={2}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </AnimatedCard>
          </AnimatedItem>

          {/* Actions Breakdown */}
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-6">
              <h3 className="text-lg font-semibold text-theme-primary mb-6">
                Distribuição por Ação
              </h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(stats.breakdown.byAction).map(
                        ([action, count]) => ({
                          name:
                            action === 'create'
                              ? 'Criações'
                              : action === 'update'
                              ? 'Atualizações'
                              : 'Exclusões',
                          value: count,
                          color:
                            actionColors[action as keyof typeof actionColors],
                        })
                      )}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(stats.breakdown.byAction).map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={Object.values(actionColors)[index]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Action Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FiPlus className="w-4 h-4 text-accent-green mr-1" />
                    <span className="text-sm font-medium text-theme-primary">
                      Criações
                    </span>
                  </div>
                  <div className="text-lg font-bold text-accent-green">
                    {stats.breakdown.byAction.create || 0}
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FiEdit className="w-4 h-4 text-accent-blue mr-1" />
                    <span className="text-sm font-medium text-theme-primary">
                      Atualizações
                    </span>
                  </div>
                  <div className="text-lg font-bold text-accent-blue">
                    {stats.breakdown.byAction.update || 0}
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FiTrash2 className="w-4 h-4 text-accent-red mr-1" />
                    <span className="text-sm font-medium text-theme-primary">
                      Exclusões
                    </span>
                  </div>
                  <div className="text-lg font-bold text-accent-red">
                    {stats.breakdown.byAction.delete || 0}
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </AnimatedItem>
        </div>

        {/* Entity Types and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Entity Types Breakdown */}
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-6">
              <h3 className="text-lg font-semibold text-theme-primary mb-6">
                Tipos de Entidade
              </h3>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(stats.breakdown.byEntityType).map(
                      ([type, count]) => ({
                        name:
                          type === 'composer'
                            ? 'Compositores'
                            : type === 'work'
                            ? 'Obras'
                            : 'Partituras',
                        value: count,
                      })
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      fill={colors.primary}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Entity Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FiUser className="w-4 h-4 text-accent-purple mr-1" />
                    <span className="text-sm font-medium text-theme-primary">
                      Compositores
                    </span>
                  </div>
                  <div className="text-lg font-bold text-accent-purple">
                    {stats.breakdown.byEntityType.composer || 0}
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FiMusic className="w-4 h-4 text-accent-blue mr-1" />
                    <span className="text-sm font-medium text-theme-primary">
                      Obras
                    </span>
                  </div>
                  <div className="text-lg font-bold text-accent-blue">
                    {stats.breakdown.byEntityType.work || 0}
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FiFile className="w-4 h-4 text-accent-amber mr-1" />
                    <span className="text-sm font-medium text-theme-primary">
                      Partituras
                    </span>
                  </div>
                  <div className="text-lg font-bold text-accent-amber">
                    {stats.breakdown.byEntityType.score || 0}
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </AnimatedItem>

          {/* Recent Activity */}
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-6">
              <h3 className="text-lg font-semibold text-theme-primary mb-6">
                Atividade Recente
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stats.recentActions.map((action, index) => (
                  <div
                    key={action.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-theme-secondary/30"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                      {action.entityType === 'composer' && (
                        <FiUser className="w-4 h-4" />
                      )}
                      {action.entityType === 'work' && (
                        <FiMusic className="w-4 h-4" />
                      )}
                      {action.entityType === 'score' && (
                        <FiFile className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {action.action === 'create' && (
                          <FiPlus className="w-3 h-3 text-accent-green" />
                        )}
                        {action.action === 'update' && (
                          <FiEdit className="w-3 h-3 text-accent-blue" />
                        )}
                        {action.action === 'delete' && (
                          <FiTrash2 className="w-3 h-3 text-accent-red" />
                        )}
                        <span className="text-sm font-medium text-theme-primary">
                          {action.action === 'create'
                            ? 'Criou'
                            : action.action === 'update'
                            ? 'Atualizou'
                            : 'Excluiu'}{' '}
                          {action.entityType === 'composer'
                            ? 'compositor'
                            : action.entityType === 'work'
                            ? 'obra'
                            : 'partitura'}
                        </span>
                      </div>

                      <div className="text-xs text-theme-tertiary">
                        {new Date(action.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </AnimatedItem>
        </div>
      </AnimatedContainer>
    </PageContainer>
  );
};

export default HistoryDashboard;
