// app/hooks/admin/useAdminWorks.ts
import { useState, useEffect, useCallback } from 'react';

export interface WorkItem {
  id: string;
  title: string;
  composer: string;
  epoch: string;
  instrument: string;
  opOrCatalog?: string;
  compositionYear?: string;
  workType: string;
  difficultyLevel?: string;
  favoritesCount: number;
  annotationsCount: number;
  scoresCount: number;
  studySessionsCount: number;
  createdAt: Date;
  uploader?: string;
}

interface WorkStats {
  total: number;
  byEpoch: Array<{
    epoch: string;
    count: number;
  }>;
  byInstrument: Array<{
    instrument: string;
    count: number;
  }>;
  byDifficulty: Array<{
    difficulty: string;
    count: number;
  }>;
  avgScoresPerWork: number;
  mostPopular: Array<{
    id: string;
    title: string;
    composer: string;
    favoritesCount: number;
    annotationsCount: number;
  }>;
  recentlyAdded: number;
}

interface WorkFilters {
  search?: string;
  composerId?: string;
  epochId?: string;
  instrumentId?: string;
  workType?: string;
  difficultyLevel?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

interface UseAdminWorksReturn {
  works: WorkItem[];
  stats: WorkStats | null;
  loading: boolean;
  error: string | null;
  pagination: any;
  fetchWorks: (filters?: WorkFilters) => Promise<void>;
  refreshStats: () => Promise<void>;
  updateWork: (id: string, data: any) => Promise<boolean>;
  deleteWork: (id: string) => Promise<boolean>;
}

export const useAdminWorks = (): UseAdminWorksReturn => {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [stats, setStats] = useState<WorkStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/works?action=stats');
      if (!response.ok) throw new Error('Erro ao carregar estatísticas');

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Erro ao buscar stats:', err);
    }
  }, []);

  const fetchWorks = useCallback(async (filters: WorkFilters = {}) => {
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

      const response = await fetch(`/api/admin/works?${searchParams}`);
      if (!response.ok) throw new Error('Erro ao carregar obras');

      const data = await response.json();
      if (data.success) {
        setWorks(data.works);
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWork = useCallback(
    async (id: string, updateData: any): Promise<boolean> => {
      try {
        const response = await fetch(`/api/admin/works?id=${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) throw new Error('Erro ao atualizar obra');

        const data = await response.json();
        if (data.success) {
          setWorks((prev) =>
            prev.map((work) =>
              work.id === id ? { ...work, ...updateData } : work
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

  const deleteWork = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/works?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao deletar obra');

      const data = await response.json();
      if (data.success) {
        setWorks((prev) => prev.filter((work) => work.id !== id));
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
    fetchWorks();
  }, [fetchStats, fetchWorks]);

  return {
    works,
    stats,
    loading,
    error,
    pagination,
    fetchWorks,
    refreshStats,
    updateWork,
    deleteWork,
  };
};
