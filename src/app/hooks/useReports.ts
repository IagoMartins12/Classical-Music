// app/hooks/useReports.ts
import { useState, useCallback } from 'react';
import { useNotifications } from './useNotifications';

interface ReportStats {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
}

interface ReportData {
  entityType: string;
  entityId: string;
  reason: string;
  description?: string;
}

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const { notifySuccess, notifyError } = useNotifications();

  const submitReport = useCallback(
    async (reportData: ReportData) => {
      setLoading(true);

      try {
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportData),
        });

        if (response.ok) {
          const data = await response.json();
          notifySuccess('Sucesso', data.message);
          return { success: true, data };
        } else {
          const error = await response.json();
          notifyError('Erro', error.error || 'Erro ao enviar report');
          return { success: false, error: error.error };
        }
      } catch (error) {
        console.error('Erro ao enviar report:', error);
        notifyError('Erro', 'Erro ao enviar report');
        return { success: false, error: 'Erro ao enviar report' };
      } finally {
        setLoading(false);
      }
    },
    [notifySuccess, notifyError]
  );

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/reports/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        return data;
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  }, []);

  const verifyComposer = useCallback(
    async (composerId: string, verified: boolean, notes?: string) => {
      try {
        const response = await fetch(`/api/composers/${composerId}/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ verified, notes }),
        });

        if (response.ok) {
          const data = await response.json();
          notifySuccess('Sucesso', data.message);
          return { success: true, data };
        } else {
          const error = await response.json();
          notifyError('Erro', error.error || 'Erro ao verificar compositor');
          return { success: false, error: error.error };
        }
      } catch (error) {
        console.error('Erro ao verificar compositor:', error);
        notifyError('Erro', 'Erro ao verificar compositor');
        return { success: false, error: 'Erro ao verificar compositor' };
      }
    },
    [notifySuccess, notifyError]
  );

  return {
    loading,
    stats,
    submitReport,
    fetchStats,
    verifyComposer,
  };
};
