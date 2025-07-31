// components/ScoreSelectionModal/ScoreSelectionModal.tsx - MELHORADO COM LOAD MORE INCREMENTAL
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  FiMusic,
  FiArrowLeft,
  FiCheckCircle,
  FiX,
  FiBookOpen,
  FiUpload,
  FiMoreHorizontal,
  FiRefreshCw,
  FiAlertCircle,
  FiFileText,
  FiTarget,
  FiDownload,
  FiLayers,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
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

// ✅ Interface para WorkScore (dados unificados)
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
}

interface MixedScoreGroup {
  groupIndex: number;
  scores: MixedScoreData[];
  groupTitle?: string;
  source: 'WORKSCORE';
}

// ✅ TABS SEM "TODAS" (seguindo padrão IMSLPTabsIncremental)
const SCORE_TABS = [
  {
    id: 'scores',
    label: 'Partituras',
    type: 'scores' as const,
    icon: FiMusic,
    gradient: 'from-brand-primary to-brand-secondary',
  },
  {
    id: 'parts',
    label: 'Partes',
    type: 'parts' as const,
    icon: FiFileText,
    gradient: 'from-accent-blue to-accent-purple',
  },
  {
    id: 'arrangements',
    label: 'Arranjos',
    type: 'arrangements' as const,
    icon: GiMusicalNotes,
    gradient: 'from-accent-green to-accent-blue',
  },
  {
    id: 'uploads',
    label: 'Open Atlas',
    type: 'uploads' as const,
    icon: FiUpload,
    gradient: 'from-accent-purple to-accent-red',
  },
  {
    id: 'others',
    label: 'Outros',
    type: 'others' as const,
    icon: FiFileText,
    gradient: 'from-accent-red to-accent-purple',
  },
];

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
  // ✅ NOVO: Prop para detectar se é edição
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
  isEditing = false, // ✅ NOVO: Detectar se é edição
}: ScoreSelectionModalProps) => {
  const [activeTab, setActiveTab] = useState('scores');
  const [selectedScore, setSelectedScore] = useState<MixedScoreData | null>(
    null
  );
  const [isConverting, setIsConverting] = useState(false);

  // ✅ Hook para buscar WorkScores do banco com limite por tipo
  const {
    workScores,
    loading: loadingWorkScores,
    error: workScoresError,
    hasMore: hasMoreWorkScores,
    total: totalWorkScores,
    loadMore: loadMoreWorkScores,
    refetch: refetchWorkScores,
    pagination,
  } = useWorkScores({
    workId,
    limitPerType: 20, // ✅ NOVO: 20 por tipo, não total
    enabled: isOpen,
  });

  // ✅ Processar e organizar dados POR TIPO (sem tab "all")
  const { mixedData, visibleTabs, counts, tabStats } = useMemo(() => {
    const processed = {
      scores: [] as MixedScoreGroup[],
      parts: [] as MixedScoreGroup[],
      arrangements: [] as MixedScoreGroup[],
      uploads: [] as MixedScoreGroup[],
      others: [] as MixedScoreGroup[],
    };

    const counts = {
      scores: 0,
      parts: 0,
      arrangements: 0,
      uploads: 0,
      others: 0,
    };

    const stats = {
      scores: { loaded: 0, total: 0, hasMore: false, remaining: 0 },
      parts: { loaded: 0, total: 0, hasMore: false, remaining: 0 },
      arrangements: { loaded: 0, total: 0, hasMore: false, remaining: 0 },
      uploads: { loaded: 0, total: 0, hasMore: false, remaining: 0 },
      others: { loaded: 0, total: 0, hasMore: false, remaining: 0 },
    };

    // ✅ Processar WorkScores por tipo
    if (workScores && workScores.length > 0) {
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

      Object.entries(workScoreGroups).forEach(([type, scores]) => {
        if (scores.length > 0) {
          const group: MixedScoreGroup = {
            groupIndex: 0,
            groupTitle: `${
              type === 'uploads'
                ? 'Open Atlas'
                : type.charAt(0).toUpperCase() + type.slice(1)
            } (${scores.length})`,
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
          counts[type as keyof typeof counts] += scores.length;

          // ✅ Calcular stats por tipo baseado na paginação
          const typeTotal = pagination.totalByType?.[type] || scores.length;
          stats[type as keyof typeof stats] = {
            loaded: scores.length,
            total: typeTotal,
            hasMore: scores.length < typeTotal,
            remaining: Math.max(0, typeTotal - scores.length),
          };
        }
      });
    }

    // ✅ Determinar tabs visíveis
    const visible = SCORE_TABS.filter(
      (tab) => counts[tab.type as keyof typeof counts] > 0
    );

    return {
      mixedData: processed,
      visibleTabs: visible,
      counts,
      tabStats: stats,
    };
  }, [workScores, pagination]);

  // ✅ AUTO-SELEÇÃO quando é edição
  useEffect(() => {
    if (isOpen && isEditing && currentSelectedScore && !selectedScore) {
      console.log(
        '🎯 [SCORE-SELECTION-MODAL] Auto-selecionando partitura para edição:',
        currentSelectedScore.title
      );

      // Encontrar a partitura correspondente na lista
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
    }
  }, [isOpen, isEditing, currentSelectedScore, mixedData, selectedScore]);

  // Reset seleção quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      if (!isEditing) {
        setSelectedScore(null);
      }
      // Auto-selecionar primeira tab com conteúdo
      if (visibleTabs.length > 0 && !isEditing) {
        setActiveTab(visibleTabs[0].id);
      }
    }
  }, [isOpen, visibleTabs, isEditing]);

  const handleScoreSelect = (score: MixedScoreData) => {
    if (selectedScore?.id === score.id) {
      setSelectedScore(null);
    } else {
      setSelectedScore(score);
    }
  };

  const handleConfirmSelection = async () => {
    if (!selectedScore) return;

    setIsConverting(true);
    try {
      // ✅ WorkScore já existe no banco, usar direto
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
        isEditing
          ? 'Partitura atualizada com sucesso!'
          : 'Partitura selecionada com sucesso!',
        {
          icon: isEditing ? '✏️' : '🎼',
          duration: 3000,
        }
      );
      onClose();
    } catch (error) {
      console.error('Erro ao confirmar seleção:', error);
      toast.error('Erro ao selecionar partitura. Tente novamente.');
    } finally {
      setIsConverting(false);
    }
  };

  // ✅ NOVO: Função para carregar mais de um tipo específico
  const handleLoadMoreForTab = (tabType: string) => {
    console.log(
      `📊 [SCORE-SELECTION-MODAL] Carregando mais para tab: ${tabType}`
    );
    // Como useWorkScores carrega todos os tipos, usar loadMore normal
    loadMoreWorkScores();
  };

  // ✅ NOVO: Função para carregar todas as partituras de um tipo
  const handleLoadAllForTab = (tabType: string) => {
    console.log(
      `🔄 [SCORE-SELECTION-MODAL] Carregando todas para tab: ${tabType}`
    );
    // Para carregar todas, fazer múltiplas chamadas até não ter mais
    const loadAll = async () => {
      while (hasMoreWorkScores) {
        await loadMoreWorkScores();
      }
    };
    loadAll();
  };

  const activeTabData = mixedData[activeTab as keyof typeof mixedData] || [];
  const activeTabStat = tabStats[activeTab as keyof typeof tabStats];
  const isLoading = loadingWorkScores;
  const hasError = workScoresError;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="6xl"
      showCloseButton={false}
      className="max-h-[95vh] overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-theme-secondary bg-gradient-to-r from-theme-primary to-theme-elevated">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="w-10 h-10 bg-theme-elevated border border-theme-primary hover:border-brand-primary rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-interactive-hover"
              >
                <FiArrowLeft className="w-5 h-5 text-theme-primary" />
              </button>

              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center">
                <FiMusic className="w-6 h-6 text-theme-primary" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-theme-primary classical-title">
                  {isEditing ? 'Editar Partitura' : 'Selecionar Partitura'}
                </h2>
                <div className="flex items-center space-x-2">
                  <p className="text-theme-secondary classical-subtitle">
                    {workTitle} • {composerName}
                  </p>
                  {/* Indicador de fonte */}
                  {totalWorkScores > 0 && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center space-x-1">
                      <FiUpload className="w-3 h-3" />
                      <span>Open Atlas</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {selectedScore && (
              <div className="flex items-center space-x-3">
                <div className="bg-theme-elevated/50 border border-brand-primary/30 rounded-xl px-4 py-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
                    <span className="text-theme-secondary font-medium">
                      {isEditing
                        ? 'Nova partitura selecionada'
                        : 'Partitura selecionada'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmSelection}
                  disabled={isConverting}
                  className="btn-classical-primary flex items-center space-x-2"
                >
                  {isConverting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="w-4 h-4" />
                      <span>
                        {isEditing ? 'Atualizar e Voltar' : 'Confirmar Seleção'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Tabs Navigation IDENTICAS AO IMSLPTABS */}
        {visibleTabs.length > 1 && (
          <nav className="flex scrollbar-hide px-6" aria-label="Tabs">
            {visibleTabs.map((tab, index) => {
              const isActive = activeTab === tab.id;
              const tabStat = tabStats[tab.type as keyof typeof tabStats];
              const Icon = tab.icon;

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

                    {/* ✅ Contador com progresso IDENTICO ao IMSLPTabs */}
                    <div className="flex items-center space-x-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                          isActive
                            ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30'
                            : 'bg-theme-elevated text-theme-tertiary border border-theme-secondary'
                        }`}
                      >
                        {tabStat.loaded}/{tabStat.total}
                      </span>

                      {/* Indicador de progresso */}
                      {tabStat.hasMore ? (
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-accent-blue rounded-full animate-pulse"></div>
                          {isActive && (
                            <span className="text-xs text-accent-blue font-medium">
                              +{tabStat.remaining}
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

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Scores List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {isLoading && activeTabData.length === 0 ? (
              <LoadingState />
            ) : hasError ? (
              <ErrorState error={hasError} onRefetch={refetchWorkScores} />
            ) : activeTabData.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-6">
                <AnimatedContainer delay={0.1} staggerSpeed="fast">
                  {activeTabData.map((scoreGroup, groupIndex) => (
                    <div
                      key={`${scoreGroup.source}-${groupIndex}`}
                      className="space-y-4"
                    >
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
                    </div>
                  ))}
                </AnimatedContainer>

                {/* ✅ NOVOS BOTÕES DE LOAD MORE INTELIGENTES */}
                {activeTabStat.hasMore && (
                  <div className="flex flex-col items-center space-y-4 py-8 border-t border-theme-secondary">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-theme-primary mb-2">
                        Mais partituras disponíveis
                      </h3>
                      <p className="text-theme-secondary text-sm mb-4">
                        {isLoading
                          ? 'Carregando mais partituras...'
                          : `Mostrando ${activeTabStat.loaded} de ${activeTabStat.total} partituras`}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center">
                      {/* Botão "Carregar Mais" específico */}
                      <button
                        onClick={() => handleLoadMoreForTab(activeTab)}
                        disabled={isLoading}
                        className="btn-classical-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Carregando...</span>
                          </>
                        ) : (
                          <>
                            <FiMoreHorizontal className="w-4 h-4" />
                            <span>
                              Carregar Mais (
                              {Math.min(20, activeTabStat.remaining)})
                            </span>
                          </>
                        )}
                      </button>

                      {/* Botão "Carregar Todas" se tiver mais de 20 */}
                      {activeTabStat.remaining > 20 && (
                        <button
                          onClick={() => handleLoadAllForTab(activeTab)}
                          disabled={isLoading}
                          className="btn-classical-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiDownload className="w-4 h-4" />
                          <span>
                            Carregar Todas ({activeTabStat.remaining} restantes)
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        {selectedScore && (
          <div className="w-96 border-l border-theme-secondary bg-theme-elevated overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-theme-primary">
                  Preview da Partitura
                </h3>
                <button
                  onClick={() => setSelectedScore(null)}
                  className="w-8 h-8 bg-theme-primary border border-theme-secondary hover:border-accent-red rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-accent-red/10"
                >
                  <FiX className="w-4 h-4 text-theme-primary hover:text-accent-red" />
                </button>
              </div>

              <ScorePreview score={selectedScore as any} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-theme-secondary p-4 bg-theme-elevated">
        <div className="flex items-center justify-between">
          <div className="text-sm text-theme-secondary">
            {currentSelectedScore ? (
              <span>
                {isEditing ? 'Partitura atual' : 'Partitura vinculada'}:{' '}
                <strong>{currentSelectedScore.title}</strong>
              </span>
            ) : (
              <span>Nenhuma partitura vinculada atualmente</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={onClose} className="btn-classical-secondary">
              {isEditing ? 'Manter Atual' : 'Cancelar'}
            </button>

            {selectedScore && (
              <button
                onClick={handleConfirmSelection}
                disabled={isConverting}
                className="btn-classical-primary"
              >
                {isConverting
                  ? 'Processando...'
                  : isEditing
                  ? 'Atualizar e Voltar'
                  : 'Confirmar Seleção'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// === COMPONENTES AUXILIARES ===
function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
        <span className="text-theme-primary font-medium">
          Carregando partituras...
        </span>
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
    <div className="bg-gradient-to-r from-accent-red/10 to-accent-red/5 border border-accent-red/30 rounded-2xl p-6">
      <div className="text-center">
        <FiAlertCircle className="w-12 h-12 text-accent-red mx-auto mb-4" />
        <p className="text-accent-red font-medium mb-4">{error}</p>
        {onRefetch && (
          <button
            onClick={onRefetch}
            className="btn-classical-secondary flex items-center space-x-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Tentar novamente</span>
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-theme-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <FiBookOpen className="w-8 h-8 text-theme-tertiary" />
      </div>
      <h3 className="text-lg font-semibold text-theme-primary mb-2">
        Nenhuma partitura encontrada
      </h3>
      <p className="text-theme-secondary">
        Não foram encontradas partituras desta categoria.
      </p>
    </div>
  );
}

export default ScoreSelectionModal;
