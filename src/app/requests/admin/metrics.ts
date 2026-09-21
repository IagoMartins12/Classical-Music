/**
 * Números do painel: visão geral, análises e insights (`/admin/metrics/*`,
 * `/admin/catalog/*`, `/admin/uploads/*`, `/uploads/moderation/stats`).
 *
 * O legado calculava na rota do Next dezenas de números, parte deles inventada
 * (`Math.random` nos insights, "saúde" sem medida). A API mede o que tem dado
 * para medir e diz o tamanho da amostra; o resto das telas fica zerado ou
 * vazio, em vez de mostrar número sem origem.
 */
import { apiFetch } from '@/app/libs/api/client';
import { displayName } from '@/app/requests/admin/common';

export interface MetricsOverview {
  generatedAt: string;
  usuarios: {
    total: number;
    ativosUltimos30Dias: number;
    novosUltimos30Dias: number;
    novosUltimos7Dias: number;
    onboardingConcluido: number;
    porPapel: Record<string, number>;
  };
  catalogo: {
    compositores: number;
    obras: number;
    partituras: number;
    obrasVerificadas: number;
  };
  portal: Record<string, number>;
  biblioteca: {
    favoritos: number;
    intencoes: number;
    conclusoes: number;
    anotacoes: number;
  };
}

export interface ApiInsight {
  code: string;
  severity:
    | 'critical'
    | 'warning'
    | 'opportunity'
    | 'healthy'
    | 'insufficient_data';
  title: string;
  detail: string;
  measurement: { value: number; unit: string; sampleSize: number };
  minimumSample: number;
  action: string;
  area?: string;
  evidence?: unknown[];
}

export interface MetricsInsights {
  generatedAt: string;
  areas: string[];
  summary: {
    total: number;
    bySeverity: Record<string, number>;
    needsAttention: number;
  };
  insights: ApiInsight[];
}

interface ModerationStats {
  byStatus: Record<string, number>;
  pending: { total: number; byEntityType?: Record<string, number> };
  period: {
    reported: number;
    resolved: number;
    avgResolutionHours: number | null;
    byCategory?: Record<string, number>;
  };
}

// Categoria da denúncia na API → o motivo que as telas do legado traduzem.
const REASON_BY_CATEGORY: Record<string, string> = {
  offensive: 'inappropriate_content',
  copyright: 'copyright_violation',
  wrong_data: 'false_information',
  spam: 'spam',
  duplicate: 'duplicate_content',
  other: 'other',
};

const noStore = { cache: 'no-store' as const };

export const getMetricsOverview = () =>
  apiFetch<MetricsOverview>('/admin/metrics/overview', noStore);

export const getMetricsInsights = () =>
  apiFetch<MetricsInsights>('/admin/metrics/insights', noStore);

export const getModerationStats = () =>
  apiFetch<ModerationStats>('/uploads/moderation/stats', noStore);

const getCatalogMetrics = () =>
  apiFetch<{
    totals: {
      composers: number;
      verifiedComposers: number;
      works: number;
      verifiedWorks: number;
      activeScores: number;
    };
  }>('/admin/catalog/metrics', noStore);

const getMostAnnotated = () =>
  apiFetch<
    {
      id: string;
      title: string;
      annotationsCount: number;
      composer: { name: string } | null;
    }[]
  >('/admin/catalog/most-annotated', noStore);

const getContributors = () =>
  apiFetch<{ userId: string; name: string; contributions: number }[]>(
    '/admin/uploads/contributors',
    noStore
  );

const getUploadStats = (days: number) =>
  apiFetch<{ total: number }>('/admin/uploads/stats', {
    query: { days },
    ...noStore,
  });

const ratio = (part: number, total: number, digits = 1) =>
  total ? Math.round((part / total) * 10 ** digits) / 10 ** digits : 0;

const statusCount = (byStatus: Record<string, number>, status: string) =>
  byStatus[status] ?? byStatus[status.toLowerCase()] ?? 0;

