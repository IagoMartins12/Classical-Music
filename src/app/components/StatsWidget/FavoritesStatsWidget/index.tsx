// components/StatsWidget/FavoritesStatsWidget.tsx - ATUALIZADO
'use client';

import { useMemo, useEffect } from 'react';
import {
  FiBarChart2,
  FiEye,
  FiEyeOff,
  FiTrendingUp,
  FiMusic,
  FiUser,
  FiFileText,
  FiTarget,
  FiZap,
  FiHeart,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import Link from 'next/link';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';
import { AnimatedCard, AnimatedItem } from '../../animation/AnimatedComponents';
import { useAdaptiveStats } from '@/app/hooks/useMobile';
import { useStatsModal } from '../StatsModal';
import {
  createFavoritesBadges,
  getNextFavoritesAchievements,
  getFavoritesSmartCTAs,
  calculateFavoritesStats,
  useFavoritesAchievementDetection,
} from '../../badges/FavoritesBadgeSystem';
import { BadgeGrid } from '../../badges/BadgeSystem';
import { useAchievementSystem } from '../../../hooks/useAchievements';

interface FavoritesStatsWidgetProps {
  className?: string;
}

export default function FavoritesStatsWidget({
  className = '',
}: FavoritesStatsWidgetProps) {
  const { favoriteComposers, favoriteWorks, favoriteScores } =
    useFavoritesStore();
  const { isVisible, toggleVisibility, isMobile, showInline } =
    useAdaptiveStats('favorites');
  const { openModal, Modal } = useStatsModal('favorites');
  const { checkFavoritesAchievements } = useFavoritesAchievementDetection();
  const { achievements, fetchAchievements } = useAchievementSystem();

  // Calcular estatísticas
  const stats = useMemo(
    () =>
      calculateFavoritesStats(favoriteComposers, favoriteWorks, favoriteScores),
    [favoriteComposers, favoriteWorks, favoriteScores]
  );

  // Filtrar achievements de favorites
  const favoritesAchievements = achievements.filter(
    (a) => a.category === 'FAVORITES'
  );

  // Criar badges e CTAs
  const badges = createFavoritesBadges(stats);
  const nextAchievements = getNextFavoritesAchievements(stats);
  const smartCTAs = getFavoritesSmartCTAs(stats);

  // Auto-detectar achievements
  useEffect(() => {
    if (stats.totalFavorites > 0) {
      checkFavoritesAchievements(stats);
    }
  }, [
    stats.totalFavorites,
    stats.uniqueEpochs,
    stats.topComposerWorks,
    stats.scoresCount,
  ]);

  // Buscar achievements na montagem
  useEffect(() => {
    fetchAchievements('FAVORITES');
  }, []);

  const handleToggle = () => {
    if (isMobile && !isVisible) {
      openModal();
    } else {
      toggleVisibility();
    }
  };

  // Se não tem favoritos suficientes, mostrar CTA
  if (stats.totalFavorites < 5) {
    return (
      <AnimatedCard hover="lift" className={`classical-card p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiHeart className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-theme-primary mb-2">
            Monte sua Biblioteca Musical!
          </h3>
          <p className="text-theme-secondary mb-6">
            Você tem apenas {stats.totalFavorites} favoritos. Que tal descobrir
            mais obras e compositores?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/composers"
              className="btn-classical-secondary flex items-center justify-center space-x-2 py-3"
            >
              <FiUser className="w-4 h-4" />
              <span>Compositores</span>
            </Link>
            <Link
              href="/works"
              className="btn-classical-primary flex items-center justify-center space-x-2 py-3"
            >
              <FiMusic className="w-4 h-4" />
              <span>Explorar Obras</span>
            </Link>
          </div>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toggle Button */}
      {/* <AnimatedCard hover="scale" className="classical-card p-4">
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-between text-theme-primary hover:text-brand-primary transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
              <FiBarChart2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Estatísticas dos Favoritos</h3>
              <p className="text-sm text-theme-tertiary">
                {isMobile
                  ? 'Toque para ver detalhes'
                  : isVisible
                  ? 'Clique para esconder'
                  : 'Descubra seus padrões musicais'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {(!isVisible || isMobile) && stats.totalFavorites >= 15 && (
              <span className="px-2 py-1 bg-accent-blue/10 text-accent-blue text-xs rounded-full font-medium">
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
      <Modal title="Estatísticas dos Favoritos">{renderStatsContent()}</Modal>
    </div>
  );

  function renderStatsContent() {
    return (
      <>
        {/* Próximas Conquistas */}
        {nextAchievements.length > 0 && (
          <AnimatedCard hover="lift" className="classical-card p-6 mt-4">
            <div className="flex items-center space-x-3 mb-4">
              <FiTarget className="w-5 h-5 text-accent-blue" />
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
                Recomendações para Você
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
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
          title="Suas Conquistas de Colecionador"
          size="md"
        />

        {/* Top Composer */}
        {stats.topComposerWorks > 1 && (
          <AnimatedCard hover="lift" className="classical-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiTrendingUp className="w-5 h-5 text-accent-green" />
              <h4 className="font-semibold text-theme-primary">
                Seu Compositor Favorito
              </h4>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-theme-primary mb-2">
                {stats.topComposerName}
              </div>
              <div className="text-theme-secondary">
                <strong>{stats.topComposerWorks}</strong> obras do seu
                compositor predileto
              </div>
            </div>
          </AnimatedCard>
        )}
      </>
    );
  }
}
