// app/hooks/admin/useAdminAnalytics.ts
import { adminKeys, useAdminQuery } from './query';
import { getAdminAnalyticsData } from '@/app/requests/admin/metrics';

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
    avgSessionTime: number;
    annotationsPerDay: number;
    avgAnnotationsPerUser: number;
    activePercentage: number;
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

/**
 * Painel de análises. Estado de servidor do TanStack Query, com a atualização
 * automática de dez em dez minutos que a tela já tinha — sem o `setInterval`
 * que disparava mesmo com a aba escondida.
 */
export const useAdminAnalytics = (): UseAdminAnalyticsReturn => {
  const analytics = useAdminQuery(
    adminKeys.area('analytics'),
    getAdminAnalyticsData,
    { refetchInterval: 10 * 60 * 1000 }
  );

  return {
    analytics: analytics.data ?? null,
    loading: analytics.loading,
    error: analytics.error,
    refreshAnalytics: analytics.refetch,
    lastUpdated: analytics.updatedAt,
  };
};
