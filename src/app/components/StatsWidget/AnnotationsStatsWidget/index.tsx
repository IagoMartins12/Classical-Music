// components/annotations/AnnotationsStatsWidget.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  FiBarChart2,
  FiEye,
  FiEyeOff,
  FiMessageSquare,
  FiThumbsUp,
  FiUsers,
  FiTrendingUp,
  FiStar,
  FiAward,
  FiZap,
  FiBookOpen,
  FiTarget,
  FiClock,
  FiHeart,
} from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import { BiTrophy } from 'react-icons/bi';
import Link from 'next/link';
import { useAnnotationsStore } from '@/app/stores/useAnnotationsStore';
import { AnimatedCard, AnimatedItem } from '../../animation/AnimatedComponents';
import { Badge, BadgeGrid } from '../../badges/BadgeSystem';

interface AnnotationsStatsWidgetProps {
  className?: string;
}

// Função para criar badges de anotações
function createAnnotationsBadges(stats: {
  totalAnnotations: number;
  publicAnnotations: number;
  verifiedAnnotations: number;
  totalHelpfulVotes: number;
  totalViews: number;
  avgHelpfulVotes: number;
  highPerformingCount: number;
  categoriesUsed: number;
  recentAnnotations: number;
  helpfulnessRate: number; // % de anotações com votos positivos
}): Badge[] {
  const rarityColors = {
    common: {
      from: 'from-slate-400',
      to: 'to-slate-600',
      border: 'border-slate-400/30',
      text: 'text-slate-600',
    },
    rare: {
      from: 'from-blue-400',
      to: 'to-blue-600',
      border: 'border-blue-400/30',
      text: 'text-blue-600',
    },
    epic: {
      from: 'from-purple-400',
      to: 'to-purple-600',
      border: 'border-purple-400/30',
      text: 'text-purple-600',
    },
    legendary: {
      from: 'from-amber-400',
      to: 'to-amber-600',
      border: 'border-amber-400/30',
      text: 'text-amber-600',
    },
  };

  return [
    // MILESTONE BADGES
    {
      id: 'first-annotation',
      name: 'Primeira Contribuição',
      description: 'Criou sua primeira anotação musical',
      icon: FiMessageSquare,
      category: 'milestone',
      rarity: 'common',
      unlocked: stats.totalAnnotations >= 1,
      ...rarityColors.common,
    },
    {
      id: 'contributor',
      name: 'Contribuidor Ativo',
      description: 'Criou 10 anotações úteis',
      icon: FiBookOpen,
      category: 'social',
      rarity: 'common',
      progress: Math.min(stats.totalAnnotations, 10),
      maxProgress: 10,
      unlocked: stats.totalAnnotations >= 10,
      ...rarityColors.common,
    },
    {
      id: 'prolific-annotator',
      name: 'Anotador Prolífico',
      description: 'Criou 50+ anotações - Verdadeiro estudioso!',
      icon: BiTrophy,
      category: 'social',
      rarity: 'rare',
      progress: Math.min(stats.totalAnnotations, 50),
      maxProgress: 50,
      unlocked: stats.totalAnnotations >= 50,
      ...rarityColors.rare,
    },

    // QUALITY BADGES
    {
      id: 'first-helpful',
      name: 'Primeira Ajuda',
      description: 'Recebeu seu primeiro voto útil',
      icon: FiThumbsUp,
      category: 'social',
      rarity: 'common',
      unlocked: stats.totalHelpfulVotes >= 1,
      ...rarityColors.common,
    },
    {
      id: 'helpful-expert',
      name: 'Expert Útil',
      description: 'Recebeu 100+ votos úteis',
      icon: FiAward,
      category: 'expertise',
      rarity: 'rare',
      progress: Math.min(stats.totalHelpfulVotes, 100),
      maxProgress: 100,
      unlocked: stats.totalHelpfulVotes >= 100,
      ...rarityColors.rare,
    },
    {
      id: 'high-quality',
      name: 'Qualidade Superior',
      description: 'Mantenha 80% das anotações com votos positivos',
      icon: FiStar,
      category: 'expertise',
      rarity: 'epic',
      progress: Math.min(Math.round(stats.helpfulnessRate), 80),
      maxProgress: 80,
      unlocked: stats.helpfulnessRate >= 80,
      ...rarityColors.epic,
    },

    // EXPERTISE BADGES
    {
      id: 'category-master',
      name: 'Mestre das Categorias',
      description: 'Use todas as 7 categorias de anotação',
      icon: FiTarget,
      category: 'expertise',
      rarity: 'rare',
      progress: Math.min(stats.categoriesUsed, 7),
      maxProgress: 7,
      unlocked: stats.categoriesUsed >= 7,
      ...rarityColors.rare,
    },
    {
      id: 'verified-scholar',
      name: 'Estudioso Verificado',
      description: 'Tenha 5+ anotações verificadas por moderadores',
      icon: MdVerified,
      category: 'expertise',
      rarity: 'epic',
      progress: Math.min(stats.verifiedAnnotations, 5),
      maxProgress: 5,
      unlocked: stats.verifiedAnnotations >= 5,
      ...rarityColors.epic,
    },

    // PERFORMANCE BADGES
    {
      id: 'popular-teacher',
      name: 'Professor Popular',
      description: 'Tenha 5 anotações com 10+ votos úteis cada',
      icon: FiUsers,
      category: 'social',
      rarity: 'epic',
      progress: Math.min(stats.highPerformingCount, 5),
      maxProgress: 5,
      unlocked: stats.highPerformingCount >= 5,
      ...rarityColors.epic,
    },
    {
      id: 'viral-annotation',
      name: 'Anotação Viral',
      description: 'Tenha uma anotação com 1000+ visualizações',
      icon: FiTrendingUp,
      category: 'social',
      rarity: 'legendary',
      unlocked: stats.totalViews >= 1000, // Simplificado
      ...rarityColors.legendary,
    },

    // DEDICATION BADGES
    {
      id: 'consistent-contributor',
      name: 'Contribuidor Consistente',
      description: 'Crie 5+ anotações nos últimos 30 dias',
      icon: FiClock,
      category: 'dedication',
      rarity: 'rare',
      progress: Math.min(stats.recentAnnotations, 5),
      maxProgress: 5,
      unlocked: stats.recentAnnotations >= 5,
      ...rarityColors.rare,
    },

    // LEGENDARY BADGE
    {
      id: 'annotation-legend',
      name: 'Lenda das Anotações',
      description: 'Alcance 100+ anotações e 500+ votos úteis',
      icon: FiAward,
      category: 'milestone',
      rarity: 'legendary',
      unlocked: stats.totalAnnotations >= 100 && stats.totalHelpfulVotes >= 500,
      ...rarityColors.legendary,
    },
  ];
}

