// stores/useAchievementStore.ts - Store para gerenciar conquistas persistentes
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Badge } from '../components/badges/BadgeSystem';
import { useAchievements } from '../components/achievement/AchievementToast';
import { useEffect } from 'react';

export interface UserAchievement {
  id: string;
  badgeId: string;
  userId: string;

  // Dados da conquista
  name: string;
  description: string;
  category: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

  // Timestamps
  unlockedAt: string;
  notificationShownAt?: string;
  lastViewedAt?: string;

  // Metadados
  progress?: number;
  maxProgress?: number;
  xpReward?: number;

  // Status
  isNew: boolean; // Se ainda não foi visualizada pelo usuário
  isNotified: boolean; // Se já foi mostrada como toast
}

export interface AchievementProgress {
  badgeId: string;
  currentValue: number;
  lastCheckedAt: string;

  // Para evitar spam de notificações
  lastProgressUpdate?: string;
}

interface AchievementStore {
  // Estados
  userAchievements: UserAchievement[];
  achievementProgress: Record<string, AchievementProgress>;
  totalXP: number;
  loading: boolean;

  // Actions básicas
  initializeAchievements: (userId: string) => Promise<void>;

  // Unlock achievements
  unlockAchievement: (
    userId: string,
    badgeId: string,
    achievementData: Omit<
      UserAchievement,
      'id' | 'userId' | 'unlockedAt' | 'isNew' | 'isNotified'
    >
  ) => Promise<UserAchievement | null>;

  // Marcar como visualizada
  markAsViewed: (achievementId: string) => Promise<void>;
  markAsNotified: (achievementId: string) => void;

  // Progress tracking
  updateProgress: (badgeId: string, currentValue: number) => void;
  shouldCheckForUnlock: (badgeId: string) => boolean;

  // Getters
  getNewAchievements: () => UserAchievement[];
  getAchievementsByCategory: (category: string) => UserAchievement[];
  getAchievementsByRarity: (rarity: string) => UserAchievement[];
  getTotalXP: () => number;
  getAchievementStreak: () => number;

  // Utilities
  calculateXPReward: (rarity: string) => number;
  isAchievementUnlocked: (badgeId: string) => boolean;
  getAchievementStats: () => {
    total: number;
    byRarity: Record<string, number>;
    byCategory: Record<string, number>;
    recentCount: number;
  };

  // Reset
  reset: () => void;
}

