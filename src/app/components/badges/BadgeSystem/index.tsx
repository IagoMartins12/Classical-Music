// components/badges/BadgeSystem.tsx
'use client';

import {
  FiAward,
  FiStar,
  FiZap,
  FiHeart,
  FiMusic,
  FiTarget,
  FiTrendingUp,
  FiShield,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import { AnimatedCard, AnimatedItem } from '../../animation/AnimatedComponents';
import { BiCrown, BiTrophy } from 'react-icons/bi';
import { FaFire } from 'react-icons/fa';

// Tipos de badges
export type BadgeCategory =
  | 'collection'
  | 'learning'
  | 'dedication'
  | 'expertise'
  | 'social'
  | 'milestone';

export type BadgeRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: BadgeCategory;
  rarity: BadgeRarity;
  progress?: number; // 0-100
  maxProgress?: number;
  unlocked: boolean;
  unlockedAt?: string;
  color?: {
    from: string;
    to: string;
    border: string;
    text: string;
  };
}

// Configuração de cores por raridade
const RARITY_COLORS = {
  COMMON: {
    from: 'from-slate-400',
    to: 'to-slate-600',
    border: 'border-slate-400/30',
    text: 'text-slate-600',
  },
  RARE: {
    from: 'from-blue-400',
    to: 'to-blue-600',
    border: 'border-blue-400/30',
    text: 'text-blue-600',
  },
  EPIC: {
    from: 'from-purple-400',
    to: 'to-purple-600',
    border: 'border-purple-400/30',
    text: 'text-purple-600',
  },
  LEGENDARY: {
    from: 'from-amber-400',
    to: 'to-amber-600',
    border: 'border-amber-400/30',
    text: 'text-amber-600',
  },
};

// Função para criar badges de favoritos
export function createFavoritesBadges(stats: {
  totalFavorites: number;
  composersCount: number;
  worksCount: number;
  scoresCount: number;
  streakDays: number;
  epochsCount: number;
  instrumentsCount: number;
  recentDiscoveries: number;
  topComposerWorks: number; // Maior número de obras de um compositor
}): Badge[] {
  return [
    // MILESTONE BADGES
    {
      id: 'first-favorite',
      name: 'Primeiro Favorito',
      description: 'Favoritou sua primeira obra musical',
      icon: FiHeart,
      category: 'milestone',
      rarity: 'COMMON',
      unlocked: stats.totalFavorites >= 1,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'collector-bronze',
      name: 'Colecionador Bronze',
      description: 'Acumule 10 favoritos',
      icon: FiAward,
      category: 'collection',
      rarity: 'COMMON',
      progress: Math.min(stats.totalFavorites, 10),
      maxProgress: 10,
      unlocked: stats.totalFavorites >= 10,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'collector-silver',
      name: 'Colecionador Prata',
      description: 'Acumule 50 favoritos',
      icon: BiTrophy,
      category: 'collection',
      rarity: 'RARE',
      progress: Math.min(stats.totalFavorites, 50),
      maxProgress: 50,
      unlocked: stats.totalFavorites >= 50,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'collector-gold',
      name: 'Colecionador Ouro',
      description: 'Acumule 100 favoritos - Você é um verdadeiro conhecedor!',
      icon: BiCrown,
      category: 'collection',
      rarity: 'EPIC',
      progress: Math.min(stats.totalFavorites, 100),
      maxProgress: 100,
      unlocked: stats.totalFavorites >= 100,
      ...RARITY_COLORS.EPIC,
    },

    // COMPOSER BADGES
    {
      id: 'composer-fan',
      name: 'Fã de Compositor',
      description: 'Favorite 5 obras do mesmo compositor',
      icon: FiStar,
      category: 'expertise',
      rarity: 'RARE',
      progress: Math.min(stats.topComposerWorks, 5),
      maxProgress: 5,
      unlocked: stats.topComposerWorks >= 5,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'epoch-explorer',
      name: 'Explorador de Épocas',
      description: 'Explore 4 épocas diferentes',
      icon: FiZap,
      category: 'expertise',
      rarity: 'RARE',
      progress: Math.min(stats.epochsCount, 4),
      maxProgress: 4,
      unlocked: stats.epochsCount >= 4,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'multi-instrument',
      name: 'Multi-Instrumental',
      description: 'Favorite obras para 6 instrumentos diferentes',
      icon: GiMusicalNotes,
      category: 'expertise',
      rarity: 'EPIC',
      progress: Math.min(stats.instrumentsCount, 6),
      maxProgress: 6,
      unlocked: stats.instrumentsCount >= 6,
      ...RARITY_COLORS.EPIC,
    },

    // DEDICATION BADGES
    {
      id: 'daily-discovery',
      name: 'Descobridor Diário',
      description: 'Favorite algo por 3 dias seguidos',
      icon: FaFire,
      category: 'dedication',
      rarity: 'RARE',
      progress: Math.min(stats.streakDays, 3),
      maxProgress: 3,
      unlocked: stats.streakDays >= 3,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'music-archaeologist',
      name: 'Arqueólogo Musical',
      description: 'Descubra 20 obras nos últimos 30 dias',
      icon: FiTrendingUp,
      category: 'dedication',
      rarity: 'EPIC',
      progress: Math.min(stats.recentDiscoveries, 20),
      maxProgress: 20,
      unlocked: stats.recentDiscoveries >= 20,
      ...RARITY_COLORS.EPIC,
    },

    // LEGENDARY BADGES
    {
      id: 'classical-guru',
      name: 'Guru Clássico',
      description:
        'Alcance 200 favoritos e prove ser um verdadeiro especialista',
      icon: FiShield,
      category: 'milestone',
      rarity: 'LEGENDARY',
      progress: Math.min(stats.totalFavorites, 200),
      maxProgress: 200,
      unlocked: stats.totalFavorites >= 200,
      ...RARITY_COLORS.LEGENDARY,
    },
  ];
}

