// app/hooks/admin/useAdminStats.ts - VERSÃO CORRIGIDA
import { adminKeys, useAdminQuery } from './query';
import { getAdminDashboardStats } from '@/app/requests/admin/metrics';

export interface AdminOverviewStats {
  totalUsers: number;
  totalComposers: number;
  totalWorks: number;
  totalScores: number;
  totalAnnotations: number;
  growthRate: {
    users: number;
    works: number;
    annotations: number;
  };
}

export interface TopUser {
  id: string;
  name: string;
  email?: string;
  annotationsCount: number;
  uploadsCount: number;
  lastActive: Date;
}

export interface TopContributor {
  id: string;
  name: string;
  uploadsCount: number;
  qualityScore: number;
}

export interface TopAnnotator {
  id: string;
  name: string;
  annotationsCount: number;
  helpfulAnnotationsCount: number;
  avgHelpfulRatio?: number;
}

export interface PopularWork {
  id: string;
  title: string;
  composer: string;
  favoritesCount: number;
  annotationsCount: number;
  scoreCount: number;
}

export interface PopularComposer {
  id: string;
  name: string;
  worksCount: number;
  totalFavorites: number;
  avgWorksPerUser: number;
}

export interface RecentUpload {
  id: string;
  type: string;
  title: string;
  uploader: string;
  uploadDate: Date;
  quality: string;
  verified: boolean;
}

export interface EngagementStats {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  avgSessionsPerUser: number;
  avgAnnotationsPerWork: number;
  mostStudiedWorks: Array<{
    workId: string;
    title: string;
    composer: string;
    totalMinutes: number;
    uniqueUsers: number;
  }>;
  annotationsTrends: Array<{
    date: string;
    count: number;
    helpfulCount: number;
  }>;
}

export interface QualityStats {
  uploadApprovalRate: number;
  avgUploadQuality: number;
  verifiedContent: {
    composers: number;
    works: number;
    scores: number;
  };
  contentCompleteness: {
    composersWithBio: number;
    worksWithScores: number;
    avgScoresPerWork: number;
  };
}

export interface TrendStats {
  last30Days: {
    newUsers: number;
    newAnnotations: number;
    newUploads: number;
    studyMinutes: number;
  };
  last7Days: {
    newUsers: number;
    newAnnotations: number;
    newUploads: number;
    studyMinutes: number;
  };
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
}

export interface ModerationStats {
  pendingItems: number;
  totalReports: number;
  resolvedReports: number;
  avgResolutionTime: number;
}

export interface AdminStats {
  overview: AdminOverviewStats;
  topUsers: {
    mostActive: TopUser[];
    topContributors: TopContributor[];
    topAnnotators: TopAnnotator[];
  };
  content: {
    popularWorks: PopularWork[];
    popularComposers: PopularComposer[];
    recentUploads: RecentUpload[];
  };
  engagement: EngagementStats;
  quality: QualityStats;
  trends: TrendStats;
  moderation?: ModerationStats;
}

interface UseAdminStatsReturn {
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  fetchSection: (section: string) => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * Números do painel. Uma consulta só, guardada pelo TanStack Query: as telas
 * que pedem uma seção leem o mesmo dado (o legado fazia uma chamada por
 * seção, e um `useRef` tentava evitar as repetidas).
 */
export const useAdminStats = (): UseAdminStatsReturn => {
  const stats = useAdminQuery(
    adminKeys.area('dashboard-stats'),
    getAdminDashboardStats
  );

  return {
    stats: stats.data ?? null,
    loading: stats.loading,
    error: stats.error,
    refreshStats: stats.refetch,
    // Pedir uma seção é revalidar a mesma consulta.
    fetchSection: async () => {
      await stats.refetch();
    },
    lastUpdated: stats.updatedAt,
  };
};

// Uma seção dos números do painel (a consulta é a mesma; muda o recorte).
export const useAdminStatsSection = (section: string) => {
  const stats = useAdminQuery(
    adminKeys.area('dashboard-stats'),
    getAdminDashboardStats
  );

  return {
    data: stats.data
      ? ((stats.data as Record<string, unknown>)[section] ?? stats.data)
      : null,
    loading: stats.loading,
    error: stats.error,
    refetch: stats.refetch,
  };
};
