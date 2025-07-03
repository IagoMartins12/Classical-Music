// stores/useMostFavoritedStore.ts - Store Zustand para gerenciar partituras mais favoritadas
'use client';

import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MostFavoritedData {
  scoreId: string;
  scoreSource: string;
  totalFavorites: number;
  workId: string;
  timestamp: number; // Para cache
}

interface MostFavoritedState {
  // Cache de dados por workId
  mostFavoritedByWork: Record<string, MostFavoritedData>;

  // Estados de loading por workId
  loadingByWork: Record<string, boolean>;

  // Ações
  setMostFavorited: (workId: string, data: MostFavoritedData) => void;
  setLoading: (workId: string, loading: boolean) => void;
  getMostFavorited: (workId: string) => MostFavoritedData | null;
  isLoading: (workId: string) => boolean;
  fetchMostFavorited: (workId: string) => Promise<void>;
  clearExpiredCache: () => void;
  isScoreMostFavorited: (
    workId: string,
    scoreId: string,
    scoreSource?: string
  ) => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useMostFavoritedStore = create<MostFavoritedState>()(
  persist(
    (set, get) => ({
      mostFavoritedByWork: {},
      loadingByWork: {},

      setMostFavorited: (workId: string, data: MostFavoritedData) => {
        set((state) => ({
          mostFavoritedByWork: {
            ...state.mostFavoritedByWork,
            [workId]: { ...data, timestamp: Date.now() },
          },
        }));
      },

      setLoading: (workId: string, loading: boolean) => {
        set((state) => ({
          loadingByWork: {
            ...state.loadingByWork,
            [workId]: loading,
          },
        }));
      },

      getMostFavorited: (workId: string) => {
        const data = get().mostFavoritedByWork[workId];
        if (!data) return null;

        // Verificar se o cache expirou
        if (Date.now() - data.timestamp > CACHE_DURATION) {
          return null;
        }

        return data;
      },

      isLoading: (workId: string) => {
        return get().loadingByWork[workId] || false;
      },

      fetchMostFavorited: async (workId: string) => {
        const state = get();

        // Verificar se já está carregando
        if (state.isLoading(workId)) {
          return;
        }

        // Verificar cache válido
        const cached = state.getMostFavorited(workId);
        if (cached) {
          return;
        }

        // Iniciar loading
        state.setLoading(workId, true);

        try {
          const response = await fetch(
            `/api/favorites/scores?type=most-favorited&workId=${workId}`,
            {
              method: 'GET',
              cache: 'no-store',
            }
          );

          if (response.ok) {
            const data = await response.json();

            const result: MostFavoritedData = {
              scoreId: data[0]?.scoreId || '',
              scoreSource: data[0]?.scoreSource || 'IMSLP',
              totalFavorites: data[0]?.totalFavorites || 0,
              workId,
              timestamp: Date.now(),
            };

            state.setMostFavorited(workId, result);
          } else {
            console.error(
              'Erro ao buscar partitura mais favoritada:',
              response.statusText
            );
          }
        } catch (error) {
          console.error('Erro ao buscar partitura mais favoritada:', error);
        } finally {
          state.setLoading(workId, false);
        }
      },

      clearExpiredCache: () => {
        const now = Date.now();
        const state = get();

        const validCache = Object.entries(state.mostFavoritedByWork).reduce(
          (acc, [workId, data]) => {
            if (now - data.timestamp <= CACHE_DURATION) {
              acc[workId] = data;
            }
            return acc;
          },
          {} as Record<string, MostFavoritedData>
        );

        set({ mostFavoritedByWork: validCache });
      },

      isScoreMostFavorited: (
        workId: string,
        scoreId: string,
        scoreSource = 'IMSLP'
      ) => {
        const data = get().getMostFavorited(workId);
        if (!data || data.totalFavorites === 0) return false;

        return data.scoreId === scoreId && data.scoreSource === scoreSource;
      },
    }),
    {
      name: 'most-favorited-store',
      // Persist apenas o cache, não os loadings
      partialize: (state) => ({
        mostFavoritedByWork: state.mostFavoritedByWork,
      }),
    }
  )
);

// Hook customizado para usar o store de forma mais simples
export function useMostFavoritedForWork(workId: string) {
  const {
    getMostFavorited,
    isLoading,
    fetchMostFavorited,
    isScoreMostFavorited,
    clearExpiredCache,
  } = useMostFavoritedStore();

  // Limpar cache expirado na inicialização
  React.useEffect(() => {
    clearExpiredCache();
  }, [clearExpiredCache]);

  // Fazer fetch quando workId mudar
  React.useEffect(() => {
    if (workId) {
      fetchMostFavorited(workId);
    }
  }, [workId, fetchMostFavorited]);

  const data = getMostFavorited(workId);
  const loading = isLoading(workId);

  return {
    mostFavoritedScoreId: data?.scoreId || null,
    mostFavoritedSource: data?.scoreSource || 'IMSLP',
    hasFavorites: (data?.totalFavorites || 0) > 0,
    totalFavorites: data?.totalFavorites || 0,
    loading,
    isScoreMostFavorited: (scoreId: string, scoreSource = 'IMSLP') =>
      isScoreMostFavorited(workId, scoreId, scoreSource),
    refetch: () => {
      // Força um novo fetch removendo do cache
      useMostFavoritedStore.setState((state) => {
        const newCache = { ...state.mostFavoritedByWork };
        delete newCache[workId];
        return { mostFavoritedByWork: newCache };
      });
      fetchMostFavorited(workId);
    },
  };
}

// Hook ainda mais simples para verificar se uma partitura específica é a mais favoritada
export function useIsScoreMostFavorited(
  workId: string,
  scoreId: string,
  scoreSource = 'IMSLP'
) {
  const { isScoreMostFavorited, loading } = useMostFavoritedForWork(workId);

  return {
    isMostFavorited: isScoreMostFavorited(scoreId, scoreSource),
    loading,
  };
}
