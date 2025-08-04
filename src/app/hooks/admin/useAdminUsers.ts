// app/hooks/useAdminUsers.ts
import { UserListFilters } from '@/app/api/admin/users/route';
import { useState, useEffect, useCallback } from 'react';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  userType?: 'MUSIC_STUDENT' | 'CASUAL_USER' | 'PROFESSIONAL' | 'TEACHER';
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  role?: number; // 0 = usuário, 1 = professor, 2 = super admin
  totalStudyTime: number;
  annotationsCount: number;
  uploadsCount: number;
  uploadScore: number;
  createdAt: Date;
  lastActive: Date;
  isProfilePublic: boolean;
  onboardingCompleted: boolean;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  newUsers: {
    today: number;
    thisWeek: number;
    thisMonth: number;
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
    totalStudyTime: number;
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
}

export interface UserDetailsData {
  profile: {
    totalFavoriteWorks: number;
    totalFavoriteComposers: number;
    totalAnnotations: number;
    lastActivity: string;
    joinedDaysAgo: number;
  };
  recentActivity: Array<{
    type: 'annotation' | 'study' | 'favorite' | 'upload';
    title: string;
    subtitle: string;
    date: string;
    workTitle?: string;
    composerName?: string;
  }>;
  contributions: {
    topAnnotations: Array<{
      id: string;
      workTitle: string;
      composerName: string;
      content: string;
      helpfulCount: number;
      createdAt: string;
    }>;
    recentUploads: Array<{
      id: string;
      type: 'composer' | 'work' | 'score';
      title: string;
      status: string;
      createdAt: string;
    }>;
  };
}

export interface UserEditData {
  role: number;
  userType: string;
  experienceLevel: string;
  uploadLimitDaily: number;
  uploadLimitMonthly: number;
  canUploadComposers: boolean;
  canUploadWorks: boolean;
  canUploadScores: boolean;
}

// Constantes para o sistema
export const USER_ROLES = {
  USER: 0,
  TEACHER: 1,
  SUPER_ADMIN: 2,
} as const;

// Labels traduzidos
export const ROLE_LABELS = {
  [USER_ROLES.USER]: 'Usuário Comum',
  [USER_ROLES.TEACHER]: 'Professor',
  [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
} as const;

interface UseAdminUsersReturn {
  users: AdminUser[];
  analytics: UserAnalytics | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  } | null;
  fetchUsers: (filters?: UserListFilters, page?: number) => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  updateUser: (userId: string, data: any) => Promise<boolean>;
  refreshData: () => Promise<void>;
  exportUsers: (filters?: UserListFilters) => Promise<void>;
}

export const useAdminUsers = (): UseAdminUsersReturn => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchUsers = useCallback(
    async (filters: UserListFilters = {}, page: number = 1) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams({
          action: 'list',
          page: page.toString(),
          limit: (filters.limit || 50).toString(),
        });

        // Adicionar filtros válidos
        Object.entries(filters).forEach(([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== '' &&
            value !== 'all'
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
      }
    },
    [loading]
  );

  const fetchAnalytics = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/users?action=analytics', {
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Acesso não autorizado');
        }
        throw new Error(`Erro ${response.status}: Falha ao carregar analytics`);
      }

      const data = await response.json();

      if (data.success) {
        // Limpar dados desnecessários e garantir estrutura consistente
        const cleanAnalytics: UserAnalytics = {
          totalUsers: data.analytics?.totalUsers || 0,
          activeUsers: {
            today: data.analytics?.activeUsers?.today || 0,
            thisWeek: data.analytics?.activeUsers?.thisWeek || 0,
            thisMonth: data.analytics?.activeUsers?.thisMonth || 0,
          },
          newUsers: {
            today: data.analytics?.newUsers?.today || 0,
            thisWeek: data.analytics?.newUsers?.thisWeek || 0,
            thisMonth: data.analytics?.newUsers?.thisMonth || 0,
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
      setLoading(false);
    }
  }, [loading]);

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
          // Atualizar usuário na lista local
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

  const exportUsers = useCallback(async (filters: UserListFilters = {}) => {
    try {
      const searchParams = new URLSearchParams({
        action: 'export',
        format: 'csv',
      });

      // Adicionar filtros para export
      Object.entries(filters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== '' &&
          value !== 'all'
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

      // Baixar arquivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usuarios-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao exportar usuários:', err);
      setError(err instanceof Error ? err.message : 'Erro ao exportar');
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      await Promise.all([fetchUsers(), fetchAnalytics()]);
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
    }
  }, [fetchUsers, fetchAnalytics]);

  // Carregar dados iniciais apenas se não estiverem carregados
  useEffect(() => {
    if (users.length === 0 && !analytics && !loading) {
      refreshData();
    }
  }, []);

  // Auto-refresh a cada 10 minutos para analytics
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchAnalytics();
      }
    }, 10 * 60 * 1000); // 10 minutos

    return () => clearInterval(interval);
  }, [loading, fetchAnalytics]);

  return {
    users,
    analytics,
    loading,
    error,
    pagination,
    fetchUsers,
    fetchAnalytics,
    updateUser,
    refreshData,
    exportUsers,
  };
};
