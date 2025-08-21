// components/IMSLPTabsIncremental.tsx - REFATORADO COM BADGES E AUTO SCROLL
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FiMusic,
  FiFileText,
  FiRefreshCw,
  FiAlertCircle,
  FiBookOpen,
  FiMoreHorizontal,
  FiLayers,
  FiDownload,
  FiTarget,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import ScoreCard from '../ScoreCard';
import { IMSLPWorkScoresIncremental } from '@/app/libs/imslp-score-scraper-incremental';
import { WorkScore } from '@/app/hooks/useWorkScores';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  SequentialGrid,
} from '../../animation/AnimatedComponents';
import { useScoreFavorites } from '@/app/hooks/useScoreFavorites';
import ScorePreview from '../ScorePreview';
import {
  getTabLabel,
  getTabStatistics,
  TabStatistics,
} from '@/app/utils/type-utils';

// ✅ INTERFACE UNIFICADA SIMPLIFICADA
interface MixedScoreData {
  id: string;
  title: string;
  downloadUrl?: string;
  fileSize?: string;
  pageCount?: string;
  thumbnailUrl?: string;
  type: string;
  source: 'IMSLP' | 'CUSTOM' | 'UPLOAD';
  editor?: string;
  publisher?: string;
  copyright?: string;
  uploadDate?: string;
  uploader?: string;
  notes?: string;
  priority?: number;
  accessCount?: number;
  lastAccessed?: string;
  createdAt?: string;
  workId?: string;
  sourceId?: string;
  fileFormat?: string;
  rating?: number;
  ratingsCount?: number;
  downloadCount?: number;
  groupIndex?: number;
}

interface MixedScoreGroup {
  groupIndex: number;
  scores: MixedScoreData[];
  groupTitle?: string;
  source: 'IMSLP' | 'WORKSCORE';
}

interface IMSLPTabsIncrementalProps {
  imslpData?: IMSLPWorkScoresIncremental | null;
  imslpLoading?: boolean;
  imslpLoadingMore?: boolean;
  imslpError?: string | null;
  onImslpRefetch?: () => void;
  onImslpLoadMore?: (amount?: number, specificType?: string) => void;
  onImslpLoadMoreForTab?: (tabType: string, amount?: number) => void;
  onImslpLoadAll?: () => void;
  workScores?: WorkScore[];
  workScoresLoading?: boolean;
  workScoresError?: string | null;
  workScoresHasMore?: boolean;
  workScoresTotal?: number;
  onWorkScoresLoadMore?: () => void;
  onWorkScoresRefetch?: () => void;
  onScoreSelect?: (score: MixedScoreData) => void;
  workId?: string;
  workTitle?: string;
  composerName?: string;
  hasMore?: boolean;
  totalAvailable?: number;
  currentLoaded?: number;
  getTabStats?: (tabType: string) => TabStatistics;
  isScoreMostFavorited?: (scoreId: string, scoreSource?: string) => boolean;
  isSelectionMode?: boolean;
  tempSelectedWorkScore?: { id: string; title: string; source: string } | null;
}

// ✅ TABS SEM UPLOADS - INTEGRADOS NAS TABS APROPRIADAS
const TABS = [
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
] as const;

// ✅ COMPONENTE BADGE DE FONTE
const SourceBadge = React.memo(
  ({ source }: { source: 'IMSLP' | 'UPLOAD' | 'CUSTOM' }) => {
    if (source === 'IMSLP') {
      return (
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <FiBookOpen className="w-3 h-3 mr-1" />
          IMSLP
        </div>
      );
    }

    return (
      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <FiTarget className="w-3 h-3 mr-1" />
        Open Atlas
      </div>
    );
  }
);
SourceBadge.displayName = 'SourceBadge';

// ✅ COMPONENTE SCORECARD OTIMIZADO COM BADGE
const ScoreCardWithBadge = React.memo(
  ({
    score,
    workId,
    isSelected,
    onSelect,
    isLastInGroup,
    groupSize,
    showFavoriteStats,
    showMostFavoritedBadge,
    isMostFavorited,
    favoriteStats,
    isSelectionMode,
    isTempSelected,
    tempSelectedWorkScore,
  }: any) => (
    <div className="relative">
      <ScoreCard
        score={score}
        workId={workId}
        isSelected={isSelected}
        onSelect={onSelect}
        isLastInGroup={isLastInGroup}
        groupSize={groupSize}
        showFavoriteStats={showFavoriteStats}
        showMostFavoritedBadge={showMostFavoritedBadge}
        isMostFavorited={isMostFavorited}
        favoriteStats={favoriteStats}
        isSelectionMode={isSelectionMode}
        isTempSelected={isTempSelected}
        tempSelectedWorkScore={tempSelectedWorkScore}
      />
      <div className="absolute top-2 right-2">
        <SourceBadge source={score.source} />
      </div>
    </div>
  )
);
ScoreCardWithBadge.displayName = 'ScoreCardWithBadge';

