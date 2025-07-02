// stores/useAnnotationsStore.ts - VERSÃO COM FILTROS AVANÇADOS CORRIGIDOS
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
  userVote: boolean | null;
  isOptimistic?: boolean;
  isUpdating?: boolean;
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
  annotations: Record<string, WorkAnnotation[]>; // workId -> todas as anotações
  filteredAnnotations: Record<string, WorkAnnotation[]>; // workId -> anotações filtradas
  loading: {
    fetch: Set<string>; // workIds being fetched
    create: boolean;
    update: Set<string>; // annotationIds being updated
    vote: Set<string>; // annotationIds being voted on
  };
  filters: AnnotationFilters;
  pagination: Record<string, AnnotationPagination>; // workId -> pagination

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

  // Getters - 🔧 NOVO: Separar anotações totais das filtradas
  getAllWorkAnnotations: (workId: string) => WorkAnnotation[]; // TODAS as anotações
  getWorkAnnotations: (workId: string) => WorkAnnotation[]; // Anotações filtradas (se houver filtros)
  getAnnotationById: (annotationId: string) => WorkAnnotation | undefined;
  getAnnotationsByCategory: (
    workId: string,
    category: AnnotationCategory
  ) => WorkAnnotation[];
  getAnnotationsByUser: (workId: string, userId: string) => WorkAnnotation[];

  // Estatísticas sempre baseadas em TODAS as anotações
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

  // Optimistic updates
  addOptimisticAnnotation: (workId: string, annotation: WorkAnnotation) => void;
  removeOptimisticAnnotation: (workId: string, annotationId: string) => void;
  markAnnotationAsUpdating: (annotationId: string, updating: boolean) => void;

  // Reset
  reset: () => void;
  clearWorkAnnotations: (workId: string) => void;
}

