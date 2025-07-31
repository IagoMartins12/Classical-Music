// components/IMSLPTabsIncremental.tsx - VERSÃO HÍBRIDA (Dados Mistos + Tabs/Botões Antigos)
'use client';

import { useState, useRef, useMemo } from 'react';
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
  FiUpload,
  FiDatabase,
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
import StudyModeButton from '../../StudyModePage/StudyModeButton';

// ✅ Interface unificada para dados mistos
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
  // Campos específicos do WorkScore
  priority?: number;
  accessCount?: number;
  lastAccessed?: string;
  createdAt?: string;
  workId?: string;
  sourceId?: string;
  fileFormat?: string;
  // Campos específicos do IMSLPScore
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

// ✅ Props atualizadas para suportar dados mistos
interface IMSLPTabsIncrementalProps {
  // Props IMSLP (opcionais - só se tiver link IMSLP)
  imslpData?: IMSLPWorkScoresIncremental | null;
  imslpLoading?: boolean;
  imslpLoadingMore?: boolean;
  imslpError?: string | null;
  onImslpRefetch?: () => void;
  onImslpLoadMore?: (amount?: number, specificType?: string) => void;
  onImslpLoadMoreForTab?: (tabType: string, amount?: number) => void;
  onImslpLoadAll?: () => void;

  // Props WorkScores (sempre disponíveis)
  workScores?: WorkScore[];
  workScoresLoading?: boolean;
  workScoresError?: string | null;
  workScoresHasMore?: boolean;
  workScoresTotal?: number;
  onWorkScoresLoadMore?: () => void;
  onWorkScoresRefetch?: () => void;

  // Props comuns
  onScoreSelect?: (score: MixedScoreData) => void;
  workId?: string;
  workTitle?: string;
  composerName?: string;

  // Estados de carregamento incremental IMSLP
  hasMore?: boolean;
  totalAvailable?: number;
  currentLoaded?: number;
  backgroundCaching?: boolean;
  cacheProgress?: number;
  getTabStats?: (tabType: string) => TabStatistics;

  // Props de favoritos
  mostFavoritedScoreId?: string | null;
  mostFavoritedSource?: string;
  hasMostFavorited?: boolean;
  loadingMostFavorited?: boolean;
  isScoreMostFavorited?: (scoreId: string, scoreSource?: string) => boolean;

  // Props para modo de seleção
  isSelectionMode?: boolean;
  selectionType?: 'want-to-learn' | 'learned' | null;
  tempSelectedWorkScore?: { id: string; title: string; source: string } | null;
}

