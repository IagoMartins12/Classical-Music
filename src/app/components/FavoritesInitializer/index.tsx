// components/FavoritesInitializer.tsx - Componente para SSR
'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';
import { useEffect } from 'react';

interface FavoritesInitializerProps {
  favorites: {
    composers: any[];
    works: any[];
  };
}

export const FavoritesInitializer = ({
  favorites,
}: FavoritesInitializerProps) => {
  const { initializeFavorites, initialized } = useFavoritesStore();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (
      isAuthenticated &&
      user?.id &&
      !initialized &&
      (favorites.composers.length > 0 || favorites.works.length > 0)
    ) {
      initializeFavorites(favorites.composers, favorites.works);
    }
  }, [favorites, initializeFavorites, initialized, isAuthenticated, user?.id]);

  return null;
};
