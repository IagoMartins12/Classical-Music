// app/components/Admin/AdminDashboard.tsx
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiUsers,
  FiMusic,
  FiFileText,
  FiHeart,
  FiMessageSquare,
  FiUpload,
  FiShield,
  FiRefreshCw,
  FiActivity,
  FiTarget,
  FiAward,
  FiPieChart,
  FiArrowUp,
  FiArrowDown,
  FiDatabase,
  FiBarChart2,
} from 'react-icons/fi';
import {
  useAdminStats,
  formatNumber,
  formatDuration,
  formatPercentage,
  formatGrowthRate,
} from '@/app/hooks/admin/useAdminStats';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';

// Tipos para melhor type safety
type TimeFrame = '7d' | '30d' | '90d' | '1y';
type ActiveSection =
  | 'overview'
  | 'users'
  | 'content'
  | 'engagement'
  | 'quality';

interface SectionTab {
  id: ActiveSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTION_TABS: SectionTab[] = [
  { id: 'overview', label: 'Visão Geral', icon: FiBarChart2 },
  { id: 'users', label: 'Usuários', icon: FiUsers },
  { id: 'content', label: 'Conteúdo', icon: FiMusic },
  { id: 'engagement', label: 'Engajamento', icon: FiActivity },
  { id: 'quality', label: 'Qualidade', icon: FiShield },
];

const TIMEFRAME_OPTIONS = [
  { value: '7d' as TimeFrame, label: 'Últimos 7 dias' },
  { value: '30d' as TimeFrame, label: 'Últimos 30 dias' },
  { value: '90d' as TimeFrame, label: 'Últimos 90 dias' },
  { value: '1y' as TimeFrame, label: 'Último ano' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { stats, loading, error, refreshStats, lastUpdated } = useAdminStats();
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('30d');
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Memoizar função de refresh para evitar re-renders desnecessários
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      await refreshStats();
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshStats, refreshing]);

