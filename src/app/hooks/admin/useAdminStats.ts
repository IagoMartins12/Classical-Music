// app/hooks/admin/useAdminStats.ts - VERSÃO CORRIGIDA
import { useState, useEffect, useCallback, useRef } from 'react';

// Tipos mantidos iguais (copiando todos os tipos existentes)
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

export const useAdminStats = (): UseAdminStatsReturn => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 🔧 FIX: Use ref to track loading state and prevent multiple calls
  const isLoadingRef = useRef(false);
  const mountedRef = useRef(false);

  // 🔧 FIX: Stable fetchStats function without loading dependency
  const fetchStats = useCallback(
    async (section: string = 'all') => {
      // Prevent multiple simultaneous calls
      if (isLoadingRef.current) {
        console.log('Request already in progress, skipping...');
        return;
      }

      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`/api/admin/stats?section=${section}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Acesso não autorizado');
          }
          if (response.status === 403) {
            throw new Error('Permissão negada');
          }
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.stats) {
          // Garantir que todos os campos obrigatórios existem
          const cleanStats: AdminStats = {
            overview: {
              totalUsers: result.stats.overview?.totalUsers,
              totalComposers: result.stats.overview?.totalComposers,
              totalWorks: result.stats.overview?.totalWorks,
              totalScores: result.stats.overview?.totalScores,
              totalAnnotations: result.stats.overview?.totalAnnotations,
              growthRate: {
                users: result.stats.overview?.growthRate?.users,
                works: result.stats.overview?.growthRate?.works,
                annotations: result.stats.overview?.growthRate?.annotations,
              },
            },
            topUsers: {
              mostActive: result.stats.topUsers?.mostActive || [],
              topContributors: result.stats.topUsers?.topContributors || [],
              topAnnotators: result.stats.topUsers?.topAnnotators || [],
            },
            content: {
              popularWorks: result.stats.content?.popularWorks || [],
              popularComposers: result.stats.content?.popularComposers || [],
              recentUploads: result.stats.content?.recentUploads || [],
            },
            engagement: {
              dailyActiveUsers: result.stats.engagement?.dailyActiveUsers,
              weeklyActiveUsers: result.stats.engagement?.weeklyActiveUsers,
              monthlyActiveUsers: result.stats.engagement?.monthlyActiveUsers,
              avgSessionsPerUser: result.stats.engagement?.avgSessionsPerUser,
              avgAnnotationsPerWork:
                result.stats.engagement?.avgAnnotationsPerWork,
              mostStudiedWorks: result.stats.engagement?.mostStudiedWorks || [],
              annotationsTrends:
                result.stats.engagement?.annotationsTrends || [],
            },
            quality: {
              uploadApprovalRate: result.stats.quality?.uploadApprovalRate,
              avgUploadQuality: result.stats.quality?.avgUploadQuality,
              verifiedContent: {
                composers: result.stats.quality?.verifiedContent?.composers,
                works: result.stats.quality?.verifiedContent?.works,
                scores: result.stats.quality?.verifiedContent?.scores,
              },
              contentCompleteness: {
                composersWithBio:
                  result.stats.quality?.contentCompleteness?.composersWithBio ||
                  0,
                worksWithScores:
                  result.stats.quality?.contentCompleteness?.worksWithScores ||
                  0,
                avgScoresPerWork:
                  result.stats.quality?.contentCompleteness?.avgScoresPerWork ||
                  0,
              },
            },
            trends: {
              last30Days: {
                newUsers: result.stats.trends?.last30Days?.newUsers,
                newAnnotations: result.stats.trends?.last30Days?.newAnnotations,
                newUploads: result.stats.trends?.last30Days?.newUploads,
                studyMinutes: result.stats.trends?.last30Days?.studyMinutes,
              },
              last7Days: {
                newUsers: result.stats.trends?.last7Days?.newUsers,
                newAnnotations: result.stats.trends?.last7Days?.newAnnotations,
                newUploads: result.stats.trends?.last7Days?.newUploads,
                studyMinutes: result.stats.trends?.last7Days?.studyMinutes,
              },
              userRetention: {
                day1: result.stats.trends?.userRetention?.day1,
                day7: result.stats.trends?.userRetention?.day7,
                day30: result.stats.trends?.userRetention?.day30,
              },
            },
            moderation: result.stats.moderation || {
              pendingItems: 0,
              totalReports: 0,
              resolvedReports: 0,
              avgResolutionTime: 0,
            },
          };

          // 🔧 FIX: Only update if component is still mounted
          if (mountedRef.current) {
            setStats(cleanStats);
            console.log('CLEN', cleanStats);
            setLastUpdated(new Date());
          }
        } else {
          throw new Error('Resposta inválida do servidor');
        }
      } catch (err) {
        let errorMessage = 'Erro desconhecido';

        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            errorMessage = 'Timeout na requisição - tente novamente';
          } else {
            errorMessage = err.message;
          }
        }

        console.error('Erro ao buscar estatísticas do admin:', err);

        // 🔧 FIX: Only update error if component is still mounted
        if (mountedRef.current) {
          setError(errorMessage);
        }
      } finally {
        // 🔧 FIX: Always reset loading flags
        isLoadingRef.current = false;
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [] // 🔧 FIX: Empty dependency array - stable function
  );

  // 🔧 FIX: Stable refresh function
  const refreshStats = useCallback(async () => {
    return fetchStats('all');
  }, [fetchStats]);

  // 🔧 FIX: Stable fetchSection function
  const fetchSection = useCallback(
    async (section: string) => {
      return fetchStats(section);
    },
    [fetchStats]
  );

  // 🔧 FIX: Effect with proper cleanup and single execution
  useEffect(() => {
    mountedRef.current = true;

    // Only fetch if not already loading and no stats exist
    if (!isLoadingRef.current && !stats) {
      fetchStats('all');
    }

    // Cleanup function
    return () => {
      mountedRef.current = false;
    };
  }, []); // 🔧 FIX: Empty dependency array - run only once on mount

  return {
    stats,
    loading,
    error,
    refreshStats,
    fetchSection,
    lastUpdated,
  };
};

// Hook específico para seções individuais (simplificado e corrigido)
export const useAdminStatsSection = (section: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoadingRef = useRef(false);
  const mountedRef = useRef(false);

  // 🔧 FIX: Stable fetch function
  const fetchData = useCallback(async () => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`/api/admin/stats?section=${section}`, {
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro ao carregar seção ${section}`);
      }

      const result = await response.json();

      if (result.success && result.stats && mountedRef.current) {
        setData(result.stats[section] || result.stats);
      } else if (!result.success) {
        throw new Error('Resposta inválida');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';

      if (mountedRef.current) {
        setError(errorMessage);
      }
      console.error(`Erro ao buscar seção ${section}:`, err);
    } finally {
      isLoadingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [section]); // 🔧 FIX: Only section as dependency

  useEffect(() => {
    mountedRef.current = true;

    // Only fetch if not already loading
    if (!isLoadingRef.current) {
      fetchData();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [section]); // 🔧 FIX: Only re-run when section changes

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};