// ✅ PROCESSAMENTO DE DADOS MEMOIZADO
const useProcessedData = (imslpData: any, workScores: WorkScore[]) => {
  return useMemo(() => {
    const processed = {
      scores: [] as MixedScoreGroup[],
      parts: [] as MixedScoreGroup[],
      arrangements: [] as MixedScoreGroup[],
      librettos: [] as MixedScoreGroup[],
      others: [] as MixedScoreGroup[],
      sources: [] as MixedScoreGroup[],
    };

    const counts = {
      scores: 0,
      parts: 0,
      arrangements: 0,
      librettos: 0,
      others: 0,
      sources: 0,
    };

    // ✅ 1. Processar dados IMSLP
    if (imslpData) {
      (Object.entries(imslpData.scoresByType) as [string, any[]][]).forEach(
        ([type, groups]) => {
          if (groups && groups.length > 0) {
            const processedGroups = groups.map((group: any) => ({
              groupIndex: group.groupIndex,
              groupTitle: `${group.groupTitle || 'IMSLP'} (IMSLP)`,
              source: 'IMSLP' as const,
              scores: group.scores.map(
                (score: any): MixedScoreData => ({
                  id: score.id,
                  title: score.title,
                  downloadUrl: score.downloadUrl,
                  fileSize: score.fileSize,
                  pageCount: score.pageCount,
                  thumbnailUrl: score.thumbnailUrl,
                  type: score.type,
                  source: 'IMSLP',
                  editor: score.editor,
                  publisher: score.publisher,
                  copyright: score.copyright,
                  uploadDate: score.uploadDate,
                  uploader: score.uploader,
                  notes: score.notes,
                  rating: score.rating,
                  ratingsCount: score.ratingsCount,
                  downloadCount: score.downloadCount,
                  groupIndex: score.groupIndex,
                })
              ),
            }));

            // Mapear para tabs corretas
            const targetTab = type as keyof typeof processed;
            if (targetTab in processed) {
              processed[targetTab].push(...processedGroups);
              counts[targetTab] += processedGroups.reduce(
                (sum: number, g: MixedScoreGroup) => sum + g.scores.length,
                0
              );
            }
          }
        }
      );
    }

    // ✅ 2. Processar WorkScores e integrar nas tabs apropriadas
    if (workScores && workScores.length > 0) {
      const workScoresByType: { [key: string]: WorkScore[] } = {};

      workScores.forEach((ws) => {
        let targetType = 'others';

        // Mapear tipo do WorkScore para tab apropriada
        if (ws.type.toLowerCase().includes('score')) {
          targetType = 'scores';
        } else if (ws.type.toLowerCase().includes('part')) {
          targetType = 'parts';
        } else if (ws.type.toLowerCase().includes('arrangement')) {
          targetType = 'arrangements';
        } else if (ws.type.toLowerCase().includes('libretto')) {
          targetType = 'librettos';
        } else if (ws.type.toLowerCase().includes('source')) {
          targetType = 'sources';
        }

        if (!workScoresByType[targetType]) {
          workScoresByType[targetType] = [];
        }
        workScoresByType[targetType].push(ws);
      });

      // Adicionar WorkScores às tabs apropriadas
      Object.entries(workScoresByType).forEach(([type, scores]) => {
        if (scores.length > 0) {
          const group: MixedScoreGroup = {
            groupIndex: 999, // Sempre por último
            groupTitle: `Open Atlas (${scores.length})`,
            source: 'WORKSCORE',
            scores: scores.map(
              (ws): MixedScoreData => ({
                id: ws.id,
                title: ws.title,
                downloadUrl: ws.downloadUrl,
                fileSize: ws.fileSize,
                pageCount: ws.pageCount,
                thumbnailUrl: ws.thumbnailUrl,
                type: ws.type,
                source: ws.source,
                editor: ws.editor,
                publisher: ws.publisher,
                copyright: ws.copyright,
                uploadDate: ws.uploadDate,
                uploader: ws.uploader,
                notes: ws.notes,
                priority: ws.priority,
                accessCount: ws.accessCount,
                lastAccessed: ws.lastAccessed,
                createdAt: ws.createdAt,
                workId: ws.workId,
                sourceId: ws.sourceId,
                fileFormat: ws.fileFormat,
              })
            ),
          };

          const targetTab = type as keyof typeof processed;
          if (targetTab in processed) {
            processed[targetTab].push(group);
            counts[targetTab] += scores.length;
          }
        }
      });
    }

    // Determinar tabs visíveis
    const visibleTabs = TABS.filter(
      (tab) => counts[tab.type as keyof typeof counts] > 0
    );

    // Tab ativa padrão
    const activeTabDefault =
      visibleTabs.length > 0 ? visibleTabs[0].id : 'scores';

    return {
      mixedData: processed,
      visibleTabs,
      activeTabDefault,
      counts,
    };
  }, [imslpData, workScores]);
};

