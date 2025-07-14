// app/components/Admin/Analytics/AdminAnalytics.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiBarChart2,
  FiTrendingUp,
  FiUsers,
  FiDatabase,
  FiActivity,
  FiRefreshCw,
  FiDownload,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiZap,
  FiTarget,
  FiEye,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import {
  MultiLineChart,
  AdminBarChart,
  AdminPieChart,
  MetricCard,
  HorizontalBarChart,
} from '@/app/components/Admin/Charts/AdminCharts';
import { useAdminAnalytics } from '@/app/hooks/admin/useAdminAnalytics';
import { formatNumber, formatDuration } from '@/app/hooks/admin/useAdminStats';

export default function AdminAnalytics() {
  const router = useRouter();
  const { analytics, loading, error, refreshAnalytics, lastUpdated } =
    useAdminAnalytics();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAnalytics();
    setRefreshing(false);
  };

  const handleExportReport = () => {
    if (!analytics) return;

    const csvData = [
      ['Métrica', 'Valor'],
      ['Total de Usuários', analytics.overview.users.total],
      ['Usuários Ativos', analytics.overview.users.active],
      ['Novos Usuários', analytics.overview.users.new],
      ['Taxa de Crescimento', `${analytics.overview.users.growth.toFixed(1)}%`],
      ['Total de Compositores', analytics.overview.content.composers],
      ['Total de Obras', analytics.overview.content.works],
      ['Total de Partituras', analytics.overview.content.scores],
      ['Total de Anotações', analytics.overview.content.annotations],
      ['Sessões de Estudo', analytics.overview.engagement.studySessions],
      [
        'Tempo Médio de Sessão',
        `${analytics.overview.engagement.avgSessionTime} min`,
      ],
      [
        'Total de Horas de Estudo',
        analytics.overview.engagement.totalStudyTime,
      ],
    ];

    const csvContent = csvData.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return FiAlertTriangle;
      case 'success':
        return FiCheckCircle;
      default:
        return FiInfo;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'text-accent-red bg-accent-red/10 border-accent-red';
      case 'success':
        return 'text-accent-green bg-accent-green/10 border-accent-green';
      default:
        return 'text-accent-blue bg-accent-blue/10 border-accent-blue';
    }
  };

  if (loading && !analytics) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-theme-primary font-medium mt-6 text-lg">
              Carregando analytics...
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer showBackground={true}>
        <div className="text-center py-16">
          <FiAlertTriangle className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-theme-primary mb-2">
            Erro ao Carregar Analytics
          </h2>
          <p className="text-theme-secondary mb-6">{error}</p>
          <Button
            variant="primary"
            leftIcon={<FiRefreshCw />}
            onClick={handleRefresh}
          >
            Tentar Novamente
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiBarChart2 className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Analytics da Plataforma
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Visão completa de performance e engajamento
            </p>

            {/* Status e controles */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent-green rounded-full animate-pulse"></div>
                <span className="text-theme-primary font-medium">
                  Dados em Tempo Real
                </span>
              </div>
              {lastUpdated && (
                <div className="flex items-center space-x-2">
                  <FiRefreshCw className="w-4 h-4 text-theme-secondary" />
                  <span className="text-theme-secondary">
                    Atualizado há{' '}
                    {Math.round((Date.now() - lastUpdated.getTime()) / 60000)}{' '}
                    min
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={
                    <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                  }
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  Atualizar
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiDownload />}
                  onClick={handleExportReport}
                >
                  Exportar
                </Button>
              </div>
            </div>
          </div>
        </AnimatedItem>

        {/* Overview Metrics */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total de Usuários"
              value={formatNumber(analytics.overview.users.total)}
              change={{
                value: analytics.overview.users.growth,
                isPositive: analytics.overview.users.growth >= 0,
              }}
              icon={FiUsers}
              color="#3B82F6"
            />

            <MetricCard
              title="Usuários Ativos"
              value={formatNumber(analytics.overview.users.active)}
              change={{
                value:
                  (analytics.overview.users.active /
                    analytics.overview.users.total) *
                  100,
                isPositive: true,
              }}
              icon={FiActivity}
              color="#10B981"
            />

            <MetricCard
              title="Total de Obras"
              value={formatNumber(analytics.overview.content.works)}
              change={{
                value:
                  (analytics.overview.content.works /
                    analytics.overview.content.composers) *
                  100,
                isPositive: true,
              }}
              icon={FiDatabase}
              color="#F59E0B"
            />

            <MetricCard
              title="Sessões de Estudo"
              value={formatNumber(analytics.overview.engagement.studySessions)}
              change={{
                value: 12.4,
                isPositive: true,
              }}
              icon={FiZap}
              color="#8B5CF6"
            />
          </div>
        </AnimatedItem>

        {/* Key Insights */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard className="classical-card p-6 mb-8">
            <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
              <FiTarget className="w-5 h-5 text-accent-blue" />
              <span>Insights Principais</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.insights.keyMetrics.map((metric, index) => (
                <div key={index} className="p-4 bg-theme-secondary rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-theme-primary">
                      {metric.metric}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        metric.isPositive
                          ? 'text-accent-green'
                          : 'text-accent-red'
                      }`}
                    >
                      {metric.isPositive ? '+' : ''}
                      {metric.change.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-theme-primary">
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </AnimatedItem>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* User Growth Trend */}
          <AnimatedCard className="classical-card p-6">
            <MultiLineChart
              data={analytics.charts.userGrowthTrend.map((item) => ({
                name: new Date(item.date).toLocaleDateString('pt-BR', {
                  month: 'short',
                  day: 'numeric',
                }),
                Total: item.users,
                Ativos: item.active,
                Novos: item.new,
              }))}
              title="Crescimento de Usuários"
              subtitle="Evolução dos usuários (últimos 14 dias)"
              lines={['Total', 'Ativos', 'Novos']}
              height={350}
            />
          </AnimatedCard>

          {/* Content Distribution */}
          <AnimatedCard className="classical-card p-6">
            <AdminPieChart
              data={analytics.charts.contentDistribution}
              title="Distribuição de Conteúdo"
              subtitle="Proporção de diferentes tipos de conteúdo"
              height={350}
              innerRadius={60}
            />
          </AnimatedCard>
        </div>

        {/* Engagement Metrics */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard className="classical-card p-6 mb-8">
            <AdminBarChart
              data={analytics.charts.engagementMetrics.map((metric) => ({
                name: metric.metric,
                value: metric.value,
              }))}
              title="Métricas de Engajamento"
              subtitle="Principais indicadores de atividade da plataforma"
              color="#10B981"
              height={300}
            />
          </AnimatedCard>
        </AnimatedItem>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Top Works */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
              <FiDatabase className="w-5 h-5 text-accent-blue" />
              <span>Obras Populares</span>
            </h3>
            <div className="space-y-3">
              {analytics.charts.topPerformers.works
                .slice(0, 5)
                .map((work, index) => (
                  <div
                    key={work.id}
                    className="flex items-center space-x-3 p-3 bg-theme-secondary rounded-xl"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-theme-primary truncate">
                        {work.title}
                      </p>
                      <p className="text-sm text-theme-tertiary truncate">
                        {work.composer}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-theme-secondary mt-1">
                        <span>❤️ {work.favorites}</span>
                        <span>📚 {work.sessions}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<FiEye />}
                      onClick={() => router.push(`/admin/works/${work.id}`)}
                    />
                  </div>
                ))}
            </div>
          </AnimatedCard>

          {/* Top Composers */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
              <FiUsers className="w-5 h-5 text-accent-green" />
              <span>Compositores Populares</span>
            </h3>
            <div className="space-y-3">
              {analytics.charts.topPerformers.composers
                .slice(0, 5)
                .map((composer, index) => (
                  <div
                    key={composer.id}
                    className="flex items-center space-x-3 p-3 bg-theme-secondary rounded-xl"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-theme-primary truncate">
                        {composer.name}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-theme-secondary mt-1">
                        <span>🎵 {composer.works} obras</span>
                        <span>❤️ {composer.favorites}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<FiEye />}
                      onClick={() =>
                        router.push(`/admin/composers/${composer.id}`)
                      }
                    />
                  </div>
                ))}
            </div>
          </AnimatedCard>

          {/* Top Users */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
              <FiActivity className="w-5 h-5 text-accent-purple" />
              <span>Usuários Ativos</span>
            </h3>
            <div className="space-y-3">
              {analytics.charts.topPerformers.users
                .slice(0, 5)
                .map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-3 bg-theme-secondary rounded-xl"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-theme-primary truncate">
                        {user.name}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-theme-secondary mt-1">
                        <span>⏱️ {formatDuration(user.studyTime)}</span>
                        <span>📝 {user.annotations}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<FiEye />}
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                    />
                  </div>
                ))}
            </div>
          </AnimatedCard>
        </div>

        {/* Recommendations */}
        {analytics.insights.recommendations.length > 0 && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-6">
              <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                <FiTarget className="w-5 h-5 text-accent-amber" />
                <span>Recomendações</span>
              </h3>
              <div className="space-y-4">
                {analytics.insights.recommendations.map((rec, index) => {
                  const IconComponent = getRecommendationIcon(rec.type);
                  return (
                    <div
                      key={index}
                      className={`p-4 border-l-4 rounded-xl ${getRecommendationColor(
                        rec.type
                      )}`}
                    >
                      <div className="flex items-start space-x-3">
                        <IconComponent className="w-5 h-5 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-theme-primary mb-1">
                            {rec.title}
                          </h4>
                          <p className="text-theme-secondary text-sm mb-2">
                            {rec.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnimatedCard>
          </AnimatedItem>
        )}

        {/* Quick Actions */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Button
              variant="secondary"
              className="h-auto p-6 flex flex-col items-center justify-center"
              onClick={() => router.push('/admin/users')}
            >
              <FiUsers className="w-8 h-8 mb-3 text-accent-blue" />
              <span className="font-bold mb-2">Gerenciar Usuários</span>
              <span className="text-sm text-theme-tertiary text-center">
                {formatNumber(analytics.overview.users.total)} usuários
                registrados
              </span>
            </Button>

            <Button
              variant="secondary"
              className="h-auto p-6 flex-col"
              onClick={() => router.push('/admin/content')}
            >
              <FiDatabase className="w-8 h-8 mb-3 text-accent-green" />
              <span className="font-bold mb-2">Gerenciar Conteúdo</span>
              <span className="text-sm text-theme-tertiary text-center">
                {formatNumber(analytics.overview.content.works)} obras
                catalogadas
              </span>
            </Button>

            <Button
              variant="secondary"
              className="h-auto p-6 flex-col"
              onClick={() => router.push('/admin/insights')}
            >
              <FiTrendingUp className="w-8 h-8 mb-3 text-accent-purple" />
              <span className="font-bold mb-2">Insights Avançados</span>
              <span className="text-sm text-theme-tertiary text-center">
                Análises e predições
              </span>
            </Button>

            <Button
              variant="secondary"
              className="h-auto p-6 flex-col"
              onClick={() => router.push('/admin/system')}
            >
              <FiZap className="w-8 h-8 mb-3 text-accent-amber" />
              <span className="font-bold mb-2">Sistema</span>
              <span className="text-sm text-theme-tertiary text-center">
                Performance {analytics.overview.system.performance.toFixed(1)}%
              </span>
            </Button>
          </div>
        </AnimatedItem>
      </AnimatedContainer>
    </PageContainer>
  );
}
