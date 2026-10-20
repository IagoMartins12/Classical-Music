'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { PiMedal, PiX } from 'react-icons/pi';
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

/**
 * A medal arriving from the side: gold seal, the achievement's name in the
 * display face, its XP and a thin bar for the time left. One palette for
 * every rarity — the rarity is a word, not a color.
 */
function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const tx = useTx();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const xpReward = achievement.xpReward || getXPForRarity(achievement.rarity);
  const raridade = {
    COMMON: tx('Comum', 'Common'),
    RARE: tx('Rara', 'Rare'),
    EPIC: tx('Épica', 'Epic'),
    LEGENDARY: tx('Lendária', 'Legendary'),
  }[achievement.rarity];

  useEffect(() => {
    const entra = setTimeout(() => setIsVisible(true), 40);
    const startTime = Date.now();
    const duration = achievement.duration || 6000;
    let frame = 0;
    const updateProgress = () => {
      const remaining = Math.max(
        0,
        100 - ((Date.now() - startTime) / duration) * 100
      );
      setProgress(remaining);
      if (remaining > 0) frame = requestAnimationFrame(updateProgress);
    };
    updateProgress();
    return () => {
      clearTimeout(entra);
      cancelAnimationFrame(frame);
    };
  }, [achievement.duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      role="status"
      className={`sup-alta pointer-events-auto relative w-[min(22rem,calc(100vw-2rem))] overflow-hidden !rounded-card p-5 shadow-[var(--sombra-2)] transition-[transform,opacity] duration-[var(--t-folha)] ease-saida motion-reduce:transition-none ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full tint-ouro text-ouro-na-tinta">
          <PiMedal aria-hidden="true" className="h-6 w-6" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="t-legenda text-ouro-texto">
            {tx('Conquista desbloqueada', 'Achievement unlocked')}
          </span>
          <span className="font-display text-[1.25rem] leading-snug">
            {achievement.name}
          </span>
          {achievement.description && (
            <span className="t-rotulo text-texto-suave">
              {achievement.description}
            </span>
          )}
          <span className="mt-1 flex items-center gap-3 t-rotulo">
            <span className="text-texto-suave">{raridade}</span>
            <span className="font-medium text-ouro-texto">+{xpReward} XP</span>
          </span>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-texto-suave hover:bg-[var(--interactive-hover)] hover:text-texto"
        >
          <PiX aria-hidden="true" className="h-4 w-4" />
          <NomeAcao acao="fechar" />
        </button>
      </div>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 block h-0.5 bg-[var(--linha)]"
      >
        <span
          className="block h-full fill-ouro"
          style={{ width: `${progress}%` }}
        />
      </span>
    </div>
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
