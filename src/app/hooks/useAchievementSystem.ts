// hooks/useAchievementSystem.ts - Hook principal que integra tudo
'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import {
  useAchievementStore,
  useAchievementIntegration,
} from '@/app/stores/useAchievementStore';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';
import { useLearningStore } from '@/app/stores/useLearningStore';
import { useAnnotationsStore } from '@/app/stores/useAnnotationsStore';
import {
  createFavoritesBadges,
  createLearningBadges,
} from '@/app/components/badges/BadgeSystem';

// Hook principal que monitora mudanças e verifica conquistas
export const useAchievementSystem = () => {
  const { user } = useAuth();
  const { checkAndUnlockBadges, mergeWithSavedAchievements } =
    useAchievementIntegration(user?.id);

  // Stores
  const { favoriteComposers, favoriteWorks, favoriteScores } =
    useFavoritesStore();
  const { wantToLearn, learned } = useLearningStore();
  const { getUserAnnotations } = useAnnotationsStore();

  // Refs para detectar mudanças
  const lastStatsRef = useRef<{
    favoritesCount: number;
    learningCount: number;
    annotationsCount: number;
  }>({
    favoritesCount: 0,
    learningCount: 0,
    annotationsCount: 0,
  });

  // Função para calcular stats atuais
  const getCurrentStats = () => {
    const userAnnotationsList = user?.id ? getUserAnnotations(user.id) : [];

    return {
      // Stats de favoritos
      favoritesStats: {
        totalFavorites:
          favoriteComposers.length +
          favoriteWorks.length +
          favoriteScores.length,
        composersCount: favoriteComposers.length,
        worksCount: favoriteWorks.length,
        scoresCount: favoriteScores.length,
        // Simulados para demonstração
        streakDays: Math.min(
          Math.floor((favoriteWorks.length + favoriteComposers.length) / 3),
          7
        ),
        epochsCount: Math.min(
          new Set(favoriteComposers.map((f) => f.composer?.epochName)).size,
          6
        ),
        instrumentsCount: 4, // Simulado
        recentDiscoveries: Math.floor(
          (favoriteWorks.length + favoriteComposers.length) / 2
        ),
        topComposerWorks: Math.max(
          ...Object.values(
            favoriteWorks.reduce((acc: Record<string, number>, work) => {
              const composer = work.work?.composer.fullName || 'Unknown';
              acc[composer] = (acc[composer] || 0) + 1;
              return acc;
            }, {})
          ),
          0
        ),
      },

      // Stats de learning
      learningStats: {
        totalLearning: wantToLearn.length + learned.length,
        wantToLearnCount: wantToLearn.length,
        learnedCount: learned.length,
        avgMastery:
          learned.length > 0
            ? learned.reduce((sum, item) => sum + item.mastery, 0) /
              learned.length
            : 0,
        expertLevelCount: learned.filter((item) => item.mastery >= 4).length,
        publicPerformances: learned.filter((item) => item.publicPerformance)
          .length,
        avgStudyTime: 30, // Simulado
        currentStreak: Math.min(learned.length, 14),
        completionRate:
          wantToLearn.length + learned.length > 0
            ? (learned.length / (wantToLearn.length + learned.length)) * 100
            : 0,
      },

      // Stats de anotações
      annotationsStats: {
        totalAnnotations: userAnnotationsList.length,
        publicAnnotations: userAnnotationsList.filter((a) => a.isPublic).length,
        verifiedAnnotations: userAnnotationsList.filter((a) => a.isVerified)
          .length,
        totalHelpfulVotes: userAnnotationsList.reduce(
          (sum, a) => sum + a.helpfulCount,
          0
        ),
        totalViews: userAnnotationsList.reduce(
          (sum, a) => sum + a.viewCount,
          0
        ),
        avgHelpfulVotes:
          userAnnotationsList.length > 0
            ? userAnnotationsList.reduce((sum, a) => sum + a.helpfulCount, 0) /
              userAnnotationsList.length
            : 0,
        highPerformingCount: userAnnotationsList.filter(
          (a) => a.helpfulCount >= 5
        ).length,
        categoriesUsed: new Set(userAnnotationsList.map((a) => a.category))
          .size,
        recentAnnotations: userAnnotationsList.filter((a) => {
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return new Date(a.createdAt) >= thirtyDaysAgo;
        }).length,
        helpfulnessRate:
          userAnnotationsList.length > 0
            ? (userAnnotationsList.filter((a) => a.helpfulCount > 0).length /
                userAnnotationsList.length) *
              100
            : 0,
      },
    };
  };

  // Effect para verificar conquistas quando stats mudam
  useEffect(() => {
    if (!user?.id) return;

    const currentStats = getCurrentStats();
    const lastStats = lastStatsRef.current;

    // Detectar mudanças significativas
    const favoritesChanged =
      currentStats.favoritesStats.totalFavorites !== lastStats.favoritesCount;
    const learningChanged =
      currentStats.learningStats.totalLearning !== lastStats.learningCount;
    const annotationsChanged =
      currentStats.annotationsStats.totalAnnotations !==
      lastStats.annotationsCount;

    if (favoritesChanged || learningChanged || annotationsChanged) {
      console.log(
        '🔍 [ACHIEVEMENTS] Stats mudaram, verificando conquistas...',
        {
          favorites: currentStats.favoritesStats.totalFavorites,
          learning: currentStats.learningStats.totalLearning,
          annotations: currentStats.annotationsStats.totalAnnotations,
        }
      );

      // Criar badges atualizados
      const favoritesBadges = createFavoritesBadges(
        currentStats.favoritesStats
      );
      const learningBadges = createLearningBadges(currentStats.learningStats);

      // Badges de anotações (você pode adicionar createAnnotationsBadges similar)
      const allBadges = [...favoritesBadges, ...learningBadges];

      // Verificar e desbloquear
      checkAndUnlockBadges(allBadges);

      // Atualizar ref
      lastStatsRef.current = {
        favoritesCount: currentStats.favoritesStats.totalFavorites,
        learningCount: currentStats.learningStats.totalLearning,
        annotationsCount: currentStats.annotationsStats.totalAnnotations,
      };
    }
  }, [
    user?.id,
    favoriteComposers.length,
    favoriteWorks.length,
    favoriteScores.length,
    wantToLearn.length,
    learned.length,
    // Dependência do userAnnotations seria ideal, mas pode causar re-renders excessivos
    // getUserAnnotations(user?.id || '').length,
    checkAndUnlockBadges,
  ]);

  // Retornar funções úteis
  const getBadgesWithPersistence = () => {
    if (!user?.id) return { favoritesBadges: [], learningBadges: [] };

    const currentStats = getCurrentStats();
    const favoritesBadges = createFavoritesBadges(currentStats.favoritesStats);
    const learningBadges = createLearningBadges(currentStats.learningStats);

    return {
      favoritesBadges: mergeWithSavedAchievements(favoritesBadges),
      learningBadges: mergeWithSavedAchievements(learningBadges),
    };
  };

  const triggerManualCheck = () => {
    if (!user?.id) return;

    const currentStats = getCurrentStats();
    const favoritesBadges = createFavoritesBadges(currentStats.favoritesStats);
    const learningBadges = createLearningBadges(currentStats.learningStats);

    checkAndUnlockBadges([...favoritesBadges, ...learningBadges]);
  };

  return {
    getBadgesWithPersistence,
    triggerManualCheck,
    isEnabled: !!user?.id,
  };
};

// Hook para componentes consumirem badges com persistência
export const useBadgesWithPersistence = () => {
  const { getBadgesWithPersistence } = useAchievementSystem();
  const { userAchievements, totalXP, getAchievementStats } =
    useAchievementStore();

  const badges = getBadgesWithPersistence();
  const stats = getAchievementStats();

  return {
    ...badges,
    userAchievements,
    totalXP,
    achievementStats: stats,
    hasNewAchievements: userAchievements.some((a) => a.isNew),
    newAchievementsCount: userAchievements.filter((a) => a.isNew).length,
  };
};
