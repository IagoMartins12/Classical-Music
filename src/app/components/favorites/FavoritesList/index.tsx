// components/FavoritesList/FavoritesList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiUser, FiMusic, FiHeart, FiExternalLink } from 'react-icons/fi';
import Image from 'next/image';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';
import ComposerCardList from '../../ComposersClient/ComposerCardList';
import ComposerCard from '../../ComposersClient/ComposerCard';
import WorkCardList from '../../WorksClient/WorkCardList';

interface FavoritesListProps {
  type?: 'all' | 'composers' | 'works';
  limit?: number;
  className?: string;
}

export const FavoritesList = ({
  type = 'all',
  limit,
  className = '',
}: FavoritesListProps) => {
  const { favoriteComposers, favoriteWorks } = useFavoritesStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const composers = limit
    ? favoriteComposers.slice(0, limit)
    : favoriteComposers;
  const works = limit ? favoriteWorks.slice(0, limit) : favoriteWorks;

  const showComposers = type === 'all' || type === 'composers';
  const showWorks = type === 'all' || type === 'works';

  if (composers.length === 0 && works.length === 0) {
    return (
      <div className={`classical-card p-8 text-center ${className}`}>
        <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiHeart className="w-8 h-8 text-red-500/60" />
        </div>
        <h3 className="text-lg font-semibold text-theme-primary mb-2">
          Nenhum favorito ainda
        </h3>
        <p className="text-theme-secondary text-sm">
          Comece a favoritar compositores e obras para criar sua coleção
          pessoal.
        </p>
      </div>
    );
  }

  console.log('composer', composers);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Compositores Favoritos */}
      {showComposers && composers.length > 0 && (
        <div className="classical-card p-6 gap-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <FiUser className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-theme-primary">
                Compositores Favoritos
              </h3>
            </div>
            {limit && favoriteComposers.length > limit && (
              <Link
                href="/favorites/composers"
                className="text-sm text-blue-500 hover:text-purple-500 transition-colors flex items-center space-x-1"
              >
                <span>Ver todos</span>
                <FiExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {composers.map((favorite) => (
              <div className="classical-card-simple cursor-pointer px-3 py-3">
                <ComposerCardList composer={favorite.composer} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Obras Favoritas */}
      {showWorks && works.length > 0 && (
        <div className="classical-card p-6 gap-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <FiMusic className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-theme-primary">
                Obras Favoritas
              </h3>
            </div>
            {limit && favoriteWorks.length > limit && (
              <Link
                href="/favorites/works"
                className="text-sm text-yellow-500 hover:text-yellow-600 transition-colors flex items-center space-x-1"
              >
                <span>Ver todas</span>
                <FiExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {works.map((favorite) => (
              <div className="classical-card-simple cursor-pointer px-3 py-3">
                <WorkCardList work={favorite.work} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
