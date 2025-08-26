// components/badges/LearningBadgeSystem.tsx - Sistema específico para Learning
'use client';

import {
  FiTarget,
  FiCheckCircle,
  FiAward,
  FiStar,
  FiMusic,
  FiUsers,
  FiTrendingUp,
  FiZap,
  FiClock,
  FiBookOpen,
  FiShield,
} from 'react-icons/fi';
import { PiTarget } from 'react-icons/pi';
import { BiTrophy, BiCrown } from 'react-icons/bi';
import { useAchievementSystem } from '@/app/hooks/useAchievements';
import { useCallback } from 'react';
import { Badge } from '../BadgeSystem';
import { FaFire } from 'react-icons/fa';
import { CTAPriority, SmartCTA } from '../FavoritesBadgeSystem';

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

interface LearningStats {
  // Básicos
  totalLearning: number;
  wantToLearnCount: number;
  learnedCount: number;

  // Qualidade
  avgMastery: number;
  expertLevelCount: number; // obras com maestria 4+
  perfectMasteryCount?: number; // obras com maestria 5

  // Performance e Social
  publicPerformances: number;
  totalRecitals?: number;

  // Tempo e Eficiência
  avgStudyTime: number; // dias médios para completar obra
  fastCompletions?: number; // obras completadas em tempo record

  // Consistência
  currentStreak: number;
  longestStreak?: number;
  completionRate: number; // % de obras finalizadas vs iniciadas

  // Diversidade
  uniqueComposers: number;
  uniqueEpochs: number;
  uniqueInstruments?: number;

  // Atividade Recente
  learnedThisMonth: number;
  learnedThisYear: number;

  // Metas e Planejamento
  worksWithDeadlines?: number;
  achievedDeadlines?: number;
}

