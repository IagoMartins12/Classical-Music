// app/hooks/useReports.ts
import { useState, useCallback } from 'react';
import { getReportCounts } from '@/app/requests/admin/metrics';

interface ReportStats {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
}

/**
 * Denúncias pela moderação de contribuições da API (`/uploads/moderation/stats`):
 * números, pendentes por tipo e as do período por motivo.
 */
export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ReportStats | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReportCounts();
      setStats(data.stats);
      return data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    stats,
    fetchStats,
  };
};
