// app/components/Admin/AdminDashboard.tsx
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  PiArrowDown,
  PiArrowUp,
  PiArrowsClockwise,
  PiChartBar,
  PiChartPie,
  PiChatCenteredText,
  PiDatabase,
  PiFileText,
  PiHeart,
  PiMedal,
  PiMusicNotes,
  PiPulse,
  PiShield,
  PiTarget,
  PiUploadSimple,
  PiUsers,
} from 'react-icons/pi';

import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import { useAdminStats } from '@/app/hooks/admin/useAdminStats';
import {
  formatDuration,
  formatGrowthRate,
  formatNumber,
  formatPercentage,
} from '../../Utils';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

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
  { id: 'overview', label: 'Visão Geral', icon: PiChartBar },
  { id: 'users', label: 'Usuários', icon: PiUsers },
  { id: 'content', label: 'Conteúdo', icon: PiMusicNotes },
  { id: 'engagement', label: 'Engajamento', icon: PiPulse },
  { id: 'quality', label: 'Qualidade', icon: PiShield },
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
            <div className="w-16 h-16 bg-erro rounded-3xl flex items-center justify-center mx-auto mb-4">
              <PiShield className="w-8 h-8 text-theme-primary" />
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
                <PiArrowsClockwise
                  className={refreshing ? 'animate-spin' : ''}
                />
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
              <div className="w-20 h-20 bg-aviso rounded-3xl flex items-center justify-center shadow-theme-glow">
                <PiChartBar className="w-10 h-10 text-theme-primary" />
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
              <Inline gap={4}>
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
                    <PiArrowsClockwise
                      className={refreshing ? 'animate-spin' : ''}
                    />
                  }
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                >
                  {refreshing ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </Inline>

              <Text papel="rotulo" tom="fraco" as="div">
                Última atualização: {formattedLastUpdated}
              </Text>
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
                  <div className="absolute top-0 right-0 w-20 h-20 bg-aviso/20 rounded-full -mr-10 -mt-10" />
                  <div className="relative">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-aviso rounded-2xl flex items-center justify-center">
                        <PiUsers className="w-6 h-6 text-theme-primary" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-theme-primary mb-2">
                      {formatNumber(safeGet(stats, 'overview.totalUsers', 0))}
                    </div>
                    <Text papel="rotulo" tom="fraco" as="div" className="mb-2">
                      Usuários Ativos
                    </Text>
                    <Inline gap={1} className="justify-center">
                      {(() => {
                        const growthData = formatGrowthRate(
                          safeGet(stats, 'overview.growthRate.users', 0)
                        );
                        return (
                          <>
                            <span className={growthData.color}>
                              {growthData.isPositive ? (
                                <PiArrowUp className="w-3 h-3" />
                              ) : (
                                <PiArrowDown className="w-3 h-3" />
                              )}
                            </span>
                            <span className={`text-xs ${growthData.color}`}>
                              {growthData.formatted}
                            </span>
                          </>
                        );
                      })()}
                    </Inline>
                  </div>
                </AnimatedCard>

                {/* Obras */}
                <AnimatedCard className="classical-card p-6 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-ok/20 rounded-full -mr-10 -mt-10" />
                  <div className="relative">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-ok rounded-2xl flex items-center justify-center">
                        <PiMusicNotes className="w-6 h-6 text-theme-primary" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-theme-primary mb-2">
                      {formatNumber(safeGet(stats, 'overview.totalWorks', 0))}
                    </div>
                    <Text papel="rotulo" tom="fraco" as="div" className="mb-2">
                      Obras Catalogadas
                    </Text>
                    <Inline gap={1} className="justify-center">
                      {(() => {
                        const growthData = formatGrowthRate(
                          safeGet(stats, 'overview.growthRate.works', 0)
                        );
                        return (
                          <>
                            <span className={growthData.color}>
                              {growthData.isPositive ? (
                                <PiArrowUp className="w-3 h-3" />
                              ) : (
                                <PiArrowDown className="w-3 h-3" />
                              )}
                            </span>
                            <span className={`text-xs ${growthData.color}`}>
                              {growthData.formatted}
                            </span>
                          </>
                        );
                      })()}
                    </Inline>
                  </div>
                </AnimatedCard>

                {/* Anotações */}
                <AnimatedCard className="classical-card p-6 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-atencao/20 rounded-full -mr-10 -mt-10" />
                  <div className="relative">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-atencao rounded-2xl flex items-center justify-center">
                        <PiChatCenteredText className="w-6 h-6 text-theme-primary" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-theme-primary mb-2">
                      {formatNumber(
                        safeGet(stats, 'overview.totalAnnotations', 0)
                      )}
                    </div>
                    <Text papel="rotulo" tom="fraco" as="div" className="mb-2">
                      Anotações Criadas
                    </Text>
                    <Inline gap={1} className="justify-center">
                      {(() => {
                        const growthData = formatGrowthRate(
                          safeGet(stats, 'overview.growthRate.annotations', 0)
                        );
                        return (
                          <>
                            <span className={growthData.color}>
                              {growthData.isPositive ? (
                                <PiArrowUp className="w-3 h-3" />
                              ) : (
                                <PiArrowDown className="w-3 h-3" />
                              )}
                            </span>
                            <span className={`text-xs ${growthData.color}`}>
                              {growthData.formatted}
                            </span>
                          </>
                        );
                      })()}
                    </Inline>
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
                        ? 'fill-ouro text-theme-primary shadow-lg'
                        : 'text-theme-tertiary hover:text-texto hover:bg-sup-1'
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
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-xl font-bold text-theme-primary mb-6"
                  >
                    <PiPulse className="w-5 h-5 text-aviso" />
                    <span>Usuários Mais Ativos</span>
                  </Inline>
                  <Stack>
                    {safeGet(stats, 'topUsers.mostActive', [])
                      .slice(0, 5)
                      .map((user: any, index: number) => (
                        <Inline
                          gap={3}
                          key={user?.id || `active-${index}`}
                          className="p-3 bg-theme-secondary rounded-xl"
                        >
                          <Text
                            papel="rotulo"
                            tom="forte"
                            as="div"
                            className="w-8 h-8 bg-aviso rounded-lg flex items-center justify-center font-bold"
                          >
                            {index + 1}
                          </Text>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-theme-primary truncate">
                              {user?.name || 'Usuário desconhecido'}
                            </p>
                          </div>
                          <div className="text-right">
                            <Text
                              papel="rotulo"
                              tom="forte"
                              as="p"
                              className="font-medium"
                            >
                              {user?.annotationsCount || 0} anotações
                            </Text>
                            <Text papel="legenda" tom="fraco" as="p">
                              {user?.uploadsCount || 0} uploads
                            </Text>
                          </div>
                        </Inline>
                      ))}
                  </Stack>
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
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-xl font-bold text-theme-primary mb-6"
                  >
                    <PiUploadSimple className="w-5 h-5 text-ok" />
                    <span>Maiores Contribuidores</span>
                  </Inline>
                  <Stack>
                    {safeGet(stats, 'topUsers.topContributors', [])
                      .slice(0, 5)
                      .map((user: any, index: number) => (
                        <Inline
                          gap={3}
                          key={user?.id || `contributor-${index}`}
                          className="p-3 bg-theme-secondary rounded-xl"
                        >
                          <Text
                            papel="rotulo"
                            tom="forte"
                            as="div"
                            className="w-8 h-8 bg-ok rounded-lg flex items-center justify-center font-bold"
                          >
                            {index + 1}
                          </Text>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-theme-primary truncate">
                              {user?.name || 'Usuário desconhecido'}
                            </p>
                            <Text papel="rotulo" tom="fraco" as="p">
                              {user?.uploadsCount || 0} uploads totais
                            </Text>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-ok">
                              Score: {user?.qualityScore || 0}
                            </p>
                            <Text papel="legenda" tom="fraco" as="p">
                              {user?.verifiedUploads || 0} verificados
                            </Text>
                          </div>
                        </Inline>
                      ))}
                  </Stack>
                </AnimatedCard>

                {/* Top Annotators */}
                <AnimatedCard className="classical-card p-6">
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-xl font-bold text-theme-primary mb-6"
                  >
                    <PiChatCenteredText className="w-5 h-5 text-atencao" />
                    <span>Maiores Anotadores</span>
                  </Inline>
                  <Stack>
                    {safeGet(stats, 'topUsers.topAnnotators', [])
                      .slice(0, 5)
                      .map((user: any, index: number) => (
                        <Inline
                          gap={3}
                          key={user?.id || `annotator-${index}`}
                          className="p-3 bg-theme-secondary rounded-xl"
                        >
                          <Text
                            papel="rotulo"
                            tom="forte"
                            as="div"
                            className="w-8 h-8 bg-atencao rounded-lg flex items-center justify-center font-bold"
                          >
                            {index + 1}
                          </Text>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-theme-primary truncate">
                              {user?.name || 'Usuário desconhecido'}
                            </p>
                            <Text papel="rotulo" tom="fraco" as="p">
                              {user?.annotationsCount || 0} anotações
                            </Text>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-atencao">
                              {formatPercentage(user?.avgHelpfulRatio || 0)}{' '}
                              úteis
                            </p>
                            <Text papel="legenda" tom="fraco" as="p">
                              {user?.helpfulAnnotationsCount || 0} ajudaram
                            </Text>
                          </div>
                        </Inline>
                      ))}
                  </Stack>
                </AnimatedCard>
              </div>
            )}

            {/* Content Section */}
            {activeSection === 'content' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Popular Works */}
                <AnimatedCard className="classical-card p-6">
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-xl font-bold text-theme-primary mb-6"
                  >
                    <PiMusicNotes className="w-5 h-5 text-aviso" />
                    <span>Obras Mais Populares</span>
                  </Inline>
                  <Stack>
                    {safeGet(stats, 'content.popularWorks', [])
                      .slice(0, 8)
                      .map((work: any, index: number) => (
                        <div
                          key={work?.id || `work-${index}`}
                          className="flex items-start space-x-3 p-3 bg-theme-secondary rounded-xl"
                        >
                          <Text
                            papel="legenda"
                            tom="forte"
                            as="div"
                            className="w-6 h-6 bg-aviso rounded-lg flex items-center justify-center font-bold flex-shrink-0 mt-0.5"
                          >
                            {index + 1}
                          </Text>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-theme-primary truncate">
                              {work?.title || 'Obra desconhecida'}
                            </p>
                            <Text
                              papel="rotulo"
                              tom="fraco"
                              as="p"
                              className="truncate"
                            >
                              {work?.composer || 'Compositor desconhecido'}
                            </Text>
                            <Inline gap={4} className="mt-2">
                              <Inline gap={1}>
                                <PiHeart className="w-3 h-3 text-erro" />
                                <Text papel="legenda" tom="fraco">
                                  {work?.favoritesCount || 0}
                                </Text>
                              </Inline>
                              <Inline gap={1}>
                                <PiChatCenteredText className="w-3 h-3 text-aviso" />
                                <Text papel="legenda" tom="fraco">
                                  {work?.annotationsCount || 0}
                                </Text>
                              </Inline>
                              <Inline gap={1}>
                                <PiFileText className="w-3 h-3 text-ok" />
                                <Text papel="legenda" tom="fraco">
                                  {work?.scoreCount || 0}
                                </Text>
                              </Inline>
                            </Inline>
                          </div>
                        </div>
                      ))}
                  </Stack>
                </AnimatedCard>

                {/* Popular Composers */}
                <AnimatedCard className="classical-card p-6">
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-xl font-bold text-theme-primary mb-6"
                  >
                    <PiUsers className="w-5 h-5 text-ok" />
                    <span>Compositores Mais Populares</span>
                  </Inline>
                  <Stack>
                    {safeGet(stats, 'content.popularComposers', [])
                      .slice(0, 8)
                      .map((composer: any, index: number) => (
                        <Inline
                          gap={3}
                          key={composer?.id || `composer-${index}`}
                          className="p-3 bg-theme-secondary rounded-xl"
                        >
                          <Text
                            papel="legenda"
                            tom="forte"
                            as="div"
                            className="w-6 h-6 bg-ok rounded-lg flex items-center justify-center font-bold"
                          >
                            {index + 1}
                          </Text>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-theme-primary truncate">
                              {composer?.name || 'Compositor desconhecido'}
                            </p>
                            <Text papel="rotulo" tom="fraco" as="p">
                              {composer?.worksCount || 0} obras catalogadas
                            </Text>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-ok">
                              {composer?.totalFavorites || 0} favoritos
                            </p>
                            <Text papel="legenda" tom="fraco" as="p">
                              {formatNumber(composer?.avgWorksPerUser || 0)}{' '}
                              obras/usuário
                            </Text>
                          </div>
                        </Inline>
                      ))}
                  </Stack>
                </AnimatedCard>
              </div>
            )}

            {/* Engagement Section */}
            {activeSection === 'engagement' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
                {/* User Activity */}
                <AnimatedCard className="classical-card p-6">
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-xl font-bold text-theme-primary mb-6"
                  >
                    <PiPulse className="w-5 h-5 text-aviso" />
                    <span>Atividade de Usuários</span>
                  </Inline>
                  <Stack>
                    <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                      <div>
                        <p className="font-medium text-theme-primary">
                          Usuários Ativos Hoje
                        </p>
                        <Text papel="rotulo" tom="fraco" as="p">
                          Últimas 24 horas
                        </Text>
                      </div>
                      <div className="text-2xl font-bold text-ok">
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
                        <Text papel="rotulo" tom="fraco" as="p">
                          Últimos 7 dias
                        </Text>
                      </div>
                      <div className="text-2xl font-bold text-aviso">
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
                        <Text papel="rotulo" tom="fraco" as="p">
                          Últimos 30 dias
                        </Text>
                      </div>
                      <div className="text-2xl font-bold text-ouro-texto">
                        {formatNumber(
                          safeGet(stats, 'engagement.monthlyActiveUsers', 0)
                        )}
                      </div>
                    </div>
                  </Stack>
                </AnimatedCard>

                {/* Most Studied Works */}
                <AnimatedCard className="classical-card p-6">
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-xl font-bold text-theme-primary mb-6"
                  >
                    <PiTarget className="w-5 h-5 text-atencao" />
                    <span>Obras Mais Estudadas</span>
                  </Inline>
                  <Stack gap={3}>
                    {safeGet(stats, 'engagement.mostStudiedWorks', [])
                      .slice(0, 6)
                      .map((work: any, index: number) => (
                        <div
                          key={work?.workId || `studied-${index}`}
                          className="flex items-start space-x-3 p-3 bg-theme-secondary rounded-xl"
                        >
                          <Text
                            papel="legenda"
                            tom="forte"
                            as="div"
                            className="w-6 h-6 bg-atencao rounded-lg flex items-center justify-center font-bold flex-shrink-0 mt-0.5"
                          >
                            {index + 1}
                          </Text>
                          <div className="flex-1 min-w-0">
                            <Text
                              papel="rotulo"
                              tom="forte"
                              as="p"
                              className="font-medium truncate"
                            >
                              {work?.title || 'Obra desconhecida'}
                            </Text>
                            <Text
                              papel="legenda"
                              tom="fraco"
                              as="p"
                              className="truncate"
                            >
                              {work?.composer || 'Compositor desconhecido'}
                            </Text>
                            <Inline gap={3} className="mt-1">
                              <span className="text-xs text-atencao font-medium">
                                {formatDuration(work?.totalMinutes || 0)}
                              </span>
                              <Text papel="legenda" tom="fraco">
                                {work?.uniqueUsers || 0} usuários
                              </Text>
                            </Inline>
                          </div>
                        </div>
                      ))}
                  </Stack>
                </AnimatedCard>

                {/* Engagement Metrics */}
                <AnimatedCard className="classical-card p-6">
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-xl font-bold text-theme-primary mb-6"
                  >
                    <PiChartPie className="w-5 h-5 text-ok" />
                    <span>Métricas de Engajamento</span>
                  </Inline>
                  <Stack>
                    <Stack
                      gap={2}
                      className="p-3 bg-theme-secondary rounded-xl"
                    >
                      <div className="flex items-center justify-between">
                        <Text
                          papel="rotulo"
                          tom="forte"
                          className="font-medium"
                        >
                          Sessões por Usuário
                        </Text>
                        <span className="text-lg font-bold text-aviso">
                          {formatNumber(
                            safeGet(stats, 'engagement.avgSessionsPerUser', 0)
                          )}
                        </span>
                      </div>
                      <div className="w-full bg-theme-primary h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-aviso rounded-full transition-all duration-1000"
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
                    </Stack>

                    <Stack
                      gap={2}
                      className="p-3 bg-theme-secondary rounded-xl"
                    >
                      <div className="flex items-center justify-between">
                        <Text
                          papel="rotulo"
                          tom="forte"
                          className="font-medium"
                        >
                          Anotações por Obra
                        </Text>
                        <span className="text-lg font-bold text-ok">
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
                          className="h-full bg-ok rounded-full transition-all duration-1000"
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
                    </Stack>
                  </Stack>
                </AnimatedCard>
              </div>
            )}

            {/* Quality Section */}
            {activeSection === 'quality' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
                {/* Upload Quality */}
                <AnimatedCard className="classical-card p-6">
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-xl font-bold text-theme-primary mb-6"
                  >
                    <PiShield className="w-5 h-5 text-ok" />
                    <span>Qualidade dos Uploads</span>
                  </Inline>
                  <Stack>
                    <Stack
                      gap={2}
                      className="text-center p-4 bg-theme-secondary rounded-xl"
                    >
                      <div className="text-3xl font-bold text-ok">
                        {formatPercentage(
                          safeGet(stats, 'quality.uploadApprovalRate', 0)
                        )}
                      </div>
                      <Text papel="rotulo" tom="fraco" as="div">
                        Taxa de Aprovação
                      </Text>
                    </Stack>

                    <Stack
                      gap={2}
                      className="text-center p-4 bg-theme-secondary rounded-xl"
                    >
                      <div className="text-3xl font-bold text-aviso">
                        {safeGet(stats, 'quality.avgUploadQuality', 0).toFixed(
                          1
                        )}
                      </div>
                      <Text papel="rotulo" tom="fraco" as="div">
                        Score Médio de Qualidade
                      </Text>
                    </Stack>
                  </Stack>
                </AnimatedCard>

                {/* Verified Content */}
                <AnimatedCard className="classical-card p-6">
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-xl font-bold text-theme-primary mb-6"
                  >
                    <PiMedal className="w-5 h-5 text-atencao" />
                    <span>Conteúdo Verificado</span>
                  </Inline>
                  <Stack gap={3}>
                    <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                      <Inline gap={2}>
                        <PiUsers className="w-4 h-4 text-aviso" />
                        <Text
                          papel="rotulo"
                          tom="forte"
                          className="font-medium"
                        >
                          Compositores
                        </Text>
                      </Inline>
                      <span className="text-lg font-bold text-aviso">
                        {formatNumber(
                          safeGet(stats, 'quality.verifiedContent.composers', 0)
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                      <Inline gap={2}>
                        <PiMusicNotes className="w-4 h-4 text-ok" />
                        <Text
                          papel="rotulo"
                          tom="forte"
                          className="font-medium"
                        >
                          Obras
                        </Text>
                      </Inline>
                      <span className="text-lg font-bold text-ok">
                        {formatNumber(
                          safeGet(stats, 'quality.verifiedContent.works', 0)
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
                      <Inline gap={2}>
                        <PiFileText className="w-4 h-4 text-atencao" />
                        <Text
                          papel="rotulo"
                          tom="forte"
                          className="font-medium"
                        >
                          Partituras
                        </Text>
                      </Inline>
                      <span className="text-lg font-bold text-atencao">
                        {formatNumber(
                          safeGet(stats, 'quality.verifiedContent.scores', 0)
                        )}
                      </span>
                    </div>
                  </Stack>
                </AnimatedCard>

                {/* Content Completeness */}
                <AnimatedCard className="classical-card p-6">
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-xl font-bold text-theme-primary mb-6"
                  >
                    <PiDatabase className="w-5 h-5 text-ouro-texto" />
                    <span>Completude do Conteúdo</span>
                  </Inline>
                  <Stack>
                    <Stack
                      gap={2}
                      className="p-3 bg-theme-secondary rounded-xl"
                    >
                      <div className="flex items-center justify-between">
                        <Text
                          papel="rotulo"
                          tom="forte"
                          className="font-medium"
                        >
                          Compositores com Bio
                        </Text>
                        <span className="text-lg font-bold text-ouro-texto">
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
                          className="h-full fill-ouro rounded-full transition-all duration-1000"
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
                    </Stack>

                    <Stack
                      gap={2}
                      className="p-3 bg-theme-secondary rounded-xl"
                    >
                      <div className="flex items-center justify-between">
                        <Text
                          papel="rotulo"
                          tom="forte"
                          className="font-medium"
                        >
                          Obras com Partituras
                        </Text>
                        <span className="text-lg font-bold text-ok">
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
                          className="h-full bg-ok rounded-full transition-all duration-1000"
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
                    </Stack>

                    <Stack
                      gap={1}
                      className="text-center p-3 bg-theme-secondary rounded-xl"
                    >
                      <div className="text-2xl font-bold text-atencao">
                        {safeGet(
                          stats,
                          'quality.contentCompleteness.avgScoresPerWork',
                          0
                        ).toFixed(1)}
                      </div>
                      <Text papel="legenda" tom="fraco" as="div">
                        Partituras por Obra (média)
                      </Text>
                    </Stack>
                  </Stack>
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
                  <PiShield className="w-8 h-8 mb-3 text-erro" />
                  <span className="font-bold mb-2">Moderação</span>
                  <Text papel="rotulo" tom="fraco" className="text-center">
                    Gerenciar uploads e reports pendentes
                  </Text>
                </Button>

                <Button
                  variant="secondary"
                  className="h-auto p-6 flex-col"
                  onClick={() => router.push('/admin/users')}
                >
                  <PiUsers className="w-8 h-8 mb-3 text-aviso" />
                  <span className="font-bold mb-2">Usuários</span>
                  <Text papel="rotulo" tom="fraco" className="text-center">
                    Visualizar e gerenciar usuários
                  </Text>
                </Button>

                <Button
                  variant="secondary"
                  className="h-auto p-6 flex-col"
                  onClick={() => router.push('/admin/reports')}
                >
                  <PiChartBar className="w-8 h-8 mb-3 text-ok" />
                  <span className="font-bold mb-2">Relatórios</span>
                  <Text papel="rotulo" tom="fraco" className="text-center">
                    Análises detalhadas e métricas
                  </Text>
                </Button>
              </div>
            </AnimatedItem>
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[50vh]">
            <AnimatedCard className="classical-card p-8 text-center max-w-md">
              <div className="w-16 h-16 bg-atencao rounded-3xl flex items-center justify-center mx-auto mb-4">
                <PiDatabase className="w-8 h-8 text-theme-primary" />
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
                  <PiArrowsClockwise
                    className={refreshing ? 'animate-spin' : ''}
                  />
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
