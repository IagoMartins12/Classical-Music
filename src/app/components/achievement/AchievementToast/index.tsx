// components/achievement/AchievementToast.tsx - VERSÃO COMPLETA CORRIGIDA
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { PiLightning, PiMedal, PiShield, PiStar, PiX } from 'react-icons/pi';
import { AnimatedItem } from '../../animation/AnimatedComponents';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { useTx } from '@/app/hooks/useTx';

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
    <div className="fixed top-4 right-4 z-aviso space-y-3 pointer-events-none">
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
  const tx = useTx();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const Icon = achievement.icon;

  console.log('ANCHIVE', achievement);
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
      icon: PiMedal,
      label: tx('Comum', 'Common'),
      border: 'border-slate-400/30',
    },
    RARE: {
      gradient: 'from-blue-400 to-blue-600',
      icon: PiStar,
      label: tx('Raro', 'Rare'),
      border: 'border-blue-400/30',
    },
    EPIC: {
      gradient: 'from-purple-400 to-purple-600',
      icon: PiLightning,
      label: tx('Épico', 'Epic'),
      border: 'border-purple-400/30',
    },
    LEGENDARY: {
      gradient: 'from-amber-400 to-amber-600',
      icon: PiShield,
      label: tx('Lendário', 'Legendary'),
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
        className={`bg-theme-elevated border-2 ${config?.border} rounded-2xl shadow-2xl p-5 min-w-[350px] max-w-[420px] backdrop-blur-sm shadow-theme-glow relative overflow-hidden`}
      >
        {/* Header */}
        <Inline gap={4} className="mb-4 relative z-10">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br $ flex items-center justify-center shadow-lg relative`}
          >
            {config ? (
              <config.icon className="w-7 h-7 text-theme-primary " />
            ) : Icon ? (
              <Icon className="w-7 h-7 text-theme-primary " />
            ) : (
              <PiMedal className="w-7 h-7 text-theme-primary " />
            )}
          </div>

          <div className="flex-1">
            <Inline gap={2} className="mb-1">
              <h4 className="font-bold text-theme-primary text-sm">
                {tx('Conquista Desbloqueada!', 'Achievement unlocked')}
              </h4>
              {achievement.rarity === 'LEGENDARY' && (
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <PiStar
                      key={i}
                      className="w-3 h-3 text-amber-400 animate-pulse"
                    />
                  ))}
                </div>
              )}
            </Inline>
            <div className="font-bold text-theme-primary text-lg">
              {achievement.name}
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-theme-secondary flex items-center justify-center transition-colors text-theme-tertiary"
          >
            <PiX className="w-4 h-4" />
            <NomeAcao acao="fechar" />
          </button>
        </Inline>

        {/* Description */}
        <Text
          papel="rotulo"
          tom="suave"
          as="p"
          className="mb-4 leading-relaxed relative z-10"
        >
          {achievement.description}
        </Text>

        {/* Footer com raridade e XP */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r $ text-theme-primary shadow-md`}
          >
            {config?.label}
          </span>

          <Text papel="rotulo" tom="forte" as="div" className="font-bold">
            +{xpReward} XP
          </Text>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-theme-secondary rounded-full h-1.5 overflow-hidden relative z-10">
          <div
            className={`h-full progress-bar transition-all duration-100 ease-linear`}
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
