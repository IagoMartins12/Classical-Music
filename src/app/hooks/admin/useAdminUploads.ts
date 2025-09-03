import { TimePeriod } from '@/app/components/Admin/Common/PeriodSelector';
import { useState, useEffect, useCallback } from 'react';

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
  error: string | null;
  pagination: any;
  period: TimePeriod;
  setPeriod: (period: TimePeriod) => void;
  fetchUploads: (filters?: UploadFilters) => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useAdminUploads = (): UseAdminUploadsReturn => {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [stats, setStats] = useState<UploadStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [period, setPeriod] = useState<TimePeriod>('30d');

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/uploads?action=stats&period=${period}`
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

  const fetchUploads = useCallback(
    async (filters: UploadFilters = {}) => {
      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams({
          action: 'list',
          period: period,
          ...Object.fromEntries(
            Object.entries(filters).filter(
              ([_, v]) => v !== undefined && v !== ''
            )
          ),
        });

        const response = await fetch(`/api/admin/uploads?${searchParams}`);
        if (!response.ok) throw new Error('Erro ao carregar uploads');

        const data = await response.json();
        if (data.success) {
          setUploads(data.uploads);
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

  const refreshStats = useCallback(async () => {
    return fetchStats();
  }, [fetchStats]);

  // Recarregar dados quando período mudar
  useEffect(() => {
    fetchStats();
    fetchUploads();
  }, [period, fetchStats, fetchUploads]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchStats();
    fetchUploads();
  }, []);

  return {
    uploads,
    stats,
    loading,
    statsLoading,
    error,
    pagination,
    period,
    setPeriod,
    fetchUploads,
    refreshStats,
  };
};
