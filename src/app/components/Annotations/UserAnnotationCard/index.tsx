// app/annotations/components/UserAnnotationCard.tsx - VERSÃO CORRIGIDA
'use client';

import { useState } from 'react';
import {
  FiThumbsUp,
  FiMessageCircle,
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
import { ptBR } from 'date-fns/locale';
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
import ConfirmDeleteModal from '@/app/components/Annotations/DeleteAnnotationModal2';
import Image from 'next/image';

interface UserAnnotationCardProps {
  annotation: WorkAnnotation;
  viewMode: ViewMode;
  onUpdate?: () => void;
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

export default function UserAnnotationCard({
  annotation,
  viewMode,
  onUpdate,
}: UserAnnotationCardProps) {
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // 🔧 NOVO: Usar o store para operações de CRUD
  const { deleteAnnotation, loading, getAnnotationById } =
    useAnnotationsStore();

  // 🔧 NOVO: Verificar se há uma versão mais recente no store
  const storeAnnotation = getAnnotationById(annotation.id);
  const currentAnnotation = storeAnnotation || annotation;

  const isOwner = user?.id === currentAnnotation.userId;
  const isUpdating =
    loading.update.has(currentAnnotation.id) || storeAnnotation?.isUpdating;
  const isDeleting = loading.update.has(currentAnnotation.id);

  // 🔧 CORRIGIDO: Verificar se work existe antes de usar
  const workInfo = currentAnnotation.work || annotation.work;
  if (!workInfo) {
    console.warn('Anotação sem informações da obra:', currentAnnotation.id);
    return null; // ou um placeholder
  }

  const categoryConfig =
    CATEGORY_CONFIG[currentAnnotation.category as keyof typeof CATEGORY_CONFIG];
  const CategoryIcon = categoryConfig?.icon || FiMessageSquare;

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

  // const handleDeleteConfirm = async () => {
  //   try {
  //     const success = await deleteAnnotation(currentAnnotation.id);
  //     if (success) {
  //       toast.success('Anotação deletada com sucesso!', {
  //         icon: '🗑️',
  //       });
  //       setShowDeleteModal(false);
  //       onUpdate?.();
  //     } else {
  //       toast.error('Erro ao deletar anotação');
  //     }
  //   } catch (error) {
  //     console.error('Erro ao deletar anotação:', error);
  //     toast.error('Erro ao deletar anotação');
  //   }
  // };

  const formatMeasureRange = () => {
    if (currentAnnotation.scope === 'SPECIFIC_MEASURE') {
      if (
        currentAnnotation.measureStart &&
        currentAnnotation.measureEnd &&
        currentAnnotation.measureStart !== currentAnnotation.measureEnd
      ) {
        return `Compassos ${currentAnnotation.measureStart}-${currentAnnotation.measureEnd}`;
      } else if (currentAnnotation.measureStart) {
        return `Compasso ${currentAnnotation.measureStart}`;
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

  // 🔧 CORRIGIDO: Função para converter UserAnnotation para WorkAnnotation
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
        firstName: 'Você',
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

  // 🔧 NOVO: Indicador visual para anotações otimísticas
  const isOptimistic = storeAnnotation?.isOptimistic;

  // 🔧 CORRIGIDO: Verificar se viewMode é table (como string literal)
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
                {isOptimistic ? 'Salvando...' : 'Atualizando...'}
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
                className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  categoryConfig?.bgColor ||
                  'bg-theme-primary/10 border-theme-primary/30 text-theme-primary'
                } flex items-center space-x-1`}
              >
                <CategoryIcon className="w-3 h-3" />
                <span className="hidden sm:inline">
                  {categoryConfig?.label || currentAnnotation.category}
                </span>
              </span>
            </div>

            {/* Dificuldade */}
            <div className="col-span-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  DIFFICULTY_COLORS[
                    currentAnnotation.difficulty as keyof typeof DIFFICULTY_COLORS
                  ] ||
                  'bg-theme-primary/10 border-theme-primary/30 text-theme-primary'
                }`}
              >
                {DIFFICULTY_LABELS[
                  currentAnnotation.difficulty as keyof typeof DIFFICULTY_LABELS
                ] || currentAnnotation.difficulty}
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
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteModal(true);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-1 text-left text-xs text-accent-red hover:bg-accent-red/10 flex items-center space-x-2 transition-colors"
                      >
                        <FiTrash2 className="w-3 h-3" />
                        <span>Deletar</span>
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

  // Card mode (padrão)
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
                    {currentAnnotation.title}
                  </h3>
                  {currentAnnotation.isVerified && (
                    <div className="flex items-center space-x-1 text-accent-green">
                      <MdVerified className="w-4 h-4" />
                      <span className="text-xs font-medium">Verificado</span>
                    </div>
                  )}
                  {isOptimistic && (
                    <div className="flex items-center space-x-1 text-accent-blue">
                      <FiLoader className="w-3 h-3 animate-spin" />
                      <span className="text-xs font-medium">Salvando</span>
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
                        locale: ptBR,
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
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteModal(true);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-accent-red hover:bg-accent-red/10 flex items-center space-x-2 transition-colors"
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
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                categoryConfig?.bgColor ||
                'bg-theme-primary/10 border-theme-primary/30 text-theme-primary'
              } flex items-center space-x-1`}
            >
              <CategoryIcon className="w-3 h-3" />
              <span>{categoryConfig?.label || currentAnnotation.category}</span>
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                DIFFICULTY_COLORS[
                  currentAnnotation.difficulty as keyof typeof DIFFICULTY_COLORS
                ] ||
                'bg-theme-primary/10 border-theme-primary/30 text-theme-primary'
              }`}
            >
              {DIFFICULTY_LABELS[
                currentAnnotation.difficulty as keyof typeof DIFFICULTY_LABELS
              ] || currentAnnotation.difficulty}
            </span>

            {!currentAnnotation.isPublic && (
              <span className="px-3 py-1 rounded-full text-xs font-medium border bg-accent-red/10 border-accent-red/30 text-accent-red flex items-center space-x-1">
                <FiEye className="w-3 h-3" />
                <span>Privada</span>
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
                Página {currentAnnotation.pageNumber}
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
                {showMore ? 'Ver menos' : 'Ver mais'}
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
              {currentAnnotation._count.replies > 0 && (
                <div className="flex items-center space-x-1">
                  <FiMessageCircle className="w-4 h-4" />
                  <span>{currentAnnotation._count.replies}</span>
                </div>
              )}
            </div>

            {/* Link para a obra */}
            <Link
              href={`/works/${workInfo.id}`}
              className="btn-classical-secondary flex items-center space-x-2 text-sm"
            >
              <FiExternalLink className="w-4 h-4" />
              <span>Ver Obra</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 🔧 CORRIGIDO: Modals com conversão de tipos */}
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