/** Estatísticas da página inicial do painel, no formato `AdminStats` do legado. */
export async function getAdminDashboardStats() {
  const [
    overview,
    catalog,
    mostAnnotated,
    contributors,
    moderation,
    week,
    month,
    recent,
  ] = await Promise.all([
    getMetricsOverview(),
    getCatalogMetrics(),
    getMostAnnotated(),
    getContributors(),
    getModerationStats(),
    getUploadStats(7),
    getUploadStats(30),
    apiFetch<{
      entries: {
        id: string;
        entityType: string;
        entityId: string;
        createdAt: string;
        user: { firstName: string | null; lastName: string | null } | null;
        entity: Record<string, unknown> | null;
      }[];
    }>('/admin/uploads', { query: { page: 1, limit: 5 }, ...noStore }),
  ]);
  const { usuarios, catalogo, biblioteca } = overview;

  return {
    overview: {
      totalUsers: usuarios.total,
      totalComposers: catalogo.compositores,
      totalWorks: catalogo.obras,
      totalScores: catalogo.partituras,
      totalAnnotations: biblioteca.anotacoes,
      growthRate: { users: 0, works: 0, annotations: 0 },
    },
    topUsers: {
      mostActive: [],
      topContributors: contributors.map((contributor) => ({
        id: contributor.userId,
        name: contributor.name,
        uploadsCount: contributor.contributions,
        qualityScore: 0,
      })),
      topAnnotators: [],
    },
    content: {
      popularWorks: mostAnnotated.map((work) => ({
        id: work.id,
        title: work.title,
        composer: work.composer?.name ?? '',
        favoritesCount: 0,
        annotationsCount: work.annotationsCount,
        scoreCount: 0,
      })),
      popularComposers: [],
      recentUploads: recent.entries.map((entry) => ({
        id: entry.id,
        type: entry.entityType,
        title: String(
          entry.entity?.title ??
            entry.entity?.name ??
            `${entry.entityType} ${entry.entityId}`
        ),
        uploader: entry.user ? displayName(entry.user) : '',
        uploadDate: new Date(entry.createdAt),
        quality: '',
        verified: false,
      })),
    },
    engagement: {
      dailyActiveUsers: 0,
      weeklyActiveUsers: 0,
      monthlyActiveUsers: usuarios.ativosUltimos30Dias,
      avgSessionsPerUser: 0,
      avgAnnotationsPerWork: ratio(biblioteca.anotacoes, catalogo.obras, 2),
      mostStudiedWorks: [],
      annotationsTrends: [],
    },
    quality: {
      uploadApprovalRate: 0,
      avgUploadQuality: 0,
      verifiedContent: {
        composers: catalog.totals.verifiedComposers,
        works: catalog.totals.verifiedWorks,
        scores: catalog.totals.activeScores,
      },
      contentCompleteness: {
        composersWithBio: 0,
        worksWithScores: 0,
        avgScoresPerWork: ratio(catalogo.partituras, catalogo.obras),
      },
    },
    trends: {
      last30Days: {
        newUsers: usuarios.novosUltimos30Dias,
        newAnnotations: 0,
        newUploads: month.total,
        studyMinutes: 0,
      },
      last7Days: {
        newUsers: usuarios.novosUltimos7Dias,
        newAnnotations: 0,
        newUploads: week.total,
        studyMinutes: 0,
      },
      userRetention: { day1: 0, day7: 0, day30: 0 },
    },
    moderation: {
      pendingItems: moderation.pending.total,
      totalReports: moderation.period.reported,
      resolvedReports: moderation.period.resolved,
      avgResolutionTime: moderation.period.avgResolutionHours ?? 0,
    },
  };
}

const RECOMMENDATION_TYPE: Record<string, 'warning' | 'info' | 'success'> = {
  critical: 'warning',
  warning: 'warning',
  opportunity: 'info',
  healthy: 'success',
  insufficient_data: 'info',
};