// ✅ USAR O SISTEMA DE TABS DO CÓDIGO ANTIGO (SEM "TODAS")
interface TabInfo {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type: string;
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
    id: 'uploads',
    label: 'Open Atlas',
    icon: FiUpload,
    type: 'uploads',
    gradient: 'from-accent-purple to-accent-red',
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
  // IMSLP props
  imslpData,
  imslpLoading,
  imslpLoadingMore,
  imslpError,
  onImslpRefetch,
  onImslpLoadMoreForTab,
  onImslpLoadAll,
  // WorkScores props
  workScores = [],
  workScoresLoading,
  workScoresError,
  workScoresHasMore,
  workScoresTotal = 0,
  onWorkScoresLoadMore,
  onWorkScoresRefetch,
  // Common props
  onScoreSelect,
  workId,
  workTitle,
  composerName,
  // IMSLP specific props
  totalAvailable = 0,
  currentLoaded = 0,
  getTabStats,
  // Selection props
  isSelectionMode = false,
  tempSelectedWorkScore,
  // Favorites props
  isScoreMostFavorited,
}: IMSLPTabsIncrementalProps) {
  const [selectedScore, setSelectedScore] = useState<MixedScoreData | null>(
    null
  );
  const previewRef = useRef<HTMLDivElement>(null);

  console.log('scores', workScores);
  // Hook para estatísticas de favoritos
  const { getScoreStats } = useScoreFavorites(workId || '');

  // ✅ Processar e organizar dados mistos (SEM tab "all")
  const { mixedData, visibleTabs, activeTabDefault } = useMemo(() => {
    const processed = {
      scores: [] as MixedScoreGroup[],
      parts: [] as MixedScoreGroup[],
      arrangements: [] as MixedScoreGroup[],
      uploads: [] as MixedScoreGroup[],
      librettos: [] as MixedScoreGroup[],
      others: [] as MixedScoreGroup[],
      sources: [] as MixedScoreGroup[],
    };

    const counts = {
      scores: 0,
      parts: 0,
      arrangements: 0,
      uploads: 0,
      librettos: 0,
      others: 0,
      sources: 0,
    };

    // ✅ 1. Processar dados IMSLP (se disponíveis)
    if (imslpData) {
      Object.entries(imslpData.scoresByType).forEach(([type, groups]) => {
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

          // Mapear tipos IMSLP para as tabs do sistema antigo
          if (type === 'scores') {
            processed.scores.push(...processedGroups);
            counts.scores += processedGroups.reduce(
              (sum: number, g: MixedScoreGroup) => sum + g.scores.length,
              0
            );
          } else if (type === 'parts') {
            processed.parts.push(...processedGroups);
            counts.parts += processedGroups.reduce(
              (sum: number, g: MixedScoreGroup) => sum + g.scores.length,
              0
            );
          } else if (type === 'arrangements') {
            processed.arrangements.push(...processedGroups);
            counts.arrangements += processedGroups.reduce(
              (sum: number, g: MixedScoreGroup) => sum + g.scores.length,
              0
            );
          } else if (type === 'librettos') {
            processed.librettos.push(...processedGroups);
            counts.librettos += processedGroups.reduce(
              (sum: number, g: MixedScoreGroup) => sum + g.scores.length,
              0
            );
          } else if (type === 'sources') {
            processed.sources.push(...processedGroups);
            counts.sources += processedGroups.reduce(
              (sum: number, g: MixedScoreGroup) => sum + g.scores.length,
              0
            );
          } else {
            processed.others.push(...processedGroups);
            counts.others += processedGroups.reduce(
              (sum: number, g: MixedScoreGroup) => sum + g.scores.length,
              0
            );
          }
        }
      });
    }

    // ✅ 2. Processar WorkScores (uploads/custom)
    if (workScores && workScores.length > 0) {
      // Agrupar por tipo e fonte
      const workScoreGroups: { [key: string]: WorkScore[] } = {};

      workScores.forEach((ws) => {
        let key = 'others';
        if (ws.source === 'UPLOAD' || ws.source === 'CUSTOM') {
          key = 'uploads';
        } else if (ws.type.toLowerCase().includes('score')) {
          key = 'scores';
        } else if (ws.type.toLowerCase().includes('part')) {
          key = 'parts';
        } else if (ws.type.toLowerCase().includes('arrangement')) {
          key = 'arrangements';
        }

        if (!workScoreGroups[key]) {
          workScoreGroups[key] = [];
        }
        workScoreGroups[key].push(ws);
      });

      // Converter para grupos mistos
      Object.entries(workScoreGroups).forEach(([type, scores]) => {
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

          if (type === 'uploads') {
            processed.uploads.push(group);
            counts.uploads += scores.length;
          } else {
            processed[type as keyof typeof processed].push(group);
            counts[type as keyof typeof counts] += scores.length;
          }
        }
      });
    }

    // ✅ 3. Determinar tabs visíveis (usar sistema do código antigo)
    const visible = TABS.filter(
      (tab) => counts[tab.type as keyof typeof counts] > 0
    );

    // ✅ 4. Tab ativa padrão (primeira tab com conteúdo)
    const defaultTab = visible.length > 0 ? visible[0].id : 'scores';

    return {
      mixedData: processed,
      visibleTabs: visible,
      activeTabDefault: defaultTab,
      counts,
    };
  }, [imslpData, workScores]);

  const [activeTab, setActiveTab] = useState<string>(() => {
    // ✅ Lógica do código antigo para tab inicial
    if (!imslpData && (!workScores || workScores.length === 0)) return 'scores';
    const firstTabWithContent = visibleTabs.find(
      (tab) => mixedData[tab.type as keyof typeof mixedData]?.length > 0
    );
    return firstTabWithContent?.id || activeTabDefault;
  });

  // Obter dados da tab ativa
  const activeTabData = mixedData[activeTab as keyof typeof mixedData] || [];

  const handleScoreSelect = (score: MixedScoreData) => {
    if (selectedScore?.id === score.id) {
      setSelectedScore(null);
      onScoreSelect?.(null as any);
    } else {
      setSelectedScore(score);
      onScoreSelect?.(score);
    }
  };

  // ✅ USAR OS BOTÕES DE LOADMORE DO CÓDIGO ANTIGO
  const activeTabStats: TabStatistics = getTabStats
    ? getTabStats(activeTab)
    : getTabStatistics(
        activeTab,
        imslpData?.loadedCounts || {},
        imslpData?.totalCounts || {}
      );

  // ✅ Função para renderizar botões dinâmicos específicos da tab (do código antigo)
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

    // ✅ Botão "Carregar Mais" específico da tab
    if (activeTabStats.remaining >= 1) {
      const loadAmount = Math.min(20, activeTabStats.remaining);
      buttons.push(
        <button
          key="load-more-tab"
          onClick={() => {
            console.log(
              `🎯 [COMPONENT] Clicando "Carregar Mais" para tab: "${activeTab}", amount: ${loadAmount}`
            );
            onImslpLoadMoreForTab?.(activeTab, loadAmount);
          }}
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
                Carregar Mais {getTabLabel(activeTab)} (
                {Math.min(20, activeTabStats.remaining)})
              </span>
            </>
          )}
        </button>
      );
    }

    // ✅ Botão "Carregar Todas desta Tab"
    if (activeTabStats.remaining > 20) {
      buttons.push(
        <button
          key="load-all-tab"
          onClick={() => {
            console.log(
              `🎯 [COMPONENT] Clicando "Carregar Todas desta Tab" para: "${activeTab}", amount: ${activeTabStats.remaining}`
            );
            onImslpLoadMoreForTab?.(activeTab, activeTabStats.remaining);
          }}
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

    // ✅ Botão "Carregar Todas as Partituras"
    const globalRemaining = totalAvailable - currentLoaded;
    if (globalRemaining > activeTabStats.remaining && globalRemaining > 0) {
      buttons.push(
        <button
          key="load-all-global"
          onClick={() => {
            console.log(
              `🎯 [COMPONENT] Clicando "Carregar Todas as Partituras", amount: ${globalRemaining}`
            );
            onImslpLoadAll?.();
          }}
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
  };

  // Loading state
  const isLoading = imslpLoading || workScoresLoading;
  const hasError = imslpError || workScoresError;

  // ✅ Estados de carregamento
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
                      {/* ✅ Indicadores de fonte */}
                      <div className="flex items-center space-x-2">
                        {imslpData && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center space-x-1">
                            <FiDatabase className="w-3 h-3" />
                            <span>IMSLP</span>
                          </span>
                        )}
                        {workScoresTotal > 0 && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center space-x-1">
                            <FiUpload className="w-3 h-3" />
                            <span>Open Atlas</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                {selectedScore &&
                  workId &&
                  workTitle &&
                  composerName &&
                  !isSelectionMode && (
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
                        selectedScore={selectedScore as any}
                        variant="compact"
                      />
                    </div>
                  )}
              </div>
            </div>

            {/* Tabs Navigation */}
            {visibleTabs.length > 0 && (
              <nav className="flex scrollbar-hide px-6" aria-label="Tabs">
                {visibleTabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const tabData =
                    mixedData[tab.type as keyof typeof mixedData] || [];
                  const tabCount = tabData.reduce(
                    (sum, group) => sum + group.scores.length,
                    0
                  );

                  // ✅ Usar sistema de estatísticas do código antigo
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

                        {/* ✅ Contador com progresso do código antigo */}
                        <div className="flex items-center space-x-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                              isActive
                                ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30'
                                : 'bg-theme-elevated text-theme-tertiary border border-theme-secondary'
                            }`}
                          >
                            {tabStats.loaded}/{tabStats.total}
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
                              <ScoreCard
                                score={score as any}
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

                  {/* ✅ USAR OS BOTÕES DE LOADMORE DO CÓDIGO ANTIGO */}
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

                      {/* ✅ Botões dinâmicos específicos da tab (do código antigo) */}
                      <div className="flex flex-wrap gap-4 justify-center">
                        {renderTabSpecificButtons()}
                      </div>
                    </div>
                  )}

                  {/* ✅ Load More para WorkScores na tab uploads */}
                  {activeTab === 'uploads' && workScoresHasMore && (
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

                  {/* ✅ Mensagem quando todas as partituras da tab foram carregadas (do código antigo) */}
                  {!activeTabStats.hasMore && activeTabStats.total > 0 && (
                    <div
                      className={` ${
                        totalAvailable > currentLoaded
                          ? 'space-y-4 flex flex-col items-center py-8 border-t border-theme-secondary'
                          : ''
                      }  `}
                    >
                      <div className="text-center">
                        {/* Botão para carregar todas as outras tabs se ainda há partituras globais */}
                        {totalAvailable > currentLoaded && (
                          <div className="mt-4">
                            <button
                              onClick={onImslpLoadAll}
                              disabled={imslpLoadingMore}
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
                            {isSelectionMode
                              ? 'Selecionada'
                              : 'Selecionada para estudo'}
                          </span>
                        </div>
                      </div>

                      <ScorePreview score={selectedScore as any} />

                      {!isSelectionMode && (
                        <div className="mt-4 pt-4 border-t border-theme-secondary">
                          <div className="flex flex-wrap gap-3">
                            {workId && workTitle && composerName && (
                              <StudyModeButton
                                workId={workId}
                                workTitle={workTitle}
                                composerName={composerName}
                                selectedScore={selectedScore as any}
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