// Função para calcular XP baseado na raridade
const calculateXPByRarity = (rarity: string): number => {
  const xpMap = {
    COMMON: 10,
    RARE: 25,
    EPIC: 50,
    LEGENDARY: 100,
  };
  return xpMap[rarity as keyof typeof xpMap] || 10;
};

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      userAchievements: [],
      achievementProgress: {},
      totalXP: 0,
      loading: false,

      initializeAchievements: async (userId: string) => {
        set({ loading: true });

        try {
          // Buscar conquistas do usuário no servidor
          const response = await fetch(`/api/users/${userId}/achievements`);

          if (response.ok) {
            const data = await response.json();
            set({
              userAchievements: data.achievements || [],
              totalXP: data.totalXP || 0,
              achievementProgress: data.progress || {},
            });
          }
        } catch (error) {
          console.error('Erro ao inicializar conquistas:', error);
        } finally {
          set({ loading: false });
        }
      },

      unlockAchievement: async (userId, badgeId, achievementData) => {
        const { isAchievementUnlocked, calculateXPReward } = get();

        // Verificar se já foi desbloqueada
        if (isAchievementUnlocked(badgeId)) {
          return null;
        }

        const newAchievement: UserAchievement = {
          id: `${userId}-${badgeId}-${Date.now()}`,
          userId,
          ...achievementData,
          unlockedAt: new Date().toISOString(),
          xpReward: calculateXPReward(achievementData.rarity),
          isNew: true,
          isNotified: false,
        };

        try {
          // Salvar no servidor
          const response = await fetch('/api/achievements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAchievement),
          });

          if (!response.ok) {
            throw new Error('Erro ao salvar conquista');
          }

          const savedAchievement = await response.json();

          // Atualizar store local
          set((state) => ({
            userAchievements: [...state.userAchievements, savedAchievement],
            totalXP: state.totalXP + (newAchievement.xpReward ?? 0),
          }));

          console.log(
            '🏆 [ACHIEVEMENT] Desbloqueada:',
            newAchievement.name,
            `+${newAchievement.xpReward}XP`
          );

          return savedAchievement;
        } catch (error) {
          console.error('Erro ao desbloquear conquista:', error);
          return null;
        }
      },

      markAsViewed: async (achievementId: string) => {
        try {
          await fetch(`/api/achievements/${achievementId}/viewed`, {
            method: 'PATCH',
          });

          set((state) => ({
            userAchievements: state.userAchievements.map((achievement) =>
              achievement.id === achievementId
                ? {
                    ...achievement,
                    isNew: false,
                    lastViewedAt: new Date().toISOString(),
                  }
                : achievement
            ),
          }));
        } catch (error) {
          console.error('Erro ao marcar conquista como visualizada:', error);
        }
      },

      markAsNotified: (achievementId: string) => {
        set((state) => ({
          userAchievements: state.userAchievements.map((achievement) =>
            achievement.id === achievementId
              ? {
                  ...achievement,
                  isNotified: true,
                  notificationShownAt: new Date().toISOString(),
                }
              : achievement
          ),
        }));
      },

      updateProgress: (badgeId: string, currentValue: number) => {
        set((state) => ({
          achievementProgress: {
            ...state.achievementProgress,
            [badgeId]: {
              badgeId,
              currentValue,
              lastCheckedAt: new Date().toISOString(),
              lastProgressUpdate: new Date().toISOString(),
            },
          },
        }));
      },

      shouldCheckForUnlock: (badgeId: string) => {
        const progress = get().achievementProgress[badgeId];
        if (!progress) return true;

        // Verificar apenas a cada 30 segundos para evitar spam
        const lastCheck = new Date(progress.lastCheckedAt);
        const now = new Date();
        const diffSeconds = (now.getTime() - lastCheck.getTime()) / 1000;

        return diffSeconds > 30;
      },

      // Getters
      getNewAchievements: () => {
        return get().userAchievements.filter((a) => a.isNew);
      },

      getAchievementsByCategory: (category: string) => {
        return get().userAchievements.filter((a) => a.category === category);
      },

      getAchievementsByRarity: (rarity: string) => {
        return get().userAchievements.filter((a) => a.rarity === rarity);
      },

      getTotalXP: () => get().totalXP,

      getAchievementStreak: () => {
        const achievements = get().userAchievements.sort(
          (a, b) =>
            new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
        );

        let streak = 0;
        const currentDate = new Date();
        currentDate.setHours(23, 59, 59, 999); // Fim do dia atual

        for (const achievement of achievements) {
          const achievementDate = new Date(achievement.unlockedAt);
          achievementDate.setHours(23, 59, 59, 999);

          const diffDays = Math.floor(
            (currentDate.getTime() - achievementDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          if (diffDays <= streak + 1) {
            streak = Math.max(streak, diffDays + 1);
          } else {
            break;
          }
        }

        return streak;
      },

      calculateXPReward: calculateXPByRarity,

      isAchievementUnlocked: (badgeId: string) => {
        return get().userAchievements.some((a) => a.badgeId === badgeId);
      },

      getAchievementStats: () => {
        const achievements = get().userAchievements;
        const total = achievements.length;

        const byRarity = achievements.reduce((acc, achievement) => {
          acc[achievement.rarity] = (acc[achievement.rarity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const byCategory = achievements.reduce((acc, achievement) => {
          acc[achievement.category] = (acc[achievement.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Conquistas dos últimos 7 dias
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentCount = achievements.filter(
          (a) => new Date(a.unlockedAt) >= sevenDaysAgo
        ).length;

        return {
          total,
          byRarity,
          byCategory,
          recentCount,
        };
      },

      reset: () => {
        set({
          userAchievements: [],
          achievementProgress: {},
          totalXP: 0,
          loading: false,
        });
      },
    }),
    {
      name: 'achievements-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userAchievements: state.userAchievements,
        achievementProgress: state.achievementProgress,
        totalXP: state.totalXP,
      }),
    }
  )
);

// Hook para integrar com o sistema de badges existente
export const useAchievementIntegration = (userId?: string) => {
  const {
    userAchievements,
    unlockAchievement,
    updateProgress,
    shouldCheckForUnlock,
    markAsNotified,
    isAchievementUnlocked,
    initializeAchievements,
  } = useAchievementStore();

  const { showAchievement } = useAchievements();

  // Inicializar ao montar
  useEffect(() => {
    if (userId) {
      initializeAchievements(userId);
    }
  }, [userId]);

  // Função para verificar e desbloquear conquistas
  const checkAndUnlockBadges = async (badges: Badge[]) => {
    if (!userId) return;

    for (const badge of badges) {
      // Verificar se deve checar (throttle)
      if (!shouldCheckForUnlock(badge.id)) continue;

      // Se o badge está desbloqueado mas não está salvo
      if (badge.unlocked && !isAchievementUnlocked(badge.id)) {
        const achievement = await unlockAchievement(userId, badge.id, {
          name: badge.name,
          description: badge.description,
          category: badge.category,
          rarity: badge.rarity as any,
          progress: badge.progress,
          maxProgress: badge.maxProgress,
          badgeId: badge.id,
        });

        if (achievement) {
          // Mostrar toast notification
          showAchievement({
            ...badge,
            unlocked: true,
          });

          // Marcar como notificada
          markAsNotified(achievement.id);
        }
      }

      // Atualizar progresso
      if (badge.progress !== undefined) {
        updateProgress(badge.id, badge.progress);
      }
    }
  };

  // Função para marcar badges como unlocked baseado no que está salvo
  const mergeWithSavedAchievements = (badges: Badge[]): Badge[] => {
    return badges.map((badge) => ({
      ...badge,
      unlocked: badge.unlocked || isAchievementUnlocked(badge.id),
      unlockedAt: userAchievements.find((a) => a.badgeId === badge.id)
        ?.unlockedAt,
    }));
  };

  return {
    checkAndUnlockBadges,
    mergeWithSavedAchievements,
    userAchievements,
  };
};

// Esquema do banco de dados (Prisma)
/*
model UserAchievement {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  badgeId   String   // ID único da conquista
  
  // Dados da conquista
  name        String
  description String
  category    String
  rarity      String
  
  // Progress
  progress    Int?
  maxProgress Int?
  xpReward    Int      @default(10)
  
  // Status
  isNew       Boolean  @default(true)
  isNotified  Boolean  @default(false)
  
  // Timestamps
  unlockedAt           DateTime @default(now())
  notificationShownAt  DateTime?
  lastViewedAt         DateTime?
  
  // Relações
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Índices
  @@unique([userId, badgeId])
  @@index([userId, unlockedAt])
  @@index([userId, isNew])
  @@index([rarity, unlockedAt])
  @@map("user_achievements")
}

model AchievementProgress {
  id               String   @id @default(auto()) @map("_id") @db.ObjectId
  userId           String   @db.ObjectId
  badgeId          String
  currentValue     Int      @default(0)
  lastCheckedAt    DateTime @default(now())
  lastProgressUpdate DateTime?
  
  // Relações
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Índices
  @@unique([userId, badgeId])
  @@index([lastCheckedAt])
  @@map("achievement_progress")
}
*/