export function createLearningBadges(stats: LearningStats): Badge[] {
  return [
    // ============ MILESTONE & INÍCIO ============
    {
      id: 'first-goal',
      name: 'Primeiro Objetivo',
      description: 'Você deu o primeiro passo na sua jornada musical!',
      icon: PiTarget,
      category: 'milestone',
      rarity: 'common',
      unlocked: stats.totalLearning >= 1,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'dedicated-student',
      name: 'Estudante Dedicado',
      description: 'Você tem 10 obras em sua lista de estudos. Que dedicação!',
      icon: FiBookOpen,
      category: 'learning',
      rarity: 'common',
      progress: Math.min(stats.wantToLearnCount, 10),
      maxProgress: 10,
      unlocked: stats.wantToLearnCount >= 10,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'dream-library',
      name: 'Biblioteca de Sonhos',
      description:
        'Sua lista de estudos tem 25 obras. Seus sonhos musicais são grandes!',
      icon: FiMusic,
      category: 'learning',
      rarity: 'rare',
      progress: Math.min(stats.wantToLearnCount, 25),
      maxProgress: 25,
      unlocked: stats.wantToLearnCount >= 25,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'goal-collector',
      name: 'Colecionador de Metas',
      description:
        'Com 50 obras na lista, você planeja conquistar o mundo musical!',
      icon: FiTarget,
      category: 'learning',
      rarity: 'epic',
      progress: Math.min(stats.wantToLearnCount, 50),
      maxProgress: 50,
      unlocked: stats.wantToLearnCount >= 50,
      ...RARITY_COLORS.EPIC,
    },

    // ============ MAESTRIA & COMPLETION ============
    {
      id: 'first-completion',
      name: 'Primeira Conquista',
      description: 'Parabéns! Você completou sua primeira obra musical.',
      icon: FiCheckCircle,
      category: 'learning',
      rarity: 'common',
      unlocked: stats.learnedCount >= 1,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'persistent-learner',
      name: 'Aprendiz Persistente',
      description:
        'Com 5 obras dominadas, você mostra verdadeira persistência!',
      icon: FiAward,
      category: 'learning',
      rarity: 'common',
      progress: Math.min(stats.learnedCount, 5),
      maxProgress: 5,
      unlocked: stats.learnedCount >= 5,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'experienced-musician',
      name: 'Músico Experiente',
      description: 'Com 15 obras dominadas, você já é um músico experiente!',
      icon: BiTrophy,
      category: 'expertise',
      rarity: 'rare',
      progress: Math.min(stats.learnedCount, 15),
      maxProgress: 15,
      unlocked: stats.learnedCount >= 15,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'virtuoso',
      name: 'Virtuoso',
      description: 'Você dominou 30 obras! Seu talento é inquestionável.',
      icon: BiCrown,
      category: 'expertise',
      rarity: 'epic',
      progress: Math.min(stats.learnedCount, 30),
      maxProgress: 30,
      unlocked: stats.learnedCount >= 30,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'musical-legend',
      name: 'Lenda Musical',
      description: 'Com 50+ obras dominadas, você entrou para a história!',
      icon: FiShield,
      category: 'milestone',
      rarity: 'legendary',
      progress: Math.min(stats.learnedCount, 50),
      maxProgress: 50,
      unlocked: stats.learnedCount >= 50,
      ...RARITY_COLORS.LEGENDARY,
    },

    // ============ QUALIDADE & PERFORMANCE ============
    {
      id: 'quality-seeker',
      name: 'Buscador da Excelência',
      description:
        'Você mantém uma maestria média de 4+. Qualidade acima de tudo!',
      icon: FiStar,
      category: 'expertise',
      rarity: 'rare',
      progress: Math.min(Math.round(stats.avgMastery * 10), 40),
      maxProgress: 40,
      unlocked: stats.avgMastery >= 4.0,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'perfectionist',
      name: 'Perfeccionista',
      description:
        'Maestria média de 4.5+! Você é um verdadeiro perfeccionista.',
      icon: BiCrown,
      category: 'expertise',
      rarity: 'epic',
      progress: Math.min(Math.round(stats.avgMastery * 10), 45),
      maxProgress: 45,
      unlocked: stats.avgMastery >= 4.5,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'expert-master',
      name: 'Mestre Expert',
      description:
        'Você tem 10+ obras com maestria máxima (4+). Impressionante!',
      icon: FiAward,
      category: 'expertise',
      rarity: 'epic',
      progress: Math.min(stats.expertLevelCount, 10),
      maxProgress: 10,
      unlocked: stats.expertLevelCount >= 10,
      ...RARITY_COLORS.EPIC,
    },

    // Performance Badges
    {
      id: 'stage-debut',
      name: 'Estreia no Palco',
      description:
        'Você realizou sua primeira performance pública! Que coragem!',
      icon: FiUsers,
      category: 'social',
      rarity: 'rare',
      unlocked: stats.publicPerformances >= 1,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'experienced-performer',
      name: 'Performer Experiente',
      description:
        'Com 5 performances públicas, você já é um artista experiente!',
      icon: BiTrophy,
      category: 'social',
      rarity: 'epic',
      progress: Math.min(stats.publicPerformances, 5),
      maxProgress: 5,
      unlocked: stats.publicPerformances >= 5,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'concert-artist',
      name: 'Artista Conceituado',
      description:
        '10+ performances! Você é um verdadeiro artista conceituado.',
      icon: FiAward,
      category: 'social',
      rarity: 'legendary',
      progress: Math.min(stats.publicPerformances, 10),
      maxProgress: 10,
      unlocked: stats.publicPerformances >= 10,
      ...RARITY_COLORS.LEGENDARY,
    },

    // ============ EFICIÊNCIA & CONSISTÊNCIA ============
    {
      id: 'efficient-learner',
      name: 'Aprendiz Eficiente',
      description: 'Você completa 80% das obras que inicia. Que eficiência!',
      icon: FiZap,
      category: 'expertise',
      rarity: 'rare',
      progress: Math.min(Math.round(stats.completionRate), 80),
      maxProgress: 80,
      unlocked: stats.completionRate >= 80,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'learning-machine',
      name: 'Máquina de Aprender',
      description: '90%+ de taxa de conclusão! Você é imparável.',
      icon: FiTrendingUp,
      category: 'expertise',
      rarity: 'epic',
      progress: Math.min(Math.round(stats.completionRate), 90),
      maxProgress: 90,
      unlocked: stats.completionRate >= 90,
      ...RARITY_COLORS.EPIC,
    },

    // Consistency Badges
    {
      id: 'weekly-streak',
      name: 'Streak Semanal',
      description: 'Você praticou consistentemente por uma semana inteira!',
      icon: FaFire,
      category: 'dedication',
      rarity: 'rare',
      progress: Math.min(stats.currentStreak, 7),
      maxProgress: 7,
      unlocked: stats.currentStreak >= 7,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'monthly-productive',
      name: 'Mês Produtivo',
      description: 'Você completou 5 obras em 30 dias. Que produtividade!',
      icon: FiClock,
      category: 'dedication',
      rarity: 'epic',
      progress: Math.min(stats.learnedThisMonth, 5),
      maxProgress: 5,
      unlocked: stats.learnedThisMonth >= 5,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'unstoppable-dedication',
      name: 'Dedicação Inabalável',
      description: 'Um streak de 30+ dias! Sua dedicação é inspiradora.',
      icon: FiShield,
      category: 'dedication',
      rarity: 'legendary',
      progress: Math.min(stats.currentStreak, 30),
      maxProgress: 30,
      unlocked: stats.currentStreak >= 30,
      ...RARITY_COLORS.LEGENDARY,
    },

    // ============ DIVERSIDADE & EXPLORAÇÃO ============
    {
      id: 'musical-explorer',
      name: 'Explorador Musical',
      description: 'Você estudou obras de 3 compositores diferentes!',
      icon: FiZap,
      category: 'expertise',
      rarity: 'common',
      progress: Math.min(stats.uniqueComposers, 3),
      maxProgress: 3,
      unlocked: stats.uniqueComposers >= 3,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'time-traveler',
      name: 'Viajante do Tempo',
      description: 'Você explorou 4 épocas musicais diferentes!',
      icon: FiClock,
      category: 'expertise',
      rarity: 'rare',
      progress: Math.min(stats.uniqueEpochs, 4),
      maxProgress: 4,
      unlocked: stats.uniqueEpochs >= 4,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'multi-instrumental',
      name: 'Multi-Instrumental',
      description: 'Você estuda para 3+ instrumentos diferentes!',
      icon: FiMusic,
      category: 'expertise',
      rarity: 'rare',
      progress: Math.min(stats.uniqueInstruments || 0, 3),
      maxProgress: 3,
      unlocked: (stats.uniqueInstruments || 0) >= 3,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'universal-scholar',
      name: 'Conhecedor Universal',
      description: 'Você domina 6+ épocas musicais diferentes!',
      icon: FiBookOpen,
      category: 'expertise',
      rarity: 'epic',
      progress: Math.min(stats.uniqueEpochs, 6),
      maxProgress: 6,
      unlocked: stats.uniqueEpochs >= 6,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'diversity-master',
      name: 'Mestre da Diversidade',
      description: 'Você estudou obras de 10+ compositores diferentes!',
      icon: FiShield,
      category: 'expertise',
      rarity: 'legendary',
      progress: Math.min(stats.uniqueComposers, 10),
      maxProgress: 10,
      unlocked: stats.uniqueComposers >= 10,
      ...RARITY_COLORS.LEGENDARY,
    },
  ];
}