// ✅ HOOK PARA AUTO SCROLL
const useAutoScrollToPreview = (selectedScore: MixedScoreData | null) => {
  useEffect(() => {
    if (selectedScore) {
      // Aguarda um frame para garantir que o elemento foi renderizado
      requestAnimationFrame(() => {
        const previewElement = document.getElementById('score-preview');
        if (previewElement) {
          previewElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
          });
        }
      });
    }
  }, [selectedScore]);
};

// ✅ COMPONENTE PRINCIPAL REFATORADO
export default function IMSLPTabsIncremental({
  imslpData,
  imslpLoading,
  imslpLoadingMore,
  imslpError,
  onImslpRefetch,
  onImslpLoadMoreForTab,
  onImslpLoadAll,
  workScores = [],
  workScoresLoading,
  workScoresError,
  workScoresHasMore,
  workScoresTotal = 0,
  onWorkScoresLoadMore,
  onWorkScoresRefetch,
  onScoreSelect,
  workId,
  totalAvailable = 0,
  currentLoaded = 0,
  getTabStats,
  isSelectionMode = false,
  tempSelectedWorkScore,
  isScoreMostFavorited,
}: IMSLPTabsIncrementalProps) {
  const [selectedScore, setSelectedScore] = useState<MixedScoreData | null>(
    null
  );

  // ✅ AUTO SCROLL HOOK
  useAutoScrollToPreview(selectedScore);

  // ✅ PROCESSAR DADOS COM HOOK CUSTOMIZADO
  const { mixedData, visibleTabs, activeTabDefault } = useProcessedData(
    imslpData,
    workScores
  );

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (!imslpData && (!workScores || workScores.length === 0)) return 'scores';
    const firstTabWithContent = visibleTabs.find(
      (tab) => mixedData[tab.type as keyof typeof mixedData]?.length > 0
    );
    return firstTabWithContent?.id || activeTabDefault;
  });

  // ✅ DADOS DA TAB ATIVA MEMOIZADOS
  const activeTabData = useMemo(
    () => mixedData[activeTab as keyof typeof mixedData] || [],
    [mixedData, activeTab]
  );

  // ✅ ESTATÍSTICAS DA TAB MEMOIZADAS
  const activeTabStats: TabStatistics = useMemo(() => {
    return getTabStats
      ? getTabStats(activeTab)
      : getTabStatistics(
          activeTab,
          imslpData?.loadedCounts || {},
          imslpData?.totalCounts || {}
        );
  }, [getTabStats, activeTab, imslpData?.loadedCounts, imslpData?.totalCounts]);

  // ✅ HOOK PARA FAVORITOS OTIMIZADO
  const { getScoreStats } = useScoreFavorites(workId || '');

  // ✅ CALLBACKS OTIMIZADOS
  const handleScoreSelect = useCallback(
    (score: MixedScoreData) => {
      if (selectedScore?.id === score.id) {
        setSelectedScore(null);
        onScoreSelect?.(null as any);
      } else {
        setSelectedScore(score);
        onScoreSelect?.(score);
      }
    },
    [selectedScore?.id, onScoreSelect]
  );

  const renderTabSpecificButtons = useCallback(() => {
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

    if (activeTabStats.remaining >= 1) {
      const loadAmount = Math.min(20, activeTabStats.remaining);
      buttons.push(
        <button
          key="load-more-tab"
          onClick={() => onImslpLoadMoreForTab?.(activeTab, loadAmount)}
          disabled={imslpLoadingMore}
          className="btn-classical-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {imslpLoadingMore ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Carregando...</span>
            </>
          ) : (
            <>
              <FiMoreHorizontal className="w-4 h-4" />
              <span>
                Carregar Mais {getTabLabel(activeTab)} ({loadAmount})
              </span>
            </>
          )}
        </button>
      );
    }

    if (activeTabStats.remaining > 20) {
      buttons.push(
        <button
          key="load-all-tab"
          onClick={() =>
            onImslpLoadMoreForTab?.(activeTab, activeTabStats.remaining)
          }
          disabled={imslpLoadingMore}
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

    const globalRemaining = totalAvailable - currentLoaded;
    if (globalRemaining > activeTabStats.remaining && globalRemaining > 0) {
      buttons.push(
        <button
          key="load-all-global"
          onClick={() => onImslpLoadAll?.()}
          disabled={imslpLoadingMore}
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
  }, [
    activeTabStats,
    activeTab,
    imslpLoadingMore,
    onImslpLoadMoreForTab,
    onImslpLoadAll,
    totalAvailable,
    currentLoaded,
  ]);

  // ✅ ESTADOS DE CARREGAMENTO
  const isLoading = imslpLoading || workScoresLoading;
  const hasError = imslpError || workScoresError;

  if (isLoading && activeTabData.length === 0) {
    return <LoadingState />;
  }

  if (hasError) {
    return (
      <ErrorState
        error={hasError}
        onRefetch={onImslpRefetch || onWorkScoresRefetch}
      />
    );
  }

  if (activeTabData.length === 0 && !isLoading) {
    return <EmptyState />;
  }

  return (
    <AnimatedCard hover="none" className="classical-card overflow-hidden">
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        <div className="classical-card overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="border-b border-theme-secondary bg-gradient-to-r from-theme-primary to-theme-elevated">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center">
                    <FiMusic className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-theme-primary classical-title">
                      Partituras Disponíveis
                    </h2>
                    <div className="flex items-center space-x-2">
                      <p className="text-theme-secondary classical-subtitle">
                        {selectedScore
                          ? `Partitura selecionada: ${selectedScore.title}`
                          : isSelectionMode
                          ? 'Selecione uma partitura abaixo'
                          : 'Explore as partituras disponíveis'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            {visibleTabs.length > 0 && (
              <nav className="flex scrollbar-hide px-6" aria-label="Tabs">
                {visibleTabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const tabStats: TabStatistics = getTabStats
                    ? getTabStats(tab.id)
                    : getTabStatistics(
                        tab.id,
                        imslpData?.loadedCounts || {},
                        imslpData?.totalCounts || {}
                      );

                  return (
                    <AnimatedItem
                      key={tab.id}
                      hover="scale"
                      springType="bouncy"
                    >
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

                        <div className="flex items-center space-x-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                              isActive
                                ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30'
                                : 'bg-theme-elevated text-theme-tertiary border border-theme-secondary'
                            }`}
                          >
                            {tabStats.loaded}/
                            {tabStats.total < tabStats.loaded
                              ? tabStats.loaded
                              : tabStats.total}
                          </span>

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
            )}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTabData.length > 0 ? (
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-6">
                  {activeTabData.map((scoreGroup, groupIndex) => (
                    <div
                      key={`${scoreGroup.source}-${groupIndex}`}
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
                          const scoreStats = getScoreStats(
                            score.id,
                            score.source
                          );
                          const isMostFavorited = isScoreMostFavorited
                            ? isScoreMostFavorited(score.id, score.source)
                            : false;

                          return (
                            <SequentialGrid
                              cols={1}
                              gap={2}
                              delayBetweenItems={0.05}
                              className="space-y-2"
                              key={score.id}
                            >
                              <ScoreCardWithBadge
                                score={score}
                                workId={workId || ''}
                                isSelected={selectedScore?.id === score.id}
                                onSelect={() => handleScoreSelect(score)}
                                isLastInGroup={
                                  index === scoreGroup.scores.length - 1
                                }
                                groupSize={scoreGroup.scores.length}
                                showFavoriteStats={!isSelectionMode}
                                showMostFavoritedBadge={!isSelectionMode}
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
                                isSelectionMode={isSelectionMode}
                                isTempSelected={
                                  tempSelectedWorkScore?.id === score.id
                                }
                                tempSelectedWorkScore={tempSelectedWorkScore}
                              />
                            </SequentialGrid>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Botões de Load More */}
                  {activeTabStats.hasMore && (
                    <div className="flex flex-col items-center space-y-6 py-8 border-t border-theme-secondary">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-theme-primary mb-2">
                          Mais {getTabLabel(activeTab).toLowerCase()}{' '}
                          disponíveis
                        </h3>
                        <p className="text-theme-secondary text-sm mb-4">
                          {imslpLoadingMore
                            ? `Carregando mais ${getTabLabel(
                                activeTab
                              ).toLowerCase()}...`
                            : `Mostrando ${activeTabStats.loaded} de ${
                                activeTabStats.total
                              } ${getTabLabel(
                                activeTab
                              ).toLowerCase()} disponíveis`}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4 justify-center">
                        {renderTabSpecificButtons()}
                      </div>
                    </div>
                  )}

                  {/* Load More para WorkScores */}
                  {activeTab === 'scores' && workScoresHasMore && (
                    <div className="flex flex-col items-center space-y-4 py-8 border-t border-theme-secondary">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-theme-primary mb-2">
                          Mais partituras Open Atlas disponíveis
                        </h3>
                        <p className="text-theme-secondary text-sm mb-4">
                          {workScoresLoading
                            ? 'Carregando mais partituras...'
                            : `Mostrando ${
                                workScores?.length || 0
                              } de ${workScoresTotal} partituras`}
                        </p>
                      </div>
                      <button
                        onClick={onWorkScoresLoadMore}
                        disabled={workScoresLoading}
                        className="btn-classical-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {workScoresLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Carregando...</span>
                          </>
                        ) : (
                          <>
                            <FiMoreHorizontal className="w-4 h-4" />
                            <span>Carregar Mais (20)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Preview Panel com ID para scroll */}
                {selectedScore && (
                  <div
                    id="score-preview"
                    className="lg:sticky lg:top-6 animate-fade-in-up scroll-mt-4"
                  >
                    <div className="classical-card-2 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-theme-primary flex items-center space-x-2">
                          <FiBookOpen className="w-5 h-5 text-accent-blue" />
                          <span>Preview da Partitura</span>
                        </h3>
                        <SourceBadge source={selectedScore.source} />
                      </div>

                      <ScorePreview score={selectedScore as any} />

                      {!isSelectionMode && (
                        <div className="mt-4 pt-4 border-t border-theme-secondary">
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => handleScoreSelect(selectedScore)}
                              className="btn-classical-secondary flex items-center space-x-2"
                            >
                              <FiMusic className="w-4 h-4" />
                              <span>Desselecionar</span>
                            </button>
                          </div>
                        </div>
                      )}
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

// ✅ COMPONENTES AUXILIARES OTIMIZADOS
const LoadingState = React.memo(() => (
  <div className="classical-card overflow-hidden animate-fade-in-up">
    <div className="border-b border-theme-secondary p-8 bg-gradient-to-r from-theme-elevated to-interactive-hover">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center">
          <FiMusic className="w-6 h-6 text-theme-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-theme-primary classical-title">
            Partituras Disponíveis
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
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          ></div>
        </div>
        <span className="text-theme-primary font-medium">
          Carregando partituras...
        </span>
      </div>
    </div>
  </div>
));
LoadingState.displayName = 'LoadingState';

const ErrorState = React.memo(
  ({ error, onRefetch }: { error: string; onRefetch?: () => void }) => (
    <div className="classical-card overflow-hidden animate-fade-in-up">
      <div className="border-b border-theme-secondary p-8 bg-gradient-to-r from-theme-elevated to-interactive-hover">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-purple rounded-2xl flex items-center justify-center">
            <FiAlertCircle className="w-6 h-6 text-theme-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-theme-primary classical-title">
              Partituras Disponíveis
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
  )
);
ErrorState.displayName = 'ErrorState';

const EmptyState = React.memo(() => (
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
));
EmptyState.displayName = 'EmptyState';

const EmptyTabState = React.memo(() => (
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
));
EmptyTabState.displayName = 'EmptyTabState';
