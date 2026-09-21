// app/hooks/admin/useAdminScores.ts
import { useCallback, useState } from 'react';
import {
  adminKeys,
  errorMessage,
  useAdminQuery,
  useInvalidateAdmin,
} from './query';
import {
  getAdminScoreStats,
  listAdminScores,
  updateAdminScore,
} from '@/app/requests/admin/catalog';

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
  workId: string;
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

/**
 * Partituras do painel: lista filtrada e métricas, as duas pelo TanStack
 * Query. Editar invalida a lista, que volta do servidor.
 */
export const useAdminScores = (): UseAdminScoresReturn => {
  const [filters, setFilters] = useState<ScoreFilters>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const invalidate = useInvalidateAdmin();

  const list = useAdminQuery(adminKeys.list('scores', filters), () =>
    listAdminScores(filters)
  );
  const stats = useAdminQuery(
    adminKeys.area('score-stats'),
    getAdminScoreStats
  );

  const fetchScores = useCallback(async (nextFilters: ScoreFilters = {}) => {
    setFilters(nextFilters);
  }, []);

  const updateScore = useCallback(
    async (id: string, updateData: any): Promise<boolean> => {
      try {
        await updateAdminScore(id, updateData);
        setActionError(null);
        await Promise.all([invalidate('scores'), stats.refetch()]);
        return true;
      } catch (error) {
        setActionError(errorMessage(error));
        return false;
      }
    },
    [invalidate, stats]
  );

  return {
    scores: list.data?.scores ?? [],
    stats: stats.data ?? null,
    loading: list.loading,
    error: list.error ?? actionError,
    pagination: list.data?.pagination ?? null,
    fetchScores,
    refreshStats: stats.refetch,
    updateScore,
  };
};