// Hook específico para Learning Achievements com auto-detecção
export function useLearningAchievementDetection() {
  const { checkNewAchievements } = useAchievementSystem();

  const checkLearningAchievements = useCallback(
    async (stats: LearningStats) => {
      // Verificar se houve mudanças significativas que merecem check
      const significantStats = [
        stats.totalLearning,
        stats.learnedCount,
        Math.floor(stats.avgMastery), // Apenas mudanças inteiras de maestria
        stats.publicPerformances,
        Math.floor(stats.completionRate / 10), // Mudanças de 10% na taxa
        stats.currentStreak,
        stats.uniqueComposers,
        stats.uniqueEpochs,
      ];

      // Debounce: apenas verificar após 3 segundos de inatividade
      const timeoutId = setTimeout(async () => {
        try {
          const newAchievements = await checkNewAchievements('LEARNING');

          if (newAchievements.length > 0) {
            console.log(
              `🏆 [LEARNING] ${newAchievements.length} novos achievements desbloqueados!`
            );
          }
        } catch (error) {
          console.error('Erro ao verificar achievements de learning:', error);
        }
      }, 3000);

      return () => clearTimeout(timeoutId);
    },
    [checkNewAchievements]
  );

  return { checkLearningAchievements };
}

// Função para calcular próximos achievements (para CTAs)
export function getNextLearningAchievements(stats: LearningStats) {
  const badges = createLearningBadges(stats);
  const locked = badges.filter((b) => !b.unlocked);

  // Ordenar por proximidade (baseado em progresso)
  const sorted = locked.sort((a, b) => {
    if (!a.maxProgress && !b.maxProgress) return 0;
    if (!a.maxProgress) return 1;
    if (!b.maxProgress) return -1;

    const progressA = (a.progress || 0) / a.maxProgress;
    const progressB = (b.progress || 0) / b.maxProgress;

    return progressB - progressA;
  });

  return sorted.slice(0, 3); // Top 3 próximos achievements
}

