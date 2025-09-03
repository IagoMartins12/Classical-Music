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
import { useTranslation } from '@/app/context/TranslationContext';
import { useLanguageStore } from '@/app/stores/useLanguageStore';

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
  const { t } = useTranslation({ sections: ['pages/learning'] });

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
    type === 'want-to-learn'
      ? t('confirm_removal_study_list')
      : t('confirm_removal_learned_list');

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
              {t('confirm_removal_title')}
            </h3>
            <p className="text-sm text-theme-secondary">
              {t('confirm_removal_subtitle')}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-theme-secondary">
            {t('confirm_removal_question')}{' '}
            <strong>&quot;{workTitle}&quot;</strong> {t('confirm_removal_from')}{' '}
            {typeText}?
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-theme-secondary text-theme-secondary hover:bg-theme-secondary transition-colors disabled:opacity-50"
          >
            {t('cancel_button')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-accent-red text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{t('removing_button')}</span>
              </>
            ) : (
              <>
                <FiTrash2 className="w-4 h-4" />
                <span>{t('remove_button')}</span>
              </>
            )}
          </button>
        </div>
      </AnimatedCard>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const getDifficultyLabel = (difficulty: DifficultyLevel, t: any) => {
  const labels = {
    BEGINNER: t('difficulty_beginner'),
    INTERMEDIATE: t('difficulty_intermediate'),
    ADVANCED: t('difficulty_advanced'),
  };
  return difficulty ? labels[difficulty] : t('difficulty_not_defined');
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
const handleScoreDownload = (item: WantToLearnItem | LearnedItem, t: any) => {
  if (!item.selectedWorkScore?.downloadUrl) {
    toast.error(t('download_not_available'));
    return;
  }

  // Abrir download em nova aba
  window.open(item.selectedWorkScore.downloadUrl, '_blank');
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
  const { t } = useTranslation({ sections: ['pages/learning'] });

  const { language } = useLanguageStore();
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
        const message =
          language === 'pt'
            ? 'Obra removida da sua lista de estudos!'
            : 'Work removed from your study list!';
        await removeWantToLearn(item.workId);
        toast.success(message, {
          icon: '🗑️',
          duration: 3000,
        });
      } else {
        const message =
          language === 'pt'
            ? 'Obra removida da sua lista de aprendidas!'
            : 'Work removed from your learned list!';
        await removeLearned(item.workId);
        toast.success(message, {
          icon: '🗑️',
          duration: 3000,
        });
      }
      setShowDeleteModal(false);
    } catch {
      const message =
        language === 'pt'
          ? 'Erro ao remover. Tente novamente.'
          : 'Error removing. Please try again.';
      toast.error(message);
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
                        title={t('has_linked_score')}
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
                        ? `${t('priority_label_card')} ${
                            wantToLearnItem.priority
                          }/5`
                        : `${t('mastery_label_card')} ${learnedItem.mastery}/5`
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
                      {getDifficultyLabel(item.difficulty, t)}
                    </span>
                  )}

                  {/* Quick info */}
                  <div className="flex items-center space-x-2">
                    {isWantToLearn ? (
                      <>
                        {wantToLearnItem.targetDate && (
                          <FiCalendar
                            className="w-4 h-4"
                            title={`${t('target_date')} ${formatDate(
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
                            title={t('recommends')}
                          />
                        )}
                        {learnedItem.publicPerformance && (
                          <FiPlay
                            className="w-4 h-4 text-accent-blue"
                            title={t('public_performance')}
                          />
                        )}
                        {learnedItem.enjoyment && (
                          <div
                            className="flex items-center space-x-1"
                            title={`${t('satisfaction_label')} ${
                              learnedItem.enjoyment
                            }/5`}
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
                  {hasSelectedScore && item.selectedWorkScore?.downloadUrl && (
                    <AnimatedItem hover="scale">
                      <a
                        href={item.selectedWorkScore?.downloadUrl}
                        target="_blank"
                        className="w-8 h-8 cursor-pointer bg-theme-secondary hover:bg-interactive-hover rounded-lg flex items-center justify-center text-theme-tertiary hover:text-brand-primary transition-all"
                        title={`${t('download_score')} ${
                          item.selectedWorkScore?.title
                        }`}
                      >
                        <FiDownload className="w-4 h-4" />
                      </a>
                    </AnimatedItem>
                  )}

                  <button
                    onClick={onEdit}
                    className="w-8 h-8 bg-theme-secondary hover:bg-interactive-hover rounded-lg flex items-center justify-center text-theme-tertiary hover:text-brand-primary transition-all"
                    title={t('edit_button')}
                  >
                    <FiEdit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-8 h-8 bg-theme-secondary hover:bg-accent-red/10 rounded-lg flex items-center justify-center text-theme-tertiary hover:text-accent-red transition-all"
                    title={t('remove_button')}
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                  {((isWantToLearn && wantToLearnItem.notes) ||
                    (!isWantToLearn && learnedItem.notes)) && (
                    <div
                      className="w-6 h-6 flex items-center justify-center"
                      title={t('has_notes')}
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
                  title={t('has_linked_score')}
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
                    handleScoreDownload(item, t);
                  }}
                  className="w-8 h-8 bg-theme-secondary hover:bg-interactive-hover rounded-lg flex items-center justify-center text-theme-tertiary hover:text-brand-primary transition-all"
                  title={`${t('download_score')} ${
                    item.selectedWorkScore?.title
                  }`}
                >
                  <FiDownload className="w-4 h-4" />
                </button>
              </AnimatedItem>
            )}

            <button
              onClick={onEdit}
              className="w-8 h-8 bg-theme-secondary hover:bg-interactive-hover rounded-lg flex items-center justify-center text-theme-tertiary hover:text-brand-primary transition-all"
              title={t('edit_button')}
            >
              <FiEdit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-8 h-8 bg-theme-secondary hover:bg-accent-red/10 rounded-lg flex items-center justify-center text-theme-tertiary hover:text-accent-red transition-all"
              title={t('remove_button')}
            >
              <FiX className="w-4 h-4" />
            </button>
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
                    ` • ${item.selectedWorkScore.pageCount} ${t(
                      'pages_label'
                    )}`}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleScoreDownload(item, t);
                }}
                className="btn-classical-secondary-sm flex items-center space-x-1 text-xs"
              >
                <FiDownload className="w-3 h-3" />
                <span>{t('download_button')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Stars */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-sm font-medium text-theme-tertiary">
            {isWantToLearn ? t('priority_label_card') : t('mastery_label_card')}
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
                {getDifficultyLabel(item.difficulty, t)}
              </span>
            </div>
          )}

          {isWantToLearn ? (
            <>
              {wantToLearnItem.targetDate && (
                <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
                  <FiCalendar className="w-4 h-4" />
                  <span>
                    {t('target_date')} {formatDate(wantToLearnItem.targetDate)}
                  </span>
                </div>
              )}

              {wantToLearnItem.estimatedStudyTime && (
                <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
                  <FiClock className="w-4 h-4" />
                  <span>
                    {wantToLearnItem.estimatedStudyTime}
                    {t('estimated_hours')}
                  </span>
                </div>
              )}

              {wantToLearnItem.context && (
                <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
                  <FiUsers className="w-4 h-4" />
                  <span>
                    {t('context_label')} {wantToLearnItem.context}
                  </span>
                </div>
              )}

              {wantToLearnItem.motivation && (
                <div className="bg-theme-secondary rounded-lg p-3 border-l-4 border-accent-blue">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiHeart className="w-4 h-4 text-accent-blue" />
                    <span className="text-sm font-medium text-theme-secondary">
                      {t('motivation_section')}
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
                      {t('notes_section')}
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
                    {t('study_start')} {formatDate(learnedItem.studyStartDate)}
                  </span>
                </div>
              )}

              {learnedItem.studyDuration && (
                <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
                  <FiClock className="w-4 h-4" />
                  <span>
                    {learnedItem.studyDuration} {t('study_days')}
                  </span>
                </div>
              )}

              {learnedItem.enjoyment && (
                <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
                  <FiHeart className="w-4 h-4" />
                  <span>
                    {t('satisfaction_label')} {learnedItem.enjoyment}/5
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-4 text-sm">
                {learnedItem.wouldRecommend && (
                  <span className="flex items-center space-x-1 text-accent-green">
                    <FiUsers className="w-4 h-4" />
                    <span>{t('recommends')}</span>
                  </span>
                )}
                {learnedItem.publicPerformance && (
                  <span className="flex items-center space-x-1 text-accent-blue">
                    <FiPlay className="w-4 h-4" />
                    <span>{t('public_performance')}</span>
                  </span>
                )}
              </div>

              {learnedItem.technicalChallenges && (
                <div className="bg-theme-secondary rounded-lg p-3 border-l-4 border-accent-red">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiTrendingUp className="w-4 h-4 text-accent-red" />
                    <span className="text-sm font-medium text-theme-secondary">
                      {t('technical_challenges')}
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
                      {t('musical_insights')}
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
                      {t('notes_section')}
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
              ? `${t('added_at')} ${formatDate(wantToLearnItem.addedAt)}`
              : `${t('learned_at')} ${formatDate(learnedItem.learnedAt)}`}
          </span>
          <div className="flex items-center space-x-3">
            <AnimatedItem hover="scale">
              <Link
                href={`/works/${item.workId}`}
                className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors"
              >
                {t('view_work')} →
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
