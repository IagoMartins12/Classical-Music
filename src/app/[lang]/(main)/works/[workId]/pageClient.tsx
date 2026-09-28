// app/work/[workId]/WorkDetailsClient.tsx - COM TRADUÇÕES COMPLETAS
'use client';

import { nomeDeTransicao } from '@/app/components/ui/transicao';
import { useState, useEffect } from 'react';
import Link from '@/app/components/LocalizedLink';
import {
  PiArrowDown,
  PiArrowLeft,
  PiArrowSquareOut,
  PiArrowUp,
  PiBookOpen,
  PiCalendarBlank,
  PiCheckCircle,
  PiClock,
  PiGear,
  PiHeadphones,
  PiInfo,
  PiMapPin,
  PiMusicNotes,
  PiPause,
  PiPlay,
  PiStack,
  PiTag,
  PiTarget,
} from 'react-icons/pi';
import { useIMSLPScoresIncremental } from '@/app/hooks/useIMSLPScoresIncremental';
import { useWorkScores } from '@/app/hooks/useWorkScores';
import { useNavigate } from '@/app/hooks/useNavigate';
import { useScoreSelectionStore } from '@/app/stores/useScoreSelectionStore';
import { useLearningModalStore } from '@/app/stores/useLearningModalStore';
import FavoriteButton from '../../../../components/FavoriteButton';
import { LearningInitializer } from '../../../../components/LearningInitializer';
import LearningButtonWithModal from '../../../../components/LearningButtonWithModal';
import { IMSLPScore } from '@/app/libs/imslp-score-scraper-incremental';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
} from '../../../../components/animation/AnimatedComponents';
import ShareButton from '../../../../components/ShareButton';
import AnnotationsSection from '../../../../components/Annotations/AnnotationsSection';
import { useMostFavoritedForWork } from '@/app/stores/useMostFavoritedStore';
import IMSLPTabsIncremental from '../../../../components/WorkDetailsClient/IMSLPTabsIncremental';
import ReportButton from '../../../../components/Report/ReportButton';
import VerificationModal from '../../../../components/Verification/VerificationModal';
import { SeloNoTitulo } from '../../../../components/Verification/VerificationBadge';
import VerificationButton from '../../../../components/Verification/VerificationButton';
import EditButton from '../../../../components/Common/EditButton';
import MediaSection from '../../../../components/Players/MediaSection';
import { WorkDetails } from '@/app/requests/work-page-details';
import LearningModal from '../../../../components/LearningModal';
import ScorePreview from '../../../../components/WorkDetailsClient/ScorePreview';
import VideoAulaSection from '../../../../components/Players/VideoAulaSection';
import { translateGenre } from '@/app/utils/translations/instrumentsGenresTranslation';
import { translateWorkTypeWithHook } from '@/app/utils/translations/workTypeTranslation';
import { translateToneWithHook } from '@/app/utils/translations/toneTranslation';
import { translateEpochWithHook } from '@/app/utils/translations/epochTranslationComposer';
import { translateCategoryStatic } from '@/app/utils/translations/categoryTranslation';
import { useTranslation } from '@/app/context/TranslationContext';
import { useSession } from '@/app/libs/session';
import { canEditCatalog, canVerifyCatalog } from '@/app/utils/permissions';
import { workScoresRequest } from '@/app/requests/work-scores';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

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
}

