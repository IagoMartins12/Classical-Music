// components/LearningModal/LearningModal.tsx - CORRIGIDO
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  PiArrowRight,
  PiBookOpen,
  PiCalendarBlank,
  PiCheckCircle,
  PiCircle,
  PiClock,
  PiDownloadSimple,
  PiFileText,
  PiHeart,
  PiMedal,
  PiMusicNotes,
  PiPencilLine,
  PiPlus,
  PiTarget,
  PiTrashSimple,
  PiTrendUp,
  PiUsers,
  PiVideoCamera,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
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
import {
  getLearnedRequest,
  toggleLearnedRequest,
  updateLearnedRequest,
  updateWantToLearnRequest,
  uploadPerformanceVideo,
} from '@/app/requests/library';
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
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Card } from '@/app/components/ui/Card';

const LearningModal = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScoreSelection, setShowScoreSelection] = useState(false);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const { user } = useAuth();
  const pathname = usePathname();
  const { t, language } = useTranslation({ sections: ['pages/learning'] });

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

  const useModalTranslations = () => {
    const messages = {
      pt: {
        // Mensagens de sucesso - handleSubmit
        wantToLearnUpdated: 'Obra atualizada na sua lista de estudos!',
        learnedDataUpdated: 'Dados da obra aprendida atualizados!',
        learnedDataUpdatedWithVideo: 'Dados da obra aprendida atualizados',
        wantToLearnAdded: 'Obra adicionada à sua lista de estudos!',
        congratsLearned: '🎉 Parabéns! Obra marcada como aprendida!',

        // Mensagens de erro - handleSubmit
        saveError: 'Erro ao salvar. Tente novamente.',
        updateError: 'Erro ao atualizar',
        updateVideoError: 'Erro ao atualizar com vídeo',

        // Mensagens de transferência - handleConfirmTransfer
        transferSuccess: '🎉 Parabéns! Obra transferida para "Já Aprendi"!',
        transferError: 'Erro ao transferir obra. Tente novamente.',
        transferring: 'Transferindo...',

        // Mensagens de remoção - handleRemove
        wantToLearnRemoved: 'Obra removida da sua lista de estudos!',
        learnedRemoved: 'Obra removida da lista de aprendidas!',
        removeError: 'Erro ao remover. Tente novamente.',

        // Mensagens de vídeo - handleDeleteVideo
        videoDeleteSuccess: 'Vídeo removido com sucesso!',
        videoDeleteError: 'Erro ao remover vídeo. Tente novamente.',

        // Status messages
        uploadingStatus: 'Enviando vídeo...',
        savingStatus: 'Salvando...',

        // Console errors
        saveErrorConsole: 'Erro ao salvar:',
      },

      en: {
        // Success messages - handleSubmit
        wantToLearnUpdated: 'Work updated in your study list!',
        learnedDataUpdated: 'Learned work data updated!',
        learnedDataUpdatedWithVideo: 'Learned work data updated',
        wantToLearnAdded: 'Work added to your study list!',
        congratsLearned: '🎉 Congratulations! Work marked as learned!',

        // Error messages - handleSubmit
        saveError: 'Error saving. Please try again.',
        updateError: 'Error updating',
        updateVideoError: 'Error updating with video',

        // Transfer messages - handleConfirmTransfer
        transferSuccess:
          '🎉 Congratulations! Work transferred to "Already Learned"!',
        transferError: 'Error transferring work. Please try again.',
        transferring: 'Transferring...',

        // Removal messages - handleRemove
        wantToLearnRemoved: 'Work removed from your study list!',
        learnedRemoved: 'Work removed from learned list!',
        removeError: 'Error removing. Please try again.',

        // Video messages - handleDeleteVideo
        videoDeleteSuccess: 'Video deleted successfully!',
        videoDeleteError: 'Error deleting video. Please try again.',

        // Status messages
        uploadingStatus: 'Uploading video...',
        savingStatus: 'Saving...',

        // Console errors
        saveErrorConsole: 'Error saving:',
      },
    };

    const t = messages[language] || messages.pt;

    return { t, language };
  };

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

  // Handler para adicionar partitura
  const handleAddScore = () => {
    if (!workId || !workTitle || !composerName || !type) return;

    if (isInWorkPage) {
      startScoreSelection();
    } else {
      setShowScoreSelection(true);
    }
  };
  const modalTranslation = useModalTranslations();

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

      toast.success(modalTranslation.t.transferSuccess, {
        duration: 4000,
      });

      setShowTransferConfirm(false);
      closeModal();
    } catch {
      toast.error(modalTranslation.t.transferError);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteVideo = async () => {
    if (!workId) return;

    const success = await deleteVideo(workId);
    if (success) {
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

      toast.success(modalTranslation.t.videoDeleteSuccess, {
        icon: '🗑️',
        duration: 3000,
      });
    } else {
      toast.error(modalTranslation.t.videoDeleteError);
    }
  };

  // ✅ FUNÇÃO AUXILIAR PARA CRIAR LEARNED COM VÍDEO VIA API DIRETA
  const createLearnedWithVideo = async (
    workId: string,
    learnedData: any,
    videoFile: File
  ) => {
    try {
      // O vídeo sobe direto ao armazenamento e o item leva só o id dele.
      const videoAssetId = await uploadPerformanceVideo(workId, videoFile);

      const response = await toggleLearnedRequest(workId, 'add', {
        ...learnedData,
        isVideoPublic,
        videoAssetId,
        videoFileName: videoFile.name,
      });

      if (
        response.ok &&
        response.data?.success &&
        response.data.item &&
        user?.id
      ) {
        // Atualizar store com item completo (incluindo dados de vídeo)
        await toggleLearned(workId, user.id, learnedForm.mastery, {
          ...learnedData,
          isVideoPublic,
        });
        return true;
      } else {
        throw new Error(
          (!response.ok && response.error) || 'Erro ao criar learned item'
        );
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

          const response = await updateWantToLearnRequest(workId, dataToUpdate);

          if (response.ok) {
            const result = response.data;
            if (result.success && result.item) {
              addWantToLearn(result.item);
            }
            toast.success(modalTranslation.t.wantToLearnUpdated, {
              icon: '✏️',
              duration: 3000,
            });
          } else {
            throw new Error(modalTranslation.t.updateError);
          }
        } else {
          // LEARNED - com possível upload de vídeo
          if (selectedVideo) {
            const success = await updateVideo(workId, {
              ...learnedForm,
              selectedWorkScoreId: selectedWorkScore?.id,
            });

            if (success) {
              const response = await getLearnedRequest(workId);

              if (response.ok && response.data?.item) {
                addLearned(response.data.item);
              }

              toast.success(modalTranslation.t.learnedDataUpdatedWithVideo);
            } else {
              throw new Error(modalTranslation.t.updateVideoError);
            }
          } else {
            const response = await updateLearnedRequest(workId, {
              ...learnedForm,
              selectedWorkScoreId: selectedWorkScore?.id,
              isVideoPublic,
            });

            if (response.ok) {
              if (response.data?.success && response.data.item) {
                addLearned(response.data.item);
              }
              toast.success(modalTranslation.t.learnedDataUpdated, {
                icon: '✏️',
                duration: 3000,
              });
            } else {
              throw new Error(modalTranslation.t.updateError);
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
          toast.success(modalTranslation.t.wantToLearnAdded, {
            icon: '🎯',
            duration: 3000,
          });
        } else {
          const learnedData = {
            ...learnedForm,
            selectedWorkScoreId: selectedWorkScore?.id,
          };

          if (selectedVideo) {
            await createLearnedWithVideo(workId, learnedData, selectedVideo);
            removeVideo();
            toast.success(modalTranslation.t.congratsLearned);
          } else {
            await toggleLearned(workId, user.id, learnedForm.mastery, {
              ...learnedData,
              isVideoPublic,
            });
            toast.success(modalTranslation.t.congratsLearned);
          }
        }
      }

      closeModal();
    } catch (error) {
      console.error(modalTranslation.t.saveErrorConsole, error);
      toast.error(modalTranslation.t.saveError);
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
        toast.success(modalTranslation.t.wantToLearnRemoved, {
          icon: '🗑️',
          duration: 3000,
        });
      } else {
        await removeLearned(workId);
        toast.success(modalTranslation.t.learnedRemoved, {
          icon: '🗑️',
          duration: 3000,
        });
      }

      closeModal();
    } catch {
      toast.error(modalTranslation.t.removeError);
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
          icon: PiTarget,
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
          icon: PiCheckCircle,
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
        setPr
        processName={
          type === 'learned'
            ? t('mark_learned_title')
            : t('add_study_list_title')
        }
      >
        {/* Header */}
        <div className="px-0 md:px-6 py-4">
          <Inline gap={3}>
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                config.color === 'blue' ? 'bg-aviso' : 'bg-ok'
              } flex items-center justify-center shadow-theme-glow`}
            >
              <config.icon className="w-5 h-5 text-theme-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-theme-primary classical-title">
                {config?.title}
              </h2>
              <Text papel="rotulo" tom="suave" as="p">
                {config?.subtitle}
              </Text>
            </div>
          </Inline>
        </div>

        {/* Work Info */}
        <div className="px-0 md:px-6 py-4 classical-card !rounded-2xl !shadow-none !border-none !transform-none border-b border-theme-secondary">
          <Inline gap={3}>
            <PiMusicNotes className="w-5 h-5 text-theme-tertiary" />
            <div>
              <h3 className="font-semibold text-theme-primary">{workTitle}</h3>
              <Text papel="rotulo" tom="suave" as="p">
                {composerName}
              </Text>
              {instrumentName && (
                <Text papel="legenda" tom="fraco" as="p">
                  Instrumento: {instrumentName}
                </Text>
              )}
            </div>
          </Inline>
        </div>

        {/* Form Content */}
        <div className="px-0 md:px-6 py-6 space-y-6 overflow-y-auto">
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
                icon={PiHeart}
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
                  icon={PiCalendarBlank}
                  description={t('target_date_description')}
                >
                  <Input
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
                  icon={PiClock}
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

              <FormField label={t('difficulty_estimated')} icon={PiTrendUp}>
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
                icon={PiUsers}
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

              <FormField label={t('personal_notes')} icon={PiBookOpen}>
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
                <FormField
                  label={t('study_start_modal')}
                  icon={PiCalendarBlank}
                >
                  <Input
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
                  icon={PiClock}
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
                <FormField label={t('real_difficulty')} icon={PiTrendUp}>
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
                icon={PiTarget}
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
                icon={PiMedal}
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
                <Inline gap={3}>
                  <Checkbox
                    id="wouldRecommend"
                    checked={learnedForm.wouldRecommend}
                    onChange={(e) =>
                      updateLearnedForm({ wouldRecommend: e.target.checked })
                    }
                    className="w-4 h-4 text-ok border-theme-secondary rounded focus:ring-ouro"
                  />
                  <label
                    htmlFor="wouldRecommend"
                    className="text-sm font-medium text-theme-secondary cursor-pointer"
                  >
                    {t('would_recommend')}
                  </label>
                </Inline>

                <Inline gap={3}>
                  <Checkbox
                    id="publicPerformance"
                    checked={learnedForm.publicPerformance}
                    onChange={(e) =>
                      updateLearnedForm({ publicPerformance: e.target.checked })
                    }
                    className="w-4 h-4 text-ok border-theme-secondary rounded focus:ring-ouro"
                  />
                  <label
                    htmlFor="publicPerformance"
                    className="text-sm font-medium text-theme-secondary cursor-pointer"
                  >
                    {t('public_performance_modal')}
                  </label>
                </Inline>
              </div>

              <FormField label={t('general_notes')} icon={PiBookOpen}>
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
            <div className="border-2 border-dashed border-theme-secondary rounded-xl p-6 bg-sup-elevada">
              <div className="flex items-center justify-between mb-4">
                <Inline gap={3}>
                  <div className="w-8 h-8 bg-aviso rounded-xl flex items-center justify-center">
                    <PiTarget className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-theme-primary">
                      {t('learning_progress_title')}
                    </h3>
                    <Text papel="rotulo" tom="suave" as="p">
                      {currentProgress}
                      {t('progress_complete')}
                    </Text>
                  </div>
                </Inline>

                <Inline
                  as="button"
                  gap={2}
                  onClick={() => setShowProgressModal(true)}
                  className="btn-classical-secondary"
                >
                  <PiPencilLine className="w-4 h-4" />
                  <Text papel="rotulo" tom="forte">
                    {t('mark_progress_button')}
                  </Text>
                </Inline>
              </div>

              {/* Barra de progresso */}
              <div className="mb-4">
                <div className="w-full bg-theme-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      currentProgress >= 100
                        ? 'bg-ok'
                        : currentProgress >= 50
                          ? 'bg-aviso'
                          : 'bg-atencao'
                    }`}
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ✅ NOVA SEÇÃO DE VÍDEO - LAYOUT MELHORADO */}
          {type === 'learned' && (
            <div className="border-2 border-dashed border-theme-secondary rounded-xl p-6 bg-sup-elevada">
              <div className="flex items-center justify-between mb-4">
                <Inline gap={3}>
                  <div className="w-8 h-8 fill-ouro rounded-xl flex items-center justify-center">
                    <PiVideoCamera className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-theme-primary">
                      {t('performance_video_title')}
                    </h3>
                    <Text papel="rotulo" tom="suave" as="p">
                      {displayVideo ? t('video_added') : t('no_video_added')}
                    </Text>
                  </div>
                </Inline>
              </div>

              {displayVideo ? (
                /* Mostrar vídeo (existente ou novo) */
                <Stack>
                  {/* Informações do vídeo */}
                  <div className="bg-theme-elevated rounded-xl px-4">
                    <div className="flex items-center justify-between mb-4">
                      <Inline gap={3}>
                        <div>
                          <h4 className="font-semibold text-theme-primary text-sm">
                            {displayVideoName}
                          </h4>
                          <Text papel="legenda" tom="fraco" as="p">
                            {displayVideoSize &&
                              formatFileSize(displayVideoSize)}
                            {isVideoPublic
                              ? ` • ${t('public_label')}`
                              : ` • ${t('private_label')}`}
                          </Text>
                        </div>
                      </Inline>
                      {currentLearnedItem?.videoUrl && (
                        <button
                          onClick={handleDeleteVideo}
                          className="text-erro hover:text-erro/80 text-sm"
                        >
                          <PiTrashSimple className="w-4 h-4" />
                          <NomeAcao acao="excluir" />
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
                      className="text-sm text-theme-tertiary hover:text-ouro-texto cursor-pointer underline transition-colors duration-200"
                    >
                      {t('replace_video')}
                    </label>
                  </div>
                </Stack>
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
                    className="w-full border-2 border-dashed border-theme-secondary hover:border-ouro rounded-xl p-4 text-center transition-all duration-300 hover:bg-ouro/5 group cursor-pointer block"
                  >
                    <Stack gap={2} className="items-center">
                      <div className="w-12 h-12 shadow-md border-ouro/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <PiPlus className="w-6 h-6 text-brand-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-theme-primary">
                          {t('add_video_title')}
                        </p>
                        <Text papel="rotulo" tom="suave" as="p">
                          {t('video_formats_info')}
                        </Text>
                      </div>
                    </Stack>
                  </label>
                </div>
              )}

              {/* Configurações de privacidade */}
              <div className="mt-4">
                <Inline gap={3}>
                  <Checkbox
                    label={t('make_video_public')}
                    id="videoPublic"
                    checked={isVideoPublic}
                    onChange={(e) => setIsVideoPublic(e.target.checked)}
                  />
                </Inline>
              </div>

              {/* Error display */}
              {uploadError && (
                <Inline
                  gap={2}
                  className="mt-4 p-3 border border-erro rounded-lg"
                >
                  <PiWarningCircle className="w-4 h-4 text-erro" />
                  <span className="text-erro text-sm">{uploadError}</span>
                  <button
                    onClick={clearVideoError}
                    className="ml-auto text-erro hover:text-erro/80"
                  >
                    <PiX className="w-4 h-4" />
                    <NomeAcao acao="fechar" />
                  </button>
                </Inline>
              )}
            </div>
          )}

          {/* Seção de Partitura */}
          <div className="border-2 border-dashed border-theme-secondary rounded-xl p-6 bg-sup-elevada">
            <div className="flex items-center justify-between mb-4">
              <Inline gap={3}>
                <div className="w-8 h-8 fill-ouro rounded-xl flex items-center justify-center">
                  <PiFileText className="w-4 h-4 text-theme-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-theme-primary">
                    {t('study_score_title')}
                  </h3>
                  <Text papel="rotulo" tom="suave" as="p">
                    {selectedWorkScore
                      ? t('score_linked')
                      : t('no_score_selected')}
                  </Text>
                </div>
              </Inline>
            </div>

            {selectedWorkScore ? (
              <div className="bg-theme-elevated rounded-xl p-4 border border-theme-primary">
                <div className="flex items-center justify-between">
                  <Inline gap={3}>
                    <div className="w-10 h-10 fill-ouro rounded-lg flex items-center justify-center">
                      <PiMusicNotes className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-theme-primary text-sm">
                        {selectedWorkScore.title}
                      </h4>
                      <Text papel="legenda" tom="fraco" as="p">
                        {t('source_label')} {selectedWorkScore.source}
                        {selectedWorkScore.fileSize &&
                          ` • ${selectedWorkScore.fileSize}`}
                        {selectedWorkScore.pageCount &&
                          ` • ${selectedWorkScore.pageCount} ${t(
                            'pages_label'
                          )}`}
                        {selectedWorkScore.type &&
                          ` • ${selectedWorkScore.type}`}
                      </Text>
                    </div>
                  </Inline>
                  <Inline gap={4}>
                    {selectedWorkScore.downloadUrl && (
                      <Inline
                        as="a"
                        gap={2}
                        href={selectedWorkScore.downloadUrl}
                        target="_blank"
                        title={t('download_button')}
                        className="btn-classical-secondary-sm text-ouro-texto border-ouro/30 hover:bg-ouro/10"
                      >
                        <PiDownloadSimple className="w-5 h-5 text-theme-primary" />
                      </Inline>
                    )}

                    <Inline
                      as="button"
                      gap={2}
                      title={
                        isCurrentlyActive
                          ? t('change_button')
                          : t('edit_change_button')
                      }
                      onClick={handleAddScore}
                      className="btn-classical-secondary-sm"
                    >
                      <PiPencilLine className="w-5 h-5 text-theme-primary" />
                    </Inline>
                    <button
                      title={t('remove_button')}
                      onClick={handleRemoveScore}
                      className="btn-classical-outline-sm text-erro border-erro hover:bg-erro hover:text-texto"
                    >
                      <PiX className="w-5 h-5 text-theme-primary" />
                    </button>
                  </Inline>
                </div>

                {!isCurrentlyActive &&
                  oppositeItem?.selectedWorkScore?.id ===
                    selectedWorkScore.id && (
                    <div className="mt-3  rounded-lg">
                      <Inline gap={2}>
                        <div className="w-4 h-4 bg-ok rounded-full flex items-center justify-center">
                          <span className="text-xs">💡</span>
                        </div>
                        <span className="text-xs md:text-sm text-ok font-medium">
                          {t('score_suggestion')} &quot;
                          {type === 'want-to-learn'
                            ? t('already_learned')
                            : t('want_to_learn')}
                          &quot;
                        </span>
                      </Inline>
                    </div>
                  )}
              </div>
            ) : (
              <button
                onClick={handleAddScore}
                className="w-full border-2 border-dashed border-theme-secondary hover:border-ouro rounded-xl p-4 text-center transition-all duration-300 hover:bg-ouro/5 group"
              >
                <Stack gap={2} className="items-center">
                  <div className="w-12 h-12 bg-ouro/20 border-2 border-ouro/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <PiPlus className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-theme-primary">
                      {isCurrentlyActive
                        ? t('edit_score_button')
                        : t('add_score_button')}
                    </p>
                    <Text papel="rotulo" tom="suave" as="p">
                      {isInWorkPage
                        ? t('select_score_description')
                        : t('choose_score_description')}
                    </Text>
                  </div>
                </Stack>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-0 md:px-6 py-4 border-t border-theme-secondary">
          {/* Mobile Layout - Stack vertical */}
          <div className="block md:hidden space-y-3">
            {/* Botão Principal - Sempre em destaque */}
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting || isUploading}
              rightIcon={config?.emoji}
              disabled={isUploading}
              className="w-full"
            >
              {isSubmitting || isUploading
                ? type === 'learned' && selectedVideo
                  ? t('uploading_status')
                  : t('saving_status')
                : isCurrentlyActive
                  ? t('update_button')
                  : t('save_button')}
            </Button>

            {/* Botões Secundários - Quando editando */}
            {isCurrentlyActive && !isSubmitting && !isUploading && (
              <Stack gap={2}>
                {type === 'want-to-learn' && (
                  <Button
                    variant="outline"
                    onClick={handleTransferToLearned}
                    className="w-full"
                  >
                    {t('mark_as_learned')}
                  </Button>
                )}

                <Button
                  variant="delete"
                  leftIcon={<PiTrashSimple />}
                  onClick={handleRemove}
                  className="w-full"
                >
                  {t('delete_button')}
                </Button>
              </Stack>
            )}
          </div>

          {/* Desktop Layout - Horizontal */}
          <div
            className={`hidden md:flex items-center ${
              (isCurrentlyActive && !isSubmitting && !isUploading) ||
              (type === 'want-to-learn' && isCurrentlyActive)
                ? 'justify-between'
                : 'justify-end'
            } space-x-3`}
          >
            {/* Botões de ação à esquerda */}
            {isCurrentlyActive && !isSubmitting && !isUploading && (
              <Inline gap={3}>
                <Button
                  variant="delete"
                  leftIcon={<PiTrashSimple />}
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
              </Inline>
            )}

            {/* Botão principal à direita */}
            <Inline gap={3}>
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting || isUploading}
                rightIcon={config?.emoji}
                disabled={isUploading}
              >
                {isSubmitting || isUploading
                  ? type === 'learned' && selectedVideo
                    ? t('uploading_status')
                    : t('saving_status')
                  : isCurrentlyActive
                    ? t('update_button')
                    : t('save_button')}
              </Button>
            </Inline>
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
        <div className="p-4 px-0 md:p-6">
          <Inline gap={3} className="mb-4">
            <div className="w-12 h-12 bg-ok rounded-xl flex items-center justify-center">
              <PiArrowRight className="w-6 h-6 text-theme-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-theme-primary">
                {t('transfer_learned_title')}
              </h3>
              <Text papel="rotulo" tom="suave" as="p">
                {t('transfer_learned_subtitle')}
              </Text>
            </div>
          </Inline>

          <Card nivel={2} densidade="compacta" className="rounded-xl mb-6">
            <p className="text-theme-primary">
              <strong>&quot;{workTitle}&quot;</strong>{' '}
              {t('transfer_learned_description')}
            </p>

            <Text papel="rotulo" tom="suave" as="div" className="mt-3">
              <ul className="space-y-1">
                <li>• {t('transfer_priority_mastery')}</li>
                <li>• {t('transfer_difficulty_notes')}</li>
                <li>• {t('transfer_score_preserved')}</li>
              </ul>
            </Text>
          </Card>

          <div className="flex items-center justify-between ">
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
          maxWidth="lg"
          setPr
        >
          <div className="p-2 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-theme-primary">
                  {t('mark_learning_progress_title')}
                </h3>
                <Text papel="rotulo" tom="suave" as="p">
                  {t('mark_learning_progress_subtitle')}
                </Text>
              </div>
            </div>

            {/* Barra de progresso */}
            <Stack gap={2} className="mb-6">
              <Inline gap={4}>
                <div className="flex-1">
                  <div className="w-full bg-theme-secondary rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        currentProgress >= 100
                          ? 'bg-ok'
                          : currentProgress >= 50
                            ? 'bg-aviso'
                            : 'bg-atencao'
                      }`}
                      style={{ width: `${currentProgress}%` }}
                    />
                  </div>
                </div>
                <span className="text-lg font-bold text-theme-primary">
                  {currentProgress}%
                </span>
              </Inline>
              <Text papel="rotulo" tom="fraco" as="p">
                {t('click_milestones_instruction')}
              </Text>
            </Stack>

            {/* Lista de milestones */}
            <div className="space-y-3 max-h-96 pr-4 classical-scrollbar md:pr-2 overflow-y-auto">
              {availableMilestones.map((milestone) => {
                const Icon = milestone.icon;
                const isCompleted = progressMilestones[milestone.key];

                return (
                  <div
                    key={milestone.key}
                    className={`flex items-center space-x-3 p-4 rounded-xl transition-all cursor-pointer border-2 ${
                      isCompleted
                        ? 'border-color-primary '
                        : 'border-theme-secondary hover:border-ouro/50 hover:bg-ouro/5'
                    }`}
                    onClick={() => handleMilestoneToggle(milestone.key)}
                  >
                    <div className={`flex-shrink-0 ${milestone.color}`}>
                      {isCompleted ? (
                        <PiCheckCircle className="w-6 h-6 text-ok" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-theme-primary">
                        {t(milestone.labelKey)}
                      </div>
                      <Text papel="rotulo" tom="fraco" as="div">
                        +{milestone.weight}
                        {t('progress_percentage')}
                      </Text>
                    </div>
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <PiCheckCircle className="w-5 h-5 text-brand-primary" />
                      ) : (
                        <PiCircle className="w-5 h-5 text-theme-tertiary" />
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
                {t('confirm_progress_button')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default LearningModal;
