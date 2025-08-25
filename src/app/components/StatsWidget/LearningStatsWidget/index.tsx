// components/learning/LearningStatsWidget.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  FiBarChart2,
  FiEye,
  FiEyeOff,
  FiTarget,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiAward,
  FiZap,
  FiMusic,
  FiStar,
  FiUsers,
  FiAlertCircle,
  FiBookOpen,
} from 'react-icons/fi';
import { PiTarget } from 'react-icons/pi';
import Link from 'next/link';
import { useLearningStore } from '@/app/stores/useLearningStore';
import { AnimatedCard, AnimatedItem } from '../../animation/AnimatedComponents';
import { BadgeGrid, createLearningBadges } from '../../badges/BadgeSystem';

interface LearningStatsWidgetProps {
  className?: string;
}

// Hook para calcular stats avançadas de learning
const useLearningStats = () => {
  const { wantToLearn, learned } = useLearningStore();

  return useMemo(() => {
    const totalLearning = wantToLearn.length + learned.length;

    // === STATS WANT TO LEARN ===

    // Distribuição por prioridade
    const priorityDistribution = wantToLearn.reduce(
      (acc: Record<string, number>, item) => {
        const priority = item.priority || 0;
        const label =
          priority >= 4 ? 'Alta' : priority >= 3 ? 'Média' : 'Baixa';
        acc[label] = (acc[label] || 0) + 1;
        return acc;
      },
      {}
    );

    // Distribuição por dificuldade (want to learn)
    const wantDifficultyDistribution = wantToLearn.reduce(
      (acc: Record<string, number>, item) => {
        const difficulty = item.difficulty || 'Não definida';
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      },
      {}
    );

    // Obras próximas do vencimento
    const today = new Date();
    const oneWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = wantToLearn.filter((item) => {
      if (!item.targetDate) return false;
      const targetDate = new Date(item.targetDate);
      return targetDate <= oneWeek && targetDate >= today;
    }).length;

    // Tempo total estimado de estudo
    const totalEstimatedHours = wantToLearn.reduce(
      (sum, item) => sum + (item.estimatedStudyTime || 0),
      0
    );

    // Compositores na lista de desejos
    const wantComposerDistribution = wantToLearn.reduce(
      (acc: Record<string, number>, item) => {
        const composer = item.work?.composer.fullName || 'Desconhecido';
        acc[composer] = (acc[composer] || 0) + 1;
        return acc;
      },
      {}
    );

    const topWantComposers = Object.entries(wantComposerDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    // === STATS LEARNED ===

    // Progresso anual
    const currentYear = new Date().getFullYear();
    const learnedThisYear = learned.filter((item) => {
      const learnedDate = new Date(item.learnedAt);
      return learnedDate.getFullYear() === currentYear;
    }).length;

    // Progresso mensal (últimos 6 meses)
    const monthlyProgress = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;

      const count = learned.filter((item) => {
        const learnedDate = new Date(item.learnedAt);
        const itemMonthKey = `${learnedDate.getFullYear()}-${String(
          learnedDate.getMonth() + 1
        ).padStart(2, '0')}`;
        return itemMonthKey === monthKey;
      }).length;

      monthlyProgress.push({ month: monthKey, count });
    }

    // Maestria média
    const avgMastery =
      learned.length > 0
        ? learned.reduce((sum, item) => sum + item.mastery, 0) / learned.length
        : 0;

    // Obras com maestria 4+
    const expertLevelCount = learned.filter((item) => item.mastery >= 4).length;

    // Performances públicas
    const publicPerformances = learned.filter(
      (item) => item.publicPerformance
    ).length;

    // Taxa de recomendação
    const recommendedWorks = learned.filter(
      (item) => item.wouldRecommend !== false
    ).length;
    const recommendationRate =
      learned.length > 0 ? (recommendedWorks / learned.length) * 100 : 0;

    // Tempo médio de estudo
    const learnedWithDuration = learned.filter((item) => item.studyDuration);
    const avgStudyTime =
      learnedWithDuration.length > 0
        ? learnedWithDuration.reduce(
            (sum, item) => sum + (item.studyDuration || 0),
            0
          ) / learnedWithDuration.length
        : 0;

    // Evolução de dificuldade
    const difficultyProgression = learned
      .filter((item) => item.difficulty && item.learnedAt)
      .sort(
        (a, b) =>
          new Date(a.learnedAt).getTime() - new Date(b.learnedAt).getTime()
      )
      .slice(-5) // Últimas 5 obras
      .map((item) => ({
        title: item.work?.title || 'Obra',
        difficulty: item.difficulty,
        date: item.learnedAt,
      }));

    // Compositores dominados
    const learnedComposerDistribution = learned.reduce(
      (acc: Record<string, number>, item) => {
        const composer = item.work?.composer.fullName || 'Desconhecido';
        acc[composer] = (acc[composer] || 0) + 1;
        return acc;
      },
      {}
    );

    const topLearnedComposers = Object.entries(learnedComposerDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    // Streak atual (simulado - baseado na distribuição temporal)
    const recentLearned = learned.filter((item) => {
      const learnedDate = new Date(item.learnedAt);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return learnedDate >= sevenDaysAgo;
    }).length;

    const currentStreak = Math.min(recentLearned, 7);

    // Taxa de completação (simulada)
    const completionRate =
      totalLearning > 0 ? (learned.length / totalLearning) * 100 : 0;

    // Enjoyment médio
    const learnedWithEnjoyment = learned.filter((item) => item.enjoyment);
    const avgEnjoyment =
      learnedWithEnjoyment.length > 0
        ? learnedWithEnjoyment.reduce(
            (sum, item) => sum + (item.enjoyment || 0),
            0
          ) / learnedWithEnjoyment.length
        : 0;

    return {
      // Básicas
      totalLearning,
      wantToLearnCount: wantToLearn.length,
      learnedCount: learned.length,

      // Want to Learn stats
      priorityDistribution,
      wantDifficultyDistribution,
      upcomingDeadlines,
      totalEstimatedHours,
      topWantComposers,

      // Learned stats
      learnedThisYear,
      monthlyProgress,
      avgMastery,
      expertLevelCount,
      publicPerformances,
      recommendationRate,
      avgStudyTime,
      difficultyProgression,
      topLearnedComposers,
      currentStreak,
      completionRate,
      avgEnjoyment,

      // Para badges
      recommendedWorks,
    };
  }, [wantToLearn, learned]);
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

export default function LearningStatsWidget({
  className = '',
}: LearningStatsWidgetProps) {
  const stats = useLearningStats();
  const { isVisible, toggleVisibility } = useStatsVisibility('learning');

  // Criar badges baseado nas stats
  const badges = createLearningBadges({
    totalLearning: stats.totalLearning,
    wantToLearnCount: stats.wantToLearnCount,
    learnedCount: stats.learnedCount,
    avgMastery: stats.avgMastery,
    expertLevelCount: stats.expertLevelCount,
    publicPerformances: stats.publicPerformances,
    avgStudyTime: stats.avgStudyTime,
    currentStreak: stats.currentStreak,
    completionRate: stats.completionRate,
  });

  // Se não tem itens suficientes, mostrar CTA
  if (stats.totalLearning < 3) {
    return (
      <AnimatedCard hover="lift" className={`classical-card p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PiTarget className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-theme-primary mb-2">
            Sua Jornada Musical Começa Aqui!
          </h3>
          <p className="text-theme-secondary mb-6">
            Você tem apenas {stats.totalLearning}{' '}
            {stats.totalLearning === 1 ? 'obra' : 'obras'} em suas listas. Que
            tal definir mais metas de estudo?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/works"
              className="btn-classical-primary flex items-center justify-center space-x-2 py-3"
            >
              <FiMusic className="w-4 h-4" />
              <span>Encontrar Obras</span>
            </Link>
            <Link
              href="/composers"
              className="btn-classical-secondary flex items-center justify-center space-x-2 py-3"
            >
              <FiBookOpen className="w-4 h-4" />
              <span>Explorar Compositores</span>
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
            <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
              <FiBarChart2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Estatísticas de Aprendizado</h3>
              <p className="text-sm text-theme-tertiary">
                {isVisible
                  ? 'Clique para esconder'
                  : 'Veja seu progresso musical'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isVisible && stats.totalLearning >= 10 && (
              <span className="px-2 py-1 bg-accent-green/10 text-accent-green text-xs rounded-full font-medium">
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
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiTarget className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.wantToLearnCount}
                </div>
                <div className="text-sm text-theme-tertiary">
                  Quero Aprender
                </div>
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up" delay={0.2}>
              <div className="classical-card p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiCheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.learnedCount}
                </div>
                <div className="text-sm text-theme-tertiary">Já Aprendi</div>
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up" delay={0.3}>
              <div className="classical-card p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiStar className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.avgMastery.toFixed(1)}
                </div>
                <div className="text-sm text-theme-tertiary">
                  Maestria Média
                </div>
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up" delay={0.4}>
              <div className="classical-card p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-pink rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiTrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {stats.learnedThisYear}
                </div>
                <div className="text-sm text-theme-tertiary">Obras em 2024</div>
              </div>
            </AnimatedItem>
          </div>

          {/* Alertas e Deadlines */}
          {stats.upcomingDeadlines > 0 && (
            <AnimatedCard
              hover="lift"
              className="classical-card p-6 border-l-4 border-accent-red"
            >
              <div className="flex items-center space-x-3 mb-3">
                <FiAlertCircle className="w-5 h-5 text-accent-red" />
                <h4 className="font-semibold text-theme-primary">Atenção!</h4>
              </div>
              <p className="text-theme-secondary mb-4">
                Você tem <strong>{stats.upcomingDeadlines}</strong> obra
                {stats.upcomingDeadlines !== 1 ? 's' : ''} com prazo vencendo
                nos próximos 7 dias.
              </p>
              <Link
                href="/learning?tab=want-to-learn&filter=upcoming"
                className="btn-classical-primary inline-flex items-center space-x-2"
              >
                <FiClock className="w-4 h-4" />
                <span>Revisar Prazos</span>
              </Link>
            </AnimatedCard>
          )}

          {/* Tempo de Estudo Estimado */}
          {stats.totalEstimatedHours > 0 && (
            <AnimatedCard hover="lift" className="classical-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FiClock className="w-5 h-5 text-accent-blue" />
                <h4 className="font-semibold text-theme-primary">
                  Plano de Estudos
                </h4>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center">
                  <FiClock className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-theme-primary">
                    {stats.totalEstimatedHours}h
                  </div>
                  <div className="text-theme-secondary">
                    Tempo total estimado ·{' '}
                    {Math.ceil(stats.totalEstimatedHours / 7)} semanas de estudo
                  </div>
                  <div className="text-sm text-theme-tertiary mt-1">
                    Assumindo 1h por dia de prática
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Progresso Mensal */}
          {stats.monthlyProgress.some((m) => m.count > 0) && (
            <AnimatedCard hover="lift" className="classical-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FiTrendingUp className="w-5 h-5 text-accent-green" />
                <h4 className="font-semibold text-theme-primary">
                  Progresso Mensal
                </h4>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {stats.monthlyProgress.map((month) => {
                  const maxCount = Math.max(
                    ...stats.monthlyProgress.map((m) => m.count)
                  );
                  const height =
                    maxCount > 0
                      ? Math.max((month.count / maxCount) * 100, 5)
                      : 5;

                  return (
                    <div key={month.month} className="text-center">
                      <div className="mb-2 flex items-end justify-center h-20">
                        <div
                          className="w-full bg-gradient-to-t from-accent-green to-accent-blue rounded-t transition-all duration-500 min-h-[4px]"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <div className="text-xs text-theme-tertiary">
                        {month.month.split('-')[1]}
                      </div>
                      <div className="text-sm font-medium text-theme-primary">
                        {month.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnimatedCard>
          )}

          {/* Compositores Dominados */}
          {stats.topLearnedComposers.length > 0 && (
            <AnimatedCard hover="lift" className="classical-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FiAward className="w-5 h-5 text-amber-500" />
                <h4 className="font-semibold text-theme-primary">
                  Compositores que Você Domina
                </h4>
              </div>
              <div className="space-y-3">
                {stats.topLearnedComposers.map((composer, index) => (
                  <div
                    key={composer.name}
                    className="flex items-center space-x-3"
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
                      {composer.count}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-theme-primary">
                        {composer.name}
                      </div>
                      <div className="text-sm text-theme-secondary">
                        {composer.count === 1
                          ? 'Expert'
                          : composer.count >= 3
                          ? 'Mestre'
                          : 'Avançado'}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-accent-green">
                      {((composer.count / stats.learnedCount) * 100).toFixed(0)}
                      %
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          )}

          {/* Performance Stats */}
          {stats.publicPerformances > 0 && (
            <AnimatedCard hover="lift" className="classical-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FiUsers className="w-5 h-5 text-accent-purple" />
                <h4 className="font-semibold text-theme-primary">
                  Histórico de Performances
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-purple">
                    {stats.publicPerformances}
                  </div>
                  <div className="text-sm text-theme-secondary">
                    Performances
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-green">
                    {stats.recommendationRate.toFixed(0)}%
                  </div>
                  <div className="text-sm text-theme-secondary">
                    Recomendaria
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-theme-primary">
                    {stats.avgStudyTime.toFixed(0)}
                  </div>
                  <div className="text-sm text-theme-secondary">
                    Dias médios
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* CTAs inteligentes */}
          <AnimatedCard hover="lift" className="classical-card p-6">
            <div className="text-center">
              <FiZap className="w-8 h-8 text-brand-primary mx-auto mb-3" />
              <h4 className="font-bold text-theme-primary mb-2">
                Próximos Passos
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {stats.wantToLearnCount < 5 && (
                  <Link
                    href="/works"
                    className="btn-classical-secondary flex items-center justify-center space-x-2 py-2"
                  >
                    <FiTarget className="w-4 h-4" />
                    <span>Adicionar Metas</span>
                  </Link>
                )}
                {stats.expertLevelCount >= 3 &&
                  stats.publicPerformances === 0 && (
                    <div className="btn-classical-primary flex items-center justify-center space-x-2 py-2 cursor-default">
                      <FiUsers className="w-4 h-4" />
                      <span>Que tal um recital?</span>
                    </div>
                  )}
                {stats.completionRate < 50 && (
                  <div className="btn-classical-secondary flex items-center justify-center space-x-2 py-2 cursor-default">
                    <FiCheckCircle className="w-4 h-4" />
                    <span>Foque nas metas atuais</span>
                  </div>
                )}
              </div>
            </div>
          </AnimatedCard>

          {/* Badge System */}
          <BadgeGrid
            badges={badges}
            title="Suas Conquistas de Aprendizado"
            size="md"
          />
        </div>
      )}
    </div>
  );
}
