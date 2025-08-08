// app/hooks/admin/useAdminInsights.ts
import { useState, useEffect, useCallback } from 'react';

// ===== INTERFACES ATUALIZADAS =====
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
  deviation: number;
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

// ===== NOVAS INTERFACES AVANÇADAS =====
export interface EducationalEngagement {
  learningProgressions: Array<{
    pathway: string;
    successRate: number;
    avgTimeToComplete: number;
    dropoffPoints: string[];
    recommendations: string[];
  }>;
  composerDiscoveryPatterns: Array<{
    epoch: string;
    gatewayComposers: string[];
    progressionMap: Record<string, string[]>;
    conversionRate: number;
  }>;
  annotationQualityMetrics: {
    avgHelpfulnessScore: number;
    topContributors: Array<{
      userId: string;
      username: string;
      qualityScore: number;
      totalAnnotations: number;
    }>;
    qualityTrends: Array<{
      month: string;
      avgQuality: number;
      volume: number;
    }>;
  };
  studySessionAnalysis: {
    optimalSessionLength: number;
    peakStudyTimes: string[];
    weeklyPatterns: Record<string, number>;
    seasonalTrends: Record<string, number>;
  };
}

export interface UserJourneyAnalysis {
  typicalJourneys: Array<{
    userType: string;
    stages: Array<{
      stage: string;
      avgDuration: number;
      completionRate: number;
      dropoffFactors: string[];
    }>;
    successFactors: string[];
    recommendations: string[];
  }>;
  conversionFunnels: Array<{
    from: string;
    to: string;
    conversionRate: number;
    timeToConvert: number;
    improvementOpportunities: string[];
  }>;
  userSegments: Array<{
    segment: string;
    size: number;
    characteristics: string[];
    engagementLevel: number;
    revenueContribution: number;
    growthPotential: string;
  }>;
}

export interface RiskAssessment {
  churnRiskUsers: Array<{
    userId: string;
    username: string;
    riskScore: number;
    riskFactors: string[];
    lastActivity: Date;
    suggestedActions: string[];
  }>;
  contentRisks: Array<{
    type: 'composer' | 'work' | 'epoch';
    entityId: string;
    entityName: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    issues: string[];
    impact: string;
    recommendations: string[];
  }>;
  systemHealthIndicators: Array<{
    metric: string;
    currentValue: number;
    healthyRange: { min: number; max: number };
    status: 'healthy' | 'warning' | 'critical';
    trend: 'improving' | 'stable' | 'declining';
  }>;
}

export interface GrowthOpportunity {
  opportunity: string;
  category: 'user_acquisition' | 'engagement' | 'retention' | 'monetization';
  impact: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  expectedResults: string[];
  implementation: string[];
  metrics: string[];
}

export interface MonetizationInsights {
  adPerformance: {
    overallCTR: number;
    revenuePerUser: number;
    topPerformingAds: Array<{
      adId: string;
      title: string;
      ctr: number;
      revenue: number;
      targetSegment: string;
    }>;
    underperformingSegments: Array<{
      segment: string;
      issues: string[];
      recommendations: string[];
    }>;
  };
  userValueSegmentation: Array<{
    segment: string;
    userCount: number;
    avgRevenue: number;
    engagementScore: number;
    growthPotential: string;
  }>;
  monetizationOpportunities: Array<{
    opportunity: string;
    estimatedRevenue: string;
    requiredInvestment: string;
    feasibility: string;
  }>;
}

export interface AdvancedInsights {
  predictions: PredictionInsight[];
  behaviorPatterns: BehaviorPattern[];
  anomalies: AnomalyDetection[];
  cohortAnalysis: CohortAnalysis;
  featureUsage: FeatureUsage[];
  contentPerformance: ContentPerformance;
  educationalEngagement: EducationalEngagement;
  userJourneyAnalysis: UserJourneyAnalysis;
  riskAssessment: RiskAssessment;
  growthOpportunities: GrowthOpportunity[];
  monetizationInsights: MonetizationInsights;
  summary: {
    keyFindings: string[];
    actionItems: Array<{
      priority: 'high' | 'medium' | 'low';
      action: string;
      expectedImpact: string;
      timeframe: string;
    }>;
    healthScore: number;
    trendDirection: 'positive' | 'negative' | 'stable';
  };
}

// ===== HOOK INTERFACE =====
interface UseAdminInsightsReturn {
  insights: AdvancedInsights | null;
  loading: boolean;
  error: string | null;
  refreshInsights: () => Promise<void>;
  generatePrediction: (metric: string, timeframe: string) => Promise<void>;
  refreshModule: (module: string) => Promise<void>;
  exportInsights: () => Promise<void>;
  lastUpdated: Date | null;
  isGenerating: boolean;
  processingTime: number | null;
  version: string;
}

