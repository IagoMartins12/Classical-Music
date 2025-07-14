// app/hooks/admin/useAdminStats.ts
import { useState, useEffect, useCallback } from 'react';

export interface AdminOverviewStats {
  totalUsers: number;
  totalComposers: number;
  totalWorks: number;
  totalScores: number;
  totalAnnotations: number;
  totalStudySessions: number;
  averageSessionDuration: number;
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
  totalStudyTime: number;
  annotationsCount: number;
  uploadsCount: number;
  lastActive: Date;
}

export interface TopContributor {
  id: string;
  name: string;
  uploadsCount: number;
  qualityScore: number;
  verifiedUploads: number;
}

export interface TopAnnotator {
  id: string;
  name: string;
  annotationsCount: number;
  helpfulAnnotationsCount: number;
  avgHelpfulRatio: number;
}

export interface PopularWork {
  id: string;
  title: string;
  composer: string;
  favoritesCount: number;
  annotationsCount: number;
  studySessionsCount: number;
  scoreCount: number;
}

export interface PopularComposer {
  id: string;
  name: string;
  worksCount: number;
  totalFavorites: number;
  totalStudySessions: number;
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

  const fetchStats = useCallback(
    async (section: string = 'all') => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        // Buscar estatísticas principais e de moderação em paralelo
        const [statsResponse] = await Promise.all([
          fetch(`/api/admin/stats?section=${section}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          }),
        ]);

        if (!statsResponse.ok) {
          if (statsResponse.status === 401) {
            throw new Error('Acesso não autorizado');
          }
          if (statsResponse.status === 403) {
            throw new Error('Permissão negada');
          }
          throw new Error(
            `Erro ${statsResponse.status}: ${statsResponse.statusText}`
          );
        }

        const [statsData] = await Promise.all([statsResponse.json()]);

        if (statsData.success && statsData.stats) {
          if (section === 'all') {
            // Garantir que não há dados mockados ou undefined
            const cleanStats: AdminStats = {
              overview: {
                totalUsers: statsData.stats.overview?.totalUsers || 0,
                totalComposers: statsData.stats.overview?.totalComposers || 0,
                totalWorks: statsData.stats.overview?.totalWorks || 0,
                totalScores: statsData.stats.overview?.totalScores || 0,
                totalAnnotations:
                  statsData.stats.overview?.totalAnnotations || 0,
                totalStudySessions:
                  statsData.stats.overview?.totalStudySessions || 0,
                averageSessionDuration:
                  statsData.stats.overview?.averageSessionDuration || 0,
                growthRate: {
                  users: statsData.stats.overview?.growthRate?.users || 0,
                  works: statsData.stats.overview?.growthRate?.works || 0,
                  annotations:
                    statsData.stats.overview?.growthRate?.annotations || 0,
                },
              },
              topUsers: {
                mostActive: statsData.stats.topUsers?.mostActive || [],
                topContributors:
                  statsData.stats.topUsers?.topContributors || [],
                topAnnotators: statsData.stats.topUsers?.topAnnotators || [],
              },
              content: {
                popularWorks: statsData.stats.content?.popularWorks || [],
                popularComposers:
                  statsData.stats.content?.popularComposers || [],
                recentUploads: statsData.stats.content?.recentUploads || [],
              },
              engagement: {
                dailyActiveUsers:
                  statsData.stats.engagement?.dailyActiveUsers || 0,
                weeklyActiveUsers:
                  statsData.stats.engagement?.weeklyActiveUsers || 0,
                monthlyActiveUsers:
                  statsData.stats.engagement?.monthlyActiveUsers || 0,
                avgSessionsPerUser:
                  statsData.stats.engagement?.avgSessionsPerUser || 0,
                avgAnnotationsPerWork:
                  statsData.stats.engagement?.avgAnnotationsPerWork || 0,
                mostStudiedWorks:
                  statsData.stats.engagement?.mostStudiedWorks || [],
                annotationsTrends:
                  statsData.stats.engagement?.annotationsTrends || [],
              },
              quality: {
                uploadApprovalRate:
                  statsData.stats.quality?.uploadApprovalRate || 0,
                avgUploadQuality:
                  statsData.stats.quality?.avgUploadQuality || 0,
                verifiedContent: {
                  composers:
                    statsData.stats.quality?.verifiedContent?.composers || 0,
                  works: statsData.stats.quality?.verifiedContent?.works || 0,
                  scores: statsData.stats.quality?.verifiedContent?.scores || 0,
                },
                contentCompleteness: {
                  composersWithBio:
                    statsData.stats.quality?.contentCompleteness
                      ?.composersWithBio || 0,
                  worksWithScores:
                    statsData.stats.quality?.contentCompleteness
                      ?.worksWithScores || 0,
                  avgScoresPerWork:
                    statsData.stats.quality?.contentCompleteness
                      ?.avgScoresPerWork || 0,
                },
              },
              trends: {
                last30Days: {
                  newUsers: statsData.stats.trends?.last30Days?.newUsers || 0,
                  newAnnotations:
                    statsData.stats.trends?.last30Days?.newAnnotations || 0,
                  newUploads:
                    statsData.stats.trends?.last30Days?.newUploads || 0,
                  studyMinutes:
                    statsData.stats.trends?.last30Days?.studyMinutes || 0,
                },
                last7Days: {
                  newUsers: statsData.stats.trends?.last7Days?.newUsers || 0,
                  newAnnotations:
                    statsData.stats.trends?.last7Days?.newAnnotations || 0,
                  newUploads:
                    statsData.stats.trends?.last7Days?.newUploads || 0,
                  studyMinutes:
                    statsData.stats.trends?.last7Days?.studyMinutes || 0,
                },
                userRetention: {
                  day1: statsData.stats.trends?.userRetention?.day1 || 0,
                  day7: statsData.stats.trends?.userRetention?.day7 || 0,
                  day30: statsData.stats.trends?.userRetention?.day30 || 0,
                },
              },
            };

            setStats(cleanStats);
          } else {
            // Merge específico da seção
            setStats((prevStats) => ({
              ...prevStats!,
              [section]: statsData.stats[section],
            }));
          }
          setLastUpdated(new Date(statsData.timestamp));
        } else {
          throw new Error('Resposta inválida do servidor');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error('Erro ao buscar estatísticas do admin:', err);
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const refreshStats = useCallback(async () => {
    return fetchStats('all');
  }, [fetchStats]);

  const fetchSection = useCallback(
    async (section: string) => {
      return fetchStats(section);
    },
    [fetchStats]
  );

  // Carregar estatísticas iniciais
  useEffect(() => {
    fetchStats('all');
  }, []);

  // Auto-refresh a cada 5 minutos se não estiver carregando
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && stats) {
        fetchStats('all');
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [loading, stats, fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshStats,
    fetchSection,
    lastUpdated,
  };
};

// Hook específico para seções individuais (para melhor performance)
export const useAdminStatsSection = (section: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/stats?section=${section}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar seção ${section}`);
      }

      const result = await response.json();

      if (result.success && result.stats) {
        setData(result.stats[section]);
      } else {
        throw new Error('Resposta inválida');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error(`Erro ao buscar seção ${section}:`, err);
    } finally {
      setLoading(false);
    }
  }, [section, loading]);

  useEffect(() => {
    fetchData();
  }, [section]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// Utilitários para formatação (sem mudanças)
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}min`
      : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatGrowthRate = (
  rate: number
): {
  formatted: string;
  color: string;
  isPositive: boolean;
} => {
  const isPositive = rate >= 0;
  const color = isPositive ? 'text-accent-green' : 'text-accent-red';
  const formatted = `${isPositive ? '+' : ''}${rate.toFixed(1)}%`;

  return { formatted, color, isPositive };
};

export const getQualityColor = (quality: string): string => {
  switch (quality) {
    case 'high':
      return 'text-accent-green';
    case 'medium':
      return 'text-accent-amber';
    case 'low':
      return 'text-accent-red';
    default:
      return 'text-theme-tertiary';
  }
};

export const getQualityLabel = (quality: string): string => {
  switch (quality) {
    case 'high':
      return 'Alta';
    case 'medium':
      return 'Média';
    case 'low':
      return 'Baixa';
    default:
      return 'Desconhecida';
  }
};
