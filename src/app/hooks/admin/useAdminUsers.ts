import { UserListFilters } from '@/app/api/admin/users/route';
import { TimePeriod } from '@/app/components/Admin/Common/PeriodSelector';
import { useState, useEffect, useCallback, useRef } from 'react';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  userType?: 'MUSIC_STUDENT' | 'CASUAL_USER' | 'PROFESSIONAL' | 'TEACHER';
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  role?: number;
  annotationsCount: number;
  uploadsCount: number;
  uploadScore: number;
  createdAt: Date;
  lastActive: Date;
  isProfilePublic: boolean;
  onboardingCompleted: boolean;
  moderationsCount?: number;
  teacherInviteStatus?: 'pending' | 'accepted' | 'declined' | null;
  teacherInviteAcceptedAt?: Date;
  isTeacher?: boolean;
  teacherProfile?: {
    id: string;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
    isVerified: boolean;
    specialties?: string[];
    instruments?: string[];
    isPublicProfile?: boolean;
  };
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    period: number;
    growthRate: number;
  };
  newUsers: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    period: number;
    recentlyAdded: number;
    growthRate: number;
  };
  userTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  topContributors: Array<{
    id: string;
    name: string;
    email: string;
    totalUploads: number;
    uploadScore: number;
    verifiedUploads: number;
    annotationsCount: number;
  }>;
  userGrowth: Array<{
    date: string;
    newUsers: number;
    activeUsers: number;
    totalUsers: number;
  }>;
  engagementMetrics: {
    averageAnnotationsPerUser: number;
    averageUploadsPerUser: number;
  };
  retentionRate?: number;
  retentionGrowth?: number;
  activityRate?: number;
  contributorsPercentage?: number;
}

export const USER_ROLES = {
  USER: 0,
  TEACHER: 1,
  SUPER_ADMIN: 2,
} as const;

export const ROLE_LABELS = {
  [USER_ROLES.USER]: 'Usuário Comum',
  [USER_ROLES.TEACHER]: 'Professor',
  [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
} as const;

interface UseAdminUsersReturn {
  users: AdminUser[];
  analytics: UserAnalytics | null;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  } | null;
  period: TimePeriod;
  setPeriod: (period: TimePeriod) => void;
  fetchUsers: (filters?: UserListFilters, page?: number) => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  updateUser: (userId: string, data: any) => Promise<boolean>;
  refreshData: () => Promise<void>;
  refreshStats: () => Promise<void>;
  exportUsers: (filters?: UserListFilters) => Promise<void>;
}

