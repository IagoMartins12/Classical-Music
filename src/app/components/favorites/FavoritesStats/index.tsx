// components/FavoritesStats/FavoritesStats.tsx
'use client';

import { useFavoritesStore } from '@/app/stores/useFavoritesStore';
import { useState, useEffect } from 'react';
import { FiHeart, FiMusic, FiUser, FiTrendingUp } from 'react-icons/fi';

interface FavoritesStatsProps {
  className?: string;
  variant?: 'compact' | 'detailed';
}

export const FavoritesStats = ({
  className = '',
  variant = 'compact',
}: FavoritesStatsProps) => {
  const { getFavoriteComposersCount, getFavoriteWorksCount } =
    useFavoritesStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const composersCount = getFavoriteComposersCount();
  const worksCount = getFavoriteWorksCount();
  const totalCount = composersCount + worksCount;

  if (totalCount === 0) return null;

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl flex items-center justify-center">
            <FiHeart className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-sm font-medium text-theme-primary">
            {totalCount} favoritos
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`classical-card p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
          <FiHeart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-theme-primary classical-title">
            Seus Favoritos
          </h3>
          <p className="text-sm text-theme-secondary">
            Coleção personalizada de música clássica
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total */}
        <div className="text-center p-4 bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-2">
            <FiHeart className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-red-500 mb-1">
            {totalCount}
          </div>
          <div className="text-xs text-theme-secondary">Total</div>
        </div>

        {/* Compositores */}
        <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-2">
            <FiUser className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-blue-500 mb-1">
            {composersCount}
          </div>
          <div className="text-xs text-theme-secondary">Compositores</div>
        </div>

        {/* Obras */}
        <div className="text-center p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-2">
            <FiMusic className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-yellow-500 mb-1">
            {worksCount}
          </div>
          <div className="text-xs text-theme-secondary">Obras</div>
        </div>
      </div>
    </div>
  );
};
