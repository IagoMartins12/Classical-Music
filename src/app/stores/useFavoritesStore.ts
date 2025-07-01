// stores/useFavoritesStore.ts - VERSÃO CORRIGIDA
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface FavoriteComposer {
  id: string;
  userId: string;
  composerId: string;
  composer?: {
    id: string;
    name: string;
    fullName: string;
    portraitUrl?: string;
    epochName?: string;
  };
}

export interface FavoriteWork {
  id: string;
  userId: string;
  workId: string;
  work?: {
    id: string;
    title: string;
    opOrCatalog?: string;
    composer: {
      name: string;
      fullName: string;
    };
  };
}

export interface FavoriteScore {
  id: string;
  userId: string;
  workId: string;
  scoreId: string;
  scoreSource: 'IMSLP' | 'CUSTOM' | 'UPLOAD';
  scoreTitle: string;
  scoreType: string;
  personalRating?: number;
  notes?: string;
  tags: string[];
  addedAt: string;
  work?: {
    id: string;
    title: string;
    composer: {
      name: string;
      fullName: string;
    };
  };
}

export interface ScoreFavoriteStats {
  workId: string;
  scoreId: string;
  scoreSource: string;
  totalFavorites: number;
  avgRating?: number;
  scoreTitle: string;
  scoreType: string;
  downloadUrl?: string;
}

interface FavoritesStore {
  // Estados existentes
  favoriteComposers: FavoriteComposer[];
  favoriteWorks: FavoriteWork[];
  favoriteScores: FavoriteScore[];
  scoreStats: Record<string, ScoreFavoriteStats>;

  loading: {
    composers: Set<string>;
    works: Set<string>;
    scores: Set<string>;
  };
  initialized: boolean;

  // Actions existentes para compositores
  toggleComposerFavorite: (
    composerId: string,
    userId: string
  ) => Promise<boolean>;
  isComposerFavorited: (composerId: string) => boolean;
  addComposerFavorite: (favorite: FavoriteComposer) => void;
  removeComposerFavorite: (composerId: string) => void;
  setComposerLoading: (composerId: string, loading: boolean) => void;

  // Actions existentes para obras
  toggleWorkFavorite: (workId: string, userId: string) => Promise<boolean>;
  isWorkFavorited: (workId: string) => boolean;
  addWorkFavorite: (favorite: FavoriteWork) => void;
  removeWorkFavorite: (workId: string) => void;
  setWorkLoading: (workId: string, loading: boolean) => void;

  // Actions para partituras
  toggleScoreFavorite: (
    workId: string,
    scoreId: string,
    scoreSource: string,
    userId: string,
    scoreData: any
  ) => Promise<boolean>;
  updateScoreFavorite: (
    workId: string,
    scoreId: string,
    scoreSource: string,
    updates: {
      personalRating?: number;
      notes?: string;
      tags?: string[];
    }
  ) => Promise<boolean>;
  isScoreFavorited: (
    workId: string,
    scoreId: string,
    scoreSource?: string
  ) => boolean;
  getScoreFavorite: (
    workId: string,
    scoreId: string,
    scoreSource?: string
  ) => FavoriteScore | null;
  addScoreFavorite: (favorite: FavoriteScore) => void;
  removeScoreFavorite: (
    workId: string,
    scoreId: string,
    scoreSource?: string
  ) => void;
  setScoreLoading: (scoreKey: string, loading: boolean) => void;

  // Actions para estatísticas
  setScoreStats: (workId: string, stats: ScoreFavoriteStats[]) => void;
  getWorkScoreStats: (workId: string) => ScoreFavoriteStats[];
  getMostFavoritedScore: (workId: string) => ScoreFavoriteStats | null;

  // Actions gerais
  initializeFavorites: (
    composers: FavoriteComposer[],
    works: FavoriteWork[],
    scores?: FavoriteScore[]
  ) => void;
  reset: () => void;

  // Getters atualizados
  getFavoriteComposersCount: () => number;
  getFavoriteWorksCount: () => number;
  getFavoriteScoresCount: () => number;
  getTotalFavoritesCount: () => number;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      // Estados iniciais
      favoriteComposers: [],
      favoriteWorks: [],
      favoriteScores: [],
      scoreStats: {},
      loading: {
        composers: new Set(),
        works: new Set(),
        scores: new Set(),
      },
      initialized: false,

