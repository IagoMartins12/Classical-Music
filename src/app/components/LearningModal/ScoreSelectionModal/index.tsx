// components/ScoreSelectionModal/ScoreSelectionModal.tsx - VERSÃO CORRIGIDA SEM LOOPS INFINITOS
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  PiArrowLeft,
  PiArrowsClockwise,
  PiBookOpen,
  PiDotsThree,
  PiFileText,
  PiMusicNotes,
  PiUploadSimple,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
import { toast } from 'react-hot-toast';
import { useWorkScores, WorkScore } from '@/app/hooks/useWorkScores';

import {
  AnimatedContainer,
  AnimatedItem,
  SequentialGrid,
} from '../../animation/AnimatedComponents';
import Modal from '../../Modal';
import ScorePreview from '../../WorkDetailsClient/ScorePreview';
import ScoreCard from '../../WorkDetailsClient/ScoreCard';
import { useTranslation } from '@/app/hooks/useTranslation';
import Button from '../../Common/Button';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Card } from '@/app/components/ui/Card';
import { useTx } from '@/app/hooks/useTx';

// Interface para dados unificados
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
}

interface MixedScoreGroup {
  groupIndex: number;
  scores: MixedScoreData[];
  groupTitle?: string;
  source: 'WORKSCORE';
}

interface ScoreSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workId: string;
  workTitle: string;
  composerName: string;
  currentSelectedScore?: {
    id: string;
    sourceId: string;
    source: 'IMSLP' | 'CUSTOM' | 'UPLOAD';
    title: string;
    downloadUrl?: string;
    thumbnailUrl?: string;
    fileSize?: string;
    pageCount?: string;
    fileFormat: string;
    type: string;
    editor?: string;
    publisher?: string;
    copyright?: string;
    uploadDate?: string;
    uploader?: string;
    notes?: string;
  } | null;
  onScoreSelected: (workScore: any) => void;
  isEditing?: boolean;
}