/** A página de análises, remontada sobre a visão geral e os insights da API. */
export async function getAdminAnalyticsData() {
  const [overview, insights, mostAnnotated, moderation, month, userAnalytics] =
    await Promise.all([
      getMetricsOverview(),
      getMetricsInsights(),
      getMostAnnotated(),
      getModerationStats(),
      getUploadStats(30),
      apiFetch<{ growthRate: number | null }>('/admin/users/analytics', {
        query: { period: '30d' },
        ...noStore,
      }),
    ]);
  const { usuarios, catalogo, biblioteca } = overview;
  const contentTotal =
    catalogo.compositores +
    catalogo.obras +
    catalogo.partituras +
    biblioteca.anotacoes;
  const content = [
    { name: 'Compositores', value: catalogo.compositores },
    { name: 'Obras', value: catalogo.obras },
    { name: 'Partituras', value: catalogo.partituras },
    { name: 'Anotações', value: biblioteca.anotacoes },
  ];

  return {
    overview: {
      users: {
        total: usuarios.total,
        active: usuarios.ativosUltimos30Dias,
        new: usuarios.novosUltimos30Dias,
        growth: userAnalytics.growthRate ?? 0,
      },
      content: {
        composers: catalogo.compositores,
        works: catalogo.obras,
        scores: catalogo.partituras,
        annotations: biblioteca.anotacoes,
      },
      engagement: {
        avgSessionTime: 0,
        annotationsPerDay: 0,
        avgAnnotationsPerUser: ratio(biblioteca.anotacoes, usuarios.total, 2),
        activePercentage: ratio(
          usuarios.ativosUltimos30Dias * 100,
          usuarios.total
        ),
      },
      system: {
        uploads: month.total,
        pendingModeration: moderation.pending.total,
        errorRate: 0,
        performance: 0,
      },
    },
    charts: {
      userGrowthTrend: [],
      contentDistribution: content.map((item) => ({
        ...item,
        percentage: ratio(item.value * 100, contentTotal),
      })),
      engagementMetrics: [
        {
          metric: 'Usuários ativos (30 dias)',
          value: usuarios.ativosUltimos30Dias,
          trend: 0,
        },
        {
          metric: 'Novos usuários (30 dias)',
          value: usuarios.novosUltimos30Dias,
          trend: 0,
        },
        { metric: 'Favoritos', value: biblioteca.favoritos, trend: 0 },
        { metric: 'Quero aprender', value: biblioteca.intencoes, trend: 0 },
        { metric: 'Já aprendi', value: biblioteca.conclusoes, trend: 0 },
      ],
      topPerformers: {
        works: mostAnnotated.map((work) => ({
          id: work.id,
          title: work.title,
          composer: work.composer?.name ?? '',
          favorites: 0,
          sessions: work.annotationsCount,
        })),
        composers: [],
        users: [],
      },
    },
    insights: {
      keyMetrics: [
        {
          metric: 'Usuários',
          value: String(usuarios.total),
          change: 0,
          isPositive: true,
        },
        {
          metric: 'Obras',
          value: String(catalogo.obras),
          change: 0,
          isPositive: true,
        },
        {
          metric: 'Anotações',
          value: String(biblioteca.anotacoes),
          change: 0,
          isPositive: true,
        },
      ],
      recommendations: insights.insights
        .filter((insight) => insight.severity !== 'healthy')
        .map((insight) => ({
          type: RECOMMENDATION_TYPE[insight.severity] ?? 'info',
          title: insight.title,
          description: insight.detail,
          action: insight.action,
        })),
    },
  };
}

const IMPACT: Record<string, 'high' | 'medium' | 'low'> = {
  critical: 'high',
  warning: 'medium',
  opportunity: 'medium',
  healthy: 'low',
  insufficient_data: 'low',
};

const CATEGORY: Record<
  string,
  'usage' | 'content' | 'engagement' | 'temporal'
> = {
  usuarios: 'usage',
  users: 'usage',
  catalogo: 'content',
  content: 'content',
  engajamento: 'engagement',
  engagement: 'engagement',
};

