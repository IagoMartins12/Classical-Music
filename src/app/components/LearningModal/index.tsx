// components/LearningModal/LearningModal.tsx - ATUALIZADO COM IMPORT CORRETO
'use client';

import { useState, useEffect } from 'react';
import {
  FiTarget,
  FiCheckCircle,
  FiCalendar,
  FiClock,
  FiMusic,
  FiHeart,
  FiUsers,
  FiBookOpen,
  FiAward,
  FiTrendingUp,
  FiFileText,
  FiPlus,
  FiEdit3,
  FiArrowRight,
  FiDownload,
  FiTrash,
  FiX,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useLearningStore } from '@/app/stores/useLearningStore';
import { useAuth } from '@/app/hooks/useAuth';
import { usePathname } from 'next/navigation';
import {
  useLearningModalStore,
  type DifficultyLevel,
} from '@/app/stores/useLearningModalStore';
import Modal from '../Modal';
import Button from '../Common/Button';
import StarRating from './StarRating';
import FormField from './FormField';
import { WorkScore } from '@/app/hooks/useWorkScores';
import ScoreSelectionModal from './ScoreSelectionModal';
import Input from '../Common/Inputs';
import Select from '../Common/Select';
import Checkbox from '../Common/Checkbox';
import { useTranslation } from '@/app/hooks/useTranslation';

