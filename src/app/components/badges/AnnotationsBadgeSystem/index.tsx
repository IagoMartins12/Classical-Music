// components/badges/AnnotationsBadgeSystem.tsx - Sistema específico para Annotations com TRADUÇÃO
'use client';

import {
  FiMessageSquare,
  FiThumbsUp,
  FiUsers,
  FiAward,
  FiStar,
  FiTarget,
  FiShield,
  FiZap,
  FiTrendingUp,
  FiBookOpen,
  FiClock,
  FiHeart,
} from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import { BiTrophy, BiCrown } from 'react-icons/bi';
import { useCallback } from 'react';
import { useAchievementSystem } from '@/app/hooks/useAchievements';
import { Badge } from '../BadgeSystem';
import { FaFire } from 'react-icons/fa';
import { CTAPriority, SmartCTA } from '../FavoritesBadgeSystem';
import { useLanguageStore } from '@/app/stores/useLanguageStore';

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

interface AnnotationsStats {
  // Básicos de contribuição
  totalAnnotations: number;
  publicAnnotations: number;
  privateAnnotations: number;
  verifiedAnnotations: number;

  // Impacto e utilidade
  totalHelpfulVotes: number;
  totalViews: number;
  avgHelpfulVotes: number;
  helpfulnessRate: number; // % de anotações com votos positivos

  // Performance e popularidade
  highPerformingCount: number; // anotações com 10+ votos úteis
  viralAnnotations: number; // anotações com 25+ votos úteis
  superViralAnnotations: number; // anotações com 50+ votos úteis

  // Diversidade e expertise
  categoriesUsed: number; // quantas categorias diferentes usou
  difficultyLevelsUsed: number; // para quantos níveis anotou
  scopesUsed: number; // quantos tipos de scope usou

  // Consistência e dedicação
  recentAnnotations: number; // últimos 30 dias
  streakDays: number; // dias consecutivos anotando
  monthlyAverage: number; // média mensal

  // Qualidade e reconhecimento
  avgViewsPerAnnotation: number;
  expertAnnotations: number; // anotações com tags específicas de expertise
  tutorialAnnotations: number; // anotações educativas

  // Interação social
  annotationsOnPopularWorks: number; // anotações em obras populares
  helpedUniqueUsers: number; // quantos usuários únicos ajudou
  communityImpact: number; // score baseado em engajamento

  // Especialização em áreas
  techniqueAnnotations: number;
  interpretationAnnotations: number;
  theoryAnnotations: number;
  practiceAnnotations: number;
}

