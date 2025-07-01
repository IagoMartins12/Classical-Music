// stores/useAnnotationsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AnnotationCategory =
  | 'TECHNIQUE'
  | 'INTERPRETATION'
  | 'THEORY'
  | 'PRACTICE_TIP'
  | 'PERFORMANCE'
  | 'HISTORICAL'
  | 'GENERAL';

export type AnnotationDifficulty =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'ALL_LEVELS';

export type AnnotationScope =
  | 'SPECIFIC_MEASURE'
  | 'SECTION'
  | 'MOVEMENT'
  | 'ENTIRE_WORK';

export interface WorkAnnotation {
  id: string;
  userId: string;
  workId: string;
  title: string;
  content: string;
  category: AnnotationCategory;
  scope: AnnotationScope;
  measureStart?: number;
  measureEnd?: number;
  movement?: string;
  section?: string;
  pageNumber?: number;
  hand?: string;
  voice?: string;
  instrument?: string;
  difficulty: AnnotationDifficulty;
  tags: string[];
  isPublic: boolean;
  isVerified: boolean;
  helpfulCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    image?: string;
    userType?: string;
    experienceLevel?: string;
  };
  work?: {
    id: string;
    title: string;
    composer: {
      name: string;
      fullName: string;
    };
  };
  _count: {
    helpfulVotes: number;
    replies: number;
  };
  // Estado local de voto do usuário
  userVote: boolean | null;
}

export interface AnnotationFilters {
  category?: AnnotationCategory;
  difficulty?: AnnotationDifficulty;
  scope?: AnnotationScope;
  userId?: string;
  search?: string;
  sortBy?: 'helpful' | 'recent' | 'oldest';
}

export interface AnnotationPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

interface AnnotationsStore {
  // Estados
  annotations: Map<string, WorkAnnotation[]>; // Map por workId
  loading: {
    fetch: Set<string>; // workIds being fetched
    create: boolean;
    update: Set<string>; // annotationIds being updated
    vote: Set<string>; // annotationIds being voted on
  };
  filters: AnnotationFilters;
  pagination: Map<string, AnnotationPagination>; // Map por workId

  // Actions para buscar anotações
  fetchWorkAnnotations: (
    workId: string,
    filters?: AnnotationFilters,
    page?: number
  ) => Promise<void>;

  // Actions para CRUD
  createAnnotation: (
    data: Partial<WorkAnnotation>
  ) => Promise<WorkAnnotation | null>;
  updateAnnotation: (
    annotationId: string,
    data: Partial<WorkAnnotation>
  ) => Promise<WorkAnnotation | null>;
  deleteAnnotation: (annotationId: string) => Promise<boolean>;

  // Actions para votos
  voteAnnotation: (
    annotationId: string,
    isHelpful: boolean
  ) => Promise<boolean>;

  // Actions para filtros
  setFilters: (filters: AnnotationFilters) => void;
  clearFilters: () => void;

  // Getters
  getWorkAnnotations: (workId: string) => WorkAnnotation[];
  getAnnotationById: (annotationId: string) => WorkAnnotation | undefined;
  getAnnotationsByCategory: (
    workId: string,
    category: AnnotationCategory
  ) => WorkAnnotation[];
  getAnnotationsByUser: (workId: string, userId: string) => WorkAnnotation[];

  // Estatísticas
  getAnnotationStats: (workId: string) => {
    total: number;
    byCategory: Record<AnnotationCategory, number>;
    byDifficulty: Record<AnnotationDifficulty, number>;
    mostHelpful: WorkAnnotation[];
  };

  // Loading states
  setFetchLoading: (workId: string, loading: boolean) => void;
  setCreateLoading: (loading: boolean) => void;
  setUpdateLoading: (annotationId: string, loading: boolean) => void;
  setVoteLoading: (annotationId: string, loading: boolean) => void;

  // Utilities
  addAnnotationToWork: (workId: string, annotation: WorkAnnotation) => void;
  updateAnnotationInWork: (workId: string, annotation: WorkAnnotation) => void;
  removeAnnotationFromWork: (workId: string, annotationId: string) => void;
  updateAnnotationVote: (
    annotationId: string,
    userVote: boolean | null,
    helpfulCount: number
  ) => void;

  // Reset
  reset: () => void;
  clearWorkAnnotations: (workId: string) => void;
}

