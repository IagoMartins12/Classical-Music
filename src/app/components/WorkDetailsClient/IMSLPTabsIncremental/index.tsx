// components/IMSLPTabsIncremental.tsx - Versão Corrigida com Imports
'use client';

import { useState, useRef } from 'react';
import {
  FiMusic,
  FiFileText,
  FiRefreshCw,
  FiAlertCircle,
  FiBookOpen,
  FiMoreHorizontal,
  FiLayers,
  FiTrendingUp,
  FiDownload,
  FiTarget,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import ScoreCard from '../ScoreCard';
import {
  IMSLPScore,
  IMSLPWorkScoresIncremental,
} from '@/app/libs/imslp-score-scraper-incremental';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  SequentialGrid,
} from '../../animation/AnimatedComponents';
import { useScoreFavorites } from '@/app/hooks/useScoreFavorites';
import ScorePreview from '../ScorePreview';
import StudyModeButton from '../../StudyMode/StudyModeButton';
import {
  getTabLabel,
  getTabStatistics,
  TabStatistics,
} from '@/app/utils/type-utils'; // 🆕 Import corrigido

interface IMSLPTabsIncrementalProps {
  imslpData: IMSLPWorkScoresIncremental | null;
  loading?: boolean;
  loadingMore?: boolean;
  error?: string | null;
  onRefetch?: () => void;
  onLoadMore?: (amount?: number, specificType?: string) => void;
  onLoadMoreForTab?: (tabType: string, amount?: number) => void;
  onLoadAll?: () => void;
  onScoreSelect?: (score: IMSLPScore) => void;
  workId?: string;
  workTitle?: string;
  composerName?: string;

  // Estados de carregamento incremental
  hasMore?: boolean;
  totalAvailable?: number;
  currentLoaded?: number;
  backgroundCaching?: boolean;
  cacheProgress?: number;

  // 🆕 Função para obter estatísticas de tab corrigida
  getTabStats?: (tabType: string) => TabStatistics;

  // Props de favoritos (mantidas)
  mostFavoritedScoreId?: string | null;
  mostFavoritedSource?: string;
  hasMostFavorited?: boolean;
  loadingMostFavorited?: boolean;
  isScoreMostFavorited?: (scoreId: string, scoreSource?: string) => boolean;
}

interface TabInfo {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type: keyof IMSLPWorkScoresIncremental['scoresByType'];
  gradient: string;
}

const TABS: TabInfo[] = [
  {
    id: 'scores',
    label: 'Partituras',
    icon: FiMusic,
    type: 'scores',
    gradient: 'from-brand-primary to-brand-secondary',
  },
  {
    id: 'parts',
    label: 'Partes',
    icon: FiFileText,
    type: 'parts',
    gradient: 'from-accent-blue to-accent-purple',
  },
  {
    id: 'arrangements',
    label: 'Arranjos',
    icon: GiMusicalNotes,
    type: 'arrangements',
    gradient: 'from-accent-green to-accent-blue',
  },
  {
    id: 'librettos',
    label: 'Libretos',
    icon: FiFileText,
    type: 'librettos',
    gradient: 'from-accent-purple to-accent-red',
  },
  {
    id: 'others',
    label: 'Outros',
    icon: FiFileText,
    type: 'others',
    gradient: 'from-accent-red to-accent-purple',
  },
  {
    id: 'sources',
    label: 'Arquivos Fonte',
    icon: FiFileText,
    type: 'sources',
    gradient: 'from-accent-purple to-accent-blue',
  },
];