// Função para traduzir badges baseado na linguagem
const getBadgeTranslations = (lang: 'pt' | 'en') => {
  if (lang === 'en') {
    return {
      // ============ CONTRIBUIÇÃO BÁSICA ============
      firstContribution: {
        name: 'First Contribution',
        description: 'Thank you for sharing your musical knowledge!',
      },
      collaborator: {
        name: 'Collaborator',
        description: 'You created 5 annotations. Your knowledge is growing!',
      },
      activeContributor: {
        name: 'Active Contributor',
        description:
          'With 15 annotations, you are a valuable community collaborator!',
      },
      musicalWriter: {
        name: 'Musical Writer',
        description: '30 annotations! You are building a knowledge library!',
      },
      prolificAuthor: {
        name: 'Prolific Author',
        description: '50+ annotations! You are a true music scholar!',
      },

      // ============ QUALIDADE & UTILIDADE ============
      firstHelpful: {
        name: 'First Help',
        description:
          'Your annotation was marked as helpful for the first time!',
      },
      helpfulContent: {
        name: 'Helpful Content',
        description:
          '10 helpful votes! Your annotations are helping other musicians.',
      },
      helpfulExpert: {
        name: 'Helpful Expert',
        description:
          '50 helpful votes! Your knowledge is impacting the community!',
      },
      knowledgeGuru: {
        name: 'Knowledge Guru',
        description:
          '100+ helpful votes! You are a reference in the community!',
      },
      musicalOracle: {
        name: 'Musical Oracle',
        description: '200+ helpful votes! Your wisdom is legendary!',
      },

      // ============ EXPERTISE & VERIFICAÇÃO ============
      verifiedAnnotation: {
        name: 'Verified Annotation',
        description: 'Your first annotation was verified by an expert!',
      },
      verifiedScholar: {
        name: 'Verified Scholar',
        description: 'You have 5+ annotations verified by experts!',
      },
      musicalAuthority: {
        name: 'Musical Authority',
        description:
          '10+ verified annotations! You are a recognized authority!',
      },

      // ============ DIVERSIDADE & ABRANGÊNCIA ============
      categoryExplorer: {
        name: 'Category Explorer',
        description: 'You used 4+ different annotation categories!',
      },
      categoryMaster: {
        name: 'Category Master',
        description: 'You master all 7 annotation categories!',
      },
      multiLevelTeacher: {
        name: 'Multi-Level Teacher',
        description:
          'You create annotations for 3+ different difficulty levels!',
      },
      universalTeacher: {
        name: 'Universal Teacher',
        description: 'You teach for all levels! What versatility!',
      },

      // ============ IMPACTO & POPULARIDADE ============
      popularAnnotation: {
        name: 'Popular Annotation',
        description: 'One of your annotations received 25+ helpful votes!',
      },
      viralContent: {
        name: 'Viral Content',
        description:
          'An annotation with 50+ helpful votes! You created a phenomenon!',
      },
      musicalPhenomenon: {
        name: 'Musical Phenomenon',
        description: 'An annotation with 100+ helpful votes! You made history!',
      },

      // ============ CONSISTÊNCIA & DEDICAÇÃO ============
      consistentContributor: {
        name: 'Consistent Contributor',
        description: 'You created 5+ annotations in the last 30 days!',
      },
      dedicatedWriter: {
        name: 'Dedicated Writer',
        description: 'You annotated for 10+ consecutive days!',
      },
      annotationsLegend: {
        name: 'Annotations Legend',
        description:
          '100+ annotations and 500+ helpful votes! You are a legend!',
      },

      // ============ ESPECIALIZAÇÃO POR ÁREA ============
      techniqueSpecialist: {
        name: 'Technique Specialist',
        description: 'You are an expert in technical annotations!',
      },
      interpretationMaster: {
        name: 'Interpretation Master',
        description: 'Your annotations about interpretation are valuable!',
      },
      theoryGuru: {
        name: 'Theory Guru',
        description: 'You master theoretical annotations!',
      },
      practiceCoach: {
        name: 'Practice Coach',
        description: 'Your practice tips are pure gold!',
      },
    };
  }

  // Portuguese (default)
  return {
    // ============ CONTRIBUIÇÃO BÁSICA ============
    firstContribution: {
      name: 'Primeira Contribuição',
      description: 'Obrigado por compartilhar seu conhecimento musical!',
    },
    collaborator: {
      name: 'Colaborador',
      description: 'Você criou 5 anotações. Seu conhecimento está crescendo!',
    },
    activeContributor: {
      name: 'Contribuidor Ativo',
      description:
        'Com 15 anotações, você é um colaborador valioso da comunidade!',
    },
    musicalWriter: {
      name: 'Escritor Musical',
      description:
        '30 anotações! Você está construindo uma biblioteca de conhecimento!',
    },
    prolificAuthor: {
      name: 'Autor Prolífico',
      description: '50+ anotações! Você é um verdadeiro estudioso da música!',
    },

    // ============ QUALIDADE & UTILIDADE ============
    firstHelpful: {
      name: 'Primeira Ajuda',
      description: 'Sua anotação foi marcada como útil pela primeira vez!',
    },
    helpfulContent: {
      name: 'Conteúdo Útil',
      description:
        '10 votos úteis! Suas anotações estão ajudando outros músicos.',
    },
    helpfulExpert: {
      name: 'Expert Útil',
      description:
        '50 votos úteis! Seu conhecimento está impactando a comunidade!',
    },
    knowledgeGuru: {
      name: 'Guru do Conhecimento',
      description: '100+ votos úteis! Você é uma referência na comunidade!',
    },
    musicalOracle: {
      name: 'Oráculo Musical',
      description: '200+ votos úteis! Sua sabedoria é lendária!',
    },

    // ============ EXPERTISE & VERIFICAÇÃO ============
    verifiedAnnotation: {
      name: 'Anotação Verificada',
      description: 'Sua primeira anotação foi verificada por um especialista!',
    },
    verifiedScholar: {
      name: 'Estudioso Verificado',
      description: 'Você tem 5+ anotações verificadas por especialistas!',
    },
    musicalAuthority: {
      name: 'Autoridade Musical',
      description:
        '10+ anotações verificadas! Você é uma autoridade reconhecida!',
    },

    // ============ DIVERSIDADE & ABRANGÊNCIA ============
    categoryExplorer: {
      name: 'Explorador de Categorias',
      description: 'Você usou 4+ categorias diferentes de anotação!',
    },
    categoryMaster: {
      name: 'Mestre das Categorias',
      description: 'Você domina todas as 7 categorias de anotação!',
    },
    multiLevelTeacher: {
      name: 'Professor Multi-Nível',
      description:
        'Você cria anotações para 3+ níveis de dificuldade diferentes!',
    },
    universalTeacher: {
      name: 'Professor Universal',
      description: 'Você ensina para todos os níveis! Que versatilidade!',
    },

    // ============ IMPACTO & POPULARIDADE ============
    popularAnnotation: {
      name: 'Anotação Popular',
      description: 'Uma de suas anotações recebeu 25+ votos úteis!',
    },
    viralContent: {
      name: 'Conteúdo Viral',
      description: 'Uma anotação com 50+ votos úteis! Você criou um fenômeno!',
    },
    musicalPhenomenon: {
      name: 'Fenômeno Musical',
      description: 'Uma anotação com 100+ votos úteis! Você fez história!',
    },

    // ============ CONSISTÊNCIA & DEDICAÇÃO ============
    consistentContributor: {
      name: 'Contribuidor Consistente',
      description: 'Você criou 5+ anotações nos últimos 30 dias!',
    },
    dedicatedWriter: {
      name: 'Escritor Dedicado',
      description: 'Você anotou por 10+ dias seguidos!',
    },
    annotationsLegend: {
      name: 'Lenda das Anotações',
      description: '100+ anotações e 500+ votos úteis! Você é uma lenda!',
    },

    // ============ ESPECIALIZAÇÃO POR ÁREA ============
    techniqueSpecialist: {
      name: 'Especialista em Técnica',
      description: 'Você é expert em anotações técnicas!',
    },
    interpretationMaster: {
      name: 'Mestre da Interpretação',
      description: 'Suas anotações sobre interpretação são valiosas!',
    },
    theoryGuru: {
      name: 'Guru da Teoria',
      description: 'Você domina as anotações teóricas!',
    },
    practiceCoach: {
      name: 'Coach de Prática',
      description: 'Suas dicas de estudo são ouro puro!',
    },
  };
};

