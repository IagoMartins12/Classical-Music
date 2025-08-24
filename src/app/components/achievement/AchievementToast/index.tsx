// components/achievements/AchievementToast.tsx
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { FiAward, FiX, FiStar } from 'react-icons/fi';
import { Badge } from '../badges/BadgeSystem';
import { AnimatedItem } from '../../animation/AnimatedComponents';

// Context para gerenciar achievement toasts globalmente
interface AchievementContextType {
  showAchievement: (badge: Badge) => void;
  hideAchievement: (badgeId: string) => void;
}

const AchievementContext = createContext<AchievementContextType | null>(null);

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error(
      'useAchievements deve ser usado dentro de AchievementProvider'
    );
  }
  return context;
};

// Interface para achievement ativo
interface ActiveAchievement extends Badge {
  id: string;
  timestamp: number;
  duration?: number;
}

// Provider para achievements
interface AchievementProviderProps {
  children: React.ReactNode;
}

export function AchievementProvider({ children }: AchievementProviderProps) {
  const [achievements, setAchievements] = useState<ActiveAchievement[]>([]);

  const showAchievement = (badge: Badge) => {
    const achievement: ActiveAchievement = {
      ...badge,
      timestamp: Date.now(),
      duration: 5000, // 5 segundos por padrão
    };

    setAchievements((prev) => [...prev, achievement]);

    // Auto-remover após duração
    setTimeout(() => {
      hideAchievement(achievement.id);
    }, achievement.duration);
  };

  const hideAchievement = (badgeId: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== badgeId));
  };

  return (
    <AchievementContext.Provider value={{ showAchievement, hideAchievement }}>
      {children}
      <AchievementToastContainer
        achievements={achievements}
        onHide={hideAchievement}
      />
    </AchievementContext.Provider>
  );
}

// Container dos toasts
interface AchievementToastContainerProps {
  achievements: ActiveAchievement[];
  onHide: (badgeId: string) => void;
}

function AchievementToastContainer({
  achievements,
  onHide,
}: AchievementToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      {achievements.map((achievement) => (
        <AchievementToast
          key={achievement.id}
          achievement={achievement}
          onClose={() => onHide(achievement.id)}
        />
      ))}
    </div>
  );
}

// Toast individual
interface AchievementToastProps {
  achievement: ActiveAchievement;
  onClose: () => void;
}

function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const Icon = achievement.icon;

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 100);

    // Barra de progresso
    const startTime = Date.now();
    const duration = achievement.duration || 5000;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
  }, [achievement.duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatedItem
      direction="right"
      springType="bouncy"
      className={`
        pointer-events-auto transform transition-all duration-300
        ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }
      `}
    >
      <div
        className={`
        bg-theme-elevated border-2 ${achievement.color.border} 
        rounded-2xl shadow-2xl p-4 min-w-[320px] max-w-[400px]
        backdrop-blur-sm bg-opacity-95
        shadow-theme-glow
      `}
      >
        {/* Header */}
        <div className="flex items-center space-x-3 mb-3">
          <div
            className={`
            w-12 h-12 rounded-2xl bg-gradient-to-br ${achievement.color.from} ${achievement.color.to}
            flex items-center justify-center shadow-lg
            animate-pulse
          `}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-theme-primary text-sm">
                🎉 Conquista Desbloqueada!
              </h4>
              {achievement.rarity === 'legendary' && (
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <FiStar
                      key={i}
                      className="w-3 h-3 text-amber-400 animate-pulse"
                    />
                  ))}
                </div>
              )}
            </div>
            <div className={`font-semibold ${achievement.color.text}`}>
              {achievement.name}
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-6 h-6 rounded-full bg-theme-secondary hover:bg-theme-primary 
                      flex items-center justify-center transition-colors
                      text-theme-tertiary hover:text-theme-primary"
          >
            <FiX className="w-3 h-3" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-theme-secondary mb-3 leading-relaxed">
          {achievement.description}
        </p>

        {/* Rarity Badge */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`
            px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider
            ${
              achievement.rarity === 'legendary'
                ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white'
                : achievement.rarity === 'epic'
                ? 'bg-gradient-to-r from-purple-400 to-purple-600 text-white'
                : achievement.rarity === 'rare'
                ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
                : 'bg-gradient-to-r from-slate-400 to-slate-600 text-white'
            }
          `}
          >
            {achievement.rarity === 'legendary'
              ? '👑 Lendário'
              : achievement.rarity === 'epic'
              ? '💎 Épico'
              : achievement.rarity === 'rare'
              ? '⭐ Raro'
              : '🥉 Comum'}
          </span>

          <div className="text-xs text-theme-tertiary">
            +
            {achievement.rarity === 'legendary'
              ? 100
              : achievement.rarity === 'epic'
              ? 50
              : achievement.rarity === 'rare'
              ? 25
              : 10}{' '}
            XP
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-theme-secondary rounded-full h-1 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${achievement.color.from} ${achievement.color.to} 
                       transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </AnimatedItem>
  );
}

