// components/badges/LearningBadgeSystem.tsx - Sistema específico para Learning com TRADUÇÃO
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
import { Language } from '@/app/utils/translations/serverTranslations';

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

// Função para traduzir badges baseado na linguagem
const getBadgeTranslations = (lang: 'pt' | 'en') => {
  if (lang === 'en') {
    return {
      // ============ MILESTONE & INÍCIO ============
      firstGoal: {
        name: 'First Goal',
        description: 'You took the first step in your musical journey!',
      },
      dedicatedStudent: {
        name: 'Dedicated Student',
        description: 'You have 10 works on your study list. What dedication!',
      },
      dreamLibrary: {
        name: 'Dream Library',
        description:
          'Your study list has 25 works. Your musical dreams are big!',
      },
      goalCollector: {
        name: 'Goal Collector',
        description:
          'With 50 works on the list, you plan to conquer the musical world!',
      },

      // ============ MAESTRIA & COMPLETION ============
      firstCompletion: {
        name: 'First Achievement',
        description: 'Congratulations! You completed your first musical work.',
      },
      persistentLearner: {
        name: 'Persistent Learner',
        description: 'With 5 works mastered, you show true persistence!',
      },
      experiencedMusician: {
        name: 'Experienced Musician',
        description:
          'With 15 works mastered, you are already an experienced musician!',
      },
      virtuoso: {
        name: 'Virtuoso',
        description: 'You mastered 30 works! Your talent is unquestionable.',
      },
      musicalLegend: {
        name: 'Musical Legend',
        description: 'With 50+ works mastered, you entered history!',
      },

      // ============ QUALIDADE & PERFORMANCE ============
      qualitySeeker: {
        name: 'Excellence Seeker',
        description:
          'You maintain an average mastery of 4+. Quality above all!',
      },
      perfectionist: {
        name: 'Perfectionist',
        description: 'Average mastery of 4.5+! You are a true perfectionist.',
      },
      expertMaster: {
        name: 'Expert Master',
        description:
          'You have 10+ works with maximum mastery (4+). Impressive!',
      },

      // Performance Badges
      stageDebut: {
        name: 'Stage Debut',
        description:
          'You performed your first public performance! What courage!',
      },
      experiencedPerformer: {
        name: 'Experienced Performer',
        description:
          'With 5 public performances, you are already an experienced artist!',
      },
      concertArtist: {
        name: 'Concert Artist',
        description: '10+ performances! You are a true renowned artist.',
      },

      // ============ EFICIÊNCIA & CONSISTÊNCIA ============
      efficientLearner: {
        name: 'Efficient Learner',
        description:
          'You complete 80% of the works you start. What efficiency!',
      },
      learningMachine: {
        name: 'Learning Machine',
        description: '90%+ completion rate! You are unstoppable.',
      },

      // Consistency Badges
      weeklyStreak: {
        name: 'Weekly Streak',
        description: 'You practiced consistently for a whole week!',
      },
      monthlyProductive: {
        name: 'Productive Month',
        description: 'You completed 5 works in 30 days. What productivity!',
      },
      unstoppableDedication: {
        name: 'Unstoppable Dedication',
        description: 'A streak of 30+ days! Your dedication is inspiring.',
      },

      // ============ DIVERSIDADE & EXPLORAÇÃO ============
      musicalExplorer: {
        name: 'Musical Explorer',
        description: 'You studied works by 3 different composers!',
      },
      timeTraveler: {
        name: 'Time Traveler',
        description: 'You explored 4 different musical epochs!',
      },
      multiInstrumental: {
        name: 'Multi-Instrumental',
        description: 'You study for 3+ different instruments!',
      },
      universalScholar: {
        name: 'Universal Scholar',
        description: 'You master 6+ different musical epochs!',
      },
      diversityMaster: {
        name: 'Diversity Master',
        description: 'You studied works by 10+ different composers!',
      },
    };
  }

  // Portuguese (default)
  return {
    // ============ MILESTONE & INÍCIO ============
    firstGoal: {
      name: 'Primeiro Objetivo',
      description: 'Você deu o primeiro passo na sua jornada musical!',
    },
    dedicatedStudent: {
      name: 'Estudante Dedicado',
      description: 'Você tem 10 obras em sua lista de estudos. Que dedicação!',
    },
    dreamLibrary: {
      name: 'Biblioteca de Sonhos',
      description:
        'Sua lista de estudos tem 25 obras. Seus sonhos musicais são grandes!',
    },
    goalCollector: {
      name: 'Colecionador de Metas',
      description:
        'Com 50 obras na lista, você planeja conquistar o mundo musical!',
    },

    // ============ MAESTRIA & COMPLETION ============
    firstCompletion: {
      name: 'Primeira Conquista',
      description: 'Parabéns! Você completou sua primeira obra musical.',
    },
    persistentLearner: {
      name: 'Aprendiz Persistente',
      description:
        'Com 5 obras dominadas, você mostra verdadeira persistência!',
    },
    experiencedMusician: {
      name: 'Músico Experiente',
      description: 'Com 15 obras dominadas, você já é um músico experiente!',
    },
    virtuoso: {
      name: 'Virtuoso',
      description: 'Você dominou 30 obras! Seu talento é inquestionável.',
    },
    musicalLegend: {
      name: 'Lenda Musical',
      description: 'Com 50+ obras dominadas, você entrou para a história!',
    },

    // ============ QUALIDADE & PERFORMANCE ============
    qualitySeeker: {
      name: 'Buscador da Excelência',
      description:
        'Você mantém uma maestria média de 4+. Qualidade acima de tudo!',
    },
    perfectionist: {
      name: 'Perfeccionista',
      description:
        'Maestria média de 4.5+! Você é um verdadeiro perfeccionista.',
    },
    expertMaster: {
      name: 'Mestre Expert',
      description:
        'Você tem 10+ obras com maestria máxima (4+). Impressionante!',
    },

    // Performance Badges
    stageDebut: {
      name: 'Estreia no Palco',
      description:
        'Você realizou sua primeira performance pública! Que coragem!',
    },
    experiencedPerformer: {
      name: 'Performer Experiente',
      description:
        'Com 5 performances públicas, você já é um artista experiente!',
    },
    concertArtist: {
      name: 'Artista Conceituado',
      description:
        '10+ performances! Você é um verdadeiro artista conceituado.',
    },

    // ============ EFICIÊNCIA & CONSISTÊNCIA ============
    efficientLearner: {
      name: 'Aprendiz Eficiente',
      description: 'Você completa 80% das obras que inicia. Que eficiência!',
    },
    learningMachine: {
      name: 'Máquina de Aprender',
      description: '90%+ de taxa de conclusão! Você é imparável.',
    },

    // Consistency Badges
    weeklyStreak: {
      name: 'Streak Semanal',
      description: 'Você praticou consistentemente por uma semana inteira!',
    },
    monthlyProductive: {
      name: 'Mês Produtivo',
      description: 'Você completou 5 obras em 30 dias. Que produtividade!',
    },
    unstoppableDedication: {
      name: 'Dedicação Inabalável',
      description: 'Um streak de 30+ dias! Sua dedicação é inspiradora.',
    },

    // ============ DIVERSIDADE & EXPLORAÇÃO ============
    musicalExplorer: {
      name: 'Explorador Musical',
      description: 'Você estudou obras de 3 compositores diferentes!',
    },
    timeTraveler: {
      name: 'Viajante do Tempo',
      description: 'Você explorou 4 épocas musicais diferentes!',
    },
    multiInstrumental: {
      name: 'Multi-Instrumental',
      description: 'Você estuda para 3+ instrumentos diferentes!',
    },
    universalScholar: {
      name: 'Conhecedor Universal',
      description: 'Você domina 6+ épocas musicais diferentes!',
    },
    diversityMaster: {
      name: 'Mestre da Diversidade',
      description: 'Você estudou obras de 10+ compositores diferentes!',
    },
  };
};

