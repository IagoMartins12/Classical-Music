// app/work/[workId]/WorkDetailsClient.tsx - ATUALIZADO com Nova Lógica de Cache
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WorkDetails } from '@/app/requests/work-details';
import {
  FiCalendar,
  FiMusic,
  FiInfo,
  FiActivity,
  FiTarget,
  FiZap,
  FiSettings,
  FiBookOpen,
  FiExternalLink,
  FiPause,
  FiPlay,
  FiHeadphones,
  FiMapPin,
  FiClock,
  FiLayers,
  FiTag,
} from 'react-icons/fi';
import { useIMSLPScoresIncremental } from '@/app/hooks/useIMSLPScoresIncremental';
import { useNavigate } from '@/app/hooks/useNavigate';
import FavoriteButton from '../FavoriteButton';
import { LearningInitializer } from '../LearningInitializer';
import LearningButtonWithModal from '../LearningButtonWithModal';
import { IMSLPScore } from '@/app/libs/imslp-score-scraper-incremental';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
} from '../animation/AnimatedComponents';
import ShareButton from '../ShareButton';
import AnnotationsSection from '../Annotations/AnnotationsSection';
import { useMostFavoritedForWork } from '@/app/stores/useMostFavoritedStore';
import IMSLPTabsIncremental from './IMSLPTabsIncremental';
import { GiMetronome, GiMusicalNotes } from 'react-icons/gi';
import ReportButton from '../Report/ReportButton';
import VerificationModal from '../Verification/VerificationModal';
import VerificationBadge from '../Verification/VerificationBadge';
import VerificationButton from '../Verification/VerificationButton';
import AdContainer from '../Ads/AdContainer';
import EditButton from '../Common/EditButton';
import MediaSection from '../Players/MediaSection';

interface WorkDetailsClientProps {
  work: WorkDetails;
  relatedWorks?: any[];
  learningData?: {
    wantToLearn: any[];
    learned: any[];
  };
  isAdmin: boolean;
  canEditMedia: boolean; // 🆕 Nova prop
}

export default function WorkDetailsClient({
  work,
  isAdmin,
  canEditMedia, // 🆕
  learningData = { wantToLearn: [], learned: [] },
}: WorkDetailsClientProps) {
  // Estados seguros para SSR
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedScoreForStudy, setSelectedScoreForStudy] =
    useState<IMSLPScore | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerified, setIsVerified] = useState(work.isVerified || false);

  const handleVerificationChange = (verified: boolean) => {
    setIsVerified(verified);
    // Atualizar no contexto global se necessário
  };
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
    loadMoreForTab, // ✅ Esta função está correta
    loadAll, // ✅ Esta função está correta
    fromCache,
    backgroundCaching,
    cacheProgress,
    setSelectedScore,
    getTabStats,
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

  // Funções utilitárias mantidas...
  const formatDuration = (duration?: string) => {
    if (!duration) return null;
    return duration;
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
                        <div className="flex items-center  gap-4">
                          <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title leading-tight">
                            {work.title}
                          </h1>
                          {isVerified && (
                            <VerificationBadge
                              verified={isVerified}
                              size="lg"
                              variant="icon"
                              title="Peça"
                            />
                          )}
                        </div>
                        {/* 🆕 Subtitle */}
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
                        <ReportButton
                          entityType="work"
                          entityId={work.id}
                          entityName={work.title}
                          variant="ghost"
                          size="lg"
                          showLabel={false}
                        />
                        {/* Admin verification button */}
                        {isAdmin && (
                          <EditButton
                            entityId={work.id}
                            variant="minimal"
                            entityType="work"
                            size="lg"
                            showLabel={false}
                          />
                        )}
                        {isAdmin && (
                          <VerificationButton
                            entityType="work"
                            variant="ghost"
                            size="lg"
                            onClick={() => setShowVerificationModal(true)}
                          />
                        )}
                      </div>
                    </div>

                    {/* 🆕 Difficulty Level Badge */}
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

                  {/* Grid de Informações Detalhadas - UPDATED com novas propriedades */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Ano de Composição */}
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

                    {/* Duração */}
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

                    {/* Tom */}
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

                    {/* 🆕 Time Signature */}
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

                    {/* 🆕 Tempo Marking */}
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

                    {/* Instrumento */}
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

                    {/* Época */}
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

                  {/* 🆕 Movements Detailed Section */}
                  {work.movementsDetailed && (
                    <div className="border-t border-theme-secondary pt-6">
                      <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                        <FiLayers className="w-5 h-5 text-accent-purple" />
                        <span>Estrutura da Obra</span>
                      </h3>
                      {renderMovementsDetailed(work.movementsDetailed)}
                    </div>
                  )}

                  {/* Informações Adicionais */}
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

                  {/* 🆕 IMSLP Tags Section */}
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

                  {/* Tags de Categorias e Gêneros - UPDATED */}
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
                                      hover="none"
                                      springType="bouncy"
                                    >
                                      <span
                                        className="px-4 py-2 cursor-pointer bg-gradient-to-r border border-brand-primary/30 text-brand-primary rounded-full text-sm font-medium"
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

                {/* Sidebar com Player e Links */}
                <div className="space-y-6">
                  {/* Player de Áudio/Vídeo */}
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

                  {/* Links Externos */}
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

                  {/* Informações Técnicas - UPDATED */}
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

                      {/* 🆕 Difficulty Level in Technical Details */}
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

                      {/* Cache Status (só para dev/debug) */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="flex items-center justify-between pt-2 border-t border-theme-secondary">
                          <span className="font-medium text-theme-tertiary">
                            Cache Status:
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              fromCache
                                ? 'text-accent-green'
                                : 'text-accent-blue'
                            }`}
                          >
                            {fromCache ? '💾 Cache' : '🕷️ Scraping'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AdContainer placement="BETWEEN_CONTENT" className="space-y-4" />

          <MediaSection work={work} canEditMedia={canEditMedia} />

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
                onLoadMoreForTab={loadMoreForTab} // ✅ Passa a função correta
                onLoadAll={loadAll} // ✅ Passa a função correta
                onScoreSelect={handleScoreSelect}
                workId={work.id}
                workTitle={work.title}
                composerName={work.composer.fullName}
                hasMore={hasMore}
                totalAvailable={totalAvailable}
                currentLoaded={currentLoaded}
                backgroundCaching={backgroundCaching}
                cacheProgress={cacheProgress}
                getTabStats={getTabStats} // ✅ Passa a função correta
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

          {isAdmin && (
            <VerificationModal
              isOpen={showVerificationModal}
              onClose={() => setShowVerificationModal(false)}
              currentItem="work"
              itemId={work.id}
              composerName={work.title}
              currentVerificationStatus={isVerified}
              onVerificationChange={handleVerificationChange}
            />
          )}
        </AnimatedContainer>
      </div>
    </div>
  );
}
