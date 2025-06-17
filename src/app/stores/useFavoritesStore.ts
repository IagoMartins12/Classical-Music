// stores/useFavoritesStore.ts
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

interface FavoritesStore {
  // Estados
  favoriteComposers: FavoriteComposer[];
  favoriteWorks: FavoriteWork[];
  loading: {
    composers: Set<string>;
    works: Set<string>;
  };
  initialized: boolean;

  // Actions para compositores
  toggleComposerFavorite: (
    composerId: string,
    userId: string
  ) => Promise<boolean>;
  isComposerFavorited: (composerId: string) => boolean;
  addComposerFavorite: (favorite: FavoriteComposer) => void;
  removeComposerFavorite: (composerId: string) => void;
  setComposerLoading: (composerId: string, loading: boolean) => void;

  // Actions para obras
  toggleWorkFavorite: (workId: string, userId: string) => Promise<boolean>;
  isWorkFavorited: (workId: string) => boolean;
  addWorkFavorite: (favorite: FavoriteWork) => void;
  removeWorkFavorite: (workId: string) => void;
  setWorkLoading: (workId: string, loading: boolean) => void;

  // Actions gerais
  initializeFavorites: (
    composers: FavoriteComposer[],
    works: FavoriteWork[]
  ) => void;
  reset: () => void;

  // Getters
  getFavoriteComposersCount: () => number;
  getFavoriteWorksCount: () => number;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      // Estados iniciais
      favoriteComposers: [],
      favoriteWorks: [],
      loading: {
        composers: new Set(),
        works: new Set(),
      },
      initialized: false,

      // Actions para compositores
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

      // Actions para obras
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

      // Actions gerais
      initializeFavorites: (
        composers: FavoriteComposer[],
        works: FavoriteWork[]
      ) => {
        set({
          favoriteComposers: composers,
          favoriteWorks: works,
          initialized: true,
        });
      },

      reset: () => {
        set({
          favoriteComposers: [],
          favoriteWorks: [],
          loading: {
            composers: new Set(),
            works: new Set(),
          },
          initialized: false,
        });
      },

      // Getters
      getFavoriteComposersCount: () => get().favoriteComposers.length,
      getFavoriteWorksCount: () => get().favoriteWorks.length,
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favoriteComposers: state.favoriteComposers,
        favoriteWorks: state.favoriteWorks,
        initialized: state.initialized,
        // Não persistir loading states (eles devem sempre começar vazios)
      }),
      onRehydrateStorage: () => (state) => {
        // Garantir que loading states sejam sempre Sets vazios ao recarregar
        if (state) {
          state.loading = {
            composers: new Set(),
            works: new Set(),
          };
        }
      },
    }
  )
);
