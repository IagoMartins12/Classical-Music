// hooks/useWorkAnnotations.ts
import { useEffect, useState } from 'react';
import {
  useAnnotationsStore,
  AnnotationFilters,
  WorkAnnotation,
} from '@/app/stores/useAnnotationsStore';
import { useAuth } from '@/app/hooks/useAuth';

interface UseWorkAnnotationsReturn {
  annotations: WorkAnnotation[];
  loading: boolean;
  stats: {
    total: number;
    byCategory: Record<string, number>;
    byDifficulty: Record<string, number>;
    mostHelpful: WorkAnnotation[];
  };
  filters: AnnotationFilters;
  pagination:
    | {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasMore: boolean;
      }
    | undefined;

  // Actions
  createAnnotation: (
    data: Partial<WorkAnnotation>
  ) => Promise<WorkAnnotation | null>;
  updateAnnotation: (
    id: string,
    data: Partial<WorkAnnotation>
  ) => Promise<WorkAnnotation | null>;
  deleteAnnotation: (id: string) => Promise<boolean>;
  voteAnnotation: (id: string, isHelpful: boolean) => Promise<boolean>;

  // Filtering and pagination
  setFilters: (filters: AnnotationFilters) => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;

  // User permissions
  canEditAnnotation: (annotation: WorkAnnotation) => boolean;
  canDeleteAnnotation: (annotation: WorkAnnotation) => boolean;
  canVoteAnnotation: (annotation: WorkAnnotation) => boolean;
}

export const useWorkAnnotations = (
  workId: string
): UseWorkAnnotationsReturn => {
  const { user, isAuthenticated } = useAuth();
  const [initialized, setInitialized] = useState(false);

  const {
    getWorkAnnotations,
    getAnnotationStats,
    fetchWorkAnnotations,
    createAnnotation: storeCreateAnnotation,
    updateAnnotation: storeUpdateAnnotation,
    deleteAnnotation: storeDeleteAnnotation,
    voteAnnotation: storeVoteAnnotation,
    setFilters: storeSetFilters,
    loading,
    filters,
    pagination,
  } = useAnnotationsStore();

  const annotations = getWorkAnnotations(workId);
  const stats = getAnnotationStats(workId);
  const isLoading = loading.fetch.has(workId);
  const workPagination = pagination.get(workId);

  // Carregar anotações iniciais
  useEffect(() => {
    if (!initialized) {
      fetchWorkAnnotations(workId);
      setInitialized(true);
    }
  }, [workId, initialized, fetchWorkAnnotations]);

  // Refresh quando filtros mudam
  useEffect(() => {
    if (initialized) {
      fetchWorkAnnotations(workId, filters);
    }
  }, [workId, filters, initialized, fetchWorkAnnotations]);

  // Carregar anotações de votos do usuário quando logado
  useEffect(() => {
    if (isAuthenticated && annotations.length > 0) {
      // Aqui poderiamos fazer uma chamada para buscar os votos do usuário
      // Para cada anotação, mas isso já está sendo feito no store
    }
  }, [isAuthenticated, annotations.length]);

  const createAnnotation = async (
    data: Partial<WorkAnnotation>
  ): Promise<WorkAnnotation | null> => {
    const annotationData = {
      ...data,
      workId,
    };
    return storeCreateAnnotation(annotationData);
  };

  const updateAnnotation = async (
    id: string,
    data: Partial<WorkAnnotation>
  ): Promise<WorkAnnotation | null> => {
    return storeUpdateAnnotation(id, data);
  };

  const deleteAnnotation = async (id: string): Promise<boolean> => {
    return storeDeleteAnnotation(id);
  };

  const voteAnnotation = async (
    id: string,
    isHelpful: boolean
  ): Promise<boolean> => {
    return storeVoteAnnotation(id, isHelpful);
  };

  const setFilters = (newFilters: AnnotationFilters) => {
    storeSetFilters(newFilters);
  };

  const loadMore = async (): Promise<void> => {
    if (workPagination?.hasMore) {
      await fetchWorkAnnotations(workId, filters, workPagination.page + 1);
    }
  };

  const refresh = async (): Promise<void> => {
    await fetchWorkAnnotations(workId, filters, 1);
  };

  // Permissions
  const canEditAnnotation = (annotation: WorkAnnotation): boolean => {
    return isAuthenticated && user?.id === annotation.userId;
  };

  const canDeleteAnnotation = (annotation: WorkAnnotation): boolean => {
    return isAuthenticated && user?.id === annotation.userId;
  };

  const canVoteAnnotation = (annotation: WorkAnnotation): boolean => {
    return isAuthenticated && user?.id !== annotation.userId;
  };

  return {
    annotations,
    loading: isLoading,
    stats,
    filters,
    pagination: workPagination,

    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    voteAnnotation,

    setFilters,
    loadMore,
    refresh,

    canEditAnnotation,
    canDeleteAnnotation,
    canVoteAnnotation,
  };
};
