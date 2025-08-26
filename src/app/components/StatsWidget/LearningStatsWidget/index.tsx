// components/StatsWidget/LearningStatsWidget.tsx - ATUALIZADO com Achievements
'use client';

import { useEffect, useMemo } from 'react';
import { FiTarget, FiZap, FiMusic, FiUsers, FiBookOpen } from 'react-icons/fi';
import { PiTarget } from 'react-icons/pi';
import Link from 'next/link';
import { useLearningStore } from '@/app/stores/useLearningStore';
import { AnimatedCard } from '../../animation/AnimatedComponents';
import { useAdaptiveStats } from '@/app/hooks/useMobile';
import { useStatsModal } from '../StatsModal';
import {
  createLearningBadges,
  getNextLearningAchievements,
  getLearningSmartCTAs,
  useLearningAchievementDetection,
} from '../../badges/LearningBadgeSystem';
import { BadgeGrid } from '../../badges/BadgeSystem';
import { useAchievementSystem } from '../../../hooks/useAchievements';

interface LearningStatsWidgetProps {
  className?: string;
}

// Hook para calcular stats avançadas de learning
const useLearningStats = () => {
  const { wantToLearn, learned } = useLearningStore();

  return useMemo(() => {
    const totalLearning = wantToLearn.length + learned.length;
    const learnedCount = learned.length;
    const wantToLearnCount = wantToLearn.length;

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

    // Taxa de completação
    const completionRate =
      totalLearning > 0 ? (learned.length / totalLearning) * 100 : 0;

    // Tempo médio de estudo
    const learnedWithDuration = learned.filter((item) => item.studyDuration);
    const avgStudyTime =
      learnedWithDuration.length > 0
        ? learnedWithDuration.reduce(
            (sum, item) => sum + (item.studyDuration || 0),
            0
          ) / learnedWithDuration.length
        : 0;

    // Compositores únicos
    const uniqueComposers = new Set(
      [...wantToLearn, ...learned]
        .map((item) => item.work?.composer.fullName)
        .filter(Boolean)
    ).size;

    // 🔧 CORREÇÃO: Épocas únicas - acesso correto via work.epoch.name
    const uniqueEpochs = new Set(
      [...wantToLearn, ...learned]
        .map((item) => item.epochName) // Corrigido: epoch.name em vez de composer.epochName
        .filter(Boolean)
    ).size;

    // Progresso recente
    const currentYear = new Date().getFullYear();
    const learnedThisYear = learned.filter((item) => {
      const learnedDate = new Date(item.learnedAt);
      return learnedDate.getFullYear() === currentYear;
    }).length;

    const thisMonth = new Date().getMonth();
    const learnedThisMonth = learned.filter((item) => {
      const learnedDate = new Date(item.learnedAt);
      return (
        learnedDate.getFullYear() === currentYear &&
        learnedDate.getMonth() === thisMonth
      );
    }).length;

    // Streak simulado (baseado em atividade recente)
    const recentLearned = learned.filter((item) => {
      const learnedDate = new Date(item.learnedAt);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return learnedDate >= sevenDaysAgo;
    }).length;
    const currentStreak = Math.min(recentLearned * 2, 30); // Simulação

    return {
      totalLearning,
      wantToLearnCount,
      learnedCount,
      avgMastery,
      expertLevelCount,
      publicPerformances,
      avgStudyTime,
      completionRate,
      uniqueComposers,
      uniqueEpochs, // ✅ Agora calcula corretamente via work.epoch.name
      learnedThisYear,
      learnedThisMonth,
      currentStreak,
    };
  }, [wantToLearn, learned]);
};