export function createLearningBadges(
  stats: LearningStats,
  language: Language
): Badge[] {
  const t = getBadgeTranslations(language);

  return [
    // ============ MILESTONE & INÍCIO ============
    {
      id: 'first-goal',
      name: t.firstGoal.name,
      description: t.firstGoal.description,
      icon: PiTarget,
      category: 'milestone',
      rarity: 'COMMON',
      unlocked: stats.totalLearning >= 1,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'dedicated-student',
      name: t.dedicatedStudent.name,
      description: t.dedicatedStudent.description,
      icon: FiBookOpen,
      category: 'learning',
      rarity: 'COMMON',
      progress: Math.min(stats.wantToLearnCount, 10),
      maxProgress: 10,
      unlocked: stats.wantToLearnCount >= 10,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'dream-library',
      name: t.dreamLibrary.name,
      description: t.dreamLibrary.description,
      icon: FiMusic,
      category: 'learning',
      rarity: 'RARE',
      progress: Math.min(stats.wantToLearnCount, 25),
      maxProgress: 25,
      unlocked: stats.wantToLearnCount >= 25,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'goal-collector',
      name: t.goalCollector.name,
      description: t.goalCollector.description,
      icon: FiTarget,
      category: 'learning',
      rarity: 'EPIC',
      progress: Math.min(stats.wantToLearnCount, 50),
      maxProgress: 50,
      unlocked: stats.wantToLearnCount >= 50,
      ...RARITY_COLORS.EPIC,
    },

    // ============ MAESTRIA & COMPLETION ============
    {
      id: 'first-completion',
      name: t.firstCompletion.name,
      description: t.firstCompletion.description,
      icon: FiCheckCircle,
      category: 'learning',
      rarity: 'COMMON',
      unlocked: stats.learnedCount >= 1,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'persistent-learner',
      name: t.persistentLearner.name,
      description: t.persistentLearner.description,
      icon: FiAward,
      category: 'learning',
      rarity: 'COMMON',
      progress: Math.min(stats.learnedCount, 5),
      maxProgress: 5,
      unlocked: stats.learnedCount >= 5,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'experienced-musician',
      name: t.experiencedMusician.name,
      description: t.experiencedMusician.description,
      icon: BiTrophy,
      category: 'expertise',
      rarity: 'RARE',
      progress: Math.min(stats.learnedCount, 15),
      maxProgress: 15,
      unlocked: stats.learnedCount >= 15,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'virtuoso',
      name: t.virtuoso.name,
      description: t.virtuoso.description,
      icon: BiCrown,
      category: 'expertise',
      rarity: 'EPIC',
      progress: Math.min(stats.learnedCount, 30),
      maxProgress: 30,
      unlocked: stats.learnedCount >= 30,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'musical-legend',
      name: t.musicalLegend.name,
      description: t.musicalLegend.description,
      icon: FiShield,
      category: 'milestone',
      rarity: 'LEGENDARY',
      progress: Math.min(stats.learnedCount, 50),
      maxProgress: 50,
      unlocked: stats.learnedCount >= 50,
      ...RARITY_COLORS.LEGENDARY,
    },

    // ============ QUALIDADE & PERFORMANCE ============
    {
      id: 'quality-seeker',
      name: t.qualitySeeker.name,
      description: t.qualitySeeker.description,
      icon: FiStar,
      category: 'expertise',
      rarity: 'RARE',
      progress: Math.min(Math.round(stats.avgMastery * 10), 40),
      maxProgress: 40,
      unlocked: stats.avgMastery >= 4.0,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'perfectionist',
      name: t.perfectionist.name,
      description: t.perfectionist.description,
      icon: BiCrown,
      category: 'expertise',
      rarity: 'EPIC',
      progress: Math.min(Math.round(stats.avgMastery * 10), 45),
      maxProgress: 45,
      unlocked: stats.avgMastery >= 4.5,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'expert-master',
      name: t.expertMaster.name,
      description: t.expertMaster.description,
      icon: FiAward,
      category: 'expertise',
      rarity: 'EPIC',
      progress: Math.min(stats.expertLevelCount, 10),
      maxProgress: 10,
      unlocked: stats.expertLevelCount >= 10,
      ...RARITY_COLORS.EPIC,
    },

    // Performance Badges
    {
      id: 'stage-debut',
      name: t.stageDebut.name,
      description: t.stageDebut.description,
      icon: FiUsers,
      category: 'social',
      rarity: 'RARE',
      unlocked: stats.publicPerformances >= 1,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'experienced-performer',
      name: t.experiencedPerformer.name,
      description: t.experiencedPerformer.description,
      icon: BiTrophy,
      category: 'social',
      rarity: 'EPIC',
      progress: Math.min(stats.publicPerformances, 5),
      maxProgress: 5,
      unlocked: stats.publicPerformances >= 5,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'concert-artist',
      name: t.concertArtist.name,
      description: t.concertArtist.description,
      icon: FiAward,
      category: 'social',
      rarity: 'LEGENDARY',
      progress: Math.min(stats.publicPerformances, 10),
      maxProgress: 10,
      unlocked: stats.publicPerformances >= 10,
      ...RARITY_COLORS.LEGENDARY,
    },

    // ============ EFICIÊNCIA & CONSISTÊNCIA ============
    {
      id: 'efficient-learner',
      name: t.efficientLearner.name,
      description: t.efficientLearner.description,
      icon: FiZap,
      category: 'expertise',
      rarity: 'RARE',
      progress: Math.min(Math.round(stats.completionRate), 80),
      maxProgress: 80,
      unlocked: stats.completionRate >= 80,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'learning-machine',
      name: t.learningMachine.name,
      description: t.learningMachine.description,
      icon: FiTrendingUp,
      category: 'expertise',
      rarity: 'EPIC',
      progress: Math.min(Math.round(stats.completionRate), 90),
      maxProgress: 90,
      unlocked: stats.completionRate >= 90,
      ...RARITY_COLORS.EPIC,
    },

    // Consistency Badges
    {
      id: 'weekly-streak',
      name: t.weeklyStreak.name,
      description: t.weeklyStreak.description,
      icon: FaFire,
      category: 'dedication',
      rarity: 'RARE',
      progress: Math.min(stats.currentStreak, 7),
      maxProgress: 7,
      unlocked: stats.currentStreak >= 7,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'monthly-productive',
      name: t.monthlyProductive.name,
      description: t.monthlyProductive.description,
      icon: FiClock,
      category: 'dedication',
      rarity: 'EPIC',
      progress: Math.min(stats.learnedThisMonth, 5),
      maxProgress: 5,
      unlocked: stats.learnedThisMonth >= 5,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'unstoppable-dedication',
      name: t.unstoppableDedication.name,
      description: t.unstoppableDedication.description,
      icon: FiShield,
      category: 'dedication',
      rarity: 'LEGENDARY',
      progress: Math.min(stats.currentStreak, 30),
      maxProgress: 30,
      unlocked: stats.currentStreak >= 30,
      ...RARITY_COLORS.LEGENDARY,
    },

    // ============ DIVERSIDADE & EXPLORAÇÃO ============
    {
      id: 'musical-explorer',
      name: t.musicalExplorer.name,
      description: t.musicalExplorer.description,
      icon: FiZap,
      category: 'expertise',
      rarity: 'COMMON',
      progress: Math.min(stats.uniqueComposers, 3),
      maxProgress: 3,
      unlocked: stats.uniqueComposers >= 3,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'time-traveler',
      name: t.timeTraveler.name,
      description: t.timeTraveler.description,
      icon: FiClock,
      category: 'expertise',
      rarity: 'RARE',
      progress: Math.min(stats.uniqueEpochs, 4),
      maxProgress: 4,
      unlocked: stats.uniqueEpochs >= 4,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'multi-instrumental',
      name: t.multiInstrumental.name,
      description: t.multiInstrumental.description,
      icon: FiMusic,
      category: 'expertise',
      rarity: 'RARE',
      progress: Math.min(stats.uniqueInstruments || 0, 3),
      maxProgress: 3,
      unlocked: (stats.uniqueInstruments || 0) >= 3,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'universal-scholar',
      name: t.universalScholar.name,
      description: t.universalScholar.description,
      icon: FiBookOpen,
      category: 'expertise',
      rarity: 'EPIC',
      progress: Math.min(stats.uniqueEpochs, 6),
      maxProgress: 6,
      unlocked: stats.uniqueEpochs >= 6,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'diversity-master',
      name: t.diversityMaster.name,
      description: t.diversityMaster.description,
      icon: FiShield,
      category: 'expertise',
      rarity: 'LEGENDARY',
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
      // Debounce: apenas verificar após 3 segundos de inatividade
      const timeoutId = setTimeout(async () => {
        try {
          const newAchievements = await checkNewAchievements('LEARNING');

          if (newAchievements.length > 0) {
            console.log(
              `🏆 [LEARNING] ${stats} novos achievements desbloqueados!`
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
export function getNextLearningAchievements(
  stats: LearningStats,
  language: Language
) {
  const badges = createLearningBadges(stats, language);
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

// CTA translations
const getCTATranslations = (lang: 'pt' | 'en') => {
  if (lang === 'en') {
    return {
      addGoals: {
        title: 'Set More Goals',
        description: 'Add more works to your study list',
        action: 'Explore Works',
      },
      improveMastery: {
        title: 'Focus on Quality',
        description: 'Dedicate more time to fully master each work',
        action: 'View Study Tips',
      },
      firstPerformance: {
        title: 'How about a Recital?',
        description: 'You already master several works. Time to perform!',
        action: 'Performance Tips',
      },
      diversify: {
        title: 'Explore New Horizons',
        description: 'Diversify by studying different composers and epochs',
        action: 'Discover Composers',
      },
      improveCompletion: {
        title: 'Focus on Current Goals',
        description: 'Finish the works you started before adding new ones',
        action: 'View Current List',
      },
    };
  }

  return {
    addGoals: {
      title: 'Defina Mais Metas',
      description: 'Adicione mais obras à sua lista de estudos',
      action: 'Explorar Obras',
    },
    improveMastery: {
      title: 'Foque na Qualidade',
      description: 'Dedique mais tempo para dominar completamente cada obra',
      action: 'Ver Dicas de Estudo',
    },
    firstPerformance: {
      title: 'Que tal um Recital?',
      description: 'Você já domina várias obras. Hora de se apresentar!',
      action: 'Dicas de Performance',
    },
    diversify: {
      title: 'Explore Novos Horizontes',
      description: 'Diversifique estudando diferentes compositores e épocas',
      action: 'Descobrir Compositores',
    },
    improveCompletion: {
      title: 'Foque nas Metas Atuais',
      description: 'Termine as obras que já começou antes de adicionar novas',
      action: 'Ver Lista Atual',
    },
  };
};

// CTAs inteligentes baseados no progresso
export function getLearningSmartCTAs(
  stats: LearningStats,
  language: Language
): SmartCTA[] {
  const ctaTexts = getCTATranslations(language);
  const ctas: SmartCTA[] = [];

  // CTA: Adicionar mais metas se tem poucas
  if (stats.wantToLearnCount < 5) {
    ctas.push({
      id: 'add-goals',
      title: ctaTexts.addGoals.title,
      description: ctaTexts.addGoals.description,
      action: ctaTexts.addGoals.action,
      url: '/works',
      priority: 'high',
    });
  }

  // CTA: Focar na qualidade se maestria está baixa
  if (stats.avgMastery < 3 && stats.learnedCount > 0) {
    ctas.push({
      id: 'improve-mastery',
      title: ctaTexts.improveMastery.title,
      description: ctaTexts.improveMastery.description,
      action: ctaTexts.improveMastery.action,
      url: '/learning/tips',
      priority: 'medium',
    });
  }

  // CTA: Primeira performance se tem obras dominadas mas nunca se apresentou
  if (stats.expertLevelCount >= 3 && stats.publicPerformances === 0) {
    ctas.push({
      id: 'first-performance',
      title: ctaTexts.firstPerformance.title,
      description: ctaTexts.firstPerformance.description,
      action: ctaTexts.firstPerformance.action,
      url: '/learning/performance-tips',
      priority: 'high',
    });
  }

  // CTA: Diversificar se só estuda um compositor/época
  if (stats.uniqueComposers <= 2 && stats.learnedCount >= 3) {
    ctas.push({
      id: 'diversify',
      title: ctaTexts.diversify.title,
      description: ctaTexts.diversify.description,
      action: ctaTexts.diversify.action,
      url: '/composers',
      priority: 'medium',
    });
  }

  // CTA: Melhorar consistência se taxa de conclusão é baixa
  if (stats.completionRate < 70 && stats.totalLearning >= 5) {
    ctas.push({
      id: 'improve-completion',
      title: ctaTexts.improveCompletion.title,
      description: ctaTexts.improveCompletion.description,
      action: ctaTexts.improveCompletion.action,
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
