// app/annotations/components/UserAnnotationCard.tsx - COM LAYOUT CARD/LIST
'use client';

import { useState } from 'react';
import {
  FiThumbsUp,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiMapPin,
  FiTarget,
  FiLayers,
  FiMusic,
  FiBookOpen,
  FiAward,
  FiMessageSquare,
  FiClock,
  FiUser,
  FiMoreHorizontal,
  FiLoader,
  FiExternalLink,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { MdVerified } from 'react-icons/md';

import { ViewMode } from '@/app/components/ViewModeToggle';
import { useAuth } from '@/app/hooks/useAuth';
import {
  useAnnotationsStore,
  WorkAnnotation,
  AnnotationCategory,
} from '@/app/stores/useAnnotationsStore';
import CreateAnnotationModal from '@/app/components/Annotations/CreateAnnotationModal';
import Image from 'next/image';
import ConfirmDeleteModal from '../DeleteAnnotationModal';
import { useTranslation } from '@/app/context/TranslationContext';
import { useLanguageStore } from '@/app/stores/useLanguageStore';

interface UserAnnotationCardProps {
  annotation: WorkAnnotation;
  viewMode: ViewMode;
  onUpdate?: () => void;
}

export default function UserAnnotationCard({
  annotation,
  viewMode,
}: UserAnnotationCardProps) {
  const { t } = useTranslation({ sections: ['pages/annotations'] });
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const { language } = useLanguageStore();
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
        icon: FiTarget,
        color: 'from-accent-red to-accent-purple',
        bgColor: 'bg-accent-red/10 border-accent-red/30 text-accent-red',
      },
      INTERPRETATION: {
        label: t('category_interpretation'),
        icon: GiMusicalNotes,
        color: 'from-accent-blue to-accent-purple',
        bgColor: 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue',
      },
      PRACTICE_TIP: {
        label: t('category_practice_tip'),
        icon: FiBookOpen,
        color: 'from-accent-green to-accent-blue',
        bgColor: 'bg-accent-green/10 border-accent-green/30 text-accent-green',
      },
      THEORY: {
        label: t('category_theory'),
        icon: FiLayers,
        color: 'from-accent-purple to-accent-blue',
        bgColor:
          'bg-accent-purple/10 border-accent-purple/30 text-accent-purple',
      },
      PERFORMANCE: {
        label: t('category_performance'),
        icon: FiMusic,
        color: 'from-brand-primary to-brand-secondary',
        bgColor:
          'bg-brand-primary/10 border-brand-primary/30 text-brand-primary',
      },
      HISTORICAL: {
        label: t('category_historical'),
        icon: FiAward,
        color: 'from-accent-purple to-accent-red',
        bgColor:
          'bg-accent-purple/10 border-accent-purple/30 text-accent-purple',
      },
      GENERAL: {
        label: t('category_general'),
        icon: FiMessageSquare,
        color: 'from-theme-primary to-theme-secondary',
        bgColor:
          'bg-theme-primary/10 border-theme-primary/30 text-theme-primary',
      },
    };
    return configs[category as keyof typeof configs] || configs.GENERAL;
  };

  const getDifficultyConfig = (difficulty: string) => {
    const configs = {
      BEGINNER: {
        label: t('difficulty_beginner'),
        bgColor: 'bg-accent-green/10 border-accent-green/30 text-accent-green',
      },
      INTERMEDIATE: {
        label: t('difficulty_intermediate'),
        bgColor: 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue',
      },
      ADVANCED: {
        label: t('difficulty_advanced'),
        bgColor: 'bg-accent-red/10 border-accent-red/30 text-accent-red',
      },
      ALL_LEVELS: {
        label: t('difficulty_all_levels'),
        bgColor:
          'bg-theme-primary/10 border-theme-primary/30 text-theme-primary',
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
          <div className="absolute inset-0 bg-theme-primary/5 backdrop-blur-sm z-20 flex items-center justify-center">
            <div className="flex items-center space-x-3 bg-theme-elevated/90 rounded-xl px-4 py-2 border border-theme-primary/30">
              <FiLoader className="w-4 h-4 animate-spin text-brand-primary" />
              <span className="text-sm font-medium text-theme-primary">
                {isOptimistic
                  ? t('user_annotation_card_saving_loading')
                  : t('user_annotation_card_updating_loading')}
              </span>
            </div>
          </div>
        )}

        <div className="p-4">
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Título e Obra */}
            <div className="col-span-5">
              <h3 className="font-semibold text-theme-primary text-sm mb-1 truncate">
                {currentAnnotation.title}
                {currentAnnotation.isVerified && (
                  <MdVerified className="w-4 h-4 text-accent-green inline ml-2" />
                )}
                {isOptimistic && (
                  <FiLoader className="w-3 h-3 animate-spin text-accent-blue inline ml-2" />
                )}
              </h3>
              <div className="text-xs text-theme-secondary">
                <Link
                  href={`/works/${workInfo.id}`}
                  className="hover:text-brand-primary transition-colors"
                >
                  {workInfo.title}
                </Link>
                <span className="text-theme-tertiary">
                  {' '}
                  - {workInfo.composer.name}
                </span>
              </div>
            </div>

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
            <div className="col-span-2 text-xs text-theme-tertiary space-y-1">
              <div className="flex items-center space-x-1">
                <FiThumbsUp className="w-3 h-3" />
                <span>{currentAnnotation.helpfulCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiEye className="w-3 h-3" />
                <span>{currentAnnotation.viewCount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="col-span-1 flex justify-end">
              {isOwner && !isOptimistic && (
                <div className="relative">
                  <button
                    onClick={() => setShowActions(!showActions)}
                    disabled={isUpdating}
                    className={`w-6 h-6 rounded-lg bg-theme-elevated border border-theme-primary/30 flex items-center justify-center text-theme-tertiary hover:text-theme-primary hover:border-brand-primary/50 transition-all opacity-0 group-hover:opacity-100 ${
                      isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FiMoreHorizontal className="w-3 h-3" />
                  </button>

                  {showActions && !isUpdating && (
                    <div className="absolute right-0 top-7 bg-theme-elevated border border-theme-primary/30 rounded-xl shadow-theme-glow z-10 py-2 min-w-[100px]">
                      <button
                        onClick={() => {
                          setShowEditModal(true);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-1 text-left text-xs text-theme-primary hover:bg-interactive-hover flex items-center space-x-2 transition-colors"
                      >
                        <FiEdit3 className="w-3 h-3" />
                        <span>{t('user_annotation_card_edit')}</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteModal(true);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-1 text-left text-xs text-accent-red hover:bg-accent-red/10 flex items-center space-x-2 transition-colors"
                      >
                        <FiTrash2 className="w-3 h-3" />
                        <span>{t('user_annotation_card_delete')}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
              <Link
                href={`/works/${workInfo.id}`}
                className="w-6 h-6 rounded-lg bg-theme-elevated border border-theme-primary/30 flex items-center justify-center text-theme-tertiary hover:text-brand-primary hover:border-brand-primary/50 transition-all ml-2"
              >
                <FiExternalLink className="w-3 h-3" />
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
          className={`classical-card p-6 group hover:shadow-theme-glow transition-all relative ${
            isOptimistic ? 'opacity-70' : ''
          } ${isUpdating ? 'pointer-events-none' : ''}`}
        >
          {/* Loading overlay para updates */}
          {isUpdating && (
            <div className="absolute inset-0 bg-theme-primary/5 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl">
              <div className="flex items-center space-x-3 bg-theme-elevated/90 rounded-xl px-4 py-2 border border-theme-primary/30">
                <FiLoader className="w-4 h-4 animate-spin text-brand-primary" />
                <span className="text-sm font-medium text-theme-primary">
                  {isOptimistic
                    ? t('user_annotation_card_saving_loading')
                    : t('user_annotation_card_updating_loading')}
                </span>
              </div>
            </div>
          )}

          <div className="flex-1">
            <Link
              href={`/works/${workInfo.id}`}
              className="block group-hover:text-brand-primary transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="inline-flex items-center py-0.5">
                  <FiMessageSquare className="w-3 h-3 mr-1" />
                  <h3 className="font-bold ml-1 text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-300 flex-1 line-clamp-2">
                    {currentAnnotation.title}
                    {currentAnnotation.isVerified && (
                      <MdVerified className="w-4 h-4 text-accent-green inline ml-2" />
                    )}
                    {isOptimistic && (
                      <FiLoader className="w-3 h-3 animate-spin text-accent-blue inline ml-2" />
                    )}
                  </h3>
                </div>
              </div>

              {/* Informações da obra */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center space-x-2">
                  <FiMusic className="w-3 h-3 text-accent-blue" />
                  <span className="text-sm text-accent-blue hover:text-accent-purple transition-colors font-medium">
                    {workInfo.title}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <FiUser className="w-3 h-3 text-theme-tertiary" />
                  <span className="text-sm text-theme-tertiary">
                    {workInfo.composer.fullName}
                  </span>
                </div>
              </div>

              {/* Content preview */}
              <p className="text-theme-secondary text-sm line-clamp-3 mb-3">
                {currentAnnotation.content}
              </p>

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
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-accent-red/10 border-accent-red/30 text-accent-red flex items-center space-x-1">
                    <FiEye className="w-2.5 h-2.5" />
                    <span>{t('user_annotation_card_private')}</span>
                  </span>
                )}

                {measureInfo && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-theme-primary/10 border-theme-primary/30 text-theme-primary flex items-center space-x-1">
                    <FiMapPin className="w-2.5 h-2.5" />
                    <span>{measureInfo}</span>
                  </span>
                )}
              </div>

              {/* Stats compactas */}
              <div className="flex items-center space-x-4 text-xs text-theme-tertiary mb-3">
                <div className="flex items-center space-x-1">
                  <FiThumbsUp className="w-3 h-3" />
                  <span>{currentAnnotation.helpfulCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FiEye className="w-3 h-3" />
                  <span>{currentAnnotation.viewCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FiClock className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(
                      new Date(currentAnnotation.createdAt),
                      {
                        addSuffix: true,
                        locale: language === 'pt' ? ptBR : enUS,
                      }
                    )}
                  </span>
                </div>
              </div>
            </Link>

            {/* Actions menu */}
            {isOwner && !isOptimistic && (
              <div className="absolute top-4 right-4 flex space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="relative">
                  <button
                    onClick={() => setShowActions(!showActions)}
                    disabled={isUpdating}
                    className={`w-6 h-6 rounded-lg bg-theme-elevated border border-theme-primary/30 flex items-center justify-center text-theme-tertiary hover:text-theme-primary hover:border-brand-primary/50 transition-all ${
                      isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FiMoreHorizontal className="w-3 h-3" />
                  </button>

                  {showActions && !isUpdating && (
                    <div className="absolute right-0 top-7 bg-theme-elevated border border-theme-primary/30 rounded-xl shadow-theme-glow z-10 py-2 min-w-[100px]">
                      <button
                        onClick={() => {
                          setShowEditModal(true);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-1 text-left text-xs text-theme-primary hover:bg-interactive-hover flex items-center space-x-2 transition-colors"
                      >
                        <FiEdit3 className="w-3 h-3" />
                        <span>{t('user_annotation_card_edit')}</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteModal(true);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-1 text-left text-xs text-accent-red hover:bg-accent-red/10 flex items-center space-x-2 transition-colors"
                      >
                        <FiTrash2 className="w-3 h-3" />
                        <span>{t('user_annotation_card_delete')}</span>
                      </button>
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
              className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <span>{t('user_annotation_card_see_work')}</span>
              <FiExternalLink className="w-3 h-3" />
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
          <div className="absolute inset-0 bg-theme-primary/5 backdrop-blur-sm z-20 flex items-center justify-center">
            <div className="flex items-center space-x-3 bg-theme-elevated/90 rounded-xl px-4 py-2 border border-theme-primary/30">
              <FiLoader className="w-4 h-4 animate-spin text-brand-primary" />
              <span className="text-sm font-medium text-theme-primary">
                {isOptimistic
                  ? t('user_annotation_card_saving_loading')
                  : t('user_annotation_card_updating_loading')}
              </span>
            </div>
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
                    className="w-10 h-10 rounded-xl object-cover border-2 border-theme-primary/20"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-xl flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-theme-primary" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-semibold text-theme-primary classical-title truncate">
                    {currentAnnotation.title}
                  </h3>
                  {currentAnnotation.isVerified && (
                    <div className="flex items-center space-x-1 text-accent-green">
                      <MdVerified className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        {t('user_annotation_card_verified')}
                      </span>
                    </div>
                  )}
                  {isOptimistic && (
                    <div className="flex items-center space-x-1 text-accent-blue">
                      <FiLoader className="w-3 h-3 animate-spin" />
                      <span className="text-xs font-medium">
                        {t('user_annotation_card_saving')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-sm text-theme-secondary mb-2">
                  <Link
                    href={`/works/${workInfo.id}`}
                    className="font-medium hover:text-brand-primary transition-colors"
                  >
                    {workInfo.title}
                  </Link>
                  <span className="text-theme-tertiary">
                    {workInfo.composer.fullName}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs text-theme-tertiary">
                  <FiClock className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(
                      new Date(currentAnnotation.createdAt),
                      {
                        addSuffix: true,
                        locale: language === 'pt' ? ptBR : enUS,
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions menu */}
            {isOwner && !isOptimistic && (
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  disabled={isUpdating}
                  className={`w-8 h-8 rounded-lg bg-theme-elevated border border-theme-primary/30 flex items-center justify-center text-theme-tertiary hover:text-theme-primary hover:border-brand-primary/50 transition-all opacity-0 group-hover:opacity-100 ${
                    isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FiMoreHorizontal className="w-4 h-4" />
                </button>

                {showActions && !isUpdating && (
                  <div className="absolute right-0 top-9 bg-theme-elevated border border-theme-primary/30 rounded-xl shadow-theme-glow z-10 py-2 min-w-[120px]">
                    <button
                      onClick={() => {
                        setShowEditModal(true);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-theme-primary hover:bg-interactive-hover flex items-center space-x-2 transition-colors"
                    >
                      <FiEdit3 className="w-3 h-3" />
                      <span>{t('user_annotation_card_edit')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteModal(true);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-accent-red hover:bg-accent-red/10 flex items-center space-x-2 transition-colors"
                    >
                      <FiTrash2 className="w-3 h-3" />
                      <span>{t('user_annotation_card_delete')}</span>
                    </button>
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
              <span className="px-3 py-1 rounded-full text-xs font-medium border bg-accent-red/10 border-accent-red/30 text-accent-red flex items-center space-x-1">
                <FiEye className="w-3 h-3" />
                <span>{t('user_annotation_card_private')}</span>
              </span>
            )}

            {measureInfo && (
              <span className="px-3 py-1 rounded-full text-xs font-medium border bg-theme-primary/10 border-theme-primary/30 text-theme-primary flex items-center space-x-1">
                <FiMapPin className="w-3 h-3" />
                <span>{measureInfo}</span>
              </span>
            )}

            {currentAnnotation.pageNumber && (
              <span className="px-3 py-1 rounded-full text-xs font-medium border bg-theme-primary/10 border-theme-primary/30 text-theme-primary">
                {t('user_annotation_card_page')} {currentAnnotation.pageNumber}
              </span>
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
                className="mt-2 text-sm text-brand-primary hover:text-brand-secondary font-medium transition-colors"
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
                <span
                  key={index}
                  className="px-2 py-1 bg-theme-elevated border border-theme-primary/20 rounded-lg text-xs text-theme-secondary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-theme-secondary">
            {/* Stats */}
            <div className="flex items-center space-x-4 text-sm text-theme-tertiary">
              <div className="flex items-center space-x-1">
                <FiThumbsUp className="w-4 h-4" />
                <span>{currentAnnotation.helpfulCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiEye className="w-4 h-4" />
                <span>{currentAnnotation.viewCount}</span>
              </div>
            </div>

            {/* Link para a obra */}
            <Link
              href={`/works/${workInfo.id}`}
              className="btn-classical-secondary flex items-center space-x-2 text-sm"
            >
              <FiExternalLink className="w-4 h-4" />
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
