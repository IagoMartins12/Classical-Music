// app/hooks/admin/useNewsletterAnalytics.ts
import { useCallback, useState } from 'react';
import { adminKeys, useAdminQuery } from './query';
import {
  exportNewsletterAnalytics,
  getNewsletterAnalyticsRequest,
} from '@/app/requests/admin/newsletter';

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

/** Análises da newsletter, por período, guardadas pelo TanStack Query. */
export const useNewsletterAnalytics = (): UseNewsletterAnalyticsReturn => {
  const [dateRange, setDateRange] = useState('30d');

  const analytics = useAdminQuery(
    adminKeys.list('newsletter-analytics', dateRange),
    () => getNewsletterAnalyticsRequest(dateRange)
  );

  // A exportação da API é CSV (o legado nomeava .pdf).
  const exportReport = useCallback(async () => {
    try {
      await exportNewsletterAnalytics(dateRange);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      throw error;
    }
  }, [dateRange]);

  return {
    analytics: analytics.data ?? null,
    loading: analytics.loading,
    error: analytics.error,
    dateRange,
    setDateRange,
    fetchAnalytics: analytics.refetch,
    exportReport,
  };
};