  // Memoizar formatação de data
  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) return 'Nunca';

    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}min atrás`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;

    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  }, [lastUpdated]);

  // Função auxiliar para verificar se dados existem
  const safeGet = useCallback(
    (obj: any, path: string, defaultValue: any = 0) => {
      try {
        return (
          path.split('.').reduce((current, key) => current?.[key], obj) ??
          defaultValue
        );
      } catch {
        return defaultValue;
      }
    },
    []
  );

  // Verificar se os dados estão completos
  const hasValidStats = useMemo(() => {
    return (
      stats && stats.overview && typeof stats.overview.totalUsers === 'number'
    );
  }, [stats]);

  if (error) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <AnimatedCard className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-amber rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FiShield className="w-8 h-8 text-theme-primary" />
            </div>
            <h3 className="text-xl font-bold text-theme-primary mb-2">
              Erro ao Carregar Dados
            </h3>
            <p className="text-theme-secondary mb-4">
              {typeof error === 'string'
                ? error
                : 'Erro desconhecido ao carregar as estatísticas'}
            </p>
            <Button
              variant="primary"
              onClick={handleRefresh}
              disabled={refreshing}
              leftIcon={
                <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              }
            >
              {refreshing ? 'Carregando...' : 'Tentar Novamente'}
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
              <div className="w-20 h-20 bg-gradient-to-br from-accent-blue to-accent-purple rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiBarChart2 className="w-10 h-10 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gradient-brand classical-title mb-4">
              Dashboard Administrativo
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle mb-6">
              Insights completos da plataforma de música clássica
            </p>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
              <div className="flex items-center space-x-4">
                <Select
                  value={selectedTimeframe}
                  onChange={(e) =>
                    setSelectedTimeframe(e.target.value as TimeFrame)
                  }
                  options={TIMEFRAME_OPTIONS}
                  className="input-classical-2"
                />

                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={
                    <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                  }
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                >
                  {refreshing ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </div>

              <div className="text-sm text-theme-tertiary">
                Última atualização: {formattedLastUpdated}
              </div>
            </div>
          </div>
        </AnimatedItem>

        {loading && !hasValidStats ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="text-theme-primary font-medium mt-6 text-lg">
                Carregando estatísticas...
              </p>
              <p className="text-theme-tertiary mt-2">
                Analisando dados da plataforma
              </p>
            </div>
          </div>
        ) : hasValidStats ? (
          <>
            {/* Overview Cards */}
            <AnimatedItem direction="up" springType="gentle">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Usuários */}
                <AnimatedCard className="classical-card p-6 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-full -mr-10 -mt-10" />
                  <div className="relative">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center">
                        <FiUsers className="w-6 h-6 text-theme-primary" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-theme-primary mb-2">
                      {formatNumber(safeGet(stats, 'overview.totalUsers', 0))}
                    </div>
                    <div className="text-sm text-theme-tertiary mb-2">
                      Usuários Ativos
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      {(() => {
                        const growthData = formatGrowthRate(
                          safeGet(stats, 'overview.growthRate.users', 0)
                        );
                        return (
                          <>
                            <span className={growthData.color}>
                              {growthData.isPositive ? (
                                <FiArrowUp className="w-3 h-3" />
                              ) : (
                                <FiArrowDown className="w-3 h-3" />
                              )}
                            </span>
                            <span className={`text-xs ${growthData.color}`}>
                              {growthData.formatted}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </AnimatedCard>

                {/* Obras */}
                <AnimatedCard className="classical-card p-6 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-full -mr-10 -mt-10" />
                  <div className="relative">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl flex items-center justify-center">
                        <FiMusic className="w-6 h-6 text-theme-primary" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-theme-primary mb-2">
                      {formatNumber(safeGet(stats, 'overview.totalWorks', 0))}
                    </div>
                    <div className="text-sm text-theme-tertiary mb-2">
                      Obras Catalogadas
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      {(() => {
                        const growthData = formatGrowthRate(
                          safeGet(stats, 'overview.growthRate.works', 0)
                        );
                        return (
                          <>
                            <span className={growthData.color}>
                              {growthData.isPositive ? (
                                <FiArrowUp className="w-3 h-3" />
                              ) : (
                                <FiArrowDown className="w-3 h-3" />
                              )}
                            </span>
                            <span className={`text-xs ${growthData.color}`}>
                              {growthData.formatted}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </AnimatedCard>

                {/* Anotações */}
                <AnimatedCard className="classical-card p-6 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent-amber/20 to-accent-red/20 rounded-full -mr-10 -mt-10" />
                  <div className="relative">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-amber to-accent-red rounded-2xl flex items-center justify-center">
                        <FiMessageSquare className="w-6 h-6 text-theme-primary" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-theme-primary mb-2">
                      {formatNumber(
                        safeGet(stats, 'overview.totalAnnotations', 0)
                      )}
                    </div>
                    <div className="text-sm text-theme-tertiary mb-2">
                      Anotações Criadas
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      {(() => {
                        const growthData = formatGrowthRate(
                          safeGet(stats, 'overview.growthRate.annotations', 0)
                        );
                        return (
                          <>
                            <span className={growthData.color}>
                              {growthData.isPositive ? (
                                <FiArrowUp className="w-3 h-3" />
                              ) : (
                                <FiArrowDown className="w-3 h-3" />
                              )}
                            </span>
                            <span className={`text-xs ${growthData.color}`}>
                              {growthData.formatted}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            </AnimatedItem>

            {/* Section Tabs */}
            <AnimatedItem direction="up" springType="gentle">
              <div className="flex flex-wrap gap-2 mb-8 p-2 bg-theme-elevated rounded-2xl">
                {SECTION_TABS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-theme-primary shadow-lg'
                        : 'text-theme-tertiary hover:text-theme-primary hover:bg-theme-secondary'
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </div>
            </AnimatedItem>

            {/* Users Section */}
            {activeSection === 'users' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
                {/* Most Active Users */}
                <AnimatedCard className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                    <FiActivity className="w-5 h-5 text-accent-blue" />
                    <span>Usuários Mais Ativos</span>
                  </h3>
                  <div className="space-y-4">
                    {safeGet(stats, 'topUsers.mostActive', [])
                      .slice(0, 5)
                      .map((user: any, index: number) => (
                        <div
                          key={user?.id || `active-${index}`}
                          className="flex items-center space-x-3 p-3 bg-theme-secondary rounded-xl"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-theme-primary truncate">
                              {user?.name || 'Usuário desconhecido'}
                            </p>
                            <p className="text-sm text-theme-tertiary">
                              {formatDuration(user?.totalStudyTime || 0)} de
                              estudo
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-theme-primary">
                              {user?.annotationsCount || 0} anotações
                            </p>
                            <p className="text-xs text-theme-tertiary">
                              {user?.uploadsCount || 0} uploads
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => router.push('/admin/users')}
                  >
                    Ver Todos os Usuários
                  </Button>
                </AnimatedCard>

                {/* Top Contributors */}
                <AnimatedCard className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                    <FiUpload className="w-5 h-5 text-accent-green" />
                    <span>Maiores Contribuidores</span>
                  </h3>
                  <div className="space-y-4">
                    {safeGet(stats, 'topUsers.topContributors', [])
                      .slice(0, 5)
                      .map((user: any, index: number) => (
                        <div
                          key={user?.id || `contributor-${index}`}
                          className="flex items-center space-x-3 p-3 bg-theme-secondary rounded-xl"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-theme-primary truncate">
                              {user?.name || 'Usuário desconhecido'}
                            </p>
                            <p className="text-sm text-theme-tertiary">
                              {user?.uploadsCount || 0} uploads totais
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-accent-green">
                              Score: {user?.qualityScore || 0}
                            </p>
                            <p className="text-xs text-theme-tertiary">
                              {user?.verifiedUploads || 0} verificados
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </AnimatedCard>

                {/* Top Annotators */}
                <AnimatedCard className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                    <FiMessageSquare className="w-5 h-5 text-accent-amber" />
                    <span>Maiores Anotadores</span>
                  </h3>
                  <div className="space-y-4">
                    {safeGet(stats, 'topUsers.topAnnotators', [])
                      .slice(0, 5)
                      .map((user: any, index: number) => (
                        <div
                          key={user?.id || `annotator-${index}`}
                          className="flex items-center space-x-3 p-3 bg-theme-secondary rounded-xl"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-accent-amber to-accent-red rounded-lg flex items-center justify-center text-sm font-bold text-theme-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-theme-primary truncate">
                              {user?.name || 'Usuário desconhecido'}
                            </p>
                            <p className="text-sm text-theme-tertiary">
                              {user?.annotationsCount || 0} anotações
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-accent-amber">
                              {formatPercentage(user?.avgHelpfulRatio || 0)}{' '}
                              úteis
                            </p>
                            <p className="text-xs text-theme-tertiary">
                              {user?.helpfulAnnotationsCount || 0} ajudaram
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </AnimatedCard>
              </div>
            )}

            {/* Content Section */}
            {activeSection === 'content' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Popular Works */}
                <AnimatedCard className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                    <FiMusic className="w-5 h-5 text-accent-blue" />
                    <span>Obras Mais Populares</span>
                  </h3>
                  <div className="space-y-4">
                    {safeGet(stats, 'content.popularWorks', [])
                      .slice(0, 8)
                      .map((work: any, index: number) => (
                        <div
                          key={work?.id || `work-${index}`}
                          className="flex items-start space-x-3 p-3 bg-theme-secondary rounded-xl"
                        >
                          <div className="w-6 h-6 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center text-xs font-bold text-theme-primary flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-theme-primary truncate">
                              {work?.title || 'Obra desconhecida'}
                            </p>
                            <p className="text-sm text-theme-tertiary truncate">
                              {work?.composer || 'Compositor desconhecido'}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1">
                                <FiHeart className="w-3 h-3 text-accent-red" />
                                <span className="text-xs text-theme-tertiary">
                                  {work?.favoritesCount || 0}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FiMessageSquare className="w-3 h-3 text-accent-blue" />
                                <span className="text-xs text-theme-tertiary">
                                  {work?.annotationsCount || 0}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FiFileText className="w-3 h-3 text-accent-green" />
                                <span className="text-xs text-theme-tertiary">
                                  {work?.scoreCount || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </AnimatedCard>

                {/* Popular Composers */}
                <AnimatedCard className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                    <FiUsers className="w-5 h-5 text-accent-green" />
                    <span>Compositores Mais Populares</span>
                  </h3>
                  <div className="space-y-4">
                    {safeGet(stats, 'content.popularComposers', [])
                      .slice(0, 8)
                      .map((composer: any, index: number) => (
                        <div
                          key={composer?.id || `composer-${index}`}
                          className="flex items-center space-x-3 p-3 bg-theme-secondary rounded-xl"
                        >
                          <div className="w-6 h-6 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center text-xs font-bold text-theme-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-theme-primary truncate">
                              {composer?.name || 'Compositor desconhecido'}
                            </p>
                            <p className="text-sm text-theme-tertiary">
                              {composer?.worksCount || 0} obras catalogadas
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-accent-green">
                              {composer?.totalFavorites || 0} favoritos
                            </p>
                            <p className="text-xs text-theme-tertiary">
                              {formatNumber(composer?.avgWorksPerUser || 0)}{' '}
                              obras/usuário
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </AnimatedCard>
              </div>
            )}

            {/* Engagement Section */}
            {activeSection === 'engagement' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
                {/* User Activity */}
                <AnimatedCard className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                    <FiActivity className="w-5 h-5 text-accent-blue" />
                    <span>Atividade de Usuários</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                      <div>
                        <p className="font-medium text-theme-primary">
                          Usuários Ativos Hoje
                        </p>
                        <p className="text-sm text-theme-tertiary">
                          Últimas 24 horas
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-accent-green">
                        {formatNumber(
                          safeGet(stats, 'engagement.dailyActiveUsers', 0)
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                      <div>
                        <p className="font-medium text-theme-primary">
                          Usuários Semanais
                        </p>
                        <p className="text-sm text-theme-tertiary">
                          Últimos 7 dias
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-accent-blue">
                        {formatNumber(
                          safeGet(stats, 'engagement.weeklyActiveUsers', 0)
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                      <div>
                        <p className="font-medium text-theme-primary">
                          Usuários Mensais
                        </p>
                        <p className="text-sm text-theme-tertiary">
                          Últimos 30 dias
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-accent-purple">
                        {formatNumber(
                          safeGet(stats, 'engagement.monthlyActiveUsers', 0)
                        )}
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Most Studied Works */}
                <AnimatedCard className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                    <FiTarget className="w-5 h-5 text-accent-amber" />
                    <span>Obras Mais Estudadas</span>
                  </h3>
                  <div className="space-y-3">
                    {safeGet(stats, 'engagement.mostStudiedWorks', [])
                      .slice(0, 6)
                      .map((work: any, index: number) => (
                        <div
                          key={work?.workId || `studied-${index}`}
                          className="flex items-start space-x-3 p-3 bg-theme-secondary rounded-xl"
                        >
                          <div className="w-6 h-6 bg-gradient-to-br from-accent-amber to-accent-red rounded-lg flex items-center justify-center text-xs font-bold text-theme-primary flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-theme-primary truncate text-sm">
                              {work?.title || 'Obra desconhecida'}
                            </p>
                            <p className="text-xs text-theme-tertiary truncate">
                              {work?.composer || 'Compositor desconhecido'}
                            </p>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-xs text-accent-amber font-medium">
                                {formatDuration(work?.totalMinutes || 0)}
                              </span>
                              <span className="text-xs text-theme-tertiary">
                                {work?.uniqueUsers || 0} usuários
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </AnimatedCard>

                {/* Engagement Metrics */}
                <AnimatedCard className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                    <FiPieChart className="w-5 h-5 text-accent-green" />
                    <span>Métricas de Engajamento</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-theme-secondary rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-theme-primary">
                          Sessões por Usuário
                        </span>
                        <span className="text-lg font-bold text-accent-blue">
                          {formatNumber(
                            safeGet(stats, 'engagement.avgSessionsPerUser', 0)
                          )}
                        </span>
                      </div>
                      <div className="w-full bg-theme-primary h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min(
                              safeGet(
                                stats,
                                'engagement.avgSessionsPerUser',
                                0
                              ) * 10,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-theme-secondary rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-theme-primary">
                          Anotações por Obra
                        </span>
                        <span className="text-lg font-bold text-accent-green">
                          {formatNumber(
                            safeGet(
                              stats,
                              'engagement.avgAnnotationsPerWork',
                              0
                            )
                          )}
                        </span>
                      </div>
                      <div className="w-full bg-theme-primary h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent-green to-accent-blue rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min(
                              safeGet(
                                stats,
                                'engagement.avgAnnotationsPerWork',
                                0
                              ) * 5,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            )}

            {/* Quality Section */}
            {activeSection === 'quality' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
                {/* Upload Quality */}
                <AnimatedCard className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                    <FiShield className="w-5 h-5 text-accent-green" />
                    <span>Qualidade dos Uploads</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-theme-secondary rounded-xl">
                      <div className="text-3xl font-bold text-accent-green mb-2">
                        {formatPercentage(
                          safeGet(stats, 'quality.uploadApprovalRate', 0)
                        )}
                      </div>
                      <div className="text-sm text-theme-tertiary">
                        Taxa de Aprovação
                      </div>
                    </div>

                    <div className="text-center p-4 bg-theme-secondary rounded-xl">
                      <div className="text-3xl font-bold text-accent-blue mb-2">
                        {safeGet(stats, 'quality.avgUploadQuality', 0).toFixed(
                          1
                        )}
                      </div>
                      <div className="text-sm text-theme-tertiary">
                        Score Médio de Qualidade
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Verified Content */}
                <AnimatedCard className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                    <FiAward className="w-5 h-5 text-accent-amber" />
                    <span>Conteúdo Verificado</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                      <div className="flex items-center space-x-2">
                        <FiUsers className="w-4 h-4 text-accent-blue" />
                        <span className="text-sm font-medium text-theme-primary">
                          Compositores
                        </span>
                      </div>
                      <span className="text-lg font-bold text-accent-blue">
                        {formatNumber(
                          safeGet(stats, 'quality.verifiedContent.composers', 0)
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                      <div className="flex items-center space-x-2">
                        <FiMusic className="w-4 h-4 text-accent-green" />
                        <span className="text-sm font-medium text-theme-primary">
                          Obras
                        </span>
                      </div>
                      <span className="text-lg font-bold text-accent-green">
                        {formatNumber(
                          safeGet(stats, 'quality.verifiedContent.works', 0)
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                      <div className="flex items-center space-x-2">
                        <FiFileText className="w-4 h-4 text-accent-amber" />
                        <span className="text-sm font-medium text-theme-primary">
                          Partituras
                        </span>
                      </div>
                      <span className="text-lg font-bold text-accent-amber">
                        {formatNumber(
                          safeGet(stats, 'quality.verifiedContent.scores', 0)
                        )}
                      </span>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Content Completeness */}
                <AnimatedCard className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-2">
                    <FiDatabase className="w-5 h-5 text-accent-purple" />
                    <span>Completude do Conteúdo</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-theme-secondary rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-theme-primary">
                          Compositores com Bio
                        </span>
                        <span className="text-lg font-bold text-accent-purple">
                          {formatNumber(
                            safeGet(
                              stats,
                              'quality.contentCompleteness.composersWithBio',
                              0
                            )
                          )}
                        </span>
                      </div>
                      <div className="w-full bg-theme-primary h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent-purple to-accent-blue rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min(
                              (safeGet(
                                stats,
                                'quality.contentCompleteness.composersWithBio',
                                0
                              ) /
                                Math.max(
                                  safeGet(stats, 'overview.totalComposers', 1),
                                  1
                                )) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-theme-secondary rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-theme-primary">
                          Obras com Partituras
                        </span>
                        <span className="text-lg font-bold text-accent-green">
                          {formatNumber(
                            safeGet(
                              stats,
                              'quality.contentCompleteness.worksWithScores',
                              0
                            )
                          )}
                        </span>
                      </div>
                      <div className="w-full bg-theme-primary h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent-green to-accent-blue rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min(
                              (safeGet(
                                stats,
                                'quality.contentCompleteness.worksWithScores',
                                0
                              ) /
                                Math.max(
                                  safeGet(stats, 'overview.totalWorks', 1),
                                  1
                                )) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="text-center p-3 bg-theme-secondary rounded-xl">
                      <div className="text-2xl font-bold text-accent-amber mb-1">
                        {safeGet(
                          stats,
                          'quality.contentCompleteness.avgScoresPerWork',
                          0
                        ).toFixed(1)}
                      </div>
                      <div className="text-xs text-theme-tertiary">
                        Partituras por Obra (média)
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            )}

            {/* Quick Actions */}
            <AnimatedItem direction="up" springType="gentle">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                <Button
                  variant="secondary"
                  className="h-auto p-6 flex-col"
                  onClick={() => router.push('/uploads/moderation')}
                >
                  <FiShield className="w-8 h-8 mb-3 text-accent-red" />
                  <span className="font-bold mb-2">Moderação</span>
                  <span className="text-sm text-theme-tertiary text-center">
                    Gerenciar uploads e reports pendentes
                  </span>
                </Button>

                <Button
                  variant="secondary"
                  className="h-auto p-6 flex-col"
                  onClick={() => router.push('/admin/users')}
                >
                  <FiUsers className="w-8 h-8 mb-3 text-accent-blue" />
                  <span className="font-bold mb-2">Usuários</span>
                  <span className="text-sm text-theme-tertiary text-center">
                    Visualizar e gerenciar usuários
                  </span>
                </Button>

                <Button
                  variant="secondary"
                  className="h-auto p-6 flex-col"
                  onClick={() => router.push('/admin/reports')}
                >
                  <FiBarChart2 className="w-8 h-8 mb-3 text-accent-green" />
                  <span className="font-bold mb-2">Relatórios</span>
                  <span className="text-sm text-theme-tertiary text-center">
                    Análises detalhadas e métricas
                  </span>
                </Button>
              </div>
            </AnimatedItem>
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[50vh]">
            <AnimatedCard className="classical-card p-8 text-center max-w-md">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-amber to-accent-red rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FiDatabase className="w-8 h-8 text-theme-primary" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary mb-2">
                Sem Dados Disponíveis
              </h3>
              <p className="text-theme-secondary mb-4">
                Não foi possível carregar as estatísticas do dashboard.
              </p>
              <Button
                variant="primary"
                onClick={handleRefresh}
                disabled={refreshing}
                leftIcon={
                  <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                }
              >
                {refreshing ? 'Carregando...' : 'Tentar Novamente'}
              </Button>
            </AnimatedCard>
          </div>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
}
