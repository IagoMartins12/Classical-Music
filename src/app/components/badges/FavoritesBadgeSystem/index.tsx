// components/badges/FavoritesBadgeSystem.tsx - Sistema específico para Favorites com TRADUÇÃO
'use client';

import {
  FiHeart,
  FiStar,
  FiZap,
  FiTrendingUp,
  FiAward,
  FiShield,
  FiMusic,
  FiUser,
  FiFileText,
  FiEye,
  FiClock,
  FiTarget,
} from 'react-icons/fi';
import { BiTrophy, BiCrown } from 'react-icons/bi';
import { GiMusicalNotes } from 'react-icons/gi';
import { useAchievementSystem } from '@/app/hooks/useAchievements';
import { useCallback } from 'react';
import { Badge } from '../BadgeSystem';
import { FaFire } from 'react-icons/fa';
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

// Tipo para prioridades de CTA
export type CTAPriority = 'high' | 'medium' | 'low';

interface FavoritesStats {
  // Contadores básicos
  totalFavorites: number;
  composersCount: number;
  worksCount: number;
  scoresCount: number;

  // Diversidade e exploração
  uniqueEpochs: number;
  uniqueInstruments: number;
  topComposerWorks: number; // Maior número de obras de um compositor
  topEpochWorks: number; // Maior número de obras de uma época

  // 🆕 Nome do compositor mais favoritado
  topComposerName: string; // Nome do compositor com mais obras

  // Atividade e descoberta
  streakDays: number; // Dias consecutivos favoritando
  recentDiscoveries: number; // Favoritos nos últimos 30 dias
  monthlyAverage: number; // Média mensal de favoritos

  // Qualidade e curadoria
  scoresWithRatings: number; // Partituras com avaliação pessoal
  scoresWithNotes: number; // Partituras com anotações pessoais
  scoresWithTags: number; // Partituras com tags
  highRatedScores: number; // Partituras com 4+ estrelas

  // Especialização
  specialistEpochs: number; // Épocas com 5+ obras
  specialistComposers: number; // Compositores com 3+ obras

  // Completude da coleção
  allEpochsCovered?: boolean; // Se tem favoritos em todas as principais épocas
  majorComposersCovered: number; // Quantos dos 50 principais compositores tem
}

