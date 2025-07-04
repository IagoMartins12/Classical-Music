// app/work/[workId]/WorkDetailsClient.tsx - ATUALIZADO com Nova Lógica de Cache
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WorkDetails } from '@/app/requests/work-details';
import {
  FiCalendar,
  FiMusic,
  FiExternalLink,
  FiClock,
  FiMapPin,
  FiBookOpen,
  FiPlay,
  FiPause,
  FiSettings,
  FiTag,
  FiInfo,
  FiHeadphones,
  FiActivity,
  FiLayers,
  FiTarget,
  FiZap,
  FiDatabase,
  FiRefreshCw,
  FiTrendingUp,
} from 'react-icons/fi';
import { GiMusicalNotes, GiMetronome } from 'react-icons/gi';
import { useIMSLPScoresIncremental } from '@/app/hooks/useIMSLPScoresIncremental';
import { useNavigate } from '@/app/hooks/useNavigate';
import FavoriteButton from '../FavoriteButton';
import { LearningInitializer } from '../LearningInitializer';
import LearningButtonWithModal from '../LearningButtonWithModal';
import { IMSLPScore } from '@/app/libs/imslp-score-scraper-incremental';
import StudyModeModal from '../StudyMode/StudyModeModal';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  SequentialGrid,
} from '../animation/AnimatedComponents';
import ShareButton from '../ShareButton';
import AnnotationsSection from '../Annotations/AnnotationsSection';
import { useMostFavoritedForWork } from '@/app/stores/useMostFavoritedStore';
import IMSLPTabsIncremental from '../IMSLPTabsIncremental';

interface WorkDetailsClientProps {
  work: WorkDetails;
  relatedWorks?: any[];
  learningData?: {
    wantToLearn: any[];
    learned: any[];
  };
}

