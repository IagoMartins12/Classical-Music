// components/LearningModal/LearningModal.tsx - CORRIGIDO
'use client';

import { useState, useEffect, useCallback } from 'react';
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
  FiVideo,
  FiAlertCircle,
  FiCircle,
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
import {
  getMilestonesByInstrument,
  calculateProgress,
  createDefaultMilestones,
  type ProgressMilestones,
} from '@/app/utils/progressMilestones';
import { useLearnedVideo } from '@/app/hooks/useLearnedVideo';

const LearningModal = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScoreSelection, setShowScoreSelection] = useState(false);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

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

  // Hook de upload de vídeo
  const {
    selectedVideo,
    videoPreviewUrl,
    isUploading,
    uploadError,
    isVideoPublic,
    selectVideo,
    removeVideo,
    setIsVideoPublic,
    clearError: clearVideoError,
    updateVideo,
    deleteVideo,
  } = useLearnedVideo();

  // Store global
  const {
    isOpen,
    workId,
    workTitle,
    composerName,
    instrumentName,
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

  // Estados para milestones de progresso
  const [progressMilestones, setProgressMilestones] =
    useState<ProgressMilestones>({});
  const [availableMilestones, setAvailableMilestones] = useState<any[]>([]);

  // Determinar contexto
  const isInWorkPage =
    pathname?.includes('/work/') || pathname?.includes('/works/');

  // Obter item do tipo oposto
  const oppositeItem =
    !isCurrentlyActive && workId
      ? type === 'want-to-learn'
        ? getLearnedItem(workId)
        : getWantToLearnItem(workId)
      : null;

  // Inicializar milestones quando modal abre
  useEffect(() => {
    if (isOpen && type === 'want-to-learn' && instrumentName) {
      const milestones = getMilestonesByInstrument(instrumentName);
      console.log('MILESTONS', { milestones, instrumentName });
      setAvailableMilestones(milestones);

      if (isCurrentlyActive) {
        // Edição - usar milestones existentes
        const currentItem = getWantToLearnItem(workId || '');
        setProgressMilestones(
          currentItem?.progressMilestones || createDefaultMilestones(milestones)
        );
      } else {
        // Novo item - milestones vazios
        setProgressMilestones(createDefaultMilestones(milestones));
      }
    }
  }, [
    isOpen,
    type,
    instrumentName,
    isCurrentlyActive,
    workId,
    getWantToLearnItem,
  ]);

  // Inicializar configurações de vídeo
  useEffect(() => {
    if (isOpen && type === 'learned' && isCurrentlyActive) {
      const currentItem = getLearnedItem(workId || '');
      if (currentItem?.isVideoPublic !== undefined) {
        setIsVideoPublic(currentItem.isVideoPublic);
      }
    } else if (isOpen && type === 'learned' && !isCurrentlyActive) {
      setIsVideoPublic(false); // Default para novo item
    }
  }, [
    isOpen,
    type,
    isCurrentlyActive,
    workId,
    getLearnedItem,
    setIsVideoPublic,
  ]);

  // Aplicar dados iniciais quando modal abre
  useEffect(() => {
    if (isOpen && isCurrentlyActive) {
      const currentItem =
        type === 'want-to-learn'
          ? getWantToLearnItem(workId || '')
          : getLearnedItem(workId || '');

      if (currentItem?.selectedWorkScore && !selectedWorkScore) {
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

  // Sugestão do tipo oposto
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

  // Calcular progresso atual
  const currentProgress =
    type === 'want-to-learn'
      ? calculateProgress(progressMilestones, availableMilestones)
      : 0;

  // Handler para toggle de milestone
  const handleMilestoneToggle = useCallback((milestoneKey: string) => {
    setProgressMilestones((prev) => ({
      ...prev,
      [milestoneKey]: !prev[milestoneKey],
    }));
  }, []);

  // Handler para download da partitura
  const handleScoreDownload = () => {
    if (!selectedWorkScore?.downloadUrl) {
      toast.error(t('download_not_available'));
      return;
    }

    window.open(selectedWorkScore.downloadUrl, '_blank');
    toast.success(`${t('download_started')} ${selectedWorkScore.title}`, {
      icon: '📄',
      duration: 3000,
    });
  };

  // Handler para adicionar partitura
  const handleAddScore = () => {
    if (!workId || !workTitle || !composerName || !type) return;

    if (isInWorkPage) {
      startScoreSelection();
    } else {
      setShowScoreSelection(true);
    }
  };

  // Handler para remover partitura
  const handleRemoveScore = () => {
    setSelectedWorkScore(null);
  };

  // Handler para transferir "quero aprender" → "já aprendi"
  const handleTransferToLearned = () => {
    if (type !== 'want-to-learn' || !isCurrentlyActive) return;
    setShowTransferConfirm(true);
  };

  // Confirmar transferência
  const handleConfirmTransfer = async () => {
    if (!user?.id || !workId || type !== 'want-to-learn') return;

    setIsSubmitting(true);
    try {
      await removeWantToLearn(workId);

      const transferData = {
        mastery: Math.max(1, wantToLearnForm.priority || 1),
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
    } catch {
      toast.error('Erro ao transferir obra. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete video
  const handleDeleteVideo = async () => {
    if (!workId) return;

    const success = await deleteVideo(workId);
    if (success) {
      // Atualizar o store para refletir a remoção do vídeo
      const currentItem = getLearnedItem(workId);
      if (currentItem) {
        const updatedItem = {
          ...currentItem,
          videoUrl: undefined,
          videoFileName: undefined,
          videoFilePath: undefined,
          videoFileSize: undefined,
          isVideoPublic: undefined,
          videoUploadedAt: undefined,
        };
        addLearned(updatedItem);
      }
    }
  };

  // ✅ FUNÇÃO AUXILIAR PARA CRIAR LEARNED COM VÍDEO VIA API DIRETA
  const createLearnedWithVideo = async (
    workId: string,
    learnedData: any,
    videoFile: File
  ) => {
    try {
      const formData = new FormData();

      const dataToSend = {
        workId,
        ...learnedData,
        isVideoPublic,
        action: 'add',
      };

      formData.append('data', JSON.stringify(dataToSend));
      formData.append('videoFile', videoFile);

      const response = await fetch('/api/learning/learned', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success && result.item) {
        // Atualizar store com item completo (incluindo dados de vídeo)
        addLearned(result.item);
        return true;
      } else {
        throw new Error(result.error || 'Erro ao criar learned item');
      }
    } catch (error) {
      console.error('Erro ao criar learned com vídeo:', error);
      throw error;
    }
  };

  // ✅ CORREÇÃO: Handle form submission com lógica melhorada
  const handleSubmit = async () => {
    if (!user?.id || !workId || !type) return;

    setIsSubmitting(true);
    try {
      if (isCurrentlyActive) {
        // ATUALIZAR item existente
        if (type === 'want-to-learn') {
          const dataToUpdate = {
            ...wantToLearnForm,
            progressMilestones,
            selectedWorkScoreId: selectedWorkScore?.id,
          };

          const response = await fetch('/api/learning/want-to-learn', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workId,
              ...dataToUpdate,
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
          // LEARNED - com possível upload de vídeo
          if (selectedVideo) {
            // Com upload de vídeo - usar updateVideo que retorna item atualizado
            const success = await updateVideo(workId, {
              ...learnedForm,
              selectedWorkScoreId: selectedWorkScore?.id,
            });

            if (success) {
              // ✅ CORREÇÃO: Buscar item atualizado e atualizar store
              const response = await fetch(
                `/api/learning/learned?workId=${workId}`
              );
              if (response.ok) {
                const result = await response.json();
                if (result.item) {
                  addLearned(result.item);
                }
              }

              toast.success('Dados da obra aprendida atualizados ');
            } else {
              throw new Error('Erro ao atualizar com vídeo');
            }
          } else {
            // Sem vídeo - JSON normal
            const response = await fetch('/api/learning/learned', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                workId,
                ...learnedForm,
                selectedWorkScoreId: selectedWorkScore?.id,
                isVideoPublic,
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
        }
      } else {
        // ADICIONAR novo item
        if (type === 'want-to-learn') {
          const dataToCreate = {
            ...wantToLearnForm,
            progressMilestones,
            selectedWorkScoreId: selectedWorkScore?.id,
          };

          await toggleWantToLearn(
            workId,
            user.id,
            wantToLearnForm.priority,
            dataToCreate
          );
          toast.success('Obra adicionada à sua lista de estudos!', {
            icon: '🎯',
            duration: 3000,
          });
        } else {
          // ✅ CORREÇÃO: LEARNED - fluxo unificado
          const learnedData = {
            ...learnedForm,
            selectedWorkScoreId: selectedWorkScore?.id,
          };

          if (selectedVideo) {
            // ✅ Com vídeo - usar API direta para criar tudo junto
            await createLearnedWithVideo(workId, learnedData, selectedVideo);

            // Limpar estado do vídeo
            removeVideo();

            toast.success(
              '🎉 Parabéns! Obra marcada como aprendida com vídeo!',
              {
                duration: 4000,
              }
            );
          } else {
            // Sem vídeo - método normal
            await toggleLearned(workId, user.id, learnedForm.mastery, {
              ...learnedData,
              isVideoPublic,
            });

            toast.success('Parabéns! Obra marcada como aprendida!', {
              icon: '🎉',
              duration: 3000,
            });
          }
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
    } catch {
      toast.error('Erro ao remover. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  // Handler para fechar
  const handleClose = () => {
    closeModal();
  };

  // Se não tiver dados básicos, não renderizar
  if (!workId || !workTitle || !composerName || !type) {
    return null;
  }

  // Obter item atual para dados de vídeo
  const currentLearnedItem =
    type === 'learned' && isCurrentlyActive ? getLearnedItem(workId) : null;

  // ✅ CORREÇÃO: Lógica para mostrar vídeo (priorizar novo vídeo se selecionado)
  const displayVideo = selectedVideo || currentLearnedItem?.videoUrl;
  const displayVideoUrl = videoPreviewUrl || currentLearnedItem?.videoUrl;
  const displayVideoName =
    selectedVideo?.name || currentLearnedItem?.videoFileName;
  const displayVideoSize =
    selectedVideo?.size || currentLearnedItem?.videoFileSize;

  return (
    <>
      {/* Modal Principal */}
      <Modal
        isOpen={isOpen && !showScoreSelection}
        onClose={handleClose}
        maxWidth="3xl"
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
              {instrumentName && (
                <p className="text-xs text-theme-tertiary">
                  Instrumento: {instrumentName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 py-6 space-y-6 overflow-y-auto">
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
                  options={difficultyOptions.map((option) => ({
                    label: option.label,
                    value: option.value,
                  }))}
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
                    options={difficultyOptions.map((option) => ({
                      label: option.label,
                      value: option.value,
                    }))}
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

          {/* NOVA SEÇÃO: Progresso de Aprendizado */}
          {availableMilestones.length > 0 && type === 'want-to-learn' && (
            <div className="border-2 border-dashed border-theme-secondary rounded-xl p-6 bg-gradient-to-br from-theme-elevated/50 to-interactive-hover/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-green rounded-xl flex items-center justify-center">
                    <FiTarget className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-theme-primary">
                      Progresso de Aprendizado
                    </h3>
                    <p className="text-sm text-theme-secondary">
                      {currentProgress}% completo
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowProgressModal(true)}
                  className="btn-classical-secondary flex items-center space-x-2"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span className="text-theme-primary text-sm">
                    Marcar Progresso
                  </span>
                </button>
              </div>

              {/* Barra de progresso */}
              <div className="mb-4">
                <div className="w-full bg-theme-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      currentProgress >= 100
                        ? 'bg-green-400'
                        : currentProgress >= 50
                        ? 'bg-blue-400'
                        : 'bg-yellow-400'
                    }`}
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ✅ NOVA SEÇÃO DE VÍDEO - LAYOUT MELHORADO */}
          {type === 'learned' && (
            <div className="border-2 border-dashed border-theme-secondary rounded-xl p-6 bg-gradient-to-br from-theme-elevated/50 to-interactive-hover/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                    <FiVideo className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-theme-primary">
                      Vídeo da Performance
                    </h3>
                    <p className="text-sm text-theme-secondary">
                      {displayVideo
                        ? 'Vídeo adicionado'
                        : 'Nenhum vídeo adicionado'}
                    </p>
                  </div>
                </div>
              </div>

              {displayVideo ? (
                /* Mostrar vídeo (existente ou novo) */
                <div className="space-y-4">
                  {/* Informações do vídeo */}
                  <div className="bg-theme-elevated rounded-xl px-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-semibold text-theme-primary text-sm">
                            {displayVideoName}
                          </h4>
                          <p className="text-xs text-theme-tertiary">
                            {displayVideoSize &&
                              formatFileSize(displayVideoSize)}
                            {isVideoPublic ? ' • Público' : ' • Privado'}
                          </p>
                        </div>
                      </div>
                      {currentLearnedItem?.videoUrl && (
                        <button
                          onClick={handleDeleteVideo}
                          className="text-accent-red hover:text-accent-red/80 text-sm"
                        >
                          <FiTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Player de vídeo */}
                    <div className="mb-4">
                      <video
                        src={displayVideoUrl || undefined}
                        controls
                        className="w-full max-h-64 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Opção para substituir vídeo - mais discreta */}
                  <div className="text-center">
                    <input
                      type="file"
                      id="video-replace"
                      accept="video/mp4,video/webm,video/mov,video/quicktime"
                      onChange={(e) => selectVideo(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label
                      htmlFor="video-replace"
                      className="text-sm text-theme-tertiary hover:text-brand-primary cursor-pointer underline transition-colors duration-200"
                    >
                      Substituir vídeo
                    </label>
                  </div>
                </div>
              ) : (
                /* Upload de vídeo inicial */
                <div>
                  <input
                    type="file"
                    id="video-upload"
                    accept="video/mp4,video/webm,video/mov,video/quicktime"
                    onChange={(e) => selectVideo(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label
                    htmlFor="video-upload"
                    className="w-full border-2 border-dashed border-theme-secondary hover:border-brand-primary rounded-xl p-4 text-center transition-all duration-300 hover:bg-brand-primary/5 group cursor-pointer block"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border-2 border-brand-primary/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <FiPlus className="w-6 h-6 text-brand-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-theme-primary">
                          Adicionar Vídeo
                        </p>
                        <p className="text-sm text-theme-secondary">
                          MP4, WebM, MOV até 100MB
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              )}

              {/* Configurações de privacidade */}
              <div className="mt-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    label="Tornar vídeo público (visível para outros usuários)"
                    type="checkbox"
                    id="videoPublic"
                    checked={isVideoPublic}
                    onChange={(e) => setIsVideoPublic(e.target.checked)}
                  />
                </div>
              </div>

              {/* Error display */}
              {uploadError && (
                <div className="mt-4 p-3 border border-red-400 rounded-lg flex items-center space-x-2">
                  <FiAlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-accent-red text-sm">{uploadError}</span>
                  <button
                    onClick={clearVideoError}
                    className="ml-auto text-red-400 hover:text-accent-red/80"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Seção de Partitura */}
          <div className="border-2 border-dashed border-theme-secondary rounded-xl p-6 bg-gradient-to-br from-theme-elevated/50 to-interactive-hover/30">
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
                    {selectedWorkScore.downloadUrl && (
                      <button
                        title={t('download_button')}
                        onClick={handleScoreDownload}
                        className="btn-classical-secondary-sm flex items-center space-x-2 text-accent-purple border-accent-purple/30 hover:bg-accent-purple/10"
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
                      className="btn-classical-secondary-sm flex items-center space-x-2"
                    >
                      <FiEdit3 className="w-5 h-5 text-theme-primary" />
                    </button>
                    <button
                      title={t('remove_button')}
                      onClick={handleRemoveScore}
                      className="btn-classical-outline-sm text-accent-red border-accent-red hover:bg-accent-red hover:text-theme-primary"
                    >
                      <FiX className="w-5 h-5 text-theme-primary" />
                    </button>
                  </div>
                </div>

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

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t border-theme-secondary flex items-center ${
            (isCurrentlyActive && !isSubmitting && !isUploading) ||
            (type === 'want-to-learn' && isCurrentlyActive)
              ? 'justify-between'
              : 'justify-end'
          } space-x-3`}
        >
          {/* Botões de ação à esquerda */}
          {isCurrentlyActive && !isSubmitting && !isUploading && (
            <div className="flex items-center space-x-3">
              <Button
                variant="delete"
                leftIcon={<FiTrash />}
                onClick={handleRemove}
              >
                {t('delete_button')}
              </Button>

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
              isLoading={isSubmitting || isUploading}
              rightIcon={config.emoji}
              disabled={isUploading}
            >
              {isSubmitting || isUploading
                ? type === 'learned' && selectedVideo
                  ? 'Enviando...'
                  : 'Salvando...'
                : isCurrentlyActive
                ? t('update_button')
                : t('save_button')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Seleção de Partitura */}
      {workId && workTitle && composerName && (
        <ScoreSelectionModal
          isOpen={showScoreSelection}
          onClose={() => setShowScoreSelection(false)}
          workId={workId}
          workTitle={workTitle}
          composerName={composerName}
          currentSelectedScore={selectedWorkScore}
          isEditing={isCurrentlyActive}
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
              setSelectedWorkScore(null);
            }
            setShowScoreSelection(false);
          }}
        />
      )}

      {/* Modal de Confirmação de Transferência */}
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

          <div className="classical-card-simple rounded-xl p-4 mb-6">
            <p className="text-theme-primary">
              <strong>&quot;{workTitle}&quot;</strong> {t('transfer_learned_description')}
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
            >
              {isSubmitting ? t('transferring') : t('confirm_transfer')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Progresso/Milestones */}
      {type === 'want-to-learn' && (
        <Modal
          isOpen={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          maxWidth="2xl"
          showCloseButton={true}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-theme-primary">
                  Marcar Progresso de Aprendizado
                </h3>
                <p className="text-sm text-theme-secondary">
                  Acompanhe seu progresso marcando os milestones conquistados
                </p>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex-1">
                  <div className="w-full bg-theme-secondary rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        currentProgress >= 100
                          ? 'bg-green-400'
                          : currentProgress >= 50
                          ? 'bg-blue-400'
                          : 'bg-yellow-400'
                      }`}
                      style={{ width: `${currentProgress}%` }}
                    />
                  </div>
                </div>
                <span className="text-lg font-bold text-theme-primary">
                  {currentProgress}%
                </span>
              </div>
              <p className="text-sm text-theme-tertiary">
                Clique nos milestones para marcar como concluídos
              </p>
            </div>

            {/* Lista de milestones */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableMilestones.map((milestone) => {
                const Icon = milestone.icon;
                const isCompleted = progressMilestones[milestone.key];

                return (
                  <div
                    key={milestone.key}
                    className={`flex items-center space-x-3 p-4 rounded-xl transition-all cursor-pointer border-2 ${
                      isCompleted
                        ? 'bg-accent-green/5 border-accent-green/30'
                        : 'border-theme-secondary hover:border-brand-primary/50 hover:bg-brand-primary/5'
                    }`}
                    onClick={() => handleMilestoneToggle(milestone.key)}
                  >
                    <div className={`flex-shrink-0 ${milestone.color}`}>
                      {isCompleted ? (
                        <FiCheckCircle className="w-6 h-6 text-accent-green" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-theme-primary">
                        {t(milestone.labelKey)}
                      </div>
                      <div className="text-sm text-theme-tertiary">
                        +{milestone.weight}% de progresso
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <FiCheckCircle className="w-5 h-5 text-accent-green" />
                      ) : (
                        <FiCircle className="w-5 h-5 text-theme-tertiary" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowProgressModal(false)}
              >
                {t('cancel_button')}
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowProgressModal(false)}
                rightIcon="🎯"
              >
                Confirmar Progresso
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default LearningModal;
