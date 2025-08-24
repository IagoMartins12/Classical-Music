// components/favorites/FavoritesStatsWidget.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  FiBarChart2,
  FiEye,
  FiEyeOff,
  FiTrendingUp,
  FiClock,
  FiStar,
  FiMusic,
  FiUser,
  FiFileText,
  FiCalendar,
  FiTarget,
  FiZap,
  FiHeart,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import Link from 'next/link';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';
import { BadgeGrid, createFavoritesBadges } from '../badges/BadgeSystem';
import { AnimatedCard, AnimatedItem } from '../../animation/AnimatedComponents';
import { useAchievementDetection } from '../../achievement/AchievementToast';
import { useStatsModal } from '../StatsModal';
import { useAdaptiveStats } from '@/app/hooks/useMobile';
import { FaFire } from 'react-icons/fa';

interface FavoritesStatsWidgetProps {
  className?: string;
}

// Hook para calcular stats avançadas de favoritos
const useFavoritesStats = () => {
  const { favoriteComposers, favoriteWorks, favoriteScores } =
    useFavoritesStore();

  return useMemo(() => {
    // Stats básicas
    const totalFavorites =
      favoriteComposers.length + favoriteWorks.length + favoriteScores.length;

    // Distribuição por época
    const epochDistribution = favoriteComposers.reduce(
      (acc: Record<string, number>, fav) => {
        const epoch = fav.composer?.epochName || 'Desconhecida';
        acc[epoch] = (acc[epoch] || 0) + 1;
        return acc;
      },
      {}
    );

    const topEpoch = Object.entries(epochDistribution).sort(
      ([, a], [, b]) => b - a
    )[0];

    // Distribuição por instrumento (baseado nas obras)
    const instrumentDistribution: Record<string, number> = {};
    // Nota: Precisaríamos acessar o instrument da work, mas como não temos na interface,
    // vamos simular alguns dados para demonstração

    // Compositores "colecionadores" - quais compositores têm mais obras favoritadas
    const composerWorksCount = favoriteWorks.reduce(
      (acc: Record<string, number>, work) => {
        const composerName = work.work?.composer.fullName || 'Desconhecido';
        acc[composerName] = (acc[composerName] || 0) + 1;
        return acc;
      },
      {}
    );

    const topComposerCollection = Object.entries(composerWorksCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const maxWorksFromSameComposer = Math.max(
      ...Object.values(composerWorksCount),
      0
    );

    // Descobertas recentes (últimos 30 dias)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentFavorites = favoriteScores.filter((score) => {
      const addedDate = new Date(score.addedAt);
      return addedDate >= thirtyDaysAgo;
    }).length;

    // Streak de favoritamento (simulado - precisaríamos de datas)
    // Por agora, vamos calcular baseado na distribuição temporal dos favoritos
    const streakDays = Math.min(Math.floor(recentFavorites / 3), 7); // Simulação

    // Contagem de épocas únicas
    const uniqueEpochs = new Set(Object.keys(epochDistribution)).size;

    // Contagem de instrumentos únicos (simulado)
    const uniqueInstruments = 4; // Simulação

    // Partituras com ratings altos
    const highRatedScores = favoriteScores.filter(
      (score) => score.personalRating && score.personalRating >= 4
    ).length;

    // Partituras com notas pessoais
    const annotatedScores = favoriteScores.filter(
      (score) => score.notes && score.notes.trim().length > 0
    ).length;

    // Distribuição de tipos de partitura
    const scoreTypeDistribution = favoriteScores.reduce(
      (acc: Record<string, number>, score) => {
        acc[score.scoreType] = (acc[score.scoreType] || 0) + 1;
        return acc;
      },
      {}
    );

    return {
      // Básicas
      totalFavorites,
      composersCount: favoriteComposers.length,
      worksCount: favoriteWorks.length,
      scoresCount: favoriteScores.length,

      // Épocas
      epochDistribution,
      topEpoch: topEpoch ? { name: topEpoch[0], count: topEpoch[1] } : null,
      uniqueEpochs,

      // Compositores
      topComposerCollection,
      maxWorksFromSameComposer,

      // Descobertas
      recentFavorites,
      streakDays,
      uniqueInstruments,

      // Partituras
      highRatedScores,
      annotatedScores,
      scoreTypeDistribution,
      avgPersonalRating:
        favoriteScores.reduce(
          (sum, score) => sum + (score.personalRating || 0),
          0
        ) / (favoriteScores.length || 1),

      // Para badges
      epochsCount: uniqueEpochs,
      instrumentsCount: uniqueInstruments,
      recentDiscoveries: recentFavorites,
      topComposerWorks: maxWorksFromSameComposer,
    };
  }, [favoriteComposers, favoriteWorks, favoriteScores]);
};

