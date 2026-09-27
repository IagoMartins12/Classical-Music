// components/FavoriteScoreButton.tsx
'use client';

import { MouseEvent, useState } from 'react';
import { useSession } from '@/app/libs/session';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';
import {
  PiCheck,
  PiHeart,
  PiHeartFill,
  PiPencilLine,
  PiSpinnerGap,
  PiStar,
  PiStarFill,
  PiX,
} from 'react-icons/pi';
import { useAuth } from '@/app/hooks/useAuth';
import { useLoginModal } from '@/app/stores/authStore';
import type { WorkScore } from '@/app/types/catalog';
import { useToast } from '@/app/hooks/useToast';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import Modal from '@/app/components/Modal';

interface FavoriteWorkScore {
  id: string;
  title: string;
  type: string;
  downloadUrl: string;
  fileSize: string;
  pageCount: string;
  fileFormat: string;
}
interface FavoriteScoreButtonProps {
  workId: string;
  score: FavoriteWorkScore | WorkScore;
  variant?: 'default' | 'compact' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  showToast?: boolean;
  className?: string;
  onFavoriteChange?: (isFavorited: boolean) => void;
}

interface FavoriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    personalRating?: number;
    notes?: string;
    tags?: string[];
  }) => void;
  initialData?: {
    personalRating?: number;
    notes?: string;
    tags?: string[];
  } | null;
  scoreTitle: string;
}

const FavoriteModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  scoreTitle,
}: FavoriteModalProps) => {
  const [personalRating, setPersonalRating] = useState(
    initialData?.personalRating || 0
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');

  const handleSave = () => {
    onSave({
      personalRating: personalRating > 0 ? personalRating : undefined,
      notes: notes.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={false}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-theme-primary classical-title">
            Personalizar Favorito
          </h3>
          <Text papel="rotulo" tom="suave" as="p" className="mt-1">
            {scoreTitle}
          </Text>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-theme-elevated rounded-xl flex items-center justify-center transition-colors"
        >
          <PiX className="w-4 h-4 text-theme-tertiary" />
          <NomeAcao acao="fechar" />
        </button>
      </div>

      <Stack gap={6}>
        {/* Avaliação Pessoal */}
        <Stack gap={3}>
          <label className="block text-sm font-medium text-theme-secondary">
            Avaliação Pessoal
          </label>
          <Inline gap={2}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() =>
                  setPersonalRating(star === personalRating ? 0 : star)
                }
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  star <= personalRating
                    ? 'text-theme-primary shadow-theme-glow'
                    : 'bg-theme-elevated text-theme-tertiary'
                }`}
              >
                {star <= personalRating ? (
                  <PiStarFill
                    className={`w-4 h-4 ${
                      star <= personalRating ? 'fill-current' : ''
                    }`}
                  />
                ) : (
                  <PiStar
                    className={`w-4 h-4 ${
                      star <= personalRating ? 'fill-current' : ''
                    }`}
                  />
                )}
              </button>
            ))}
            {personalRating > 0 && (
              <Text papel="rotulo" tom="suave" className="ml-2">
                {personalRating} de 5
              </Text>
            )}
          </Inline>
        </Stack>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-3">
            Notas Pessoais
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione suas observações sobre esta partitura..."
            className="w-full h-24 px-4 py-3 bg-theme-elevated border border-theme-secondary rounded-xl text-theme-primary resize-none focus:outline-none transition-all duration-300"
            maxLength={500}
          />
          <Text
            papel="legenda"
            tom="fraco"
            as="div"
            className="mt-1 text-right"
          >
            {notes.length}/500
          </Text>
        </div>

        {/* Tags */}
        <Stack gap={3}>
          <label className="block text-sm font-medium text-theme-secondary">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Inline
                as="span"
                gap={1}
                key={tag}
                className="px-3 py-1 text-ouro-texto rounded-full text-xs font-medium bg-sup-2"
              >
                <span>{tag}</span>
                <button
                  onClick={() => removeTag(tag)}
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                >
                  <PiX className="w-3 h-3" />
                  <NomeAcao acao="fechar" />
                </button>
              </Inline>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              placeholder="Adicionar tag..."
              className="flex-1 px-3 py-2 bg-theme-elevated border border-theme-secondary rounded-xl text-theme-primary text-sm focus:outline-none transition-all duration-300"
              maxLength={20}
            />
            <button
              onClick={addTag}
              disabled={!newTag.trim() || tags.includes(newTag.trim())}
              className="px-4 py-2 text-theme-primary rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Adicionar
            </button>
          </div>
        </Stack>
      </Stack>

      {/* Actions */}
      <div className="flex justify-end space-x-3 mt-8">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-theme-elevated text-theme-secondary rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <Inline
          as="button"
          gap={2}
          onClick={handleSave}
          className="px-6 py-2 text-theme-primary rounded-xl font-medium transition-all duration-300"
        >
          <PiCheck className="w-4 h-4" />
          <span>Salvar</span>
        </Inline>
      </div>
    </Modal>
  );
};

export default function FavoriteScoreButton({
  workId,
  score,
  variant = 'default',
  size = 'md',
  showToast = true,
  className = '',
}: FavoriteScoreButtonProps) {
  const { data: session } = useSession();
  const {
    isScoreFavorited,
    getScoreFavorite,
    toggleScoreFavorite,
    updateScoreFavorite,
    loading,
  } = useFavoritesStore();

  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { open } = useLoginModal();
  const scoreKey = `${workId}-${score.id}-IMSLP`;
  const isFavorited = isScoreFavorited(workId, score.id, 'IMSLP');
  const favoriteData = getScoreFavorite(workId, score.id, 'IMSLP');
  const isLoading = loading.scores.has(scoreKey) || isProcessing;

  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const handleToggleFavorite = async (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Faça login para favoritar partituras');
      open();
      return;
    }

    if (!session?.user?.id || isLoading) return;

    setIsProcessing(true);

    try {
      const result = await toggleScoreFavorite(
        workId,
        score.id,
        'IMSLP',
        session.user.id,
        {
          title: score.title,
          type: score.type,
          downloadUrl: score.downloadUrl,
          fileSize: score.fileSize,
          pageCount: score.pageCount,
          fileFormat: score.fileFormat,
        }
      );

      // pageCount: score.pageCount, onFavoriteChange?.(result);

      if (showToast) {
        toast.success(
          result
            ? '❤️ Partitura adicionada aos favoritos!'
            : '💔 Partitura removida dos favoritos'
        );
      }

      // Se está favoritando e é o variant detailed, abrir modal
      if (result && variant === 'detailed') {
        setShowModal(true);
      }
    } catch (error) {
      console.error('Erro ao favoritar partitura:', error);

      if (showToast) {
        toast.error('Erro ao favoritar partitura. Tente novamente.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateFavorite = async (updates: {
    personalRating?: number;
    notes?: string;
    tags?: string[];
  }) => {
    if (!session?.user?.id) return;

    try {
      await updateScoreFavorite(workId, score.id, 'IMSLP', updates);

      if (showToast) {
        toast.success('✨ Favorito atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);

      if (showToast) {
        toast.error('Erro ao atualizar favorito.');
      }
    }
  };

  // Classes baseadas no variant e size
  const getButtonClasses = () => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeClasses = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
    };

    const variantClasses = {
      default: isFavorited
        ? 'text-theme-primary shadow-theme-glow border-2'
        : 'bg-theme-elevated border-2 border-theme-secondary text-theme-tertiary',
      compact: isFavorited ? 'border' : 'bg-theme-elevated text-theme-tertiary',
      detailed: isFavorited
        ? 'text-theme-primary shadow-theme-glow'
        : 'bg-theme-elevated text-theme-tertiary',
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  };

  const getIcon = () => {
    if (isLoading) {
      return <PiSpinnerGap className="w-4 h-4 animate-spin" />;
    }

    return isFavorited ? (
      <PiHeartFill
        className={`w-4 h-4 transition-all duration-300 ${
          isFavorited ? 'fill-current scale-110' : ''
        }`}
      />
    ) : (
      <PiHeart
        className={`w-4 h-4 transition-all duration-300 ${
          isFavorited ? 'fill-current scale-110' : ''
        }`}
      />
    );
  };

  return (
    <>
      <div className="relative group">
        <button
          onClick={(e) => handleToggleFavorite(e)}
          disabled={isLoading}
          className={getButtonClasses()}
        >
          {getIcon()}
        </button>

        {/* Badge de rating pessoal */}
        {isFavorited && favoriteData?.personalRating && size !== 'sm' && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center">
            <Text papel="legenda" tom="forte" className="font-bold">
              {favoriteData.personalRating}
            </Text>
          </div>
        )}

        {/* Botão de editar (só para favoritos) */}
        {isFavorited && variant === 'detailed' && (
          <button
            onClick={() => setShowModal(true)}
            className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-theme-medium"
            title="Editar favorito"
          >
            <PiPencilLine className="w-3 h-3 text-theme-primary" />
          </button>
        )}

        {/* Tooltip com informações */}
        {/* {variant !== 'compact' && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-theme-inverse text-theme-primary text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
            {isFavorited ? (
              <div className="space-y-1">
                <div>❤️ Nos seus favoritos</div>
                {favoriteData?.personalRating && (
                  <div>⭐ {favoriteData.personalRating}/5</div>
                )}
                {favoriteData?.tags && favoriteData.tags.length > 0 && (
                  <div>🏷️ {favoriteData.tags.join(', ')}</div>
                )}
              </div>
            ) : (
              'Adicionar aos favoritos'
            )}
          </div>
        )} */}
      </div>

      {/* Modal de edição */}
      <FavoriteModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleUpdateFavorite}
        initialData={favoriteData}
        scoreTitle={score.title}
      />
    </>
  );
}
