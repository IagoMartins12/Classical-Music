// app/learning/components/LearningCard.tsx
'use client';

import { useState } from 'react';
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
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import {
  WantToLearnItem,
  LearnedItem,
  useLearningStore,
} from '@/app/stores/useLearningStore';
import { useAuth } from '@/app/hooks/useAuth';

type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

interface LearningCardProps {
  item: WantToLearnItem | LearnedItem;
  type: 'want-to-learn' | 'learned';
  viewMode: 'grid' | 'list';
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
  if (!isOpen) return null;

  const typeText =
    type === 'want-to-learn' ? 'lista de estudos' : 'lista de obras aprendidas';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-primary rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in-scale">
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
            Tem certeza que deseja remover <strong>"{workTitle}"</strong> da sua{' '}
            {typeText}?
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
      </div>
    </div>
  );
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

  // Handle removal
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
        <div className="classical-card p-6 group hover:shadow-theme-glow transition-all hover:scale-105 animate-fade-in-up flex items-center space-x-6">
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <h3 className="font-bold text-theme-primary">
                  {item.work?.title}
                </h3>
                <p className="text-theme-secondary">
                  {item.work?.composer.fullName}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-4 h-4 ${
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
              {item.difficulty && (
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(
                    item.difficulty
                  )}`}
                >
                  {getDifficultyLabel(item.difficulty)}
                </span>
              )}
              {!isWantToLearn && (
                <div className="flex items-center space-x-2 text-sm">
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
                </div>
              )}
              <div className="flex items-center space-x-2">
                <button
                  onClick={onEdit}
                  className="w-8 h-8 bg-theme-secondary hover:bg-interactive-hover rounded-lg flex items-center justify-center text-theme-tertiary hover:text-brand-primary transition-all"
                  title="Editar"
                >
                  <FiEdit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-8 h-8 bg-theme-secondary hover:bg-accent-red/10 rounded-lg flex items-center justify-center text-theme-tertiary hover:text-accent-red transition-all"
                  title="Remover"
                >
                  <FiX className="w-4 h-4" />
                </button>
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
      <div className="classical-card p-6 group hover:shadow-theme-glow transition-all hover:scale-105 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-theme-primary group-hover:text-brand-primary transition-colors classical-title">
              {item.work?.title}
            </h3>
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
            <button
              onClick={onEdit}
              className="w-8 h-8 bg-theme-secondary hover:bg-interactive-hover rounded-lg flex items-center justify-center text-theme-tertiary hover:text-brand-primary transition-all"
              title="Editar"
            >
              <FiEdit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-8 h-8 bg-theme-secondary hover:bg-accent-red/10 rounded-lg flex items-center justify-center text-theme-tertiary hover:text-accent-red transition-all"
              title="Remover"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-sm font-medium text-theme-tertiary">
            {isWantToLearn ? 'Prioridade:' : 'Maestria:'}
          </span>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={`w-4 h-4 ${
                  i <
                  (isWantToLearn
                    ? wantToLearnItem.priority
                    : learnedItem.mastery)
                    ? `fill-current ${
                        isWantToLearn ? 'text-yellow-400' : 'text-accent-green'
                      }`
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
                className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(
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
            </>
          ) : (
            <>
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

              {learnedItem.musicalInsights && (
                <div className="bg-theme-secondary rounded-lg p-3 border-l-4 border-accent-green">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiAward className="w-4 h-4 text-accent-green" />
                    <span className="text-sm font-medium text-theme-secondary">
                      Insights
                    </span>
                  </div>
                  <p className="text-sm text-theme-tertiary">
                    {learnedItem.musicalInsights}
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
          <Link
            href={`/works/${item.workId}`}
            className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors"
          >
            Ver Obra →
          </Link>
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