export function createAnnotationsBadges(stats: AnnotationsStats): Badge[] {
  const { language } = useLanguageStore();
  const t = getBadgeTranslations(language);

  return [
    // ============ CONTRIBUIÇÃO BÁSICA ============
    {
      id: 'first-contribution',
      name: t.firstContribution.name,
      description: t.firstContribution.description,
      icon: FiMessageSquare,
      category: 'milestone',
      rarity: 'COMMON',
      unlocked: stats.totalAnnotations >= 1,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'collaborator',
      name: t.collaborator.name,
      description: t.collaborator.description,
      icon: FiUsers,
      category: 'social',
      rarity: 'COMMON',
      progress: Math.min(stats.totalAnnotations, 5),
      maxProgress: 5,
      unlocked: stats.totalAnnotations >= 5,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'active-contributor',
      name: t.activeContributor.name,
      description: t.activeContributor.description,
      icon: FiBookOpen,
      category: 'social',
      rarity: 'RARE',
      progress: Math.min(stats.totalAnnotations, 15),
      maxProgress: 15,
      unlocked: stats.totalAnnotations >= 15,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'musical-writer',
      name: t.musicalWriter.name,
      description: t.musicalWriter.description,
      icon: FiBookOpen,
      category: 'social',
      rarity: 'EPIC',
      progress: Math.min(stats.totalAnnotations, 30),
      maxProgress: 30,
      unlocked: stats.totalAnnotations >= 30,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'prolific-author',
      name: t.prolificAuthor.name,
      description: t.prolificAuthor.description,
      icon: BiTrophy,
      category: 'social',
      rarity: 'LEGENDARY',
      progress: Math.min(stats.totalAnnotations, 50),
      maxProgress: 50,
      unlocked: stats.totalAnnotations >= 50,
      ...RARITY_COLORS.LEGENDARY,
    },

    // ============ QUALIDADE & UTILIDADE ============
    {
      id: 'first-helpful',
      name: t.firstHelpful.name,
      description: t.firstHelpful.description,
      icon: FiThumbsUp,
      category: 'social',
      rarity: 'COMMON',
      unlocked: stats.totalHelpfulVotes >= 1,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'helpful-content',
      name: t.helpfulContent.name,
      description: t.helpfulContent.description,
      icon: FiHeart,
      category: 'social',
      rarity: 'COMMON',
      progress: Math.min(stats.totalHelpfulVotes, 10),
      maxProgress: 10,
      unlocked: stats.totalHelpfulVotes >= 10,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'helpful-expert',
      name: t.helpfulExpert.name,
      description: t.helpfulExpert.description,
      icon: FiAward,
      category: 'expertise',
      rarity: 'RARE',
      progress: Math.min(stats.totalHelpfulVotes, 50),
      maxProgress: 50,
      unlocked: stats.totalHelpfulVotes >= 50,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'knowledge-guru',
      name: t.knowledgeGuru.name,
      description: t.knowledgeGuru.description,
      icon: BiCrown,
      category: 'expertise',
      rarity: 'EPIC',
      progress: Math.min(stats.totalHelpfulVotes, 100),
      maxProgress: 100,
      unlocked: stats.totalHelpfulVotes >= 100,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'musical-oracle',
      name: t.musicalOracle.name,
      description: t.musicalOracle.description,
      icon: FiShield,
      category: 'expertise',
      rarity: 'LEGENDARY',
      progress: Math.min(stats.totalHelpfulVotes, 200),
      maxProgress: 200,
      unlocked: stats.totalHelpfulVotes >= 200,
      ...RARITY_COLORS.LEGENDARY,
    },

    // ============ EXPERTISE & VERIFICAÇÃO ============
    {
      id: 'verified-annotation',
      name: t.verifiedAnnotation.name,
      description: t.verifiedAnnotation.description,
      icon: MdVerified,
      category: 'expertise',
      rarity: 'RARE',
      unlocked: stats.verifiedAnnotations >= 1,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'verified-scholar',
      name: t.verifiedScholar.name,
      description: t.verifiedScholar.description,
      icon: MdVerified,
      category: 'expertise',
      rarity: 'EPIC',
      progress: Math.min(stats.verifiedAnnotations, 5),
      maxProgress: 5,
      unlocked: stats.verifiedAnnotations >= 5,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'musical-authority',
      name: t.musicalAuthority.name,
      description: t.musicalAuthority.description,
      icon: FiShield,
      category: 'expertise',
      rarity: 'LEGENDARY',
      progress: Math.min(stats.verifiedAnnotations, 10),
      maxProgress: 10,
      unlocked: stats.verifiedAnnotations >= 10,
      ...RARITY_COLORS.LEGENDARY,
    },

    // ============ DIVERSIDADE & ABRANGÊNCIA ============
    {
      id: 'category-explorer',
      name: t.categoryExplorer.name,
      description: t.categoryExplorer.description,
      icon: FiZap,
      category: 'expertise',
      rarity: 'RARE',
      progress: Math.min(stats.categoriesUsed, 4),
      maxProgress: 4,
      unlocked: stats.categoriesUsed >= 4,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'category-master',
      name: t.categoryMaster.name,
      description: t.categoryMaster.description,
      icon: FiTarget,
      category: 'expertise',
      rarity: 'EPIC',
      progress: Math.min(stats.categoriesUsed, 7),
      maxProgress: 7,
      unlocked: stats.categoriesUsed >= 7,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'multi-level-teacher',
      name: t.multiLevelTeacher.name,
      description: t.multiLevelTeacher.description,
      icon: FiUsers,
      category: 'social',
      rarity: 'RARE',
      progress: Math.min(stats.difficultyLevelsUsed, 3),
      maxProgress: 3,
      unlocked: stats.difficultyLevelsUsed >= 3,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'universal-teacher',
      name: t.universalTeacher.name,
      description: t.universalTeacher.description,
      icon: FiBookOpen,
      category: 'social',
      rarity: 'EPIC',
      progress: Math.min(stats.difficultyLevelsUsed, 4),
      maxProgress: 4,
      unlocked: stats.difficultyLevelsUsed >= 4,
      ...RARITY_COLORS.EPIC,
    },

    // ============ IMPACTO & POPULARIDADE ============
    {
      id: 'popular-annotation',
      name: t.popularAnnotation.name,
      description: t.popularAnnotation.description,
      icon: FiTrendingUp,
      category: 'social',
      rarity: 'EPIC',
      unlocked: stats.viralAnnotations >= 1,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'viral-content',
      name: t.viralContent.name,
      description: t.viralContent.description,
      icon: FaFire,
      category: 'social',
      rarity: 'LEGENDARY',
      unlocked: stats.superViralAnnotations >= 1,
      ...RARITY_COLORS.LEGENDARY,
    },
    {
      id: 'musical-phenomenon',
      name: t.musicalPhenomenon.name,
      description: t.musicalPhenomenon.description,
      icon: FiShield,
      category: 'milestone',
      rarity: 'LEGENDARY',
      unlocked: stats.totalHelpfulVotes >= 100, // Simplificação
      ...RARITY_COLORS.LEGENDARY,
    },

    // ============ CONSISTÊNCIA & DEDICAÇÃO ============
    {
      id: 'consistent-contributor',
      name: t.consistentContributor.name,
      description: t.consistentContributor.description,
      icon: FiClock,
      category: 'dedication',
      rarity: 'RARE',
      progress: Math.min(stats.recentAnnotations, 5),
      maxProgress: 5,
      unlocked: stats.recentAnnotations >= 5,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'dedicated-writer',
      name: t.dedicatedWriter.name,
      description: t.dedicatedWriter.description,
      icon: FaFire,
      category: 'dedication',
      rarity: 'EPIC',
      progress: Math.min(stats.streakDays, 10),
      maxProgress: 10,
      unlocked: stats.streakDays >= 10,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'annotations-legend',
      name: t.annotationsLegend.name,
      description: t.annotationsLegend.description,
      icon: FiShield,
      category: 'milestone',
      rarity: 'LEGENDARY',
      unlocked: stats.totalAnnotations >= 100 && stats.totalHelpfulVotes >= 500,
      ...RARITY_COLORS.LEGENDARY,
    },

    // ============ ESPECIALIZAÇÃO POR ÁREA ============
    {
      id: 'technique-specialist',
      name: t.techniqueSpecialist.name,
      description: t.techniqueSpecialist.description,
      icon: FiTarget,
      category: 'expertise',
      rarity: 'RARE',
      unlocked: stats.techniqueAnnotations >= 10,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'interpretation-master',
      name: t.interpretationMaster.name,
      description: t.interpretationMaster.description,
      icon: FiStar,
      category: 'expertise',
      rarity: 'RARE',
      unlocked: stats.interpretationAnnotations >= 10,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'theory-guru',
      name: t.theoryGuru.name,
      description: t.theoryGuru.description,
      icon: FiBookOpen,
      category: 'expertise',
      rarity: 'EPIC',
      unlocked: stats.theoryAnnotations >= 10,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'practice-coach',
      name: t.practiceCoach.name,
      description: t.practiceCoach.description,
      icon: FiTarget,
      category: 'social',
      rarity: 'EPIC',
      unlocked: stats.practiceAnnotations >= 15,
      ...RARITY_COLORS.EPIC,
    },
  ];
}

