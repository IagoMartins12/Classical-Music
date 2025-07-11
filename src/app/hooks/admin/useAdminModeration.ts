// app/hooks/useAdminModeration.ts
import { useState, useEffect, useCallback } from 'react';

export interface ModerationStats {
  pending: number;
  processed: number;
  approved: number;
  rejected: number;
  avgProcessingTime: number;
  topModerators: Array<{
    id: string;
    name: string;
    processed: number;
    accuracy: number;
  }>;
  qualityTrends: Array<{
    date: string;
    avgQuality: number;
    totalItems: number;
  }>;
}

export interface ModerationItem {
  id: string;
  type: 'composer' | 'work' | 'score' | 'annotation';
  title: string;
  uploader: {
    id: string;
    name: string;
    email: string;
    uploadScore: number;
  };
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  submittedAt: Date;
  reportCount: number;
  qualityScore?: number;
  issues: string[];
  content: {
    description?: string;
    metadata?: any;
    fileUrl?: string;
  };
}

interface UseAdminModerationReturn {
  stats: ModerationStats | null;
  items: ModerationItem[];
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  refreshItems: (filters?: any) => Promise<void>;
  approveItem: (itemId: string, notes?: string) => Promise<boolean>;
  rejectItem: (
    itemId: string,
    reason?: string,
    notes?: string
  ) => Promise<boolean>;
}

export const useAdminModeration = (): UseAdminModerationReturn => {
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/moderation?action=stats');
      if (!response.ok) throw new Error('Erro ao carregar estatísticas');

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Erro ao buscar stats de moderação:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }, []);

  const fetchItems = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        action: 'items',
        ...filters,
      });

      const response = await fetch(`/api/admin/moderation?${searchParams}`);
      if (!response.ok) throw new Error('Erro ao carregar itens');

      const data = await response.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Erro ao buscar itens de moderação:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  const approveItem = useCallback(
    async (itemId: string, notes?: string): Promise<boolean> => {
      try {
        const response = await fetch(
          `/api/admin/moderation?action=approve&itemId=${itemId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes }),
          }
        );

        if (!response.ok) throw new Error('Erro ao aprovar item');

        const data = await response.json();
        if (data.success) {
          // Atualizar lista local
          setItems((prev) => prev.filter((item) => item.id !== itemId));
          return true;
        }
        return false;
      } catch (err) {
        console.error('Erro ao aprovar item:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        return false;
      }
    },
    []
  );

  const rejectItem = useCallback(
    async (
      itemId: string,
      reason?: string,
      notes?: string
    ): Promise<boolean> => {
      try {
        const response = await fetch(
          `/api/admin/moderation?action=reject&itemId=${itemId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason, notes }),
          }
        );

        if (!response.ok) throw new Error('Erro ao rejeitar item');

        const data = await response.json();
        if (data.success) {
          // Atualizar lista local
          setItems((prev) => prev.filter((item) => item.id !== itemId));
          return true;
        }
        return false;
      } catch (err) {
        console.error('Erro ao rejeitar item:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        return false;
      }
    },
    []
  );

  const refreshStats = useCallback(async () => {
    return fetchStats();
  }, [fetchStats]);

  const refreshItems = useCallback(
    async (filters?: any) => {
      return fetchItems(filters);
    },
    [fetchItems]
  );

  useEffect(() => {
    fetchStats();
    fetchItems();
  }, [fetchStats, fetchItems]);

  return {
    stats,
    items,
    loading,
    error,
    refreshStats,
    refreshItems,
    approveItem,
    rejectItem,
  };
};
