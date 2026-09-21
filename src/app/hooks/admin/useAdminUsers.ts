import { TimePeriod } from '@/app/components/Admin/Common/PeriodSelector';
import { useCallback, useMemo, useState } from 'react';
import {
  adminKeys,
  errorMessage,
  useAdminInfinite,
  useAdminQuery,
} from './query';
import {
  type UserListFilters,
  exportAdminUsers,
  getAdminUserAnalytics,
  listAdminUsers,
  updateAdminUser,
} from '@/app/requests/admin/users';

export type { UserListFilters };

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
  /** Buscando a fatia seguinte, com a lista já na tela. */
  loadingMore: boolean;
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

/** Usuários por fatia; o mesmo tamanho que a tela pedia antes. */
const PAGE_SIZE = 50;

/**
 * Usuários do painel.
 *
 * A lista é estado de servidor por cursor (`useAdminInfinite`): a chave leva
 * os filtros, e o "carregar mais" pede a fatia seguinte a partir do id do
 * último usuário já mostrado — a API não relê as páginas anteriores nem conta
 * a base de novo. Trocar o filtro troca a chave, e a lista recomeça sozinha.
 *
 * `fetchUsers(filtros, página)` continua existindo porque a tela chama assim:
 * com página maior que a atual, é o "carregar mais".
 */
export const useAdminUsers = (): UseAdminUsersReturn => {
  const [filters, setFilters] = useState<UserListFilters>({});
  const [period, setPeriod] = useState<TimePeriod>('all');
  const [actionError, setActionError] = useState<string | null>(null);

  const list = useAdminInfinite(
    adminKeys.list('users', filters),
    async (cursor) => {
      const data = await listAdminUsers(
        { ...filters, limit: PAGE_SIZE },
        cursor
      );

      return {
        items: data.users,
        total: data.total,
        nextCursor: data.nextCursor,
      };
    }
  );

  // As análises se atualizam sozinhas de dez em dez minutos, como antes.
  const analytics = useAdminQuery(
    adminKeys.list('users-analytics', period),
    () => getAdminUserAnalytics(period),
    { refetchInterval: 10 * 60 * 1000 }
  );

  const fetchUsers = useCallback(
    async (nextFilters: UserListFilters = {}, page: number = 1) => {
      // Página maior que a primeira é o "carregar mais" da tela: o cursor
      // sabe onde parou, então o número em si não importa.
      if (page > 1) {
        list.loadMore();
        return;
      }

      setFilters(nextFilters);
    },
    [list]
  );

  const fetchAnalytics = useCallback(async () => {
    await analytics.refetch();
  }, [analytics]);

  const updateUser = useCallback(
    async (userId: string, updateData: any): Promise<boolean> => {
      try {
        await updateAdminUser(userId, updateData);
        setActionError(null);
        await list.refetch();
        return true;
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        setActionError(errorMessage(error));
        return false;
      }
    },
    [list]
  );

  const exportUsers = useCallback(
    async (exportFilters: UserListFilters = {}) => {
      try {
        await exportAdminUsers(
          exportFilters,
          `usuarios-${exportFilters.period || period}-${
            new Date().toISOString().split('T')[0]
          }.csv`
        );
      } catch (error) {
        console.error('Erro ao exportar usuários:', error);
        setActionError(errorMessage(error));
      }
    },
    [period]
  );

  const refreshData = useCallback(async () => {
    await Promise.all([list.refetch(), analytics.refetch()]);
  }, [list, analytics]);

  const pagination = useMemo(() => {
    const total = list.total ?? list.items.length;

    return {
      // "Página" aqui é quantas fatias já vieram: a tela só a exibe.
      page: Math.max(1, Math.ceil(list.items.length / PAGE_SIZE)),
      limit: PAGE_SIZE,
      total,
      pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      hasMore: list.hasMore,
    };
  }, [list.total, list.items.length, list.hasMore]);

  return {
    users: list.items,
    analytics: analytics.data ?? null,
    loading: list.loading,
    statsLoading: analytics.loading,
    loadingMore: list.loadingMore,
    error: list.error ?? analytics.error ?? actionError,
    pagination,
    period,
    setPeriod,
    fetchUsers,
    fetchAnalytics,
    updateUser,
    refreshData,
    refreshStats: fetchAnalytics,
    exportUsers,
  };
};
