// app/hooks/useAdminUsers.ts
import { useState, useEffect, useCallback } from 'react';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  userType?: string;
  experienceLevel?: string;
  totalStudyTime: number;
  annotationsCount: number;
  uploadsCount: number;
  uploadScore: number;
  createdAt: Date;
  lastActive: Date;
  isProfilePublic: boolean;
  onboardingCompleted: boolean;
}

export interface UserFilters {
  search?: string;
  userType?: string;
  experienceLevel?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
  hasUploads?: boolean;
  hasAnnotations?: boolean;
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
    averageSessionDuration: number;
    averageAnnotationsPerUser: number;
    averageUploadsPerUser: number;
  };
}

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
  fetchUsers: (filters?: UserFilters, page?: number) => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  updateUser: (userId: string, data: any) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export const useAdminUsers = (): UseAdminUsersReturn => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchUsers = useCallback(
    async (filters: UserFilters = {}, page: number = 1) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams({
          action: 'list',
          page: page.toString(),
          limit: '50',
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
            averageSessionDuration:
              data.analytics?.engagementMetrics?.averageSessionDuration || 0,
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

  const refreshData = useCallback(async () => {
    try {
      await Promise.all([fetchUsers(), fetchAnalytics()]);
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
    }
  }, [fetchUsers, fetchAnalytics]);

  // Carregar dados iniciais
  useEffect(() => {
    refreshData();
  }, []);

  // Auto-refresh a cada 10 minutos
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
  };
};
