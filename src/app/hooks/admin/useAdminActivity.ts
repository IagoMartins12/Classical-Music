// app/hooks/admin/useAdminActivity.ts
import { useState, useEffect, useCallback } from 'react';

export interface ActivityItem {
  id: string;
  type:
    | 'user_registration'
    | 'upload'
    | 'annotation'
    | 'favorite'
    | 'moderation'
    | 'system'
    | 'study_session';
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  target?: {
    type: 'composer' | 'work' | 'score' | 'user';
    id: string;
    name: string;
  };
  timestamp: Date;
  metadata?: any;
  status?: 'success' | 'warning' | 'error';
}

export interface ActivityFilters {
  type?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}

export interface ActivityPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export function useAdminActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivityFilters>({});
  const [pagination, setPagination] = useState<ActivityPagination>({
    page: 1,
    limit: 50,
    total: 0,
    hasMore: false,
  });

  // Função para buscar atividades
  const fetchActivities = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set('page', reset ? '1' : pagination.page.toString());
        params.set('limit', pagination.limit.toString());

        if (filters.type) params.set('type', filters.type);
        if (filters.search) params.set('search', filters.search);
        if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.set('dateTo', filters.dateTo);
        if (filters.userId) params.set('userId', filters.userId);

        const response = await fetch(`/api/admin/activity?${params}`);
        if (!response.ok) {
          throw new Error(`Erro ao buscar atividades: ${response.statusText}`);
        }

        const data = await response.json();

        if (reset) {
          setActivities(data.activities || []);
          setPagination({
            page: 1,
            limit: pagination.limit,
            total: data.pagination?.total || 0,
            hasMore: data.pagination?.hasMore || false,
          });
        } else {
          setActivities((prev) => [...prev, ...(data.activities || [])]);
          setPagination((prev) => ({
            ...prev,
            page: prev.page + 1,
            hasMore: data.pagination?.hasMore || false,
          }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.page, pagination.limit]
  );

  // Função para definir filtros e reiniciar busca
  const setActivityFilters = useCallback(
    (newFilters: Partial<ActivityFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    },
    []
  );

  // Função para recarregar atividades
  const refreshActivities = useCallback(async () => {
    await fetchActivities(true);
  }, [fetchActivities]);

  // Função para carregar mais atividades
  const loadMoreActivities = useCallback(async () => {
    if (!pagination.hasMore || loading) return;
    await fetchActivities(false);
  }, [fetchActivities, pagination.hasMore, loading]);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    refreshActivities();
  }, [filters]);

  return {
    activities,
    loading,
    error,
    filters,
    pagination,
    setActivityFilters,
    refreshActivities,
    loadMoreActivities,
  };
}