// Função para traduzir badges baseado na linguagem
const getBadgeTranslations = (lang: 'pt' | 'en', topComposerName?: string) => {
  if (lang === 'en') {
    return {
      // ============ COLEÇÃO & VOLUME ============
      firstFavorite: {
        name: 'First Favorite',
        description: 'You saved your first musical treasure!',
      },
      collectorBronze: {
        name: 'Bronze Collector',
        description: 'Your collection reached 10 favorites. Keep exploring!',
      },
      collectorSilver: {
        name: 'Silver Collector',
        description:
          '25 favorites! You are building an impressive musical library.',
      },
      collectorGold: {
        name: 'Gold Collector',
        description: '50 favorites! You are a true musical connoisseur.',
      },
      imperialLibrary: {
        name: 'Imperial Library',
        description:
          '100 favorites! Your library rivals the great collections!',
      },

      // ============ DESCOBERTA & EXPLORAÇÃO ============
      musicalDiscoverer: {
        name: 'Musical Discoverer',
        description:
          'You favorited 5 items in a week. What thirst for discovery!',
      },
      musicalArchaeologist: {
        name: 'Musical Archaeologist',
        description:
          '20 discoveries in 30 days! You are a true treasure hunter.',
      },
      dailyStreak: {
        name: 'Daily Streak',
        description: 'You favorited something for 5 consecutive days!',
      },
      treasureHunter: {
        name: 'Treasure Hunter',
        description:
          '30 favorites in 30 days! You are relentless in your musical quest.',
      },

      // ============ ESPECIALIZAÇÃO ============
      composerFan: {
        name: 'Composer Fan',
        description: `You favorited 5+ works ${
          topComposerName ? `by ${topComposerName}` : 'by the same composer'
        }. What devotion!`,
      },
      epochSpecialist: {
        name: 'Epoch Specialist',
        description:
          'You have 10+ favorited works from the same musical epoch!',
      },
      devotedMusical: {
        name: 'Musical Devotee',
        description: `10+ works ${
          topComposerName ? `by ${topComposerName}` : 'by the same composer'
        }! You found your master.`,
      },
      epochScholar: {
        name: 'Epoch Scholar',
        description: 'You have favorites in 5+ different musical epochs!',
      },

      // ============ PARTITURAS & QUALIDADE ============
      scoreCollector: {
        name: 'Score Collector',
        description: 'You favorited 10+ scores. A true musical librarian!',
      },
      expertCurator: {
        name: 'Expert Curator',
        description: 'You rated 5+ scores with maximum rating!',
      },
      musicalOrganizer: {
        name: 'Musical Organizer',
        description: 'You organized 20+ scores with custom tags!',
      },
      personalAnnotator: {
        name: 'Personal Annotator',
        description: 'You made personal notes on 15+ scores!',
      },

      // ============ DIVERSIDADE & ABRANGÊNCIA ============
      multiInstrumentalCollector: {
        name: 'Multi-Instrumental Collector',
        description: 'You collect for 4+ different instruments!',
      },
      universalCollector: {
        name: 'Universal Collector',
        description: 'You explore all musical epochs with equal passion!',
      },
      masterCompletionist: {
        name: 'Master Completionist',
        description: 'You have works from 20+ major composers in history!',
      },

      // ============ ELITE & PRESTÍGIO ============
      classicalGuru: {
        name: 'Classical Guru',
        description:
          'With 150+ favorites, you are a true classical music guru!',
      },
      collectionLegend: {
        name: 'Collection Legend',
        description:
          '200+ favorites and 5+ epochs! Your collection is legendary!',
      },
      musicalImmortal: {
        name: 'Musical Immortal',
        description: 'With 300+ favorites, you achieved musical immortality!',
      },
    };
  }

  // Portuguese (default)
  return {
    // ============ COLEÇÃO & VOLUME ============
    firstFavorite: {
      name: 'Primeiro Favorito',
      description: 'Você salvou seu primeiro tesouro musical!',
    },
    collectorBronze: {
      name: 'Colecionador Bronze',
      description: 'Sua coleção chegou aos 10 favoritos. Continue explorando!',
    },
    collectorSilver: {
      name: 'Colecionador Prata',
      description:
        '25 favoritos! Você está construindo uma biblioteca musical impressionante.',
    },
    collectorGold: {
      name: 'Colecionador Ouro',
      description: '50 favoritos! Você é um verdadeiro conhecedor musical.',
    },
    imperialLibrary: {
      name: 'Biblioteca Imperial',
      description: '100 favoritos! Sua biblioteca rival as grandes coleções!',
    },

    // ============ DESCOBERTA & EXPLORAÇÃO ============
    musicalDiscoverer: {
      name: 'Descobridor Musical',
      description:
        'Você favoritou 5 itens em uma semana. Que sede de descobrir!',
    },
    musicalArchaeologist: {
      name: 'Arqueólogo Musical',
      description:
        '20 descobertas em 30 dias! Você é um verdadeiro caçador de tesouros.',
    },
    dailyStreak: {
      name: 'Streak Diário',
      description: 'Você favoritou algo por 5 dias seguidos!',
    },
    treasureHunter: {
      name: 'Caçador de Tesouros',
      description:
        '30 favoritos em 30 dias! Você é incansável na busca musical.',
    },

    // ============ ESPECIALIZAÇÃO ============
    composerFan: {
      name: 'Fã de Compositor',
      description: `Você favoritou 5+ obras ${
        topComposerName ? `de ${topComposerName}` : 'do mesmo compositor'
      }. Que devoção!`,
    },
    epochSpecialist: {
      name: 'Especialista em Época',
      description: 'Você tem 10+ obras favoritadas da mesma época musical!',
    },
    devotedMusical: {
      name: 'Devotado Musical',
      description: `10+ obras ${
        topComposerName ? `de ${topComposerName}` : 'do mesmo compositor'
      }! Você encontrou seu mestre.`,
    },
    epochScholar: {
      name: 'Conhecedor de Épocas',
      description: 'Você tem favoritos em 5+ épocas musicais diferentes!',
    },

    // ============ PARTITURAS & QUALIDADE ============
    scoreCollector: {
      name: 'Colecionador de Partituras',
      description:
        'Você favoritou 10+ partituras. Um verdadeiro bibliotecário musical!',
    },
    expertCurator: {
      name: 'Curador Expert',
      description: 'Você avaliou 5+ partituras com nota máxima!',
    },
    musicalOrganizer: {
      name: 'Organizador Musical',
      description: 'Você organizou 20+ partituras com tags personalizadas!',
    },
    personalAnnotator: {
      name: 'Anotador Pessoal',
      description: 'Você fez anotações pessoais em 15+ partituras!',
    },

    // ============ DIVERSIDADE & ABRANGÊNCIA ============
    multiInstrumentalCollector: {
      name: 'Colecionador Multi-Instrumental',
      description: 'Você coleciona para 4+ instrumentos diferentes!',
    },
    universalCollector: {
      name: 'Colecionador Universal',
      description: 'Você explora todas as épocas musicais com igual paixão!',
    },
    masterCompletionist: {
      name: 'Mestre Completista',
      description:
        'Você tem obras dos 20+ principais compositores da história!',
    },

    // ============ ELITE & PRESTÍGIO ============
    classicalGuru: {
      name: 'Guru Clássico',
      description:
        'Com 150+ favoritos, você é um verdadeiro guru da música clássica!',
    },
    collectionLegend: {
      name: 'Lenda da Coleção',
      description: '200+ favoritos e 5+ épocas! Sua coleção é lendária!',
    },
    musicalImmortal: {
      name: 'Imortal Musical',
      description: 'Com 300+ favoritos, você alcançou a imortalidade musical!',
    },
  };
};