// Função para criar badges de learning
export function createLearningBadges(stats: {
  totalLearning: number;
  wantToLearnCount: number;
  learnedCount: number;
  avgMastery: number;
  expertLevelCount: number;
  publicPerformances: number;
  avgStudyTime: number;
  currentStreak: number;
  completionRate: number; // obras finalizadas vs iniciadas
}): Badge[] {
  return [
    // MILESTONE BADGES
    {
      id: 'first-goal',
      name: 'Primeiro Objetivo',
      description: 'Adicione sua primeira obra para estudar',
      icon: FiTarget,
      category: 'milestone',
      rarity: 'COMMON',
      unlocked: stats.totalLearning >= 1,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'dedicated-student',
      name: 'Estudante Dedicado',
      description: 'Tenha 10 obras em sua lista de estudos',
      icon: FiMusic,
      category: 'learning',
      rarity: 'COMMON',
      progress: Math.min(stats.wantToLearnCount, 10),
      maxProgress: 10,
      unlocked: stats.wantToLearnCount >= 10,
      ...RARITY_COLORS.COMMON,
    },

    // MASTERY BADGES
    {
      id: 'first-mastery',
      name: 'Primeira Conquista',
      description: 'Complete sua primeira obra',
      icon: FiAward,
      category: 'learning',
      rarity: 'COMMON',
      unlocked: stats.learnedCount >= 1,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'skilled-musician',
      name: 'Músico Habilidoso',
      description: 'Domine 10 obras (maestria 4+)',
      icon: FiStar,
      category: 'expertise',
      rarity: 'RARE',
      progress: Math.min(stats.expertLevelCount, 10),
      maxProgress: 10,
      unlocked: stats.expertLevelCount >= 10,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'perfectionist',
      name: 'Perfeccionista',
      description: 'Mantenha maestria média de 4.5+',
      icon: BiCrown,
      category: 'expertise',
      rarity: 'EPIC',
      progress: Math.min(Math.round(stats.avgMastery * 10), 45),
      maxProgress: 45,
      unlocked: stats.avgMastery >= 4.5,
      ...RARITY_COLORS.EPIC,
    },

    // PERFORMANCE BADGES
    {
      id: 'stage-debut',
      name: 'Estreia no Palco',
      description: 'Realize sua primeira performance pública',
      icon: FiMusic,
      category: 'social',
      rarity: 'RARE',
      unlocked: stats.publicPerformances >= 1,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'performer',
      name: 'Performer Experiente',
      description: 'Realize 5 performances públicas',
      icon: BiTrophy,
      category: 'social',
      rarity: 'EPIC',
      progress: Math.min(stats.publicPerformances, 5),
      maxProgress: 5,
      unlocked: stats.publicPerformances >= 5,
      ...RARITY_COLORS.EPIC,
    },

    // DEDICATION BADGES
    {
      id: 'consistent-learner',
      name: 'Aprendiz Consistente',
      description: 'Complete obras por 7 dias seguidos',
      icon: FaFire,
      category: 'dedication',
      rarity: 'RARE',
      progress: Math.min(stats.currentStreak, 7),
      maxProgress: 7,
      unlocked: stats.currentStreak >= 7,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'efficient-learner',
      name: 'Aprendiz Eficiente',
      description: 'Complete 90% das obras que iniciar',
      icon: FiZap,
      category: 'expertise',
      rarity: 'EPIC',
      progress: Math.min(Math.round(stats.completionRate), 90),
      maxProgress: 90,
      unlocked: stats.completionRate >= 90,
      ...RARITY_COLORS.EPIC,
    },

    // LEGENDARY BADGE
    {
      id: 'musical-master',
      name: 'Mestre Musical',
      description: 'Domine 50+ obras com maestria 4+ - Elite absoluta!',
      icon: FiShield,
      category: 'milestone',
      rarity: 'LEGENDARY',
      progress: Math.min(stats.expertLevelCount, 50),
      maxProgress: 50,
      unlocked: stats.expertLevelCount >= 50,
      ...RARITY_COLORS.LEGENDARY,
    },
  ];
}