const LearningModal = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const { t } = useTranslation({ sections: ['pages/learning'] });

  const {
    toggleWantToLearn,
    toggleLearned,
    removeWantToLearn,
    removeLearned,
    getWantToLearnItem,
    getLearnedItem,
    addLearned,
    addWantToLearn,
  } = useLearningStore();

  // ✅ Store global
  const {
    isOpen,
    workId,
    workTitle,
    composerName,
    type,
    isCurrentlyActive,
    wantToLearnForm,
    learnedForm,
    selectedWorkScore,
    closeModal,
    updateWantToLearnForm,
    updateLearnedForm,
    setSelectedWorkScore,
    startScoreSelection,
  } = useLearningModalStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScoreSelection, setShowScoreSelection] = useState(false);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);

  // ✅ NOVO: Determinar contexto (Work page vs Learning page)
  const isInWorkPage =
    pathname?.includes('/work/') || pathname?.includes('/works/');
  const isInLearningPage = pathname?.includes('/learning');

  // ✅ Obter item do tipo oposto para sugestão de partitura
  const oppositeItem =
    !isCurrentlyActive && workId
      ? type === 'want-to-learn'
        ? getLearnedItem(workId)
        : getWantToLearnItem(workId)
      : null;

  // ✅ Aplicar dados iniciais quando modal abre (CORRIGIDO)
  useEffect(() => {
    if (isOpen && isCurrentlyActive) {
      // ✅ NOVO: Buscar dados atuais do item para garantir que temos a partitura
      const currentItem =
        type === 'want-to-learn'
          ? getWantToLearnItem(workId || '')
          : getLearnedItem(workId || '');

      // ✅ Se tem partitura vinculada mas modal não tem, aplicar
      if (currentItem?.selectedWorkScore && !selectedWorkScore) {
        console.log(
          '📄 [LEARNING-MODAL] Aplicando partitura do item atual:',
          currentItem.selectedWorkScore.title
        );
        setSelectedWorkScore({
          id: currentItem.selectedWorkScore.id,
          sourceId: currentItem.selectedWorkScore.sourceId,
          source: currentItem.selectedWorkScore.source,
          title: currentItem.selectedWorkScore.title,
          downloadUrl: currentItem.selectedWorkScore.downloadUrl,
          thumbnailUrl: currentItem.selectedWorkScore.thumbnailUrl,
          fileSize: currentItem.selectedWorkScore.fileSize,
          pageCount: currentItem.selectedWorkScore.pageCount,
          fileFormat: currentItem.selectedWorkScore.fileFormat,
          type: currentItem.selectedWorkScore.type,
          editor: currentItem.selectedWorkScore.editor,
          publisher: currentItem.selectedWorkScore.publisher,
          copyright: currentItem.selectedWorkScore.copyright,
          uploadDate: currentItem.selectedWorkScore.uploadDate,
          uploader: currentItem.selectedWorkScore.uploader,
          notes: currentItem.selectedWorkScore.notes,
        });
      }
    }
  }, [
    isOpen,
    isCurrentlyActive,
    workId,
    type,
    selectedWorkScore,
    getWantToLearnItem,
    getLearnedItem,
    setSelectedWorkScore,
  ]);

  // ✅ Aplicar sugestão do tipo oposto se não houver WorkScore e não estiver editando
  useEffect(() => {
    if (
      !isCurrentlyActive &&
      !selectedWorkScore &&
      oppositeItem?.selectedWorkScore
    ) {
      setSelectedWorkScore({
        id: oppositeItem.selectedWorkScore.id,
        sourceId: oppositeItem.selectedWorkScore.sourceId,
        source: oppositeItem.selectedWorkScore.source,
        title: oppositeItem.selectedWorkScore.title,
        downloadUrl: oppositeItem.selectedWorkScore.downloadUrl,
        thumbnailUrl: oppositeItem.selectedWorkScore.thumbnailUrl,
        fileSize: oppositeItem.selectedWorkScore.fileSize,
        pageCount: oppositeItem.selectedWorkScore.pageCount,
        fileFormat: oppositeItem.selectedWorkScore.fileFormat,
        type: oppositeItem.selectedWorkScore.type,
        editor: oppositeItem.selectedWorkScore.editor,
        publisher: oppositeItem.selectedWorkScore.publisher,
        copyright: oppositeItem.selectedWorkScore.copyright,
        uploadDate: oppositeItem.selectedWorkScore.uploadDate,
        uploader: oppositeItem.selectedWorkScore.uploader,
        notes: oppositeItem.selectedWorkScore.notes,
      });
    }
  }, [
    isCurrentlyActive,
    selectedWorkScore,
    oppositeItem,
    setSelectedWorkScore,
  ]);

  // ✅ NOVA FUNÇÃO PARA DOWNLOAD DA PARTITURA
  const handleScoreDownload = () => {
    if (!selectedWorkScore?.downloadUrl) {
      toast.error(t('download_not_available'));
      return;
    }

    // Abrir download em nova aba
    window.open(selectedWorkScore.downloadUrl, '_blank');

    toast.success(`${t('download_started')} ${selectedWorkScore.title}`, {
      icon: '📄',
      duration: 3000,
    });
  };

  // ✅ Handler para adicionar partitura (comportamento baseado no contexto)
  const handleAddScore = () => {
    if (!workId || !workTitle || !composerName || !type) return;

    console.log(
      '🎼 [LEARNING-MODAL] Iniciando seleção de partitura, contexto:',
      {
        isInWorkPage,
        isInLearningPage,
        workId,
        isCurrentlyActive, // ✅ NOVO: Para detectar se é edição
      }
    );

    if (isInWorkPage) {
      // ✅ Na página Work: ir para seleção inline (comportamento atual)
      console.log('🎯 [LEARNING-MODAL] Ativando modo seleção inline');
      startScoreSelection();
    } else {
      // ✅ Na página Learning: abrir ScoreSelectionModal
      console.log('🎯 [LEARNING-MODAL] Abrindo ScoreSelectionModal');
      setShowScoreSelection(true);
    }
  };

  // ✅ Handler para remover partitura
  const handleRemoveScore = () => {
    console.log('🗑️ [LEARNING-MODAL] Removendo partitura selecionada');
    setSelectedWorkScore(null);
  };

  // ✅ Handler para transferir "quero aprender" → "já aprendi"
  const handleTransferToLearned = () => {
    if (type !== 'want-to-learn' || !isCurrentlyActive) return;
    setShowTransferConfirm(true);
  };

  // ✅ Confirmar transferência
  const handleConfirmTransfer = async () => {
    if (!user?.id || !workId || type !== 'want-to-learn') return;

    setIsSubmitting(true);
    try {
      // 1. Remover de "quero aprender"
      await removeWantToLearn(workId);

      // 2. Adicionar em "já aprendi" com dados transferidos
      const transferData = {
        mastery: Math.max(1, wantToLearnForm.priority || 1), // Transferir prioridade como maestria inicial
        difficulty: wantToLearnForm.difficulty,
        notes: wantToLearnForm.notes,
        selectedWorkScoreId: selectedWorkScore?.id,
        wouldRecommend: true,
        publicPerformance: false,
      };

      await toggleLearned(workId, user.id, transferData.mastery, transferData);

      toast.success('🎉 Parabéns! Obra transferida para "Já Aprendi"!', {
        duration: 4000,
      });

      setShowTransferConfirm(false);
      closeModal();
    } catch (error) {
      console.error('Erro ao transferir obra:', error);
      toast.error('Erro ao transferir obra. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user?.id || !workId || !type) return;

    setIsSubmitting(true);
    try {
      if (isCurrentlyActive) {
        // ATUALIZAR item existente usando PATCH
        if (type === 'want-to-learn') {
          const response = await fetch('/api/learning/want-to-learn', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workId,
              ...wantToLearnForm,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.item) {
              addWantToLearn(result.item);
            }
            toast.success('Obra atualizada na sua lista de estudos!', {
              icon: '✏️',
              duration: 3000,
            });
          } else {
            throw new Error('Erro ao atualizar');
          }
        } else {
          const response = await fetch('/api/learning/learned', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workId,
              ...learnedForm,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.item) {
              addLearned(result.item);
            }
            toast.success('Dados da obra aprendida atualizados!', {
              icon: '✏️',
              duration: 3000,
            });
          } else {
            throw new Error('Erro ao atualizar');
          }
        }
      } else {
        // ADICIONAR novo item usando toggle
        if (type === 'want-to-learn') {
          await toggleWantToLearn(
            workId,
            user.id,
            wantToLearnForm.priority,
            wantToLearnForm
          );
          toast.success('Obra adicionada à sua lista de estudos!', {
            icon: '🎯',
            duration: 3000,
          });
        } else {
          await toggleLearned(
            workId,
            user.id,
            learnedForm.mastery,
            learnedForm
          );
          toast.success('Parabéns! Obra marcada como aprendida!', {
            icon: '🎉',
            duration: 3000,
          });
        }
      }

      closeModal();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle removal
  const handleRemove = async () => {
    if (!user?.id || !workId || !type) return;

    setIsSubmitting(true);
    try {
      if (type === 'want-to-learn') {
        await removeWantToLearn(workId);
        toast.success('Obra removida da sua lista de estudos!', {
          icon: '🗑️',
          duration: 3000,
        });
      } else {
        await removeLearned(workId);
        toast.success('Obra removida da lista de aprendidas!', {
          icon: '🗑️',
          duration: 3000,
        });
      }

      closeModal();
    } catch (error) {
      console.error('Erro ao remover:', error);
      toast.error('Erro ao remover. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const config =
    type === 'want-to-learn'
      ? {
          title: isCurrentlyActive
            ? t('edit_study_list_title')
            : t('add_study_list_title'),
          subtitle: isCurrentlyActive
            ? t('edit_study_subtitle')
            : t('add_study_subtitle'),
          icon: FiTarget,
          color: 'blue',
          emoji: '🎯',
        }
      : {
          title: isCurrentlyActive
            ? t('edit_learned_title')
            : t('mark_learned_title'),
          subtitle: isCurrentlyActive
            ? t('edit_learned_subtitle')
            : t('mark_learned_subtitle'),
          icon: FiCheckCircle,
          color: 'green',
          emoji: '🎉',
        };

  const difficultyOptions = [
    { value: '', label: t('select_difficulty') },
    { value: 'BEGINNER', label: t('difficulty_beginner') },
    { value: 'INTERMEDIATE', label: t('difficulty_intermediate') },
    { value: 'ADVANCED', label: t('difficulty_advanced') },
  ];

  // ✅ Handler para fechar (com limpeza)
  const handleClose = () => {
    closeModal();
  };

  // ✅ Se não tiver dados básicos, não renderizar
  if (!workId || !workTitle || !composerName || !type) {
    return null;
  }

  return (
    <>
      {/* Modal Principal */}
      <Modal
        isOpen={isOpen && !showScoreSelection}
        onClose={handleClose}
        maxWidth="2xl"
        showCloseButton={true}
        className="max-h-[90vh] overflow-hidden"
        confirmOnClose
        withouVerification
        processName={
          type === 'learned'
            ? t('mark_learned_title')
            : t('add_study_list_title')
        }
      >
        {/* Header */}
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                config.color === 'blue'
                  ? 'from-accent-blue to-brand-primary'
                  : 'from-accent-green to-brand-primary'
              } flex items-center justify-center shadow-theme-glow`}
            >
              <config.icon className="w-5 h-5 text-theme-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-theme-primary classical-title">
                {config.title}
              </h2>
              <p className="text-sm text-theme-secondary">{config.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Work Info */}
        <div className="px-6 py-4 classical-card !rounded-2xl !shadow-none !border-none !transform-none border-b border-theme-secondary">
          <div className="flex items-center space-x-3">
            <FiMusic className="w-5 h-5 text-theme-tertiary" />
            <div>
              <h3 className="font-semibold text-theme-primary">{workTitle}</h3>
              <p className="text-sm text-theme-secondary">{composerName}</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Formulários condicionais */}
          {type === 'want-to-learn' ? (
            <>
              <StarRating
                value={wantToLearnForm.priority}
                onChange={(value) => updateWantToLearnForm({ priority: value })}
                label={t('priority_modal')}
                labels={[
                  t('priority_low_label'),
                  t('priority_medium_low_label'),
                  t('priority_medium_label'),
                  t('priority_medium_high_label'),
                  t('priority_high_label'),
                ]}
              />

              <FormField
                label={t('motivation_modal')}
                icon={FiHeart}
                description={t('motivation_description')}
              >
                <textarea
                  value={wantToLearnForm.motivation || ''}
                  onChange={(e) =>
                    updateWantToLearnForm({ motivation: e.target.value })
                  }
                  className="w-full input-classical-2 resize-none"
                  rows={3}
                  placeholder={t('motivation_placeholder')}
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label={t('target_date_modal')}
                  icon={FiCalendar}
                  description={t('target_date_description')}
                >
                  <input
                    type="date"
                    value={wantToLearnForm.targetDate || ''}
                    onChange={(e) =>
                      updateWantToLearnForm({ targetDate: e.target.value })
                    }
                    className="w-full input-classical-2"
                  />
                </FormField>

                <FormField
                  label={t('estimated_time_modal')}
                  icon={FiClock}
                  description={t('estimated_time_description')}
                >
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={wantToLearnForm.estimatedStudyTime || ''}
                    onChange={(e) =>
                      updateWantToLearnForm({
                        estimatedStudyTime:
                          parseInt(e.target.value) || undefined,
                      })
                    }
                    className="w-full input-classical-2"
                    placeholder={t('estimated_time_placeholder')}
                  />
                </FormField>
              </div>

              <FormField label={t('difficulty_estimated')} icon={FiTrendingUp}>
                <Select
                  options={[
                    ...difficultyOptions.map((option) => ({
                      label: option.label,
                      value: option.value,
                    })),
                  ]}
                  value={wantToLearnForm.difficulty || ''}
                  onChange={(e) =>
                    updateWantToLearnForm({
                      difficulty:
                        (e.target.value as DifficultyLevel) || undefined,
                    })
                  }
                  className="w-full input-classical-2"
                />
              </FormField>

              <FormField
                label={t('context_modal')}
                icon={FiUsers}
                description={t('context_description')}
              >
                <Input
                  type="text"
                  value={wantToLearnForm.context || ''}
                  onChange={(e) =>
                    updateWantToLearnForm({ context: e.target.value })
                  }
                  className="w-full input-classical-2"
                  placeholder={t('context_placeholder')}
                />
              </FormField>

              <FormField label={t('personal_notes')} icon={FiBookOpen}>
                <textarea
                  value={wantToLearnForm.notes || ''}
                  onChange={(e) =>
                    updateWantToLearnForm({ notes: e.target.value })
                  }
                  className="w-full input-classical-2 resize-none"
                  rows={3}
                  placeholder={t('personal_notes_placeholder')}
                />
              </FormField>
            </>
          ) : (
            <>
              <StarRating
                value={learnedForm.mastery}
                onChange={(value) => updateLearnedForm({ mastery: value })}
                label={t('mastery_level')}
                labels={[
                  t('mastery_beginner'),
                  t('mastery_basic'),
                  t('mastery_intermediate'),
                  t('mastery_advanced'),
                  t('mastery_expert'),
                ]}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={t('study_start_modal')} icon={FiCalendar}>
                  <input
                    type="date"
                    value={learnedForm.studyStartDate || ''}
                    onChange={(e) =>
                      updateLearnedForm({ studyStartDate: e.target.value })
                    }
                    className="w-full input-classical-2"
                  />
                </FormField>

                <FormField
                  label={t('study_duration_modal')}
                  icon={FiClock}
                  description={t('study_duration_description')}
                >
                  <input
                    type="number"
                    min="1"
                    value={learnedForm.studyDuration || ''}
                    onChange={(e) =>
                      updateLearnedForm({
                        studyDuration: parseInt(e.target.value) || undefined,
                      })
                    }
                    className="w-full input-classical-2"
                    placeholder={t('study_duration_placeholder')}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={t('real_difficulty')} icon={FiTrendingUp}>
                  <Select
                    options={difficultyOptions.map((option) => {
                      return {
                        label: option.label,
                        value: option.value,
                      };
                    })}
                    value={learnedForm.difficulty || ''}
                    onChange={(e) =>
                      updateLearnedForm({
                        difficulty:
                          (e.target.value as DifficultyLevel) || undefined,
                      })
                    }
                    className="w-full input-classical-2"
                  />
                </FormField>

                <div className="space-y-2">
                  <StarRating
                    value={learnedForm.enjoyment || 0}
                    onChange={(value) =>
                      updateLearnedForm({ enjoyment: value })
                    }
                    label={t('satisfaction_modal')}
                    labels={[
                      t('satisfaction_dislike'),
                      t('satisfaction_little'),
                      t('satisfaction_regular'),
                      t('satisfaction_like'),
                      t('satisfaction_love'),
                    ]}
                  />
                </div>
              </div>

              <FormField
                label={t('technical_challenges_modal')}
                icon={FiTarget}
                description={t('technical_challenges_description')}
              >
                <textarea
                  value={learnedForm.technicalChallenges || ''}
                  onChange={(e) =>
                    updateLearnedForm({ technicalChallenges: e.target.value })
                  }
                  className="w-full input-classical-2 resize-none"
                  rows={2}
                  placeholder={t('technical_challenges_placeholder')}
                />
              </FormField>

              <FormField
                label={t('musical_insights_modal')}
                icon={FiAward}
                description={t('musical_insights_description')}
              >
                <textarea
                  value={learnedForm.musicalInsights || ''}
                  onChange={(e) =>
                    updateLearnedForm({ musicalInsights: e.target.value })
                  }
                  className="w-full input-classical-2 resize-none"
                  rows={2}
                  placeholder={t('musical_insights_placeholder')}
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    type="checkbox"
                    id="wouldRecommend"
                    checked={learnedForm.wouldRecommend}
                    onChange={(e) =>
                      updateLearnedForm({ wouldRecommend: e.target.checked })
                    }
                    className="w-4 h-4 text-accent-green border-theme-secondary rounded focus:ring-brand-primary"
                  />
                  <label
                    htmlFor="wouldRecommend"
                    className="text-sm font-medium text-theme-secondary cursor-pointer"
                  >
                    {t('would_recommend')}
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    type="checkbox"
                    id="publicPerformance"
                    checked={learnedForm.publicPerformance}
                    onChange={(e) =>
                      updateLearnedForm({ publicPerformance: e.target.checked })
                    }
                    className="w-4 h-4 text-accent-green border-theme-secondary rounded focus:ring-brand-primary"
                  />
                  <label
                    htmlFor="publicPerformance"
                    className="text-sm font-medium text-theme-secondary cursor-pointer"
                  >
                    {t('public_performance_modal')}
                  </label>
                </div>
              </div>

              <FormField label={t('general_notes')} icon={FiBookOpen}>
                <textarea
                  value={learnedForm.notes || ''}
                  onChange={(e) => updateLearnedForm({ notes: e.target.value })}
                  className="w-full input-classical-2 resize-none"
                  rows={3}
                  placeholder={t('general_notes_placeholder')}
                />
              </FormField>
            </>
          )}

          <div className="border-2  border-dashed border-theme-secondary rounded-xl p-6 bg-gradient-to-br from-theme-elevated/50 to-interactive-hover/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                  <FiFileText className="w-4 h-4 text-theme-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-theme-primary">
                    {t('study_score_title')}
                  </h3>
                  <p className="text-sm text-theme-secondary">
                    {selectedWorkScore
                      ? t('score_linked')
                      : t('no_score_selected')}
                  </p>
                </div>
              </div>
            </div>

            {selectedWorkScore ? (
              <div className="bg-theme-elevated rounded-xl p-4 border border-theme-primary">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
                      <FiMusic className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-theme-primary text-sm">
                        {selectedWorkScore.title}
                      </h4>
                      <p className="text-xs text-theme-tertiary">
                        {t('source_label')} {selectedWorkScore.source}
                        {selectedWorkScore.fileSize &&
                          ` • ${selectedWorkScore.fileSize}`}
                        {selectedWorkScore.pageCount &&
                          ` • ${selectedWorkScore.pageCount} ${t(
                            'pages_label'
                          )}`}
                        {selectedWorkScore.type &&
                          ` • ${selectedWorkScore.type}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* ✅ BOTÃO DE DOWNLOAD */}
                    {selectedWorkScore.downloadUrl && (
                      <button
                        title={t('download_button')}
                        onClick={handleScoreDownload}
                        className="btn-classical-secondary-sm  flex items-center space-x-2 text-accent-purple border-accent-purple/30 hover:bg-accent-purple/10"
                      >
                        <FiDownload className="w-5 h-5 text-theme-primary" />
                      </button>
                    )}

                    <button
                      title={
                        isCurrentlyActive
                          ? t('change_button')
                          : t('edit_change_button')
                      }
                      onClick={handleAddScore}
                      className="btn-classical-secondary-sm  flex items-center space-x-2"
                    >
                      <FiEdit3 className="w-5 h-5 text-theme-primary" />
                    </button>
                    <button
                      title={t('remove_button')}
                      onClick={handleRemoveScore}
                      className="btn-classical-outline-sm  text-accent-red border-accent-red hover:bg-accent-red hover:text-theme-primary"
                    >
                      <FiX className="w-5 h-5 text-theme-primary" />
                    </button>
                  </div>
                </div>

                {/* Indicador se é sugestão do tipo oposto */}
                {!isCurrentlyActive &&
                  oppositeItem?.selectedWorkScore?.id ===
                    selectedWorkScore.id && (
                    <div className="mt-3 p-2 bg-gradient-to-r from-accent-green/10 to-accent-blue/10 border border-accent-green/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-accent-green rounded-full flex items-center justify-center">
                          <span className="text-xs">💡</span>
                        </div>
                        <span className="text-sm text-accent-green font-medium">
                          {t('score_suggestion')} &quot;
                          {type === 'want-to-learn'
                            ? t('already_learned')
                            : t('want_to_learn')}
                          &quot;
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <button
                onClick={handleAddScore}
                className="w-full border-2 border-dashed border-theme-secondary hover:border-brand-primary rounded-xl p-4 text-center transition-all duration-300 hover:bg-brand-primary/5 group"
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border-2 border-brand-primary/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiPlus className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-theme-primary">
                      {isCurrentlyActive
                        ? t('edit_score_button')
                        : t('add_score_button')}
                    </p>
                    <p className="text-sm text-theme-secondary">
                      {isInWorkPage
                        ? t('select_score_description')
                        : t('choose_score_description')}
                    </p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* ✅ Seção de Partitura COM BOTÃO DE DOWNLOAD */}

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t border-theme-secondary flex items-center ${
            (isCurrentlyActive && !isSubmitting) ||
            (type === 'want-to-learn' && isCurrentlyActive)
              ? 'justify-between'
              : 'justify-end'
          } space-x-3`}
        >
          {/* ✅ Botões de ação à esquerda */}
          {isCurrentlyActive && !isSubmitting && (
            <div className="flex items-center space-x-3">
              <Button
                variant="delete"
                leftIcon={<FiTrash />}
                onClick={handleRemove}
              >
                {t('delete_button')}
              </Button>

              {/* ✅ NOVO: Botão de transferência para "quero aprender" */}
              {type === 'want-to-learn' && (
                <Button
                  variant="outline"
                  className="truncate"
                  onClick={handleTransferToLearned}
                >
                  {t('mark_as_learned')}
                </Button>
              )}
            </div>
          )}

          {/* Botões principais à direita */}
          <div className="flex items-center space-x-3">
            <Button variant="secondary" onClick={handleClose}>
              {isCurrentlyActive ? t('back_button') : t('cancel_button')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              rightIcon={config.emoji}
            >
              {isCurrentlyActive ? t('update_button') : t('save_button')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ✅ Modal de Seleção de Partitura COM DETECÇÃO DE EDIÇÃO */}
      {workId && workTitle && composerName && (
        <ScoreSelectionModal
          isOpen={showScoreSelection}
          onClose={() => setShowScoreSelection(false)}
          workId={workId}
          workTitle={workTitle}
          composerName={composerName}
          currentSelectedScore={selectedWorkScore}
          isEditing={isCurrentlyActive} // ✅ NOVO: Passar se é edição para detectar auto-seleção
          onScoreSelected={(workScore: WorkScore) => {
            if (workScore) {
              setSelectedWorkScore({
                id: workScore.id,
                sourceId: workScore.sourceId,
                source: workScore.source,
                title: workScore.title,
                downloadUrl: workScore.downloadUrl,
                thumbnailUrl: workScore.thumbnailUrl,
                fileSize: workScore.fileSize,
                pageCount: workScore.pageCount,
                fileFormat: workScore.fileFormat,
                type: workScore.type,
                editor: workScore.editor,
                publisher: workScore.publisher,
                copyright: workScore.copyright,
                uploadDate: workScore.uploadDate,
                uploader: workScore.uploader,
                notes: workScore.notes,
              });
            } else {
              // ✅ NOVO: Permitir remover partitura passando null
              setSelectedWorkScore(null);
            }
            setShowScoreSelection(false);
          }}
        />
      )}

      {/* ✅ Modal de Confirmação de Transferência */}
      <Modal
        isOpen={showTransferConfirm}
        onClose={() => setShowTransferConfirm(false)}
        maxWidth="md"
        showCloseButton={true}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-brand-primary rounded-xl flex items-center justify-center">
              <FiArrowRight className="w-6 h-6 text-theme-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-theme-primary">
                {t('transfer_learned_title')}
              </h3>
              <p className="text-sm text-theme-secondary">
                {t('transfer_learned_subtitle')}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-accent-green/10 to-accent-blue/10 border border-accent-green/30 rounded-xl p-4 mb-6">
            <p className="text-theme-primary">
              <strong>&quot;{workTitle}&quot;</strong>{' '}
              {t('transfer_learned_description')}
            </p>

            <div className="mt-3 text-sm text-theme-secondary">
              <ul className="space-y-1">
                <li>• {t('transfer_priority_mastery')}</li>
                <li>• {t('transfer_difficulty_notes')}</li>
                <li>• {t('transfer_score_preserved')}</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowTransferConfirm(false)}
              disabled={isSubmitting}
            >
              {t('cancel_button')}
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmTransfer}
              isLoading={isSubmitting}
              rightIcon="🎉"
            >
              {isSubmitting ? t('transferring') : t('confirm_transfer')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default LearningModal;
