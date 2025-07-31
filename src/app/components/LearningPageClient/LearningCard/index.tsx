// app/learning/components/LearningCard.tsx - Com Sistema de Animação e Download
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  FiStar,
  FiEdit3,
  FiCalendar,
  FiClock,
  FiTrendingUp,
  FiHeart,
  FiAward,
  FiUsers,
  FiPlay,
  FiX,
  FiTrash2,
  FiAlertTriangle,
  FiBookOpen,
  FiDownload,
  FiFileText,
  FiMusic,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import {
  WantToLearnItem,
  LearnedItem,
  useLearningStore,
} from '@/app/stores/useLearningStore';
import { useAuth } from '@/app/hooks/useAuth';

// Importar componentes de animação
import { AnimatedCard, AnimatedItem } from '../../animation/AnimatedComponents';

type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

interface LearningCardProps {
  item: WantToLearnItem | LearnedItem;
  type: 'want-to-learn' | 'learned';
  viewMode: 'cards' | 'list';
  onEdit: () => void;
}

// Componente do Modal de Confirmação
const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  workTitle,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  workTitle: string;
  type: 'want-to-learn' | 'learned';
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const typeText =
    type === 'want-to-learn' ? 'lista de estudos' : 'lista de obras aprendidas';

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={!isLoading ? onClose : undefined}
      />

      <AnimatedCard
        hover="none"
        className="relative bg-theme-primary rounded-xl shadow-xl max-w-md w-full p-6 border border-theme-secondary"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-accent-red/10 rounded-xl flex items-center justify-center">
            <FiAlertTriangle className="w-6 h-6 text-accent-red" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-theme-primary">
              Confirmar Remoção
            </h3>
            <p className="text-sm text-theme-secondary">
              Esta ação não pode ser desfeita
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-theme-secondary">
            Tem certeza que deseja remover{' '}
            <strong>&quot;{workTitle}&quot;</strong> da sua {typeText}?
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-theme-secondary text-theme-secondary hover:bg-theme-secondary transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-accent-red text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Removendo...</span>
              </>
            ) : (
              <>
                <FiTrash2 className="w-4 h-4" />
                <span>Remover</span>
              </>
            )}
          </button>
        </div>
      </AnimatedCard>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const getDifficultyLabel = (difficulty?: DifficultyLevel) => {
  const labels = {
    BEGINNER: 'Iniciante',
    INTERMEDIATE: 'Intermediário',
    ADVANCED: 'Avançado',
  };
  return difficulty ? labels[difficulty] : 'Não definido';
};

const getDifficultyColor = (difficulty?: DifficultyLevel) => {
  const colors = {
    BEGINNER: 'text-accent-green border-accent-green/30 bg-accent-green/10',
    INTERMEDIATE: 'text-accent-blue border-accent-blue/30 bg-accent-blue/10',
    ADVANCED: 'text-accent-red border-accent-red/30 bg-accent-red/10',
  };
  return difficulty
    ? colors[difficulty]
    : 'text-theme-tertiary border-theme-secondary bg-theme-secondary';
};

const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// ✅ NOVA FUNÇÃO PARA DOWNLOAD DA PARTITURA
const handleScoreDownload = (item: WantToLearnItem | LearnedItem) => {
  if (!item.selectedWorkScore?.downloadUrl) {
    toast.error('Link de download não disponível');
    return;
  }

  // Abrir download em nova aba
  window.open(item.selectedWorkScore.downloadUrl, '_blank');

  toast.success(`Download iniciado: ${item.selectedWorkScore.title}`, {
    icon: '📄',
    duration: 3000,
  });
};

