// components/achievement/AchievementToast.tsx - VERSÃO COMPLETA CORRIGIDA
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { FiAward, FiX, FiStar, FiZap, FiShield } from 'react-icons/fi';
import { AnimatedItem } from '../../animation/AnimatedComponents';

// Interface para achievement
interface AchievementData {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  unlocked: boolean;
  color?: {
    from: string;
    to: string;
    border: string;
    text: string;
  };
  xpReward?: number;
  duration?: number;
}

// Interface para achievement ativo (no toast)
interface ActiveAchievement extends AchievementData {
  timestamp: number;
  toastId: string;
}

// Context para gerenciar achievement toasts globalmente
interface AchievementContextType {
  showAchievement: (achievement: AchievementData) => void;
  hideAchievement: (toastId: string) => void;
  achievements: ActiveAchievement[];
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

// Provider para achievements
interface AchievementProviderProps {
  children: React.ReactNode;
}

export function AchievementProvider({ children }: AchievementProviderProps) {
  const [achievements, setAchievements] = useState<ActiveAchievement[]>([]);

  const showAchievement = (achievement: AchievementData) => {
    const toastId = `achievement-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const activeAchievement: ActiveAchievement = {
      ...achievement,
      timestamp: Date.now(),
      toastId,
      duration: achievement.duration || 6000,
    };

    setAchievements((prev) => [...prev, activeAchievement]);

    // Auto-remover após duração
    setTimeout(() => {
      hideAchievement(toastId);
    }, activeAchievement.duration);
  };

  const hideAchievement = (toastId: string) => {
    setAchievements((prev) => prev.filter((a) => a.toastId !== toastId));
  };

  return (
    <AchievementContext.Provider
      value={{ showAchievement, hideAchievement, achievements }}
    >
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
  onHide: (toastId: string) => void;
}

function AchievementToastContainer({
  achievements,
  onHide,
}: AchievementToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[60] space-y-3 pointer-events-none">
      {achievements.map((achievement) => (
        <AchievementToast
          key={achievement.toastId}
          achievement={achievement}
          onClose={() => onHide(achievement.toastId)}
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

  // XP baseado na raridade se não fornecido
  const xpReward =
    achievement.xpReward ||
    {
      COMMON: 10,
      RARE: 25,
      EPIC: 50,
      LEGENDARY: 100,
    }[achievement.rarity];

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 100);

    // Barra de progresso
    const startTime = Date.now();
    const duration = achievement.duration || 6000;

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

  // Cores por raridade
  const rarityConfig = {
    COMMON: {
      gradient: 'from-slate-400 to-slate-600',
      icon: FiAward,
      label: 'Comum',
      border: 'border-slate-400/30',
    },
    RARE: {
      gradient: 'from-blue-400 to-blue-600',
      icon: FiStar,
      label: 'Raro',
      border: 'border-blue-400/30',
    },
    EPIC: {
      gradient: 'from-purple-400 to-purple-600',
      icon: FiZap,
      label: 'Épico',
      border: 'border-purple-400/30',
    },
    LEGENDARY: {
      gradient: 'from-amber-400 to-amber-600',
      icon: FiShield,
      label: 'Lendário',
      border: 'border-amber-400/30',
    },
  };

  const config = rarityConfig[achievement.rarity];

  return (
    <AnimatedItem
      direction="right"
      springType="bouncy"
      className={`pointer-events-auto transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`bg-theme-elevated border-2 ${config?.border} rounded-2xl shadow-2xl p-5 min-w-[350px] max-w-[420px] backdrop-blur-sm bg-opacity-98 shadow-theme-glow relative overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center space-x-4 mb-4 relative z-10">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br $ flex items-center justify-center shadow-lg relative`}
          >
            <Icon className="w-7 h-7 text-white drop-shadow-sm" />
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-bold text-theme-primary text-sm">
                Conquista Desbloqueada!
              </h4>
              {achievement.rarity === 'LEGENDARY' && (
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
            <div className="font-bold text-theme-primary text-lg">
              {achievement.name}
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-theme-secondary hover:bg-theme-primary flex items-center justify-center transition-colors text-theme-tertiary hover:text-theme-primary"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-theme-secondary mb-4 leading-relaxed relative z-10">
          {achievement.description}
        </p>

        {/* Footer com raridade e XP */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r $ text-white shadow-md`}
          >
            {config?.label}
          </span>

          <div className="text-sm font-bold text-theme-primary">
            +{xpReward} XP
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-theme-secondary rounded-full h-1.5 overflow-hidden relative z-10">
          <div
            className={`h-full bg-gradient-to-r $ transition-all duration-100 ease-linear`}
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

  const checkBadgeUnlocked = (badge: any, wasUnlockedBefore?: boolean) => {
    if (badge.unlocked && !wasUnlockedBefore) {
      showAchievement({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        rarity: badge.rarity,
        unlocked: true,
        color: badge.color,
        xpReward: getXPForRarity(badge.rarity),
      });
    }
  };

  const checkMultipleBadges = (badges: any[], previousBadges?: any[]) => {
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

// Helper para XP por raridade
function getXPForRarity(rarity: string): number {
  const xpMap: Record<string, number> = {
    COMMON: 10,
    RARE: 25,
    EPIC: 50,
    LEGENDARY: 100,
  };
  return xpMap[rarity] || 10;
}

// Hook para simular conquistas (para demonstração/teste)
export const useAchievementDemo = () => {
  const { showAchievement } = useAchievements();

  const triggerDemoAchievement = (
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' = 'RARE'
  ) => {
    const demoAchievements = {
      COMMON: {
        id: 'demo-common',
        name: 'Primeiro Passo',
        description: 'Você deu seus primeiros passos na jornada musical!',
        icon: FiAward,
        category: 'milestone',
        rarity: 'COMMON' as const,
        unlocked: true,
        color: {
          from: 'from-slate-400',
          to: 'to-slate-600',
          border: 'border-slate-400/30',
          text: 'text-slate-600',
        },
      },
      RARE: {
        id: 'demo-rare',
        name: 'Colecionador Dedicado',
        description:
          'Você acumulou 25 favoritos e mostra verdadeira paixão pela música clássica!',
        icon: FiStar,
        category: 'collection',
        rarity: 'RARE' as const,
        unlocked: true,
        color: {
          from: 'from-blue-400',
          to: 'to-blue-600',
          border: 'border-blue-400/30',
          text: 'text-blue-600',
        },
      },
      EPIC: {
        id: 'demo-epic',
        name: 'Mestre do Conhecimento',
        description:
          'Sua contribuição para a comunidade é excepcional - 50+ anotações úteis!',
        icon: FiZap,
        category: 'expertise',
        rarity: 'EPIC' as const,
        unlocked: true,
        color: {
          from: 'from-purple-400',
          to: 'to-purple-600',
          border: 'border-purple-400/30',
          text: 'text-purple-600',
        },
      },
      LEGENDARY: {
        id: 'demo-legendary',
        name: 'Lenda Musical',
        description:
          'Você alcançou o ápice - um verdadeiro virtuoso em todos os aspectos!',
        icon: FiShield,
        category: 'milestone',
        rarity: 'LEGENDARY' as const,
        unlocked: true,
        color: {
          from: 'from-amber-400',
          to: 'to-amber-600',
          border: 'border-amber-400/30',
          text: 'text-amber-600',
        },
      },
    };

    showAchievement(demoAchievements[rarity]);
  };

  return { triggerDemoAchievement };
};

// Hook para integração com o sistema de achievements do backend
export const useBackendAchievements = () => {
  const { showAchievement } = useAchievements();

  const handleNewAchievement = async (achievementData: any) => {
    // Converter dados do backend para formato do toast
    const rarityColors = {
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

    showAchievement({
      id: achievementData.badgeId,
      name: achievementData.name,
      description: achievementData.description,
      icon: getIconForBadgeId(achievementData.badgeId),
      category: achievementData.category.toLowerCase(),
      rarity: achievementData.rarity,
      unlocked: true,
      color: rarityColors[achievementData.rarity as keyof typeof rarityColors],
      xpReward: achievementData.xpReward,
    });

    // Marcar como visto no backend após mostrar o toast
    try {
      await fetch(`/api/achievements/${achievementData.badgeId}/viewed`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('Erro ao marcar achievement como visto:', error);
    }
  };

  return { handleNewAchievement };
};

// Função auxiliar para mapear badgeId para ícone
function getIconForBadgeId(
  badgeId: string
): React.ComponentType<{ className?: string }> {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'first-goal': FiAward,
    'first-completion': FiAward,
    'dedicated-student': FiAward,
    'first-favorite': FiAward,
    'collector-bronze': FiStar,
    'first-contribution': FiAward,
  };

  return iconMap[badgeId] || FiAward;
}
