// components/FavoriteButton/FavoriteButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';

import { toast } from 'react-hot-toast';
import { useAuth } from '@/app/hooks/useAuth';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';

export type FavoriteType = 'composer' | 'work';

interface FavoriteButtonProps {
  // Identificadores
  id: string; // composerId ou workId
  type: FavoriteType;

  // Aparência
  variant?: 'default' | 'small' | 'large' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;

  // Comportamento
  showToast?: boolean;
  disabled?: boolean;

  // Callbacks opcionais
  onToggle?: (isFavorited: boolean) => void;
  onError?: (error: Error) => void;

  // Dados para exibição em toast (opcional)
  itemName?: string;
  typeButton?: 'circle' | 'square';

  // Estilo customizado
  style?: React.CSSProperties;
}

const FavoriteButton = ({
  id,
  type,
  variant = 'default',
  size = 'md',
  className = '',
  showToast = true,
  disabled = false,
  typeButton = 'circle',
  onToggle,
  onError,
  itemName,
  style,
}: FavoriteButtonProps) => {
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Store actions baseadas no tipo
  const {
    isComposerFavorited,
    isWorkFavorited,
    toggleComposerFavorite,
    toggleWorkFavorite,
    loading,
  } = useFavoritesStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Estados derivados
  const isFavorited = mounted
    ? type === 'composer'
      ? isComposerFavorited(id)
      : isWorkFavorited(id)
    : false;
  const isLoading = mounted
    ? type === 'composer'
      ? loading.composers.has(id)
      : loading.works.has(id)
    : false;

  // Tamanhos
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Variantes de estilo
  const getVariantClasses = () => {
    const baseClasses = `
      ${sizeClasses[size]} 
      ${typeButton === 'circle' ? 'rounded-full ' : ' '}
      transition-all 
      duration-300 
      hover:scale-110 
      active:scale-95
      flex 
      items-center 
      justify-center
      border
      relative
      overflow-hidden
      group
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `;

    const variants = {
      default: isFavorited
        ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-500/50 text-red-500 shadow-red-500/20 shadow-lg'
        : 'bg-theme-elevated/80 border-theme-primary/30 text-theme-primary hover:bg-interactive-hover hover:border-red-500/50 hover:text-red-500/80',

      small: isFavorited
        ? 'bg-red-500/20 border-red-500/40 text-red-500'
        : 'bg-theme-elevated/60 border-theme-secondary/40 text-theme-tertiary hover:text-red-500 hover:border-red-500/40',

      large: isFavorited
        ? 'bg-gradient-to-br from-red-500/15 to-red-600/15 border-red-500/40 text-red-500 shadow-theme-glow'
        : 'bg-gradient-to-br from-theme-elevated to-interactive-hover border-theme-primary text-theme-primary hover:border-red-500/50 hover:text-red-500 shadow-theme-medium',

      minimal: isFavorited
        ? 'bg-transparent border-transparent text-red-500'
        : 'bg-transparent border-transparent text-theme-tertiary hover:text-red-500',
    };

    return `${baseClasses} ${variants[variant]}`;
  };

  // Handler de clique
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || isLoading || !user?.id || !isAuthenticated) {
      if (!isAuthenticated && showToast) {
        toast.error('Faça login para favoritar itens');
      }
      return;
    }

    try {
      const newState =
        type === 'composer'
          ? await toggleComposerFavorite(id, user.id)
          : await toggleWorkFavorite(id, user.id);

      // Callback personalizado
      onToggle?.(newState);

      // Toast de feedback
      if (showToast) {
        const action = newState ? 'adicionado aos' : 'removido dos';
        const typeLabel = type === 'composer' ? 'Compositor' : 'Obra';
        const name = itemName || typeLabel;

        toast.success(`${name} ${action} favoritos`, {
          icon: newState ? '❤️' : '💔',
          duration: 2000,
          style: {
            background: newState
              ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
              : 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
            color: newState ? '#dc2626' : '#6b7280',
            border: newState ? '1px solid #fca5a5' : '1px solid #d1d5db',
          },
        });
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      onError?.(error as Error);

      if (showToast) {
        toast.error('Erro ao favoritar. Tente novamente.');
      }
    }
  };

  // Loading spinner
  const LoadingSpinner = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className={`w-3 h-3 border-2 border-current border-t-transparent ${
          typeButton === 'circle' ? 'rounded-full ' : ' '
        } animate-spin opacity-60`}
      ></div>
    </div>
  );

  // Pulse animation para favoritos
  const PulseEffect = () => {
    const pulseRadius = typeButton === 'square' ? '' : 'rounded-full';
    return (
      <div
        className={`absolute inset-0 ${pulseRadius} bg-red-500/20 animate-ping opacity-75`}
      ></div>
    );
  };

  // Partículas de coração (animação especial)
  const HeartParticles = () => (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-active:opacity-100 group-active:animate-ping"
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s',
          }}
        >
          <FiHeart className="w-2 h-2 text-red-500" />
        </div>
      ))}
    </div>
  );

  if (!mounted) {
    return (
      <div
        className={`
          ${sizeClasses[size]} 
          ${typeButton === 'circle' ? 'rounded-full ' : ' '} 
          bg-theme-elevated/60 
          border 
          border-theme-secondary/40 
          text-theme-tertiary 
          flex 
          items-center 
          justify-center
          ${className}
        `}
        style={style}
      >
        <FiHeart className={`${iconSizes[size]} opacity-50`} />
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`${getVariantClasses()} ${className}`}
      style={style}
      title={
        isFavorited
          ? `Remover ${
              type === 'composer' ? 'compositor' : 'obra'
            } dos favoritos`
          : `Adicionar ${
              type === 'composer' ? 'compositor' : 'obra'
            } aos favoritos`
      }
      aria-label={
        isFavorited ? `Remover dos favoritos` : `Adicionar aos favoritos`
      }
    >
      {/* Efeito de pulso para favoritos */}
      {isFavorited && variant !== 'minimal' && <PulseEffect />}

      {/* Partículas animadas */}
      <HeartParticles />

      {/* Loading state */}
      {isLoading && <LoadingSpinner />}

      {/* Ícone principal */}
      <FiHeart
        className={`
          ${iconSizes[size]} 
          transition-all 
          duration-300 
          ${isFavorited ? 'fill-current scale-110' : 'group-hover:scale-110'}
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          drop-shadow-sm
        `}
      />

      {/* Gradient overlay para efeito premium */}
      <div
        className={`absolute ${
          typeButton === 'circle' ? 'rounded-full ' : ' '
        }  inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 `}
      ></div>

      {/* Borda brilhante no hover */}
      <div
        className={`absolute inset-0 ${
          typeButton === 'circle' ? 'rounded-full ' : ' '
        }  opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-2 border-white/20 scale-110`}
      ></div>
    </button>
  );
};

export default FavoriteButton;
