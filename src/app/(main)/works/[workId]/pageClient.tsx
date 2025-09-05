// app/work/[workId]/WorkDetailsClient.tsx - COM TRADUÇÕES COMPLETAS
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiCalendar,
  FiMusic,
  FiInfo,
  FiTarget,
  FiSettings,
  FiBookOpen,
  FiExternalLink,
  FiPause,
  FiPlay,
  FiHeadphones,
  FiMapPin,
  FiClock,
  FiTag,
  FiCheckCircle,
  FiArrowLeft,
  FiLayers,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';
import { useIMSLPScoresIncremental } from '@/app/hooks/useIMSLPScoresIncremental';
import { useWorkScores } from '@/app/hooks/useWorkScores';
import { useNavigate } from '@/app/hooks/useNavigate';
import { useScoreSelectionStore } from '@/app/stores/useScoreSelectionStore';
import { useLearningModalStore } from '@/app/stores/useLearningModalStore';
import FavoriteButton from '../../../components/FavoriteButton';
import { LearningInitializer } from '../../../components/LearningInitializer';
import LearningButtonWithModal from '../../../components/LearningButtonWithModal';
import { IMSLPScore } from '@/app/libs/imslp-score-scraper-incremental';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
} from '../../../components/animation/AnimatedComponents';
import ShareButton from '../../../components/ShareButton';
import AnnotationsSection from '../../../components/Annotations/AnnotationsSection';
import { useMostFavoritedForWork } from '@/app/stores/useMostFavoritedStore';
import IMSLPTabsIncremental from '../../../components/WorkDetailsClient/IMSLPTabsIncremental';
import { GiMusicalNotes } from 'react-icons/gi';
import ReportButton from '../../../components/Report/ReportButton';
import VerificationModal from '../../../components/Verification/VerificationModal';
import VerificationBadge from '../../../components/Verification/VerificationBadge';
import VerificationButton from '../../../components/Verification/VerificationButton';
import EditButton from '../../../components/Common/EditButton';
import MediaSection from '../../../components/Players/MediaSection';
import { WorkDetails } from '@/app/requests/work-page-details';
import LearningModal from '../../../components/LearningModal';
import ScorePreview from '../../../components/WorkDetailsClient/ScorePreview';
import VideoAulaSection from '../../../components/Players/VideoAulaSection';
import { translateGenre } from '@/app/utils/translations/instrumentsGenresTranslation';
import { translateWorkTypeWithHook } from '@/app/utils/translations/workTypeTranslation';
import { translateToneWithHook } from '@/app/utils/translations/toneTranslation';
import { translateEpochWithHook } from '@/app/utils/translations/epochTranslationComposer';
import { translateCategoryStatic } from '@/app/utils/translations/categoryTranslation';
import { useTranslation } from '@/app/context/TranslationContext';

// Interface para dados de áudio processados (mantida igual)
interface ProcessedAudioData {
  hasAnyAudio: boolean;
  customAudio: {
    url: string;
    file: string;
    source: string;
    metadata: any;
    isUpload: boolean;
    isAlternativeSource: boolean;
    isPersistent: boolean;
    title: string;
  } | null;
  spotify: {
    trackId: string;
    trackUrl: string;
    displayTitle?: string;
    duration?: number;
    artists: string[];
    thumbnail?: string;
    previewUrl?: string | null;
    albumArt?: string | null;
    albumName?: string;
    popularity?: number;
  } | null;
  youtube: {
    videoId: string;
    videoUrl: string;
    title: string;
  } | null;
  mediaSource: string | null;
  lastMediaSearch: Date | null;
  mediaSearchError: string | null;
  completeness: number;
}

interface WorkDetailsClientProps {
  work: WorkDetails;
  audioData?: ProcessedAudioData;
  relatedWorks?: any[];
  learningData?: {
    wantToLearn: any[];
    learned: any[];
  };
  isAdmin: boolean;
  canEditMedia: boolean;
}