export const useAdminUsers = (): UseAdminUsersReturn => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [period, setPeriod] = useState<TimePeriod>('all'); // Período padrão restaurado

  const fetchingUsersRef = useRef(false);
  const fetchingAnalyticsRef = useRef(false);
  const initialLoadedRef = useRef(false);
  const lastPeriodRef = useRef<TimePeriod>(period);

  const fetchUsers = useCallback(
    async (filters: UserListFilters = {}, page: number = 1) => {
      if (fetchingUsersRef.current) {
        console.log('[useAdminUsers] Ignorando fetchUsers - já em andamento');
        return;
      }

      fetchingUsersRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams({
          action: 'list',
          page: page.toString(),
          limit: (filters.limit || 50).toString(),
          period: filters.period || period, // Usar period dos filtros ou do estado
        });

        Object.entries(filters).forEach(([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== '' &&
            value !== 'all' &&
            key !== 'period'
          ) {
            searchParams.set(key, value.toString());
          }
        });

        const response = await fetch(`/api/admin/users?${searchParams}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Acesso não autorizado');
          }
          throw new Error(
            `Erro ${response.status}: Falha ao carregar usuários`
          );
        }

        const data = await response.json();

        if (data.success) {
          if (page === 1) {
            setUsers(data.users || []);
          } else {
            setUsers((prev) => [...prev, ...(data.users || [])]);
          }
          setPagination(data.pagination || null);
        } else {
          throw new Error(
            data.error || 'Erro desconhecido ao carregar usuários'
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error('Erro ao buscar usuários:', err);
      } finally {
        setLoading(false);
        fetchingUsersRef.current = false;
      }
    },
    [period]
  );

  const fetchAnalytics = useCallback(async () => {
    if (fetchingAnalyticsRef.current) {
      console.log('[useAdminUsers] Ignorando fetchAnalytics - já em andamento');
      return;
    }

    fetchingAnalyticsRef.current = true;
    setStatsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/users?action=analytics&period=${period}`,
        {
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Acesso não autorizado');
        }
        throw new Error(`Erro ${response.status}: Falha ao carregar analytics`);
      }

      const data = await response.json();

      if (data.success) {
        const cleanAnalytics: UserAnalytics = {
          totalUsers: data.analytics?.totalUsers || 0,
          activeUsers: {
            today: data.analytics?.activeUsers?.today || 0,
            thisWeek: data.analytics?.activeUsers?.thisWeek || 0,
            thisMonth: data.analytics?.activeUsers?.thisMonth || 0,
            period: data.analytics?.activeUsers?.period || 0,
            growthRate: data.analytics?.activeUsers?.growthRate || 0,
          },
          newUsers: {
            today: data.analytics?.newUsers?.today || 0,
            thisWeek: data.analytics?.newUsers?.thisWeek || 0,
            thisMonth: data.analytics?.newUsers?.thisMonth || 0,
            period: data.analytics?.newUsers?.period || 0,
            recentlyAdded: data.analytics?.newUsers?.recentlyAdded || 0,
            growthRate: data.analytics?.newUsers?.growthRate || 0,
          },
          userTypes: data.analytics?.userTypes || [],
          topContributors: data.analytics?.topContributors || [],
          userGrowth: data.analytics?.userGrowth || [],
          engagementMetrics: {
            averageAnnotationsPerUser:
              data.analytics?.engagementMetrics?.averageAnnotationsPerUser || 0,
            averageUploadsPerUser:
              data.analytics?.engagementMetrics?.averageUploadsPerUser || 0,
          },
          retentionRate: data.analytics?.retentionRate || 0,
          retentionGrowth: data.analytics?.retentionGrowth || 0,
          activityRate: data.analytics?.activityRate || 0,
          contributorsPercentage: data.analytics?.contributorsPercentage || 0,
        };

        setAnalytics(cleanAnalytics);
      } else {
        throw new Error(
          data.error || 'Erro desconhecido ao carregar analytics'
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar analytics:', err);
    } finally {
      setStatsLoading(false);
      fetchingAnalyticsRef.current = false;
    }
  }, [period]);

  const refreshStats = useCallback(async () => {
    return fetchAnalytics();
  }, [fetchAnalytics]);

  const updateUser = useCallback(
    async (userId: string, updateData: any): Promise<boolean> => {
      try {
        const response = await fetch(`/api/admin/users?userId=${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Acesso não autorizado');
          }
          throw new Error(
            `Erro ${response.status}: Falha ao atualizar usuário`
          );
        }

        const data = await response.json();

        if (data.success) {
          setUsers((prev) =>
            prev.map((user) =>
              user.id === userId ? { ...user, ...data.user } : user
            )
          );
          return true;
        } else {
          throw new Error(data.error || 'Erro ao atualizar usuário');
        }
      } catch (err) {
        console.error('Erro ao atualizar usuário:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        return false;
      }
    },
    []
  );

  const exportUsers = useCallback(
    async (filters: UserListFilters = {}) => {
      try {
        const searchParams = new URLSearchParams({
          action: 'export',
          format: 'csv',
          period: filters.period || period,
        });

        Object.entries(filters).forEach(([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== '' &&
            value !== 'all' &&
            key !== 'period'
          ) {
            searchParams.set(key, value.toString());
          }
        });

        const response = await fetch(`/api/admin/users?${searchParams}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Erro ao exportar usuários');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `usuarios-${filters.period || period}-${
          new Date().toISOString().split('T')[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Erro ao exportar usuários:', err);
        setError(err instanceof Error ? err.message : 'Erro ao exportar');
      }
    },
    [period]
  );

  const refreshData = useCallback(async () => {
    if (fetchingUsersRef.current && fetchingAnalyticsRef.current) {
      console.log('[useAdminUsers] Ignorando refreshData - já em andamento');
      return;
    }

    try {
      const promises = [];
      if (!fetchingUsersRef.current) {
        promises.push(fetchUsers());
      }
      if (!fetchingAnalyticsRef.current) {
        promises.push(fetchAnalytics());
      }

      await Promise.all(promises);
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
    }
  }, [fetchUsers, fetchAnalytics]);

  // Carregamento inicial e mudança de período
  useEffect(() => {
    const periodChanged = lastPeriodRef.current !== period;

    if (!initialLoadedRef.current || periodChanged) {
      console.log('[useAdminUsers] Carregando dados:', {
        initial: !initialLoadedRef.current,
        periodChanged,
        period,
      });

      if (periodChanged) {
        fetchingUsersRef.current = false;
        fetchingAnalyticsRef.current = false;
        lastPeriodRef.current = period;
      }

      refreshData().then(() => {
        initialLoadedRef.current = true;
      });
    }
  }, [period, refreshData]);

  // Auto-refresh
  useEffect(() => {
    if (!initialLoadedRef.current) return;

    const interval = setInterval(
      () => {
        if (
          !fetchingUsersRef.current &&
          !fetchingAnalyticsRef.current &&
          !loading &&
          !statsLoading
        ) {
          console.log('[useAdminUsers] Auto-refresh executado');
          fetchAnalytics();
        }
      },
      10 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [fetchAnalytics, loading, statsLoading]);

  return {
    users,
    analytics,
    loading,
    statsLoading,
    error,
    pagination,
    period,
    setPeriod,
    fetchUsers,
    fetchAnalytics,
    updateUser,
    refreshData,
    refreshStats,
    exportUsers,
  };
};
