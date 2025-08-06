// app/hooks/admin/useAdminInsights.ts
import { useState, useEffect, useCallback } from 'react';

export interface PredictionInsight {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  timeframe: string;
  factors: string[];
  historicalData: Array<{ date: string; value: number }>;
}

export interface BehaviorPattern {
  pattern: string;
  description: string;
  prevalence: number;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  dataPoints: number;
  confidence: number;
  category: 'usage' | 'content' | 'engagement' | 'temporal';
}

export interface AnomalyDetection {
  type: 'spike' | 'drop' | 'unusual';
  metric: string;
  value: number;
  expectedRange: { min: number; max: number };
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  possibleCauses: string[];
  deviation: number; // % de desvio do normal
  affectedUsers?: number;
}

export interface CohortAnalysis {
  newUsers: Array<{
    cohort: string;
    size: number;
    retention: { day1: number; day7: number; day30: number };
    engagement: number;
    averageSessionTime: number;
    topActivities: string[];
  }>;
  cohortRetentionMatrix: Array<{
    cohort: string;
    periods: number[];
  }>;
}

export interface FeatureUsage {
  feature: string;
  usage: number;
  growth: number;
  userSegments: Array<{
    segment: string;
    usage: number;
    satisfaction?: number;
  }>;
  adoptionRate: number;
  churnRisk: number;
  recommendations: string[];
}

export interface ContentPerformance {
  topPerformers: Array<{
    type: 'composer' | 'work' | 'score';
    name: string;
    metrics: {
      views: number;
      favorites: number;
      studyTime: number;
      annotations: number;
      retention: number;
    };
    trend: number;
    growthFactors: string[];
  }>;
  underperformers: Array<{
    type: 'composer' | 'work' | 'score';
    name: string;
    issues: string[];
    suggestions: string[];
    potentialImpact: string;
  }>;
  contentOptimization: Array<{
    recommendation: string;
    expectedImpact: string;
    effort: 'low' | 'medium' | 'high';
    priority: number;
  }>;
}

export interface AdvancedInsights {
  predictions: PredictionInsight[];
  behaviorPatterns: BehaviorPattern[];
  anomalies: AnomalyDetection[];
  cohortAnalysis: CohortAnalysis;
  featureUsage: FeatureUsage[];
  contentPerformance: ContentPerformance;
  summary: {
    keyFindings: string[];
    actionItems: Array<{
      priority: 'high' | 'medium' | 'low';
      action: string;
      expectedImpact: string;
      timeframe: string;
    }>;
    healthScore: number; // 0-100
    trendDirection: 'positive' | 'negative' | 'stable';
  };
}

interface UseAdminInsightsReturn {
  insights: AdvancedInsights | null;
  loading: boolean;
  error: string | null;
  refreshInsights: () => Promise<void>;
  generatePrediction: (metric: string, timeframe: string) => Promise<void>;
  lastUpdated: Date | null;
  isGenerating: boolean;
}

export const useAdminInsights = (): UseAdminInsightsReturn => {
  const [insights, setInsights] = useState<AdvancedInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchInsights = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/insights', {
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

      if (data.success && data.insights) {
        setInsights(data.insights);
        setLastUpdated(new Date(data.timestamp));
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar insights:', err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const generatePrediction = useCallback(
    async (metric: string, timeframe: string) => {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'generate-prediction',
            metric,
            timeframe,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Refresh insights after generating new prediction
          await fetchInsights();
        } else {
          throw new Error(data.error || 'Erro ao gerar previsão');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error('Erro ao gerar previsão:', err);
      } finally {
        setIsGenerating(false);
      }
    },
    [fetchInsights]
  );

  const refreshInsights = useCallback(async () => {
    return fetchInsights();
  }, [fetchInsights]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchInsights();
  }, []);

  // Auto-refresh a cada 15 minutos (insights são computacionalmente mais pesados)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !isGenerating && insights) {
        fetchInsights();
      }
    }, 15 * 60 * 1000); // 15 minutos

    return () => clearInterval(interval);
  }, [loading, isGenerating, insights, fetchInsights]);

  return {
    insights,
    loading,
    error,
    refreshInsights,
    generatePrediction,
    lastUpdated,
    isGenerating,
  };
};
