// app/hooks/admin/useAdminComposers.ts
import { useState, useEffect, useCallback } from 'react';

export interface ComposerItem {
  id: string;
  name: string;
  fullName: string;
  epoch: string;
  birthDate?: string;
  deathDate?: string;
  nationality?: string;
  isVerified: boolean;
  dataQuality?: string;
  worksCount: number;
  favoritesCount: number;
  portraitUrl?: string;
  createdAt: Date;
  uploader?: string;
}

interface ComposerStats {
  total: number;
  verified: number;
  byEpoch: Array<{
    epoch: string;
    count: number;
  }>;
  byQuality: Array<{
    quality: string;
    count: number;
  }>;
  recentlyAdded: number;
  mostPopular: Array<{
    id: string;
    name: string;
    worksCount: number;
    favoritesCount: number;
  }>;
}

interface ComposerFilters {
  search?: string | null;
  epoch?: string | null;
  verified?: boolean | null;
  dataQuality?: string | null;
  sortBy?: 'name' | 'createdAt' | 'worksCount' | 'favoritesCount' | string;
  sortOrder?: 'asc' | 'desc' | null | string;
  page?: number | null;
  limit?: number | null;
}

interface UseAdminComposersReturn {
  composers: ComposerItem[];
  stats: ComposerStats | null;
  loading: boolean;
  error: string | null;
  pagination: any;
  fetchComposers: (filters?: ComposerFilters) => Promise<void>;
  refreshStats: () => Promise<void>;
  updateComposer: (id: string, data: any) => Promise<boolean>;
  deleteComposer: (id: string) => Promise<boolean>;
}

export const useAdminComposers = (): UseAdminComposersReturn => {
  const [composers, setComposers] = useState<ComposerItem[]>([]);
  const [stats, setStats] = useState<ComposerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/composers?action=stats');
      if (!response.ok) throw new Error('Erro ao carregar estatísticas');

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Erro ao buscar stats:', err);
    }
  }, []);

  const fetchComposers = useCallback(async (filters: ComposerFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        action: 'list',
        ...Object.fromEntries(
          Object.entries(filters).filter(
            ([_, v]) => v !== undefined && v !== ''
          )
        ),
      });

      const response = await fetch(`/api/admin/composers?${searchParams}`);
      if (!response.ok) throw new Error('Erro ao carregar compositores');

      const data = await response.json();
      if (data.success) {
        setComposers(data.composers);
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateComposer = useCallback(
    async (id: string, updateData: any): Promise<boolean> => {
      try {
        const response = await fetch(`/api/admin/composers?id=${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) throw new Error('Erro ao atualizar compositor');

        const data = await response.json();
        if (data.success) {
          // Atualizar lista local
          setComposers((prev) =>
            prev.map((composer) =>
              composer.id === id ? { ...composer, ...updateData } : composer
            )
          );
          return true;
        }
        return false;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao atualizar');
        return false;
      }
    },
    []
  );

  const deleteComposer = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/composers?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao deletar compositor');

      const data = await response.json();
      if (data.success) {
        // Remover da lista local
        setComposers((prev) => prev.filter((composer) => composer.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar');
      return false;
    }
  }, []);

  const refreshStats = useCallback(async () => {
    return fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
    fetchComposers();
  }, [fetchStats, fetchComposers]);

  return {
    composers,
    stats,
    loading,
    error,
    pagination,
    fetchComposers,
    refreshStats,
    updateComposer,
    deleteComposer,
  };
};