export const useAnnotationsStore = create<AnnotationsStore>()(
  persist(
    (set, get) => ({
      // Estados iniciais
      annotations: new Map(),
      loading: {
        fetch: new Set(),
        create: false,
        update: new Set(),
        vote: new Set(),
      },
      filters: {},
      pagination: new Map(),

      // Buscar anotações de uma obra
      fetchWorkAnnotations: async (workId: string, filters = {}, page = 1) => {
        const { setFetchLoading } = get();

        setFetchLoading(workId, true);

        try {
          const searchParams = new URLSearchParams({
            workId,
            page: page.toString(),
            limit: '20',
            ...filters,
          });

          const response = await fetch(`/api/annotations?${searchParams}`);

          if (!response.ok) {
            throw new Error('Erro ao buscar anotações');
          }

          const data = await response.json();

          set((state) => {
            const newAnnotations = new Map(state.annotations);
            const newPagination = new Map(state.pagination);

            if (page === 1) {
              // Primeira página - substituir
              newAnnotations.set(workId, data.annotations);
            } else {
              // Páginas adicionais - concatenar
              const existing = newAnnotations.get(workId) || [];
              newAnnotations.set(workId, [...existing, ...data.annotations]);
            }

            newPagination.set(workId, data.pagination);

            return {
              annotations: newAnnotations,
              pagination: newPagination,
              filters: { ...state.filters, ...filters },
            };
          });
        } catch (error) {
          console.error('Erro ao buscar anotações:', error);
        } finally {
          setFetchLoading(workId, false);
        }
      },

      // Criar anotação
      createAnnotation: async (data) => {
        const { setCreateLoading, addAnnotationToWork } = get();

        setCreateLoading(true);

        try {
          const response = await fetch('/api/annotations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error('Erro ao criar anotação');
          }

          const result = await response.json();

          if (result.success && result.annotation) {
            addAnnotationToWork(result.annotation.workId, result.annotation);
            return result.annotation;
          }

          return null;
        } catch (error) {
          console.error('Erro ao criar anotação:', error);
          return null;
        } finally {
          setCreateLoading(false);
        }
      },

      // Atualizar anotação
      updateAnnotation: async (annotationId, data) => {
        const { setUpdateLoading, updateAnnotationInWork } = get();

        setUpdateLoading(annotationId, true);

        try {
          const response = await fetch(`/api/annotations/${annotationId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error('Erro ao atualizar anotação');
          }

          const result = await response.json();

          if (result.success && result.annotation) {
            updateAnnotationInWork(result.annotation.workId, result.annotation);
            return result.annotation;
          }

          return null;
        } catch (error) {
          console.error('Erro ao atualizar anotação:', error);
          return null;
        } finally {
          setUpdateLoading(annotationId, false);
        }
      },

      // Deletar anotação
      deleteAnnotation: async (annotationId) => {
        const { getAnnotationById, removeAnnotationFromWork } = get();

        const annotation = getAnnotationById(annotationId);
        if (!annotation) return false;

        try {
          const response = await fetch(`/api/annotations/${annotationId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Erro ao deletar anotação');
          }

          removeAnnotationFromWork(annotation.workId, annotationId);
          return true;
        } catch (error) {
          console.error('Erro ao deletar anotação:', error);
          return false;
        }
      },

      // Votar em anotação
      voteAnnotation: async (annotationId, isHelpful) => {
        const { setVoteLoading, updateAnnotationVote, getAnnotationById } =
          get();

        const annotation = getAnnotationById(annotationId);
        if (!annotation) return false;

        setVoteLoading(annotationId, true);

        // Optimistic update
        const currentVote = annotation.userVote;
        let newHelpfulCount = annotation.helpfulCount;
        let newUserVote: boolean | null = null;

        if (currentVote === null) {
          // Novo voto
          newUserVote = isHelpful;
          newHelpfulCount += isHelpful ? 1 : -1;
        } else if (currentVote === isHelpful) {
          // Remover voto
          newUserVote = null;
          newHelpfulCount += currentVote ? -1 : 1;
        } else {
          // Trocar voto
          newUserVote = isHelpful;
          newHelpfulCount += isHelpful ? 2 : -2;
        }

        updateAnnotationVote(annotationId, newUserVote, newHelpfulCount);

        try {
          const response = await fetch(
            `/api/annotations/${annotationId}/vote`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isHelpful }),
            }
          );

          if (!response.ok) {
            // Reverter optimistic update
            updateAnnotationVote(
              annotationId,
              currentVote,
              annotation.helpfulCount
            );
            throw new Error('Erro ao votar');
          }

          const result = await response.json();

          if (result.success) {
            updateAnnotationVote(
              annotationId,
              result.userVote,
              result.helpfulCount
            );
            return true;
          }

          return false;
        } catch (error) {
          console.error('Erro ao votar:', error);
          return false;
        } finally {
          setVoteLoading(annotationId, false);
        }
      },

      // Filtros
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      clearFilters: () => {
        set({ filters: {} });
      },

      // Getters
      getWorkAnnotations: (workId) => {
        return get().annotations.get(workId) || [];
      },

      getAnnotationById: (annotationId) => {
        const { annotations } = get();
        for (const workAnnotations of annotations.values()) {
          const annotation = workAnnotations.find((a) => a.id === annotationId);
          if (annotation) return annotation;
        }
        return undefined;
      },

      getAnnotationsByCategory: (workId, category) => {
        const { getWorkAnnotations } = get();
        return getWorkAnnotations(workId).filter(
          (a) => a.category === category
        );
      },

      getAnnotationsByUser: (workId, userId) => {
        const { getWorkAnnotations } = get();
        return getWorkAnnotations(workId).filter((a) => a.userId === userId);
      },

      getAnnotationStats: (workId) => {
        const { getWorkAnnotations } = get();
        const annotations = getWorkAnnotations(workId);

        const byCategory: Record<AnnotationCategory, number> = {
          TECHNIQUE: 0,
          INTERPRETATION: 0,
          THEORY: 0,
          PRACTICE_TIP: 0,
          PERFORMANCE: 0,
          HISTORICAL: 0,
          GENERAL: 0,
        };

        const byDifficulty: Record<AnnotationDifficulty, number> = {
          BEGINNER: 0,
          INTERMEDIATE: 0,
          ADVANCED: 0,
          ALL_LEVELS: 0,
        };

        annotations.forEach((annotation) => {
          byCategory[annotation.category]++;
          byDifficulty[annotation.difficulty]++;
        });

        const mostHelpful = [...annotations]
          .sort((a, b) => b.helpfulCount - a.helpfulCount)
          .slice(0, 5);

        return {
          total: annotations.length,
          byCategory,
          byDifficulty,
          mostHelpful,
        };
      },

      // Loading states
      setFetchLoading: (workId, loading) => {
        set((state) => {
          const newLoading = new Set(state.loading.fetch);
          if (loading) {
            newLoading.add(workId);
          } else {
            newLoading.delete(workId);
          }
          return {
            loading: {
              ...state.loading,
              fetch: newLoading,
            },
          };
        });
      },

      setCreateLoading: (loading) => {
        set((state) => ({
          loading: {
            ...state.loading,
            create: loading,
          },
        }));
      },

      setUpdateLoading: (annotationId, loading) => {
        set((state) => {
          const newLoading = new Set(state.loading.update);
          if (loading) {
            newLoading.add(annotationId);
          } else {
            newLoading.delete(annotationId);
          }
          return {
            loading: {
              ...state.loading,
              update: newLoading,
            },
          };
        });
      },

      setVoteLoading: (annotationId, loading) => {
        set((state) => {
          const newLoading = new Set(state.loading.vote);
          if (loading) {
            newLoading.add(annotationId);
          } else {
            newLoading.delete(annotationId);
          }
          return {
            loading: {
              ...state.loading,
              vote: newLoading,
            },
          };
        });
      },

      // Utilities
      addAnnotationToWork: (workId, annotation) => {
        set((state) => {
          const newAnnotations = new Map(state.annotations);
          const existing = newAnnotations.get(workId) || [];
          newAnnotations.set(workId, [annotation, ...existing]);
          return { annotations: newAnnotations };
        });
      },

      updateAnnotationInWork: (workId, updatedAnnotation) => {
        set((state) => {
          const newAnnotations = new Map(state.annotations);
          const existing = newAnnotations.get(workId) || [];
          const updated = existing.map((a) =>
            a.id === updatedAnnotation.id ? updatedAnnotation : a
          );
          newAnnotations.set(workId, updated);
          return { annotations: newAnnotations };
        });
      },

      removeAnnotationFromWork: (workId, annotationId) => {
        set((state) => {
          const newAnnotations = new Map(state.annotations);
          const existing = newAnnotations.get(workId) || [];
          const filtered = existing.filter((a) => a.id !== annotationId);
          newAnnotations.set(workId, filtered);
          return { annotations: newAnnotations };
        });
      },

      updateAnnotationVote: (annotationId, userVote, helpfulCount) => {
        set((state) => {
          const newAnnotations = new Map();

          for (const [workId, annotations] of state.annotations.entries()) {
            const updated = annotations.map((annotation) =>
              annotation.id === annotationId
                ? { ...annotation, userVote, helpfulCount }
                : annotation
            );
            newAnnotations.set(workId, updated);
          }

          return { annotations: newAnnotations };
        });
      },

      // Reset
      reset: () => {
        set({
          annotations: new Map(),
          loading: {
            fetch: new Set(),
            create: false,
            update: new Set(),
            vote: new Set(),
          },
          filters: {},
          pagination: new Map(),
        });
      },

      clearWorkAnnotations: (workId) => {
        set((state) => {
          const newAnnotations = new Map(state.annotations);
          const newPagination = new Map(state.pagination);
          newAnnotations.delete(workId);
          newPagination.delete(workId);
          return {
            annotations: newAnnotations,
            pagination: newPagination,
          };
        });
      },
    }),
    {
      name: 'annotations-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persistir apenas dados essenciais, não loading states
        annotations: state.annotations,
        filters: state.filters,
        pagination: state.pagination,
      }),
      onRehydrateStorage: () => (state) => {
        // Garantir que loading states sejam sempre Sets/booleans vazios ao recarregar
        if (state) {
          state.loading = {
            fetch: new Set(),
            create: false,
            update: new Set(),
            vote: new Set(),
          };
        }
      },
    }
  )
);