export default function WorkDetailsClient({
  work,
  audioData,
  learningData = { wantToLearn: [], learned: [] },
}: WorkDetailsClientProps) {
  // ✅ Hook de traduções
  const { t, language } = useTranslation({ sections: ['pages/workId'] });

  /**
   * Quem pode editar se decide aqui, no navegador — antes vinha do servidor,
   * via `getServerSession`. Ler a sessão no servidor tornava esta página
   * dinâmica: ela passava a renderizar do zero a cada visita, embora o que
   * muda com a sessão sejam dois botões. Mesma solução já adotada na página
   * pública do artigo do blog (`components/blog/AdminOnly`).
   */
  const { data: session } = useSession();
  // Editar a obra é de administrador e de professor aprovado; o selo de
  // verificado é só da curadoria administrativa.
  const podeEditar = canEditCatalog(session?.user);
  const podeVerificar = canVerifyCatalog(session?.user);
  const canEditMedia = podeEditar || work.createdBy === session?.user?.id;

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
          const result = await workScoresRequest(
            new URLSearchParams({
              workId: work.id,
              sourceId: score.id,
              source: 'IMSLP',
            })
          );
          if (result.success && result.workScore) {
            selectFromWorkScore(result.workScore);
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
      BEGINNER: '',
      INTERMEDIATE: '',
      ADVANCED: '',
    };
    return level ? colors[level as keyof typeof colors] || '' : '';
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
      <div className="">
        <Stack gap={8} className="section-wrap relative z-10">
          {/* Header do modo seleção MELHORADO */}
          <AnimatedItem direction="down" springType="gentle">
            <div className="bg-theme-elevated rounded-2xl p-4 md:p-6 mb-6">
              <div className="flex items-center justify-between">
                <Inline gap={4}>
                  <div className="w-12 h-12 hidden md:flex rounded-2xl items-center justify-center">
                    <PiTarget className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-lg md:text-xl font-bold text-theme-primary classical-title">
                      {t('selection_mode_selecionar_partitura')}{' '}
                      {activeType === 'want-to-learn'
                        ? t('selection_mode_quero_aprender')
                        : t('selection_mode_ja_aprendi')}
                    </h2>
                    <p className="text-sm text-theme-secondary">
                      {tempSelectedWorkScore
                        ? `${t('selection_mode_partitura_selecionada')} ${
                            tempSelectedWorkScore.title
                          }`
                        : t('selection_mode_clique_partitura')}
                    </p>
                  </div>
                </Inline>

                <div className="flex flex-col md:flex-row gap-4 md:gap-3 items-center ">
                  <Inline
                    as="button"
                    gap={2}
                    onClick={handleCancelSelection}
                    className="btn-classical-secondary w-full justify-center"
                  >
                    <PiArrowLeft className="w-4 h-4" />
                    <span>{t('selection_mode_voltar')}</span>
                  </Inline>
                  {tempSelectedWorkScore && (
                    <Inline
                      as="button"
                      gap={2}
                      onClick={handleConfirmSelection}
                      className="btn-classical-primary w-full justify-center"
                    >
                      <PiCheckCircle className="w-4 h-4" />
                      <span>{t('selection_mode_confirmar_selecao')}</span>
                    </Inline>
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
                  <Inline gap={3} className="mb-4">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                      <PiBookOpen className="w-4 h-4 text-theme-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-theme-primary">
                      {t('selection_mode_preview_partitura')}
                    </h3>
                  </Inline>

                  {tempSelectedWorkScore ? (
                    <div className="space-y-4">
                      <ScorePreview score={tempSelectedWorkScore as any} />

                      {/* BOTÕES DE AÇÃO MELHORADOS */}
                      <Stack
                        gap={3}
                        className="pt-4 border-t border-theme-secondary"
                      >
                        <Inline
                          as="button"
                          gap={2}
                          onClick={handleConfirmSelection}
                          className="btn-classical-primary justify-center"
                        >
                          <PiCheckCircle className="w-4 h-4" />
                          <span>{t('selection_mode_confirmar_selecao')}</span>
                        </Inline>

                        <Inline
                          as="button"
                          gap={2}
                          onClick={handleCancelSelection}
                          className="btn-classical-secondary justify-center"
                        >
                          <PiArrowLeft className="w-4 h-4" />
                          <span>{t('selection_mode_voltar')}</span>
                        </Inline>
                      </Stack>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <PiMusicNotes className="w-8 h-8 text-theme-tertiary" />
                      </div>
                      <h4 className="text-lg font-semibold text-theme-primary mb-2">
                        {t('selection_mode_selecione_partitura')}
                      </h4>
                      <Text papel="rotulo" tom="suave" as="p">
                        {t('selection_mode_clique_preview')}
                      </Text>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </div>
          </div>
        </Stack>
      </div>
    );
  }

  // Renderização normal
  return (
    <div className="">
      <LearningInitializer learningData={learningData} />

      <Stack gap={8} className="section-wrap relative z-10">
        {/* Breadcrumb */}
        <AnimatedItem direction="down" springType="gentle">
          <Inline
            as="nav"
            gap={2}
            className="text-sm text-theme-tertiary mb-6 pt-4"
          >
            <Link
              href="/works"
              className="hidden md:block transition-colors duration-300 font-medium"
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
              className="transition-colors duration-300 font-medium"
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
          </Inline>
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
            style={nomeDeTransicao(`obra-${work.id}`, 'cartao')}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute hidden sm:flex bottom-6 right-12 text-4xl animate-float"
                style={{ animationDelay: '1s' }}
              >
                <PiMusicNotes />
              </div>
            </div>

            <div className="p-4 md:p-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Informações Principais */}
                <Stack gap={6} className="lg:col-span-3">
                  {/* Título e Compositor */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {/* O selo fica sempre montado (precisa ver a obra passar a
                            verificada para se desenhar) e colado na última
                            palavra do título. */}
                        <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title leading-tight">
                          <SeloNoTitulo
                            texto={work.title}
                            verified={isVerified}
                            title="Peça"
                          />
                        </h1>
                        {/* Subtitle */}
                        {work.subtitle && (
                          <h2 className="text-2xl md:text-3xl text-theme-secondary mt-2 classical-subtitle font-medium">
                            {work.subtitle}
                          </h2>
                        )}

                        <Inline
                          gap={2}
                          className="text-xl text-theme-secondary mt-3"
                        >
                          <span>{t('work_details_por')}</span>
                          <Link
                            href={`/composer/${work.composer.id}`}
                            className="text-ouro-texto font-semibold transition-colors duration-300 classical-subtitle"
                          >
                            {work.composer.fullName}
                          </Link>
                        </Inline>
                        {work.opOrCatalog && (
                          <p className="text-lg text-theme-tertiary mt-2 font-medium">
                            {work.opOrCatalog}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center flex-col md:flex-row gap-2 md:gap-3 ml-4">
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
                        {(podeEditar || canEditMedia) && (
                          <EditButton
                            entityId={work.id}
                            variant="minimal"
                            entityType="work"
                            size="lg"
                            showLabel={false}
                          />
                        )}
                        {podeVerificar && (
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
                      <Inline gap={3}>
                        <div
                          className={`px-0 md:px-4 py-2 bg-gradient-to-r ${getDifficultyColor(
                            work.difficultyLevel
                          )} rounded-full flex items-center space-x-2 shadow-lg`}
                        >
                          <PiTarget className="w-4 h-4 text-theme-primary" />
                          <Text
                            papel="rotulo"
                            tom="forte"
                            className="font-semibold"
                          >
                            {t('work_details_nivel')}{' '}
                            {getDifficultyLabel(work.difficultyLevel)}
                          </Text>
                        </div>
                      </Inline>
                    )}

                    {/* Learning Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-linha">
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
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <PiCalendarBlank className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <Text
                            papel="rotulo"
                            tom="fraco"
                            as="p"
                            className="font-medium"
                          >
                            {t('work_details_ano_composicao')}
                          </Text>
                          <p className="text-theme-primary font-semibold">
                            {work.compositionYear}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Duração */}
                    {work.mediaDuration && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <PiClock className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <Text
                            papel="rotulo"
                            tom="fraco"
                            as="p"
                            className="font-medium"
                          >
                            {t('work_details_duracao')}
                          </Text>
                          <p className="text-theme-primary font-semibold">
                            {formatDuration(work.mediaDuration)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ✅ Tom - COM TRADUÇÃO */}
                    {work.tone && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <PiMusicNotes className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <Text
                            papel="rotulo"
                            tom="fraco"
                            as="p"
                            className="font-medium"
                          >
                            {t('work_details_tom')}
                          </Text>
                          <p className="text-theme-primary font-semibold">
                            {getToneLabel(work.tone) || work.tone}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Instrumento */}
                    {work.instrument && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <PiMusicNotes className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <Text
                            papel="rotulo"
                            tom="fraco"
                            as="p"
                            className="font-medium"
                          >
                            {t('work_details_instrumento')}
                          </Text>
                          <p className="text-theme-primary font-semibold">
                            {work.instrument.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ✅ Época - COM TRADUÇÃO */}
                    {work.epoch && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <PiMapPin className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <Text
                            papel="rotulo"
                            tom="fraco"
                            as="p"
                            className="font-medium"
                          >
                            {t('work_details_epoca_estilo')}
                          </Text>
                          <p className="text-ouro-texto font-semibold">
                            {getEpochLabel(work.epoch.name) || work.epoch.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 🆕 SEÇÃO DE RELAÇÕES DE COLEÇÃO */}
                  {(work.parentWork ||
                    (work.childWorks && work.childWorks.length > 0)) && (
                    <Stack className="border-t border-theme-secondary pt-6">
                      <Inline
                        as="h2"
                        gap={2}
                        className="text-lg font-semibold text-theme-primary classical-title"
                      >
                        <PiStack className="w-5 h-5" />
                        <span>{t('work_details_relacoes_colecao')}</span>
                      </Inline>

                      <Stack>
                        {/* Obra Pai (Se esta obra faz parte de uma coleção) */}
                        {work.parentWork && (
                          <div className="p-4 bg-theme-elevated rounded-xl">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 flex-shrink-0">
                                <PiArrowUp className="w-4 h-4 text-theme-primary" />
                              </div>
                              <div className="flex-1">
                                <Text
                                  papel="rotulo"
                                  tom="fraco"
                                  as="p"
                                  className="font-medium mb-1"
                                >
                                  {t('work_details_parte_de_colecao')}
                                </Text>
                                <Link
                                  href={`/works/${work.parentWork.id}`}
                                  className="font-semibold transition-colors duration-300 group flex items-center space-x-2"
                                >
                                  <span>{work.parentWork.title}</span>
                                  <PiArrowSquareOut className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                                <Text
                                  papel="legenda"
                                  tom="fraco"
                                  as="p"
                                  className="mt-1"
                                >
                                  {t('work_details_por')}{' '}
                                  {work.parentWork.composer.fullName}
                                </Text>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Obras Filhas (Se esta obra possui partes/movimentos) */}
                        {work.childWorks && work.childWorks.length > 0 && (
                          <div className="p-4 bg-theme-elevated rounded-xl">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 flex-shrink-0">
                                <PiArrowDown className="w-4 h-4 text-theme-primary" />
                              </div>
                              <div className="flex-1">
                                <Text
                                  papel="rotulo"
                                  tom="fraco"
                                  as="p"
                                  className="font-medium mb-3"
                                >
                                  {t('work_details_possui_obras_relacionadas')}{' '}
                                  ({work.childWorks.length})
                                </Text>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {work.childWorks.map((childWork, index) => (
                                    <Link
                                      key={childWork.id}
                                      href={`/works/${childWork.id}`}
                                      className="group flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200"
                                    >
                                      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold">
                                          {index + 1}
                                        </span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <Text
                                          papel="rotulo"
                                          tom="forte"
                                          as="p"
                                          className="font-medium truncate transition-colors"
                                        >
                                          {childWork.title}
                                        </Text>
                                        {childWork.subtitle && (
                                          <Text
                                            papel="legenda"
                                            tom="fraco"
                                            as="p"
                                            className="truncate"
                                          >
                                            {childWork.subtitle}
                                          </Text>
                                        )}
                                      </div>
                                      <PiArrowSquareOut className="w-3 h-3 text-theme-tertiary  transition-opacity flex-shrink-0" />
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Stack>
                    </Stack>
                  )}

                  {/* Informações Adicionais */}
                  {(work.firstPublishDate ||
                    work.dedicateTo ||
                    work.workStyle) && (
                    <Stack className="border-t border-theme-secondary pt-6">
                      <Inline
                        as="h2"
                        gap={2}
                        className="text-lg font-semibold text-theme-primary classical-title"
                      >
                        <PiInfo className="w-5 h-5" />
                        <span>{t('work_details_informacoes_adicionais')}</span>
                      </Inline>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {work.firstPublishDate && (
                          <Inline gap={2}>
                            <span className="font-medium text-theme-tertiary">
                              {t('work_details_primeira_publicacao')}
                            </span>
                            <span className="text-theme-primary font-semibold">
                              {work.firstPublishDate}
                            </span>
                          </Inline>
                        )}
                        {work.dedicateTo && (
                          <Inline gap={2}>
                            <span className="font-medium text-theme-tertiary">
                              {t('work_details_dedicada_a')}
                            </span>
                            <span className="text-theme-primary font-semibold">
                              {work.dedicateTo}
                            </span>
                          </Inline>
                        )}

                        {work.workStyle && (
                          <Inline gap={2}>
                            <span className="font-medium text-theme-tertiary">
                              {t('work_details_estilo')}
                            </span>
                            <span className="text-theme-primary font-semibold">
                              {work.workStyle}
                            </span>
                          </Inline>
                        )}
                        {work.instrumentation && (
                          <div className="md:col-span-2 p-3 rounded-xl bg-sup-2">
                            <span className="font-medium text-theme-tertiary block mb-1">
                              {t('work_details_instrumentacao')}
                            </span>
                            <span className="text-theme-primary whitespace-pre-line">
                              {work.instrumentation}
                            </span>
                          </div>
                        )}

                        {work.moviment && (
                          <div className="md:col-span-2 p-3 rounded-xl bg-sup-2">
                            <span className="font-medium text-theme-tertiary block mb-1">
                              {t('work_details_movimentos')}
                            </span>
                            <span className="text-theme-primary whitespace-pre-line">
                              {work.moviment}
                            </span>
                          </div>
                        )}
                      </div>
                    </Stack>
                  )}

                  {/* ✅ Tags de Categorias e Gêneros - COM TRADUÇÕES */}
                  {work.workGenresArr &&
                    (work.categoryNames?.length > 0 ||
                      work.workGenresArr?.length > 0) && (
                      <Stack className="border-t border-theme-secondary pt-6">
                        <Inline
                          as="h2"
                          gap={2}
                          className="text-lg font-semibold text-theme-primary classical-title"
                        >
                          <PiTag className="w-5 h-5" />
                          <span>{t('work_details_categorias_generos')}</span>
                        </Inline>
                        <Stack>
                          {work.categoryNames?.length > 0 && (
                            <Stack gap={3}>
                              <Text
                                papel="rotulo"
                                tom="fraco"
                                className="font-medium block"
                              >
                                {t('work_details_categorias')}
                              </Text>
                              <div className="flex flex-wrap gap-2 gap-y-5">
                                {work.categoryNames.map(
                                  (categoryName, index) => (
                                    <AnimatedItem
                                      key={index}
                                      hover="none"
                                      springType="bouncy"
                                    >
                                      <Text
                                        papel="rotulo"
                                        tom="ouro"
                                        className="px-4 py-2 cursor-pointer bg-gradient-to-r rounded-full font-medium bg-sup-2"
                                        onClick={() =>
                                          navigateToUrl(
                                            `works?categoryNames=${categoryName}`
                                          )
                                        }
                                      >
                                        {getCategoryLabel(categoryName)}
                                      </Text>
                                    </AnimatedItem>
                                  )
                                )}
                              </div>
                            </Stack>
                          )}

                          {work.workGenresArr &&
                            work.workGenresArr.length > 0 && (
                              <Stack gap={3}>
                                <Text
                                  papel="rotulo"
                                  tom="fraco"
                                  className="font-medium block"
                                >
                                  {t('work_details_tipos_obra')}
                                </Text>
                                <div className="flex flex-wrap gap-2 gap-y-5">
                                  {work.workGenresArr.map(
                                    (workGenre, index) => (
                                      <AnimatedItem
                                        key={index}
                                        hover="scale"
                                        springType="bouncy"
                                      >
                                        <span
                                          className="capitalize cursor-pointer px-4 py-2 rounded-full text-sm font-medium hover:scale-105 transition-all duration-300 bg-sup-2"
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
                              </Stack>
                            )}
                        </Stack>
                      </Stack>
                    )}
                </Stack>

                {/* Sidebar com Player e Links */}
                <Stack gap={6}>
                  {/* Player de Áudio/Vídeo */}
                  {work.videoUrl && (
                    <Card nivel={2}>
                      <Inline gap={3} className="mb-4">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                          <PiHeadphones className="w-4 h-4 text-theme-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-theme-primary classical-title">
                          {t('work_details_reproducao')}
                        </h3>
                      </Inline>
                      <Stack gap={3}>
                        <Inline
                          as="button"
                          gap={2}
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="btn-classical-primary w-full justify-center group"
                        >
                          {isPlaying ? (
                            <PiPause className="w-4 h-4" />
                          ) : (
                            <PiPlay className="w-4 h-4" />
                          )}
                          <span>
                            {isPlaying
                              ? t('work_details_pausar')
                              : t('work_details_reproduzir')}
                          </span>
                        </Inline>
                        <Inline
                          as="a"
                          gap={2}
                          href={work.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-classical-secondary w-full justify-center group"
                        >
                          <PiArrowSquareOut className="w-4 h-4" />
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
                        </Inline>
                      </Stack>
                    </Card>
                  )}

                  {/* Links Externos */}
                  <Card nivel={2}>
                    <Inline gap={3} className="mb-4">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                        <PiBookOpen className="w-4 h-4 text-theme-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-theme-primary classical-title">
                        {t('work_details_recursos_externos')}
                      </h3>
                    </Inline>
                    <Stack gap={3}>
                      <Inline
                        as="a"
                        gap={2}
                        href={work.imslpPermlink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-classical-primary w-full group"
                      >
                        <PiBookOpen className="w-4 h-4" />
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
                      </Inline>
                    </Stack>
                  </Card>

                  {/* ✅ Informações Técnicas - COM TRADUÇÕES */}
                  <Card nivel={2}>
                    <Inline gap={3} className="mb-4">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                        <PiGear className="w-4 h-4 text-theme-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-theme-primary classical-title">
                        {t('work_details_detalhes_tecnicos')}
                      </h3>
                    </Inline>
                    <Stack gap={3} className="text-sm">
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
                        <Text
                          papel="legenda"
                          tom="forte"
                          className="font-semibold"
                        >
                          {new Date(work.createdAt).toLocaleDateString('pt-BR')}
                        </Text>
                      </div>
                    </Stack>
                  </Card>
                </Stack>
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
            isAdmin={podeEditar}
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

          {podeVerificar && (
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
      </Stack>
      {/* LearningModal global */}
      <LearningModal />
    </div>
  );
}
