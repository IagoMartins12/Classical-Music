// app/admin/AdminDashboardClient.tsx - SEÇÃO ATUALIZADA
'use client';

import { useState, useEffect } from 'react';
import {
  FiUsers,
  FiDatabase,
  FiActivity,
  FiShield,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiBarChart2,
  FiTrendingUp,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import { useAdminStats } from '../hooks/admin/useAdminStats';
import Button from '../components/Common/Button';
import {
  AdminBarChart,
  AdminPieChart,
  MetricCard,
  TrendAreaChart,
} from '../components/Admin/Charts/AdminCharts';
import RecentActivity from '../components/Admin/Activity/RecentActivity';
import BackupDashboardCard from '../components/Admin/Backup/BackupDashboardCard';
import LoadingAdminState from '../components/Admin/Common/LoadingState';

export default function AdminDashboardClient() {
  const { stats, loading, error, refreshStats } = useAdminStats();
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLastUpdated(Date.now());
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshStats();
    setLastUpdated(Date.now());
    setRefreshing(false);
  };

  const getMinutesSinceUpdate = () => {
    if (!mounted || !lastUpdated) return 0;
    return Math.floor((Date.now() - lastUpdated) / (1000 * 60));
  };

  if (loading && !stats) {
    return (
      <PageContainer showBackground={false}>
        <LoadingAdminState loadingName="dashboard" />;
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer showBackground={true}>
        <div className="text-center py-16">
          <FiAlertTriangle className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-theme-primary mb-2">
            Erro ao Carregar Dashboard
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

  if (!stats) {
    return null;
  }

  // Preparar dados para gráficos baseados em dados reais
  const userGrowthData =
    stats.engagement?.annotationsTrends?.slice(-7).map((trend) => ({
      name: new Date(trend.date).toLocaleDateString('pt-BR', {
        weekday: 'short',
      }),
      value: trend.count || 0,
    })) || [];

  const contentDistributionData = [
    { name: 'Usuários Ativos', value: stats.engagement.dailyActiveUsers || 0 },
    { name: 'Obras', value: stats.overview.totalWorks || 0 },
    { name: 'Compositores', value: stats.overview.totalComposers || 0 },
    { name: 'Partituras', value: stats.overview.totalScores || 0 },
  ];

  const engagementData = [
    { name: 'Anotações', value: stats.overview.totalAnnotations || 0 },
    { name: 'Sessões', value: stats.overview.totalStudySessions || 0 },
    { name: 'Uploads', value: stats.trends.last7Days.newUploads || 0 },
  ];

  return (
    <PageContainer showBackground={true}>
      <div className="space-y-8">
        <AnimatedContainer
          delay={0.1}
          staggerSpeed="normal"
          className="flex flex-col gap-4"
        >
          {/* Header Section */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="text-center py-8 lg:py-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-theme-glow">
                  <FiBarChart2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Dashboard Administrativo
              </h1>
              <p className="text-lg md:text-xl text-theme-secondary classical-subtitle max-w-2xl mx-auto">
                Visão geral completa da plataforma
              </p>

              {/* Status Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-accent-green rounded-full animate-pulse"></div>
                  <span className="text-theme-primary font-medium">
                    Sistema Online
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiClock className="w-4 h-4 text-theme-secondary" />
                  <span className="text-theme-secondary">
                    {mounted
                      ? getMinutesSinceUpdate() === 0
                        ? 'Atualizado agora'
                        : `Atualizado há ${getMinutesSinceUpdate()} min`
                      : 'Carregando...'}
                  </span>
                </div>
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
              </div>
            </div>
          </AnimatedItem>

          {/* Main Stats Grid */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <MetricCard
                title="Total de Usuários"
                value={stats.overview.totalUsers || 0}
                change={{
                  value: stats.overview.growthRate?.users || 0,
                  isPositive: (stats.overview.growthRate?.users || 0) >= 0,
                }}
                icon={FiUsers}
                color="#3B82F6"
              />

              <MetricCard
                title="Usuários Ativos"
                value={stats.engagement.dailyActiveUsers || 0}
                change={{ value: 12.8, isPositive: true }}
                icon={FiActivity}
                color="#10B981"
              />

              <MetricCard
                title="Total de Obras"
                value={stats.overview.totalWorks || 0}
                change={{
                  value: stats.overview.growthRate?.works || 0,
                  isPositive: (stats.overview.growthRate?.works || 0) >= 0,
                }}
                icon={FiDatabase}
                color="#F59E0B"
              />

              <MetricCard
                title="Partituras"
                value={stats.overview.totalScores || 0}
                change={{ value: 3.1, isPositive: true }}
                icon={FiCheckCircle}
                color="#8B5CF6"
              />
            </div>
          </AnimatedItem>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Trends Chart */}
            <AnimatedCard className="classical-card p-4 lg:p-6">
              <TrendAreaChart
                data={userGrowthData}
                title="Atividade Recente"
                subtitle="Anotações nos últimos 7 dias"
                color="#3B82F6"
                height={280}
              />
            </AnimatedCard>

            {/* Content Distribution */}
            <AnimatedCard className="classical-card p-4 lg:p-6">
              <AdminPieChart
                data={contentDistributionData}
                title="Distribuição de Conteúdo"
                subtitle="Visão geral da plataforma"
                height={280}
                innerRadius={60}
              />
            </AnimatedCard>
          </div>

          {/* 🆕 SEÇÃO EXPANDIDA COM BACKUP */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Engagement Chart */}
            <div className="xl:col-span-2">
              <AnimatedCard className="classical-card p-4 lg:p-6">
                <AdminBarChart
                  data={engagementData}
                  title="Métricas de Engajamento"
                  subtitle="Atividade dos usuários na plataforma"
                  color="#10B981"
                  height={280}
                />
              </AnimatedCard>
            </div>

            {/* Quick Stats */}
            <AnimatedCard className="classical-card p-4 lg:p-6">
              <h3 className="text-xl font-bold text-theme-primary mb-6">
                Estatísticas Rápidas
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                  <div className="flex items-center space-x-3">
                    <FiShield className="w-5 h-5 text-accent-amber" />
                    <span className="text-theme-primary text-sm lg:text-base">
                      Pendentes
                    </span>
                  </div>
                  <span className="font-bold text-accent-amber">
                    {stats.moderation?.pendingItems || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                  <div className="flex items-center space-x-3">
                    <FiClock className="w-5 h-5 text-accent-green" />
                    <span className="text-theme-primary text-sm lg:text-base">
                      Sessão Média
                    </span>
                  </div>
                  <span className="font-bold text-accent-green">
                    {Math.round(stats.overview.averageSessionDuration || 0)}min
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                  <div className="flex items-center space-x-3">
                    <FiDatabase className="w-5 h-5 text-accent-purple" />
                    <span className="text-theme-primary text-sm lg:text-base">
                      Compositores
                    </span>
                  </div>
                  <span className="font-bold text-accent-purple">
                    {stats.overview.totalComposers || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                  <div className="flex items-center space-x-3">
                    <FiTrendingUp className="w-5 h-5 text-accent-green" />
                    <span className="text-theme-primary text-sm lg:text-base">
                      Anotações
                    </span>
                  </div>
                  <span className="font-bold text-accent-green">
                    {stats.trends.last7Days.newAnnotations || 0}
                  </span>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* 🆕 SEÇÃO DE BACKUP ADICIONADA */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Backup Management Card */}
            <AnimatedItem direction="up" springType="gentle">
              <BackupDashboardCard />
            </AnimatedItem>

            {/* System Status */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard className="classical-card p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-xl font-bold text-theme-primary">
                    Status do Sistema
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={
                      <FiRefreshCw
                        className={refreshing ? 'animate-spin' : ''}
                      />
                    }
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    Atualizar
                  </Button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <div className="text-center p-4 bg-theme-secondary rounded-xl">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-3 h-3 bg-accent-green rounded-full animate-pulse mr-2"></div>
                      <span className="font-medium text-theme-primary">
                        API
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-accent-green">
                      99.9%
                    </div>
                    <div className="text-xs text-theme-tertiary">Uptime</div>
                  </div>

                  <div className="text-center p-4 bg-theme-secondary rounded-xl">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-3 h-3 bg-accent-blue rounded-full mr-2"></div>
                      <span className="font-medium text-theme-primary">
                        Database
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-accent-blue">
                      45ms
                    </div>
                    <div className="text-xs text-theme-tertiary">Latência</div>
                  </div>

                  <div className="text-center p-4 bg-theme-secondary rounded-xl">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-3 h-3 bg-accent-amber rounded-full mr-2"></div>
                      <span className="font-medium text-theme-primary">
                        Storage
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-accent-amber">
                      73%
                    </div>
                    <div className="text-xs text-theme-tertiary">
                      Utilização
                    </div>
                  </div>

                  <div className="text-center p-4 bg-theme-secondary rounded-xl">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-3 h-3 bg-accent-purple rounded-full mr-2"></div>
                      <span className="font-medium text-theme-primary">
                        Cache
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-accent-purple">
                      94%
                    </div>
                    <div className="text-xs text-theme-tertiary">Hit Rate</div>
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>
          </div>

          {/* Actions and Activity Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Quick Actions */}
            {/* <AnimatedItem direction="up" springType="gentle">
              <QuickActions stats={stats} onRefresh={handleRefresh} />
            </AnimatedItem> */}

            {/* Recent Activity */}
            <AnimatedItem direction="up" springType="gentle">
              <RecentActivity />
            </AnimatedItem>
          </div>
        </AnimatedContainer>
      </div>
    </PageContainer>
  );
}