export function createFavoritesBadges(
  stats: FavoritesStats,
  language: Language
): Badge[] {
  const t = getBadgeTranslations(language, stats.topComposerName);

  return [
    // ============ COLEÇÃO & VOLUME ============
    {
      id: 'first-favorite',
      name: t.firstFavorite.name,
      description: t.firstFavorite.description,
      icon: FiHeart,
      category: 'milestone',
      rarity: 'COMMON',
      unlocked: stats.totalFavorites >= 1,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'collector-bronze',
      name: t.collectorBronze.name,
      description: t.collectorBronze.description,
      icon: FiAward,
      category: 'collection',
      rarity: 'COMMON',
      progress: Math.min(stats.totalFavorites, 10),
      maxProgress: 10,
      unlocked: stats.totalFavorites >= 10,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'collector-silver',
      name: t.collectorSilver.name,
      description: t.collectorSilver.description,
      icon: FiStar,
      category: 'collection',
      rarity: 'RARE',
      progress: Math.min(stats.totalFavorites, 25),
      maxProgress: 25,
      unlocked: stats.totalFavorites >= 25,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'collector-gold',
      name: t.collectorGold.name,
      description: t.collectorGold.description,
      icon: BiTrophy,
      category: 'collection',
      rarity: 'EPIC',
      progress: Math.min(stats.totalFavorites, 50),
      maxProgress: 50,
      unlocked: stats.totalFavorites >= 50,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'imperial-library',
      name: t.imperialLibrary.name,
      description: t.imperialLibrary.description,
      icon: BiCrown,
      category: 'collection',
      rarity: 'LEGENDARY',
      progress: Math.min(stats.totalFavorites, 100),
      maxProgress: 100,
      unlocked: stats.totalFavorites >= 100,
      ...RARITY_COLORS.LEGENDARY,
    },

    // ============ DESCOBERTA & EXPLORAÇÃO ============
    {
      id: 'musical-discoverer',
      name: t.musicalDiscoverer.name,
      description: t.musicalDiscoverer.description,
      icon: FiZap,
      category: 'dedication',
      rarity: 'COMMON',
      progress: Math.min(stats.recentDiscoveries, 5),
      maxProgress: 5,
      unlocked: stats.recentDiscoveries >= 5,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'musical-archaeologist',
      name: t.musicalArchaeologist.name,
      description: t.musicalArchaeologist.description,
      icon: FiTrendingUp,
      category: 'dedication',
      rarity: 'RARE',
      progress: Math.min(stats.recentDiscoveries, 20),
      maxProgress: 20,
      unlocked: stats.recentDiscoveries >= 20,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'daily-streak',
      name: t.dailyStreak.name,
      description: t.dailyStreak.description,
      icon: FaFire,
      category: 'dedication',
      rarity: 'RARE',
      progress: Math.min(stats.streakDays, 5),
      maxProgress: 5,
      unlocked: stats.streakDays >= 5,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'treasure-hunter',
      name: t.treasureHunter.name,
      description: t.treasureHunter.description,
      icon: FiTarget,
      category: 'dedication',
      rarity: 'EPIC',
      progress: Math.min(stats.recentDiscoveries, 30),
      maxProgress: 30,
      unlocked: stats.recentDiscoveries >= 30,
      ...RARITY_COLORS.EPIC,
    },

    // ============ ESPECIALIZAÇÃO ============
    {
      id: 'composer-fan',
      name: t.composerFan.name,
      description: t.composerFan.description,
      icon: FiUser,
      category: 'expertise',
      rarity: 'RARE',
      progress: Math.min(stats.topComposerWorks, 5),
      maxProgress: 5,
      unlocked: stats.topComposerWorks >= 5,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'epoch-specialist',
      name: t.epochSpecialist.name,
      description: t.epochSpecialist.description,
      icon: FiClock,
      category: 'expertise',
      rarity: 'RARE',
      progress: Math.min(stats.topEpochWorks, 10),
      maxProgress: 10,
      unlocked: stats.topEpochWorks >= 10,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'devoted-musical',
      name: t.devotedMusical.name,
      description: t.devotedMusical.description,
      icon: FiHeart,
      category: 'expertise',
      rarity: 'EPIC',
      progress: Math.min(stats.topComposerWorks, 10),
      maxProgress: 10,
      unlocked: stats.topComposerWorks >= 10,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'epoch-scholar',
      name: t.epochScholar.name,
      description: t.epochScholar.description,
      icon: GiMusicalNotes,
      category: 'expertise',
      rarity: 'EPIC',
      progress: Math.min(stats.uniqueEpochs, 5),
      maxProgress: 5,
      unlocked: stats.uniqueEpochs >= 5,
      ...RARITY_COLORS.EPIC,
    },

    // ============ PARTITURAS & QUALIDADE ============
    {
      id: 'score-collector',
      name: t.scoreCollector.name,
      description: t.scoreCollector.description,
      icon: FiFileText,
      category: 'collection',
      rarity: 'COMMON',
      progress: Math.min(stats.scoresCount, 10),
      maxProgress: 10,
      unlocked: stats.scoresCount >= 10,
      ...RARITY_COLORS.COMMON,
    },
    {
      id: 'expert-curator',
      name: t.expertCurator.name,
      description: t.expertCurator.description,
      icon: FiStar,
      category: 'expertise',
      rarity: 'RARE',
      progress: Math.min(stats.highRatedScores, 5),
      maxProgress: 5,
      unlocked: stats.highRatedScores >= 5,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'musical-organizer',
      name: t.musicalOrganizer.name,
      description: t.musicalOrganizer.description,
      icon: FiTarget,
      category: 'expertise',
      rarity: 'RARE',
      progress: Math.min(stats.scoresWithTags, 20),
      maxProgress: 20,
      unlocked: stats.scoresWithTags >= 20,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'personal-annotator',
      name: t.personalAnnotator.name,
      description: t.personalAnnotator.description,
      icon: FiEye,
      category: 'expertise',
      rarity: 'EPIC',
      progress: Math.min(stats.scoresWithNotes, 15),
      maxProgress: 15,
      unlocked: stats.scoresWithNotes >= 15,
      ...RARITY_COLORS.EPIC,
    },

    // ============ DIVERSIDADE & ABRANGÊNCIA ============
    {
      id: 'multi-instrumental-collector',
      name: t.multiInstrumentalCollector.name,
      description: t.multiInstrumentalCollector.description,
      icon: FiMusic,
      category: 'expertise',
      rarity: 'RARE',
      progress: Math.min(stats.uniqueInstruments, 4),
      maxProgress: 4,
      unlocked: stats.uniqueInstruments >= 4,
      ...RARITY_COLORS.RARE,
    },
    {
      id: 'universal-collector',
      name: t.universalCollector.name,
      description: t.universalCollector.description,
      icon: GiMusicalNotes,
      category: 'expertise',
      rarity: 'EPIC',
      unlocked: stats.allEpochsCovered || false,
      ...RARITY_COLORS.EPIC,
    },
    {
      id: 'master-completionist',
      name: t.masterCompletionist.name,
      description: t.masterCompletionist.description,
      icon: BiCrown,
      category: 'expertise',
      rarity: 'LEGENDARY',
      progress: Math.min(stats.majorComposersCovered, 20),
      maxProgress: 20,
      unlocked: stats.majorComposersCovered >= 20,
      ...RARITY_COLORS.LEGENDARY,
    },

    // ============ ELITE & PRESTÍGIO ============
    {
      id: 'classical-guru',
      name: t.classicalGuru.name,
      description: t.classicalGuru.description,
      icon: FiShield,
      category: 'milestone',
      rarity: 'LEGENDARY',
      progress: Math.min(stats.totalFavorites, 150),
      maxProgress: 150,
      unlocked: stats.totalFavorites >= 150,
      ...RARITY_COLORS.LEGENDARY,
    },
    {
      id: 'collection-legend',
      name: t.collectionLegend.name,
      description: t.collectionLegend.description,
      icon: BiCrown,
      category: 'milestone',
      rarity: 'LEGENDARY',
      unlocked: stats.totalFavorites >= 200 && stats.uniqueEpochs >= 5,
      ...RARITY_COLORS.LEGENDARY,
    },
    {
      id: 'musical-immortal',
      name: t.musicalImmortal.name,
      description: t.musicalImmortal.description,
      icon: FiShield,
      category: 'milestone',
      rarity: 'LEGENDARY',
      progress: Math.min(stats.totalFavorites, 300),
      maxProgress: 300,
      unlocked: stats.totalFavorites >= 300,
      ...RARITY_COLORS.LEGENDARY,
    },
  ];
}

