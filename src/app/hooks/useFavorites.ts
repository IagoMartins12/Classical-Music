// hooks/useFavorites.ts
'use client';

import { useEffect } from 'react';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { useAuth } from './useAuth';
import { useDadosDaConta } from '../libs/session/dadosDaConta';
import { useLearningStore } from '../stores/useLearningStore';
import {
  listComposerFavorites,
  listLearned,
  listScoreFavorites,
  listWantToLearn,
  listWorkFavorites,
} from '@/app/requests/library';

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

  // Studies load here too: the work page shows them, not only "your studies".
  const confirmado = useDadosDaConta();
  const learningReady = useLearningStore((s) => s.initialized);
  const initializeLearning = useLearningStore((s) => s.initializeLearning);

  useEffect(() => {
    if (!confirmado || learningReady) return;
    let alive = true;
    void Promise.all([listWantToLearn(), listLearned()]).then(
      ([want, done]) => {
        if (alive && want.ok && done.ok)
          initializeLearning(want.data.items ?? [], done.data.items ?? []);
      }
    );
    return () => {
      alive = false;
    };
  }, [confirmado, learningReady, initializeLearning]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (isLoading) return;

      if (!user?.id || !isAuthenticated) {
        reset();
        return;
      }

      // Only once the kept data is known to be this account's.
      if (!confirmado || initialized) return;

      try {
        // Carregar favoritos do servidor
        const [composersResponse, worksResponse, scoresResponse] =
          await Promise.all([
            listComposerFavorites(),
            listWorkFavorites(),
            listScoreFavorites(),
          ]);

        if (composersResponse.ok && worksResponse.ok) {
          initializeFavorites(
            composersResponse.data.favorites || [],
            worksResponse.data.favorites || [],
            scoresResponse.ok ? scoresResponse.data.favorites || [] : []
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
    confirmado,
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
