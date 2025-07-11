// app/hooks/useAdminInsights.ts
import { useState, useEffect, useCallback } from 'react';

export interface PredictionInsight {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  timeframe: string;
  factors: string[];
}

export interface BehaviorPattern {
  pattern: string;
  description: string;
  prevalence: number;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface AnomalyDetection {
  type: 'spike' | 'drop' | 'unusual';
  metric: string;
  value: number;
  expectedRange: { min: number; max: number };
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  possibleCauses: string[];
}

export interface AdvancedAnalytics {
  predictions: PredictionInsight[];
  behaviorPatterns: BehaviorPattern[];
  anomalies: AnomalyDetection[];
  cohortAnalysis: {
    newUsers: Array<{
      cohort: string;
      size: number;
      retention: { day1: number; day7: number; day30: number };
      engagement: number;
    }>;
  };
  featureUsage: Array<{
    feature: string;
    usage: number;
    growth: number;
    userSegments: Array<{ segment: string; usage: number }>;
  }>;
  contentPerformance: {
    topPerformers: Array<{
      type: 'composer' | 'work' | 'score';
      name: string;
      metrics: { views: number; favorites: number; studyTime: number };
      trend: number;
    }>;
    underperformers: Array<{
      type: 'composer' | 'work' | 'score';
      name: string;
      issues: string[];
      suggestions: string[];
    }>;
  };
}

interface UseAdminInsightsReturn {
  analytics: AdvancedAnalytics | null;
  loading: boolean;
  error: string | null;
  refreshData: (type?: string) => Promise<void>;
}

export const useAdminInsights = (): UseAdminInsightsReturn => {
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (type: string = 'all') => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      if (type !== 'all') {
        searchParams.set('type', type);
      }

      const response = await fetch(`/api/admin/insights?${searchParams}`);

      if (!response.ok) {
        throw new Error('Erro ao carregar insights');
      }

      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar insights:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(
    async (type?: string) => {
      return fetchData(type);
    },
    [fetchData]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    analytics,
    loading,
    error,
    refreshData,
  };
};
