// components/Annotations/AnnotationCard.tsx - VERSÃO CORRIGIDA
'use client';

import { useState } from 'react';
import {
  FiThumbsUp,
  FiThumbsDown,
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
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import {
  useAnnotationsStore,
  WorkAnnotation,
} from '@/app/stores/useAnnotationsStore';
import { useAuth } from '@/app/hooks/useAuth';
import CreateAnnotationModal from '../CreateAnnotationModal';
import { MdVerified } from 'react-icons/md';
import Image from 'next/image';
import ConfirmDeleteModal from '../DeleteAnnotationModal';
import { useTranslation } from '@/app/hooks/useTranslation';

interface AnnotationCardProps {
  annotation: WorkAnnotation;
  workTitle: string;
  composerName: string;
  showWorkInfo?: boolean;
}

export default function AnnotationCard({
  annotation,
  workTitle,
  composerName,
  showWorkInfo = false,
}: AnnotationCardProps) {
  const { user } = useAuth();
  const { t, language } = useTranslation({ sections: ['pages/annotations'] });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const { voteAnnotation, deleteAnnotation, loading } = useAnnotationsStore();

  const isOwner = user?.id === annotation.userId;
  const isVoting = loading.vote.has(annotation.id);
  const isUpdating = loading.update.has(annotation.id) || annotation.isUpdating;
  const isDeleting = loading.update.has(annotation.id);
  const isOptimistic = annotation.isOptimistic;

  // Verificar se pode votar - nunca permitir voto em anotação própria
  const canVote =
    user &&
    !isOwner &&
    annotation.isPublic &&
    !isOptimistic &&
    annotation.userId !== user.id;

  // Configurações de categoria traduzidas usando o JSON
  const CATEGORY_CONFIG = {
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
      bgColor: 'bg-accent-purple/10 border-accent-purple/30 text-accent-purple',
    },
    PERFORMANCE: {
      label: t('category_performance'),
      icon: FiMusic,
      color: 'from-brand-primary to-brand-secondary',
      bgColor: 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary',
    },
    HISTORICAL: {
      label: t('category_historical'),
      icon: FiAward,
      color: 'from-accent-purple to-accent-red',
      bgColor: 'bg-accent-purple/10 border-accent-purple/30 text-accent-purple',
    },
    GENERAL: {
      label: t('category_general'),
      icon: FiMessageSquare,
      color: 'from-theme-primary to-theme-secondary',
      bgColor: 'bg-theme-primary/10 border-theme-primary/30 text-theme-primary',
    },
  };

  const DIFFICULTY_COLORS = {
    BEGINNER: 'bg-accent-green/10 border-accent-green/30 text-accent-green',
    INTERMEDIATE: 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue',
    ADVANCED: 'bg-accent-red/10 border-accent-red/30 text-accent-red',
    ALL_LEVELS:
      'bg-theme-primary/10 border-theme-primary/30 text-theme-primary',
  };

  const DIFFICULTY_LABELS = {
    BEGINNER: t('difficulty_beginner'),
    INTERMEDIATE: t('difficulty_intermediate'),
    ADVANCED: t('difficulty_advanced'),
    ALL_LEVELS: t('difficulty_all_levels'),
  };

  const categoryConfig = CATEGORY_CONFIG[annotation.category];
  const CategoryIcon = categoryConfig.icon;
  const locale = language === 'en' ? enUS : ptBR;

  const handleVote = async (isHelpful: boolean) => {
    if (!canVote) {
      if (!user) {
        toast.error(t('toast_login_to_vote'));
      } else if (isOwner) {
        toast.error(t('toast_cannot_vote_own'));
      } else if (!annotation.isPublic) {
        toast.error(t('toast_cannot_vote_private'));
      }
      return;
    }

    try {
      const success = await voteAnnotation(annotation.id, isHelpful);
      if (success) {
        toast.success(
          isHelpful
            ? t('toast_helpful_vote_registered')
            : t('toast_vote_registered'),
          {
            icon: isHelpful ? '👍' : '👎',
          }
        );
      }
    } catch (error: any) {
      console.error('Erro ao votar:', error);
      toast.error(error.message || 'Erro ao processar voto');
    }
  };

  const handleDeleteConfirm = async () => {
    const success = await deleteAnnotation(annotation.id);
    if (success) {
      toast.success(t('toast_annotation_deleted'), {
        icon: '🗑️',
      });
      setShowDeleteModal(false);
    } else {
      toast.error(t('toast_annotation_delete_error'));
    }
  };

  const formatMeasureRange = () => {
    if (annotation.scope === 'SPECIFIC_MEASURE') {
      if (
        annotation.measureStart &&
        annotation.measureEnd &&
        annotation.measureStart !== annotation.measureEnd
      ) {
        return `${t('user_annotation_card_measures')} ${
          annotation.measureStart
        }-${annotation.measureEnd}`;
      } else if (annotation.measureStart) {
        return `${t('user_annotation_card_measure')} ${
          annotation.measureStart
        }`;
      }
    } else if (annotation.scope === 'SECTION' && annotation.section) {
      return annotation.section;
    } else if (annotation.scope === 'MOVEMENT' && annotation.movement) {
      return annotation.movement;
    }
    return null;
  };

  const measureInfo = formatMeasureRange();
  const shouldTruncate = annotation.content.length > 300;
  const displayContent =
    showMore || !shouldTruncate
      ? annotation.content
      : annotation.content.substring(0, 300) + '...';

  const getUserTypeLabel = (userType?: string) => {
    switch (userType) {
      case 'TEACHER':
        return t('annotation_card_teacher');
      case 'PROFESSIONAL':
        return t('annotation_card_professional');
      case 'MUSIC_STUDENT':
        return t('annotation_card_music_student');
      default:
        return t('annotation_card_user');
    }
  };

  const getHandLabel = (hand: string) => {
    switch (hand) {
      case 'left':
        return t('annotation_card_left_hand');
      case 'right':
        return t('annotation_card_right_hand');
      case 'both':
        return t('annotation_card_both_hands');
      default:
        return hand;
    }
  };

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
                  ? t('annotation_card_saving')
                  : t('annotation_card_updating')}
                ...
              </span>
            </div>
          </div>
        )}

        <div className="p-0 md:p-6">
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
                      t('annotation_card_anonymous_user')
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
                    {annotation.title}
                  </h3>
                  {annotation.isVerified && (
                    <div className="flex items-center space-x-1 text-accent-green">
                      <MdVerified className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        {t('annotation_card_verified')}
                      </span>
                    </div>
                  )}
                  {/* Indicador de anotação otimística */}
                  {isOptimistic && (
                    <div className="flex items-center space-x-1 text-accent-blue">
                      <FiLoader className="w-3 h-3 animate-spin" />
                      <span className="text-xs font-medium">
                        {t('annotation_card_saving')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center space-x-4 text-sm text-theme-secondary">
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">
                      {annotation.user.firstName ||
                        annotation.user.username ||
                        t('annotation_card_anonymous_user')}
                    </span>
                    {annotation.user.userType && (
                      <span className="text-theme-tertiary">
                        • {getUserTypeLabel(annotation.user.userType)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-theme-tertiary">
                    <FiClock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(annotation.createdAt), {
                        addSuffix: true,
                        locale: locale,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions menu */}
            {isOwner && !isOptimistic && (
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  disabled={isUpdating}
                  className={`w-8 h-8 rounded-lg bg-theme-elevated border border-theme-primary/30 flex items-center justify-center text-theme-tertiary hover:text-theme-primary hover:border-brand-primary/50 transition-all  ${
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
                      className="w-full cursor-pointer px-4 py-2 text-left text-sm text-theme-primary hover:bg-interactive-hover flex items-center space-x-2 transition-colors"
                    >
                      <FiEdit3 className="w-3 h-3" />
                      <span>{t('annotation_card_edit')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteModal(true);
                        setShowActions(false);
                      }}
                      className="w-full cursor-pointer  px-4 py-2 text-left text-sm text-accent-red hover:bg-accent-red/10 flex items-center space-x-2 transition-colors"
                    >
                      <FiTrash2 className="w-3 h-3" />
                      <span>{t('annotation_card_delete')}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium bg-theme-tertiary ${categoryConfig.bgColor} flex items-center space-x-1`}
            >
              <CategoryIcon className="w-3 h-3" />
              <span>{categoryConfig.label}</span>
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium bg-theme-tertiary ${
                DIFFICULTY_COLORS[annotation.difficulty]
              }`}
            >
              {DIFFICULTY_LABELS[annotation.difficulty]}
            </span>

            {/* Badge para anotação privada */}
            {!annotation.isPublic && (
              <span className="px-3 py-1 rounded-full text-xs font-medium border bg-accent-red/10 border-red-400 text-accent-red flex items-center space-x-1">
                <FiEye className="w-3 h-3" />
                <span>{t('annotation_card_private_annotation')}</span>
              </span>
            )}

            {measureInfo && (
              <span className="px-3 py-1 rounded-full text-xs font-medium border bg-theme-primary/10 border-theme-primary/30 text-theme-primary flex items-center space-x-1">
                <FiMapPin className="w-3 h-3" />
                <span>{measureInfo}</span>
              </span>
            )}

            {annotation.hand && (
              <span className="px-3 py-1 rounded-full text-xs font-medium border bg-accent-blue/10 border-accent-blue/30 text-accent-blue">
                {getHandLabel(annotation.hand)}
              </span>
            )}

            {annotation.pageNumber && (
              <span className="px-3 py-1 rounded-full text-xs font-medium border bg-theme-primary/10 border-theme-primary/30 text-theme-primary">
                {t('user_annotation_card_page')} {annotation.pageNumber}
              </span>
            )}
          </div>

          {/* Work info (for user profile pages) */}
          {showWorkInfo && annotation.work && (
            <div className="mb-4 p-3 bg-theme-elevated/50 border border-theme-primary/20 rounded-xl">
              <div className="flex items-center space-x-2 text-sm">
                <FiMusic className="w-4 h-4 text-theme-tertiary" />
                <span className="font-medium text-theme-primary">
                  {annotation.work.title}
                </span>
                <span className="text-theme-tertiary">
                  {t('annotation_card_by')} {annotation.work.composer.fullName}
                </span>
              </div>
            </div>
          )}

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
                  ? t('annotation_card_see_less')
                  : t('annotation_card_see_more')}
              </button>
            )}
          </div>

          {/* Tags */}
          {annotation.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {annotation.tags.map((tag, index) => (
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
            {/* Vote buttons - Só mostrar se pode votar */}
            {canVote ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleVote(true)}
                  disabled={isVoting}
                  className={`flex items-center space-x-2 border-transparent  px-3 py-2 rounded-xl transition-all text-sm font-medium ${
                    annotation.userVote === true
                      ? 'bg-accent-green/10 border border-accent-green/30 text-accent-green'
                      : 'text-theme-tertiary hover:text-accent-green hover:bg-accent-green/5 border border-transparent hover:border-accent-green/20'
                  } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FiThumbsUp
                    className={`w-4 h-4 ${
                      annotation.userVote === true
                        ? 'text-blue-600'
                        : 'text-theme-primary'
                    }`}
                  />
                  <span
                    className={`${
                      annotation.userVote === true
                        ? 'text-blue-400'
                        : 'text-theme-primary'
                    }`}
                  >
                    {annotation.helpfulCount}
                  </span>
                </button>

                <button
                  onClick={() => handleVote(false)}
                  disabled={isVoting}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all text-sm font-medium ${
                    annotation.userVote === false
                      ? 'text-accent-red'
                      : 'text-theme-tertiary hover:text-accent-red hover:bg-accent-red/5 hover:border-accent-red/20'
                  } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FiThumbsDown
                    className={`w-4 h-4 ${
                      annotation.userVote === false
                        ? 'text-red-600'
                        : 'text-theme-primary'
                    }`}
                  />
                  <span
                    className={`${
                      annotation.userVote === false
                        ? 'text-red-400'
                        : 'text-theme-primary'
                    }`}
                  >
                    {t('annotation_card_not_useful')}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
                  <FiThumbsUp className="w-4 h-4" />
                  <span>{annotation.helpfulCount}</span>
                </div>
                {!user && (
                  <div className="text-xs text-theme-tertiary">
                    {t('annotation_card_login_to_vote')}
                  </div>
                )}
                {isOwner && (
                  <div className="text-xs text-theme-tertiary">
                    {t('annotation_card_your_annotation')}
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center space-x-4 text-sm text-theme-tertiary">
              <div className="flex items-center space-x-1">
                <FiEye className="w-4 h-4" />
                <span>{annotation.viewCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <CreateAnnotationModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        workId={annotation.workId}
        workTitle={workTitle}
        composerName={composerName}
        editingAnnotation={annotation}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        annotationTitle={annotation.title}
      />
    </>
  );
}