export default function WorkDetailsClient({
  work,
  audioData,
  isAdmin,
  canEditMedia,
  learningData = { wantToLearn: [], learned: [] },
}: WorkDetailsClientProps) {
  // ✅ Hook de traduções
  const { t, language } = useTranslation({ sections: ['pages/workId'] });

  // Estados seguros para SSR
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerified, setIsVerified] = useState(work.isVerified || false);

  // Estado local para dados de mídia
  const [currentAudioData, setCurrentAudioData] =
    useState<ProcessedAudioData | null>(audioData || null);

  // Hooks para seleção de partitura (mantidos)
  const {
    isSelectionMode,
    activeType,
    tempSelectedWorkScore,
    selectFromWorkScore,
    confirmScoreSelection,
    cancelScoreSelection,
  } = useScoreSelectionStore();

  // Hook para LearningModal global
  const { isInSelectionMode } = useLearningModalStore();

  const handleVerificationChange = (verified: boolean) => {
    setIsVerified(verified);
  };

  // Verificar se está montado (hidratado)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Atualizar estado local quando dados do server mudarem
  useEffect(() => {
    if (audioData) {
      setCurrentAudioData(audioData);
    }
  }, [audioData]);

  // Hook otimizado para partitura mais favoritada
  const { isScoreMostFavorited } = useMostFavoritedForWork(
    mounted ? work.id : ''
  );

  // Hook para carregamento de WorkScores do banco
  const {
    workScores,
    loading: loadingWorkScores,
    error: workScoresError,
    hasMore: hasMoreWorkScores,
    total: totalWorkScores,
    loadMore: loadMoreWorkScores,
    refetch: refetchWorkScores,
  } = useWorkScores({
    workId: work.id,
    limit: 20,
    enabled: mounted,
    source: 'UPLOAD',
  });

  // Hook para carregamento incremental IMSLP (apenas se tiver link)
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
    setSelectedScore,
    getTabStats,
  } = useIMSLPScoresIncremental(work.imslpPermlink || '', {
    workId: work.id,
    enabled: mounted && !!work.imslpPermlink,
    initialLimit: 5,
    moreLimit: 20,
  });

  const { navigateToUrl } = useNavigate();

  // Handler para seleção de partitura (funciona para ambos os tipos)
  const handleScoreSelectForLearning = async (score: IMSLPScore | any) => {
    if (isSelectionMode || (isInSelectionMode && score?.title)) {
      // Se for IMSLPScore, buscar WorkScore correspondente
      if (score.id && !score.workId) {
        // É IMSLPScore
        try {
          const response = await fetch(
            `/api/work-scores?workId=${work.id}&sourceId=${score.id}&source=IMSLP`
          );

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.workScore) {
              selectFromWorkScore(result.workScore);
            }
          }
        } catch {}
      } else {
        // Já é WorkScore
        selectFromWorkScore(score);
      }
    } else {
      setSelectedScore(score?.id || null);
    }
  };

  // Handler para confirmar seleção com verificação de mudança
  const handleConfirmSelection = () => {
    confirmScoreSelection();
  };

  // Handler para cancelar seleção
  const handleCancelSelection = () => {
    cancelScoreSelection();
  };

  // Converter dados processados para formato esperado pelo MediaSection
  const workForMediaSection = currentAudioData
    ? {
        ...work,
        spotifyTrackId:
          currentAudioData.spotify?.trackId || work.spotifyTrackId,
        spotifyTrackUrl:
          currentAudioData.spotify?.trackUrl || work.spotifyTrackUrl,
        spotifyDisplayTitle:
          currentAudioData.spotify?.displayTitle || work.spotifyDisplayTitle,
        spotifyDuration:
          currentAudioData.spotify?.duration || work.spotifyDuration,
        spotifyArtists: currentAudioData.spotify?.artists
          ? JSON.stringify(currentAudioData.spotify.artists)
          : work.spotifyArtists,
        spotifyThumbnail:
          currentAudioData.spotify?.thumbnail || work.spotifyThumbnail,
        youtubeVideoId:
          currentAudioData.youtube?.videoId || work.youtubeVideoId,
        youtubeVideoUrl:
          currentAudioData.youtube?.videoUrl || work.youtubeVideoUrl,
        youtubeTitle: currentAudioData.youtube?.title || work.youtubeTitle,
        customAudioUrl:
          currentAudioData.customAudio?.url || work.customAudioUrl,
        customAudioFile:
          currentAudioData.customAudio?.file || work.customAudioFile,
        customAudioSource:
          currentAudioData.customAudio?.source || work.customAudioSource,
        customAudioMetadata:
          currentAudioData.customAudio?.metadata || work.customAudioMetadata,
        mediaSource: currentAudioData.mediaSource || work.mediaSource,
        lastMediaSearch:
          currentAudioData.lastMediaSearch || work.lastMediaSearch,
        mediaSearchError:
          currentAudioData.mediaSearchError || work.mediaSearchError,
      }
    : work;

  // CONVERTER WORK PARA O FORMATO ESPERADO PELA VideoAulaSection
  const workForVideoAulaSection = {
    id: work.id,
    title: work.title,
    composer: {
      fullName: work.composer.fullName,
    },
    // CONVERTER null para undefined para compatibilidade TypeScript
    videoAulaUrl: work.videoAulaUrl || undefined,
    videoAulaFile: work.videoAulaFile || undefined,
    videoAulaTitle: work.videoAulaTitle || undefined,
    videoAulaType: work.videoAulaType || undefined,
    videoAulaSource: work.videoAulaSource || undefined,
    videoAulaAddedBy: work.videoAulaAddedBy || undefined,
    videoAulaAddedAt: work.videoAulaAddedAt || undefined,
    videoAulaMetadata: work.videoAulaMetadata || undefined,
  };

  // Callback para quando a mídia for atualizada
  const handleMediaUpdate = (newMediaData: Partial<ProcessedAudioData>) => {
    setCurrentAudioData((prev) => {
      if (!prev) {
        return {
          hasAnyAudio: !!(
            newMediaData.customAudio ||
            newMediaData.spotify ||
            newMediaData.youtube
          ),
          customAudio: null,
          spotify: null,
          youtube: null,
          mediaSource: null,
          lastMediaSearch: null,
          mediaSearchError: null,
          completeness: 0,
          ...newMediaData,
        };
      }

      return {
        ...prev,
        ...newMediaData,
        hasAnyAudio: !!(
          newMediaData.customAudio ||
          newMediaData.spotify ||
          newMediaData.youtube ||
          prev.customAudio ||
          prev.spotify ||
          prev.youtube
        ),
      };
    });
  };

  // ✅ Funções utilitárias com traduções MELHORADAS
  const formatDuration = (duration?: string) => {
    if (!duration) return null;
    return duration;
  };

  const getWorkTypeLabel = (type: string) => {
    return translateWorkTypeWithHook(type, t);
  };

  const getDifficultyLabel = (level?: string) => {
    if (!level) return null;
    const labelKey = `difficulty_${level.toLowerCase()}`;
    return t(labelKey) || level;
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

  // ✅ Função para traduzir tonalidade
  const getToneLabel = (tone?: string) => {
    if (!tone) return null;
    return translateToneWithHook(tone, t);
  };

  // ✅ Função para traduzir época
  const getEpochLabel = (epochName?: string) => {
    if (!epochName) return null;
    return translateEpochWithHook(epochName, t);
  };

  // ✅ Função para traduzir categoria
  const getCategoryLabel = (categoryName: string) => {
    return translateCategoryStatic(categoryName, language);
  };

  // ✅ Função para traduzir gênero
  const getGenreLabel = (genreName: string) => {
    return translateGenre(genreName, language);
  };

  // MODO DE SELEÇÃO MELHORADO COM PREVIEW (INCLUINDO QUANDO ESTÁ EDITANDO)
  if (isSelectionMode || isInSelectionMode) {
    return (
      <div className="bg-gradient-primary">
        <div className="section-wrap space-y-8 relative z-10">
          {/* Header do modo seleção MELHORADO */}
          <AnimatedItem direction="down" springType="gentle">
            <div className="bg-theme-elevated rounded-2xl p-4 md:p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 hidden md:flex bg-gradient-to-br from-accent-blue to-brand-primary rounded-2xl  items-center justify-center">
                    <FiTarget className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-lg md:text-xl font-bold text-theme-primary classical-title">
                      {t('selection_mode_selecionar_partitura')}{' '}
                      {activeType === 'want-to-learn'
                        ? t('selection_mode_quero_aprender')
                        : t('selection_mode_ja_aprendi')}
                    </h2>
                    <p className="text-sm md:text-md text-theme-secondary">
                      {tempSelectedWorkScore
                        ? `${t('selection_mode_partitura_selecionada')} ${
                            tempSelectedWorkScore.title
                          }`
                        : t('selection_mode_clique_partitura')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:gap-3 items-center ">
                  <button
                    onClick={handleCancelSelection}
                    className="btn-classical-secondary w-full justify-center flex items-center space-x-2"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    <span>{t('selection_mode_voltar')}</span>
                  </button>
                  {tempSelectedWorkScore && (
                    <button
                      onClick={handleConfirmSelection}
                      className="btn-classical-primary w-full justify-center flex items-center space-x-2"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      <span>{t('selection_mode_confirmar_selecao')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </AnimatedItem>

          {/* LAYOUT COM PREVIEW LATERAL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de Partituras */}
            <div className="lg:col-span-2">
              <AnimatedCard hover="none">
                <IMSLPTabsIncremental
                  // Props IMSLP (se disponível)
                  imslpData={work.imslpPermlink ? imslpScores : null}
                  imslpLoading={loadingScores}
                  imslpLoadingMore={loadingMore}
                  imslpError={scoresError}
                  onImslpRefetch={refetchScores}
                  onImslpLoadMore={loadMore}
                  onImslpLoadMoreForTab={loadMoreForTab}
                  onImslpLoadAll={loadAll}
                  // Props WorkScores (sempre disponível)
                  workScores={workScores}
                  workScoresLoading={loadingWorkScores}
                  workScoresError={workScoresError}
                  workScoresHasMore={hasMoreWorkScores}
                  workScoresTotal={totalWorkScores}
                  onWorkScoresLoadMore={loadMoreWorkScores}
                  onWorkScoresRefetch={refetchWorkScores}
                  // Props comuns
                  onScoreSelect={handleScoreSelectForLearning}
                  workId={work.id}
                  workTitle={work.title}
                  composerName={work.composer.fullName}
                  // Props de favoritos
                  isScoreMostFavorited={isScoreMostFavorited}
                  // Props para modo seleção
                  isSelectionMode={true}
                  tempSelectedWorkScore={tempSelectedWorkScore}
                  // Props IMSLP específicas
                  hasMore={hasMore}
                  totalAvailable={totalAvailable}
                  currentLoaded={currentLoaded}
                  getTabStats={getTabStats}
                />
              </AnimatedCard>
            </div>

            {/* PREVIEW LATERAL (SEMPRE VISÍVEL EM MODO SELEÇÃO) */}
            <div className="lg:col-span-1">
              <AnimatedCard hover="none" className="sticky top-6">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                      <FiBookOpen className="w-4 h-4 text-theme-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-theme-primary">
                      {t('selection_mode_preview_partitura')}
                    </h3>
                  </div>

                  {tempSelectedWorkScore ? (
                    <div className="space-y-4">
                      <ScorePreview score={tempSelectedWorkScore as any} />

                      {/* BOTÕES DE AÇÃO MELHORADOS */}
                      <div className="flex flex-col space-y-3 pt-4 border-t border-theme-secondary">
                        <button
                          onClick={handleConfirmSelection}
                          className="btn-classical-primary flex items-center justify-center space-x-2"
                        >
                          <FiCheckCircle className="w-4 h-4" />
                          <span>{t('selection_mode_confirmar_selecao')}</span>
                        </button>

                        <button
                          onClick={handleCancelSelection}
                          className="btn-classical-secondary flex items-center justify-center space-x-2"
                        >
                          <FiArrowLeft className="w-4 h-4" />
                          <span>{t('selection_mode_voltar')}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-theme-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FiMusic className="w-8 h-8 text-theme-tertiary" />
                      </div>
                      <h4 className="text-lg font-semibold text-theme-primary mb-2">
                        {t('selection_mode_selecione_partitura')}
                      </h4>
                      <p className="text-theme-secondary text-sm">
                        {t('selection_mode_clique_preview')}
                      </p>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderização normal
  return (
    <div className="bg-gradient-primary">
      <LearningInitializer learningData={learningData} />

      <div className="section-wrap space-y-8 relative z-10">
        {/* Breadcrumb */}
        <AnimatedItem direction="down" springType="gentle">
          <nav className="flex items-center space-x-2 text-sm text-theme-tertiary mb-6 pt-4">
            <Link
              href="/works"
              className="hover:text-brand-primary hidden md:block transition-colors duration-300 font-medium"
            >
              {t('breadcrumb_obras')}
            </Link>
            <div className="hidden md:block ">
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
            </div>

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
          {/* Card principal da obra */}
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

            <div className="p-4 md:p-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Informações Principais */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Título e Compositor */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between mb-0 md:mb-auto">
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
                        {/* Subtitle */}
                        {work.subtitle && (
                          <h2 className="text-2xl md:text-3xl text-theme-secondary mt-2 classical-subtitle font-medium">
                            {work.subtitle}
                          </h2>
                        )}

                        <div className="flex items-center space-x-2 text-xl text-theme-secondary mt-3">
                          <span>{t('work_details_por')}</span>
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
                      <div className="flex items-center flex-col md:flex-row gap-2 md:gap-3  space-x-3 ml-4">
                        <FavoriteButton
                          id={work.id}
                          type="work"
                          variant="default"
                          size="lg"
                          itemName={work.title}
                          showToast={true}
                          className="m-0 md:m-auto"
                        />
                        <ShareButton
                          title={`${work.title} - Obra musical`}
                          description={`Descubra "${work.title}"${
                            work.subtitle ? ` (${work.subtitle})` : ''
                          }, composta por ${work.composer.fullName}${
                            work.epoch?.name
                              ? ` no período ${work.epoch?.name}`
                              : ''
                          }. Explore partituras, gravações, vídeos e mais detalhes sobre essa obra ${
                            work.instrument
                              ? `para ${work.instrument.name}`
                              : 'erudita'
                          }.`}
                          variant="default"
                          size="lg"
                          className="m-0 md:m-auto"
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
                        {isAdmin ||
                          (canEditMedia && (
                            <EditButton
                              entityId={work.id}
                              variant="minimal"
                              entityType="work"
                              size="lg"
                              showLabel={false}
                            />
                          ))}
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

                    {/* Difficulty Level Badge */}
                    {work.difficultyLevel && (
                      <div className="flex items-center space-x-3">
                        <div
                          className={`px-0 md:px-4 py-2 bg-gradient-to-r ${getDifficultyColor(
                            work.difficultyLevel
                          )} rounded-full flex items-center space-x-2 shadow-lg`}
                        >
                          <FiTarget className="w-4 h-4 text-theme-primary" />
                          <span className="text-theme-primary font-semibold text-sm">
                            {t('work_details_nivel')}{' '}
                            {getDifficultyLabel(work.difficultyLevel)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Learning Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-theme-secondary/50">
                      <LearningButtonWithModal
                        workId={work.id}
                        workTitle={work.title}
                        instrumentName={work.instrument?.name}
                        composerName={work.composer.fullName}
                        epochName={work.epoch?.name}
                        type="want-to-learn"
                        variant="detailed"
                        size="md"
                      />
                      <LearningButtonWithModal
                        workId={work.id}
                        workTitle={work.title}
                        composerName={work.composer.fullName}
                        instrumentName={work.instrument?.name}
                        epochName={work.epoch?.name}
                        type="learned"
                        variant="detailed"
                        size="md"
                      />
                    </div>
                  </div>

                  {/* Grid de Informações Detalhadas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Ano de Composição */}
                    {work.compositionYear && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiCalendar className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            {t('work_details_ano_composicao')}
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
                            {t('work_details_duracao')}
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {formatDuration(work.mediaDuration)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ✅ Tom - COM TRADUÇÃO */}
                    {work.tone && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiMusic className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            {t('work_details_tom')}
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {getToneLabel(work.tone) || work.tone}
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
                            {t('work_details_instrumento')}
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {work.instrument.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ✅ Época - COM TRADUÇÃO */}
                    {work.epoch && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-red to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiMapPin className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            {t('work_details_epoca_estilo')}
                          </p>
                          <p className="text-brand-primary font-semibold">
                            {getEpochLabel(work.epoch.name) || work.epoch.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 🆕 SEÇÃO DE RELAÇÕES DE COLEÇÃO */}
                  {(work.parentWork ||
                    (work.childWorks && work.childWorks.length > 0)) && (
                    <div className="border-t border-theme-secondary pt-6">
                      <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                        <FiLayers className="w-5 h-5 text-accent-purple" />
                        <span>{t('work_details_relacoes_colecao')}</span>
                      </h3>

                      <div className="space-y-4">
                        {/* Obra Pai (Se esta obra faz parte de uma coleção) */}
                        {work.parentWork && (
                          <div className="p-4 bg-theme-elevated rounded-xl">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center mt-0.5 flex-shrink-0">
                                <FiArrowUp className="w-4 h-4 text-theme-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-theme-tertiary mb-1">
                                  {t('work_details_parte_de_colecao')}
                                </p>
                                <Link
                                  href={`/works/${work.parentWork.id}`}
                                  className="text-accent-purple hover:text-accent-blue font-semibold transition-colors duration-300 group flex items-center space-x-2"
                                >
                                  <span>{work.parentWork.title}</span>
                                  <FiExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                                <p className="text-xs text-theme-tertiary mt-1">
                                  {t('work_details_por')}{' '}
                                  {work.parentWork.composer.fullName}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Obras Filhas (Se esta obra possui partes/movimentos) */}
                        {work.childWorks && work.childWorks.length > 0 && (
                          <div className="p-4 bg-theme-elevated rounded-xl">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mt-0.5 flex-shrink-0">
                                <FiArrowDown className="w-4 h-4 text-theme-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-theme-tertiary mb-3">
                                  {t('work_details_possui_obras_relacionadas')}{' '}
                                  ({work.childWorks.length})
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {work.childWorks.map((childWork, index) => (
                                    <Link
                                      key={childWork.id}
                                      href={`/works/${childWork.id}`}
                                      className="group flex items-center space-x-2 p-2 rounded-lg hover:bg-theme-elevated transition-colors duration-200"
                                    >
                                      <div className="w-6 h-6 bg-accent-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-accent-green">
                                          {index + 1}
                                        </span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-theme-primary font-medium text-sm truncate group-hover:text-accent-green transition-colors">
                                          {childWork.title}
                                        </p>
                                        {childWork.subtitle && (
                                          <p className="text-theme-tertiary text-xs truncate">
                                            {childWork.subtitle}
                                          </p>
                                        )}
                                      </div>
                                      <FiExternalLink className="w-3 h-3 text-theme-tertiary  transition-opacity flex-shrink-0" />
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Informações Adicionais */}
                  {(work.firstPublishDate ||
                    work.dedicateTo ||
                    work.workStyle) && (
                    <div className="border-t border-theme-secondary pt-6">
                      <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                        <FiInfo className="w-5 h-5 text-accent-blue" />
                        <span>{t('work_details_informacoes_adicionais')}</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {work.firstPublishDate && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-theme-tertiary">
                              {t('work_details_primeira_publicacao')}
                            </span>
                            <span className="text-theme-primary font-semibold">
                              {work.firstPublishDate}
                            </span>
                          </div>
                        )}
                        {work.dedicateTo && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-theme-tertiary">
                              {t('work_details_dedicada_a')}
                            </span>
                            <span className="text-theme-primary font-semibold">
                              {work.dedicateTo}
                            </span>
                          </div>
                        )}

                        {work.workStyle && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-theme-tertiary">
                              {t('work_details_estilo')}
                            </span>
                            <span className="text-theme-primary font-semibold">
                              {work.workStyle}
                            </span>
                          </div>
                        )}
                        {work.instrumentation && (
                          <div className="md:col-span-2 p-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl border border-theme-primary">
                            <span className="font-medium text-theme-tertiary block mb-1">
                              {t('work_details_instrumentacao')}
                            </span>
                            <span className="text-theme-primary whitespace-pre-line">
                              {work.instrumentation}
                            </span>
                          </div>
                        )}

                        {work.moviment && (
                          <div className="md:col-span-2 p-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl border border-theme-primary">
                            <span className="font-medium text-theme-tertiary block mb-1">
                              {t('work_details_movimentos')}
                            </span>
                            <span className="text-theme-primary whitespace-pre-line">
                              {work.moviment}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ✅ Tags de Categorias e Gêneros - COM TRADUÇÕES */}
                  {work.workGenresArr &&
                    (work.categoryNames?.length > 0 ||
                      work.workGenresArr?.length > 0) && (
                      <div className="border-t border-theme-secondary pt-6">
                        <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                          <FiTag className="w-5 h-5 text-accent-green" />
                          <span>{t('work_details_categorias_generos')}</span>
                        </h3>
                        <div className="space-y-4">
                          {work.categoryNames?.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-theme-tertiary block mb-3">
                                {t('work_details_categorias')}
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
                                        {getCategoryLabel(categoryName)}
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
                                  {t('work_details_tipos_obra')}
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
                                          {getGenreLabel(workGenre)}
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
                          {t('work_details_reproducao')}
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
                          <span>
                            {isPlaying
                              ? t('work_details_pausar')
                              : t('work_details_reproduzir')}
                          </span>
                        </button>
                        <a
                          href={work.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-classical-secondary w-full flex items-center justify-center space-x-2 group"
                        >
                          <FiExternalLink className="w-4 h-4" />
                          <span>{t('work_details_abrir_player_externo')}</span>
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
                        {t('work_details_recursos_externos')}
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
                        <span>{t('work_details_ver_partitura_imslp')}</span>
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

                  {/* ✅ Informações Técnicas - COM TRADUÇÕES */}
                  <div className="classical-card-simple p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                        <FiSettings className="w-4 h-4 text-theme-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-theme-primary classical-title">
                        {t('work_details_detalhes_tecnicos')}
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-theme-tertiary">
                          {t('work_details_tipo')}
                        </span>
                        <span className="text-theme-primary font-semibold">
                          {getWorkTypeLabel(work.workType)}
                        </span>
                      </div>

                      {/* Difficulty Level in Technical Details */}
                      {work.difficultyLevel && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-theme-tertiary">
                            {t('work_details_dificuldade')}
                          </span>
                          <span className="text-theme-primary font-semibold">
                            {getDifficultyLabel(work.difficultyLevel)}
                          </span>
                        </div>
                      )}

                      {work.movementNumber && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-theme-tertiary">
                            {t('work_details_movimento')}
                          </span>
                          <span className="text-theme-primary font-semibold">
                            #{work.movementNumber}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-theme-secondary">
                        <span className="font-medium text-theme-tertiary">
                          {t('work_details_catalogado_em')}
                        </span>
                        <span className="text-theme-primary font-semibold text-xs">
                          {new Date(work.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Seção de Partituras SEMPRE VISÍVEL */}
          <AnimatedCard hover="none">
            <IMSLPTabsIncremental
              // Props IMSLP (se disponível)
              imslpData={work.imslpPermlink ? imslpScores : null}
              imslpLoading={loadingScores}
              imslpLoadingMore={loadingMore}
              imslpError={scoresError}
              onImslpRefetch={refetchScores}
              onImslpLoadMore={loadMore}
              onImslpLoadMoreForTab={loadMoreForTab}
              onImslpLoadAll={loadAll}
              // Props WorkScores (sempre disponível)
              workScores={workScores}
              workScoresLoading={loadingWorkScores}
              workScoresError={workScoresError}
              workScoresHasMore={hasMoreWorkScores}
              workScoresTotal={totalWorkScores}
              onWorkScoresLoadMore={loadMoreWorkScores}
              onWorkScoresRefetch={refetchWorkScores}
              // Props comuns
              onScoreSelect={handleScoreSelectForLearning}
              workId={work.id}
              workTitle={work.title}
              composerName={work.composer.fullName}
              // Props de favoritos
              isScoreMostFavorited={isScoreMostFavorited}
              // Props para modo normal
              isSelectionMode={false}
              tempSelectedWorkScore={null}
              // Props IMSLP específicas (se disponível)
              hasMore={hasMore}
              totalAvailable={totalAvailable}
              currentLoaded={currentLoaded}
              getTabStats={getTabStats}
            />
          </AnimatedCard>

          {/* Seção de Multimídia */}
          <MediaSection
            work={workForMediaSection}
            canEditMedia={canEditMedia}
            onMediaUpdate={handleMediaUpdate}
            isAdmin={isAdmin}
          />

          <VideoAulaSection
            work={workForVideoAulaSection}
            canEditMedia={canEditMedia}
          />

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
      {/* LearningModal global */}
      <LearningModal />
    </div>
  );
}