// Hook específico para Annotations Achievements
export function useAnnotationsAchievementDetection() {
  const { checkNewAchievements } = useAchievementSystem();

  const checkAnnotationsAchievements = useCallback(
    async (stats: AnnotationsStats) => {
      const timeoutId = setTimeout(async () => {
        try {
          const newAchievements = await checkNewAchievements('ANNOTATIONS');

          if (newAchievements.length > 0) {
            console.log(
              `📝 [ANNOTATIONS] ${stats} novos achievements desbloqueados!`
            );
          }
        } catch (error) {
          console.error(
            'Erro ao verificar achievements de annotations:',
            error
          );
        }
      }, 2000);

      return () => clearTimeout(timeoutId);
    },
    [checkNewAchievements]
  );

  return { checkAnnotationsAchievements };
}

// Próximos achievements para CTAs
export function getNextAnnotationsAchievements(stats: AnnotationsStats) {
  const badges = createAnnotationsBadges(stats);
  const locked = badges.filter((b) => !b.unlocked);

  const sorted = locked.sort((a, b) => {
    if (!a.maxProgress && !b.maxProgress) return 0;
    if (!a.maxProgress) return 1;
    if (!b.maxProgress) return -1;

    const progressA = (a.progress || 0) / a.maxProgress;
    const progressB = (b.progress || 0) / b.maxProgress;

    return progressB - progressA;
  });

  return sorted.slice(0, 3);
}

