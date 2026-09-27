// app/annotations/components/UserAnnotationCard.tsx - COM LAYOUT CARD/LIST
'use client';

import { useState } from 'react';
import {
  PiArrowSquareOut,
  PiBookOpen,
  PiChatCenteredText,
  PiClock,
  PiDotsThree,
  PiEye,
  PiMapPin,
  PiMedal,
  PiMusicNotes,
  PiPencilLine,
  PiSealCheck,
  PiSpinnerGap,
  PiStack,
  PiTarget,
  PiThumbsUp,
  PiTrash,
  PiUser,
} from 'react-icons/pi';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

import { ViewMode } from '@/app/components/ViewModeToggle';
import { useAuth } from '@/app/hooks/useAuth';
import {
  useAnnotationsStore,
  WorkAnnotation,
  AnnotationCategory,
} from '@/app/stores/useAnnotationsStore';
import CreateAnnotationModal from '@/app/components/Annotations/CreateAnnotationModal';
import Image from '@/app/components/SmartImage';
import ConfirmDeleteModal from '../DeleteAnnotationModal';
import { useTranslation } from '@/app/context/TranslationContext';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';

interface UserAnnotationCardProps {
  annotation: WorkAnnotation;
  viewMode: ViewMode;
  onUpdate?: () => void;
}