export const LearningCard = ({
  item,
  type,
  viewMode,
  onEdit,
}: LearningCardProps) => {
  const { user } = useAuth();
  const { removeWantToLearn, removeLearned } = useLearningStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isWantToLearn = type === 'want-to-learn';
  const wantToLearnItem = item as WantToLearnItem;
  const learnedItem = item as LearnedItem;

  // ✅ VERIFICAR SE TEM PARTITURA VINCULADA
  const hasSelectedScore = !!item.selectedWorkScore;

  const handleRemove = async () => {
    if (!user?.id) return;

    setIsDeleting(true);
    try {
      if (type === 'want-to-learn') {
        await removeWantToLearn(item.workId);
        toast.success('Obra removida da sua lista de estudos!', {
          icon: '🗑️',
          duration: 3000,
        });
      } else {
        await removeLearned(item.workId);
        toast.success('Obra removida da lista de aprendidas!', {
          icon: '🗑️',
          duration: 3000,
        });
      }
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Erro ao remover:', error);
      toast.error('Erro ao remover. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <>
        <div
          className={`classical-card p-6 group hover:shadow-theme-glow transition-all`}
        >
          <div className="flex items-center space-x-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-theme-primary">
                      {item.work?.title}
                    </h3>
                    {/* ✅ INDICADOR VISUAL DE PARTITURA VINCULADA */}
                    {hasSelectedScore && (
                      <div
                        className="w-5 h-5 bg-accent-purple/20 border border-accent-purple/40 rounded-full flex items-center justify-center"
                        title="Tem partitura vinculada"
                      >
                        <FiFileText className="w-3 h-3 text-accent-purple" />
                      </div>
                    )}
                  </div>
                  <p className="text-theme-secondary">
                    {item.work?.composer.fullName}
                  </p>
                  {item.work?.opOrCatalog && (
                    <p className="text-sm text-theme-tertiary">
                      {item.work.opOrCatalog}
                    </p>
                  )}
                </div>

                {/* Compact info */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 items-center space-x-3 text-sm text-theme-tertiary">
                  {/* Stars */}
                  <div
                    className="flex items-center space-x-1"
                    title={
                      isWantToLearn
                        ? `Prioridade: ${wantToLearnItem.priority}/5`
                        : `Maestria: ${learnedItem.mastery}/5`
                    }
                  >
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 transition-colors ${
                          i <
                          (isWantToLearn
                            ? wantToLearnItem.priority
                            : learnedItem.mastery)
                            ? `fill-current ${
                                isWantToLearn
                                  ? 'text-yellow-400'
                                  : 'text-accent-green'
                              }`
                            : 'text-theme-tertiary/30'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Difficulty */}
                  {item.difficulty && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full border transition-colors ${getDifficultyColor(
                        item.difficulty
                      )}`}
                    >
                      {getDifficultyLabel(item.difficulty)}
                    </span>
                  )}

                  {/* Quick info */}
                  <div className="flex items-center space-x-2">
                    {isWantToLearn ? (
                      <>
                        {wantToLearnItem.targetDate && (
                          <FiCalendar
                            className="w-4 h-4"
                            title={`Meta: ${formatDate(
                              wantToLearnItem.targetDate
                            )}`}
                          />
                        )}
                        {wantToLearnItem.context && (
                          <span className="text-xs bg-accent-blue/10 px-2 py-1 rounded text-accent-blue">
                            {wantToLearnItem.context}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {learnedItem.wouldRecommend && (
                          <FiUsers
                            className="w-4 h-4 text-accent-green"
                            title="Recomenda"
                          />
                        )}
                        {learnedItem.publicPerformance && (
                          <FiPlay
                            className="w-4 h-4 text-accent-blue"
                            title="Tocou em público"
                          />
                        )}
                        {learnedItem.enjoyment && (
                          <div
                            className="flex items-center space-x-1"
                            title={`Satisfação: ${learnedItem.enjoyment}/5`}
                          >
                            <FiHeart className="w-4 h-4" />
                            <span>{learnedItem.enjoyment}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center flex-col sm:flex-row gap-4 sm:gap-0 space-x-2">
                  {/* ✅ BOTÃO DE DOWNLOAD DA PARTITURA */}
                  {hasSelectedScore && (
                    <AnimatedItem hover="scale">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScoreDownload(item);
                        }}
                        className="w-8 h-8 bg-theme-secondary hover:bg-interactive-hover rounded-lg flex items-center justify-center text-theme-tertiary hover:text-brand-primary transition-all"
                        title={`Download: ${item.selectedWorkScore?.title}`}
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                    </AnimatedItem>
                  )}

                  <AnimatedItem hover="scale">
                    <button
                      onClick={onEdit}
                      className="w-8 h-8 bg-theme-secondary hover:bg-interactive-hover rounded-lg flex items-center justify-center text-theme-tertiary hover:text-brand-primary transition-all"
                      title="Editar"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </button>
                  </AnimatedItem>
                  <AnimatedItem hover="scale">
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-8 h-8 bg-theme-secondary hover:bg-accent-red/10 rounded-lg flex items-center justify-center text-theme-tertiary hover:text-accent-red transition-all"
                      title="Remover"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </AnimatedItem>
                  {((isWantToLearn && wantToLearnItem.notes) ||
                    (!isWantToLearn && learnedItem.notes)) && (
                    <div
                      className="w-6 h-6 flex items-center justify-center"
                      title="Tem anotações"
                    >
                      <FiBookOpen className="w-3 h-3 text-accent-purple" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleRemove}
          isLoading={isDeleting}
          workTitle={item.work?.title || ''}
          type={type}
        />
      </>
    );
  }

  return (
    <>
      <div
        className={`classical-card p-6 group hover:shadow-theme-glow transition-all`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-bold text-theme-primary group-hover:text-brand-primary transition-colors classical-title">
                {item.work?.title}
              </h3>
              {/* ✅ INDICADOR VISUAL DE PARTITURA VINCULADA */}
              {hasSelectedScore && (
                <div
                  className="w-6 h-6 b rounded-lg flex items-center justify-center"
                  title="Tem partitura vinculada"
                >
                  <FiMusic className="w-3 h-3 text-accent-purple" />
                </div>
              )}
            </div>
            <p className="text-theme-secondary classical-subtitle">
              {item.work?.composer.fullName}
            </p>
            {item.work?.opOrCatalog && (
              <p className="text-sm text-theme-tertiary mt-1">
                {item.work.opOrCatalog}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* ✅ BOTÃO DE DOWNLOAD DA PARTITURA */}
            {hasSelectedScore && (
              <AnimatedItem hover="scale">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleScoreDownload(item);
                  }}
                  className="w-8 h-8 bg-theme-secondary hover:bg-interactive-hover rounded-lg flex items-center justify-center text-theme-tertiary hover:text-brand-primary transition-all"
                  title={`Download: ${item.selectedWorkScore?.title}`}
                >
                  <FiDownload className="w-4 h-4" />
                </button>
              </AnimatedItem>
            )}

            <AnimatedItem hover="scale">
              <button
                onClick={onEdit}
                className="w-8 h-8 bg-theme-secondary hover:bg-interactive-hover rounded-lg flex items-center justify-center text-theme-tertiary hover:text-brand-primary transition-all"
                title="Editar"
              >
                <FiEdit3 className="w-4 h-4" />
              </button>
            </AnimatedItem>
            <AnimatedItem hover="scale">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-8 h-8 bg-theme-secondary hover:bg-accent-red/10 rounded-lg flex items-center justify-center text-theme-tertiary hover:text-accent-red transition-all"
                title="Remover"
              >
                <FiX className="w-4 h-4" />
              </button>
            </AnimatedItem>
          </div>
        </div>

        {/* ✅ SEÇÃO DE PARTITURA VINCULADA (se houver) */}
        {hasSelectedScore && item.selectedWorkScore && (
          <div className="mb-4 p-3 classical-card-simple rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-purple/20 rounded-lg flex items-center justify-center">
                <FiFileText className="w-4 h-4 text-accent-purple" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-theme-primary">
                  {item.selectedWorkScore.title}
                </h4>
                <p className="text-xs text-theme-tertiary">
                  {item.selectedWorkScore.source} •{' '}
                  {item.selectedWorkScore.fileSize}
                  {item.selectedWorkScore.pageCount &&
                    ` • ${item.selectedWorkScore.pageCount} páginas`}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleScoreDownload(item);
                }}
                className="btn-classical-secondary-sm flex items-center space-x-1 text-xs"
              >
                <FiDownload className="w-3 h-3" />
                <span>Download</span>
              </button>
            </div>
          </div>
        )}

        {/* Stars */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-sm font-medium text-theme-tertiary">
            {isWantToLearn ? 'Prioridade:' : 'Maestria:'}
          </span>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={`w-4 h-4 transition-colors ${
                  i <
                  (isWantToLearn
                    ? wantToLearnItem.priority
                    : learnedItem.mastery)
                    ? `fill-current text-yellow-400`
                    : 'text-theme-tertiary/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          {item.difficulty && (
            <div className="flex items-center space-x-2">
              <FiTrendingUp className="w-4 h-4 text-theme-tertiary" />
              <span
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${getDifficultyColor(
                  item.difficulty
                )}`}
              >
                {getDifficultyLabel(item.difficulty)}
              </span>
            </div>
          )}

          {isWantToLearn ? (
            <>
              {wantToLearnItem.targetDate && (
                <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
                  <FiCalendar className="w-4 h-4" />
                  <span>Meta: {formatDate(wantToLearnItem.targetDate)}</span>
                </div>
              )}

              {wantToLearnItem.estimatedStudyTime && (
                <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
                  <FiClock className="w-4 h-4" />
                  <span>{wantToLearnItem.estimatedStudyTime}h estimadas</span>
                </div>
              )}

              {wantToLearnItem.context && (
                <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
                  <FiUsers className="w-4 h-4" />
                  <span>Contexto: {wantToLearnItem.context}</span>
                </div>
              )}

              {wantToLearnItem.motivation && (
                <div className="bg-theme-secondary rounded-lg p-3 border-l-4 border-accent-blue">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiHeart className="w-4 h-4 text-accent-blue" />
                    <span className="text-sm font-medium text-theme-secondary">
                      Motivação
                    </span>
                  </div>
                  <p className="text-sm text-theme-tertiary">
                    {wantToLearnItem.motivation}
                  </p>
                </div>
              )}

              {wantToLearnItem.notes && (
                <div className="bg-theme-secondary rounded-lg p-3 border-l-4 border-accent-purple">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiBookOpen className="w-4 h-4 text-accent-purple" />
                    <span className="text-sm font-medium text-theme-secondary">
                      Anotações
                    </span>
                  </div>
                  <p className="text-sm text-theme-tertiary whitespace-pre-wrap">
                    {wantToLearnItem.notes}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {learnedItem.studyStartDate && (
                <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
                  <FiCalendar className="w-4 h-4" />
                  <span>
                    Início do estudo: {formatDate(learnedItem.studyStartDate)}
                  </span>
                </div>
              )}

              {learnedItem.studyDuration && (
                <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
                  <FiClock className="w-4 h-4" />
                  <span>{learnedItem.studyDuration} dias de estudo</span>
                </div>
              )}

              {learnedItem.enjoyment && (
                <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
                  <FiHeart className="w-4 h-4" />
                  <span>Satisfação: {learnedItem.enjoyment}/5</span>
                </div>
              )}

              <div className="flex items-center space-x-4 text-sm">
                {learnedItem.wouldRecommend && (
                  <span className="flex items-center space-x-1 text-accent-green">
                    <FiUsers className="w-4 h-4" />
                    <span>Recomenda</span>
                  </span>
                )}
                {learnedItem.publicPerformance && (
                  <span className="flex items-center space-x-1 text-accent-blue">
                    <FiPlay className="w-4 h-4" />
                    <span>Tocou em público</span>
                  </span>
                )}
              </div>

              {learnedItem.technicalChallenges && (
                <div className="bg-theme-secondary rounded-lg p-3 border-l-4 border-accent-red">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiTrendingUp className="w-4 h-4 text-accent-red" />
                    <span className="text-sm font-medium text-theme-secondary">
                      Desafios Técnicos
                    </span>
                  </div>
                  <p className="text-sm text-theme-tertiary whitespace-pre-wrap">
                    {learnedItem.technicalChallenges}
                  </p>
                </div>
              )}

              {learnedItem.musicalInsights && (
                <div className="bg-theme-secondary rounded-lg p-3 border-l-4 border-accent-green">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiAward className="w-4 h-4 text-accent-green" />
                    <span className="text-sm font-medium text-theme-secondary">
                      Insights Musicais
                    </span>
                  </div>
                  <p className="text-sm text-theme-tertiary whitespace-pre-wrap">
                    {learnedItem.musicalInsights}
                  </p>
                </div>
              )}

              {learnedItem.notes && (
                <div className="bg-theme-secondary rounded-lg p-3 border-l-4 border-accent-purple">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiBookOpen className="w-4 h-4 text-accent-purple" />
                    <span className="text-sm font-medium text-theme-secondary">
                      Anotações
                    </span>
                  </div>
                  <p className="text-sm text-theme-tertiary whitespace-pre-wrap">
                    {learnedItem.notes}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-theme-secondary flex items-center justify-between">
          <span className="text-xs text-theme-tertiary">
            {isWantToLearn
              ? `Adicionada em ${formatDate(wantToLearnItem.addedAt)}`
              : `Aprendida em ${formatDate(learnedItem.learnedAt)}`}
          </span>
          <div className="flex items-center space-x-3">
            <AnimatedItem hover="scale">
              <Link
                href={`/works/${item.workId}`}
                className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors"
              >
                Ver Obra →
              </Link>
            </AnimatedItem>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleRemove}
        isLoading={isDeleting}
        workTitle={item.work?.title || ''}
        type={type}
      />
    </>
  );
};