export default function WorkDetailsClient({
  work,
  relatedWorks = [],
  learningData = { wantToLearn: [], learned: [] },
}: WorkDetailsClientProps) {
  // Estados seguros para SSR
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedScoreForStudy, setSelectedScoreForStudy] =
    useState<IMSLPScore | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Verificar se está montado (hidratado)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Hook otimizado para partitura mais favoritada
  const {
    mostFavoritedScoreId,
    mostFavoritedSource,
    hasFavorites: hasMostFavorited,
    loading: loadingMostFavorited,
    isScoreMostFavorited,
    refetch: refetchMostFavorited,
  } = useMostFavoritedForWork(mounted ? work.id : '');

  // 🆕 Hook para carregamento incremental com nova lógica de cache
  const {
    scores: imslpScores,
    loading: loadingScores,
    loadingMore,
    error: scoresError,
    hasMore,
    totalAvailable,
    currentLoaded,
    refetch: refetchScores,
    loadMore,
    loadMoreForTab,
    loadAll,
    fromCache,
    backgroundCaching,
    cacheProgress,
    selectedScore,
    setSelectedScore,
    getTabStats,
    strategy, // 🆕 Nova estratégia para debug
  } = useIMSLPScoresIncremental(mounted ? work.imslpPermlink : '', {
    workId: work.id,
    enabled: mounted,
    initialLimit: 5,
    moreLimit: 20,
    priorityScoreId: selectedScoreForStudy?.id,
    onScoresCached: (fromCache) => {
      console.log(
        `✅ [CLIENT] Estratégia: ${
          fromCache ? 'CACHE-ALL' : 'PRIMEIRA-VEZ'
        } para obra ${work.title}`
      );
    },
    onLoadMoreComplete: (newCount, totalCount) => {
      console.log(
        `📈 [CLIENT] Carregamento incremental: ${newCount}/${totalCount} partituras`
      );
    },
  });

  const { navigateToUrl } = useNavigate();

  // 🆕 Função para debug do estado atual
  const logCurrentState = () => {
    console.log('\n📊 [DEBUG] ESTADO ATUAL DA APLICAÇÃO');
    console.log('=====================================');
    console.log(`🎼 Obra: ${work.title}`);
    console.log(`👤 Compositor: ${work.composer.fullName}`);
    console.log(`🔗 IMSLP: ${work.imslpPermlink}`);
    console.log(`📋 Strategy: ${strategy}`);
    console.log(`💾 From Cache: ${fromCache}`);
    console.log(`📊 Loaded/Total: ${currentLoaded}/${totalAvailable}`);
    console.log(`🔄 Has More: ${hasMore}`);
    console.log(`⚡ Background: ${backgroundCaching} (${cacheProgress}%)`);
    console.log(
      `⭐ Most Favorited: ${mostFavoritedScoreId?.slice(0, 10) || 'None'}`
    );
    console.log(`🎯 Selected Score: ${selectedScore?.slice(0, 10) || 'None'}`);

    if (imslpScores) {
      console.log('\n🎵 PARTITURAS POR TIPO:');
      console.log('Loaded:', imslpScores.loadedCounts);
      console.log('Total:', imslpScores.totalCounts);

      Object.entries(imslpScores.scoresByType).forEach(([type, groups]) => {
        console.log(
          `  ${type}: ${groups.length} grupos, ${groups.reduce(
            (sum, g) => sum + g.scores.length,
            0
          )} partituras`
        );
      });
    }
    console.log('=====================================\n');
  };

  // 🆕 Função para forçar refresh completo
  const forceRefresh = async () => {
    console.log('🔄 [CLIENT] Forçando refresh completo...');
    await refetchScores();
    await refetchMostFavorited();
    logCurrentState();
  };

  // 🆕 Função para simular cache clear (dev only)
  const clearCache = async () => {
    if (process.env.NODE_ENV !== 'development') return;

    try {
      console.log('🗑️ [CLIENT] Limpando cache...');
      const response = await fetch('/api/imslp-scores/clear-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workId: work.id }),
      });

      if (response.ok) {
        console.log('✅ [CLIENT] Cache limpo com sucesso');
        await refetchScores();
      } else {
        console.error('❌ [CLIENT] Erro ao limpar cache');
      }
    } catch (error) {
      console.error('❌ [CLIENT] Erro ao limpar cache:', error);
    }
  };

  // Não renderizar até estar montado
  if (!mounted) {
    return (
      <div className="bg-gradient-primary">
        <div className="section-wrap">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
              <span className="text-theme-primary font-medium">
                Carregando obra...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Funções utilitárias mantidas...
  const formatDuration = (duration?: string) => {
    if (!duration) return null;
    return duration;
  };

  const getWorkTypeLabel = (type: string) => {
    const labels = {
      INDIVIDUAL: 'Obra Individual',
      COMPLETE_WORK: 'Obra Completa',
      ARRANGEMENT: 'Arranjo',
      COLLECTION: 'Coleção de peças',
      COLLABORATION: 'Colaboração',
      COMPOSITION: 'Composição Original',
      COLLECTED_WORKS: 'Coleção de peças',
      COLLECTIONS_WITH: 'Coleção com outros',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getDifficultyLabel = (level?: string) => {
    const labels = {
      BEGINNER: 'Iniciante',
      INTERMEDIATE: 'Intermediário',
      ADVANCED: 'Avançado',
    };
    return level ? labels[level as keyof typeof labels] || level : null;
  };

  const getDifficultyColor = (level?: string) => {
    const colors = {
      BEGINNER: 'from-accent-green to-accent-blue',
      INTERMEDIATE: 'from-accent-blue to-accent-purple',
      ADVANCED: 'from-accent-red to-accent-purple',
    };
    return level
      ? colors[level as keyof typeof colors] ||
          'from-theme-primary to-theme-secondary'
      : 'from-theme-primary to-theme-secondary';
  };

  const handleScoreSelect = (score: IMSLPScore) => {
    setSelectedScoreForStudy(score);
    setSelectedScore(score?.id || null);
  };

  // 🆕 Renderizar informações de strategy
  const renderStrategyInfo = () => {
    let strategyColor = 'from-theme-primary to-theme-secondary';
    let strategyIcon = FiActivity;
    let strategyLabel = 'Carregamento';
    let strategyDescription = 'Processando partituras...';

    switch (strategy) {
      case 'cache-all':
        strategyColor = 'from-accent-green to-accent-blue';
        strategyIcon = FiDatabase;
        strategyLabel = 'Cache Hit';
        strategyDescription = 'Mostrando todas as partituras salvas';
        break;
      case 'first-time-limited':
        strategyColor = 'from-accent-blue to-accent-purple';
        strategyIcon = FiZap;
        strategyLabel = 'Primeira Visita';
        strategyDescription = 'Carregamento inicial limitado';
        break;
      case 'load-more':
        strategyColor = 'from-accent-purple to-accent-red';
        strategyIcon = FiTrendingUp;
        strategyLabel = 'Carregando Mais';
        strategyDescription = 'Buscando partituras adicionais';
        break;
    }

    const StrategyIcon = strategyIcon;

    return (
      <div
        className={`p-3 bg-gradient-to-r ${strategyColor} rounded-xl flex items-center space-x-3`}
      >
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <StrategyIcon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold text-sm">
              {strategyLabel}
            </span>
            <span className="text-white/80 text-xs">•</span>
            <span className="text-white/80 text-xs">{strategyDescription}</span>
          </div>
          <div className="flex items-center space-x-4 mt-1">
            <span className="text-white/90 text-xs">
              {currentLoaded}/{totalAvailable} partituras
            </span>
            {backgroundCaching && (
              <span className="text-white/90 text-xs">
                Cache: {cacheProgress}%
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-primary">
      {/* Inicializar dados de aprendizado e favoritos do SSR */}
      <LearningInitializer learningData={learningData} />

      <div className="section-wrap space-y-8 relative z-10">
        {/* Breadcrumb */}
        <AnimatedItem direction="down" springType="gentle">
          <nav className="flex items-center space-x-2 text-sm text-theme-tertiary mb-6 pt-4">
            <Link
              href="/works"
              className="hover:text-brand-primary transition-colors duration-300 font-medium"
            >
              Obras
            </Link>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <Link
              href={`/composer/${work.composer.id}`}
              className="hover:text-brand-primary transition-colors duration-300 font-medium"
            >
              {work.composer.fullName}
            </Link>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-theme-primary font-medium">{work.title}</span>
          </nav>
        </AnimatedItem>

        <AnimatedContainer
          delay={0.1}
          staggerSpeed="normal"
          className="flex flex-col gap-4"
        >
          {/* 🆕 Strategy Information Banner */}
          {imslpScores && (
            <AnimatedItem direction="up">{renderStrategyInfo()}</AnimatedItem>
          )}

          {/* Header Principal */}
          <AnimatedCard
            hover="lift"
            className="classical-card overflow-hidden relative"
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute hidden sm:flex bottom-6 right-12 text-4xl text-brand-secondary/10 animate-float"
                style={{ animationDelay: '1s' }}
              >
                <FiMusic />
              </div>
            </div>

            <div className="p-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Informações Principais */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Título e Compositor */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title leading-tight">
                          {work.title}
                        </h1>

                        {work.subtitle && (
                          <h2 className="text-2xl md:text-3xl text-theme-secondary mt-2 classical-subtitle font-medium">
                            {work.subtitle}
                          </h2>
                        )}

                        <div className="flex items-center space-x-2 text-xl text-theme-secondary mt-3">
                          <span>por</span>
                          <Link
                            href={`/composer/${work.composer.id}`}
                            className="text-brand-primary hover:text-brand-secondary font-semibold transition-colors duration-300 classical-subtitle"
                          >
                            {work.composer.fullName}
                          </Link>
                        </div>
                        {work.opOrCatalog && (
                          <p className="text-lg text-theme-tertiary mt-2 font-medium">
                            {work.opOrCatalog}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-3 ml-4">
                        <FavoriteButton
                          id={work.id}
                          type="work"
                          variant="default"
                          size="lg"
                          itemName={work.title}
                          showToast={true}
                        />
                        <ShareButton
                          title={`${work.title} - Peça`}
                          description={`Veja partituras dessa maravilhosa peça.`}
                          variant="default"
                          size="lg"
                        />
                      </div>
                    </div>

                    {/* Difficulty Level Badge */}
                    {work.difficultyLevel && (
                      <div className="flex items-center space-x-3">
                        <div
                          className={`px-4 py-2 bg-gradient-to-r ${getDifficultyColor(
                            work.difficultyLevel
                          )} rounded-full flex items-center space-x-2 shadow-lg`}
                        >
                          <FiTarget className="w-4 h-4 text-theme-primary" />
                          <span className="text-theme-primary font-semibold text-sm">
                            Nível: {getDifficultyLabel(work.difficultyLevel)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Learning Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-theme-secondary/50">
                      <LearningButtonWithModal
                        workId={work.id}
                        workTitle={work.title}
                        composerName={work.composer.fullName}
                        type="want-to-learn"
                        variant="detailed"
                        size="md"
                      />
                      <LearningButtonWithModal
                        workId={work.id}
                        workTitle={work.title}
                        composerName={work.composer.fullName}
                        type="learned"
                        variant="detailed"
                        size="md"
                      />
                    </div>
                  </div>

                  {/* Grid de Informações Detalhadas - mantido igual */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Informações técnicas mantidas iguais... */}
                    {work.compositionYear && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiCalendar className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Ano de Composição
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {work.compositionYear}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Outras informações técnicas... */}
                  </div>
                </div>

                {/* Sidebar com informações técnicas MELHORADAS */}
                <div className="space-y-6">
                  {/* Seção de reprodução mantida... */}

                  {/* 🆕 Seção de Cache e Performance */}
                  <div className="classical-card-simple p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                        <FiDatabase className="w-4 h-4 text-theme-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-theme-primary classical-title">
                        Cache & Performance
                      </h3>
                    </div>

                    <div className="space-y-3 text-sm">
                      {/* Strategy atual */}
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-theme-tertiary">
                          Estratégia:
                        </span>
                        <span
                          className={`font-semibold ${
                            strategy === 'cache-all'
                              ? 'text-accent-green'
                              : strategy === 'first-time-limited'
                              ? 'text-accent-blue'
                              : 'text-accent-purple'
                          }`}
                        >
                          {strategy === 'cache-all'
                            ? 'Cache Hit'
                            : strategy === 'first-time-limited'
                            ? 'Primeira Vez'
                            : 'Carregando'}
                        </span>
                      </div>

                      {/* Contadores */}
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-theme-tertiary">
                          Partituras:
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-theme-primary font-semibold text-xs">
                            {currentLoaded}/{totalAvailable}
                          </span>
                          <span className="text-xs">
                            {fromCache ? '💾' : '🕷️'}
                          </span>
                        </div>
                      </div>

                      {/* Progresso */}
                      {totalAvailable > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-theme-tertiary">
                            Progresso:
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-theme-elevated border border-theme-primary/20 rounded-full h-1">
                              <div
                                className={`h-1 rounded-full transition-all duration-500 ${
                                  strategy === 'cache-all'
                                    ? 'bg-gradient-to-r from-accent-green to-accent-blue'
                                    : 'bg-gradient-to-r from-brand-primary to-brand-secondary'
                                }`}
                                style={{
                                  width: `${Math.round(
                                    (currentLoaded / totalAvailable) * 100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-theme-secondary">
                              {Math.round(
                                (currentLoaded / totalAvailable) * 100
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Cache em background */}
                      {backgroundCaching && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-theme-tertiary">
                            Cache BG:
                          </span>
                          <span className="text-xs text-accent-green font-semibold">
                            {cacheProgress}% ⚡
                          </span>
                        </div>
                      )}

                      {/* Estatísticas adicionais */}
                      <div className="pt-2 border-t border-theme-secondary space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-theme-tertiary">
                            Tipo de Obra:
                          </span>
                          <span className="text-theme-primary font-semibold text-xs">
                            {getWorkTypeLabel(work.workType)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-medium text-theme-tertiary">
                            Catalogado:
                          </span>
                          <span className="text-theme-primary font-semibold text-xs">
                            {new Date(work.createdAt).toLocaleDateString(
                              'pt-BR'
                            )}
                          </span>
                        </div>

                        {/* Most favorited info */}
                        {!loadingMostFavorited && mostFavoritedScoreId && (
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-theme-tertiary">
                              Top Score:
                            </span>
                            <span className="text-accent-red font-semibold text-xs">
                              ⭐ {mostFavoritedScoreId.slice(0, 8)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Ações rápidas */}
                      <div className="pt-2 border-t border-theme-secondary space-y-2">
                        <button
                          onClick={forceRefresh}
                          className="w-full text-xs text-theme-tertiary hover:text-theme-primary transition-colors flex items-center justify-center space-x-1 py-1"
                        >
                          <FiRefreshCw className="w-3 h-3" />
                          <span>Atualizar Dados</span>
                        </button>

                        {process.env.NODE_ENV === 'development' && (
                          <>
                            <button
                              onClick={() => setShowDebugInfo(!showDebugInfo)}
                              className="w-full text-xs text-theme-tertiary hover:text-theme-primary transition-colors flex items-center justify-center space-x-1 py-1"
                            >
                              <FiInfo className="w-3 h-3" />
                              <span>Debug Info</span>
                            </button>
                            <button
                              onClick={logCurrentState}
                              className="w-full text-xs text-theme-tertiary hover:text-theme-primary transition-colors flex items-center justify-center space-x-1 py-1"
                            >
                              <FiActivity className="w-3 h-3" />
                              <span>Log State</span>
                            </button>
                            <button
                              onClick={clearCache}
                              className="w-full text-xs text-accent-red hover:text-accent-red/80 transition-colors flex items-center justify-center space-x-1 py-1"
                            >
                              <FiZap className="w-3 h-3" />
                              <span>Clear Cache</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* 🆕 Seção de Partituras IMSLP com nova lógica */}
          {work.imslpPermlink && (
            <AnimatedCard hover="none" className="">
              <IMSLPTabsIncremental
                imslpData={imslpScores}
                loading={loadingScores}
                loadingMore={loadingMore}
                error={scoresError}
                onRefetch={refetchScores}
                onLoadMore={loadMore}
                onLoadMoreForTab={loadMoreForTab}
                onLoadAll={loadAll}
                onScoreSelect={handleScoreSelect}
                workId={work.id}
                workTitle={work.title}
                composerName={work.composer.fullName}
                hasMore={hasMore}
                totalAvailable={totalAvailable}
                currentLoaded={currentLoaded}
                backgroundCaching={backgroundCaching}
                cacheProgress={cacheProgress}
                getTabStats={getTabStats}
                strategy={strategy} // 🆕 Passar strategy para o componente
                // Props de favoritos
                mostFavoritedScoreId={mostFavoritedScoreId}
                mostFavoritedSource={mostFavoritedSource}
                hasMostFavorited={hasMostFavorited}
                loadingMostFavorited={loadingMostFavorited}
                isScoreMostFavorited={isScoreMostFavorited}
              />
            </AnimatedCard>
          )}

          {/* Seções mantidas iguais... */}
          <AnnotationsSection
            workId={work.id}
            workTitle={work.title}
            composerName={work.composer.fullName}
          />

          {/* Estudy Mode Modal */}
          <StudyModeModal
            composerName={work.composer.fullName}
            workId={work.id}
            workTitle={work.title}
            selectedScore={selectedScoreForStudy}
          />
        </AnimatedContainer>
      </div>

      {/* 🆕 Debug panel melhorado */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-theme-inverse/90 backdrop-blur-md rounded-lg p-3 text-xs text-theme-primary border border-theme-primary/20 z-50 max-w-sm">
          <div className="space-y-1">
            <div className="font-bold text-accent-blue mb-2">
              🚀 Debug Cache Logic v5.0
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  strategy === 'cache-all'
                    ? 'bg-accent-green'
                    : strategy === 'first-time-limited'
                    ? 'bg-accent-blue'
                    : 'bg-accent-purple'
                }`}
              ></div>
              <span className="capitalize">{strategy.replace('-', ' ')}</span>
            </div>
            <div>
              📊 Partituras: {currentLoaded}/{totalAvailable}
            </div>
            <div>💾 Cache: {fromCache ? 'Hit' : 'Miss'}</div>
            <div>
              🔄 Loading:{' '}
              {loadingScores ? 'Initial' : loadingMore ? 'More' : 'Ready'}
            </div>
            <div>
              ⚡ Background: {backgroundCaching ? `${cacheProgress}%` : 'No'}
            </div>
            <div>
              ⭐ Favorited: {mostFavoritedScoreId?.slice(0, 8) || 'None'}
            </div>

            <div className="flex space-x-1 mt-2">
              <button
                onClick={logCurrentState}
                className="px-2 py-1 bg-accent-blue/20 rounded text-accent-blue hover:bg-accent-blue/30 transition-colors text-xs"
              >
                Log
              </button>
              <button
                onClick={forceRefresh}
                className="px-2 py-1 bg-accent-green/20 rounded text-accent-green hover:bg-accent-green/30 transition-colors text-xs"
              >
                Refresh
              </button>
              <button
                onClick={clearCache}
                className="px-2 py-1 bg-accent-red/20 rounded text-accent-red hover:bg-accent-red/30 transition-colors text-xs"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
