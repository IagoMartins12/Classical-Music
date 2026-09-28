// app/learning/components/LearningCard.tsx - Com Sistema de Animação e Download
'use client';
import { Button } from '@/app/components/ui/Button';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  PiBookOpen,
  PiCalendarBlank,
  PiClock,
  PiDownloadSimple,
  PiFileText,
  PiHeart,
  PiMedal,
  PiMusicNotes,
  PiPencilLine,
  PiPlay,
  PiStar,
  PiStarFill,
  PiTrendUp,
  PiUsers,
  PiX,
} from 'react-icons/pi';
import { toast } from 'react-hot-toast';
import {
  WantToLearnItem,
  LearnedItem,
  useLearningStore,
} from '@/app/stores/useLearningStore';
import { useAuth } from '@/app/hooks/useAuth';

// Importar componentes de animação
import { AnimatedItem } from '../../animation/AnimatedComponents';
import { useTranslation } from '@/app/context/TranslationContext';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import ConfirmModal from '@/app/components/ConfirmModal';

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

  if (!mounted || !isOpen) return null;

  const typeText =
    type === 'want-to-learn'
      ? t('confirm_removal_study_list')
      : t('confirm_removal_learned_list');

  const modalContent = (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      type="danger"
      title={t('confirm_removal_title')}
      cancelText={t('cancel_button')}
      confirmText={t('remove_button')}
      message={
        <>
          {t('confirm_removal_question')}{' '}
          <strong className="text-texto">&quot;{workTitle}&quot;</strong>{' '}
          {t('confirm_removal_from')} {typeText}?
        </>
      }
    />
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
    BEGINNER: '',
    INTERMEDIATE: '',
    ADVANCED: '',
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
  const { t, language } = useTranslation({ sections: ['pages/learning'] });

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
        <div className={`classical-card p-6 group transition-all`}>
          <Inline gap={6}>
            <div className="flex-1">
              <Inline gap={4}>
                <div className="flex-1">
                  <Inline gap={2}>
                    <h3 className="font-bold text-theme-primary">
                      {item.work?.title}
                    </h3>
                    {/* ✅ INDICADOR VISUAL DE PARTITURA VINCULADA */}
                    {hasSelectedScore && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        title={t('has_linked_score')}
                      >
                        <PiFileText className="w-3 h-3" />
                      </div>
                    )}
                  </Inline>
                  <p className="text-theme-secondary">
                    {item.work?.composer.fullName}
                  </p>
                  {item.work?.opOrCatalog && (
                    <Text papel="rotulo" tom="fraco" as="p">
                      {item.work.opOrCatalog}
                    </Text>
                  )}
                </div>

                {/* Compact info */}
                <Text
                  papel="rotulo"
                  tom="fraco"
                  as="div"
                  className="flex flex-col sm:flex-row gap-4 sm:gap-0 items-center space-x-3"
                >
                  {/* Stars */}
                  <Inline
                    gap={1}
                    title={
                      isWantToLearn
                        ? `${t('priority_label_card')} ${
                            wantToLearnItem.priority
                          }/5`
                        : `${t('mastery_label_card')} ${learnedItem.mastery}/5`
                    }
                  >
                    {[...Array(5)].map((_, i) => (
                      <PiStar
                        key={i}
                        className={`w-4 h-4 transition-colors ${
                          i <
                          (isWantToLearn
                            ? wantToLearnItem.priority
                            : learnedItem.mastery)
                            ? `fill-current ${
                                isWantToLearn ? 'text-yellow-400' : ''
                              }`
                            : ''
                        }`}
                      />
                    ))}
                  </Inline>

                  {/* Difficulty */}
                  {item.difficulty && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full transition-colors bg-sup-2 ${getDifficultyColor(
                        item.difficulty
                      )}`}
                    >
                      {getDifficultyLabel(item.difficulty, t)}
                    </span>
                  )}

                  {/* Quick info */}
                  <Inline gap={2}>
                    {isWantToLearn ? (
                      <>
                        {wantToLearnItem.targetDate && (
                          <PiCalendarBlank
                            className="w-4 h-4"
                            title={`${t('target_date')} ${formatDate(
                              wantToLearnItem.targetDate
                            )}`}
                          />
                        )}
                        {wantToLearnItem.context && (
                          <span className="text-xs px-2 py-1 rounded">
                            {wantToLearnItem.context}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {learnedItem.wouldRecommend && (
                          <PiUsers
                            className="w-4 h-4"
                            title={t('recommends')}
                          />
                        )}
                        {learnedItem.publicPerformance && (
                          <PiPlay
                            className="w-4 h-4"
                            title={t('public_performance')}
                          />
                        )}
                        {learnedItem.enjoyment && (
                          <Inline
                            gap={1}
                            title={`${t('satisfaction_label')} ${
                              learnedItem.enjoyment
                            }/5`}
                          >
                            <PiHeart className="w-4 h-4" />
                            <span>{learnedItem.enjoyment}</span>
                          </Inline>
                        )}
                      </>
                    )}
                  </Inline>
                </Text>

                {/* Action buttons */}
                <div className="flex items-center flex-col sm:flex-row gap-4 sm:gap-0 space-x-2">
                  {/* ✅ BOTÃO DE DOWNLOAD DA PARTITURA */}
                  {hasSelectedScore && item.selectedWorkScore?.downloadUrl && (
                    <AnimatedItem hover="scale">
                      <a
                        href={item.selectedWorkScore?.downloadUrl}
                        target="_blank"
                        className="w-8 h-8 cursor-pointer bg-theme-secondary rounded-lg flex items-center justify-center text-theme-tertiary transition-all"
                        title={`${t('download_score')} ${
                          item.selectedWorkScore?.title
                        }`}
                      >
                        <PiDownloadSimple className="w-4 h-4" />
                      </a>
                    </AnimatedItem>
                  )}

                  <Button
                    variante="fantasma"
                    tamanho="p"
                    onClick={onEdit}
                    title={t('edit_button')}
                    icone={PiPencilLine}
                    rotulo={t('edit_button')}
                  />
                  <Button
                    variante="fantasma"
                    tamanho="p"
                    onClick={() => setShowDeleteModal(true)}
                    title={t('remove_button')}
                    icone={PiX}
                    rotulo={t('remove_button')}
                  />
                  {((isWantToLearn && wantToLearnItem.notes) ||
                    (!isWantToLearn && learnedItem.notes)) && (
                    <div
                      className="w-6 h-6 flex items-center justify-center"
                      title={t('has_notes')}
                    >
                      <PiBookOpen className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </Inline>
            </div>
          </Inline>
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
      <div className={`classical-card p-6 group transition-all`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Inline gap={2} className="mb-2">
              <h3 className="font-bold text-theme-primary transition-colors classical-title">
                {item.work?.title}
              </h3>
              {/* ✅ INDICADOR VISUAL DE PARTITURA VINCULADA */}
              {hasSelectedScore && (
                <div
                  className="w-6 h-6 b rounded-lg flex items-center justify-center"
                  title={t('has_linked_score')}
                >
                  <PiMusicNotes className="w-3 h-3" />
                </div>
              )}
            </Inline>
            <p className="text-theme-secondary classical-subtitle">
              {item.work?.composer.fullName}
            </p>
            {item.work?.opOrCatalog && (
              <Text papel="rotulo" tom="fraco" as="p" className="mt-1">
                {item.work.opOrCatalog}
              </Text>
            )}
          </div>
          <Inline gap={2}>
            {/* ✅ BOTÃO DE DOWNLOAD DA PARTITURA */}
            {hasSelectedScore && (
              <AnimatedItem hover="scale">
                <Button
                  variante="fantasma"
                  tamanho="p"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleScoreDownload(item, t);
                  }}
                  title={`${t('download_score')} ${
                    item.selectedWorkScore?.title
                  }`}
                  icone={PiDownloadSimple}
                  rotulo={`${t('download_score')} ${
                    item.selectedWorkScore?.title
                  }`}
                />
              </AnimatedItem>
            )}

            <Button
              variante="fantasma"
              tamanho="p"
              onClick={onEdit}
              title={t('edit_button')}
              icone={PiPencilLine}
              rotulo={t('edit_button')}
            />
            <Button
              variante="fantasma"
              tamanho="p"
              onClick={() => setShowDeleteModal(true)}
              title={t('remove_button')}
              icone={PiX}
              rotulo={t('remove_button')}
            />
          </Inline>
        </div>

        {/* ✅ SEÇÃO DE PARTITURA VINCULADA (se houver) */}
        {hasSelectedScore && item.selectedWorkScore && (
          <div className="mb-4 p-3 classical-card-simple rounded-xl">
            <Inline gap={3}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <PiFileText className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-theme-primary">
                  {item.selectedWorkScore.title}
                </h4>
                <Text papel="legenda" tom="fraco" as="p">
                  {item.selectedWorkScore.source} •{' '}
                  {item.selectedWorkScore.fileSize}
                  {item.selectedWorkScore.pageCount &&
                    ` • ${item.selectedWorkScore.pageCount} ${t(
                      'pages_label'
                    )}`}
                </Text>
              </div>
              <Inline
                as="button"
                gap={1}
                onClick={(e) => {
                  e.stopPropagation();
                  handleScoreDownload(item, t);
                }}
                className="btn-classical-secondary-sm text-xs"
              >
                <PiDownloadSimple className="w-3 h-3" />
                <span>{t('download_button')}</span>
              </Inline>
            </Inline>
          </div>
        )}

        {/* Stars */}
        <Inline gap={2} className="mb-4">
          <Text papel="rotulo" tom="fraco" className="font-medium">
            {isWantToLearn ? t('priority_label_card') : t('mastery_label_card')}
          </Text>
          <Inline gap={1}>
            {[...Array(5)].map((_, i) =>
              i <
              (isWantToLearn
                ? wantToLearnItem.priority
                : learnedItem.mastery) ? (
                <PiStarFill
                  key={i}
                  className="w-4 h-4 transition-colors text-yellow-400"
                />
              ) : (
                <PiStar key={i} className="w-4 h-4 transition-colors" />
              )
            )}
          </Inline>
        </Inline>

        {/* Details */}
        <Stack gap={3}>
          {item.difficulty && (
            <Inline gap={2}>
              <PiTrendUp className="w-4 h-4 text-theme-tertiary" />
              <span
                className={`text-xs px-2 py-1 rounded-full transition-colors bg-sup-2 ${getDifficultyColor(
                  item.difficulty
                )}`}
              >
                {getDifficultyLabel(item.difficulty, t)}
              </span>
            </Inline>
          )}

          {isWantToLearn ? (
            <>
              {wantToLearnItem.targetDate && (
                <Inline gap={2} className="text-sm text-theme-tertiary">
                  <PiCalendarBlank className="w-4 h-4" />
                  <span>
                    {t('target_date')} {formatDate(wantToLearnItem.targetDate)}
                  </span>
                </Inline>
              )}

              {wantToLearnItem.estimatedStudyTime && (
                <Inline gap={2} className="text-sm text-theme-tertiary">
                  <PiClock className="w-4 h-4" />
                  <span>
                    {wantToLearnItem.estimatedStudyTime}
                    {t('estimated_hours')}
                  </span>
                </Inline>
              )}

              {wantToLearnItem.context && (
                <Inline gap={2} className="text-sm text-theme-tertiary">
                  <PiUsers className="w-4 h-4" />
                  <span>
                    {t('context_label')} {wantToLearnItem.context}
                  </span>
                </Inline>
              )}

              {wantToLearnItem.motivation && (
                <Stack gap={1} className="bg-theme-secondary rounded-lg p-3">
                  <Inline gap={2}>
                    <PiHeart className="w-4 h-4" />
                    <Text papel="rotulo" tom="suave" className="font-medium">
                      {t('motivation_section')}
                    </Text>
                  </Inline>
                  <Text papel="rotulo" tom="fraco" as="p">
                    {wantToLearnItem.motivation}
                  </Text>
                </Stack>
              )}

              {wantToLearnItem.notes && (
                <Stack gap={1} className="bg-theme-secondary rounded-lg p-3">
                  <Inline gap={2}>
                    <PiBookOpen className="w-4 h-4" />
                    <Text papel="rotulo" tom="suave" className="font-medium">
                      {t('notes_section')}
                    </Text>
                  </Inline>
                  <Text
                    papel="rotulo"
                    tom="fraco"
                    as="p"
                    className="whitespace-pre-wrap"
                  >
                    {wantToLearnItem.notes}
                  </Text>
                </Stack>
              )}
            </>
          ) : (
            <>
              {learnedItem.studyStartDate && (
                <Inline gap={2} className="text-sm text-theme-tertiary">
                  <PiCalendarBlank className="w-4 h-4" />
                  <span>
                    {t('study_start')} {formatDate(learnedItem.studyStartDate)}
                  </span>
                </Inline>
              )}

              {learnedItem.studyDuration && (
                <Inline gap={2} className="text-sm text-theme-tertiary">
                  <PiClock className="w-4 h-4" />
                  <span>
                    {learnedItem.studyDuration} {t('study_days')}
                  </span>
                </Inline>
              )}

              {learnedItem.enjoyment && (
                <Inline gap={2} className="text-sm text-theme-tertiary">
                  <PiHeart className="w-4 h-4" />
                  <span>
                    {t('satisfaction_label')} {learnedItem.enjoyment}/5
                  </span>
                </Inline>
              )}

              <Inline gap={4} className="text-sm">
                {learnedItem.wouldRecommend && (
                  <Inline as="span" gap={1} className="">
                    <PiUsers className="w-4 h-4" />
                    <span>{t('recommends')}</span>
                  </Inline>
                )}
                {learnedItem.publicPerformance && (
                  <Inline as="span" gap={1} className="">
                    <PiPlay className="w-4 h-4" />
                    <span>{t('public_performance')}</span>
                  </Inline>
                )}
              </Inline>

              {learnedItem.technicalChallenges && (
                <Stack gap={1} className="bg-theme-secondary rounded-lg p-3">
                  <Inline gap={2}>
                    <PiTrendUp className="w-4 h-4" />
                    <Text papel="rotulo" tom="suave" className="font-medium">
                      {t('technical_challenges')}
                    </Text>
                  </Inline>
                  <Text
                    papel="rotulo"
                    tom="fraco"
                    as="p"
                    className="whitespace-pre-wrap"
                  >
                    {learnedItem.technicalChallenges}
                  </Text>
                </Stack>
              )}

              {learnedItem.musicalInsights && (
                <Stack gap={1} className="bg-theme-secondary rounded-lg p-3">
                  <Inline gap={2}>
                    <PiMedal className="w-4 h-4" />
                    <Text papel="rotulo" tom="suave" className="font-medium">
                      {t('musical_insights')}
                    </Text>
                  </Inline>
                  <Text
                    papel="rotulo"
                    tom="fraco"
                    as="p"
                    className="whitespace-pre-wrap"
                  >
                    {learnedItem.musicalInsights}
                  </Text>
                </Stack>
              )}

              {learnedItem.notes && (
                <Stack gap={1} className="bg-theme-secondary rounded-lg p-3">
                  <Inline gap={2}>
                    <PiBookOpen className="w-4 h-4" />
                    <Text papel="rotulo" tom="suave" className="font-medium">
                      {t('notes_section')}
                    </Text>
                  </Inline>
                  <Text
                    papel="rotulo"
                    tom="fraco"
                    as="p"
                    className="whitespace-pre-wrap"
                  >
                    {learnedItem.notes}
                  </Text>
                </Stack>
              )}
            </>
          )}
        </Stack>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-theme-secondary flex items-center justify-between">
          <Text papel="legenda" tom="fraco">
            {isWantToLearn
              ? `${t('added_at')} ${formatDate(wantToLearnItem.addedAt)}`
              : `${t('learned_at')} ${formatDate(learnedItem.learnedAt)}`}
          </Text>
          <Inline gap={3}>
            <AnimatedItem hover="scale">
              <Link
                href={`/works/${item.workId}`}
                className="text-ouro-texto text-sm font-medium transition-colors"
              >
                {t('view_work')} →
              </Link>
            </AnimatedItem>
          </Inline>
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
