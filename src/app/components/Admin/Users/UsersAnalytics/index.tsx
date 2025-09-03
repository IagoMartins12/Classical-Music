'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import {
  FiUsers,
  FiActivity,
  FiUpload,
  FiTrendingUp,
  FiTarget,
  FiAward,
  FiDownload,
  FiRefreshCw,
  FiEye,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import {
  MultiLineChart,
  AdminBarChart,
  MetricCard,
} from '@/app/components/Admin/Charts/AdminCharts';
import { formatNumber } from '../../Utils';
import { useAdminUsers } from '@/app/hooks/admin/useAdminUsers';
import LoadingAdminState from '../../Common/LoadingState';
import PeriodSelector from '../../Common/PeriodSelector';
import { getPeriodLabel } from '@/app/utils/adminUtils';
import StatsSkeleton, {
  ChartSkeleton,
  TopPerformersSkeleton,
} from '../../Skeletons/StatsSkeleton';

const UserTypeTranslations = {
  MUSIC_STUDENT: 'Estudantes',
  CASUAL_USER: 'Casuais',
  PROFESSIONAL: 'Profissionais',
  TEACHER: 'Professores',
} as const;

export default function UsersAnalytics() {
  const router = useRouter();
  const {
    analytics,
    loading,
    error,
    refreshData,
    statsLoading,
    period,
    setPeriod,
    refreshStats,
  } = useAdminUsers();

  const [refreshing, setRefreshing] = useState(false);

  // Memoizar dados de export para evitar recalcular em cada render
  const exportData = useMemo(() => {
    if (!analytics) return null;

    return [
      ['Métrica', 'Valor', 'Período'],
      ['Total de Usuários', analytics.totalUsers, getPeriodLabel(period)],
      ['Usuários Ativos Hoje', analytics.activeUsers.today, 'hoje'],
      [
        'Usuários Ativos (Semana)',
        analytics.activeUsers.thisWeek,
        'última semana',
      ],
      ['Usuários Ativos (Mês)', analytics.activeUsers.thisMonth, 'último mês'],
      ['Novos Usuários Hoje', analytics.newUsers.today, 'hoje'],
      ['Novos Usuários (Semana)', analytics.newUsers.thisWeek, 'última semana'],
      ['Novos Usuários (Mês)', analytics.newUsers.thisMonth, 'último mês'],
    ];
  }, [analytics, period]);

  // Memoizar dados dos gráficos
  const chartData = useMemo(() => {
    if (!analytics) return null;

    return {
      userGrowth: analytics.userGrowth.map((d) => ({
        name: new Date(d.date).toLocaleDateString('pt-BR', {
          month: 'short',
          day: 'numeric',
        }),
        'Usuários Ativos': d.activeUsers,
        'Novos Usuários': d.newUsers,
        // Total: Math.floor(
        //   d.totalUsers / (analytics.totalUsers > 1000 ? 100 : 1)
        // ),
      })),
      userTypes: analytics.userTypes.map((type) => ({
        name:
          UserTypeTranslations[
            type.type as keyof typeof UserTypeTranslations
          ] || 'Outros',
        value: type.count,
      })),
    };
  }, [analytics]);

  const handleExportData = () => {
    if (!exportData) return;

    const csvContent = exportData.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios-analytics-${period}-${
      new Date().toISOString().split('T')[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url); // Limpar URL
  };

  const handleRefresh = async () => {
    if (refreshing) return; // Prevenir múltiplas chamadas

    setRefreshing(true);
    try {
      await refreshStats();
    } finally {
      setRefreshing(false);
    }
  };

  const handleUserNavigation = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  if (error) {
    return (
      <PageContainer showBackground={true}>
        <div className="text-center py-16">
          <FiUsers className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-theme-primary mb-2">
            Erro ao Carregar Dados
          </h2>
          <p className="text-theme-secondary mb-6">{error}</p>
          <Button
            variant="primary"
            leftIcon={<FiRefreshCw />}
            onClick={refreshData}
          >
            Tentar Novamente
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (loading && !analytics) {
    return (
      <PageContainer showBackground={true}>
        <LoadingAdminState loadingName="usuários" />
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiUsers className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Análise de Usuários
            </h1>
            <p className="text-lg md:text-xl text-theme-secondary classical-subtitle">
              Insights detalhados sobre comportamento e engajamento
            </p>
            <div className="flex items-center justify-center space-x-4 mt-6">
              <PeriodSelector
                value={period}
                onChange={setPeriod}
                className="bg-theme-secondary px-4 py-2 rounded-xl"
              />
              <Button
                variant="ghost"
                size="sm"
                leftIcon={
                  <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                }
                onClick={handleRefresh}
                disabled={refreshing || statsLoading}
              >
                Atualizar
              </Button>
            </div>
          </div>
        </AnimatedItem>

        {/* Overview Metrics */}
        {statsLoading ? (
          <StatsSkeleton count={4} />
        ) : analytics ? (
          <AnimatedItem direction="up" springType="gentle">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              <MetricCard
                title="Total de Usuários"
                value={analytics.totalUsers}
                change={{
                  value: analytics.newUsers.recentlyAdded || 0,
                  isPositive: true,
                }}
                icon={FiUsers}
                color="#3B82F6"
                subtitle={`nos ${getPeriodLabel(period)}`}
              />

              <MetricCard
                title="Usuários Ativos"
                value={analytics.activeUsers.period}
                change={{
                  value: analytics.activeUsers.growthRate || 0,
                  isPositive: (analytics.activeUsers.growthRate || 0) >= 0,
                }}
                icon={FiActivity}
                color="#10B981"
                subtitle={`${getPeriodLabel(period)}`}
              />

              <MetricCard
                title="Novos Usuários"
                value={analytics.newUsers.period}
                change={{
                  value: analytics.newUsers.growthRate || 0,
                  isPositive: (analytics.newUsers.growthRate || 0) >= 0,
                }}
                icon={FiTrendingUp}
                color="#F59E0B"
                subtitle={`${getPeriodLabel(period)}`}
              />

              <MetricCard
                title="Taxa de Retenção"
                value={`${analytics.retentionRate?.toFixed(1) || 0}%`}
                change={{
                  value: analytics.retentionGrowth || 0,
                  isPositive: (analytics.retentionGrowth || 0) >= 0,
                }}
                icon={FiTarget}
                color="#8B5CF6"
                subtitle="usuários ativos"
              />
            </div>
          </AnimatedItem>
        ) : null}

        {/* Charts Row */}
        {statsLoading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-8">
            <ChartSkeleton title="Tendência de Crescimento" />
            <ChartSkeleton title="Distribuição por Tipo" />
          </div>
        ) : analytics && chartData ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-8">
            {/* User Growth Trend */}
            <AnimatedCard className="classical-card p-4 lg:p-6">
              <MultiLineChart
                data={chartData.userGrowth}
                title="Tendência de Crescimento"
                subtitle={`Evolução dos usuários ${getPeriodLabel(period)}`}
                lines={['Usuários Ativos', 'Novos Usuários', 'Total']}
                height={320}
              />
            </AnimatedCard>

            {/* User Types Distribution */}
            <AnimatedCard className="classical-card p-4 lg:p-6">
              <AdminBarChart
                data={chartData.userTypes}
                title="Distribuição por Tipo"
                subtitle={`Segmentação ${getPeriodLabel(period)}`}
                color="#3B82F6"
                height={320}
              />
            </AnimatedCard>
          </div>
        ) : null}

        {/* Detailed Analysis */}
        {statsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
            <TopPerformersSkeleton />
            <TopPerformersSkeleton />
            <TopPerformersSkeleton />
          </div>
        ) : analytics ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
            {/* Top Contributors */}
            <AnimatedCard className="classical-card p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                <FiUpload className="w-5 h-5 text-accent-green" />
                <span>Top Contribuidores</span>
              </h3>
              <div className="space-y-4">
                {analytics.topContributors.length > 0 ? (
                  analytics.topContributors.slice(0, 5).map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-3 bg-theme-secondary rounded-xl hover:bg-theme-primary/50 transition-all cursor-pointer"
                      onClick={() => handleUserNavigation(user.id)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-theme-primary truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-theme-tertiary">
                          {user.totalUploads} uploads • Score:{' '}
                          {user.uploadScore.toFixed(1)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<FiEye />}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FiUpload className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                    <p className="text-theme-secondary">
                      Nenhum contribuidor encontrado
                    </p>
                  </div>
                )}
              </div>
            </AnimatedCard>

            {/* User Types Detailed */}
            <AnimatedCard className="classical-card p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                <FiTarget className="w-5 h-5 text-accent-blue" />
                <span>Tipos de Usuário</span>
              </h3>
              <div className="space-y-4">
                {analytics.userTypes.map((type, index) => {
                  const typeName =
                    UserTypeTranslations[
                      type.type as keyof typeof UserTypeTranslations
                    ] || 'Outros';

                  return (
                    <div
                      key={`${type.type}-${index}`}
                      className="p-3 bg-theme-secondary rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-theme-primary">
                          {typeName}
                        </span>
                        <span className="text-sm font-bold text-accent-blue">
                          {formatNumber(type.count)}
                        </span>
                      </div>
                      <div className="w-full bg-theme-primary h-2 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-theme-tertiary rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min(type.percentage, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-theme-tertiary">
                        <span>{type.percentage.toFixed(1)}% do total</span>
                        <span>{type.count} usuários</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnimatedCard>

            {/* Engagement Metrics */}
            <AnimatedCard className="classical-card p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                <FiActivity className="w-5 h-5 text-accent-amber" />
                <span>Métricas de Engajamento</span>
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-theme-secondary rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-theme-tertiary">
                      Anotações/Usuário
                    </span>
                    <span className="font-bold text-accent-blue">
                      {analytics.engagementMetrics.averageAnnotationsPerUser.toFixed(
                        1
                      )}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-theme-secondary rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-theme-tertiary">
                      Uploads/Usuário
                    </span>
                    <span className="font-bold text-accent-purple">
                      {analytics.engagementMetrics.averageUploadsPerUser.toFixed(
                        1
                      )}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-theme-secondary rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-theme-tertiary">
                      Taxa de Atividade
                    </span>
                    <span className="font-bold text-accent-amber">
                      {analytics.activityRate?.toFixed(1) || 0}%
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-theme-secondary rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-theme-tertiary">
                      Usuários com Uploads
                    </span>
                    <span className="font-bold text-accent-green">
                      {analytics.contributorsPercentage?.toFixed(1) || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        ) : null}

        {/* Activity Summary */}
        {analytics && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                <FiAward className="w-5 h-5 text-accent-purple" />
                <span>Resumo de Atividade ({getPeriodLabel(period)})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="text-center p-4 bg-theme-secondary rounded-xl">
                  <div className="text-2xl font-bold text-accent-green mb-2">
                    {analytics.activeUsers.today}
                  </div>
                  <div className="text-sm text-theme-tertiary">Ativos Hoje</div>
                </div>

                <div className="text-center p-4 bg-theme-secondary rounded-xl">
                  <div className="text-2xl font-bold text-accent-blue mb-2">
                    {analytics.activeUsers.period}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Ativos no Período
                  </div>
                </div>

                <div className="text-center p-4 bg-theme-secondary rounded-xl">
                  <div className="text-2xl font-bold text-accent-amber mb-2">
                    {analytics.newUsers.period}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Novos no Período
                  </div>
                </div>

                <div className="text-center p-4 bg-theme-secondary rounded-xl">
                  <div className="text-2xl font-bold text-accent-purple mb-2">
                    {formatNumber(analytics.totalUsers)}
                  </div>
                  <div className="text-sm text-theme-tertiary">Total</div>
                </div>
              </div>
            </AnimatedCard>
          </AnimatedItem>
        )}

        {/* Quick Actions */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-theme-secondary">
            <Button
              variant="primary"
              leftIcon={<FiUsers />}
              onClick={() => router.push('/admin/users/list')}
              className="flex-1"
            >
              Ver Lista Completa
            </Button>

            <Button
              variant="secondary"
              leftIcon={<FiDownload />}
              onClick={handleExportData}
              className="flex-1"
              disabled={!analytics || !exportData}
            >
              Exportar Relatório
            </Button>
          </div>
        </AnimatedItem>
      </AnimatedContainer>
    </PageContainer>
  );
}