// ===== HOOK IMPLEMENTATION =====
export const useAdminInsights = (): UseAdminInsightsReturn => {
  const [insights, setInsights] = useState<AdvancedInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [version, setVersion] = useState('2.0-advanced');

  // ===== FETCH INSIGHTS FUNCTION =====
  const fetchInsights = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🧠 Buscando insights avançados...');
      const fetchStartTime = Date.now();

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
        setProcessingTime(data.processingTime || null);
        setVersion(data.version || '2.0-advanced');

        const fetchTime = Date.now() - fetchStartTime;
        console.log(
          `✅ Insights carregados em ${fetchTime}ms (processamento: ${data.processingTime}ms)`
        );
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('💥 Erro ao buscar insights:', err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // ===== GENERATE PREDICTION =====
  const generatePrediction = useCallback(
    async (metric: string, timeframe: string) => {
      setIsGenerating(true);
      setError(null);

      try {
        console.log(`🔮 Gerando previsão para ${metric} (${timeframe})`);

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
          console.log('✅ Previsão gerada, atualizando insights...');
          // Refresh insights after generating new prediction
          await fetchInsights();
        } else {
          throw new Error(data.error || 'Erro ao gerar previsão');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error('💥 Erro ao gerar previsão:', err);
      } finally {
        setIsGenerating(false);
      }
    },
    [fetchInsights]
  );

  // ===== REFRESH MODULE =====
  const refreshModule = useCallback(
    async (module: string) => {
      setIsGenerating(true);
      setError(null);

      try {
        console.log(`🔄 Atualizando módulo: ${module}`);

        const response = await fetch('/api/admin/insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'refresh-module',
            module,
          }),
        });

        const data = await response.json();

        if (data.success) {
          console.log(`✅ Módulo ${module} atualizado`);
          // Refresh all insights after module update
          await fetchInsights();
        } else {
          throw new Error(data.error || 'Erro ao atualizar módulo');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error(`💥 Erro ao atualizar módulo ${module}:`, err);
      } finally {
        setIsGenerating(false);
      }
    },
    [fetchInsights]
  );

  // ===== EXPORT INSIGHTS =====
  const exportInsights = useCallback(async () => {
    if (!insights) {
      setError('Nenhum insight disponível para exportar');
      return;
    }

    try {
      console.log('📥 Exportando insights...');

      const response = await fetch('/api/admin/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'export-insights',
        }),
      });

      const data = await response.json();

      if (data.success && data.exportData) {
        // Create and download the file
        const jsonContent = JSON.stringify(data.exportData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `insights-advanced-${
          new Date().toISOString().split('T')[0]
        }.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
        console.log('✅ Insights exportados com sucesso');
      } else {
        throw new Error(data.error || 'Erro ao exportar insights');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('💥 Erro ao exportar insights:', err);
    }
  }, [insights]);

  // ===== REFRESH INSIGHTS =====
  const refreshInsights = useCallback(async () => {
    return fetchInsights();
  }, [fetchInsights]);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    console.log('🚀 Inicializando hook de insights avançados...');
    fetchInsights();
  }, []);

  // ===== AUTO-REFRESH (mais inteligente) =====
  useEffect(() => {
    // Auto-refresh mais inteligente baseado no tipo de dados
    const intervals = {
      short: 10 * 60 * 1000, // 10 minutos para dados críticos
      medium: 20 * 60 * 1000, // 20 minutos para dados normais
      long: 30 * 60 * 1000, // 30 minutos para dados pesados
    };

    // Usar intervalo médio por padrão
    const interval = setInterval(() => {
      if (!loading && !isGenerating && insights) {
        console.log('🔄 Auto-refresh dos insights...');
        fetchInsights();
      }
    }, intervals.medium);

    return () => clearInterval(interval);
  }, [loading, isGenerating, insights, fetchInsights]);

  // ===== PERFORMANCE MONITORING =====
  useEffect(() => {
    if (insights && processingTime) {
      // Log performance metrics for monitoring
      console.log('📊 Performance Metrics:', {
        processingTime,
        predictionsCount: insights.predictions?.length || 0,
        anomaliesCount: insights.anomalies?.length || 0,
        riskUsersCount: insights.riskAssessment?.churnRiskUsers?.length || 0,
        opportunitiesCount: insights.growthOpportunities?.length || 0,
        healthScore: insights.summary?.healthScore || 0,
        version,
      });
    }
  }, [insights, processingTime, version]);

  // ===== ERROR RECOVERY =====
  useEffect(() => {
    if (error) {
      // Auto-retry after error with exponential backoff
      const retryTimeout = setTimeout(() => {
        if (error && !loading && !isGenerating) {
          console.log('🔄 Tentando recuperar de erro...');
          setError(null);
          fetchInsights();
        }
      }, 30000); // Retry after 30 seconds

      return () => clearTimeout(retryTimeout);
    }
  }, [error, loading, isGenerating, fetchInsights]);

  return {
    insights,
    loading,
    error,
    refreshInsights,
    generatePrediction,
    refreshModule,
    exportInsights,
    lastUpdated,
    isGenerating,
    processingTime,
    version,
  };
};
