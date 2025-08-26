// hooks/useAchievements.ts - Hook principal para gerenciar achievements
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAchievements } from '../components/achievement/AchievementToast';

// Tipos para rarity
type AchievementRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

interface Achievement {
  badgeId: string;
  name: string;
  description: string;
  category: 'LEARNING' | 'FAVORITES' | 'ANNOTATIONS';
  rarity: AchievementRarity;
  progress?: number;
  maxProgress?: number;
  xpReward: number;
  isNew: boolean;
  unlockedAt: string;
}

interface AchievementStats {
  total: number;
  newCount: number;
  totalXP: number;
  byRarity: Record<string, number>;
  byCategory: Record<string, number>;
}

// Cores para cada rarity com tipagem adequada
interface RarityColor {
  from: string;
  to: string;
  border: string;
  text: string;
}

export function useAchievementSystem() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { showAchievement } = useAchievements();

  // Buscar achievements do usuário
  const fetchAchievements = useCallback(async (category?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.set('category', category);

      const response = await fetch(`/api/achievements?${params}`);
      const data = await response.json();

      if (data.success) {
        setAchievements(data.achievements);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao buscar achievements:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar novos achievements desbloqueados
  const checkNewAchievements = useCallback(
    async (category: string) => {
      try {
        const response = await fetch('/api/achievements/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category }),
        });

        const data = await response.json();

        if (data.success && data.newAchievements.length > 0) {
          // Atualizar lista de achievements
          await fetchAchievements();

          // 🔧 CORREÇÃO: Tipagem adequada das cores
          const rarityColors: Record<AchievementRarity, RarityColor> = {
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

          // Mostrar toasts para novos achievements
          for (const achievement of data.newAchievements) {
            // Mostrar toast com type assertion segura
            showAchievement({
              id: achievement.badgeId,
              name: achievement.name,
              description: achievement.description,
              icon: getBadgeIcon(achievement.badgeId),
              category: achievement.category.toLowerCase(),
              rarity: achievement.rarity.toLowerCase(),
              unlocked: true,
              color: rarityColors[achievement.rarity as AchievementRarity],
            });

            // Delay entre toasts para não sobrecarregar
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          return data.newAchievements;
        }

        return [];
      } catch (error) {
        console.error('Erro ao verificar novos achievements:', error);
        return [];
      }
    },
    [fetchAchievements, showAchievement]
  );

  // Marcar achievement como visto
  const markAsViewed = useCallback(async (badgeId: string) => {
    try {
      await fetch(`/api/achievements/${badgeId}/viewed`, {
        method: 'PATCH',
      });

      // Atualizar estado local
      setAchievements((prev) =>
        prev.map((a) => (a.badgeId === badgeId ? { ...a, isNew: false } : a))
      );
    } catch (error) {
      console.error('Erro ao marcar achievement como visto:', error);
    }
  }, []);

  return {
    achievements,
    stats,
    loading,
    fetchAchievements,
    checkNewAchievements,
    markAsViewed,
  };
}

// Hook específico para Learning
export function useLearningAchievements() {
  const { checkNewAchievements } = useAchievementSystem();

  const checkLearningProgress = useCallback(
    async (
      wantToLearnCount: number,
      learnedCount: number,
      avgMastery: number,
      publicPerformances: number,
      streakDays: number
    ) => {
      // Debounce para evitar chamadas excessivas
      const timeoutId = setTimeout(async () => {
        await checkNewAchievements('LEARNING');
      }, 2000);

      return () => clearTimeout(timeoutId);
    },
    [checkNewAchievements]
  );

  return { checkLearningProgress };
}

// Hook específico para Favorites
export function useFavoritesAchievements() {
  const { checkNewAchievements } = useAchievementSystem();

  const checkFavoritesProgress = useCallback(
    async (
      totalFavorites: number,
      composersCount: number,
      worksCount: number,
      scoresCount: number,
      epochsCount: number
    ) => {
      const timeoutId = setTimeout(async () => {
        await checkNewAchievements('FAVORITES');
      }, 2000);

      return () => clearTimeout(timeoutId);
    },
    [checkNewAchievements]
  );

  return { checkFavoritesProgress };
}

// Hook específico para Annotations
export function useAnnotationsAchievements() {
  const { checkNewAchievements } = useAchievementSystem();

  const checkAnnotationsProgress = useCallback(
    async (
      totalAnnotations: number,
      totalHelpfulVotes: number,
      verifiedAnnotations: number,
      categoriesUsed: number
    ) => {
      const timeoutId = setTimeout(async () => {
        await checkNewAchievements('ANNOTATIONS');
      }, 2000);

      return () => clearTimeout(timeoutId);
    },
    [checkNewAchievements]
  );

  return { checkAnnotationsProgress };
}

// Função auxiliar para obter ícone do badge
function getBadgeIcon(badgeId: string) {
  // Mapear badgeId para ícones do react-icons/fi
  const iconMap: Record<string, any> = {
    'first-goal': () => null, // FiTarget será importado dinamicamente
    'first-completion': () => null, // FiCheckCircle
    'dedicated-student': () => null, // FiBookOpen
    'experienced-musician': () => null, // FiAward
    'first-favorite': () => null, // FiHeart
    'collector-bronze': () => null, // FiStar
    'collector-silver': () => null, // BiTrophy
    'epoch-explorer': () => null, // FiZap
    'first-contribution': () => null, // FiMessageSquare
    'first-helpful': () => null, // FiThumbsUp
    'active-contributor': () => null, // FiUsers
    'helpful-expert': () => null, // FiAward
    'verified-scholar': () => null, // MdVerified
  };

  // Por padrão, retornar FiAward se não encontrar
  return iconMap[badgeId] || (() => null);
}

// Hook para auto-detecção de achievements baseado em mudanças de dados
export function useAutoAchievementDetection() {
  const { checkLearningProgress } = useLearningAchievements();
  const { checkFavoritesProgress } = useFavoritesAchievements();
  const { checkAnnotationsProgress } = useAnnotationsAchievements();

  // Auto-detectar mudanças nos dados e verificar achievements
  const detectChanges = useCallback(
    (type: 'learning' | 'favorites' | 'annotations', stats: any) => {
      switch (type) {
        case 'learning':
          return checkLearningProgress(
            stats.wantToLearnCount || 0,
            stats.learnedCount || 0,
            stats.avgMastery || 0,
            stats.publicPerformances || 0,
            stats.currentStreak || 0
          );

        case 'favorites':
          return checkFavoritesProgress(
            stats.totalFavorites || 0,
            stats.composersCount || 0,
            stats.worksCount || 0,
            stats.scoresCount || 0,
            stats.epochsCount || 0
          );

        case 'annotations':
          return checkAnnotationsProgress(
            stats.totalAnnotations || 0,
            stats.totalHelpfulVotes || 0,
            stats.verifiedAnnotations || 0,
            stats.categoriesUsed || 0
          );
      }
    },
    [checkLearningProgress, checkFavoritesProgress, checkAnnotationsProgress]
  );

  return { detectChanges };
}