// CTA translations
const getCTATranslations = (lang: 'pt' | 'en') => {
  if (lang === 'en') {
    return {
      startContributing: {
        title: 'Share your Knowledge',
        description: 'Create your first annotation and help other musicians',
        action: 'Explore Works',
      },
      makePublic: {
        title: 'Share with Community',
        description: 'Make your annotations public to help more musicians',
        action: 'View Annotations',
      },
      diversifyCategories: {
        title: 'Explore New Categories',
        description:
          'Try annotating about technique, interpretation and theory',
        action: 'Learn About Categories',
      },
      improveQuality: {
        title: 'Improve Quality',
        description: 'Focus on more detailed and helpful annotations',
        action: 'Annotation Tips',
      },
      beMoreActive: {
        title: 'Stay Active',
        description: 'Keep contributing regularly to the community',
        action: 'Find Works',
      },
    };
  }

  return {
    startContributing: {
      title: 'Compartilhe seu Conhecimento',
      description: 'Crie sua primeira anotação e ajude outros músicos',
      action: 'Explorar Obras',
    },
    makePublic: {
      title: 'Compartilhe com a Comunidade',
      description: 'Torne suas anotações públicas para ajudar mais músicos',
      action: 'Ver Anotações',
    },
    diversifyCategories: {
      title: 'Explore Novas Categorias',
      description: 'Experimente anotar sobre técnica, interpretação e teoria',
      action: 'Aprender Sobre Categorias',
    },
    improveQuality: {
      title: 'Melhore a Qualidade',
      description: 'Foque em anotações mais detalhadas e úteis',
      action: 'Dicas de Anotação',
    },
    beMoreActive: {
      title: 'Mantenha-se Ativo',
      description: 'Continue contribuindo regularmente com a comunidade',
      action: 'Encontrar Obras',
    },
  };
};

