// hooks/useFavorites.ts
'use client';

import { useEffect } from 'react';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { useAuth } from './useAuth';

// Hook para inicializar favoritos automaticamente
export const useFavorites = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const {
    initializeFavorites,
    initialized,
    reset,
    getFavoriteComposersCount,
    getFavoriteWorksCount,
  } = useFavoritesStore();

  useEffect(() => {
    const loadFavorites = async () => {
      if (isLoading) return;

      if (!user?.id || !isAuthenticated) {
        reset();
        return;
      }

      if (initialized) return;

      try {
        // Carregar favoritos do servidor
        const [composersResponse, worksResponse] = await Promise.all([
          fetch('/api/favorites/composers'),
          fetch('/api/favorites/works'),
        ]);

        if (composersResponse.ok && worksResponse.ok) {
          const [composersData, worksData] = await Promise.all([
            composersResponse.json(),
            worksResponse.json(),
          ]);

          initializeFavorites(
            composersData.favorites || [],
            worksData.favorites || []
          );
        }
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      }
    };

    loadFavorites();
  }, [
    user?.id,
    isAuthenticated,
    isLoading,
    initialized,
    initializeFavorites,
    reset,
  ]);

  return {
    isAuthenticated,
    isLoading,
    favoritesCount: {
      composers: getFavoriteComposersCount(),
      works: getFavoriteWorksCount(),
      total: getFavoriteComposersCount() + getFavoriteWorksCount(),
    },
  };
};

// Hook para favoritar item específico
export const useFavoriteItem = (id: string, type: 'composer' | 'work') => {
  const {
    isComposerFavorited,
    isWorkFavorited,
    toggleComposerFavorite,
    toggleWorkFavorite,
    loading,
  } = useFavoritesStore();

  const { user, isAuthenticated } = useAuth();

  const isFavorited =
    type === 'composer' ? isComposerFavorited(id) : isWorkFavorited(id);
  const isLoading =
    type === 'composer' ? loading.composers.has(id) : loading.works.has(id);

  const toggle = async () => {
    if (!user?.id || !isAuthenticated) return false;

    return type === 'composer'
      ? await toggleComposerFavorite(id, user.id)
      : await toggleWorkFavorite(id, user.id);
  };

  return {
    isFavorited,
    isLoading,
    toggle,
    canFavorite: !!user?.id && isAuthenticated,
  };
};
