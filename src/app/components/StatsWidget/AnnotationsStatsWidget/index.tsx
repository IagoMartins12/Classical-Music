// components/StatsWidget/AnnotationsStatsWidget.tsx - ATUALIZADO
'use client';

import { useMemo, useEffect } from 'react';
import {
  FiBarChart2,
  FiEye,
  FiEyeOff,
  FiMessageSquare,
  FiThumbsUp,
  FiUsers,
  FiStar,
  FiTarget,
  FiZap,
  FiHeart,
  FiBookOpen,
  FiShield,
} from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import Link from 'next/link';
import { useAnnotationsStore } from '@/app/stores/useAnnotationsStore';
import { useAuth } from '@/app/hooks/useAuth';
import { AnimatedCard, AnimatedItem } from '../../animation/AnimatedComponents';
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

interface AnnotationsStatsWidgetProps {
  className?: string;
}

export default function AnnotationsStatsWidget({
  className = '',
}: AnnotationsStatsWidgetProps) {
  const { user } = useAuth();
  const { userAnnotations, getUserAnnotations } = useAnnotationsStore();
  const { isVisible, toggleVisibility, isMobile, showInline } =
    useAdaptiveStats('annotations');
  const { openModal, Modal } = useStatsModal('annotations');
  const { checkAnnotationsAchievements } = useAnnotationsAchievementDetection();
  const { achievements, fetchAchievements } = useAchievementSystem();

  const annotations = user?.id ? getUserAnnotations(user.id) : [];

  // Calcular estatísticas
  const stats = useMemo(
    () => calculateAnnotationsStats(annotations, []),
    [annotations]
  );

  // Filtrar achievements de annotations
  const annotationsAchievements = achievements.filter(
    (a) => a.category === 'ANNOTATIONS'
  );

  // Criar badges e CTAs
  const badges = createAnnotationsBadges(stats);
  const nextAchievements = getNextAnnotationsAchievements(stats);
  const smartCTAs = getAnnotationsSmartCTAs(stats);

  console.log('badges', badges);
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

  const handleToggle = () => {
    if (isMobile && !isVisible) {
      openModal();
    } else {
      toggleVisibility();
    }
  };

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
            Compartilhe seu Conhecimento!
          </h3>
          <p className="text-theme-secondary mb-6">
            Você tem apenas {stats.totalAnnotations} anotação
            {stats.totalAnnotations !== 1 ? 'ões' : ''}. Que tal ajudar outros
            músicos com suas dicas e insights?
          </p>
          <div className="grid grid-cols-1  gap-3">
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
    <div className={`space-y-4 ${className} mt-4`}>
      {/* Toggle Button */}
      {/* <AnimatedCard hover="scale" className="classical-card p-4">
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-between text-theme-primary hover:text-brand-primary transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
              <FiBarChart2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Estatísticas das Anotações</h3>
              <p className="text-sm text-theme-tertiary">
                {isMobile
                  ? 'Toque para ver detalhes'
                  : isVisible
                  ? 'Clique para esconder'
                  : 'Veja seu impacto na comunidade'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {(!isVisible || isMobile) && stats.totalAnnotations >= 10 && (
              <span className="px-2 py-1 bg-accent-purple/10 text-accent-purple text-xs rounded-full font-medium">
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
      <Modal title="Estatísticas das Anotações">{renderStatsContent()}</Modal>
    </div>
  );

  function renderStatsContent() {
    return (
      <>
        {/* Overview Cards */}
        {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className="text-sm text-theme-tertiary">Média Útil</div>
            </div>
          </AnimatedItem>
        </div> */}

        {/* Próximas Conquistas */}
        {nextAchievements.length > 0 && (
          <AnimatedCard hover="lift" className="classical-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiTarget className="w-5 h-5 text-accent-purple" />
              <h4 className="font-semibold text-theme-primary">
                Próximas Conquistas
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
                Continue Contribuindo
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
          title="Suas Conquistas de Contribuição"
          size="md"
          maxVisible={6}
        />

        {/* Impact Stats */}
        <AnimatedCard hover="lift" className="classical-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiUsers className="w-5 h-5 text-accent-green" />
            <h4 className="font-semibold text-theme-primary">
              Seu Impacto na Comunidade
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              <div className="text-sm text-theme-secondary">Taxa Útil</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-500">
                {stats.highPerformingCount}
              </div>
              <div className="text-sm text-theme-secondary">Top Anotações</div>
            </div>
          </div>
        </AnimatedCard>
      </>
    );
  }
}