// CTAs inteligentes baseados no progresso
export function getLearningSmartCTAs(stats: LearningStats): SmartCTA[] {
  const ctas: SmartCTA[] = [];

  // CTA: Adicionar mais metas se tem poucas
  if (stats.wantToLearnCount < 5) {
    ctas.push({
      id: 'add-goals',
      title: 'Defina Mais Metas',
      description: 'Adicione mais obras à sua lista de estudos',
      action: 'Explorar Obras',
      url: '/works',
      priority: 'high',
    });
  }

  // CTA: Focar na qualidade se maestria está baixa
  if (stats.avgMastery < 3 && stats.learnedCount > 0) {
    ctas.push({
      id: 'improve-mastery',
      title: 'Foque na Qualidade',
      description: 'Dedique mais tempo para dominar completamente cada obra',
      action: 'Ver Dicas de Estudo',
      url: '/learning/tips',
      priority: 'medium',
    });
  }

  // CTA: Primeira performance se tem obras dominadas mas nunca se apresentou
  if (stats.expertLevelCount >= 3 && stats.publicPerformances === 0) {
    ctas.push({
      id: 'first-performance',
      title: 'Que tal um Recital?',
      description: 'Você já domina várias obras. Hora de se apresentar!',
      action: 'Dicas de Performance',
      url: '/learning/performance-tips',
      priority: 'high',
    });
  }

  // CTA: Diversificar se só estuda um compositor/época
  if (stats.uniqueComposers <= 2 && stats.learnedCount >= 3) {
    ctas.push({
      id: 'diversify',
      title: 'Explore Novos Horizontes',
      description: 'Diversifique estudando diferentes compositores e épocas',
      action: 'Descobrir Compositores',
      url: '/composers',
      priority: 'medium',
    });
  }

  // CTA: Melhorar consistência se taxa de conclusão é baixa
  if (stats.completionRate < 70 && stats.totalLearning >= 5) {
    ctas.push({
      id: 'improve-completion',
      title: 'Foque nas Metas Atuais',
      description: 'Termine as obras que já começou antes de adicionar novas',
      action: 'Ver Lista Atual',
      url: '/learning?tab=want-to-learn',
      priority: 'high',
    });
  }

  // Ordenar por prioridade
  const priorityOrder: Record<CTAPriority, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  return ctas
    .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    .slice(0, 2);
}