      // Actions para compositores (mantidas iguais)
      toggleComposerFavorite: async (composerId: string, userId: string) => {
        const {
          isComposerFavorited,
          setComposerLoading,
          addComposerFavorite,
          removeComposerFavorite,
        } = get();

        if (get().loading.composers.has(composerId)) {
          return isComposerFavorited(composerId);
        }

        setComposerLoading(composerId, true);

        try {
          const isFavorited = isComposerFavorited(composerId);

          // Otimistic update
          if (isFavorited) {
            removeComposerFavorite(composerId);
          } else {
            addComposerFavorite({
              id: `temp-${Date.now()}`,
              userId,
              composerId,
            });
          }

          const response = await fetch('/api/favorites/composers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              composerId,
              action: isFavorited ? 'remove' : 'add',
            }),
          });

          if (!response.ok) {
            // Reverter otimistic update em caso de erro
            if (isFavorited) {
              addComposerFavorite({
                id: `temp-${Date.now()}`,
                userId,
                composerId,
              });
            } else {
              removeComposerFavorite(composerId);
            }
            throw new Error('Erro ao favoritar compositor');
          }

          const result = await response.json();

          // Atualizar com dados corretos do servidor
          if (result.success) {
            if (result.action === 'added' && result.favorite) {
              removeComposerFavorite(composerId); // Remove temporário
              addComposerFavorite(result.favorite);
            }
          }

          return !isFavorited;
        } catch (error) {
          console.error('Erro ao favoritar compositor:', error);
          return isComposerFavorited(composerId);
        } finally {
          setComposerLoading(composerId, false);
        }
      },

      isComposerFavorited: (composerId: string) => {
        return get().favoriteComposers.some(
          (fav) => fav.composerId === composerId
        );
      },

      addComposerFavorite: (favorite: FavoriteComposer) => {
        set((state) => ({
          favoriteComposers: [
            ...state.favoriteComposers.filter(
              (f) => f.composerId !== favorite.composerId
            ),
            favorite,
          ],
        }));
      },

      removeComposerFavorite: (composerId: string) => {
        set((state) => ({
          favoriteComposers: state.favoriteComposers.filter(
            (f) => f.composerId !== composerId
          ),
        }));
      },

      setComposerLoading: (composerId: string, loading: boolean) => {
        set((state) => {
          const newLoading = new Set(state.loading.composers);
          if (loading) {
            newLoading.add(composerId);
          } else {
            newLoading.delete(composerId);
          }
          return {
            loading: {
              ...state.loading,
              composers: newLoading,
            },
          };
        });
      },

      // Actions para obras (mantidas iguais)
      toggleWorkFavorite: async (workId: string, userId: string) => {
        const {
          isWorkFavorited,
          setWorkLoading,
          addWorkFavorite,
          removeWorkFavorite,
        } = get();

        if (get().loading.works.has(workId)) {
          return isWorkFavorited(workId);
        }

        setWorkLoading(workId, true);

        try {
          const isFavorited = isWorkFavorited(workId);

          // Otimistic update
          if (isFavorited) {
            removeWorkFavorite(workId);
          } else {
            addWorkFavorite({
              id: `temp-${Date.now()}`,
              userId,
              workId,
            });
          }

          const response = await fetch('/api/favorites/works', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workId,
              action: isFavorited ? 'remove' : 'add',
            }),
          });

          if (!response.ok) {
            // Reverter otimistic update em caso de erro
            if (isFavorited) {
              addWorkFavorite({
                id: `temp-${Date.now()}`,
                userId,
                workId,
              });
            } else {
              removeWorkFavorite(workId);
            }
            throw new Error('Erro ao favoritar obra');
          }

          const result = await response.json();

          // Atualizar com dados corretos do servidor
          if (result.success) {
            if (result.action === 'added' && result.favorite) {
              removeWorkFavorite(workId); // Remove temporário
              addWorkFavorite(result.favorite);
            }
          }

          return !isFavorited;
        } catch (error) {
          console.error('Erro ao favoritar obra:', error);
          return isWorkFavorited(workId);
        } finally {
          setWorkLoading(workId, false);
        }
      },

      isWorkFavorited: (workId: string) => {
        return get().favoriteWorks.some((fav) => fav.workId === workId);
      },

      addWorkFavorite: (favorite: FavoriteWork) => {
        set((state) => ({
          favoriteWorks: [
            ...state.favoriteWorks.filter((f) => f.workId !== favorite.workId),
            favorite,
          ],
        }));
      },

      removeWorkFavorite: (workId: string) => {
        set((state) => ({
          favoriteWorks: state.favoriteWorks.filter((f) => f.workId !== workId),
        }));
      },

      setWorkLoading: (workId: string, loading: boolean) => {
        set((state) => {
          const newLoading = new Set(state.loading.works);
          if (loading) {
            newLoading.add(workId);
          } else {
            newLoading.delete(workId);
          }
          return {
            loading: {
              ...state.loading,
              works: newLoading,
            },
          };
        });
      },

      // 🆕 Actions para partituras (CORRIGIDAS)
      toggleScoreFavorite: async (
        workId: string,
        scoreId: string,
        scoreSource: string,
        userId: string,
        scoreData: any
      ) => {
        const {
          isScoreFavorited,
          setScoreLoading,
          addScoreFavorite,
          removeScoreFavorite,
        } = get();

        const scoreKey = `${workId}-${scoreId}-${scoreSource}`;

        if (get().loading.scores.has(scoreKey)) {
          return isScoreFavorited(workId, scoreId, scoreSource);
        }

        setScoreLoading(scoreKey, true);

        try {
          const isFavorited = isScoreFavorited(workId, scoreId, scoreSource);

          // Otimistic update
          if (isFavorited) {
            removeScoreFavorite(workId, scoreId, scoreSource);
          } else {
            addScoreFavorite({
              id: `temp-${Date.now()}`,
              userId,
              workId,
              scoreId,
              scoreSource: scoreSource as any,
              scoreTitle: scoreData.title,
              scoreType: scoreData.type || 'SCORES',
              tags: [],
              addedAt: new Date().toISOString(),
            });
          }

          const response = await fetch('/api/favorites/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workId,
              scoreId,
              scoreSource,
              action: isFavorited ? 'remove' : 'add',
              scoreData,
            }),
          });

          if (!response.ok) {
            // Reverter otimistic update em caso de erro
            if (isFavorited) {
              addScoreFavorite({
                id: `temp-${Date.now()}`,
                userId,
                workId,
                scoreId,
                scoreSource: scoreSource as any,
                scoreTitle: scoreData.title,
                scoreType: scoreData.type || 'SCORES',
                tags: [],
                addedAt: new Date().toISOString(),
              });
            } else {
              removeScoreFavorite(workId, scoreId, scoreSource);
            }

            // 🆕 Log do erro mais detalhado
            const errorText = await response.text();
            console.error('Response error:', response.status, errorText);
            throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
          }

          const result = await response.json();

          // Atualizar com dados corretos do servidor
          if (result.success) {
            if (result.action === 'added' && result.favorite) {
              removeScoreFavorite(workId, scoreId, scoreSource); // Remove temporário
              addScoreFavorite(result.favorite);
            }
          }

          return !isFavorited;
        } catch (error) {
          console.error('Erro ao favoritar partitura:', error);
          return isScoreFavorited(workId, scoreId, scoreSource);
        } finally {
          setScoreLoading(scoreKey, false);
        }
      },

      updateScoreFavorite: async (
        workId: string,
        scoreId: string,
        scoreSource: string,
        updates: {
          personalRating?: number;
          notes?: string;
          tags?: string[];
        }
      ) => {
        try {
          const response = await fetch('/api/favorites/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workId,
              scoreId,
              scoreSource,
              action: 'update',
              ...updates,
            }),
          });

          if (!response.ok) {
            throw new Error('Erro ao atualizar favorito');
          }

          // Atualizar estado local
          set((state) => ({
            favoriteScores: state.favoriteScores.map((fav) =>
              fav.workId === workId &&
              fav.scoreId === scoreId &&
              fav.scoreSource === scoreSource
                ? { ...fav, ...updates }
                : fav
            ),
          }));

          return true;
        } catch (error) {
          console.error('Erro ao atualizar favorito de partitura:', error);
          return false;
        }
      },

      isScoreFavorited: (
        workId: string,
        scoreId: string,
        scoreSource = 'IMSLP'
      ) => {
        return get().favoriteScores.some(
          (fav) =>
            fav.workId === workId &&
            fav.scoreId === scoreId &&
            fav.scoreSource === scoreSource
        );
      },

      getScoreFavorite: (
        workId: string,
        scoreId: string,
        scoreSource = 'IMSLP'
      ) => {
        return (
          get().favoriteScores.find(
            (fav) =>
              fav.workId === workId &&
              fav.scoreId === scoreId &&
              fav.scoreSource === scoreSource
          ) || null
        );
      },

      addScoreFavorite: (favorite: FavoriteScore) => {
        set((state) => ({
          favoriteScores: [
            ...state.favoriteScores.filter(
              (f) =>
                !(
                  f.workId === favorite.workId &&
                  f.scoreId === favorite.scoreId &&
                  f.scoreSource === favorite.scoreSource
                )
            ),
            favorite,
          ],
        }));
      },

      removeScoreFavorite: (
        workId: string,
        scoreId: string,
        scoreSource = 'IMSLP'
      ) => {
        set((state) => ({
          favoriteScores: state.favoriteScores.filter(
            (f) =>
              !(
                f.workId === workId &&
                f.scoreId === scoreId &&
                f.scoreSource === scoreSource
              )
          ),
        }));
      },

      setScoreLoading: (scoreKey: string, loading: boolean) => {
        set((state) => {
          const newLoading = new Set(state.loading.scores);
          if (loading) {
            newLoading.add(scoreKey);
          } else {
            newLoading.delete(scoreKey);
          }
          return {
            loading: {
              ...state.loading,
              scores: newLoading,
            },
          };
        });
      },

      // Actions para estatísticas
      setScoreStats: (workId: string, stats: ScoreFavoriteStats[]) => {
        set((state) => {
          const newStats = { ...state.scoreStats };

          // Limpar stats antigas desta obra
          Object.keys(newStats).forEach((key) => {
            if (key.startsWith(`${workId}-`)) {
              delete newStats[key];
            }
          });

          // Adicionar novas stats
          stats.forEach((stat) => {
            const key = `${stat.workId}-${stat.scoreId}-${stat.scoreSource}`;
            newStats[key] = stat;
          });

          return { scoreStats: newStats };
        });
      },

      getWorkScoreStats: (workId: string) => {
        const stats = get().scoreStats;
        return Object.values(stats).filter((stat) => stat.workId === workId);
      },

      getMostFavoritedScore: (workId: string) => {
        const stats = get().getWorkScoreStats(workId);
        return (
          stats.sort((a, b) => b.totalFavorites - a.totalFavorites)[0] || null
        );
      },

      // Actions gerais atualizadas
      initializeFavorites: (
        composers: FavoriteComposer[],
        works: FavoriteWork[],
        scores: FavoriteScore[] = []
      ) => {
        set({
          favoriteComposers: composers,
          favoriteWorks: works,
          favoriteScores: scores,
          initialized: true,
        });
      },

      reset: () => {
        set({
          favoriteComposers: [],
          favoriteWorks: [],
          favoriteScores: [],
          scoreStats: {},
          loading: {
            composers: new Set(),
            works: new Set(),
            scores: new Set(),
          },
          initialized: false,
        });
      },

      // Getters atualizados
      getFavoriteComposersCount: () => get().favoriteComposers.length,
      getFavoriteWorksCount: () => get().favoriteWorks.length,
      getFavoriteScoresCount: () => get().favoriteScores.length,
      getTotalFavoritesCount: () =>
        get().favoriteComposers.length +
        get().favoriteWorks.length +
        get().favoriteScores.length,
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favoriteComposers: state.favoriteComposers,
        favoriteWorks: state.favoriteWorks,
        favoriteScores: state.favoriteScores,
        scoreStats: state.scoreStats,
        initialized: state.initialized,
        // Não persistir loading states (eles devem sempre começar vazios)
      }),
      onRehydrateStorage: () => (state) => {
        // Garantir que loading states sejam sempre Sets vazios ao recarregar
        if (state) {
          state.loading = {
            composers: new Set(),
            works: new Set(),
            scores: new Set(),
          };
        }
      },
    }
  )
);
