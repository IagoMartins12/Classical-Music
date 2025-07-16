// app/hooks/useReports.ts
import { useState, useCallback } from 'react';

interface ReportStats {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
}

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ReportStats | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reports/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        return data;
      }
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