export default function FavoritesStatsWidget({
  className = '',
}: FavoritesStatsWidgetProps) {
  const stats = useFavoritesStats();
  const { isVisible, toggleVisibility, isMobile, showInModal, showInline } =
    useAdaptiveStats('favorites');
  const { openModal, Modal } = useStatsModal('favorites');
  const { checkMultipleBadges } = useAchievementDetection();

  // Criar badges baseado nas stats
  const badges = createFavoritesBadges(stats);

  // Detectar conquistas desbloqueadas (demo)
  useEffect(() => {
    if (stats.totalFavorites > 0) {
      checkMultipleBadges(badges);
    }
  }, [stats.totalFavorites, badges.length]);

  // Handler para mobile - abre modal em vez de expandir inline
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
      <AnimatedCard hover="scale" className="classical-card p-4">
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
            {(!isVisible || isMobile) && stats.totalFavorites >= 20 && (
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
      </AnimatedCard>

      {/* Stats Content */}
      {showInline && (
        <div className="space-y-6">
          {/* Conteúdo das stats aqui - mantém o código existente */}
          {renderStatsContent()}
        </div>
      )}

      {/* Modal para Mobile */}
      <Modal title="Estatísticas dos Favoritos">{renderStatsContent()}</Modal>
    </div>
  );

  // Função para renderizar o conteúdo das stats (compartilhado entre inline e modal)
  function renderStatsContent() {
    return (
      <>
        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedItem direction="up" delay={0.1}>
            <div className="classical-card p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiHeart className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.totalFavorites}
              </div>
              <div className="text-sm text-theme-tertiary">
                Total de Favoritos
              </div>
            </div>
          </AnimatedItem>

          <AnimatedItem direction="up" delay={0.2}>
            <div className="classical-card p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                <FaFire className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.streakDays}
              </div>
              <div className="text-sm text-theme-tertiary">Dias de Streak</div>
            </div>
          </AnimatedItem>

          <AnimatedItem direction="up" delay={0.3}>
            <div className="classical-card p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiCalendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.recentFavorites}
              </div>
              <div className="text-sm text-theme-tertiary">Últimos 30 dias</div>
            </div>
          </AnimatedItem>

          <AnimatedItem direction="up" delay={0.4}>
            <div className="classical-card p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-pink rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiStar className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.avgPersonalRating.toFixed(1)}
              </div>
              <div className="text-sm text-theme-tertiary">Avaliação Média</div>
            </div>
          </AnimatedItem>
        </div>

        {/* Época Favorita */}
        {stats.topEpoch && (
          <AnimatedCard hover="lift" className="classical-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiTrendingUp className="w-5 h-5 text-accent-blue" />
              <h4 className="font-semibold text-theme-primary">
                Sua Época Musical Favorita
              </h4>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center">
                <GiMusicalNotes className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold text-theme-primary">
                  {stats.topEpoch.name}
                </div>
                <div className="text-theme-secondary">
                  {stats.topEpoch.count} compositores ·{' '}
                  {(
                    (stats.topEpoch.count / stats.composersCount) *
                    100
                  ).toFixed(0)}
                  % da sua coleção
                </div>
                <div className="mt-2">
                  <div className="w-full bg-theme-secondary rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-accent-blue to-accent-purple h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (stats.topEpoch.count / stats.composersCount) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <Link
              href={`/composers?epoch=${encodeURIComponent(
                stats.topEpoch.name
              )}`}
              className="inline-flex items-center space-x-1 text-sm text-accent-blue hover:text-accent-purple transition-colors mt-3"
            >
              <span>Explorar mais compositores do {stats.topEpoch.name}</span>
              <FiZap className="w-3 h-3" />
            </Link>
          </AnimatedCard>
        )}

        {/* Compositores Colecionados */}
        {stats.topComposerCollection.length > 0 && (
          <AnimatedCard hover="lift" className="classical-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiUser className="w-5 h-5 text-accent-green" />
              <h4 className="font-semibold text-theme-primary">
                Seus Compositores de Coleção
              </h4>
            </div>
            <div className="space-y-3">
              {stats.topComposerCollection
                .slice(0, 3)
                .map((composer, index) => (
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
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-theme-primary">
                        {composer.name}
                      </div>
                      <div className="text-sm text-theme-secondary">
                        {composer.count} obra{composer.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-16 bg-theme-secondary rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-accent-green to-accent-blue h-2 rounded-full"
                          style={{
                            width: `${
                              (composer.count /
                                stats.maxWorksFromSameComposer) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </AnimatedCard>
        )}

        {/* Partituras Especiais */}
        {stats.scoresCount > 0 && (
          <AnimatedCard hover="lift" className="classical-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiFileText className="w-5 h-5 text-accent-red" />
              <h4 className="font-semibold text-theme-primary">
                Sua Coleção de Partituras
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-theme-primary">
                  {stats.scoresCount}
                </div>
                <div className="text-sm text-theme-secondary">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-green">
                  {stats.highRatedScores}
                </div>
                <div className="text-sm text-theme-secondary">4+ estrelas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-blue">
                  {stats.annotatedScores}
                </div>
                <div className="text-sm text-theme-secondary">
                  Com anotações
                </div>
              </div>
            </div>
          </AnimatedCard>
        )}

        {/* CTAs baseado no perfil */}
        <AnimatedCard hover="lift" className="classical-card p-6">
          <div className="text-center">
            <FiTarget className="w-8 h-8 text-brand-primary mx-auto mb-3" />
            <h4 className="font-bold text-theme-primary mb-2">
              Recomendações para Você
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {stats.uniqueEpochs < 4 && (
                <Link
                  href="/composers"
                  className="btn-classical-secondary flex items-center justify-center space-x-2 py-2"
                >
                  <FiZap className="w-4 h-4" />
                  <span>Explorar Nova Época</span>
                </Link>
              )}
              {stats.scoresCount < 10 && (
                <Link
                  href="/works"
                  className="btn-classical-primary flex items-center justify-center space-x-2 py-2"
                >
                  <FiFileText className="w-4 h-4" />
                  <span>Encontrar Partituras</span>
                </Link>
              )}
            </div>
          </div>
        </AnimatedCard>

        {/* Badge System */}
        <BadgeGrid
          badges={badges}
          title="Suas Conquistas de Colecionador"
          size="md"
        />
      </>
    );
  }
}