export default function LearningStatsWidget({
  className = '',
}: LearningStatsWidgetProps) {
  const stats = useLearningStats();
  const { isVisible, toggleVisibility, isMobile, showInline } =
    useAdaptiveStats('learning');
  const { openModal, Modal } = useStatsModal('learning');
  const { checkLearningAchievements } = useLearningAchievementDetection();
  const { achievements, fetchAchievements } = useAchievementSystem();

  // Filtrar achievements de learning
  const learningAchievements = achievements.filter(
    (a) => a.category === 'LEARNING'
  );

  // Criar badges baseado nas stats
  const badges = createLearningBadges(stats);
  const nextAchievements = getNextLearningAchievements(stats);
  const smartCTAs = getLearningSmartCTAs(stats);

  // Auto-detectar achievements quando stats mudarem
  useEffect(() => {
    if (stats.totalLearning > 0) {
      checkLearningAchievements(stats);
    }
  }, [
    stats.totalLearning,
    stats.learnedCount,
    Math.floor(stats.avgMastery),
    stats.publicPerformances,
  ]);

  // Buscar achievements na montagem
  useEffect(() => {
    fetchAchievements('LEARNING');
  }, []);

  // Handler para mobile - abre modal em vez de expandir inline
  const handleToggle = () => {
    if (isMobile && !isVisible) {
      openModal();
    } else {
      toggleVisibility();
    }
  };

  // Se não tem itens suficientes, mostrar CTA
  if (stats.totalLearning < 3) {
    return (
      <AnimatedCard
        hover="lift"
        className={`classical-card p-6 mt-4 ${className}`}
      >
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
    <div className={`space-y-4 ${className} mt-4`}>
      {/* Toggle Button */}
      {/* <AnimatedCard hover="scale" className="classical-card p-4">
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-between text-theme-primary hover:text-brand-primary transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
              <FiBarChart2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Estatísticas de Aprendizado</h3>
              <p className="text-sm text-theme-tertiary">
                {isMobile
                  ? 'Toque para ver detalhes'
                  : isVisible
                  ? 'Clique para esconder'
                  : 'Veja seu progresso musical'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {(!isVisible || isMobile) && stats.totalLearning >= 5 && (
              <span className="px-2 py-1 bg-accent-green/10 text-accent-green text-xs rounded-full font-medium">
                {badges.filter((b) => b.unlocked).length} conquistas
              </span>
            )}
            {!isMobile &&
              (isVisible ? (
                <FiEyeOff className="w-5 h-5" />
              ) : (
                <FiEye className="w-5 h-5" />
              ))}
            {isMobile && <FiBarChart2 className="w-5 h-5" />}
          </div>
        </button>
      </AnimatedCard> */}

      {/* Stats Content */}
      {showInline && renderStatsContent()}

      {/* Modal para Mobile */}
      <Modal title="Estatísticas de Aprendizado">{renderStatsContent()}</Modal>
    </div>
  );

  // Função para renderizar o conteúdo das stats
  function renderStatsContent() {
    return (
      <>
        {/* Overview Cards */}
        {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedItem direction="up" delay={0.1}>
            <div className="classical-card p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiTarget className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.wantToLearnCount}
              </div>
              <div className="text-sm text-theme-tertiary">Quero Aprender</div>
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
              <div className="text-sm text-theme-tertiary">Maestria Média</div>
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
        </div> */}

        {/* Próximas Conquistas */}
        {nextAchievements.length > 0 && (
          <AnimatedCard hover="lift" className="classical-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiTarget className="w-5 h-5 text-accent-green" />
              <h4 className="font-semibold text-theme-primary">
                Próximas Conquistas
              </h4>
            </div>
            <div className="space-y-3">
              {nextAchievements.slice(0, 2).map((badge, index) => {
                const Icon = badge.icon;
                const progressPercent = badge.maxProgress
                  ? ((badge.progress || 0) / badge.maxProgress) * 100
                  : 0;

                return (
                  <div
                    key={badge.id}
                    className="flex items-center space-x-4 p-3 bg-theme-secondary rounded-xl"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${badge.color?.from} ${badge.color?.to} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-theme-primary">
                        {badge.name}
                      </div>
                      <div className="text-sm text-theme-tertiary mb-2">
                        {badge.description}
                      </div>
                      {badge.maxProgress && (
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-theme-primary rounded-full h-2">
                            <div
                              className={`h-full progress-bar rounded-full transition-all duration-500`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-theme-tertiary">
                            {badge.progress}/{badge.maxProgress}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </AnimatedCard>
        )}

        {/* Smart CTAs */}
        {smartCTAs.length > 0 && (
          <AnimatedCard hover="lift" className="classical-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiZap className="w-5 h-5 text-brand-primary" />
              <h4 className="font-semibold text-theme-primary">
                Recomendações para Você
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {smartCTAs.map((cta, index) => (
                <Link
                  key={cta.id}
                  href={cta.url}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    cta.priority === 'high'
                      ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white border-transparent'
                      : 'bg-theme-elevated border-theme-primary hover:border-brand-primary'
                  }`}
                >
                  <div className="font-medium mb-1">{cta.title}</div>
                  <div
                    className={`text-sm mb-3 ${
                      cta.priority === 'high'
                        ? 'text-white/90'
                        : 'text-theme-secondary'
                    }`}
                  >
                    {cta.description}
                  </div>
                  <div
                    className={`text-sm font-medium flex items-center space-x-1 ${
                      cta.priority === 'high'
                        ? 'text-white'
                        : 'text-brand-primary'
                    }`}
                  >
                    <span>{cta.action}</span>
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </AnimatedCard>
        )}

        {/* Badge System */}
        {badges.length > 0 && (
          <BadgeGrid
            badges={badges}
            title="Suas Conquistas de Aprendizado"
            size="md"
          />
        )}

        {/* Estatísticas Detalhadas */}
        <div className="grid grid-cols-1  gap-6">
          {/* Diversidade */}
          <AnimatedCard hover="lift" className="classical-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiMusic className="w-5 h-5 text-accent-blue" />
              <h4 className="font-semibold text-theme-primary">
                Diversidade Musical
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-theme-secondary">Compositores</span>
                <span className="font-medium text-theme-primary">
                  {stats.uniqueComposers}
                </span>
              </div>
              {/* <div className="flex justify-between">
                <span className="text-theme-secondary">Épocas</span>
                <span className="font-medium text-theme-primary">
                  {stats.uniqueEpochs}
                </span>
              </div> */}
              <div className="flex justify-between">
                <span className="text-theme-secondary">Taxa Completação</span>
                <span className="font-medium text-accent-green">
                  {stats.completionRate.toFixed(0)}%
                </span>
              </div>
            </div>
          </AnimatedCard>

          {/* Performance */}
          {stats.publicPerformances > 0 && (
            <AnimatedCard hover="lift" className="classical-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FiUsers className="w-5 h-5 text-accent-purple" />
                <h4 className="font-semibold text-theme-primary">
                  Performance
                </h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-theme-secondary">Performances</span>
                  <span className="font-medium text-accent-purple">
                    {stats.publicPerformances}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-secondary">Obras Expert</span>
                  <span className="font-medium text-accent-green">
                    {stats.expertLevelCount}
                  </span>
                </div>
              </div>
            </AnimatedCard>
          )}
        </div>
      </>
    );
  }
}
