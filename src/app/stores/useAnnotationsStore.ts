// stores/useAnnotationsStore.ts - VERSÃO COM MÉTODOS DE USUÁRIO
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
    opOrCatalog?: string;
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
  userAnnotations: Record<string, WorkAnnotation[]>; // 🔧 NOVO: userId -> anotações do usuário
  loading: {
    fetch: Set<string>; // workIds/userIds being fetched
    create: boolean;
    update: Set<string>; // annotationIds being updated
    vote: Set<string>; // annotationIds being voted on
    delete: Set<string>; // 🔧 NOVO: annotationIds being deleted
  };
  filters: AnnotationFilters;
  pagination: Record<string, AnnotationPagination>; // workId -> pagination

  // Actions para buscar anotações
  fetchWorkAnnotations: (
    workId: string,
    filters?: AnnotationFilters,
    page?: number
  ) => Promise<void>;

  // 🔧 NOVO: Actions para anotações do usuário
  fetchUserAnnotations: (
    userId: string,
    filters?: AnnotationFilters,
    page?: number
  ) => Promise<void>;
  getUserAnnotations: (userId: string) => WorkAnnotation[];

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
  getAllWorkAnnotations: (workId: string) => WorkAnnotation[];
  getWorkAnnotations: (workId: string) => WorkAnnotation[];
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
  setFetchLoading: (key: string, loading: boolean) => void;
  setCreateLoading: (loading: boolean) => void;
  setUpdateLoading: (annotationId: string, loading: boolean) => void;
  setVoteLoading: (annotationId: string, loading: boolean) => void;
  setDeleteLoading: (annotationId: string, loading: boolean) => void; // 🔧 NOVO

  // Utilities
  addAnnotationToWork: (workId: string, annotation: WorkAnnotation) => void;
  updateAnnotationInWork: (workId: string, annotation: WorkAnnotation) => void;
  removeAnnotationFromWork: (workId: string, annotationId: string) => void;
  updateAnnotationVote: (
    annotationId: string,
    userVote: boolean | null,
    helpfulCount: number
  ) => void;

  // 🔧 NOVO: Utilities para anotações do usuário
  addUserAnnotation: (userId: string, annotation: WorkAnnotation) => void;
  updateUserAnnotation: (userId: string, annotation: WorkAnnotation) => void;
  removeUserAnnotation: (userId: string, annotationId: string) => void;

  // Optimistic updates
  addOptimisticAnnotation: (workId: string, annotation: WorkAnnotation) => void;
  removeOptimisticAnnotation: (workId: string, annotationId: string) => void;
  markAnnotationAsUpdating: (annotationId: string, updating: boolean) => void;

  // Reset
  reset: () => void;
  clearWorkAnnotations: (workId: string) => void;

  // Eventos customizados
  dispatchAnnotationEvent: (
    type: 'created' | 'updated' | 'deleted',
    annotation?: WorkAnnotation
  ) => void;
}

// Funções para invalidar cache e disparar eventos
const invalidateNextJSCache = async (userId?: string) => {
  // try {
  //   await fetch('/api/revalidate-annotations', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ userId }),
  //   });
  // } catch (error) {
  //   console.error('Erro ao invalidar cache:', error);
  // }
};

const dispatchCustomEvent = (
  type: 'created' | 'updated' | 'deleted',
  annotation?: WorkAnnotation
) => {
  if (typeof window === 'undefined') return;

  const eventName = `annotation${type.charAt(0).toUpperCase() + type.slice(1)}`;
  const event = new CustomEvent(eventName, {
    detail: annotation
      ? {
          id: annotation.id,
          workId: annotation.workId,
          userId: annotation.userId,
          title: annotation.title,
        }
      : {},
  });

  console.log('🔥 Disparando evento:', eventName, event.detail);
  window.dispatchEvent(event);
};

