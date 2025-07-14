// app/hooks/admin/useAdminUploads.ts
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
  moderationStatus: any;
}

interface UploadStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
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
    userName: string;
    createdAt: Date;
  }>;
  timeline: Array<{
    date: string;
    uploads: number;
    approved: number;
    rejected: number;
  }>;
}

interface UploadFilters {
  search?: string;
  entityType?: string;
  status?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

interface UseAdminUploadsReturn {
  uploads: UploadItem[];
  stats: UploadStats | null;
  loading: boolean;
  error: string | null;
  pagination: any;
  fetchUploads: (filters?: UploadFilters) => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useAdminUploads = (): UseAdminUploadsReturn => {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [stats, setStats] = useState<UploadStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/uploads?action=stats');
      if (!response.ok) throw new Error('Erro ao carregar estatísticas');

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Erro ao buscar stats:', err);
    }
  }, []);

  const fetchUploads = useCallback(async (filters: UploadFilters = {}) => {
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
  }, []);

  const refreshStats = useCallback(async () => {
    return fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
    fetchUploads();
  }, [fetchStats, fetchUploads]);

  return {
    uploads,
    stats,
    loading,
    error,
    pagination,
    fetchUploads,
    refreshStats,
  };
};