// Hook específico para Favorites Achievements
export function useFavoritesAchievementDetection() {
  const { checkNewAchievements } = useAchievementSystem();

  const checkFavoritesAchievements = useCallback(
    async (stats: FavoritesStats) => {
      // Debounce para evitar chamadas excessivas
      const timeoutId = setTimeout(async () => {
        try {
          const newAchievements = await checkNewAchievements('FAVORITES');

          if (newAchievements.length > 0) {
            console.log(
              `❤️ [FAVORITES] ${stats} novos achievements desbloqueados!`
            );
          }
        } catch (error) {
          console.error('Erro ao verificar achievements de favorites:', error);
        }
      }, 2000);

      return () => clearTimeout(timeoutId);
    },
    [checkNewAchievements]
  );

  return { checkFavoritesAchievements };
}

// Próximos achievements para CTAs
export function getNextFavoritesAchievements(
  stats: FavoritesStats,
  language: Language
) {
  const badges = createFavoritesBadges(stats, language);
  const locked = badges.filter((b) => !b.unlocked);

  // Ordenar por proximidade baseado em progresso
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

// Interface para CTA
export interface SmartCTA {
  id: string;
  title: string;
  description: string;
  action: string;
  url: string;
  priority: CTAPriority;
}

// CTA translations
const getCTATranslations = (lang: 'pt' | 'en') => {
  if (lang === 'en') {
    return {
      discoverMore: {
        title: 'Discover More Treasures',
        description: 'Explore our catalog to find your next musical passions',
        action: 'Explore Works',
      },
      diversifyCollection: {
        title: 'Diversify your Collection',
        description: 'Explore different epochs and musical styles',
        action: 'View Epochs',
      },
      organizeScores: {
        title: 'Organize your Library',
        description: 'Rate and organize your favorite scores',
        action: 'View Scores',
      },
      findScores: {
        title: 'Find Scores',
        description: 'Add scores from your favorite works to the collection',
        action: 'Search Scores',
      },
      discoverComposers: {
        title: 'Meet New Masters',
        description:
          'You already have favorite composers, how about discovering new talents?',
        action: 'Explore Composers',
      },
    };
  }

  return {
    discoverMore: {
      title: 'Descubra Mais Tesouros',
      description:
        'Explore nosso catálogo para encontrar suas próximas paixões musicais',
      action: 'Explorar Obras',
    },
    diversifyCollection: {
      title: 'Diversifique sua Coleção',
      description: 'Explore diferentes épocas e estilos musicais',
      action: 'Ver Épocas',
    },
    organizeScores: {
      title: 'Organize sua Biblioteca',
      description: 'Avalie e organize suas partituras favoritas',
      action: 'Ver Partituras',
    },
    findScores: {
      title: 'Encontre Partituras',
      description: 'Adicione partituras das suas obras favoritas à coleção',
      action: 'Buscar Partituras',
    },
    discoverComposers: {
      title: 'Conheça Novos Mestres',
      description:
        'Você já tem compositores favoritos, que tal descobrir novos talentos?',
      action: 'Explorar Compositores',
    },
  };
};

// CTAs inteligentes para Favorites
export function getFavoritesSmartCTAs(
  stats: FavoritesStats,
  language: Language
): SmartCTA[] {
  const ctaTexts = getCTATranslations(language);
  const ctas: SmartCTA[] = [];

  // CTA: Descobrir mais se tem poucos favoritos
  if (stats.totalFavorites < 10) {
    ctas.push({
      id: 'discover-more',
      title: ctaTexts.discoverMore.title,
      description: ctaTexts.discoverMore.description,
      action: ctaTexts.discoverMore.action,
      url: '/works',
      priority: 'high',
    });
  }

  // CTA: Diversificar se só tem de uma época/compositor
  if (stats.uniqueEpochs <= 2 && stats.totalFavorites >= 10) {
    ctas.push({
      id: 'diversify-collection',
      title: ctaTexts.diversifyCollection.title,
      description: ctaTexts.diversifyCollection.description,
      action: ctaTexts.diversifyCollection.action,
      url: '/composers',
      priority: 'medium',
    });
  }

  // CTA: Organizar partituras se tem muitas sem avaliação/tags
  if (
    stats.scoresCount >= 5 &&
    stats.scoresWithRatings < stats.scoresCount * 0.5
  ) {
    ctas.push({
      id: 'organize-scores',
      title: ctaTexts.organizeScores.title,
      description: ctaTexts.organizeScores.description,
      action: ctaTexts.organizeScores.action,
      url: '/favorites?tab=scores',
      priority: 'medium',
    });
  }

  // CTA: Encontrar partituras se só tem compositores/obras
  if (
    stats.scoresCount < 5 &&
    (stats.worksCount >= 10 || stats.composersCount >= 5)
  ) {
    ctas.push({
      id: 'find-scores',
      title: ctaTexts.findScores.title,
      description: ctaTexts.findScores.description,
      action: ctaTexts.findScores.action,
      url: '/works',
      priority: 'high',
    });
  }

  // CTA: Explorar novos compositores se tem poucos
  if (stats.specialistComposers >= 3 && stats.composersCount <= 5) {
    ctas.push({
      id: 'discover-composers',
      title: ctaTexts.discoverComposers.title,
      description: ctaTexts.discoverComposers.description,
      action: ctaTexts.discoverComposers.action,
      url: '/composers',
      priority: 'medium',
    });
  }

  // Ordenar por prioridade - CORRIGIDO com type assertion
  const priorityOrder: Record<CTAPriority, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  return ctas
    .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    .slice(0, 2);
}

// Função para calcular estatísticas necessárias a partir dos dados do store
export function calculateFavoritesStats(
  favoriteComposers: any[],
  favoriteWorks: any[],
  favoriteScores: any[]
): FavoritesStats {
  // Calcular épocas únicas
  const uniqueEpochs = new Set(
    favoriteWorks.map((fw) => fw.work?.epoch?.name).filter(Boolean)
  ).size;

  // Calcular instrumentos únicos
  const uniqueInstruments = new Set(
    favoriteWorks.map((fw) => fw.work?.instrument?.name).filter(Boolean)
  ).size;

  // Composer com mais obras - CAPTURANDO O NOME TAMBÉM
  const composerWorksCount = favoriteWorks.reduce(
    (acc: Record<string, number>, work) => {
      const composerName = work.work?.composer.fullName || 'Unknown';
      acc[composerName] = (acc[composerName] || 0) + 1;
      return acc;
    },
    {}
  );

  const topComposerWorks = Math.max(...Object.values(composerWorksCount), 0);

  // 🆕 CAPTURAR O NOME DO COMPOSITOR MAIS FAVORITADO
  const topComposerName =
    Object.entries(composerWorksCount).reduce(
      (a, b) => (a[1] > b[1] ? a : b),
      ['', 0]
    )[0] || '';

  // Época com mais obras
  const epochWorksCount = favoriteWorks.reduce(
    (acc: Record<string, number>, work) => {
      const epochName = work.work?.epoch?.name || 'Unknown';
      acc[epochName] = (acc[epochName] || 0) + 1;
      return acc;
    },
    {}
  );
  const topEpochWorks = Math.max(...Object.values(epochWorksCount), 0);

  // Descobertas recentes (últimos 30 dias)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentDiscoveries = favoriteScores.filter((score) => {
    const addedDate = new Date(score.addedAt);
    return addedDate >= thirtyDaysAgo;
  }).length;

  // Stats de partituras
  const scoresWithRatings = favoriteScores.filter(
    (score) => score.personalRating && score.personalRating > 0
  ).length;

  const scoresWithNotes = favoriteScores.filter(
    (score) => score.notes && score.notes.trim().length > 0
  ).length;

  const scoresWithTags = favoriteScores.filter(
    (score) => score.tags && score.tags.length > 0
  ).length;

  const highRatedScores = favoriteScores.filter(
    (score) => score.personalRating && score.personalRating >= 4
  ).length;

  // Especialistas
  const specialistComposers = Object.values(composerWorksCount).filter(
    (count) => count >= 3
  ).length;

  const specialistEpochs = Object.values(epochWorksCount).filter(
    (count) => count >= 5
  ).length;

  // Major composers covered (simulação - precisaria de lista real)
  const majorComposersCovered = Math.min(favoriteComposers.length, 50);

  return {
    totalFavorites:
      favoriteComposers.length + favoriteWorks.length + favoriteScores.length,
    composersCount: favoriteComposers.length,
    worksCount: favoriteWorks.length,
    scoresCount: favoriteScores.length,
    uniqueEpochs,
    uniqueInstruments,
    topComposerWorks,
    topEpochWorks,
    topComposerName, // 🆕 NOME DO COMPOSITOR MAIS FAVORITADO
    streakDays: Math.min(recentDiscoveries, 7), // Simulação de streak
    recentDiscoveries,
    monthlyAverage: Math.round(favoriteScores.length / 6), // Últimos 6 meses
    scoresWithRatings,
    scoresWithNotes,
    scoresWithTags,
    highRatedScores,
    specialistEpochs,
    specialistComposers,
    allEpochsCovered: uniqueEpochs >= 6, // Considerar 6 épocas principais
    majorComposersCovered,
  };
}