export default function UserAnnotationCard({
  annotation,
  viewMode,
}: UserAnnotationCardProps) {
  const { t, language } = useTranslation({ sections: ['pages/annotations'] });
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Usar o store para operações de CRUD
  const { deleteAnnotation, loading, getAnnotationById } =
    useAnnotationsStore();

  // Verificar se há uma versão mais recente no store
  const storeAnnotation = getAnnotationById(annotation.id);
  const currentAnnotation = storeAnnotation || annotation;

  const isOwner = user?.id === currentAnnotation.userId;
  const isUpdating =
    loading.update.has(currentAnnotation.id) || storeAnnotation?.isUpdating;
  const isDeleting = loading.update.has(currentAnnotation.id);

  // Verificar se work existe antes de usar
  const workInfo = currentAnnotation.work || annotation.work;
  if (!workInfo) {
    console.warn('Anotação sem informações da obra:', currentAnnotation.id);
    return null;
  }

  // Category configuration with translations
  const getCategoryConfig = (category: string) => {
    const configs = {
      TECHNIQUE: {
        label: t('category_technique'),
        icon: PiTarget,
        color: '',
        bgColor: '',
      },
      INTERPRETATION: {
        label: t('category_interpretation'),
        icon: PiMusicNotes,
        color: '',
        bgColor: '',
      },
      PRACTICE_TIP: {
        label: t('category_practice_tip'),
        icon: PiBookOpen,
        color: '',
        bgColor: '',
      },
      THEORY: {
        label: t('category_theory'),
        icon: PiStack,
        color: '',
        bgColor: '',
      },
      PERFORMANCE: {
        label: t('category_performance'),
        icon: PiMusicNotes,
        color: '',
        bgColor: 'text-ouro-texto',
      },
      HISTORICAL: {
        label: t('category_historical'),
        icon: PiMedal,
        color: '',
        bgColor: '',
      },
      GENERAL: {
        label: t('category_general'),
        icon: PiChatCenteredText,
        color: '',
        bgColor: 'text-theme-primary',
      },
    };
    return configs[category as keyof typeof configs] || configs.GENERAL;
  };

  const getDifficultyConfig = (difficulty: string) => {
    const configs = {
      BEGINNER: {
        label: t('difficulty_beginner'),
        bgColor: '',
      },
      INTERMEDIATE: {
        label: t('difficulty_intermediate'),
        bgColor: '',
      },
      ADVANCED: {
        label: t('difficulty_advanced'),
        bgColor: '',
      },
      ALL_LEVELS: {
        label: t('difficulty_all_levels'),
        bgColor: 'text-theme-primary',
      },
    };
    return configs[difficulty as keyof typeof configs] || configs.ALL_LEVELS;
  };

  const categoryConfig = getCategoryConfig(currentAnnotation.category);
  const difficultyConfig = getDifficultyConfig(currentAnnotation.difficulty);
  const CategoryIcon = categoryConfig.icon;

  const handleDeleteConfirm = async () => {
    console.log('🗑️ Iniciando deleção da anotação:', annotation.id);

    try {
      const success = await deleteAnnotation(annotation.id);

      if (success) {
        toast.success('Anotação deletada com sucesso!', {
          icon: '🗑️',
        });
        setShowDeleteModal(false);
        console.log('✅ Anotação deletada com sucesso:', annotation.id);
      } else {
        toast.error('Erro ao deletar anotação. Tente novamente.');
        console.log('❌ Falha ao deletar anotação:', annotation.id);
      }
    } catch (error) {
      console.error('Erro inesperado ao deletar anotação:', error);
      toast.error('Erro inesperado. Tente novamente.');
    }
  };

  const formatMeasureRange = () => {
    if (currentAnnotation.scope === 'SPECIFIC_MEASURE') {
      if (
        currentAnnotation.measureStart &&
        currentAnnotation.measureEnd &&
        currentAnnotation.measureStart !== currentAnnotation.measureEnd
      ) {
        return `${t('user_annotation_card_measures')} ${
          currentAnnotation.measureStart
        }-${currentAnnotation.measureEnd}`;
      } else if (currentAnnotation.measureStart) {
        return `${t('user_annotation_card_measure')} ${
          currentAnnotation.measureStart
        }`;
      }
    } else if (
      currentAnnotation.scope === 'SECTION' &&
      currentAnnotation.section
    ) {
      return currentAnnotation.section;
    } else if (
      currentAnnotation.scope === 'MOVEMENT' &&
      currentAnnotation.movement
    ) {
      return currentAnnotation.movement;
    }
    return null;
  };

  // Função para converter UserAnnotation para WorkAnnotation
  const convertToWorkAnnotation = (): WorkAnnotation => {
    return {
      id: currentAnnotation.id,
      userId: currentAnnotation.userId,
      workId: currentAnnotation.workId,
      title: currentAnnotation.title,
      content: currentAnnotation.content,
      category: currentAnnotation.category as AnnotationCategory,
      scope: currentAnnotation.scope as any,
      measureStart: currentAnnotation.measureStart,
      measureEnd: currentAnnotation.measureEnd,
      movement: currentAnnotation.movement,
      section: currentAnnotation.section,
      pageNumber: currentAnnotation.pageNumber,
      hand: currentAnnotation.hand,
      voice: currentAnnotation.voice,
      instrument: currentAnnotation.instrument,
      difficulty: currentAnnotation.difficulty as any,
      tags: currentAnnotation.tags,
      isPublic: currentAnnotation.isPublic,
      isVerified: currentAnnotation.isVerified,
      helpfulCount: currentAnnotation.helpfulCount,
      viewCount: currentAnnotation.viewCount,
      createdAt: currentAnnotation.createdAt,
      updatedAt: currentAnnotation.updatedAt,
      user: {
        id: currentAnnotation.userId,
        firstName: t('user_annotation_card_you'),
        lastName: '',
      },
      work: workInfo,
      _count: currentAnnotation._count,
      userVote: null,
    };
  };

  const measureInfo = formatMeasureRange();
  const shouldTruncate = currentAnnotation.content.length > 300;
  const displayContent =
    showMore || !shouldTruncate
      ? currentAnnotation.content
      : currentAnnotation.content.substring(0, 300) + '...';

  // Indicador visual para anotações otimísticas
  const isOptimistic = storeAnnotation?.isOptimistic;

  // Verificar se viewMode é table (como string literal)
  if (viewMode === ('table' as ViewMode)) {
    return (
      <div
        className={`classical-card-2 overflow-hidden group relative ${
          isOptimistic ? 'opacity-70' : ''
        } ${isUpdating ? 'pointer-events-none' : ''}`}
      >
        {/* Loading overlay para updates */}
        {isUpdating && (
          <div className="absolute inset-0 backdrop-blur-sm z-20 flex items-center justify-center">
            <Inline gap={3} className="rounded-xl px-4 py-2 border">
              <PiSpinnerGap className="w-4 h-4 animate-spin text-ouro-texto" />
              <Text papel="rotulo" tom="forte" className="font-medium">
                {isOptimistic
                  ? t('user_annotation_card_saving_loading')
                  : t('user_annotation_card_updating_loading')}
              </Text>
            </Inline>
          </div>
        )}

        <div className="p-4">
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Título e Obra */}
            <Stack gap={1} className="col-span-5">
              <h3 className="font-semibold text-theme-primary text-sm truncate">
                {currentAnnotation.title}
                {currentAnnotation.isVerified && (
                  <PiSealCheck className="w-4 h-4 inline ml-2" />
                )}
                {isOptimistic && (
                  <PiSpinnerGap className="w-3 h-3 animate-spin inline ml-2" />
                )}
              </h3>
              <Text papel="legenda" tom="suave" as="div">
                <Link
                  href={`/works/${workInfo.id}`}
                  className="transition-colors"
                >
                  {workInfo.title}
                </Link>
                <span className="text-theme-tertiary">
                  {' '}
                  - {workInfo.composer.name}
                </span>
              </Text>
            </Stack>

            {/* Categoria */}
            <div className="col-span-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${categoryConfig.bgColor} flex items-center space-x-1`}
              >
                <CategoryIcon className="w-3 h-3" />
                <span className="hidden sm:inline">{categoryConfig.label}</span>
              </span>
            </div>

            {/* Dificuldade */}
            <div className="col-span-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${difficultyConfig.bgColor}`}
              >
                {difficultyConfig.label}
              </span>
            </div>

            {/* Stats */}
            <Text
              papel="legenda"
              tom="fraco"
              as="div"
              className="col-span-2 space-y-1"
            >
              <Inline gap={1}>
                <PiThumbsUp className="w-3 h-3" />
                <span>{currentAnnotation.helpfulCount}</span>
              </Inline>
              <Inline gap={1}>
                <PiEye className="w-3 h-3" />
                <span>{currentAnnotation.viewCount}</span>
              </Inline>
            </Text>

            {/* Actions */}
            <div className="col-span-1 flex justify-end">
              {isOwner && !isOptimistic && (
                <div className="relative">
                  <button
                    onClick={() => setShowActions(!showActions)}
                    disabled={isUpdating}
                    className={`w-6 h-6 rounded-lg bg-theme-elevated border flex items-center justify-center text-theme-tertiary transition-all opacity-0 group-hover:opacity-100 ${
                      isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <PiDotsThree className="w-3 h-3" />
                    <NomeAcao acao="maisOpcoes" />
                  </button>

                  {showActions && !isUpdating && (
                    <div className="absolute right-0 top-7 bg-theme-elevated border rounded-xl shadow-theme-glow z-10 py-2 min-w-[100px]">
                      <Inline
                        as="button"
                        gap={2}
                        onClick={() => {
                          setShowEditModal(true);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-1 text-left text-xs text-theme-primary transition-colors"
                      >
                        <PiPencilLine className="w-3 h-3" />
                        <span>{t('user_annotation_card_edit')}</span>
                      </Inline>
                      <Inline
                        as="button"
                        gap={2}
                        onClick={() => {
                          setShowDeleteModal(true);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-1 text-left text-xs transition-colors"
                      >
                        <PiTrash className="w-3 h-3" />
                        <span>{t('user_annotation_card_delete')}</span>
                      </Inline>
                    </div>
                  )}
                </div>
              )}
              <Link
                href={`/works/${workInfo.id}`}
                className="w-6 h-6 rounded-lg bg-theme-elevated border flex items-center justify-center text-theme-tertiary transition-all ml-2"
              >
                <PiArrowSquareOut className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Card mode compacto (quando viewMode === 'cards')
  if (viewMode === 'cards') {
    return (
      <>
        <div
          className={`classical-card p-6 group transition-all relative ${
            isOptimistic ? 'opacity-70' : ''
          } ${isUpdating ? 'pointer-events-none' : ''}`}
        >
          {/* Loading overlay para updates */}
          {isUpdating && (
            <div className="absolute inset-0 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl">
              <Inline gap={3} className="rounded-xl px-4 py-2 border">
                <PiSpinnerGap className="w-4 h-4 animate-spin text-ouro-texto" />
                <Text papel="rotulo" tom="forte" className="font-medium">
                  {isOptimistic
                    ? t('user_annotation_card_saving_loading')
                    : t('user_annotation_card_updating_loading')}
                </Text>
              </Inline>
            </div>
          )}

          <div className="flex-1">
            <Link
              href={`/works/${workInfo.id}`}
              className="block transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="inline-flex items-center py-0.5">
                  <PiChatCenteredText className="w-3 h-3 mr-1" />
                  <h3 className="font-bold ml-1 text-theme-primary classical-title transition-colors duration-300 flex-1 line-clamp-2">
                    {currentAnnotation.title}
                    {currentAnnotation.isVerified && (
                      <PiSealCheck className="w-4 h-4 inline ml-2" />
                    )}
                    {isOptimistic && (
                      <PiSpinnerGap className="w-3 h-3 animate-spin inline ml-2" />
                    )}
                  </h3>
                </div>
              </div>

              {/* Informações da obra */}
              <Stack gap={1} className="mb-3">
                <Inline gap={2}>
                  <PiMusicNotes className="w-3 h-3" />
                  <span className="text-sm transition-colors font-medium">
                    {workInfo.title}
                  </span>
                </Inline>

                <Inline gap={2}>
                  <PiUser className="w-3 h-3 text-theme-tertiary" />
                  <Text papel="rotulo" tom="fraco">
                    {workInfo.composer.fullName}
                  </Text>
                </Inline>
              </Stack>

              {/* Content preview */}
              <Text
                papel="rotulo"
                tom="suave"
                as="p"
                className="line-clamp-3 mb-3"
              >
                {currentAnnotation.content}
              </Text>

              {/* Badges compactos */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium border ${categoryConfig.bgColor} flex items-center space-x-1`}
                >
                  <CategoryIcon className="w-2.5 h-2.5" />
                  <span>{categoryConfig.label}</span>
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium border ${difficultyConfig.bgColor}`}
                >
                  {difficultyConfig.label}
                </span>

                {!currentAnnotation.isPublic && (
                  <Inline
                    as="span"
                    gap={1}
                    className="px-2 py-0.5 rounded-full text-xs font-medium border"
                  >
                    <PiEye className="w-2.5 h-2.5" />
                    <span>{t('user_annotation_card_private')}</span>
                  </Inline>
                )}

                {measureInfo && (
                  <Inline
                    as="span"
                    gap={1}
                    className="px-2 py-0.5 rounded-full text-xs font-medium border text-theme-primary"
                  >
                    <PiMapPin className="w-2.5 h-2.5" />
                    <span>{measureInfo}</span>
                  </Inline>
                )}
              </div>

              {/* Stats compactas */}
              <Inline gap={4} className="text-xs text-theme-tertiary mb-3">
                <Inline gap={1}>
                  <PiThumbsUp className="w-3 h-3" />
                  <span>{currentAnnotation.helpfulCount}</span>
                </Inline>
                <Inline gap={1}>
                  <PiEye className="w-3 h-3" />
                  <span>{currentAnnotation.viewCount}</span>
                </Inline>
                <Inline gap={1}>
                  <PiClock className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(
                      new Date(currentAnnotation.createdAt),
                      {
                        addSuffix: true,
                        locale: language === 'pt' ? ptBR : enUS,
                      }
                    )}
                  </span>
                </Inline>
              </Inline>
            </Link>

            {/* Actions menu */}
            {isOwner && !isOptimistic && (
              <div className="absolute top-4 right-4 flex space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="relative">
                  <button
                    onClick={() => setShowActions(!showActions)}
                    disabled={isUpdating}
                    className={`w-6 h-6 rounded-lg bg-theme-elevated border flex items-center justify-center text-theme-tertiary transition-all ${
                      isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <PiDotsThree className="w-3 h-3" />
                    <NomeAcao acao="maisOpcoes" />
                  </button>

                  {showActions && !isUpdating && (
                    <div className="absolute right-0 top-7 bg-theme-elevated border rounded-xl shadow-theme-glow z-10 py-2 min-w-[100px]">
                      <Inline
                        as="button"
                        gap={2}
                        onClick={() => {
                          setShowEditModal(true);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-1 text-left text-xs text-theme-primary transition-colors"
                      >
                        <PiPencilLine className="w-3 h-3" />
                        <span>{t('user_annotation_card_edit')}</span>
                      </Inline>
                      <Inline
                        as="button"
                        gap={2}
                        onClick={() => {
                          setShowDeleteModal(true);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-1 text-left text-xs transition-colors"
                      >
                        <PiTrash className="w-3 h-3" />
                        <span>{t('user_annotation_card_delete')}</span>
                      </Inline>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer compacto */}
          <div className="mt-4 pt-4 border-t border-theme-secondary flex items-center justify-end">
            <Link
              href={`/works/${workInfo.id}`}
              className="text-ouro-texto text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <span>{t('user_annotation_card_see_work')}</span>
              <PiArrowSquareOut className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Modals com conversão de tipos */}
        <CreateAnnotationModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          workId={currentAnnotation.workId}
          workTitle={workInfo.title}
          composerName={workInfo.composer.fullName}
          editingAnnotation={convertToWorkAnnotation()}
        />

        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          isLoading={isDeleting}
          annotationTitle={currentAnnotation.title}
        />
      </>
    );
  }

  // List mode (padrão) - layout completo
  return (
    <>
      <div
        className={`classical-card-2 overflow-hidden group relative ${
          isOptimistic ? 'opacity-70' : ''
        } ${isUpdating ? 'pointer-events-none' : ''}`}
      >
        {/* Loading overlay para updates */}
        {isUpdating && (
          <div className="absolute inset-0 backdrop-blur-sm z-20 flex items-center justify-center">
            <Inline gap={3} className="rounded-xl px-4 py-2 border">
              <PiSpinnerGap className="w-4 h-4 animate-spin text-ouro-texto" />
              <Text papel="rotulo" tom="forte" className="font-medium">
                {isOptimistic
                  ? t('user_annotation_card_saving_loading')
                  : t('user_annotation_card_updating_loading')}
              </Text>
            </Inline>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3 flex-1">
              {/* Avatar/Icon */}
              <div className="flex-shrink-0">
                {annotation.user.image ? (
                  <Image
                    width={25}
                    height={25}
                    src={annotation.user.image}
                    alt={
                      annotation.user.firstName ||
                      annotation.user.username ||
                      'Usuário'
                    }
                    className="w-10 h-10 rounded-xl object-cover border-2"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                    <PiUser className="w-5 h-5 text-theme-primary" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Inline gap={2} className="mb-1">
                  <h3 className="text-lg font-semibold text-theme-primary classical-title truncate">
                    {currentAnnotation.title}
                  </h3>
                  {currentAnnotation.isVerified && (
                    <Inline gap={1} className="">
                      <PiSealCheck className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        {t('user_annotation_card_verified')}
                      </span>
                    </Inline>
                  )}
                  {isOptimistic && (
                    <Inline gap={1} className="">
                      <PiSpinnerGap className="w-3 h-3 animate-spin" />
                      <span className="text-xs font-medium">
                        {t('user_annotation_card_saving')}
                      </span>
                    </Inline>
                  )}
                </Inline>

                <Inline gap={4} className="text-sm text-theme-secondary mb-2">
                  <Link
                    href={`/works/${workInfo.id}`}
                    className="font-medium transition-colors"
                  >
                    {workInfo.title}
                  </Link>
                  <span className="text-theme-tertiary">
                    {workInfo.composer.fullName}
                  </span>
                </Inline>

                <Inline gap={2} className="text-xs text-theme-tertiary">
                  <PiClock className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(
                      new Date(currentAnnotation.createdAt),
                      {
                        addSuffix: true,
                        locale: language === 'pt' ? ptBR : enUS,
                      }
                    )}
                  </span>
                </Inline>
              </div>
            </div>

            {/* Actions menu */}
            {isOwner && !isOptimistic && (
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  disabled={isUpdating}
                  className={`w-8 h-8 rounded-lg bg-theme-elevated border flex items-center justify-center text-theme-tertiary transition-all opacity-0 group-hover:opacity-100 ${
                    isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <PiDotsThree className="w-4 h-4" />
                  <NomeAcao acao="maisOpcoes" />
                </button>

                {showActions && !isUpdating && (
                  <div className="absolute right-0 top-9 bg-theme-elevated border rounded-xl shadow-theme-glow z-10 py-2 min-w-[120px]">
                    <Inline
                      as="button"
                      gap={2}
                      onClick={() => {
                        setShowEditModal(true);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-theme-primary transition-colors"
                    >
                      <PiPencilLine className="w-3 h-3" />
                      <span>{t('user_annotation_card_edit')}</span>
                    </Inline>
                    <Inline
                      as="button"
                      gap={2}
                      onClick={() => {
                        setShowDeleteModal(true);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm transition-colors"
                    >
                      <PiTrash className="w-3 h-3" />
                      <span>{t('user_annotation_card_delete')}</span>
                    </Inline>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryConfig.bgColor} flex items-center space-x-1`}
            >
              <CategoryIcon className="w-3 h-3" />
              <span>{categoryConfig.label}</span>
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyConfig.bgColor}`}
            >
              {difficultyConfig.label}
            </span>

            {!currentAnnotation.isPublic && (
              <Inline
                as="span"
                gap={1}
                className="px-3 py-1 rounded-full text-xs font-medium border"
              >
                <PiEye className="w-3 h-3" />
                <span>{t('user_annotation_card_private')}</span>
              </Inline>
            )}

            {measureInfo && (
              <Inline
                as="span"
                gap={1}
                className="px-3 py-1 rounded-full text-xs font-medium border text-theme-primary"
              >
                <PiMapPin className="w-3 h-3" />
                <span>{measureInfo}</span>
              </Inline>
            )}

            {currentAnnotation.pageNumber && (
              <Text
                papel="legenda"
                tom="forte"
                className="px-3 py-1 rounded-full font-medium border"
              >
                {t('user_annotation_card_page')} {currentAnnotation.pageNumber}
              </Text>
            )}
          </div>

          {/* Content */}
          <div className="mb-4">
            <p className="text-theme-primary leading-relaxed whitespace-pre-line">
              {displayContent}
            </p>

            {shouldTruncate && (
              <button
                onClick={() => setShowMore(!showMore)}
                className="mt-2 text-sm text-ouro-texto font-medium transition-colors"
              >
                {showMore
                  ? t('user_annotation_card_see_less')
                  : t('user_annotation_card_see_more')}
              </button>
            )}
          </div>

          {/* Tags */}
          {currentAnnotation.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {currentAnnotation.tags.map((tag, index) => (
                <Text
                  papel="legenda"
                  tom="suave"
                  key={index}
                  className="px-2 py-1 bg-theme-elevated border rounded-lg"
                >
                  #{tag}
                </Text>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-theme-secondary">
            {/* Stats */}
            <Inline gap={4} className="text-sm text-theme-tertiary">
              <Inline gap={1}>
                <PiThumbsUp className="w-4 h-4" />
                <span>{currentAnnotation.helpfulCount}</span>
              </Inline>
              <Inline gap={1}>
                <PiEye className="w-4 h-4" />
                <span>{currentAnnotation.viewCount}</span>
              </Inline>
            </Inline>

            {/* Link para a obra */}
            <Link
              href={`/works/${workInfo.id}`}
              className="btn-classical-secondary flex items-center space-x-2 text-sm"
            >
              <PiArrowSquareOut className="w-4 h-4" />
              <span>{t('user_annotation_card_see_work')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Modals com conversão de tipos */}
      <CreateAnnotationModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        workId={currentAnnotation.workId}
        workTitle={workInfo.title}
        composerName={workInfo.composer.fullName}
        editingAnnotation={convertToWorkAnnotation()}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        annotationTitle={currentAnnotation.title}
      />
    </>
  );
}
