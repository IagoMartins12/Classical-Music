// app/hooks/admin/useAdminScores.ts
import { useState, useEffect, useCallback } from 'react';

export interface ScoreItem {
  id: string;
  title: string;
  workTitle: string;
  composerName: string;
  source: string;
  type: string;
  fileSize?: string;
  pageCount?: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  isActive: boolean;
  accessCount: number;
  qualityScore?: number;
  createdAt: Date;
  uploader?: string;
}

interface ScoreStats {
  total: number;
  active: number;
  bySource: Array<{
    source: string;
    count: number;
  }>;
  byType: Array<{
    type: string;
    count: number;
  }>;
  totalSize: string;
  averagePerWork: number;
  mostAccessed: Array<{
    id: string;
    title: string;
    workTitle: string;
    accessCount: number;
  }>;
  recentlyAdded: number;
}

interface ScoreFilters {
  search?: string;
  workId?: string;
  source?: string;
  type?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

interface UseAdminScoresReturn {
  scores: ScoreItem[];
  stats: ScoreStats | null;
  loading: boolean;
  error: string | null;
  pagination: any;
  fetchScores: (filters?: ScoreFilters) => Promise<void>;
  refreshStats: () => Promise<void>;
  updateScore: (id: string, data: any) => Promise<boolean>;
}

export const useAdminScores = (): UseAdminScoresReturn => {
  const [scores, setScores] = useState<ScoreItem[]>([]);
  const [stats, setStats] = useState<ScoreStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/scores?action=stats');
      if (!response.ok) throw new Error('Erro ao carregar estatísticas');

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Erro ao buscar stats:', err);
    }
  }, []);

  const fetchScores = useCallback(async (filters: ScoreFilters = {}) => {
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

      const response = await fetch(`/api/admin/scores?${searchParams}`);
      if (!response.ok) throw new Error('Erro ao carregar partituras');

      const data = await response.json();
      if (data.success) {
        setScores(data.scores);
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateScore = useCallback(
    async (id: string, updateData: any): Promise<boolean> => {
      try {
        const response = await fetch(`/api/admin/scores?id=${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) throw new Error('Erro ao atualizar partitura');

        const data = await response.json();
        if (data.success) {
          setScores((prev) =>
            prev.map((score) =>
              score.id === id ? { ...score, ...updateData } : score
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

  const refreshStats = useCallback(async () => {
    return fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
    fetchScores();
  }, [fetchStats, fetchScores]);

  return {
    scores,
    stats,
    loading,
    error,
    pagination,
    fetchScores,
    refreshStats,
    updateScore,
  };
};
