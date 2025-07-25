// components/Annotations/AnnotationCard.tsx - VERSÃO COM DEBUG
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
import { ptBR } from 'date-fns/locale';
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

interface AnnotationCardProps {
  annotation: WorkAnnotation;
  workTitle: string;
  composerName: string;
  showWorkInfo?: boolean;
}

const CATEGORY_CONFIG = {
  TECHNIQUE: {
    label: 'Técnica',
    icon: FiTarget,
    color: 'from-accent-red to-accent-purple',
    bgColor: 'bg-accent-red/10 border-accent-red/30 text-accent-red',
  },
  INTERPRETATION: {
    label: 'Interpretação',
    icon: GiMusicalNotes,
    color: 'from-accent-blue to-accent-purple',
    bgColor: 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue',
  },
  PRACTICE_TIP: {
    label: 'Dicas de Estudo',
    icon: FiBookOpen,
    color: 'from-accent-green to-accent-blue',
    bgColor: 'bg-accent-green/10 border-accent-green/30 text-accent-green',
  },
  THEORY: {
    label: 'Teoria',
    icon: FiLayers,
    color: 'from-accent-purple to-accent-blue',
    bgColor: 'bg-accent-purple/10 border-accent-purple/30 text-accent-purple',
  },
  PERFORMANCE: {
    label: 'Performance',
    icon: FiMusic,
    color: 'from-brand-primary to-brand-secondary',
    bgColor: 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary',
  },
  HISTORICAL: {
    label: 'Contexto',
    icon: FiAward,
    color: 'from-accent-purple to-accent-red',
    bgColor: 'bg-accent-purple/10 border-accent-purple/30 text-accent-purple',
  },
  GENERAL: {
    label: 'Geral',
    icon: FiMessageSquare,
    color: 'from-theme-primary to-theme-secondary',
    bgColor: 'bg-theme-primary/10 border-theme-primary/30 text-theme-primary',
  },
};

const DIFFICULTY_COLORS = {
  BEGINNER: 'bg-accent-green/10 border-accent-green/30 text-accent-green',
  INTERMEDIATE: 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue',
  ADVANCED: 'bg-accent-red/10 border-accent-red/30 text-accent-red',
  ALL_LEVELS: 'bg-theme-primary/10 border-theme-primary/30 text-theme-primary',
};

const DIFFICULTY_LABELS = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
  ALL_LEVELS: 'Todos os níveis',
};

