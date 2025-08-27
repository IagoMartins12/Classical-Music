// components/StatsWidget/AnnotationsStatsWidget.tsx - ATUALIZADO
'use client';

import { useMemo, useEffect } from 'react';
import {
  FiMessageSquare,
  FiUsers,
  FiTarget,
  FiZap,
  FiBookOpen,
} from 'react-icons/fi';
import Link from 'next/link';
import { useAnnotationsStore } from '@/app/stores/useAnnotationsStore';
import { useAuth } from '@/app/hooks/useAuth';
import { AnimatedCard } from '../../animation/AnimatedComponents';
import { useAdaptiveStats } from '@/app/hooks/useMobile';
import { useStatsModal } from '../StatsModal';
import {
  createAnnotationsBadges,
  getNextAnnotationsAchievements,
  getAnnotationsSmartCTAs,
  calculateAnnotationsStats,
  useAnnotationsAchievementDetection,
} from '../../badges/AnnotationsBadgeSystem';
import { BadgeGrid } from '../../badges/BadgeSystem';
import { useAchievementSystem } from '../../../hooks/useAchievements';
import { useTranslation } from '@/app/hooks/useTranslation';

interface AnnotationsStatsWidgetProps {
  className?: string;
}

export default function AnnotationsStatsWidget({
  className = '',
}: AnnotationsStatsWidgetProps) {
  const { t } = useTranslation({ sections: ['pages/annotations'] });
  const { user } = useAuth();
  const { getUserAnnotations } = useAnnotationsStore();
  const { showInline } = useAdaptiveStats('annotations');
  const { Modal } = useStatsModal('annotations');
  const { checkAnnotationsAchievements } = useAnnotationsAchievementDetection();
  const { fetchAchievements } = useAchievementSystem();

  const annotations = user?.id ? getUserAnnotations(user.id) : [];

  // Calcular estatísticas
  const stats = useMemo(
    () => calculateAnnotationsStats(annotations),
    [annotations]
  );

  // Criar badges e CTAs
  const badges = createAnnotationsBadges(stats);
  const nextAchievements = getNextAnnotationsAchievements(stats);
  const smartCTAs = getAnnotationsSmartCTAs(stats);

  // Auto-detectar achievements
  useEffect(() => {
    if (stats.totalAnnotations > 0) {
      checkAnnotationsAchievements(stats);
    }
  }, [
    stats.totalAnnotations,
    stats.totalHelpfulVotes,
    stats.verifiedAnnotations,
    stats.categoriesUsed,
  ]);

  // Buscar achievements na montagem
  useEffect(() => {
    fetchAchievements('ANNOTATIONS');
  }, []);

  // Se não tem anotações suficientes, mostrar CTA
  if (stats.totalAnnotations < 3) {
    return (
      <AnimatedCard
        hover="lift"
        className={`classical-card p-6 ${className} mt-4`}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiMessageSquare className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-theme-primary mb-2">
            {t('stats_widget_share_knowledge')}
          </h3>
          <p className="text-theme-secondary mb-6">
            {stats.totalAnnotations === 1
              ? t('stats_widget_few_annotations_singular').replace(
                  '{count}',
                  stats.totalAnnotations.toString()
                )
              : t('stats_widget_few_annotations_plural').replace(
                  '{count}',
                  stats.totalAnnotations.toString()
                )}
            . {t('stats_widget_help_others')}
          </p>
          <div className="grid grid-cols-1  gap-3">
            <Link
              href="/works"
              className="btn-classical-primary flex items-center justify-center space-x-2 py-3"
            >
              <FiBookOpen className="w-4 h-4" />
              <span>{t('stats_widget_explore_works')}</span>
            </Link>
            <Link
              href="/composers"
              className="btn-classical-secondary flex items-center justify-center space-x-2 py-3"
            >
              <FiUsers className="w-4 h-4" />
              <span>{t('stats_widget_see_composers')}</span>
            </Link>
          </div>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <div className={`space-y-4 ${className} mt-4`}>
      {/* Stats Content */}
      {showInline && renderStatsContent()}

      {/* Modal para Mobile */}
      <Modal title={t('stats_modal_title')}>{renderStatsContent()}</Modal>
    </div>
  );

  function renderStatsContent() {
    return (
      <>
        {/* Próximas Conquistas */}
        {nextAchievements.length > 0 && (
          <AnimatedCard hover="lift" className="classical-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiTarget className="w-5 h-5 text-accent-purple" />
              <h4 className="font-semibold text-theme-primary">
                {t('stats_widget_next_achievements')}
              </h4>
            </div>
            <div className="space-y-3">
              {nextAchievements.slice(0, 2).map((badge) => {
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
                {t('stats_widget_continue_contributing')}
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {smartCTAs.map((cta) => (
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
        <BadgeGrid
          badges={badges}
          title={t('stats_widget_your_achievements')}
          size="md"
          maxVisible={6}
        />

        {/* Impact Stats */}
        <AnimatedCard hover="lift" className="classical-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiUsers className="w-5 h-5 text-accent-green" />
            <h4 className="font-semibold text-theme-primary">
              {t('stats_widget_community_impact')}
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-green">
                {stats.publicAnnotations}
              </div>
              <div className="text-sm text-theme-secondary">
                {t('stats_widget_public')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-blue">
                {stats.verifiedAnnotations}
              </div>
              <div className="text-sm text-theme-secondary">
                {t('stats_widget_verified')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-purple">
                {stats.helpfulnessRate}%
              </div>
              <div className="text-sm text-theme-secondary">
                {t('stats_widget_helpful_rate')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-500">
                {stats.highPerformingCount}
              </div>
              <div className="text-sm text-theme-secondary">
                {t('stats_widget_top_annotations')}
              </div>
            </div>
          </div>
        </AnimatedCard>
      </>
    );
  }
}