// Hook para detectar badges desbloqueados automaticamente
export const useAchievementDetection = () => {
  const { showAchievement } = useAchievements();

  const checkBadgeUnlocked = (badge: Badge, previousState?: boolean) => {
    // Se o badge foi desbloqueado agora (não estava antes)
    if (badge.unlocked && !previousState) {
      showAchievement(badge);
    }
  };

  const checkMultipleBadges = (badges: Badge[], previousBadges?: Badge[]) => {
    badges.forEach((badge) => {
      const previousBadge = previousBadges?.find((p) => p.id === badge.id);
      checkBadgeUnlocked(badge, previousBadge?.unlocked);
    });
  };

  return {
    checkBadgeUnlocked,
    checkMultipleBadges,
  };
};

// Hook para simular conquistas (para demonstração)
export const useAchievementDemo = () => {
  const { showAchievement } = useAchievements();

  const triggerDemoAchievement = (
    rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'rare'
  ) => {
    const rarityColors = {
      common: {
        from: 'from-slate-400',
        to: 'to-slate-600',
        border: 'border-slate-400/30',
        text: 'text-slate-600',
      },
      rare: {
        from: 'from-blue-400',
        to: 'to-blue-600',
        border: 'border-blue-400/30',
        text: 'text-blue-600',
      },
      epic: {
        from: 'from-purple-400',
        to: 'to-purple-600',
        border: 'border-purple-400/30',
        text: 'text-purple-600',
      },
      legendary: {
        from: 'from-amber-400',
        to: 'to-amber-600',
        border: 'border-amber-400/30',
        text: 'text-amber-600',
      },
    };

    const demoAchievements = {
      common: {
        id: 'demo-common',
        name: 'Primeiro Passo',
        description: 'Você deu seus primeiros passos na jornada musical!',
        icon: FiAward,
        category: 'milestone' as const,
        rarity: 'common' as const,
        unlocked: true,
        ...rarityColors.common,
      },
      rare: {
        id: 'demo-rare',
        name: 'Colecionador Dedicado',
        description:
          'Você acumulou 25 favoritos e mostra verdadeira paixão pela música clássica!',
        icon: FiStar,
        category: 'collection' as const,
        rarity: 'rare' as const,
        unlocked: true,
        ...rarityColors.rare,
      },
      epic: {
        id: 'demo-epic',
        name: 'Mestre do Conhecimento',
        description:
          'Sua contribuição para a comunidade é excepcional - 50+ anotações úteis!',
        icon: FiAward,
        category: 'expertise' as const,
        rarity: 'epic' as const,
        unlocked: true,
        ...rarityColors.epic,
      },
      legendary: {
        id: 'demo-legendary',
        name: 'Lenda Musical',
        description:
          'Você alcançou o ápice - um verdadeiro virtuoso em todos os aspectos!',
        icon: FiAward,
        category: 'milestone' as const,
        rarity: 'legendary' as const,
        unlocked: true,
        ...rarityColors.legendary,
      },
    };

    showAchievement(demoAchievements[rarity]);
  };

  return { triggerDemoAchievement };
};
