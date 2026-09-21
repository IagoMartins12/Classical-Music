// app/hooks/admin/useAdminInsights.ts
import { useCallback, useState } from 'react';
import { adminKeys, useAdminQuery } from './query';
import { getAdminInsightsData } from '@/app/requests/admin/metrics';

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
/**
 * Insights pela API (`GET /admin/metrics/insights`). O legado gerava previsões,
 * anomalias e coortes com `Math.random`; a API mede com amostra declarada. Os
 * insights dela aparecem em "padrões" e no resumo; o resto fica vazio.
 */
export const useAdminInsights = (): UseAdminInsightsReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // A API calcula na hora; o TanStack guarda o resultado e revalida de vinte
  // em vinte minutos (o legado mantinha um `setInterval` sempre ligado).
  const insights = useAdminQuery(
    adminKeys.area('insights'),
    async () => {
      const startedAt = Date.now();
      const data = await getAdminInsightsData();
      setProcessingTime(Date.now() - startedAt);
      return data;
    },
    { refetchInterval: 20 * 60 * 1000 }
  );

  const refreshInsights = insights.refetch;

  // Não há previsão nem módulos na API: recalcular é buscar de novo.
  const recompute = useCallback(async () => {
    setIsGenerating(true);
    try {
      await insights.refetch();
    } finally {
      setIsGenerating(false);
    }
  }, [insights]);

  const generatePrediction = useCallback(
    async (_metric: string, _timeframe: string) => recompute(),
    [recompute]
  );

  const refreshModule = useCallback(
    async (_module: string) => recompute(),
    [recompute]
  );

  // Exporta o que a API devolveu, como JSON.
  const exportInsights = useCallback(async () => {
    const raw = insights.data?.raw;

    if (!raw) {
      setExportError('Nenhum insight disponível para exportar');
      return;
    }

    const blob = new Blob([JSON.stringify(raw, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `insights-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setExportError(null);
  }, [insights.data]);

  return {
    insights: (insights.data?.insights as AdvancedInsights) ?? null,
    loading: insights.loading,
    error: insights.error ?? exportError,
    refreshInsights,
    generatePrediction,
    refreshModule,
    exportInsights,
    lastUpdated: insights.data?.raw.generatedAt
      ? new Date(insights.data.raw.generatedAt)
      : insights.updatedAt,
    isGenerating,
    processingTime,
    version: 'api',
  };
};