// Componente Badge individual
interface BadgeProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  onClick?: () => void;
}

export function BadgeComponent({
  badge,
  size = 'md',
  showProgress = true,
  onClick,
}: BadgeProps) {
  const Icon = badge.icon;

  const sizeClasses = {
    sm: 'w-12 h-12 p-2',
    md: 'w-14 h-14 p-3',
    lg: 'w-20 h-20 p-4',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={`relative group cursor-pointer ${
        onClick ? 'hover:scale-105' : ''
      } transition-all duration-300`}
      onClick={onClick}
    >
      <div
        className={`
        ${sizeClasses[size]} 
        rounded-2xl 
        ${
          badge.unlocked
            ? `bg-gradient-to-br border-color-primary shadow-lg ${badge.color?.border}`
            : 'bg-theme-secondary border-2 border-theme-primary/20'
        }
        border-2
        flex items-center justify-center
        relative overflow-hidden
        ${badge.unlocked ? 'shadow-glow' : ''}
      `}
      >
        <Icon
          className={`
          ${iconSizes[size]} 
          ${badge.unlocked ? 'text-brand-primary' : 'text-theme-primary'}
          drop-shadow-sm
        `}
        />

        {/* Efeito de brilho para badges desbloqueados */}
        {badge.unlocked && (
          <div
            className="absolutey inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                         -skew-x-12 translate-x-full group-hover:translate-x-[-200%] 
                         transition-transform duration-1000 ease-out"
          />
        )}
      </div>

      {/* Indicador de progresso */}
      {showProgress && badge.maxProgress && !badge.unlocked && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="w-12 h-1 bg-theme-secondary rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${badge.color?.from} ${badge.color?.to} transition-all duration-500`}
              style={{
                width: `${((badge.progress || 0) / badge.maxProgress) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Tooltip */}
      <div
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                     pointer-events-none z-50"
      >
        <div
          className=" bg-theme-primary text-theme-inverse-text px-3 py-2 rounded-lg 
                       text-sm font-medium shadow-lg border border-theme-primary/20
                       max-w-64 w-32 text-center"
        >
          <div className="font-bold">{badge.name}</div>
          <div className="text-xs opacity-90 mt-1">{badge.description}</div>
          {badge.maxProgress && !badge.unlocked && (
            <div className="text-xs mt-1 opacity-80">
              {badge.progress || 0}/{badge.maxProgress}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para mostrar lista de badges
interface BadgeGridProps {
  badges: Badge[];
  title?: string;
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function BadgeGrid({
  badges,
  title,
  maxVisible,
  size = 'md',
}: BadgeGridProps) {
  const unlockedBadges = badges.filter((b) => b.unlocked);
  const nextBadges = badges
    .filter((b) => !b.unlocked && (b.progress || 0) > 0)
    .slice(0, 3);
  const displayBadges = maxVisible
    ? badges.slice(0, maxVisible)
    : [...unlockedBadges, ...nextBadges];

  if (badges.length === 0) return null;

  return (
    <AnimatedCard hover="lift" className="classical-card p-6">
      <div className="space-y-4">
        {title && (
          <div className="flex items-center space-x-2">
            <FiAward className="w-5 h-5 text-brand-primary" />
            <h4 className="font-semibold text-theme-primary">{title}</h4>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-brand-primary font-bold">
                {unlockedBadges.length}
              </span>
              <span className="text-sm text-theme-tertiary">
                /{badges.length}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
          {displayBadges.map((badge, index) => (
            <AnimatedItem key={badge.id} hover="none" delay={index * 0.1}>
              <BadgeComponent badge={badge} size={size} />
            </AnimatedItem>
          ))}
        </div>

        {/* Resumo de conquistas */}
        <div className="pt-4 border-t border-theme-primary/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-theme-secondary">
              Próxima conquista: {nextBadges[0]?.name || 'Todas desbloqueadas!'}
            </span>
            <span className="text-brand-primary font-medium">
              {Math.round((unlockedBadges.length / badges.length) * 100)}%
              completo
            </span>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
