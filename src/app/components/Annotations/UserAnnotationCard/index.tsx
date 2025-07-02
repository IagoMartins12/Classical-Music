// app/annotations/components/UserAnnotationCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FiThumbsUp,
  FiEye,
  FiEdit3,
  FiTrash2,
  FiExternalLink,
  FiMapPin,
  FiTarget,
  FiLayers,
  FiMusic,
  FiBookOpen,
  FiAward,
  FiMessageSquare,
  FiClock,
  FiLock,
  FiGlobe,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { UserAnnotation } from '@/app/requests/user-annotations';
import { useAnnotationsStore } from '@/app/stores/useAnnotationsStore';
import CreateAnnotationModal from '@/app/components/Annotations/CreateAnnotationModal';

// Importar componentes de animação
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import { MdVerified } from 'react-icons/md';
import ConfirmDeleteModal from '../DeleteAnnotationModal2';

interface UserAnnotationCardProps {
  annotation: UserAnnotation;
  viewMode: 'cards' | 'list';
}

// Componente do Modal de Confirmação

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

const DIFFICULTY_LABELS = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
  ALL_LEVELS: 'Todos os níveis',
};

const DIFFICULTY_COLORS = {
  BEGINNER: 'bg-accent-green/10 border-accent-green/30 text-accent-green',
  INTERMEDIATE: 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue',
  ADVANCED: 'bg-accent-red/10 border-accent-red/30 text-accent-red',
  ALL_LEVELS: 'bg-theme-primary/10 border-theme-primary/30 text-theme-primary',
};

