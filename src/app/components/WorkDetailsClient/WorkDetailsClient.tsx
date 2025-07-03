// app/work/[workId]/WorkDetailsClient.tsx - VERSÃO COM CARREGAMENTO INCREMENTAL
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
} from 'react-icons/fi';
import { GiMusicalNotes, GiMetronome } from 'react-icons/gi';
import { useIMSLPScoresIncremental } from '@/app/hooks/useIMSLPScoresIncremental';
import IMSLPTabsIncremental from '../IMSLPTabsIncremental';
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

  // 🆕 Hook para carregamento incremental de partituras
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
    loadAll,
    fromCache,
    backgroundCaching,
    cacheProgress,
    selectedScore,
    setSelectedScore,
  } = useIMSLPScoresIncremental(mounted ? work.imslpPermlink : '', {
    workId: work.id,
    enabled: mounted,
    initialLimit: 5, // Carregar 5 partituras por tipo inicialmente
    moreLimit: 20, // Carregar 20 por vez no "carregar mais"
    priorityScoreId: selectedScoreForStudy?.id,
    onScoresCached: (fromCache) => {
      if (fromCache) {
        console.log(
          `✅ Partituras carregadas do cache para obra ${work.title}`
        );
      } else {
        console.log(
          `🕷️ Partituras obtidas via scraping para obra ${work.title}`
        );
      }
    },
    onLoadMoreComplete: (newCount, totalCount) => {
      console.log(
        `📈 Carregamento incremental: ${newCount}/${totalCount} partituras`
      );
    },
  });

  const { navigateToUrl } = useNavigate();

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

  // Funções utilitárias (mantidas)
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

  const renderMovementsDetailed = (movements?: any) => {
    if (!movements) return null;

    try {
      const parsedMovements =
        typeof movements === 'string' ? JSON.parse(movements) : movements;

      if (Array.isArray(parsedMovements)) {
        return (
          <div className="space-y-3">
            <span className="text-sm font-medium text-theme-tertiary block mb-3">
              Movimentos Detalhados:
            </span>
            <div className="space-y-2">
              {parsedMovements.map((movement, index) => (
                <div
                  key={index}
                  className="p-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl border border-theme-primary/30"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="w-6 h-6 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-xs font-bold text-theme-primary">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-theme-primary">
                      {movement.title ||
                        movement.name ||
                        `Movimento ${index + 1}`}
                    </span>
                  </div>
                  {movement.tempo && (
                    <p className="text-sm text-theme-secondary ml-8">
                      <span className="font-medium">Tempo:</span>{' '}
                      {movement.tempo}
                    </p>
                  )}
                  {movement.key && (
                    <p className="text-sm text-theme-secondary ml-8">
                      <span className="font-medium">Tom:</span> {movement.key}
                    </p>
                  )}
                  {movement.duration && (
                    <p className="text-sm text-theme-secondary ml-8">
                      <span className="font-medium">Duração:</span>{' '}
                      {movement.duration}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
    } catch (error) {
      console.error('Erro ao parsear movimentos:', error);
    }

    return (
      <div className="p-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl border border-theme-primary">
        <span className="font-medium text-theme-tertiary block mb-1">
          Movimentos:
        </span>
        <span className="text-theme-primary">
          {typeof movements === 'string'
            ? movements
            : JSON.stringify(movements)}
        </span>
      </div>
    );
  };

  const handleScoreSelect = (score: IMSLPScore) => {
    setSelectedScoreForStudy(score);
    setSelectedScore(score?.id || null);
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
          {/* Header Principal - Mantido igual */}
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

                  {/* Grid de Informações Detalhadas - Mantido igual */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                    {work.mediaDuration && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiClock className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Duração
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {formatDuration(work.mediaDuration)}
                          </p>
                        </div>
                      </div>
                    )}

                    {work.tone && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiMusic className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Tom
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {work.tone}
                          </p>
                        </div>
                      </div>
                    )}

                    {work.timeSignature && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-red to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiActivity className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Fórmula de Compasso
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {work.timeSignature}
                          </p>
                        </div>
                      </div>
                    )}

                    {work.tempoMarking && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <GiMetronome className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Indicação de Tempo
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {work.tempoMarking}
                          </p>
                        </div>
                      </div>
                    )}

                    {work.instrument && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <GiMusicalNotes className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Instrumento
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {work.instrument.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {work.epoch && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-red to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiMapPin className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Época/Estilo
                          </p>
                          <p className="text-brand-primary font-semibold">
                            {work.epoch.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Movements Detailed Section - Mantido */}
                  {work.movementsDetailed && (
                    <div className="border-t border-theme-secondary pt-6">
                      <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                        <FiLayers className="w-5 h-5 text-accent-purple" />
                        <span>Estrutura da Obra</span>
                      </h3>
                      {renderMovementsDetailed(work.movementsDetailed)}
                    </div>
                  )}

                  {/* Informações Adicionais - Mantido */}
                  {(work.firstPublishDate ||
                    work.dedicateTo ||
                    work.workStyle) && (
                    <div className="border-t border-theme-secondary pt-6">
                      <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                        <FiInfo className="w-5 h-5 text-accent-blue" />
                        <span>Informações Adicionais</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {work.firstPublishDate && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-theme-tertiary">
                              Primeira Publicação:
                            </span>
                            <span className="text-theme-primary font-semibold">
                              {work.firstPublishDate}
                            </span>
                          </div>
                        )}
                        {work.dedicateTo && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-theme-tertiary">
                              Dedicada a:
                            </span>
                            <span className="text-theme-primary font-semibold">
                              {work.dedicateTo}
                            </span>
                          </div>
                        )}
                        {work.workStyle && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-theme-tertiary">
                              Estilo:
                            </span>
                            <span className="text-theme-primary font-semibold">
                              {work.workStyle}
                            </span>
                          </div>
                        )}
                        {work.instrumentation && (
                          <div className="md:col-span-2 p-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl border border-theme-primary">
                            <span className="font-medium text-theme-tertiary block mb-1">
                              Instrumentação:
                            </span>
                            <span className="text-theme-primary whitespace-pre-line">
                              {work.instrumentation}
                            </span>
                          </div>
                        )}
                        {work.moviment && (
                          <div className="md:col-span-2 p-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl border border-theme-primary">
                            <span className="font-medium text-theme-tertiary block mb-1">
                              Movimentos:
                            </span>
                            <span className="text-theme-primary whitespace-pre-line">
                              {work.moviment}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags sections mantidas... */}
                  {work.imslpTags && work.imslpTags.length > 0 && (
                    <div className="border-t border-theme-secondary pt-6">
                      <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                        <FiZap className="w-5 h-5 text-accent-green" />
                        <span>Tags IMSLP</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {work.imslpTags.map((tag, index) => (
                          <AnimatedItem
                            key={index}
                            hover="scale"
                            springType="bouncy"
                          >
                            <span className="px-3 py-1 bg-gradient-to-r from-accent-green/10 to-accent-green/20 border border-accent-green/30 text-accent-green rounded-full text-xs font-medium hover:scale-105 hover:shadow-theme-glow transition-all duration-300">
                              {tag}
                            </span>
                          </AnimatedItem>
                        ))}
                      </div>
                    </div>
                  )}

                  {work.workGenresArr &&
                    (work.categoryNames?.length > 0 ||
                      work.workGenresArr?.length > 0) && (
                      <div className="border-t border-theme-secondary pt-6">
                        <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                          <FiTag className="w-5 h-5 text-accent-green" />
                          <span>Categorias e Gêneros</span>
                        </h3>
                        <div className="space-y-4">
                          {work.categoryNames?.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-theme-tertiary block mb-3">
                                Categorias:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {work.categoryNames.map(
                                  (categoryName, index) => (
                                    <AnimatedItem
                                      key={index}
                                      hover="scale"
                                      springType="bouncy"
                                    >
                                      <span
                                        className="px-4 py-2 cursor-pointer bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/30 text-brand-primary rounded-full text-sm font-medium hover:scale-105 hover:shadow-theme-glow transition-all duration-300"
                                        onClick={() =>
                                          navigateToUrl(
                                            `works?categoryNames=${categoryName}`
                                          )
                                        }
                                      >
                                        {categoryName}
                                      </span>
                                    </AnimatedItem>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {work.workGenresArr &&
                            work.workGenresArr.length > 0 && (
                              <div>
                                <span className="text-sm font-medium text-theme-tertiary block mb-3">
                                  Tipos de Obra:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {work.workGenresArr.map(
                                    (workGenre, index) => (
                                      <AnimatedItem
                                        key={index}
                                        hover="scale"
                                        springType="bouncy"
                                      >
                                        <span
                                          className="capitalize cursor-pointer px-4 py-2 bg-gradient-to-r from-accent-green/10 to-accent-blue/10 border border-accent-green/30 text-accent-green rounded-full text-sm font-medium hover:scale-105 hover:shadow-theme-glow transition-all duration-300"
                                          onClick={() =>
                                            navigateToUrl(
                                              `works?workGenresArr=${workGenre}`
                                            )
                                          }
                                        >
                                          {workGenre}
                                        </span>
                                      </AnimatedItem>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                </div>

                {/* Sidebar com Player e Links - Mantido */}
                <div className="space-y-6">
                  {work.videoUrl && (
                    <div className="classical-card-simple p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-red to-accent-purple rounded-xl flex items-center justify-center">
                          <FiHeadphones className="w-4 h-4 text-theme-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-theme-primary classical-title">
                          Reprodução
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="btn-classical-primary w-full flex items-center justify-center space-x-2 group"
                        >
                          {isPlaying ? (
                            <FiPause className="w-4 h-4" />
                          ) : (
                            <FiPlay className="w-4 h-4" />
                          )}
                          <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
                        </button>
                        <a
                          href={work.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-classical-secondary w-full flex items-center justify-center space-x-2 group"
                        >
                          <FiExternalLink className="w-4 h-4" />
                          <span>Abrir no Player Externo</span>
                          <svg
                            className="w-4 h-4 transition-transform group-hover:translate-x-1"
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
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="classical-card-simple p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                        <FiBookOpen className="w-4 h-4 text-theme-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-theme-primary classical-title">
                        Recursos Externos
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <a
                        href={work.imslpPermlink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-classical-primary w-full flex items-center space-x-2 group"
                      >
                        <FiBookOpen className="w-4 h-4" />
                        <span>Ver Partitura (IMSLP)</span>
                        <svg
                          className="w-4 h-4 transition-transform group-hover:translate-x-1"
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
                      </a>
                    </div>
                  </div>

                  {/* 🆕 Informações técnicas atualizadas com dados incrementais */}
                  <div className="classical-card-simple p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                        <FiSettings className="w-4 h-4 text-theme-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-theme-primary classical-title">
                        Detalhes Técnicos
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-theme-tertiary">
                          Tipo:
                        </span>
                        <span className="text-theme-primary font-semibold">
                          {getWorkTypeLabel(work.workType)}
                        </span>
                      </div>

                      {work.difficultyLevel && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-theme-tertiary">
                            Dificuldade:
                          </span>
                          <span className="text-theme-primary font-semibold">
                            {getDifficultyLabel(work.difficultyLevel)}
                          </span>
                        </div>
                      )}

                      {work.movementNumber && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-theme-tertiary">
                            Movimento:
                          </span>
                          <span className="text-theme-primary font-semibold">
                            #{work.movementNumber}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-theme-secondary">
                        <span className="font-medium text-theme-tertiary">
                          Catalogado em:
                        </span>
                        <span className="text-theme-primary font-semibold text-xs">
                          {new Date(work.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {/* 🆕 Informações do carregamento incremental */}
                      <div className="pt-2 border-t border-theme-secondary space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-theme-tertiary">
                            Partituras:
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              fromCache
                                ? 'text-accent-green'
                                : 'text-accent-blue'
                            }`}
                          >
                            {currentLoaded}/{totalAvailable}{' '}
                            {fromCache ? '💾' : '🕷️'}
                          </span>
                        </div>

                        {backgroundCaching && (
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-theme-tertiary">
                              Cache:
                            </span>
                            <span className="text-xs text-accent-green font-semibold">
                              {cacheProgress}% ⚡
                            </span>
                          </div>
                        )}

                        {hasMore && (
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-theme-tertiary">
                              Mais disponíveis:
                            </span>
                            <span className="text-xs text-accent-blue font-semibold">
                              {totalAvailable - currentLoaded} restantes
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Debug info para desenvolvimento */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="pt-2 border-t border-theme-secondary space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-theme-tertiary">
                              Status:
                            </span>
                            <span
                              className={`text-xs font-semibold ${
                                loadingScores
                                  ? 'text-accent-orange'
                                  : loadingMore
                                  ? 'text-accent-blue'
                                  : 'text-accent-green'
                              }`}
                            >
                              {loadingScores
                                ? '⏳ Loading'
                                : loadingMore
                                ? '📄 Loading More'
                                : '✅ Ready'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-theme-tertiary">
                              Most Favorited:
                            </span>
                            <span className="text-xs text-theme-primary">
                              {loadingMostFavorited
                                ? '⏳'
                                : mostFavoritedScoreId
                                ? `✅ ${mostFavoritedScoreId.slice(0, 8)}`
                                : '❌'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* 🆕 Seção de Partituras IMSLP - Agora totalmente incremental */}
          {work.imslpPermlink && (
            <AnimatedCard hover="none" className="">
              <IMSLPTabsIncremental
                imslpData={imslpScores}
                loading={loadingScores}
                loadingMore={loadingMore}
                error={scoresError}
                onRefetch={refetchScores}
                onLoadMore={loadMore}
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
                // Props de favoritos
                mostFavoritedScoreId={mostFavoritedScoreId}
                mostFavoritedSource={mostFavoritedSource}
                hasMostFavorited={hasMostFavorited}
                loadingMostFavorited={loadingMostFavorited}
                isScoreMostFavorited={isScoreMostFavorited}
              />
            </AnimatedCard>
          )}

          <AnnotationsSection
            workId={work.id}
            workTitle={work.title}
            composerName={work.composer.fullName}
          />

          {/* Obras Relacionadas - Mantido */}
          {relatedWorks.length > 0 && (
            <AnimatedCard hover="none" className="classical-card p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                  <FiMusic className="w-5 h-5 text-theme-primary" />
                </div>
                <h2 className="text-2xl font-bold text-theme-primary classical-title">
                  Obras Relacionadas
                </h2>
              </div>
              <SequentialGrid
                cols={3}
                gap={6}
                delayBetweenItems={0.1}
                className=""
              >
                {relatedWorks.slice(0, 6).map((relatedWork) => (
                  <Link
                    key={relatedWork.id}
                    href={`/works/${relatedWork.id}`}
                    className="block classical-card-simple p-4 hover:shadow-theme-glow transition-all duration-300 hover:scale-105 group"
                  >
                    <h3 className="font-semibold text-theme-primary mb-2 group-hover:text-brand-primary transition-colors classical-title">
                      {relatedWork.title}
                    </h3>
                    <p className="text-sm text-theme-secondary mb-2">
                      {relatedWork.composer.name}
                    </p>
                    {relatedWork.opOrCatalog && (
                      <p className="text-xs text-theme-tertiary bg-theme-elevated border border-theme-secondary px-2 py-1 rounded-full inline-block">
                        {relatedWork.opOrCatalog}
                      </p>
                    )}
                  </Link>
                ))}
              </SequentialGrid>
            </AnimatedCard>
          )}

          <StudyModeModal
            composerName={work.composer.fullName}
            workId={work.id}
            workTitle={work.title}
            selectedScore={selectedScoreForStudy}
          />
        </AnimatedContainer>
      </div>

      {/* 🆕 Debug panel melhorado para desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-theme-inverse/90 backdrop-blur-md rounded-lg p-3 text-xs text-theme-primary border border-theme-primary/20 z-50">
          <div className="space-y-1">
            <div className="font-bold text-accent-blue mb-2">
              🚀 Performance Debug (Incremental)
            </div>
            <div>
              Loaded: {currentLoaded}/{totalAvailable} partituras
            </div>
            <div>
              Remaining: {Math.max(0, totalAvailable - currentLoaded)} restantes
            </div>
            <div>Has More: {hasMore ? '✅ Yes' : '❌ No'}</div>
            <div>
              Loading:{' '}
              {loadingScores
                ? '🔄 Initial'
                : loadingMore
                ? '📄 More'
                : '✅ Ready'}
            </div>
            <div>
              Cache: {fromCache ? '💾 Hit (todas já salvas)' : '🕷️ Miss'}
            </div>
            <div>
              Background:{' '}
              {backgroundCaching ? `⚡ ${cacheProgress}%` : '💤 Idle'}
            </div>
            <div>
              Most Favorited: {mostFavoritedScoreId?.slice(0, 12) || 'None'}
            </div>
            <div className="flex space-x-1 mt-2">
              <button
                onClick={refetchMostFavorited}
                className="px-2 py-1 bg-brand-primary/20 rounded text-brand-primary hover:bg-brand-primary/30 transition-colors text-xs"
              >
                Refetch
              </button>
              {hasMore && (
                <button
                  onClick={() => loadMore(10)}
                  className="px-2 py-1 bg-accent-blue/20 rounded text-accent-blue hover:bg-accent-blue/30 transition-colors text-xs"
                  disabled={loadingMore}
                >
                  +10
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
