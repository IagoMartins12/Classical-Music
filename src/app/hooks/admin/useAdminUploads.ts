import { TimePeriod } from '@/app/components/Admin/Common/PeriodSelector';
import { useCallback, useState } from 'react';
import { adminKeys, useAdminInfinite, useAdminQuery } from './query';
import {
  getAdminUploadStats,
  listAdminUploads,
} from '@/app/requests/admin/uploads';

export interface UploadItem {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes: any;
  reason?: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    uploadScore: number;
  };
  entityDetails: any;
}

interface UploadStats {
  total: number;
  recentCreations: number;
  recentUpdates: number;
  activeUsers: number;
  byType: Array<{
    type: string;
    count: number;
  }>;
  byUser: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    userName: string;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
      uploadScore: number;
    };
    entityDetails: any;
    reason?: string;
    changes: any;
  }>;
  timeline: Array<{
    date: string;
    uploads: number;
    creates: number;
    updates: number;
  }>;
}

interface UploadFilters {
  search?: string;
  entityType?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
  period?: TimePeriod;
}

interface UseAdminUploadsReturn {
  uploads: UploadItem[];
  stats: UploadStats | null;
  loading: boolean;
  statsLoading: boolean;
  /** Buscando a fatia seguinte, com a lista já na tela. */
  loadingMore: boolean;
  error: string | null;
  pagination: { shown: number; total: number; hasMore: boolean };
  period: TimePeriod;
  setPeriod: (period: TimePeriod) => void;
  fetchUploads: (filters?: UploadFilters) => Promise<void>;
  loadMore: () => void;
  refreshStats: () => Promise<void>;
}

/** Envios por fatia; o mesmo tamanho que a tela pedia antes. */
const PAGE_SIZE = 25;

/**
 * Envios da comunidade no painel: lista filtrada e métricas do período.
 *
 * A lista vem por cursor (`useAdminInfinite`), em vez de saltar de página em
 * página: a API continua do id do último envio mostrado, sem reler o que já
 * passou nem contar a base a cada rolagem.
 */
export const useAdminUploads = (): UseAdminUploadsReturn => {
  const [filters, setFilters] = useState<UploadFilters>({});
  const [period, setPeriod] = useState<TimePeriod>('30d');

  const list = useAdminInfinite(
    adminKeys.list('uploads', { filters, period }),
    async (cursor) => {
      const data = await listAdminUploads(
        { ...filters, limit: PAGE_SIZE },
        filters.period ?? period,
        cursor
      );

      return {
        items: data.uploads,
        total: data.total,
        nextCursor: data.nextCursor,
      };
    }
  );
  const stats = useAdminQuery(adminKeys.list('upload-stats', period), () =>
    getAdminUploadStats(period)
  );

  const fetchUploads = useCallback(async (nextFilters: UploadFilters = {}) => {
    setFilters(nextFilters);
  }, []);

  return {
    uploads: list.items,
    stats: stats.data ?? null,
    loading: list.loading,
    statsLoading: stats.loading,
    loadingMore: list.loadingMore,
    error: list.error,
    pagination: {
      shown: list.items.length,
      total: list.total ?? list.items.length,
      hasMore: list.hasMore,
    },
    period,
    setPeriod,
    fetchUploads,
    loadMore: list.loadMore,
    refreshStats: stats.refetch,
  };
};
