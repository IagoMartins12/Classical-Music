// app/hooks/admin/useAdminComposers.ts
import { useCallback, useState } from 'react';
import {
  adminKeys,
  errorMessage,
  useAdminQuery,
  useInvalidateAdmin,
} from './query';
import { TimePeriod } from '@/app/components/Admin/Common/PeriodSelector';
import {
  deleteAdminComposer,
  getAdminComposerStats,
  listAdminComposers,
  updateAdminComposer,
} from '@/app/requests/admin/catalog';

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

/**
 * Compositores do painel. Lista e métricas são estado de servidor (TanStack
 * Query); a chave da lista leva os filtros, então trocar e voltar um filtro
 * mostra o que está em cache enquanto revalida. Editar ou apagar invalida a
 * lista e as métricas, em vez de remendar o array na mão.
 */
export const useAdminComposers = (): UseAdminComposersReturn => {
  const [filters, setFilters] = useState<ComposerFilters>({});
  // As métricas do catálogo da API são do acervo inteiro, não por período.
  const [period, setPeriod] = useState<TimePeriod>('7d');
  const [actionError, setActionError] = useState<string | null>(null);
  const invalidate = useInvalidateAdmin();

  const list = useAdminQuery(adminKeys.list('composers', filters), () =>
    listAdminComposers(filters)
  );
  const stats = useAdminQuery(
    adminKeys.area('composer-stats'),
    getAdminComposerStats
  );

  const fetchComposers = useCallback(
    async (nextFilters: ComposerFilters = {}) => {
      setFilters(nextFilters);
    },
    []
  );

  const afterWrite = useCallback(async () => {
    await Promise.all([invalidate('composers'), stats.refetch()]);
  }, [invalidate, stats]);

  const updateComposer = useCallback(
    async (id: string, updateData: any): Promise<boolean> => {
      try {
        await updateAdminComposer(id, updateData);
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

  const deleteComposer = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteAdminComposer(id);
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
    composers: list.data?.composers ?? [],
    stats: stats.data ?? null,
    loading: list.loading,
    statsLoading: stats.loading,
    error: list.error ?? actionError,
    pagination: list.data?.pagination ?? null,
    period,
    setPeriod,
    fetchComposers,
    refreshStats: stats.refetch,
    updateComposer,
    deleteComposer,
  };
};
