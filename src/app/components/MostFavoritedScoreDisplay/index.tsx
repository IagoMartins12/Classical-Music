// components/MostFavoritedScoreDisplay.tsx - VERSÃO OTIMIZADA SEM LOOPS
'use client';

import { useSession } from 'next-auth/react';
import {
  FiHeart,
  FiStar,
  FiUsers,
  FiTrendingUp,
  FiDownload,
  FiEye,
  FiAward,
  FiTarget,
} from 'react-icons/fi';
import { usePublicScoreFavorites } from '@/app/hooks/useScoreFavorites';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';

interface MostFavoritedScoreDisplayProps {
  workId: string;
  workTitle: string;
  composerName: string;
  className?: string;
  variant?: 'full' | 'compact' | 'minimal';
}

export default function MostFavoritedScoreDisplay({
  workId,
  workTitle,
  composerName,
  className = '',
  variant = 'full',
}: MostFavoritedScoreDisplayProps) {
  const { data: session } = useSession();

  // 🆕 Usar APENAS o hook público otimizado
  const { publicStats, loading, error } = usePublicScoreFavorites(workId);

  // 🆕 Não mostrar se não há dados ou está carregando
  if (
    loading ||
    error ||
    !publicStats.mostFavoritedScore ||
    publicStats.totalFavorites === 0
  ) {
    return null;
  }

  const mostFavorited = publicStats.mostFavoritedScore;

  // 🆕 Renderização condicional por variante
  if (variant === 'minimal') {
    return (
      <div
        className={`inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-accent-gold/10 to-accent-orange/10 border border-accent-gold/30 text-accent-gold rounded-full text-xs ${className}`}
      >
        <FiAward className="w-3 h-3" />
        <span className="font-medium">
          Mais favoritada: {mostFavorited.totalFavorites} ❤️
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`bg-gradient-to-r from-accent-gold/10 to-accent-orange/10 border border-accent-gold/30 rounded-xl p-4 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiAward className="w-4 h-4 text-accent-gold" />
            <span className="font-medium text-theme-primary text-sm">
              Partitura Mais Favoritada
            </span>
          </div>
          <span className="text-accent-gold font-bold">
            {mostFavorited.totalFavorites} ❤️
          </span>
        </div>
        <div className="mt-2">
          <p className="text-sm text-theme-secondary line-clamp-1">
            {mostFavorited.scoreTitle}
          </p>
        </div>
      </div>
    );
  }

  // Variante 'full'
  return (
    <AnimatedCard
      hover="lift"
      className={`classical-card overflow-hidden ${className}`}
    >
      <div className="bg-gradient-to-r from-accent-gold/10 to-accent-orange/10 border-l-4 border-accent-gold p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-gold to-accent-orange rounded-xl flex items-center justify-center">
              <FiAward className="w-5 h-5 text-theme-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-theme-primary classical-title">
                🏆 Partitura Mais Favoritada
              </h3>
              <p className="text-sm text-theme-secondary">
                Escolha preferida da comunidade
              </p>
            </div>
          </div>

          {/* Badge de estatísticas */}
          <div className="text-right">
            <div className="flex items-center space-x-1 text-accent-gold">
              <FiUsers className="w-4 h-4" />
              <span className="font-bold text-lg">
                {mostFavorited.totalFavorites}
              </span>
            </div>
            <p className="text-xs text-theme-tertiary">favoritos</p>
          </div>
        </div>

        {/* Score Info */}
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-theme-primary mb-1 line-clamp-2">
              {mostFavorited.scoreTitle}
            </h4>
            <div className="flex items-center space-x-2 text-sm text-theme-secondary">
              <span className="px-2 py-1 bg-accent-gold/20 border border-accent-gold/30 text-accent-gold rounded-full text-xs font-medium">
                {mostFavorited.scoreType}
              </span>
              <span>•</span>
              <span>{mostFavorited.scoreSource}</span>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-accent-red/10 to-accent-pink/10 border border-accent-red/20 rounded-xl">
              <div className="flex items-center justify-center mb-1">
                <FiHeart className="w-4 h-4 text-accent-red" />
              </div>
              <div className="text-lg font-bold text-accent-red">
                {mostFavorited.totalFavorites}
              </div>
              <div className="text-xs text-theme-tertiary">Favoritos</div>
            </div>

            {mostFavorited.avgRating && (
              <div className="text-center p-3 bg-gradient-to-br from-accent-gold/10 to-accent-orange/10 border border-accent-gold/20 rounded-xl">
                <div className="flex items-center justify-center mb-1">
                  <FiStar className="w-4 h-4 text-accent-gold" />
                </div>
                <div className="text-lg font-bold text-accent-gold">
                  {mostFavorited.avgRating.toFixed(1)}
                </div>
                <div className="text-xs text-theme-tertiary">Avaliação</div>
              </div>
            )}

            <div className="text-center p-3 bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 border border-accent-blue/20 rounded-xl">
              <div className="flex items-center justify-center mb-1">
                <FiTarget className="w-4 h-4 text-accent-blue" />
              </div>
              <div className="text-lg font-bold text-accent-blue">
                {publicStats.totalScores}
              </div>
              <div className="text-xs text-theme-tertiary">Partituras</div>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-accent-green/10 to-accent-blue/10 border border-accent-green/20 rounded-xl">
              <div className="flex items-center justify-center mb-1">
                <FiTrendingUp className="w-4 h-4 text-accent-green" />
              </div>
              <div className="text-lg font-bold text-accent-green">
                {publicStats.totalFavorites}
              </div>
              <div className="text-xs text-theme-tertiary">Total</div>
            </div>
          </div>

          {/* Action Button */}
          {mostFavorited.downloadUrl && (
            <div className="pt-4 border-t border-accent-gold/20">
              <a
                href={mostFavorited.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-classical-primary flex items-center justify-center space-x-2 group"
              >
                <FiDownload className="w-4 h-4" />
                <span>Ver Partitura Mais Favoritada</span>
                <div className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiEye className="w-4 h-4" />
                </div>
              </a>
            </div>
          )}

          {/* Encouragement for non-logged users */}
          {!session?.user?.id && (
            <div className="mt-4 p-3 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 border border-brand-primary/20 rounded-xl">
              <div className="flex items-center space-x-2 text-sm">
                <FiHeart className="w-4 h-4 text-brand-primary" />
                <span className="text-theme-secondary">
                  <strong className="text-brand-primary">Faça login</strong>{' '}
                  para favoritar partituras e descobrir suas preferências!
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
}

// 🆕 Componente de estatísticas rápidas (sem requisições extras)
export function QuickScoreStats({
  workId,
  className = '',
}: {
  workId: string;
  className?: string;
}) {
  const { publicStats, loading } = usePublicScoreFavorites(workId);

  if (loading || publicStats.totalFavorites === 0) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center space-x-2 text-sm text-theme-secondary ${className}`}
    >
      <FiHeart className="w-3 h-3 text-accent-red" />
      <span>{publicStats.totalFavorites} favoritos</span>
      <span>•</span>
      <span>{publicStats.totalScores} partituras</span>
    </div>
  );
}
