// app/hooks/admin/useAdminAnalytics.ts
import { useState, useEffect, useCallback } from 'react';

interface AnalyticsOverview {
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  content: {
    composers: number;
    works: number;
    scores: number;
    annotations: number;
  };
  engagement: {
    studySessions: number;
    avgSessionTime: number;
    totalStudyTime: number;
    annotationsPerDay: number;
  };
  system: {
    uploads: number;
    pendingModeration: number;
    errorRate: number;
    performance: number;
  };
}

interface AnalyticsCharts {
  userGrowthTrend: Array<{
    date: string;
    users: number;
    active: number;
    new: number;
  }>;
  contentDistribution: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  engagementMetrics: Array<{
    metric: string;
    value: number;
    trend: number;
  }>;
  topPerformers: {
    works: Array<{
      id: string;
      title: string;
      composer: string;
      favorites: number;
      sessions: number;
    }>;
    composers: Array<{
      id: string;
      name: string;
      works: number;
      favorites: number;
    }>;
    users: Array<{
      id: string;
      name: string;
      studyTime: number;
      annotations: number;
    }>;
  };
}

interface AnalyticsData {
  overview: AnalyticsOverview;
  charts: AnalyticsCharts;
  insights: {
    keyMetrics: Array<{
      metric: string;
      value: string;
      change: number;
      isPositive: boolean;
    }>;
    recommendations: Array<{
      type: 'warning' | 'info' | 'success';
      title: string;
      description: string;
      action?: string;
    }>;
  };
}

interface UseAdminAnalyticsReturn {
  analytics: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
  lastUpdated: Date | null;
}

export const useAdminAnalytics = (): UseAdminAnalyticsReturn => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/analytics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Acesso não autorizado');
        }
        if (response.status === 403) {
          throw new Error('Permissão negada');
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.analytics) {
        setAnalytics(data.analytics);
        setLastUpdated(new Date(data.timestamp));
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const refreshAnalytics = useCallback(async () => {
    return fetchAnalytics();
  }, [fetchAnalytics]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Auto-refresh a cada 10 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && analytics) {
        fetchAnalytics();
      }
    }, 10 * 60 * 1000); // 10 minutos

    return () => clearInterval(interval);
  }, [loading, analytics, fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics,
    lastUpdated,
  };
};