export default function IMSLPTabsIncremental({
  imslpData,
  loading,
  loadingMore,
  error,
  onRefetch,
  onLoadMoreForTab,
  onLoadAll,
  onScoreSelect,
  workId,
  workTitle,
  composerName,
  totalAvailable = 0,
  currentLoaded = 0,

  getTabStats,
  isScoreMostFavorited,
}: IMSLPTabsIncrementalProps) {
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (!imslpData) return 'scores';
    const firstTabWithContent = TABS.find(
      (tab) => imslpData.totalCounts[tab.type] > 0
    );
    return firstTabWithContent?.id || 'scores';
  });

  const [selectedScore, setSelectedScore] = useState<IMSLPScore | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Hook para estatísticas de favoritos
  const {
    stats: favoriteStats,
    loading: loadingFavorites,
    mostFavorited,
    refetch: refetchFavorites,
    getScoreStats,
  } = useScoreFavorites(workId || '');

  const handleScoreSelect = (score: IMSLPScore) => {
    if (selectedScore?.id === score.id) {
      setSelectedScore(null);
      onScoreSelect?.(null as any);
    } else {
      setSelectedScore(score);
      onScoreSelect?.(score);
    }
  };

  // 🆕 Obter estatísticas da tab ativa corrigido
  const activeTabStats: TabStatistics = getTabStats
    ? getTabStats(activeTab)
    : getTabStatistics(
        activeTab,
        imslpData?.loadedCounts || {},
        imslpData?.totalCounts || {}
      );

  // 🆕 Função para renderizar botões dinâmicos específicos da tab
  const renderTabSpecificButtons = () => {
    if (!activeTabStats.hasMore) {
      return (
        <div className="flex flex-col items-center space-y-4 py-8 border-t border-theme-secondary">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiTarget className="w-8 h-8 text-theme-primary" />
            </div>
            <h3 className="text-lg font-semibold text-theme-primary mb-2">
              Todas as {getTabLabel(activeTab).toLowerCase()} carregadas!
            </h3>
            <p className="text-theme-secondary text-sm">
              Você visualizou todas as {activeTabStats.total}{' '}
              {getTabLabel(activeTab).toLowerCase()} disponíveis.
            </p>
          </div>
        </div>
      );
    }

    const buttons = [];

    // 🆕 Botão "Carregar Mais" específico da tab - sempre disponível se há mais
    if (activeTabStats.remaining >= 1) {
      const loadAmount = Math.min(20, activeTabStats.remaining);
      buttons.push(
        <button
          key="load-more-tab"
          onClick={() => onLoadMoreForTab?.(activeTab, loadAmount)}
          disabled={loadingMore}
          className="btn-classical-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingMore ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Carregando...</span>
            </>
          ) : (
            <>
              <FiMoreHorizontal className="w-4 h-4" />
              <span>
                Carregar Mais {getTabLabel(activeTab)} (
                {Math.min(20, activeTabStats.remaining)})
              </span>
            </>
          )}
        </button>
      );
    }

    // 🆕 Botão "Carregar Todas desta Tab" - se há mais de 20 restantes
    if (activeTabStats.remaining > 20) {
      buttons.push(
        <button
          key="load-all-tab"
          onClick={() =>
            onLoadMoreForTab?.(activeTab, activeTabStats.remaining)
          }
          disabled={loadingMore}
          className="btn-classical-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiDownload className="w-4 h-4" />
          <span>
            Carregar Todas as {getTabLabel(activeTab)} (
            {activeTabStats.remaining} restantes)
          </span>
        </button>
      );
    }

    // 🆕 Botão "Carregar Todas as Partituras" - apenas se há outras tabs com partituras
    const globalRemaining = totalAvailable - currentLoaded;
    if (globalRemaining > activeTabStats.remaining && globalRemaining > 0) {
      buttons.push(
        <button
          key="load-all-global"
          onClick={onLoadAll}
          disabled={loadingMore}
          className="btn-classical-accent flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiLayers className="w-4 h-4" />
          <span>
            Carregar Todas as Partituras ({globalRemaining} restantes)
          </span>
        </button>
      );
    }

    return buttons;
  };

  // Estados de carregamento
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRefetch={onRefetch} />;
  }

  if (!imslpData) {
    return <EmptyState />;
  }

  const visibleTabs = TABS.filter((tab) => imslpData.totalCounts[tab.type] > 0);
  const activeTabData =
    imslpData.scoresByType[activeTab as keyof typeof imslpData.scoresByType] ||
    [];

  return (
    <AnimatedCard hover="none" className="classical-card overflow-hidden">
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        <div className="classical-card overflow-hidden animate-fade-in-up">
          {/* Header com estatísticas */}
          <div className="border-b border-theme-secondary bg-gradient-to-r from-theme-primary to-theme-elevated">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center">
                    <FiMusic className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-theme-primary classical-title">
                      Partituras IMSLP
                    </h2>
                    <div className="flex items-center space-x-2">
                      <p className="text-theme-secondary classical-subtitle">
                        {selectedScore
                          ? `Partitura selecionada: ${selectedScore.title}`
                          : 'Selecione uma partitura para estudo'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                {selectedScore && workId && workTitle && composerName && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-theme-elevated/50 border border-theme-primary/30 rounded-xl px-4 py-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
                        <span className="text-theme-secondary font-medium">
                          Partitura selecionada para estudo
                        </span>
                      </div>
                    </div>
                    <StudyModeButton
                      workId={workId}
                      workTitle={workTitle}
                      composerName={composerName}
                      selectedScore={selectedScore}
                      variant="compact"
                    />
                  </div>
                )}
              </div>

              {/* 🆕 Barra de progresso da tab ativa */}
              {/* {activeTabStats.total > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-theme-tertiary mb-2">
                    <span>
                      Progresso da tab ativa: {getTabLabel(activeTab)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span>{activeTabStats.progress}%</span>
                      <span className="text-xs">
                        ({activeTabStats.loaded}/{activeTabStats.total})
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-theme-elevated border border-theme-primary/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-accent-blue to-accent-purple h-2 rounded-full transition-all duration-500"
                      style={{ width: `${activeTabStats.progress}%` }}
                    ></div>
                  </div>
                </div>
              )} */}

              {/* Barra de progresso geral */}
              {/* {totalAvailable > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm text-theme-tertiary mb-2">
                    <span>Progresso geral</span>
                    <div className="flex items-center space-x-2">
                      <span>{progressPercentage}%</span>
                      <span className="text-xs">
                        ({currentLoaded}/{totalAvailable})
                      </span>
                      {backgroundCaching && (
                        <div className="flex items-center space-x-1 text-accent-green">
                          <FiZap className="w-3 h-3" />
                          <span>Cache: {cacheProgress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-theme-elevated border border-theme-primary/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-brand-primary to-brand-secondary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>

                  {/* Barra de cache em background */}
              {/* {backgroundCaching && (
                    <div className="w-full bg-accent-green/20 border border-accent-green/30 rounded-full h-1 mt-1">
                      <div
                        className="bg-gradient-to-r from-accent-green to-accent-blue h-1 rounded-full transition-all duration-500"
                        style={{ width: `${cacheProgress}%` }}
                      ></div>
                    </div>
                  )} */}
              {/* </div> */}
              {/* )} */}

              {/* Estatísticas de favoritos destacadas */}
              {!loadingFavorites && favoriteStats.length > 0 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-accent-red/5 to-accent-gold/5 border border-accent-red/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <FiTrendingUp className="w-4 h-4 text-accent-red" />
                        <span className="text-sm font-medium text-theme-primary">
                          Estatísticas de Favoritos
                        </span>
                      </div>
                      <div className="text-xs text-theme-secondary space-x-4">
                        <span>
                          Total:{' '}
                          {favoriteStats.reduce(
                            (sum, stat) => sum + stat.totalFavorites,
                            0
                          )}{' '}
                          favoritos
                        </span>
                        <span>•</span>
                        <span>
                          {favoriteStats.length} partituras favoritadas
                        </span>
                        {mostFavorited && (
                          <>
                            <span>•</span>
                            <span>
                              Líder: {mostFavorited.totalFavorites} favoritos
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={refetchFavorites}
                      className="text-xs text-theme-tertiary hover:text-theme-primary transition-colors flex items-center space-x-1"
                      title="Atualizar estatísticas"
                    >
                      <FiRefreshCw className="w-3 h-3" />
                      <span>Atualizar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs Navigation */}
            <nav className="flex scrollbar-hide px-6" aria-label="Tabs">
              {visibleTabs.map((tab, index) => {
                const Icon = tab.icon;
                const totalCount = imslpData.totalCounts[tab.type];
                const loadedCount = imslpData.loadedCounts[tab.type];
                const isActive = activeTab === tab.id;
                const tabStats: TabStatistics = getTabStats
                  ? getTabStats(tab.id)
                  : getTabStatistics(
                      tab.id,
                      imslpData.loadedCounts,
                      imslpData.totalCounts
                    );

                return (
                  <AnimatedItem key={tab.id} hover="scale" springType="bouncy">
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-3 px-6 py-4 cursor-pointer text-sm font-medium border-b-2 transition-all duration-300 whitespace-nowrap flex-shrink-0 animate-fade-in-up relative
                        ${
                          isActive
                            ? 'border-brand-primary text-brand-primary bg-gradient-to-t from-brand-primary/10 to-transparent'
                            : 'border-transparent text-theme-tertiary hover:text-theme-primary hover:border-theme-primary hover:bg-interactive-hover'
                        }
                      `}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? `bg-gradient-to-br ${tab.gradient} text-theme-primary shadow-theme-glow`
                            : 'bg-theme-elevated text-theme-tertiary'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="font-semibold">{tab.label}</span>

                      {/* 🆕 Contador com progresso melhorado e indicadores visuais */}
                      <div className="flex items-center space-x-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                            isActive
                              ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30'
                              : 'bg-theme-elevated text-theme-tertiary border border-theme-secondary'
                          }`}
                        >
                          {loadedCount}/{totalCount}
                        </span>

                        {/* Indicador de progresso e status */}
                        {tabStats.hasMore ? (
                          <div className="flex items-center space-x-1">
                            <div className="w-1 h-1 bg-accent-blue rounded-full animate-pulse"></div>
                            {isActive && (
                              <span className="text-xs text-accent-blue font-medium">
                                +{tabStats.remaining}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="w-1 h-1 bg-accent-green rounded-full"></div>
                        )}
                      </div>
                    </button>
                  </AnimatedItem>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTabData.length > 0 ? (
              <div className="grid grid-cols-1 gap-8">
                {/* Lista de Partituras */}
                <div className="space-y-6">
                  {activeTabData.map((scoreGroup, groupIndex) => (
                    <div
                      key={scoreGroup.groupIndex}
                      className="space-y-4 animate-fade-in-up"
                      style={{ animationDelay: `${groupIndex * 0.1}s` }}
                    >
                      {scoreGroup.groupTitle && (
                        <div className="border-b border-theme-secondary pb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                              <GiMusicalNotes className="w-4 h-4 text-theme-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-theme-primary classical-title">
                              {scoreGroup.groupTitle}
                            </h3>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {scoreGroup.scores.map((score, index) => {
                          const scoreStats = getScoreStats(score.id, 'IMSLP');
                          const isMostFavorited = isScoreMostFavorited
                            ? isScoreMostFavorited(score.id, 'IMSLP')
                            : false;

                          return (
                            <SequentialGrid
                              cols={1}
                              gap={2}
                              delayBetweenItems={0.05}
                              className="space-y-2"
                              key={score.id}
                            >
                              <ScoreCard
                                score={score}
                                workId={workId || ''}
                                isSelected={selectedScore?.id === score.id}
                                onSelect={() => handleScoreSelect(score)}
                                isLastInGroup={
                                  index === scoreGroup.scores.length - 1
                                }
                                groupSize={scoreGroup.scores.length}
                                showFavoriteStats={true}
                                showMostFavoritedBadge={true}
                                isMostFavorited={isMostFavorited}
                                favoriteStats={
                                  scoreStats
                                    ? {
                                        totalFavorites:
                                          scoreStats.totalFavorites,
                                        avgRating: scoreStats.avgRating,
                                        isMostFavorited: isMostFavorited,
                                      }
                                    : undefined
                                }
                              />
                            </SequentialGrid>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* 🆕 Botões de carregamento específicos da tab */}
                  {activeTabStats.hasMore && (
                    <div className="flex flex-col items-center space-y-6 py-8 border-t border-theme-secondary">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-theme-primary mb-2">
                          Mais {getTabLabel(activeTab).toLowerCase()}{' '}
                          disponíveis
                        </h3>
                        <p className="text-theme-secondary text-sm mb-4">
                          {loadingMore
                            ? `Carregando mais ${getTabLabel(
                                activeTab
                              ).toLowerCase()}...`
                            : `Mostrando ${activeTabStats.loaded} de ${
                                activeTabStats.total
                              } ${getTabLabel(
                                activeTab
                              ).toLowerCase()} disponíveis`}
                        </p>

                        {/* Barra de progresso específica da tab */}
                        <div className="w-80 bg-theme-elevated border border-theme-primary/20 rounded-full h-2 mx-auto mb-4">
                          <div
                            className="bg-gradient-to-r from-accent-blue to-accent-purple h-2 rounded-full transition-all duration-500"
                            style={{ width: `${activeTabStats.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* 🆕 Botões dinâmicos específicos da tab */}
                      <div className="flex flex-wrap gap-4 justify-center">
                        {renderTabSpecificButtons()}
                      </div>
                    </div>
                  )}

                  {/* 🆕 Mensagem quando todas as partituras da tab foram carregadas */}
                  {!activeTabStats.hasMore && activeTabStats.total > 0 && (
                    <div
                      className={` ${
                        totalAvailable > currentLoaded
                          ? 'space-y-4 flex flex-col items-center py-8 border-t border-theme-secondary'
                          : ''
                      }  `}
                    >
                      <div className="text-center">
                        {/* <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <FiTarget className="w-8 h-8 text-theme-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-theme-primary mb-2">
                          Todas as {getTabLabel(activeTab).toLowerCase()}{' '}
                          carregadas!
                        </h3>
                        <p className="text-theme-secondary text-sm">
                          Você visualizou todas as {activeTabStats.total}{' '}
                          {getTabLabel(activeTab).toLowerCase()} disponíveis
                          para esta obra.
                        </p> */}

                        {/* Botão para carregar todas as outras tabs se ainda há partituras globais */}
                        {totalAvailable > currentLoaded && (
                          <div className="mt-4">
                            <button
                              onClick={onLoadAll}
                              disabled={loadingMore}
                              className="btn-classical-accent flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiLayers className="w-4 h-4" />
                              <span>
                                Carregar Todas as Outras Partituras (
                                {totalAvailable - currentLoaded} restantes)
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Panel */}
                {selectedScore && (
                  <div
                    ref={previewRef}
                    className="lg:sticky lg:top-6 animate-fade-in-up scroll-mt-4"
                  >
                    <div className="classical-card-2 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-theme-primary flex items-center space-x-2">
                          <FiBookOpen className="w-5 h-5 text-accent-blue" />
                          <span>Preview da Partitura</span>
                        </h3>

                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
                          <span className="text-theme-secondary">
                            Selecionada para estudo
                          </span>
                        </div>
                      </div>

                      <ScorePreview score={selectedScore} />

                      <div className="mt-4 pt-4 border-t border-theme-secondary">
                        <div className="flex flex-wrap gap-3">
                          {workId && workTitle && composerName && (
                            <StudyModeButton
                              workId={workId}
                              workTitle={workTitle}
                              composerName={composerName}
                              selectedScore={selectedScore}
                              variant="default"
                              className="flex-1 min-w-[200px]"
                            />
                          )}

                          <button
                            onClick={() => handleScoreSelect(selectedScore)}
                            className="btn-classical-secondary flex items-center space-x-2"
                          >
                            <FiMusic className="w-4 h-4" />
                            <span>Desselecionar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyTabState />
            )}
          </div>
        </div>
      </AnimatedContainer>
    </AnimatedCard>
  );
}

// === COMPONENTES AUXILIARES (permanecem iguais) ===

function LoadingState() {
  return (
    <div className="classical-card overflow-hidden animate-fade-in-up">
      <div className="border-b border-theme-secondary p-8 bg-gradient-to-r from-theme-elevated to-interactive-hover">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center">
            <FiMusic className="w-6 h-6 text-theme-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-theme-primary classical-title">
              Partituras IMSLP
            </h2>
            <p className="text-theme-secondary classical-subtitle">
              Carregando recursos disponíveis...
            </p>
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className="flex items-center justify-center space-x-3 py-12">
          <div className="relative">
            <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
            <div
              className="absolute inset-0 w-8 h-8 border-4 border-transparent border-r-brand-secondary rounded-full animate-spin"
              style={{
                animationDirection: 'reverse',
                animationDuration: '1.5s',
              }}
            ></div>
          </div>
          <span className="text-theme-primary font-medium">
            Carregando partituras...
          </span>
        </div>
      </div>
    </div>
  );
}

function ErrorState({
  error,
  onRefetch,
}: {
  error: string;
  onRefetch?: () => void;
}) {
  return (
    <div className="classical-card overflow-hidden animate-fade-in-up">
      <div className="border-b border-theme-secondary p-8 bg-gradient-to-r from-theme-elevated to-interactive-hover">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-purple rounded-2xl flex items-center justify-center">
            <FiAlertCircle className="w-6 h-6 text-theme-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-theme-primary classical-title">
              Partituras IMSLP
            </h2>
            <p className="text-theme-secondary classical-subtitle">
              Erro ao carregar recursos
            </p>
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className="bg-gradient-to-r from-accent-red/10 to-accent-red/5 border border-accent-red/30 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-accent-red/20 border border-accent-red/40 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiAlertCircle className="w-5 h-5 text-accent-red" />
            </div>
            <div className="flex-1">
              <p className="text-accent-red font-medium mb-2">{error}</p>
              {onRefetch && (
                <button
                  onClick={onRefetch}
                  className="btn-classical-secondary flex items-center space-x-2 group"
                >
                  <FiRefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Tentar novamente</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="classical-card p-8">
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-theme-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FiMusic className="w-8 h-8 text-theme-tertiary" />
        </div>
        <h3 className="text-xl font-bold text-theme-primary classical-title mb-2">
          Nenhuma partitura encontrada
        </h3>
        <p className="text-theme-secondary max-w-md mx-auto">
          Não foram encontradas partituras para esta obra no momento.
        </p>
      </div>
    </div>
  );
}

function EmptyTabState() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-theme-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <FiMusic className="w-8 h-8 text-theme-tertiary" />
      </div>
      <h3 className="text-xl font-bold text-theme-primary classical-title mb-2">
        Nenhuma partitura disponível
      </h3>
      <p className="text-theme-secondary max-w-md mx-auto">
        Não foram encontradas partituras desta categoria para esta obra no
        momento.
      </p>
    </div>
  );
}