const invalidateNextJSCache = async (userId?: string) => {
  try {
    // Invalidar cache via API route
    await fetch('/api/revalidate-annotations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
  } catch (error) {
    console.error('Erro ao invalidar cache:', error);
  }
};

export const useAnnotationsStore = create<AnnotationsStore>()(
  persist(
    (set, get) => ({
      annotations: {}, // Todas as anotações
      filteredAnnotations: {}, // Anotações filtradas
      loading: {
        fetch: new Set(),
        create: false,
        update: new Set(),
        vote: new Set(),
      },
      filters: {},
      pagination: {},

      // 🔧 CORREÇÃO PRINCIPAL: Manter separação entre anotações totais e filtradas
      fetchWorkAnnotations: async (workId: string, filters = {}, page = 1) => {
        const { setFetchLoading } = get();

        setFetchLoading(workId, true);

        try {
          // 🔧 CORREÇÃO: Construir searchParams com TODOS os filtros
          const searchParams = new URLSearchParams({
            workId,
            page: page.toString(),
            limit: '20',
          });

          // Verificar se há filtros aplicados
          const hasFilters = Object.keys(filters).some(
            (key) =>
              filters[key as keyof typeof filters] !== undefined &&
              filters[key as keyof typeof filters] !== ''
          );

          // 🔧 NOVO: Adicionar todos os filtros disponíveis
          if (filters.category) {
            searchParams.append('category', filters.category);
          }

          if (filters.difficulty) {
            searchParams.append('difficulty', filters.difficulty);
          }

          if (filters.scope) {
            searchParams.append('scope', filters.scope);
          }

          if (filters.userId) {
            searchParams.append('userId', filters.userId);
          }

          if (filters.search) {
            searchParams.append('search', filters.search);
          }

          if (filters.sortBy) {
            searchParams.append('sortBy', filters.sortBy);
          }

          console.log('🔍 Buscando anotações:', {
            workId,
            filters,
            hasFilters,
            searchParams: searchParams.toString(),
          });

          const response = await fetch(`/api/annotations?${searchParams}`);

          if (!response.ok) {
            throw new Error('Erro ao buscar anotações');
          }

          const data = await response.json();

          console.log('🔍 Dados recebidos:', {
            total: data.annotations?.length,
            pagination: data.pagination,
            filters: filters,
          });

          set((state) => {
            const newAnnotations = { ...state.annotations };
            const newFilteredAnnotations = { ...state.filteredAnnotations };
            const newPagination = { ...state.pagination };

            if (page === 1) {
              // Primeira página
              const existing = newAnnotations[workId] || [];
              const optimisticAnnotations = existing.filter(
                (a) => a.isOptimistic
              );

              if (hasFilters) {
                // Com filtros: manter annotations originais, atualizar filteredAnnotations
                if (!newAnnotations[workId]) {
                  // Se não temos as anotações originais ainda, estas são as originais
                  newAnnotations[workId] = [
                    ...optimisticAnnotations,
                    ...data.annotations,
                  ];
                }
                newFilteredAnnotations[workId] = [
                  ...optimisticAnnotations,
                  ...data.annotations,
                ];
              } else {
                // Sem filtros: estas são TODAS as anotações da obra
                newAnnotations[workId] = [
                  ...optimisticAnnotations,
                  ...data.annotations,
                ];
                newFilteredAnnotations[workId] = [
                  ...optimisticAnnotations,
                  ...data.annotations,
                ];
              }
            } else {
              // Páginas adicionais - concatenar nas filtered
              const existingFiltered = newFilteredAnnotations[workId] || [];
              newFilteredAnnotations[workId] = [
                ...existingFiltered,
                ...data.annotations,
              ];

              if (!hasFilters) {
                // Se não há filtros, também atualizar as annotations principais
                const existingAll = newAnnotations[workId] || [];
                newAnnotations[workId] = [...existingAll, ...data.annotations];
              }
            }

            newPagination[workId] = data.pagination;

            return {
              annotations: newAnnotations,
              filteredAnnotations: newFilteredAnnotations,
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

      // Criar anotação com update otimista (mantido igual)
      createAnnotation: async (data) => {
        const {
          setCreateLoading,
          addOptimisticAnnotation,
          removeOptimisticAnnotation,
        } = get();

        if (!data.workId || !data.title || !data.content) {
          throw new Error('Dados incompletos para criar anotação');
        }

        setCreateLoading(true);

        // Criar anotação otimística temporária
        const optimisticId = `optimistic_${Date.now()}_${Math.random()}`;
        const optimisticAnnotation: WorkAnnotation = {
          id: optimisticId,
          userId: data.userId || '',
          workId: data.workId,
          title: data.title,
          content: data.content,
          category: data.category || 'GENERAL',
          scope: data.scope || 'ENTIRE_WORK',
          measureStart: data.measureStart,
          measureEnd: data.measureEnd,
          movement: data.movement,
          section: data.section,
          pageNumber: data.pageNumber,
          hand: data.hand,
          voice: data.voice,
          instrument: data.instrument,
          difficulty: data.difficulty || 'ALL_LEVELS',
          tags: data.tags || [],
          isPublic: data.isPublic !== undefined ? data.isPublic : true,
          isVerified: false,
          helpfulCount: 0,
          viewCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: {
            id: data.userId || '',
            firstName: 'Você',
            lastName: '',
          },
          work: data.work,
          _count: {
            helpfulVotes: 0,
            replies: 0,
          },
          userVote: null,
          isOptimistic: true,
        };

        addOptimisticAnnotation(data.workId, optimisticAnnotation);

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
            removeOptimisticAnnotation(data.workId, optimisticId);

            set((state) => {
              const newAnnotations = { ...state.annotations };
              const newFilteredAnnotations = { ...state.filteredAnnotations };

              const existingAll = newAnnotations[data.workId || 0] || [];
              const existingFiltered =
                newFilteredAnnotations[data.workId || 0] || [];

              newAnnotations[data.workId || 0] = [
                result.annotation,
                ...existingAll,
              ];
              newFilteredAnnotations[data.workId || 0] = [
                result.annotation,
                ...existingFiltered,
              ];

              return {
                annotations: newAnnotations,
                filteredAnnotations: newFilteredAnnotations,
              };
            });

            // 🔧 NOVO: Invalidar cache do Next.js após criação
            await invalidateNextJSCache(data.userId);

            return result.annotation;
          }

          throw new Error('Resposta inválida do servidor');
        } catch (error) {
          console.error('Erro ao criar anotação:', error);
          removeOptimisticAnnotation(data.workId, optimisticId);
          return null;
        } finally {
          setCreateLoading(false);
        }
      },

      // 🔧 CORREÇÃO: Atualizar anotação com invalidação de cache
      updateAnnotation: async (annotationId, data) => {
        const {
          setUpdateLoading,
          getAnnotationById,
          markAnnotationAsUpdating,
        } = get();

        const annotation = getAnnotationById(annotationId);
        if (!annotation) return null;

        setUpdateLoading(annotationId, true);
        markAnnotationAsUpdating(annotationId, true);

        const optimisticUpdate = { ...annotation, ...data, isUpdating: true };

        // Update otimista
        set((state) => {
          const newAnnotations = { ...state.annotations };
          const newFilteredAnnotations = { ...state.filteredAnnotations };

          for (const [workId, annotations] of Object.entries(newAnnotations)) {
            const updated = annotations.map((a) =>
              a.id === annotationId ? optimisticUpdate : a
            );
            newAnnotations[workId] = updated;
          }

          for (const [workId, annotations] of Object.entries(
            newFilteredAnnotations
          )) {
            const updated = annotations.map((a) =>
              a.id === annotationId ? optimisticUpdate : a
            );
            newFilteredAnnotations[workId] = updated;
          }

          return {
            annotations: newAnnotations,
            filteredAnnotations: newFilteredAnnotations,
          };
        });

        try {
          const response = await fetch(`/api/annotations/${annotationId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            // Reverter se deu erro
            set((state) => {
              const newAnnotations = { ...state.annotations };
              const newFilteredAnnotations = { ...state.filteredAnnotations };

              for (const [workId, annotations] of Object.entries(
                newAnnotations
              )) {
                const reverted = annotations.map((a) =>
                  a.id === annotationId
                    ? { ...annotation, isUpdating: false }
                    : a
                );
                newAnnotations[workId] = reverted;
              }

              for (const [workId, annotations] of Object.entries(
                newFilteredAnnotations
              )) {
                const reverted = annotations.map((a) =>
                  a.id === annotationId
                    ? { ...annotation, isUpdating: false }
                    : a
                );
                newFilteredAnnotations[workId] = reverted;
              }

              return {
                annotations: newAnnotations,
                filteredAnnotations: newFilteredAnnotations,
              };
            });

            throw new Error('Erro ao atualizar anotação');
          }

          const result = await response.json();

          if (result.success && result.annotation) {
            set((state) => {
              const newAnnotations = { ...state.annotations };
              const newFilteredAnnotations = { ...state.filteredAnnotations };

              for (const [workId, annotations] of Object.entries(
                newAnnotations
              )) {
                const updated = annotations.map((a) =>
                  a.id === annotationId
                    ? { ...result.annotation, isUpdating: false }
                    : a
                );
                newAnnotations[workId] = updated;
              }

              for (const [workId, annotations] of Object.entries(
                newFilteredAnnotations
              )) {
                const updated = annotations.map((a) =>
                  a.id === annotationId
                    ? { ...result.annotation, isUpdating: false }
                    : a
                );
                newFilteredAnnotations[workId] = updated;
              }

              return {
                annotations: newAnnotations,
                filteredAnnotations: newFilteredAnnotations,
              };
            });

            // 🔧 NOVO: Invalidar cache do Next.js após atualização
            await invalidateNextJSCache(annotation.userId);

            return result.annotation;
          }

          return null;
        } catch (error) {
          console.error('Erro ao atualizar anotação:', error);
          return null;
        } finally {
          setUpdateLoading(annotationId, false);
          markAnnotationAsUpdating(annotationId, false);
        }
      },

      // 🔧 CORREÇÃO: Deletar anotação com invalidação de cache
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

          // 🔧 NOVO: Invalidar cache do Next.js após deleção
          await invalidateNextJSCache(annotation.userId);

          return true;
        } catch (error) {
          console.error('Erro ao deletar anotação:', error);
          return false;
        }
      },

      // Votar em anotação (mantido igual)
      voteAnnotation: async (annotationId, isHelpful) => {
        const { setVoteLoading, updateAnnotationVote, getAnnotationById } =
          get();

        const annotation = getAnnotationById(annotationId);
        if (!annotation) return false;

        setVoteLoading(annotationId, true);

        const currentVote = annotation.userVote;
        let newHelpfulCount = annotation.helpfulCount;
        let newUserVote: boolean | null = null;

        if (currentVote === null) {
          newUserVote = isHelpful;
          if (isHelpful) {
            newHelpfulCount += 1;
          }
        } else if (currentVote === isHelpful) {
          newUserVote = null;
          if (currentVote) {
            newHelpfulCount -= 1;
          }
        } else {
          newUserVote = isHelpful;
          if (currentVote && !isHelpful) {
            newHelpfulCount -= 1;
          } else if (!currentVote && isHelpful) {
            newHelpfulCount += 1;
          }
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

      // 🔧 CORREÇÃO: Melhorar setFilters para resetar paginação quando filtros mudam
      setFilters: (filters) => {
        set((state) => {
          // Se os filtros mudaram, resetar paginação para forçar nova busca
          const filtersChanged =
            JSON.stringify(state.filters) !== JSON.stringify(filters);

          return {
            filters: { ...state.filters, ...filters },
            // Resetar paginação se filtros mudaram
            ...(filtersChanged && {
              pagination: Object.keys(state.pagination).reduce(
                (acc, workId) => ({
                  ...acc,
                  [workId]: {
                    ...state.pagination[workId],
                    page: 1,
                    hasMore: true,
                  },
                }),
                {}
              ),
            }),
          };
        });
      },

      clearFilters: () => {
        set((state) => ({
          filters: {},
          // Resetar paginação ao limpar filtros
          pagination: Object.keys(state.pagination).reduce(
            (acc, workId) => ({
              ...acc,
              [workId]: {
                ...state.pagination[workId],
                page: 1,
                hasMore: true,
              },
            }),
            {}
          ),
        }));
      },

      // 🔧 NOVO: Getters separados para anotações totais e filtradas
      getAllWorkAnnotations: (workId) => {
        // Sempre retorna TODAS as anotações da obra (para estatísticas)
        return get().annotations[workId] || [];
      },

      getWorkAnnotations: (workId) => {
        // Retorna anotações filtradas se houver filtros, senão todas
        const { filteredAnnotations, annotations, filters } = get();
        const hasFilters = Object.keys(filters).some(
          (key) =>
            filters[key as keyof typeof filters] !== undefined &&
            filters[key as keyof typeof filters] !== ''
        );

        if (hasFilters && filteredAnnotations[workId]) {
          return filteredAnnotations[workId];
        }

        return annotations[workId] || [];
      },

      getAnnotationById: (annotationId) => {
        const { annotations, filteredAnnotations } = get();

        // Buscar primeiro nas anotações principais
        for (const workAnnotations of Object.values(annotations)) {
          const annotation = workAnnotations.find((a) => a.id === annotationId);
          if (annotation) return annotation;
        }

        // Se não encontrou, buscar nas filtradas
        for (const workAnnotations of Object.values(filteredAnnotations)) {
          const annotation = workAnnotations.find((a) => a.id === annotationId);
          if (annotation) return annotation;
        }

        return undefined;
      },

      getAnnotationsByCategory: (workId, category) => {
        const { getAllWorkAnnotations } = get();
        return getAllWorkAnnotations(workId).filter(
          (a) => a.category === category
        );
      },

      getAnnotationsByUser: (workId, userId) => {
        const { getAllWorkAnnotations } = get();
        return getAllWorkAnnotations(workId).filter((a) => a.userId === userId);
      },

      // 🔧 CORREÇÃO: Estatísticas sempre baseadas em TODAS as anotações da obra (independente de filtros)
      getAnnotationStats: (workId) => {
        const { getAllWorkAnnotations } = get();

        // 🔧 IMPORTANTE: Sempre calcular sobre TODAS as anotações da obra, independente dos filtros aplicados
        // Isso garante que as estatísticas sejam consistentes e que o botão "Todas" sempre mostre o total correto
        const allAnnotations = getAllWorkAnnotations(workId);

        // Separar otimísticas das reais para o total
        const realAnnotations = allAnnotations.filter((a) => !a.isOptimistic);


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

        // 🔧 CORREÇÃO: Contar todas as anotações (reais + otimísticas) para estatísticas
        allAnnotations.forEach((annotation) => {
          byCategory[annotation.category]++;
          byDifficulty[annotation.difficulty]++;
        });

        // Para "mais úteis", usar apenas as reais (otimísticas ainda não têm votos)
        const mostHelpful = [...realAnnotations]
          .sort((a, b) => b.helpfulCount - a.helpfulCount)
          .slice(0, 5);

        return {
          total: allAnnotations.length, // Total inclui otimísticas
          byCategory,
          byDifficulty,
          mostHelpful,
        };
      },

      // Loading states (mantidos iguais)
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

      // Utilities - 🔧 ATUALIZADO: Trabalhar com ambas as estruturas
      addAnnotationToWork: (workId, annotation) => {
        set((state) => {
          const newAnnotations = { ...state.annotations };
          const newFilteredAnnotations = { ...state.filteredAnnotations };

          const existingAll = newAnnotations[workId] || [];
          const existingFiltered = newFilteredAnnotations[workId] || [];

          newAnnotations[workId] = [annotation, ...existingAll];
          newFilteredAnnotations[workId] = [annotation, ...existingFiltered];

          return {
            annotations: newAnnotations,
            filteredAnnotations: newFilteredAnnotations,
          };
        });
      },

      updateAnnotationInWork: (workId, updatedAnnotation) => {
        set((state) => {
          const newAnnotations = { ...state.annotations };
          const newFilteredAnnotations = { ...state.filteredAnnotations };

          const existingAll = newAnnotations[workId] || [];
          const existingFiltered = newFilteredAnnotations[workId] || [];

          const updatedAll = existingAll.map((a) =>
            a.id === updatedAnnotation.id ? updatedAnnotation : a
          );
          const updatedFiltered = existingFiltered.map((a) =>
            a.id === updatedAnnotation.id ? updatedAnnotation : a
          );

          newAnnotations[workId] = updatedAll;
          newFilteredAnnotations[workId] = updatedFiltered;

          return {
            annotations: newAnnotations,
            filteredAnnotations: newFilteredAnnotations,
          };
        });
      },

      removeAnnotationFromWork: (workId, annotationId) => {
        set((state) => {
          const newAnnotations = { ...state.annotations };
          const newFilteredAnnotations = { ...state.filteredAnnotations };

          const existingAll = newAnnotations[workId] || [];
          const existingFiltered = newFilteredAnnotations[workId] || [];

          const filteredAll = existingAll.filter((a) => a.id !== annotationId);
          const filteredFiltered = existingFiltered.filter(
            (a) => a.id !== annotationId
          );

          newAnnotations[workId] = filteredAll;
          newFilteredAnnotations[workId] = filteredFiltered;

          return {
            annotations: newAnnotations,
            filteredAnnotations: newFilteredAnnotations,
          };
        });
      },

      updateAnnotationVote: (annotationId, userVote, helpfulCount) => {
        set((state) => {
          const newAnnotations = { ...state.annotations };
          const newFilteredAnnotations = { ...state.filteredAnnotations };

          // Atualizar em ambas as estruturas
          for (const [workId, annotations] of Object.entries(newAnnotations)) {
            const updated = annotations.map((annotation) =>
              annotation.id === annotationId
                ? { ...annotation, userVote, helpfulCount }
                : annotation
            );
            newAnnotations[workId] = updated;
          }

          for (const [workId, annotations] of Object.entries(
            newFilteredAnnotations
          )) {
            const updated = annotations.map((annotation) =>
              annotation.id === annotationId
                ? { ...annotation, userVote, helpfulCount }
                : annotation
            );
            newFilteredAnnotations[workId] = updated;
          }

          return {
            annotations: newAnnotations,
            filteredAnnotations: newFilteredAnnotations,
          };
        });
      },

      // Métodos para updates otimistas - 🔧 ATUALIZADO
      addOptimisticAnnotation: (workId, annotation) => {
        set((state) => {
          const newAnnotations = { ...state.annotations };
          const newFilteredAnnotations = { ...state.filteredAnnotations };

          const existingAll = newAnnotations[workId] || [];
          const existingFiltered = newFilteredAnnotations[workId] || [];

          newAnnotations[workId] = [annotation, ...existingAll];
          newFilteredAnnotations[workId] = [annotation, ...existingFiltered];

          return {
            annotations: newAnnotations,
            filteredAnnotations: newFilteredAnnotations,
          };
        });
      },

      removeOptimisticAnnotation: (workId, annotationId) => {
        set((state) => {
          const newAnnotations = { ...state.annotations };
          const newFilteredAnnotations = { ...state.filteredAnnotations };

          const existingAll = newAnnotations[workId] || [];
          const existingFiltered = newFilteredAnnotations[workId] || [];

          const filteredAll = existingAll.filter((a) => a.id !== annotationId);
          const filteredFiltered = existingFiltered.filter(
            (a) => a.id !== annotationId
          );

          newAnnotations[workId] = filteredAll;
          newFilteredAnnotations[workId] = filteredFiltered;

          return {
            annotations: newAnnotations,
            filteredAnnotations: newFilteredAnnotations,
          };
        });
      },

      markAnnotationAsUpdating: (annotationId, updating) => {
        set((state) => {
          const newAnnotations = { ...state.annotations };
          const newFilteredAnnotations = { ...state.filteredAnnotations };

          // Atualizar em ambas as estruturas
          for (const [workId, annotations] of Object.entries(newAnnotations)) {
            const updated = annotations.map((annotation) =>
              annotation.id === annotationId
                ? { ...annotation, isUpdating: updating }
                : annotation
            );
            newAnnotations[workId] = updated;
          }

          for (const [workId, annotations] of Object.entries(
            newFilteredAnnotations
          )) {
            const updated = annotations.map((annotation) =>
              annotation.id === annotationId
                ? { ...annotation, isUpdating: updating }
                : annotation
            );
            newFilteredAnnotations[workId] = updated;
          }

          return {
            annotations: newAnnotations,
            filteredAnnotations: newFilteredAnnotations,
          };
        });
      },

      // Reset - 🔧 ATUALIZADO
      reset: () => {
        set({
          annotations: {},
          filteredAnnotations: {},
          loading: {
            fetch: new Set(),
            create: false,
            update: new Set(),
            vote: new Set(),
          },
          filters: {},
          pagination: {},
        });
      },

      clearWorkAnnotations: (workId) => {
        set((state) => {
          const newAnnotations = { ...state.annotations };
          const newFilteredAnnotations = { ...state.filteredAnnotations };
          const newPagination = { ...state.pagination };

          delete newAnnotations[workId];
          delete newFilteredAnnotations[workId];
          delete newPagination[workId];

          return {
            annotations: newAnnotations,
            filteredAnnotations: newFilteredAnnotations,
            pagination: newPagination,
          };
        });
      },
    }),
    {
      name: 'annotations-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        annotations: state.annotations,
        filteredAnnotations: state.filteredAnnotations,
        filters: state.filters,
        pagination: state.pagination,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.loading = {
            fetch: new Set(),
            create: false,
            update: new Set(),
            vote: new Set(),
          };

          if (!state.annotations || typeof state.annotations !== 'object') {
            state.annotations = {};
          }
          if (
            !state.filteredAnnotations ||
            typeof state.filteredAnnotations !== 'object'
          ) {
            state.filteredAnnotations = {};
          }
          if (!state.pagination || typeof state.pagination !== 'object') {
            state.pagination = {};
          }
        }
      },
    }
  )
);
