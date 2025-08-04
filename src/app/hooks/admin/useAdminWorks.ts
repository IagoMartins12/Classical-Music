// app/hooks/admin/useAdminWorks.ts
import { useState, useEffect, useCallback } from 'react';
import { TimePeriod } from '@/app/components/Admin/Common/PeriodSelector';

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
  wantToLearnCount: number;
  learnedCount: number;
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
  avgFavoritesPerWork: number;
  mostPopular: Array<{
    id: string;
    title: string;
    composer: string;
    favoritesCount: number;
    annotationsCount: number;
  }>;
  mostWantedToLearn: Array<{
    id: string;
    title: string;
    composer: string;
    wantToLearnCount: number;
  }>;
  mostLearned: Array<{
    id: string;
    title: string;
    composer: string;
    learnedCount: number;
  }>;
  recentlyAdded: number;
  withoutScores: number;
  topByScores: Array<{
    id: string;
    title: string;
    composer: string;
    scoresCount: number;
  }>;
}

interface WorkFilters {
  search?: string;
  composerId?: string;
  epochId?: string;
  instrumentId?: string;
  workType?: string;
  difficultyLevel?: string;
  minFavorites?: number;
  minWantToLearn?: number;
  minLearned?: number;
  minScores?: number;
  maxScores?: number;
  hasScores?: boolean;
  sortBy?: string;
  sortOrder?: string;
  period?: TimePeriod;
  page?: number;
  limit?: number;
}

interface UseAdminWorksReturn {
  works: WorkItem[];
  stats: WorkStats | null;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
  pagination: any;
  period: TimePeriod;
  setPeriod: (period: TimePeriod) => void;
  fetchWorks: (filters?: WorkFilters) => Promise<void>;
  refreshStats: () => Promise<void>;
  updateWork: (id: string, data: any) => Promise<boolean>;
  deleteWork: (id: string) => Promise<boolean>;
}

export const useAdminWorks = (): UseAdminWorksReturn => {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [stats, setStats] = useState<WorkStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [period, setPeriod] = useState<TimePeriod>('7d'); // Padrão: última semana

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/works?action=stats&period=${period}`
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

  const fetchWorks = useCallback(
    async (filters: WorkFilters = {}) => {
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
    },
    [period]
  );

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

  // Refetch when period changes
  useEffect(() => {
    fetchStats();
    fetchWorks();
  }, [period, fetchStats, fetchWorks]);

  return {
    works,
    stats,
    loading,
    statsLoading,
    error,
    pagination,
    period,
    setPeriod,
    fetchWorks,
    refreshStats,
    updateWork,
    deleteWork,
  };
};
