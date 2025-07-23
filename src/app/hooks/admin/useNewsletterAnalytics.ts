// app/hooks/admin/useNewsletterAnalytics.ts
import { useState, useCallback } from 'react';

interface SubscriberAnalytics {
  total: number;
  active: number;
  pending: number;
  unsubscribed: number;
  growth: number;
  newLast7Days: number;
  newLast30Days: number;
  highEngagement: number;
  mediumEngagement: number;
  lowEngagement: number;
}

interface CampaignAnalytics {
  total: number;
  sent: number;
  draft: number;
  scheduled: number;
  totalSent: number;
  sentGrowth: number;
}

interface EngagementAnalytics {
  avgOpenRate: number;
  avgClickRate: number;
  avgDeliveryRate: number;
  avgBounceRate: number;
  avgUnsubscribeRate: number;
  openRateChange: number;
  clickRateChange: number;
}

interface NewsletterAnalytics {
  subscribers: SubscriberAnalytics;
  campaigns: CampaignAnalytics;
  engagement: EngagementAnalytics;
  topCampaigns: any[];
  recentActivity: any[];
  chartData: {
    subscriberGrowth: any[];
    engagementTrends: any[];
    campaignPerformance: any[];
  };
}

interface UseNewsletterAnalyticsReturn {
  analytics: NewsletterAnalytics | null;
  loading: boolean;
  error: string | null;
  dateRange: string;
  setDateRange: (range: string) => void;
  fetchAnalytics: () => Promise<void>;
  exportReport: () => Promise<void>;
}

export const useNewsletterAnalytics = (): UseNewsletterAnalyticsReturn => {
  const [analytics, setAnalytics] = useState<NewsletterAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30d');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/newsletter/analytics?range=${dateRange}`
      );
      const result = await response.json();

      if (result.success) {
        setAnalytics(result.analytics);
      } else {
        setError(result.error || 'Erro ao carregar analytics');
      }
    } catch (err) {
      console.error('Erro ao buscar analytics:', err);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const exportReport = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/newsletter/analytics/export?range=${dateRange}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsletter-analytics-${dateRange}-${
          new Date().toISOString().split('T')[0]
        }.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Erro no export');
      }
    } catch (err) {
      console.error('Erro ao exportar relatório:', err);
      throw err;
    }
  }, [dateRange]);

  return {
    analytics,
    loading,
    error,
    dateRange,
    setDateRange,
    fetchAnalytics,
    exportReport,
  };
};