export const useAnnotationsStore = create<AnnotationsStore>()(
  persist(
    (set, get) => ({
      annotations: {},
      filteredAnnotations: {},
      userAnnotations: {}, // 🔧 NOVO: Cache de anotações por usuário
      loading: {
        fetch: new Set(),
        create: false,
        update: new Set(),
        vote: new Set(),
        delete: new Set(), // 🔧 NOVO
      },
      filters: {},
      pagination: {},

      fetchWorkAnnotations: async (workId: string, filters = {}, page = 1) => {
        const { setFetchLoading } = get();

        setFetchLoading(workId, true);

        try {
          const searchParams = new URLSearchParams({
            workId,
            page: page.toString(),
            limit: '20',
          });

          const hasFilters = Object.keys(filters).some(
            (key) =>
              filters[key as keyof typeof filters] !== undefined &&
              filters[key as keyof typeof filters] !== ''
          );

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

          const response = await fetch(`/api/annotations?${searchParams}`);

          if (!response.ok) {
            throw new Error('Erro ao buscar anotações');
          }

          const data = await response.json();

          set((state) => {
            const newAnnotations = { ...state.annotations };
            const newFilteredAnnotations = { ...state.filteredAnnotations };
            const newPagination = { ...state.pagination };

            if (page === 1) {
              const existing = newAnnotations[workId] || [];
              const optimisticAnnotations = existing.filter(
                (a) => a.isOptimistic
              );

              if (hasFilters) {
                if (!newAnnotations[workId]) {
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
              const existingFiltered = newFilteredAnnotations[workId] || [];
              newFilteredAnnotations[workId] = [
                ...existingFiltered,
                ...data.annotations,
              ];

              if (!hasFilters) {
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

      // 🔧 NOVO: Buscar anotações do usuário
      fetchUserAnnotations: async (userId: string, filters = {}, page = 1) => {
        const { setFetchLoading } = get();

        setFetchLoading('user-annotations', true);

        try {
          console.log('🔍 Buscando anotações do usuário:', userId, filters);

          const searchParams = new URLSearchParams({
            userId,
            page: page.toString(),
            limit: '50', // Mais itens para usuário próprio
          });

          // Incluir o userId nos filtros sempre
          const userFilters = { ...filters, userId };

          if (userFilters.category) {
            searchParams.append('category', userFilters.category);
          }

          if (userFilters.difficulty) {
            searchParams.append('difficulty', userFilters.difficulty);
          }

          if (userFilters.scope) {
            searchParams.append('scope', userFilters.scope);
          }

          if (userFilters.search) {
            searchParams.append('search', userFilters.search);
          }

          if (userFilters.sortBy) {
            searchParams.append('sortBy', userFilters.sortBy);
          }

          const response = await fetch(`/api/annotations?${searchParams}`);

          if (!response.ok) {
            throw new Error('Erro ao buscar anotações do usuário');
          }

          const data = await response.json();

          set((state) => {
            const newUserAnnotations = { ...state.userAnnotations };
            const newPagination = { ...state.pagination };

            if (page === 1) {
              // Primeira página - substituir
              newUserAnnotations[userId] = data.annotations || [];
            } else {
              // Páginas subsequentes - adicionar
              const existing = newUserAnnotations[userId] || [];
              newUserAnnotations[userId] = [
                ...existing,
                ...(data.annotations || []),
              ];
            }

            newPagination[`user-${userId}`] = data.pagination;

            console.log(
              '✅ Anotações do usuário carregadas:',
              newUserAnnotations[userId]?.length
            );

            return {
              userAnnotations: newUserAnnotations,
              pagination: newPagination,
              filters: { ...state.filters, ...userFilters },
            };
          });
        } catch (error) {
          console.error('Erro ao buscar anotações do usuário:', error);
        } finally {
          setFetchLoading('user-annotations', false);
        }
      },

      // 🔧 NOVO: Getter para anotações do usuário
      getUserAnnotations: (userId: string) => {
        const { userAnnotations } = get();
        return userAnnotations[userId] || [];
      },

      createAnnotation: async (data) => {
        const {
          setCreateLoading,
          addOptimisticAnnotation,
          removeOptimisticAnnotation,
          addUserAnnotation,
          dispatchAnnotationEvent,
        } = get();

        if (!data.workId || !data.title || !data.content) {
          throw new Error('Dados incompletos para criar anotação');
        }

        setCreateLoading(true);

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

        // Adicionar otimisticamente em ambos os caches
        addOptimisticAnnotation(data.workId, optimisticAnnotation);
        if (data.userId) {
          addUserAnnotation(data.userId, optimisticAnnotation);
        }

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
            // Remover otimística e adicionar real
            removeOptimisticAnnotation(data.workId, optimisticId);

            set((state) => {
              const newAnnotations = { ...state.annotations };
              const newFilteredAnnotations = { ...state.filteredAnnotations };
              const newUserAnnotations = { ...state.userAnnotations };

              // Atualizar cache de obra
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

              // 🔧 NOVO: Atualizar cache do usuário
              if (data.userId) {
                const userAnnotations = newUserAnnotations[data.userId] || [];
                // Remover otimística se existir
                const withoutOptimistic = userAnnotations.filter(
                  (a) => a.id !== optimisticId
                );
                newUserAnnotations[data.userId] = [
                  result.annotation,
                  ...withoutOptimistic,
                ];
              }

              return {
                annotations: newAnnotations,
                filteredAnnotations: newFilteredAnnotations,
                userAnnotations: newUserAnnotations,
              };
            });

            dispatchAnnotationEvent('created', result.annotation);
            await invalidateNextJSCache(data.userId);

            return result.annotation;
          }

          throw new Error('Resposta inválida do servidor');
        } catch (error) {
          console.error('Erro ao criar anotação:', error);
          removeOptimisticAnnotation(data.workId, optimisticId);

          // 🔧 NOVO: Remover do cache do usuário também
          if (data.userId) {
            set((state) => {
              const newUserAnnotations = { ...state.userAnnotations };

              if (!data.userId) return { userAnnotations: newUserAnnotations };
              if (newUserAnnotations[data.userId]) {
                newUserAnnotations[data.userId] = newUserAnnotations[
                  data.userId
                ].filter((a) => a.id !== optimisticId);
              }
              return { userAnnotations: newUserAnnotations };
            });
          }

          return null;
        } finally {
          setCreateLoading(false);
        }
      },

      updateAnnotation: async (annotationId, data) => {
        const {
          setUpdateLoading,
          getAnnotationById,
          markAnnotationAsUpdating,
          dispatchAnnotationEvent,
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
          const newUserAnnotations = { ...state.userAnnotations };

          // Atualizar em todos os caches de obras
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

          // 🔧 NOVO: Atualizar em todos os caches de usuários
          for (const [userId, annotations] of Object.entries(
            newUserAnnotations
          )) {
            const updated = annotations.map((a) =>
              a.id === annotationId ? optimisticUpdate : a
            );
            newUserAnnotations[userId] = updated;
          }

          return {
            annotations: newAnnotations,
            filteredAnnotations: newFilteredAnnotations,
            userAnnotations: newUserAnnotations,
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
              const newUserAnnotations = { ...state.userAnnotations };

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

              for (const [userId, annotations] of Object.entries(
                newUserAnnotations
              )) {
                const reverted = annotations.map((a) =>
                  a.id === annotationId
                    ? { ...annotation, isUpdating: false }
                    : a
                );
                newUserAnnotations[userId] = reverted;
              }

              return {
                annotations: newAnnotations,
                filteredAnnotations: newFilteredAnnotations,
                userAnnotations: newUserAnnotations,
              };
            });

            throw new Error('Erro ao atualizar anotação');
          }

          const result = await response.json();

          if (result.success && result.annotation) {
            set((state) => {
              const newAnnotations = { ...state.annotations };
              const newFilteredAnnotations = { ...state.filteredAnnotations };
              const newUserAnnotations = { ...state.userAnnotations };

              const finalAnnotation = {
                ...result.annotation,
                isUpdating: false,
              };

              for (const [workId, annotations] of Object.entries(
                newAnnotations
              )) {
                const updated = annotations.map((a) =>
                  a.id === annotationId ? finalAnnotation : a
                );
                newAnnotations[workId] = updated;
              }

              for (const [workId, annotations] of Object.entries(
                newFilteredAnnotations
              )) {
                const updated = annotations.map((a) =>
                  a.id === annotationId ? finalAnnotation : a
                );
                newFilteredAnnotations[workId] = updated;
              }

              for (const [userId, annotations] of Object.entries(
                newUserAnnotations
              )) {
                const updated = annotations.map((a) =>
                  a.id === annotationId ? finalAnnotation : a
                );
                newUserAnnotations[userId] = updated;
              }

              return {
                annotations: newAnnotations,
                filteredAnnotations: newFilteredAnnotations,
                userAnnotations: newUserAnnotations,
              };
            });

            dispatchAnnotationEvent('updated', result.annotation);
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

      deleteAnnotation: async (annotationId) => {
        const {
          getAnnotationById,
          removeAnnotationFromWork,
          removeUserAnnotation,
          addAnnotationToWork,
          addUserAnnotation,
          setDeleteLoading,
          dispatchAnnotationEvent,
        } = get();

        const annotation = getAnnotationById(annotationId);
        if (!annotation) return false;

        // 🔧 NOVO: Mostrar loading
        setDeleteLoading(annotationId, true);

        // 🔧 OTIMIZAÇÃO: Remoção otimista - remove imediatamente da UI
        removeAnnotationFromWork(annotation.workId, annotationId);
        removeUserAnnotation(annotation.userId, annotationId);

        console.log('🗑️ [Otimista] Anotação removida da UI:', annotationId);

        try {
          const response = await fetch(`/api/annotations/${annotationId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            // 🔧 REVERTER: Se deu erro, adicionar de volta
            addAnnotationToWork(annotation.workId, annotation);
            addUserAnnotation(annotation.userId, annotation);

            console.log(
              '❌ [Revertido] Erro na API, anotação restaurada:',
              annotationId
            );
            throw new Error('Erro ao deletar anotação');
          }

          // ✅ Sucesso - disparar eventos
          dispatchAnnotationEvent('deleted', annotation);
          await invalidateNextJSCache(annotation.userId);

          console.log(
            '✅ [Confirmado] Anotação deletada com sucesso:',
            annotationId
          );
          return true;
        } catch (error) {
          // A reversão já foi feita acima
          console.error('Erro ao deletar anotação:', error);
          return false;
        } finally {
          setDeleteLoading(annotationId, false);
        }
      },

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

      setFilters: (filters) => {
        set((state) => {
          const filtersChanged =
            JSON.stringify(state.filters) !== JSON.stringify(filters);

          return {
            filters: { ...state.filters, ...filters },
            ...(filtersChanged && {
              pagination: Object.keys(state.pagination).reduce(
                (acc, key) => ({
                  ...acc,
                  [key]: {
                    ...state.pagination[key],
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
          pagination: Object.keys(state.pagination).reduce(
            (acc, key) => ({
              ...acc,
              [key]: {
                ...state.pagination[key],
                page: 1,
                hasMore: true,
              },
            }),
            {}
          ),
        }));
      },

      getAllWorkAnnotations: (workId) => {
        return get().annotations[workId] || [];
      },

      getWorkAnnotations: (workId) => {
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
        const { annotations, filteredAnnotations, userAnnotations } = get();

        // Buscar em annotations de obras
        for (const workAnnotations of Object.values(annotations)) {
          const annotation = workAnnotations.find((a) => a.id === annotationId);
          if (annotation) return annotation;
        }

        // Buscar em filteredAnnotations
        for (const workAnnotations of Object.values(filteredAnnotations)) {
          const annotation = workAnnotations.find((a) => a.id === annotationId);
          if (annotation) return annotation;
        }

        // 🔧 NOVO: Buscar em userAnnotations
        for (const userAnnotationsList of Object.values(userAnnotations)) {
          const annotation = userAnnotationsList.find(
            (a) => a.id === annotationId
          );
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

      getAnnotationStats: (workId) => {
        const { getAllWorkAnnotations } = get();
        const allAnnotations = getAllWorkAnnotations(workId);
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

        allAnnotations.forEach((annotation) => {
          byCategory[annotation.category]++;
          byDifficulty[annotation.difficulty]++;
        });

        const mostHelpful = [...realAnnotations]
          .sort((a, b) => b.helpfulCount - a.helpfulCount)
          .slice(0, 5);

        return {
          total: allAnnotations.length,
          byCategory,
          byDifficulty,
          mostHelpful,
        };
      },

      // Loading states
      setFetchLoading: (key, loading) => {
        set((state) => {
          const newLoading = new Set(state.loading.fetch);
          if (loading) {
            newLoading.add(key);
          } else {
            newLoading.delete(key);
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

      setDeleteLoading: (annotationId, loading) => {
        set((state) => {
          const newLoading = new Set(state.loading.delete);
          if (loading) {
            newLoading.add(annotationId);
          } else {
            newLoading.delete(annotationId);
          }
          return {
            loading: {
              ...state.loading,
              delete: newLoading,
            },
          };
        });
      },

      // Utilities
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
          const newUserAnnotations = { ...state.userAnnotations };

          // Atualizar em todos os caches
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

          for (const [userId, annotations] of Object.entries(
            newUserAnnotations
          )) {
            const updated = annotations.map((annotation) =>
              annotation.id === annotationId
                ? { ...annotation, userVote, helpfulCount }
                : annotation
            );
            newUserAnnotations[userId] = updated;
          }

          return {
            annotations: newAnnotations,
            filteredAnnotations: newFilteredAnnotations,
            userAnnotations: newUserAnnotations,
          };
        });
      },

      // 🔧 NOVO: Utilities para anotações do usuário
      addUserAnnotation: (userId, annotation) => {
        set((state) => {
          const newUserAnnotations = { ...state.userAnnotations };
          const existing = newUserAnnotations[userId] || [];
          newUserAnnotations[userId] = [annotation, ...existing];

          return {
            userAnnotations: newUserAnnotations,
          };
        });
      },

      updateUserAnnotation: (userId, updatedAnnotation) => {
        set((state) => {
          const newUserAnnotations = { ...state.userAnnotations };
          const existing = newUserAnnotations[userId] || [];

          const updated = existing.map((a) =>
            a.id === updatedAnnotation.id ? updatedAnnotation : a
          );

          newUserAnnotations[userId] = updated;

          return {
            userAnnotations: newUserAnnotations,
          };
        });
      },

      removeUserAnnotation: (userId, annotationId) => {
        set((state) => {
          const newUserAnnotations = { ...state.userAnnotations };
          const existing = newUserAnnotations[userId] || [];

          const filtered = existing.filter((a) => a.id !== annotationId);
          newUserAnnotations[userId] = filtered;

          return {
            userAnnotations: newUserAnnotations,
          };
        });
      },

      // Métodos para updates otimistas (continuam iguais)
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
          const newUserAnnotations = { ...state.userAnnotations };

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

          for (const [userId, annotations] of Object.entries(
            newUserAnnotations
          )) {
            const updated = annotations.map((annotation) =>
              annotation.id === annotationId
                ? { ...annotation, isUpdating: updating }
                : annotation
            );
            newUserAnnotations[userId] = updated;
          }

          return {
            annotations: newAnnotations,
            filteredAnnotations: newFilteredAnnotations,
            userAnnotations: newUserAnnotations,
          };
        });
      },

      dispatchAnnotationEvent: (type, annotation) => {
        dispatchCustomEvent(type, annotation);
      },

      // Reset
      reset: () => {
        set({
          annotations: {},
          filteredAnnotations: {},
          userAnnotations: {},
          loading: {
            fetch: new Set(),
            create: false,
            update: new Set(),
            vote: new Set(),
            delete: new Set(), // 🔧 NOVO
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
        userAnnotations: state.userAnnotations, // 🔧 NOVO: Persistir cache do usuário
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
            delete: new Set(), // 🔧 NOVO
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
          if (
            !state.userAnnotations ||
            typeof state.userAnnotations !== 'object'
          ) {
            state.userAnnotations = {};
          }
          if (!state.pagination || typeof state.pagination !== 'object') {
            state.pagination = {};
          }
        }
      },
    }
  )
);