/**
 * Insights no formato da página de insights. Os da API vão em "padrões de
 * comportamento" e no resumo; previsões, anomalias, coortes, jornadas e
 * monetização não têm medida na API e ficam vazios.
 */
export async function getAdminInsightsData() {
  const data = await getMetricsInsights();
  const healthy = data.summary.bySeverity.healthy ?? 0;
  const measured =
    data.summary.total - (data.summary.bySeverity.insufficient_data ?? 0);

  return {
    raw: data,
    insights: {
      predictions: [],
      behaviorPatterns: data.insights.map((insight) => ({
        pattern: insight.title,
        description: insight.detail,
        prevalence: insight.measurement.value,
        impact: IMPACT[insight.severity] ?? 'low',
        recommendation: insight.action,
        dataPoints: insight.measurement.sampleSize,
        confidence:
          insight.measurement.sampleSize >= insight.minimumSample ? 100 : 0,
        category: CATEGORY[String(insight.area ?? '').toLowerCase()] ?? 'usage',
      })),
      anomalies: [],
      cohortAnalysis: { newUsers: [], cohortRetentionMatrix: [] },
      featureUsage: [],
      contentPerformance: {
        topPerformers: [],
        underperformers: [],
        contentOptimization: [],
      },
      educationalEngagement: {
        learningProgressions: [],
        composerDiscoveryPatterns: [],
        annotationQualityMetrics: {
          avgHelpfulnessScore: 0,
          topContributors: [],
          qualityTrends: [],
        },
        studySessionAnalysis: {
          optimalSessionLength: 0,
          peakStudyTimes: [],
          weeklyPatterns: {},
          seasonalTrends: {},
        },
      },
      userJourneyAnalysis: {
        typicalJourneys: [],
        conversionFunnels: [],
        userSegments: [],
      },
      riskAssessment: {
        churnRiskUsers: [],
        contentRisks: [],
        systemHealthIndicators: [],
      },
      growthOpportunities: [],
      monetizationInsights: {
        adPerformance: {
          overallCTR: 0,
          revenuePerUser: 0,
          topPerformingAds: [],
          underperformingSegments: [],
        },
        userValueSegmentation: [],
        monetizationOpportunities: [],
      },
      summary: {
        keyFindings: data.insights
          .filter((insight) => insight.severity !== 'insufficient_data')
          .map((insight) => insight.title),
        actionItems: data.insights
          .filter((insight) =>
            ['critical', 'warning', 'opportunity'].includes(insight.severity)
          )
          .map((insight) => ({
            priority: (insight.severity === 'critical'
              ? 'high'
              : insight.severity === 'warning'
                ? 'medium'
                : 'low') as 'high' | 'medium' | 'low',
            action: insight.action,
            expectedImpact: insight.detail,
            timeframe: '',
          })),
        healthScore: measured > 0 ? Math.round((healthy / measured) * 100) : 0,
        trendDirection: 'stable' as const,
      },
    },
  };
}

/**
 * Contagem de denúncias (moderação de contribuições da API), com o detalhe por
 * tipo (as pendentes) e por motivo (as do período), no formato do painel.
 */
export async function getReportCounts() {
  const stats = await getModerationStats();

  return {
    stats: {
      totalReports: Object.values(stats.byStatus).reduce(
        (sum, count) => sum + count,
        0
      ),
      pendingReports: stats.pending.total,
      approvedReports: statusCount(stats.byStatus, 'APPROVED'),
      rejectedReports: statusCount(stats.byStatus, 'REJECTED'),
    },
    reportsByType: Object.entries(stats.pending.byEntityType ?? {}).map(
      ([entityType, count]) => ({ entityType, _count: { id: count } })
    ),
    reportsByReason: Object.entries(stats.period.byCategory ?? {}).map(
      ([category, count]) => ({
        reason: REASON_BY_CATEGORY[category] ?? category,
        _count: { id: count },
      })
    ),
  };
}