// CTAs inteligentes para Annotations
export function getAnnotationsSmartCTAs(stats: AnnotationsStats) {
  const { language } = useLanguageStore();
  const ctaTexts = getCTATranslations(language);
  const ctas: SmartCTA[] = [];

  // CTA: Começar a contribuir se não tem anotações
  if (stats.totalAnnotations === 0) {
    ctas.push({
      id: 'start-contributing',
      title: ctaTexts.startContributing.title,
      description: ctaTexts.startContributing.description,
      action: ctaTexts.startContributing.action,
      url: '/works',
      priority: 'high',
    });
  }

  // CTA: Tornar público se só tem privadas
  if (
    stats.totalAnnotations >= 3 &&
    stats.publicAnnotations < stats.totalAnnotations * 0.5
  ) {
    ctas.push({
      id: 'make-public',
      title: ctaTexts.makePublic.title,
      description: ctaTexts.makePublic.description,
      action: ctaTexts.makePublic.action,
      url: '/annotations?tab=private',
      priority: 'medium',
    });
  }

  // CTA: Diversificar categorias se usa poucas
  if (stats.totalAnnotations >= 5 && stats.categoriesUsed < 4) {
    ctas.push({
      id: 'diversify-categories',
      title: ctaTexts.diversifyCategories.title,
      description: ctaTexts.diversifyCategories.description,
      action: ctaTexts.diversifyCategories.action,
      url: '/help/annotation-categories',
      priority: 'medium',
    });
  }

  // CTA: Melhorar qualidade se tem baixa taxa de utilidade
  if (stats.totalAnnotations >= 5 && stats.helpfulnessRate < 50) {
    ctas.push({
      id: 'improve-quality',
      title: ctaTexts.improveQuality.title,
      description: ctaTexts.improveQuality.description,
      action: ctaTexts.improveQuality.action,
      url: '/help/annotation-tips',
      priority: 'high',
    });
  }

  // CTA: Ser mais ativo se tem poucas anotações recentes
  if (stats.totalAnnotations >= 10 && stats.recentAnnotations < 2) {
    ctas.push({
      id: 'be-more-active',
      title: ctaTexts.beMoreActive.title,
      description: ctaTexts.beMoreActive.description,
      action: ctaTexts.beMoreActive.action,
      url: '/works',
      priority: 'medium',
    });
  }

  const priorityOrder: Record<CTAPriority, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  return ctas
    .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    .slice(0, 2);
}

