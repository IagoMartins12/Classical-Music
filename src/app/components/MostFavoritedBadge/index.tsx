// components/MostFavoritedBadge.tsx - Badge para partitura mais favoritada
'use client';

import { FiAward, FiStar, FiTrendingUp } from 'react-icons/fi';
import { BiCrown } from 'react-icons/bi';
import { useIsMostFavorited } from '@/app/hooks/useMostFavoritedScore';

interface MostFavoritedBadgeProps {
  workId: string;
  scoreId: string;
  scoreSource?: string;
  variant?: 'crown' | 'star' | 'award' | 'trending';
  size?: 'sm' | 'md' | 'lg';
  position?: 'corner' | 'inline' | 'floating';
  showText?: boolean;
}

export default function MostFavoritedBadge({
  workId,
  scoreId,
  scoreSource = 'IMSLP',
  variant = 'crown',
  size = 'md',
  position = 'corner',
  showText = true,
}: MostFavoritedBadgeProps) {
  const { isMostFavorited, loading } = useIsMostFavorited(
    workId,
    scoreId,
    scoreSource
  );

  // Não mostrar se não é a mais favoritada ou está carregando
  if (loading || !isMostFavorited) {
    return null;
  }

  // Configurações visuais por variante
  const variants = {
    crown: {
      icon: BiCrown,
      gradient: 'from-yellow-400 to-yellow-600',
      bgGradient: 'from-yellow-400/20 to-yellow-600/20',
      borderColor: 'border-yellow-500/40',
      textColor: 'text-yellow-600',
      emoji: '👑',
      label: 'Mais Favoritada',
    },
    star: {
      icon: FiStar,
      gradient: 'from-amber-400 to-orange-500',
      bgGradient: 'from-amber-400/20 to-orange-500/20',
      borderColor: 'border-amber-500/40',
      textColor: 'text-amber-600',
      emoji: '⭐',
      label: 'Favorita da Comunidade',
    },
    award: {
      icon: FiAward,
      gradient: 'from-purple-400 to-pink-500',
      bgGradient: 'from-purple-400/20 to-pink-500/20',
      borderColor: 'border-purple-500/40',
      textColor: 'text-purple-600',
      emoji: '🏆',
      label: 'Top Favorita',
    },
    trending: {
      icon: FiTrendingUp,
      gradient: 'from-green-400 to-emerald-500',
      bgGradient: 'from-green-400/20 to-emerald-500/20',
      borderColor: 'border-green-500/40',
      textColor: 'text-green-600',
      emoji: '🔥',
      label: 'Trending',
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  // Tamanhos
  const sizes = {
    sm: {
      container: 'px-2 py-1',
      icon: 'w-3 h-3',
      text: 'text-xs',
      emoji: 'text-sm',
    },
    md: {
      container: 'px-3 py-1.5',
      icon: 'w-4 h-4',
      text: 'text-sm',
      emoji: 'text-base',
    },
    lg: {
      container: 'px-4 py-2',
      icon: 'w-5 h-5',
      text: 'text-base',
      emoji: 'text-lg',
    },
  };

  const sizeConfig = sizes[size];

  // Posicionamento
  const positions = {
    corner: 'absolute -top-2 -right-2 z-10',
    inline: 'inline-flex',
    floating: 'absolute top-2 right-2 z-10',
  };

  const baseClasses = `
    ${positions[position]} 
    ${sizeConfig.container}
    bg-gradient-to-r ${config.bgGradient}
    border ${config.borderColor}
    ${config.textColor}
    rounded-full
    font-medium
    shadow-lg
    backdrop-blur-sm
    animate-pulse
    hover:animate-none
    transition-all duration-300
    hover:scale-110
  `;

  // Diferentes layouts baseados na variante
  if (variant === 'crown') {
    return (
      <div
        className={baseClasses}
        title="Partitura mais favoritada pela comunidade"
      >
        <div className="flex items-center space-x-1">
          <span className={sizeConfig.emoji}>{config.emoji}</span>
          {showText && (
            <span className={`${sizeConfig.text} font-bold hidden sm:inline`}>
              Favorita
            </span>
          )}
        </div>
      </div>
    );
  }

  // Layout padrão para outras variantes
  return (
    <div className={baseClasses} title={`${config.label} pela comunidade`}>
      <div className="flex items-center space-x-1.5">
        <div className={`bg-gradient-to-r ${config.gradient} rounded-full p-1`}>
          <Icon className={`${sizeConfig.icon} text-white`} />
        </div>
        {showText && (
          <span className={`${sizeConfig.text} font-semibold hidden sm:inline`}>
            {size === 'sm' ? 'Top' : config.label}
          </span>
        )}
      </div>
    </div>
  );
}

// Componente compacto para usar em listas
export function CompactMostFavoritedBadge({
  workId,
  scoreId,
  scoreSource = 'IMSLP',
}: {
  workId: string;
  scoreId: string;
  scoreSource?: string;
}) {
  return (
    <MostFavoritedBadge
      workId={workId}
      scoreId={scoreId}
      scoreSource={scoreSource}
      variant="crown"
      size="sm"
      position="inline"
      showText={false}
    />
  );
}

// Componente apenas com emoji para uso muito discreto
export function MostFavoritedEmoji({
  workId,
  scoreId,
  scoreSource = 'IMSLP',
}: {
  workId: string;
  scoreId: string;
  scoreSource?: string;
}) {
  const { isMostFavorited, loading } = useIsMostFavorited(
    workId,
    scoreId,
    scoreSource
  );

  if (loading || !isMostFavorited) {
    return null;
  }

  return (
    <span className="text-lg animate-bounce" title="Partitura mais favoritada">
      👑
    </span>
  );
}