export default function UserAnnotationCard({
  annotation,
  viewMode,
}: UserAnnotationCardProps) {
  const { deleteAnnotation } = useAnnotationsStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const categoryConfig =
    CATEGORY_CONFIG[annotation.category as keyof typeof CATEGORY_CONFIG];
  const CategoryIcon = categoryConfig?.icon || FiMessageSquare;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteAnnotation(annotation.id);
      if (success) {
        toast.success('Anotação deletada com sucesso!', {
          icon: '🗑️',
          duration: 3000,
        });
        setShowDeleteModal(false);
        // Recarregar a página para atualizar a lista
        window.location.reload();
      } else {
        toast.error('Erro ao deletar anotação');
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar anotação');
    } finally {
      setIsDeleting(false);
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
  const shouldTruncate = annotation.content.length > 200;
  const displayContent =
    showFullContent || !shouldTruncate
      ? annotation.content
      : annotation.content.substring(0, 200) + '...';

  if (viewMode === 'list') {
    return (
      <>
        <AnimatedCard
          hover="lift"
          className="classical-card p-6 group hover:shadow-theme-glow transition-all"
        >
          <div className="flex items-center space-x-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-bold text-theme-primary group-hover:text-brand-primary transition-colors">
                      {annotation.title}
                    </h3>
                    {annotation.isVerified && (
                      <MdVerified
                        className="w-4 h-4 text-accent-green"
                        title="Verificado"
                      />
                    )}
                    {annotation.isPublic ? (
                      <FiGlobe
                        className="w-4 h-4 text-accent-blue"
                        title="Público"
                      />
                    ) : (
                      <FiLock
                        className="w-4 h-4 text-theme-tertiary"
                        title="Privado"
                      />
                    )}
                  </div>
                  <p className="text-theme-secondary text-sm">
                    {annotation.work.title} -{' '}
                    {annotation.work.composer.fullName}
                  </p>
                  {annotation.work.opOrCatalog && (
                    <p className="text-xs text-theme-tertiary">
                      {annotation.work.opOrCatalog}
                    </p>
                  )}
                </div>

                {/* Compact info */}
                <div className="flex items-center space-x-4 text-sm text-theme-tertiary">
                  {/* Category */}
                  <span
                    className={`px-2 py-1 rounded-full text-xs border ${
                      categoryConfig?.bgColor ||
                      'bg-theme-primary/10 border-theme-primary/30 text-theme-primary'
                    }`}
                  >
                    {categoryConfig?.label || annotation.category}
                  </span>

                  {/* Stats */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <FiThumbsUp className="w-3 h-3" />
                      <span>{annotation.helpfulCount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiEye className="w-3 h-3" />
                      <span>{annotation.viewCount}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <span className="text-xs">
                    {formatDistanceToNow(new Date(annotation.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2">
                  <AnimatedItem hover="scale">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="w-8 h-8 bg-theme-secondary hover:bg-interactive-hover rounded-lg flex items-center justify-center text-theme-tertiary hover:text-brand-primary transition-all"
                      title="Editar"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </button>
                  </AnimatedItem>
                  <AnimatedItem hover="scale">
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-8 h-8 bg-theme-secondary hover:bg-accent-red/10 rounded-lg flex items-center justify-center text-theme-tertiary hover:text-accent-red transition-all"
                      title="Deletar"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </AnimatedItem>
                  <AnimatedItem hover="scale">
                    <Link
                      href={`/works/${annotation.workId}`}
                      className="w-8 h-8 bg-theme-secondary hover:bg-interactive-hover rounded-lg flex items-center justify-center text-theme-tertiary hover:text-brand-primary transition-all"
                      title="Ver obra"
                    >
                      <FiExternalLink className="w-4 h-4" />
                    </Link>
                  </AnimatedItem>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          annotationTitle={annotation.title}
        />

        <CreateAnnotationModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          workId={annotation.workId}
          workTitle={annotation.work.title}
          composerName={annotation.work.composer.fullName}
          editingAnnotation={annotation as any}
        />
      </>
    );
  }

  // Card view
  return (
    <>
      <AnimatedCard
        hover="lift"
        className="classical-card p-6 group hover:shadow-theme-glow transition-all"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-bold text-theme-primary group-hover:text-brand-primary transition-colors classical-title">
                {annotation.title}
              </h3>
              {annotation.isVerified && (
                <MdVerified
                  className="w-5 h-5 text-accent-green"
                  title="Verificado pela comunidade"
                />
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-theme-secondary">
              <Link
                href={`/works/${annotation.workId}`}
                className="hover:text-brand-primary transition-colors font-medium"
              >
                {annotation.work.title}
              </Link>
              <span>por {annotation.work.composer.fullName}</span>
            </div>
            {annotation.work.opOrCatalog && (
              <p className="text-sm text-theme-tertiary mt-1">
                {annotation.work.opOrCatalog}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <AnimatedItem hover="scale">
              <button
                onClick={() => setShowEditModal(true)}
                className="w-8 h-8 bg-theme-secondary hover:bg-interactive-hover rounded-lg flex items-center justify-center text-theme-tertiary hover:text-brand-primary transition-all"
                title="Editar"
              >
                <FiEdit3 className="w-4 h-4" />
              </button>
            </AnimatedItem>
            <AnimatedItem hover="scale">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-8 h-8 bg-theme-secondary hover:bg-accent-red/10 rounded-lg flex items-center justify-center text-theme-tertiary hover:text-accent-red transition-all"
                title="Deletar"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </AnimatedItem>
          </div>
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
            <span>{categoryConfig?.label || annotation.category}</span>
          </span>

          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              DIFFICULTY_COLORS[
                annotation.difficulty as keyof typeof DIFFICULTY_COLORS
              ] ||
              'bg-theme-primary/10 border-theme-primary/30 text-theme-primary'
            }`}
          >
            {DIFFICULTY_LABELS[
              annotation.difficulty as keyof typeof DIFFICULTY_LABELS
            ] || annotation.difficulty}
          </span>

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

          {annotation.isPublic ? (
            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-accent-blue/10 border-accent-blue/30 text-accent-blue flex items-center space-x-1">
              <FiGlobe className="w-3 h-3" />
              <span>Público</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-theme-tertiary/10 border-theme-tertiary/30 text-theme-tertiary flex items-center space-x-1">
              <FiLock className="w-3 h-3" />
              <span>Privado</span>
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
              onClick={() => setShowFullContent(!showFullContent)}
              className="mt-2 text-sm text-brand-primary hover:text-brand-secondary font-medium transition-colors"
            >
              {showFullContent ? 'Ver menos' : 'Ver mais'}
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
          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-theme-tertiary">
            <div className="flex items-center space-x-1">
              <FiThumbsUp className="w-4 h-4" />
              <span>{annotation.helpfulCount} úteis</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiEye className="w-4 h-4" />
              <span>{annotation.viewCount} visualizações</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiClock className="w-4 h-4" />
              <span>
                {formatDistanceToNow(new Date(annotation.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <AnimatedItem hover="scale">
              <Link
                href={`/works/${annotation.workId}`}
                className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <span>Ver Obra</span>
                <FiExternalLink className="w-3 h-3" />
              </Link>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedCard>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        annotationTitle={annotation.title}
      />

      <CreateAnnotationModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        workId={annotation.workId}
        workTitle={annotation.work.title}
        composerName={annotation.work.composer.fullName}
        editingAnnotation={annotation as any}
      />
    </>
  );
}
