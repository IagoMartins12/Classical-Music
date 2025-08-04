// app/hooks/admin/useAdminComposers.ts
import { useState, useEffect, useCallback } from 'react';
import { TimePeriod } from '@/app/components/Admin/Common/PeriodSelector';

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
  hasValidImage: boolean;
  createdAt: Date;
  uploader?: string;
}

interface ComposerStats {
  total: number;
  verified: number;
  withImages: number;
  withoutImages: number;
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
  avgWorksPerComposer: number;
  topByWorks: Array<{
    id: string;
    name: string;
    worksCount: number;
  }>;
}

interface ComposerFilters {
  search?: string | null;
  epoch?: string | null;
  verified?: boolean | null;
  dataQuality?: string | null;
  hasImage?: boolean | null;
  minWorks?: number | null;
  maxWorks?: number | null;
  minFavorites?: number | null;
  sortBy?: 'name' | 'createdAt' | 'worksCount' | 'favoritesCount' | string;
  sortOrder?: 'asc' | 'desc' | null | string;
  period?: TimePeriod;
  page?: number | null;
  limit?: number | null;
}

interface UseAdminComposersReturn {
  composers: ComposerItem[];
  stats: ComposerStats | null;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
  pagination: any;
  period: TimePeriod;
  setPeriod: (period: TimePeriod) => void;
  fetchComposers: (filters?: ComposerFilters) => Promise<void>;
  refreshStats: () => Promise<void>;
  updateComposer: (id: string, data: any) => Promise<boolean>;
  deleteComposer: (id: string) => Promise<boolean>;
}

export const useAdminComposers = (): UseAdminComposersReturn => {
  const [composers, setComposers] = useState<ComposerItem[]>([]);
  const [stats, setStats] = useState<ComposerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [period, setPeriod] = useState<TimePeriod>('7d'); // Padrão: última semana

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/composers?action=stats&period=${period}`
      );
      if (!response.ok) throw new Error('Erro ao carregar estatísticas');

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Erro ao buscar stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [period]);

  const fetchComposers = useCallback(
    async (filters: ComposerFilters = {}) => {
      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams({
          action: 'list',
          period: period,
          ...Object.fromEntries(
            Object.entries(filters).filter(
              ([_, v]) => v !== undefined && v !== '' && v !== null
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
    },
    [period]
  );

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

  // Refetch when period changes
  useEffect(() => {
    fetchStats();
    fetchComposers();
  }, [period, fetchStats, fetchComposers]);

  return {
    composers,
    stats,
    loading,
    statsLoading,
    error,
    pagination,
    period,
    setPeriod,
    fetchComposers,
    refreshStats,
    updateComposer,
    deleteComposer,
  };
};