const ScoreSelectionModal = ({
  isOpen,
  onClose,
  workId,
  workTitle,
  composerName,
  currentSelectedScore,
  onScoreSelected,
  isEditing = false,
}: ScoreSelectionModalProps) => {
  const tx = useTx();
  const { t, ready } = useTranslation({ sections: ['pages/learning'] });

  // TABS para categorias traduzidas
  const SCORE_TABS = [
    {
      id: 'scores',
      label: t('scores_tab'),
      type: 'scores' as const,
      icon: PiMusicNotes,
      gradient: '',
    },
    {
      id: 'parts',
      label: t('parts_tab'),
      type: 'parts' as const,
      icon: PiFileText,
      gradient: '',
    },
    {
      id: 'arrangements',
      label: t('arrangements_tab'),
      type: 'arrangements' as const,
      icon: PiMusicNotes,
      gradient: '',
    },
    {
      id: 'uploads',
      label: t('uploads_tab'),
      type: 'uploads' as const,
      icon: PiUploadSimple,
      gradient: '',
    },
    {
      id: 'others',
      label: t('others_tab'),
      type: 'others' as const,
      icon: PiFileText,
      gradient: '',
    },
  ];

  const [activeTab, setActiveTab] = useState('scores');
  const [selectedScore, setSelectedScore] = useState<MixedScoreData | null>(
    null
  );
  const [isConverting, setIsConverting] = useState(false);

  // 🔥 USAR REF PARA CONTROLAR AUTO-SELEÇÃO SEM CAUSAR RE-RENDERS
  const hasAutoSelectedRef = useRef(false);
  const initializedRef = useRef(false);

  // 🔥 Hook com configuração estável usando useRef para evitar mudanças desnecessárias
  const hookOptions = useMemo(
    () => ({
      workId,
      limitPerType: 20,
      enabled: isOpen && !!workId,
    }),
    [workId, isOpen]
  );

  const {
    workScores,
    loading: loadingWorkScores,
    error: workScoresError,
    loadMoreForType,
    refetch: refetchWorkScores,
    pagination,
  } = useWorkScores(hookOptions);

  // 🔥 MEMOIZAR workScores de forma mais estável
  const stableWorkScores = useMemo(() => {
    if (!workScores || workScores.length === 0) return [];
    return workScores;
  }, [workScores?.length, workScores?.map((ws) => ws.id).join(',')]);

  // 🔥 MEMOIZAR pagination de forma mais estável
  const stablePagination = useMemo(() => {
    if (!pagination) return { totalByType: {}, loadedByType: {} };
    return {
      totalByType: pagination.totalByType || {},
      loadedByType: pagination.loadedByType || {},
    };
  }, [
    JSON.stringify(pagination?.totalByType || {}),
    JSON.stringify(pagination?.loadedByType || {}),
  ]);

  // 🔥 PROCESSAR DADOS COM CONTADORES CORRETOS - MEMOIZADO ULTRA ESTÁVEL
  const { mixedData, visibleTabs, tabStats } = useMemo(() => {
    const processed = {
      scores: [] as MixedScoreGroup[],
      parts: [] as MixedScoreGroup[],
      arrangements: [] as MixedScoreGroup[],
      uploads: [] as MixedScoreGroup[],
      others: [] as MixedScoreGroup[],
    };

    const stats = {
      scores: {
        loaded: stablePagination.loadedByType.scores || 0,
        total: stablePagination.totalByType.scores || 0,
        hasMore:
          (stablePagination.loadedByType.scores || 0) <
          (stablePagination.totalByType.scores || 0),
        remaining: Math.max(
          0,
          (stablePagination.totalByType.scores || 0) -
            (stablePagination.loadedByType.scores || 0)
        ),
      },
      parts: {
        loaded: stablePagination.loadedByType.parts || 0,
        total: stablePagination.totalByType.parts || 0,
        hasMore:
          (stablePagination.loadedByType.parts || 0) <
          (stablePagination.totalByType.parts || 0),
        remaining: Math.max(
          0,
          (stablePagination.totalByType.parts || 0) -
            (stablePagination.loadedByType.parts || 0)
        ),
      },
      arrangements: {
        loaded: stablePagination.loadedByType.arrangements || 0,
        total: stablePagination.totalByType.arrangements || 0,
        hasMore:
          (stablePagination.loadedByType.arrangements || 0) <
          (stablePagination.totalByType.arrangements || 0),
        remaining: Math.max(
          0,
          (stablePagination.totalByType.arrangements || 0) -
            (stablePagination.loadedByType.arrangements || 0)
        ),
      },
      uploads: {
        loaded: stablePagination.loadedByType.uploads || 0,
        total: stablePagination.totalByType.uploads || 0,
        hasMore:
          (stablePagination.loadedByType.uploads || 0) <
          (stablePagination.totalByType.uploads || 0),
        remaining: Math.max(
          0,
          (stablePagination.totalByType.uploads || 0) -
            (stablePagination.loadedByType.uploads || 0)
        ),
      },
      others: {
        loaded: stablePagination.loadedByType.others || 0,
        total: stablePagination.totalByType.others || 0,
        hasMore:
          (stablePagination.loadedByType.others || 0) <
          (stablePagination.totalByType.others || 0),
        remaining: Math.max(
          0,
          (stablePagination.totalByType.others || 0) -
            (stablePagination.loadedByType.others || 0)
        ),
      },
    };

    // Organizar WorkScores por tipo apenas se há dados
    if (stableWorkScores.length > 0) {
      const workScoreGroups: { [key: string]: WorkScore[] } = {};

      stableWorkScores.forEach((ws) => {
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

      Object.entries(workScoreGroups).forEach(([type, scores]) => {
        if (scores.length > 0) {
          const group: MixedScoreGroup = {
            groupIndex: 0,
            groupTitle: `${
              type === 'uploads'
                ? t('uploads_tab')
                : type.charAt(0).toUpperCase() + type.slice(1)
            } (${scores.length} ${t('scores_loaded')})`,
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

          processed[type as keyof typeof processed].push(group);
        }
      });
    }

    // Tabs visíveis (que têm conteúdo)
    const visible = SCORE_TABS.filter((tab) => {
      const tabStat = stats[tab.type as keyof typeof stats];
      return tabStat.total > 0;
    });

    return {
      mixedData: processed,
      visibleTabs: visible,
      tabStats: stats,
    };
  }, [stableWorkScores, stablePagination, t]);

  // 🔥 RESETAR ESTADO QUANDO MODAL ABRE/FECHA - SEM LOOPS
  useEffect(() => {
    if (isOpen && !initializedRef.current) {
      if (!isEditing) {
        setSelectedScore(null);
        hasAutoSelectedRef.current = false;
      }

      if (visibleTabs.length > 0 && !isEditing) {
        setActiveTab(visibleTabs[0].id);
      }

      initializedRef.current = true;
    } else if (!isOpen) {
      initializedRef.current = false;
      hasAutoSelectedRef.current = false;
    }
  }, [isOpen, isEditing, visibleTabs.length]);

  // 🔥 AUTO-SELEÇÃO ULTRA CONTROLADA - EXECUTAR APENAS UMA VEZ
  useEffect(() => {
    // 🔥 CONDIÇÕES ULTRA RESTRITIVAS
    if (
      !isOpen ||
      !isEditing ||
      !currentSelectedScore ||
      selectedScore ||
      hasAutoSelectedRef.current ||
      stableWorkScores.length === 0 ||
      !initializedRef.current
    ) {
      return;
    }

    const allScores = Object.values(mixedData).flatMap((groups) =>
      groups.flatMap((group) => group.scores)
    );

    const matchingScore = allScores.find(
      (score) =>
        score.id === currentSelectedScore.id ||
        score.sourceId === currentSelectedScore.sourceId
    );

    if (matchingScore) {
      setSelectedScore(matchingScore);
      hasAutoSelectedRef.current = true;

      // Auto-navegar para a tab correta
      const scoreType = Object.entries(mixedData).find(([_, groups]) =>
        groups.some((group) =>
          group.scores.some((score) => score.id === matchingScore.id)
        )
      )?.[0];

      if (scoreType) {
        setActiveTab(scoreType);
      }
    }
  }, [
    isOpen,
    isEditing,
    currentSelectedScore?.id, // Apenas o ID
    stableWorkScores.length, // Apenas o length
    mixedData, // Este já é memoizado corretamente
  ]);

  // 🔥 HANDLERS ESTÁVEIS
  const handleScoreSelect = useCallback(
    (score: MixedScoreData) => {
      if (selectedScore?.id === score.id) {
        setSelectedScore(null);
        hasAutoSelectedRef.current = false;
      } else {
        setSelectedScore(score);
        hasAutoSelectedRef.current = true;
      }
    },
    [selectedScore?.id]
  );

  const handleConfirmSelection = useCallback(async () => {
    if (!selectedScore) {
      onScoreSelected(null);
      toast.success(
        isEditing
          ? t('score_removed_success')
          : t('configuration_saved_without_score'),
        { icon: isEditing ? '🗑️' : '✅', duration: 3000 }
      );
      onClose();
      return;
    }

    setIsConverting(true);
    try {
      const workScore = {
        id: selectedScore.id,
        sourceId: selectedScore.sourceId || selectedScore.id,
        source: selectedScore.source,
        title: selectedScore.title,
        downloadUrl: selectedScore.downloadUrl,
        thumbnailUrl: selectedScore.thumbnailUrl,
        fileSize: selectedScore.fileSize,
        pageCount: selectedScore.pageCount,
        fileFormat: selectedScore.fileFormat || 'PDF',
        type: selectedScore.type,
        editor: selectedScore.editor,
        publisher: selectedScore.publisher,
        copyright: selectedScore.copyright,
        uploadDate: selectedScore.uploadDate,
        uploader: selectedScore.uploader,
        notes: selectedScore.notes,
      };

      onScoreSelected(workScore);
      toast.success(
        isEditing ? t('score_updated_success') : t('score_selected_success'),
        { icon: isEditing ? '✏️' : '🎼', duration: 3000 }
      );
      onClose();
    } catch (error) {
      console.error('Erro ao confirmar seleção:', error);
      toast.error(
        tx(
          'Erro ao selecionar partitura. Tente novamente.',
          'Could not choose the score. Try again.'
        )
      );
    } finally {
      setIsConverting(false);
    }
  }, [selectedScore, onScoreSelected, isEditing, onClose, t]);

  const handleLoadMoreForTab = useCallback(
    async (tabType: string) => {
      try {
        await loadMoreForType(tabType);
      } catch {
        toast.error(
          tx('Erro ao carregar mais partituras', 'Could not load more scores')
        );
      }
    },
    [loadMoreForType]
  );

  // Dados da tab ativa - memoizados
  const activeTabData = useMemo(
    () => mixedData[activeTab as keyof typeof mixedData] || [],
    [mixedData, activeTab]
  );

  const activeTabStat = useMemo(
    () => tabStats[activeTab as keyof typeof tabStats],
    [tabStats, activeTab]
  );

  return (
    <Modal
      carregando={!ready}
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="6xl"
      showCloseButton={false}
      className="max-h-[95vh] overflow-hidden"
      setPr
    >
      {/* Header */}
      <div className="border-b border-theme-secondary">
        <div className="p-2 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <Inline gap={4}>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-theme-elevated rounded-xl flex items-center justify-center transition-all duration-300"
              >
                <PiArrowLeft className="w-5 h-5 text-theme-primary" />
                <NomeAcao acao="voltar" />
              </button>

              <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
                <PiMusicNotes className="w-6 h-6 text-theme-primary" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-theme-primary classical-title">
                  {isEditing
                    ? t('edit_score_modal_title')
                    : t('select_score_modal_title')}
                </h2>
                <Inline gap={2}>
                  <p className="text-theme-secondary classical-subtitle">
                    {workTitle} • {composerName}
                  </p>
                </Inline>
              </div>
            </Inline>

            {/* Status e botão de confirmação */}
            <Inline gap={3}>
              <div className="rounded-xl px-4 py-2 bg-sup-2">
                <Inline gap={2} className="text-sm">
                  <span className="text-theme-secondary text-center font-medium">
                    {selectedScore
                      ? isEditing
                        ? t('new_score_selected')
                        : t('score_selected')
                      : t('no_score_selected_modal')}
                  </span>
                </Inline>
              </div>

              <Button
                onClick={handleConfirmSelection}
                disabled={isConverting}
                className="btn-classical-secondary SW !text-erro"
              >
                {isConverting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t('processing')}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {selectedScore
                        ? isEditing
                          ? t('update_and_back')
                          : t('confirm_selection')
                        : isEditing
                          ? t('remove_score')
                          : t('continue_without_score')}
                    </span>
                  </>
                )}
              </Button>
            </Inline>
          </div>
        </div>

        {/* Tabs Navigation */}
        {visibleTabs.length > 0 && (
          <nav
            className="flex overflow-x-scroll classical-scrollbar-mini px-0 md:px-6"
            aria-label="Tabs"
          >
            {visibleTabs.map((tab, index) => {
              const isActive = activeTab === tab.id;
              const tabStat = tabStats[tab.type as keyof typeof tabStats];
              const Icon = tab.icon;

              return (
                <AnimatedItem key={tab.id} hover="scale" springType="bouncy">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-6 py-4 cursor-pointer text-sm font-medium  transition-all duration-300 whitespace-nowrap flex-shrink-0 animate-fade-in-up relative ${
                      isActive
                        ? 'border-0 md:border-b-2 text-ouro-texto bg-gradient-to-t to-transparent'
                        : 'border-b-2 border-transparent text-theme-tertiary'
                    }`}
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

                    {/* Contadores corretos */}
                    <Inline gap={1}>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                          isActive
                            ? 'text-ouro-texto border'
                            : 'bg-theme-elevated text-theme-tertiary'
                        }`}
                      >
                        {tabStat.loaded}/{tabStat.total}
                      </span>

                      {/* Indicador de progresso */}
                      {tabStat.hasMore ? (
                        <Inline gap={1}>
                          <div className="w-1 h-1 rounded-full animate-pulse"></div>
                          {isActive && (
                            <span className="text-xs font-medium">
                              +{tabStat.remaining}
                            </span>
                          )}
                        </Inline>
                      ) : (
                        <div className="w-1 h-1 rounded-full"></div>
                      )}
                    </Inline>
                  </button>
                </AnimatedItem>
              );
            })}
          </nav>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Scores List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {loadingWorkScores && activeTabData.length === 0 ? (
              <LoadingState />
            ) : workScoresError ? (
              <ErrorState
                error={workScoresError}
                onRefetch={refetchWorkScores}
              />
            ) : activeTabData.length === 0 ? (
              <EmptyState />
            ) : (
              <Stack gap={6}>
                <AnimatedContainer delay={0.1} staggerSpeed="fast">
                  {activeTabData.map((scoreGroup, groupIndex) => (
                    <Stack key={`${scoreGroup.source}-${groupIndex}`}>
                      <SequentialGrid cols={1} gap={3} delayBetweenItems={0.05}>
                        {scoreGroup.scores.map((score) => (
                          <ScoreCard
                            key={score.id}
                            score={score as any}
                            workId={workId}
                            isSelected={selectedScore?.id === score.id}
                            onSelect={() => handleScoreSelect(score)}
                            showFavoriteStats={false}
                            showMostFavoritedBadge={false}
                            isSelectionMode={true}
                          />
                        ))}
                      </SequentialGrid>
                    </Stack>
                  ))}
                </AnimatedContainer>

                {/* Load More Buttons */}
                {activeTabStat.hasMore && (
                  <Stack
                    gap={4}
                    className="items-center py-8 border-t border-theme-secondary"
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-theme-primary mb-2">
                        {t('more_scores_available')}
                      </h3>
                      <Text papel="rotulo" tom="suave" as="p" className="mb-4">
                        {loadingWorkScores
                          ? t('loading_more_scores')
                          : `${t('showing_scores')} ${activeTabStat.loaded} ${t(
                              'of_scores'
                            )} ${activeTabStat.total} ${t('scores_label')}`}
                      </Text>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center">
                      <Inline
                        as="button"
                        gap={2}
                        onClick={() => handleLoadMoreForTab(activeTab)}
                        disabled={loadingWorkScores}
                        className="btn-classical-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingWorkScores ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>{t('loading')}</span>
                          </>
                        ) : (
                          <>
                            <PiDotsThree className="w-4 h-4" />
                            <span>
                              {t('load_more')} (
                              {Math.min(20, activeTabStat.remaining)})
                            </span>
                          </>
                        )}
                      </Inline>
                    </div>
                  </Stack>
                )}

                {/* Preview Panel Mobile - Abaixo dos cards */}
                {selectedScore && (
                  <div
                    id="score-preview-mobile"
                    className="lg:hidden animate-fade-in-up scroll-mt-4 border-t border-theme-secondary pt-6"
                  >
                    <Card className="bg-theme-elevated">
                      <div className="flex items-center justify-between mb-4">
                        <Inline
                          as="h3"
                          gap={2}
                          className="text-lg font-semibold text-theme-primary"
                        >
                          <PiBookOpen className="w-5 h-5" />
                          <span>{t('score_preview')}</span>
                        </Inline>
                        <button
                          onClick={() => setSelectedScore(null)}
                          className="w-8 h-8 bg-theme-primary rounded-lg flex items-center justify-center transition-all duration-300"
                        >
                          <PiX className="w-4 h-4 text-theme-primary" />
                          <NomeAcao acao="fechar" />
                        </button>
                      </div>
                      <ScorePreview score={selectedScore as any} />
                    </Card>
                  </div>
                )}
              </Stack>
            )}
          </div>
        </div>

        {/* Preview Panel Desktop - Lateral (apenas em lg+) */}
        {selectedScore && (
          <div className="hidden lg:block w-96 max-w-full border-l border-theme-secondary bg-theme-elevated overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Inline
                  as="h3"
                  gap={2}
                  className="text-lg font-semibold text-theme-primary"
                >
                  <PiBookOpen className="w-5 h-5" />
                  <span>{t('score_preview')}</span>
                </Inline>
                <button
                  onClick={() => setSelectedScore(null)}
                  className="w-8 h-8 bg-theme-primary rounded-lg flex items-center justify-center transition-all duration-300"
                >
                  <PiX className="w-4 h-4 text-theme-primary" />
                  <NomeAcao acao="fechar" />
                </button>
              </div>
              <ScorePreview score={selectedScore as any} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-theme-secondary p-4 bg-theme-elevated">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 items-center justify-between">
          <Text papel="rotulo" tom="suave" as="div">
            {currentSelectedScore ? (
              <span>
                {isEditing ? t('current_score') : t('linked_score')}:{' '}
                <strong>{currentSelectedScore.title}</strong>
              </span>
            ) : (
              <span>{t('no_score_linked')}</span>
            )}
          </Text>

          <Inline gap={3}>
            <Button onClick={onClose} className="btn-classical-secondary">
              {isEditing ? t('keep_current') : t('cancel_button')}
            </Button>

            <Button
              onClick={handleConfirmSelection}
              disabled={isConverting}
              className="btn-classical-secondary !text-erro"
            >
              {isConverting
                ? t('processing')
                : selectedScore
                  ? isEditing
                    ? t('update_and_back')
                    : t('confirm_selection')
                  : isEditing
                    ? t('remove_score')
                    : t('continue_without_score')}
            </Button>
          </Inline>
        </div>
      </div>
    </Modal>
  );
};

// COMPONENTES AUXILIARES
function LoadingState() {
  const { t } = useTranslation({ sections: ['pages/learning'] });

  return (
    <div className="flex items-center justify-center py-12">
      <Inline gap={3}>
        <div className="w-8 h-8 border-4 rounded-full animate-spin"></div>
        <span className="text-theme-primary font-medium">
          {t('loading_scores')}
        </span>
      </Inline>
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
  const { t } = useTranslation({ sections: ['pages/learning'] });

  return (
    <div className="rounded-2xl p-6 bg-sup-2">
      <div className="text-center">
        <PiWarningCircle className="w-12 h-12 mx-auto mb-4" />
        <p className="font-medium mb-4">{error}</p>
        {onRefetch && (
          <Inline
            as="button"
            gap={2}
            onClick={onRefetch}
            className="btn-classical-secondary"
          >
            <PiArrowsClockwise className="w-4 h-4" />
            <span>{t('try_again')}</span>
          </Inline>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  const { t } = useTranslation({ sections: ['pages/learning'] });

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <PiBookOpen className="w-8 h-8 text-theme-tertiary" />
      </div>
      <h3 className="text-lg font-semibold text-theme-primary mb-2">
        {t('no_scores_found')}
      </h3>
      <p className="text-theme-secondary">{t('no_scores_category')}</p>
    </div>
  );
}

export default ScoreSelectionModal;