export default function AnnotationCard({
  annotation,
  workTitle,
  composerName,
  showWorkInfo = false,
}: AnnotationCardProps) {
  const { user } = useAuth();
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

  // 🔧 CORREÇÃO: Verificar se pode votar - nunca permitir voto em anotação própria
  const canVote =
    user &&
    !isOwner &&
    annotation.isPublic &&
    !isOptimistic &&
    annotation.userId !== user.id; // 🔧 Verificação dupla para garantir

  const categoryConfig = CATEGORY_CONFIG[annotation.category];
  const CategoryIcon = categoryConfig.icon;

  const handleVote = async (isHelpful: boolean) => {
    if (!canVote) {
      if (!user) {
        toast.error('Faça login para votar');
      } else if (isOwner) {
        toast.error('Não é possível votar na própria anotação');
      } else if (!annotation.isPublic) {
        toast.error('Não é possível votar em anotação privada');
      }
      return;
    }

    try {
      const success = await voteAnnotation(annotation.id, isHelpful);
      if (success) {
        toast.success(
          isHelpful ? 'Voto útil registrado!' : 'Voto registrado!',
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
      toast.success('Anotação deletada com sucesso!', {
        icon: '🗑️',
      });
      setShowDeleteModal(false);
    } else {
      toast.error('Erro ao deletar anotação');
    }
  };

  const formatMeasureRange = () => {
    if (annotation.scope === 'SPECIFIC_MEASURE') {
      if (
        annotation.measureStart &&
        annotation.measureEnd &&
        annotation.measureStart !== annotation.measureEnd
      ) {
        return `Compassos ${annotation.measureStart}-${annotation.measureEnd}`;
      } else if (annotation.measureStart) {
        return `Compasso ${annotation.measureStart}`;
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
                {isOptimistic ? 'Salvando...' : 'Atualizando...'}
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
                    {annotation.title}
                  </h3>
                  {annotation.isVerified && (
                    <div className="flex items-center space-x-1 text-accent-green">
                      <MdVerified className="w-4 h-4" />
                      <span className="text-xs font-medium">Verificado</span>
                    </div>
                  )}
                  {/* Indicador de anotação otimística */}
                  {isOptimistic && (
                    <div className="flex items-center space-x-1 text-accent-blue">
                      <FiLoader className="w-3 h-3 animate-spin" />
                      <span className="text-xs font-medium">Salvando</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-sm text-theme-secondary">
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">
                      {annotation.user.firstName ||
                        annotation.user.username ||
                        'Usuário Anônimo'}
                    </span>
                    {annotation.user.userType && (
                      <span className="text-theme-tertiary">
                        •{' '}
                        {annotation.user.userType === 'TEACHER'
                          ? 'Professor'
                          : annotation.user.userType === 'PROFESSIONAL'
                          ? 'Profissional'
                          : annotation.user.userType === 'MUSIC_STUDENT'
                          ? 'Estudante'
                          : 'Usuário'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-theme-tertiary">
                    <FiClock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(annotation.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
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
                      className="w-full cursor-pointer px-4 py-2 text-left text-sm text-theme-primary hover:bg-interactive-hover flex items-center space-x-2 transition-colors"
                    >
                      <FiEdit3 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteModal(true);
                        setShowActions(false);
                      }}
                      className="w-full cursor-pointer  px-4 py-2 text-left text-sm text-accent-red hover:bg-accent-red/10 flex items-center space-x-2 transition-colors"
                    >
                      <FiTrash2 className="w-3 h-3" />
                      <span>Deletar</span>
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
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                DIFFICULTY_COLORS[annotation.difficulty]
              }`}
            >
              {DIFFICULTY_LABELS[annotation.difficulty]}
            </span>

            {/* 🆕 Badge para anotação privada */}
            {!annotation.isPublic && (
              <span className="px-3 py-1 rounded-full text-xs font-medium border bg-accent-red/10 border-accent-red/30 text-accent-red flex items-center space-x-1">
                <FiEye className="w-3 h-3" />
                <span>Anotação Privada</span>
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
                {annotation.hand === 'left'
                  ? 'Mão Esquerda'
                  : annotation.hand === 'right'
                  ? 'Mão Direita'
                  : 'Ambas as Mãos'}
              </span>
            )}

            {annotation.pageNumber && (
              <span className="px-3 py-1 rounded-full text-xs font-medium border bg-theme-primary/10 border-theme-primary/30 text-theme-primary">
                Página {annotation.pageNumber}
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
                  por {annotation.work.composer.fullName}
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
                {showMore ? 'Ver menos' : 'Ver mais'}
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
            {/* Vote buttons - 🔧 CORRIGIDO: Só mostrar se pode votar */}
            {canVote ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleVote(true)}
                  disabled={isVoting}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all text-sm font-medium ${
                    annotation.userVote === true
                      ? 'bg-accent-green/10 border border-accent-green/30 text-accent-green'
                      : 'text-theme-tertiary hover:text-accent-green hover:bg-accent-green/5 border border-transparent hover:border-accent-green/20'
                  } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FiThumbsUp className="w-4 h-4" />
                  <span>{annotation.helpfulCount}</span>
                </button>

                <button
                  onClick={() => handleVote(false)}
                  disabled={isVoting}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all text-sm font-medium ${
                    annotation.userVote === false
                      ? 'bg-accent-red/10 border border-accent-red/30 text-accent-red'
                      : 'text-theme-tertiary hover:text-accent-red hover:bg-accent-red/5 border border-transparent hover:border-accent-red/20'
                  } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FiThumbsDown className="w-4 h-4" />
                  <span>Não útil</span>
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
                    Faça login para votar
                  </div>
                )}
                {isOwner && (
                  <div className="text-xs text-theme-tertiary">
                    Sua anotação
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