// Hook para calcular stats avançadas de anotações
const useAnnotationsStats = (userId?: string) => {
  const { userAnnotations, getUserAnnotations } = useAnnotationsStore();

  return useMemo(() => {
    if (!userId) return null;

    const annotations = getUserAnnotations(userId);

    if (annotations.length === 0) {
      return {
        totalAnnotations: 0,
        publicAnnotations: 0,
        verifiedAnnotations: 0,
        privateAnnotations: 0,
        totalHelpfulVotes: 0,
        totalViews: 0,
        avgHelpfulVotes: 0,
        avgViews: 0,
        highPerformingCount: 0,
        categoriesUsed: 0,
        recentAnnotations: 0,
        helpfulnessRate: 0,
        categoryDistribution: {},
        difficultyDistribution: {},
        topAnnotations: [],
        mostAnnotatedWorks: [],
      };
    }

    const totalAnnotations = annotations.length;
    const publicAnnotations = annotations.filter((a) => a.isPublic).length;
    const verifiedAnnotations = annotations.filter((a) => a.isVerified).length;
    const privateAnnotations = totalAnnotations - publicAnnotations;

    const totalHelpfulVotes = annotations.reduce(
      (sum, a) => sum + a.helpfulCount,
      0
    );
    const totalViews = annotations.reduce((sum, a) => sum + a.viewCount, 0);

    const avgHelpfulVotes =
      totalAnnotations > 0 ? totalHelpfulVotes / totalAnnotations : 0;
    const avgViews = totalAnnotations > 0 ? totalViews / totalAnnotations : 0;

    const highPerformingCount = annotations.filter(
      (a) => a.helpfulCount >= 10
    ).length;

    // Categorias únicas usadas
    const categoriesUsed = new Set(annotations.map((a) => a.category)).size;

    // Anotações recentes (últimos 30 dias)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentAnnotations = annotations.filter((a) => {
      const createdDate = new Date(a.createdAt);
      return createdDate >= thirtyDaysAgo;
    }).length;

    // Taxa de utilidade (% de anotações com pelo menos 1 voto positivo)
    const annotationsWithVotes = annotations.filter(
      (a) => a.helpfulCount > 0
    ).length;
    const helpfulnessRate =
      totalAnnotations > 0
        ? (annotationsWithVotes / totalAnnotations) * 100
        : 0;

    // Distribuição por categoria
    const categoryDistribution = annotations.reduce(
      (acc: Record<string, number>, a) => {
        acc[a.category] = (acc[a.category] || 0) + 1;
        return acc;
      },
      {}
    );

    // Distribuição por dificuldade
    const difficultyDistribution = annotations.reduce(
      (acc: Record<string, number>, a) => {
        acc[a.difficulty] = (acc[a.difficulty] || 0) + 1;
        return acc;
      },
      {}
    );

    // Top anotações
    const topAnnotations = [...annotations]
      .sort((a, b) => b.helpfulCount - a.helpfulCount)
      .slice(0, 5);

    // Obras mais anotadas
    const worksMap = new Map();
    annotations.forEach((annotation) => {
      const workId = annotation.workId;
      if (!worksMap.has(workId)) {
        worksMap.set(workId, {
          id: workId,
          title: annotation.work?.title,
          composer: annotation.work?.composer,
          opOrCatalog: annotation.work?.opOrCatalog,
          annotationsCount: 0,
        });
      }
      worksMap.get(workId).annotationsCount++;
    });

    const mostAnnotatedWorks = Array.from(worksMap.values())
      .sort((a, b) => b.annotationsCount - a.annotationsCount)
      .slice(0, 5);

    return {
      totalAnnotations,
      publicAnnotations,
      verifiedAnnotations,
      privateAnnotations,
      totalHelpfulVotes,
      totalViews,
      avgHelpfulVotes: Math.round(avgHelpfulVotes * 10) / 10,
      avgViews: Math.round(avgViews),
      highPerformingCount,
      categoriesUsed,
      recentAnnotations,
      helpfulnessRate: Math.round(helpfulnessRate),
      categoryDistribution,
      difficultyDistribution,
      topAnnotations,
      mostAnnotatedWorks,
    };
  }, [userId, userAnnotations]);
};

