// app/hooks/admin/useAdminWorks.ts
import { useCallback, useState } from 'react';
import {
  adminKeys,
  errorMessage,
  useAdminQuery,
  useInvalidateAdmin,
} from './query';
import { TimePeriod } from '@/app/components/Admin/Common/PeriodSelector';
import {
  deleteAdminWork,
  getAdminWorkStats,
  listAdminWorks,
  updateAdminWork,
} from '@/app/requests/admin/catalog';

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

/**
 * Obras do painel. Lista e métricas pelo TanStack Query; editar ou apagar
 * invalida as duas, em vez de mexer no array da tela.
 */
export const useAdminWorks = (): UseAdminWorksReturn => {
  const [filters, setFilters] = useState<WorkFilters>({});
  // As métricas do catálogo da API são do acervo inteiro, não por período.
  const [period, setPeriod] = useState<TimePeriod>('7d');
  const [actionError, setActionError] = useState<string | null>(null);
  const invalidate = useInvalidateAdmin();

  const list = useAdminQuery(adminKeys.list('works', filters), () =>
    listAdminWorks(filters)
  );
  const stats = useAdminQuery(adminKeys.area('work-stats'), getAdminWorkStats);

  const fetchWorks = useCallback(async (nextFilters: WorkFilters = {}) => {
    setFilters(nextFilters);
  }, []);

  const afterWrite = useCallback(async () => {
    await Promise.all([invalidate('works'), stats.refetch()]);
  }, [invalidate, stats]);

  const updateWork = useCallback(
    async (id: string, updateData: any): Promise<boolean> => {
      try {
        await updateAdminWork(id, updateData);
        setActionError(null);
        await afterWrite();
        return true;
      } catch (error) {
        setActionError(errorMessage(error));
        return false;
      }
    },
    [afterWrite]
  );

  const deleteWork = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteAdminWork(id);
        setActionError(null);
        await afterWrite();
        return true;
      } catch (error) {
        setActionError(errorMessage(error));
        return false;
      }
    },
    [afterWrite]
  );

  return {
    works: list.data?.works ?? [],
    stats: stats.data ?? null,
    loading: list.loading,
    statsLoading: stats.loading,
    error: list.error ?? actionError,
    pagination: list.data?.pagination ?? null,
    period,
    setPeriod,
    fetchWorks,
    refreshStats: stats.refetch,
    updateWork,
    deleteWork,
  };
};