// Função para calcular estatísticas a partir dos dados do store
export function calculateAnnotationsStats(
  annotations: any[]
): AnnotationsStats {
  const totalAnnotations = annotations.length;
  const publicAnnotations = annotations.filter((a) => a.isPublic).length;
  const verifiedAnnotations = annotations.filter((a) => a.isVerified).length;

  const totalHelpfulVotes = annotations.reduce(
    (sum, a) => sum + a.helpfulCount,
    0
  );

  const totalViews = annotations.reduce((sum, a) => sum + a.viewCount, 0);

  const avgHelpfulVotes =
    totalAnnotations > 0 ? totalHelpfulVotes / totalAnnotations : 0;
  const avgViewsPerAnnotation =
    totalAnnotations > 0 ? totalViews / totalAnnotations : 0;

  const highPerformingCount = annotations.filter(
    (a) => a.helpfulCount >= 10
  ).length;
  const viralAnnotations = annotations.filter(
    (a) => a.helpfulCount >= 25
  ).length;
  const superViralAnnotations = annotations.filter(
    (a) => a.helpfulCount >= 50
  ).length;

  const categoriesUsed = new Set(annotations.map((a) => a.category)).size;
  const difficultyLevelsUsed = new Set(annotations.map((a) => a.difficulty))
    .size;
  const scopesUsed = new Set(annotations.map((a) => a.scope)).size;

  // Anotações recentes
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentAnnotations = annotations.filter((a) => {
    const createdDate = new Date(a.createdAt);
    return createdDate >= thirtyDaysAgo;
  }).length;

  // Taxa de utilidade
  const annotationsWithVotes = annotations.filter(
    (a) => a.helpfulCount > 0
  ).length;
  const helpfulnessRate =
    totalAnnotations > 0 ? (annotationsWithVotes / totalAnnotations) * 100 : 0;

  // Por categoria
  const techniqueAnnotations = annotations.filter(
    (a) => a.category === 'TECHNIQUE'
  ).length;
  const interpretationAnnotations = annotations.filter(
    (a) => a.category === 'INTERPRETATION'
  ).length;
  const theoryAnnotations = annotations.filter(
    (a) => a.category === 'THEORY'
  ).length;
  const practiceAnnotations = annotations.filter(
    (a) => a.category === 'PRACTICE_TIP'
  ).length;

  return {
    totalAnnotations,
    publicAnnotations,
    privateAnnotations: totalAnnotations - publicAnnotations,
    verifiedAnnotations,
    totalHelpfulVotes,
    totalViews,
    avgHelpfulVotes: Math.round(avgHelpfulVotes * 10) / 10,
    helpfulnessRate: Math.round(helpfulnessRate),
    highPerformingCount,
    viralAnnotations,
    superViralAnnotations,
    categoriesUsed,
    difficultyLevelsUsed,
    scopesUsed,
    recentAnnotations,
    streakDays: Math.min(recentAnnotations, 10), // Simulação
    monthlyAverage: Math.round(totalAnnotations / 6),
    avgViewsPerAnnotation: Math.round(avgViewsPerAnnotation),
    expertAnnotations: verifiedAnnotations, // Simplificação
    tutorialAnnotations: practiceAnnotations,
    annotationsOnPopularWorks: Math.floor(totalAnnotations * 0.3), // Simulação
    helpedUniqueUsers: Math.floor(totalHelpfulVotes * 0.8), // Estimativa
    communityImpact: Math.floor((totalHelpfulVotes + totalViews) / 10), // Score
    techniqueAnnotations,
    interpretationAnnotations,
    theoryAnnotations,
    practiceAnnotations,
  };
}
