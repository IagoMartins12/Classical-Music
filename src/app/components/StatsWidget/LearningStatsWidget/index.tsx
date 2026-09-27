// components/StatsWidget/LearningStatsWidget.tsx - ATUALIZADO com Achievements
'use client';

import { useEffect, useMemo } from 'react';
import {
  PiBookOpen,
  PiLightning,
  PiMusicNotes,
  PiTarget,
  PiUsers,
} from 'react-icons/pi';
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
import { useTranslation } from '@/app/context/TranslationContext';
import { useLanguageStore } from '@/app/stores/useLanguageStore';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

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
  const { t } = useTranslation({ sections: ['pages/learning'] });
  const { language } = useLanguageStore();
  const stats = useLearningStats();
  const { showInline } = useAdaptiveStats('learning');
  const { Modal } = useStatsModal('learning');
  const { checkLearningAchievements } = useLearningAchievementDetection();
  const { fetchAchievements } = useAchievementSystem();

  // Criar badges baseado nas stats
  const badges = createLearningBadges(stats, language);
  const nextAchievements = getNextLearningAchievements(stats, language);
  const smartCTAs = getLearningSmartCTAs(stats, language);

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

  // Se não tem itens suficientes, mostrar CTA
  if (stats.totalLearning < 3) {
    return (
      <AnimatedCard
        hover="lift"
        className={`classical-card p-6 mt-4 ${className}`}
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PiTarget className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-theme-primary mb-2">
            {t('journey_start_title')}
          </h3>
          <p className="text-theme-secondary mb-6">
            {t('journey_start_description')} {stats.totalLearning}{' '}
            {stats.totalLearning === 1
              ? t('journey_start_works')
              : t('journey_start_works_plural')}{' '}
            {t('journey_start_suggestion')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/works"
              className="btn-classical-primary flex items-center justify-center space-x-2 py-3"
            >
              <PiMusicNotes className="w-4 h-4" />
              <span>{t('find_works_button')}</span>
            </Link>
            <Link
              href="/composers"
              className="btn-classical-secondary flex items-center justify-center space-x-2 py-3"
            >
              <PiBookOpen className="w-4 h-4" />
              <span>{t('explore_composers_button')}</span>
            </Link>
          </div>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <div className={`space-y-4 ${className} mt-4`}>
      {showInline && renderStatsContent()}

      {/* Modal para Mobile */}
      <Modal title={t('stats_title')}>{renderStatsContent()}</Modal>
    </div>
  );

  // Função para renderizar o conteúdo das stats
  function renderStatsContent() {
    return (
      <>
        {/* Próximas Conquistas */}
        {nextAchievements.length > 0 && (
          <AnimatedCard hover="lift" className="classical-card p-6">
            <Inline gap={3} className="mb-4">
              <PiTarget className="w-5 h-5" />
              <h4 className="font-semibold text-theme-primary">
                {t('next_achievements')}
              </h4>
            </Inline>
            <Stack gap={3}>
              {nextAchievements.slice(0, 2).map((badge) => {
                const Icon = badge.icon;
                const progressPercent = badge.maxProgress
                  ? ((badge.progress || 0) / badge.maxProgress) * 100
                  : 0;

                return (
                  <Inline
                    gap={4}
                    key={badge.id}
                    className="p-3 bg-theme-secondary rounded-xl"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${badge.color?.from} ${badge.color?.to} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-theme-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-theme-primary">
                        {badge.name}
                      </div>
                      <Text
                        papel="rotulo"
                        tom="fraco"
                        as="div"
                        className="mb-2"
                      >
                        {badge.description}
                      </Text>
                      {badge.maxProgress && (
                        <Inline gap={2}>
                          <div className="flex-1 bg-theme-primary rounded-full h-2">
                            <div
                              className={`h-full progress-bar rounded-full transition-all duration-500`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <Text papel="legenda" tom="fraco">
                            {badge.progress}/{badge.maxProgress}
                          </Text>
                        </Inline>
                      )}
                    </div>
                  </Inline>
                );
              })}
            </Stack>
          </AnimatedCard>
        )}

        {/* Smart CTAs */}
        {smartCTAs.length > 0 && (
          <AnimatedCard hover="lift" className="classical-card p-6">
            <Inline gap={3} className="mb-4">
              <PiLightning className="w-5 h-5 text-ouro-texto" />
              <h4 className="font-semibold text-theme-primary">
                {t('stats_widget_recommendations')}
              </h4>
            </Inline>
            <div className="grid grid-cols-1 gap-3">
              {smartCTAs.map((cta) => (
                <Link
                  key={cta.id}
                  href={cta.url}
                  className={`p-4 rounded-xl transition-all text-theme-primary hover:scale-105 ${
                    cta.priority === 'high'
                      ? 'bg-theme-tertiary'
                      : 'bg-theme-elevated border-theme-primary'
                  }`}
                >
                  <div className="font-medium mb-1">{cta.title}</div>
                  <div className={`text-sm mb-3 text-theme-primary`}>
                    {cta.description}
                  </div>
                  <div
                    className={`text-sm font-medium flex items-center space-x-1 ${
                      cta.priority === 'high'
                        ? 'text-ouro-texto'
                        : 'text-theme-primary'
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
            title={t('achievements_title')}
            size="md"
          />
        )}

        {/* Estatísticas Detalhadas */}
        <div className="grid grid-cols-1  gap-6">
          {/* Diversidade */}
          <AnimatedCard hover="lift" className="classical-card p-6">
            <Inline gap={3} className="mb-4">
              <PiMusicNotes className="w-5 h-5" />
              <h4 className="font-semibold text-theme-primary">
                {t('diversity_title')}
              </h4>
            </Inline>
            <Stack gap={3}>
              <div className="flex justify-between">
                <span className="text-theme-secondary">
                  {t('composers_label')}
                </span>
                <span className="font-medium text-theme-primary">
                  {stats.uniqueComposers}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-secondary">
                  {t('completion_rate')}
                </span>
                <span className="font-medium">
                  {stats.completionRate.toFixed(0)}%
                </span>
              </div>
            </Stack>
          </AnimatedCard>

          {/* Performance */}
          {stats.publicPerformances > 0 && (
            <AnimatedCard hover="lift" className="classical-card p-6">
              <Inline gap={3} className="mb-4">
                <PiUsers className="w-5 h-5" />
                <h4 className="font-semibold text-theme-primary">
                  {t('performance_title')}
                </h4>
              </Inline>
              <Stack gap={3}>
                <div className="flex justify-between">
                  <span className="text-theme-secondary">
                    {t('performances_label')}
                  </span>
                  <span className="font-medium">
                    {stats.publicPerformances}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-secondary">
                    {t('expert_works')}
                  </span>
                  <span className="font-medium">{stats.expertLevelCount}</span>
                </div>
              </Stack>
            </AnimatedCard>
          )}
        </div>
      </>
    );
  }
}