// Hook para persistir estado de visibilidade
const useStatsVisibility = (key: string) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`stats-visible-${key}`);
    setIsVisible(saved === 'true');
  }, [key]);

  const toggleVisibility = () => {
    const newValue = !isVisible;
    setIsVisible(newValue);
    localStorage.setItem(`stats-visible-${key}`, newValue.toString());
  };

  return { isVisible, toggleVisibility };
};

// Função para obter userId (seria passado como prop em uso real)
const useUserId = () => {
  // Em implementação real, isso viria do contexto de auth
  // Por agora, vamos simular
  return 'user-123'; // Placeholder
};

export default function AnnotationsStatsWidget({
  className = '',
}: AnnotationsStatsWidgetProps) {
  const userId = useUserId();
  const stats = useAnnotationsStats(userId);
  const { isVisible, toggleVisibility } = useStatsVisibility('annotations');

  if (!stats) return null;

  // Criar badges baseado nas stats
  const badges = createAnnotationsBadges(stats);

  // Se não tem anotações suficientes, mostrar CTA
  if (stats.totalAnnotations < 3) {
    return (
      <AnimatedCard hover="lift" className={`classical-card p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiMessageSquare className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-theme-primary mb-2">
            Compartilhe seu Conhecimento!
          </h3>
          <p className="text-theme-secondary mb-6">
            Você tem apenas {stats.totalAnnotations} anotação
            {stats.totalAnnotations !== 1 ? 'ões' : ''}. Que tal ajudar outros
            músicos com suas dicas e insights?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/works"
              className="btn-classical-primary flex items-center justify-center space-x-2 py-3"
            >
              <FiBookOpen className="w-4 h-4" />
              <span>Explorar Obras</span>
            </Link>
            <Link
              href="/composers"
              className="btn-classical-secondary flex items-center justify-center space-x-2 py-3"
            >
              <FiUsers className="w-4 h-4" />
              <span>Ver Compositores</span>
            </Link>
          </div>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toggle Button */}
      <AnimatedCard hover="scale" className="classical-card p-4">
        <button
          onClick={toggleVisibility}
          className="w-full flex items-center justify-between text-theme-primary hover:text-brand-primary transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
              <FiBarChart2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Estatísticas das Anotações</h3>
              <p className="text-sm text-theme-tertiary">
                {isVisible
                  ? 'Clique para esconder'
                  : 'Veja seu impacto na comunidade'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isVisible && stats.totalAnnotations >= 10 && (
              <span className="px-2 py-1 bg-accent-purple/10 text-accent-purple text-xs rounded-full font-medium">
                {badges.filter((b) => b.unlocked).length} conquistas
              </span>
            )}
            {isVisible ? (
              <FiEyeOff className="w-5 h-5" />
            ) : (
              <FiEye className="w-5 h-5" />
            )}
          </div>
        </button>
      </AnimatedCard>

      {/* Stats Content */}
      {isVisible && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatedItem direction="up" delay={0.1}>
              <div className="classical-card p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiMessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.totalAnnotations}
                </div>
                <div className="text-sm text-theme-tertiary">Anotações</div>
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up" delay={0.2}>
              <div className="classical-card p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiThumbsUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.totalHelpfulVotes}
                </div>
                <div className="text-sm text-theme-tertiary">Votos Úteis</div>
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up" delay={0.3}>
              <div className="classical-card p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiEye className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.totalViews}
                </div>
                <div className="text-sm text-theme-tertiary">Visualizações</div>
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up" delay={0.4}>
              <div className="classical-card p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiStar className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.avgHelpfulVotes}
                </div>
                <div className="text-sm text-theme-tertiary">
                  Média de Úteis
                </div>
              </div>
            </AnimatedItem>
          </div>

          {/* Impacto na Comunidade */}
          <AnimatedCard hover="lift" className="classical-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiUsers className="w-5 h-5 text-accent-green" />
              <h4 className="font-semibold text-theme-primary">
                Seu Impacto na Comunidade
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-green">
                  {stats.publicAnnotations}
                </div>
                <div className="text-sm text-theme-secondary">Públicas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-blue">
                  {stats.verifiedAnnotations}
                </div>
                <div className="text-sm text-theme-secondary">Verificadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-purple">
                  {stats.helpfulnessRate}%
                </div>
                <div className="text-sm text-theme-secondary">
                  Taxa de Utilidade
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-500">
                  {stats.highPerformingCount}
                </div>
                <div className="text-sm text-theme-secondary">
                  Top Anotações
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Top Anotações */}
          {stats.topAnnotations.length > 0 && (
            <AnimatedCard hover="lift" className="classical-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BiTrophy className="w-5 h-5 text-amber-500" />
                <h4 className="font-semibold text-theme-primary">
                  Suas Anotações Mais Populares
                </h4>
              </div>
              <div className="space-y-3">
                {stats.topAnnotations.slice(0, 3).map((annotation, index) => (
                  <div
                    key={annotation.id}
                    className="flex items-center space-x-3 p-3 classical-card-simple rounded-xl"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                        index === 0
                          ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                          : index === 1
                          ? 'bg-gradient-to-r from-slate-400 to-slate-600'
                          : 'bg-gradient-to-r from-amber-600 to-amber-800'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-theme-primary text-sm truncate">
                        {annotation.title}
                      </div>
                      <div className="text-xs text-theme-tertiary">
                        {annotation.work?.title} -{' '}
                        {annotation.work?.composer.name}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-theme-tertiary">
                      <span className="flex items-center space-x-1">
                        <FiThumbsUp className="w-3 h-3" />
                        <span>{annotation.helpfulCount}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FiEye className="w-3 h-3" />
                        <span>{annotation.viewCount}</span>
                      </span>
                      {annotation.isVerified && (
                        <MdVerified className="w-3 h-3 text-accent-green" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          )}

          {/* CTAs inteligentes */}
          <AnimatedCard hover="lift" className="classical-card p-6">
            <div className="text-center">
              <FiZap className="w-8 h-8 text-brand-primary mx-auto mb-3" />
              <h4 className="font-bold text-theme-primary mb-2">
                Continue Contribuindo
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {stats.categoriesUsed < 7 && (
                  <div className="btn-classical-secondary flex items-center justify-center space-x-2 py-2 cursor-default">
                    <FiTarget className="w-4 h-4" />
                    <span>Explore novas categorias</span>
                  </div>
                )}
                {stats.publicAnnotations < 5 && (
                  <Link
                    href="/works"
                    className="btn-classical-primary flex items-center justify-center space-x-2 py-2"
                  >
                    <FiHeart className="w-4 h-4" />
                    <span>Tornar mais públicas</span>
                  </Link>
                )}
              </div>
            </div>
          </AnimatedCard>

          {/* Badge System */}
          <BadgeGrid
            badges={badges}
            title="Suas Conquistas de Contribuição"
            size="md"
          />
        </div>
      )}
    </div>
  );
}
