/**
 * Usuários no painel (`/admin/users*` da API), no formato das telas.
 *
 * O que a API não tem fica zerado ou vazio, e as telas mostram assim:
 * "pontuação de envios" (não existe mais), crescimento dia a dia, retenção e,
 * no detalhe, as listas pessoais (favoritos, anotações, estudo, instrumentos),
 * telefone e localização — o detalhe da API traz só conta, papéis e contagens.
 */
import { apiFetch } from '@/app/libs/api/client';
import {
  type AdminPeriod,
  type ApiCursorPagination,
  analyticsPeriod,
  displayName,
  downloadFromApi,
} from '@/app/requests/admin/common';
import type { AdminUser, UserAnalytics } from '@/app/hooks/admin/useAdminUsers';

export interface UserListFilters {
  search?: string;
  userType?: string;
  experienceLevel?: string;
  sortBy?: 'name' | 'createdAt' | 'annotationsCount' | 'uploadsCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  isActive?: boolean;
  hasUploads?: boolean;
  hasAnnotations?: boolean;
  hasModerations?: boolean;
  role?: number;
  period?: AdminPeriod;
}

interface ApiAdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  image: string | null;
  bio: string | null;
  role: number;
  userType: AdminUser['userType'] | null;
  experienceLevel: AdminUser['experienceLevel'] | null;
  isTeacher: boolean;
  isStudent: boolean;
  profilePublic: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  lastSeen: string | null;
  teacherProfile?: unknown;
  studentProfile?: unknown;
  counts?: {
    annotations: number;
    favorites: number;
    learned: number;
    uploads: number;
  };
}

interface ApiUserAnalytics {
  period: string;
  total: number;
  newInPeriod: number;
  growthRate: number | null;
  activeInPeriod: number;
  teachers: number;
  byUserType: Record<string, number>;
  byRole: Record<string, number>;
}

function toAdminUser(user: ApiAdminUser): AdminUser {
  return {
    id: user.id,
    name: displayName(user),
    email: user.email,
    username: user.username ?? undefined,
    userType: user.userType ?? undefined,
    experienceLevel: user.experienceLevel ?? undefined,
    role: user.role,
    annotationsCount: user.counts?.annotations ?? 0,
    uploadsCount: user.counts?.uploads ?? 0,
    uploadScore: 0,
    createdAt: new Date(user.createdAt),
    lastActive: new Date(user.lastSeen ?? user.updatedAt),
    isProfilePublic: user.profilePublic,
    onboardingCompleted: user.onboardingCompleted,
    isTeacher: user.isTeacher,
  };
}

// A API ordena por data, último acesso, e-mail e nome; o resto fica na data.
const SORT_BY: Record<string, string> = {
  name: 'firstName',
  createdAt: 'createdAt',
};

function listQuery(filters: UserListFilters) {
  return {
    search: filters.search || undefined,
    userType: filters.userType || undefined,
    experienceLevel: filters.experienceLevel || undefined,
    role: filters.role,
    sortBy: filters.sortBy ? SORT_BY[filters.sortBy] : undefined,
    sortOrder: filters.sortOrder,
  };
}

/**
 * Uma fatia da lista. `cursor` é o id do último usuário já mostrado: a API
 * continua dali, sem reler as páginas anteriores nem contar a base de novo —
 * por isso `total` só vem na primeira fatia.
 */
export async function listAdminUsers(
  filters: UserListFilters,
  cursor?: string
) {
  const data = await apiFetch<{
    users: ApiAdminUser[];
    pagination: ApiCursorPagination;
  }>('/admin/users', {
    query: {
      ...listQuery(filters),
      cursor,
      limit: Math.min(filters.limit ?? 50, 100),
    },
    cache: 'no-store',
  });

  return {
    users: data.users.map(toAdminUser),
    total: data.pagination.total,
    nextCursor: data.pagination.nextCursor,
  };
}

/**
 * A análise da API é por período (7d, 30d, 90d, 1y). "Hoje" não existe;
 * semana e mês saem de duas consultas a mais.
 */
export async function getAdminUserAnalytics(
  period: AdminPeriod
): Promise<UserAnalytics> {
  const fetchPeriod = (value: string) =>
    apiFetch<ApiUserAnalytics>('/admin/users/analytics', {
      query: { period: value },
      cache: 'no-store',
    });

  const [current, week, month, contributors] = await Promise.all([
    fetchPeriod(analyticsPeriod(period)),
    fetchPeriod('7d'),
    fetchPeriod('30d'),
    apiFetch<
      {
        userId: string;
        name: string;
        image: string | null;
        contributions: number;
      }[]
    >('/admin/uploads/contributors', { cache: 'no-store' }),
  ]);

  const total = current.total || 0;
  const percent = (value: number) =>
    total ? Math.round((value / total) * 1000) / 10 : 0;

  return {
    totalUsers: total,
    activeUsers: {
      today: 0,
      thisWeek: week.activeInPeriod,
      thisMonth: month.activeInPeriod,
      period: current.activeInPeriod,
      growthRate: 0,
    },
    newUsers: {
      today: 0,
      thisWeek: week.newInPeriod,
      thisMonth: month.newInPeriod,
      period: current.newInPeriod,
      recentlyAdded: week.newInPeriod,
      growthRate: current.growthRate ?? 0,
    },
    userTypes: Object.entries(current.byUserType).map(([type, count]) => ({
      type,
      count,
      percentage: percent(count),
    })),
    topContributors: contributors.map((contributor) => ({
      id: contributor.userId,
      name: contributor.name,
      email: '',
      totalUploads: contributor.contributions,
      uploadScore: 0,
      verifiedUploads: 0,
      annotationsCount: 0,
    })),
    userGrowth: [],
    engagementMetrics: {
      averageAnnotationsPerUser: 0,
      averageUploadsPerUser: 0,
    },
    retentionRate: 0,
    retentionGrowth: 0,
    activityRate: percent(current.activeInPeriod),
    contributorsPercentage: percent(contributors.length),
  };
}

/**
 * A API aceita papel, tipo de usuário e os indicadores de professor e aluno;
 * o nível de experiência é da própria pessoa e não se edita pelo painel. Volta
 * o usuário como ficou.
 */
export async function updateAdminUser(
  userId: string,
  data: {
    role?: number;
    userType?: string;
    isTeacher?: boolean;
    isStudent?: boolean;
  }
) {
  const updated = await apiFetch<ApiAdminUser>(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: {
      role: data.role,
      userType: data.userType,
      isTeacher: data.isTeacher,
      isStudent: data.isStudent,
    },
  });

  return updated?.id ? toAdminUser(updated) : undefined;
}

export function exportAdminUsers(filters: UserListFilters, filename: string) {
  return downloadFromApi(
    '/admin/users/export',
    { ...listQuery(filters), format: 'csv' },
    filename
  );
}

/** Detalhe no formato do modal; as listas pessoais vêm vazias (a API não as expõe ao painel). */
export async function getAdminUserDetails(userId: string) {
  const user = await apiFetch<ApiAdminUser>(`/admin/users/${userId}`, {
    cache: 'no-store',
  });
  const lastSeen = new Date(user.lastSeen ?? user.updatedAt);
  const minutesAgo = Math.max(
    0,
    Math.floor((Date.now() - lastSeen.getTime()) / 60000)
  );

  return {
    id: user.id,
    firstName: user.firstName ?? undefined,
    lastName: user.lastName ?? undefined,
    username: user.username ?? undefined,
    email: user.email,
    image: user.image ?? undefined,
    bio: user.bio ?? undefined,
    role: user.role,
    userType: user.userType ?? undefined,
    experienceLevel: user.experienceLevel ?? undefined,
    onboardingCompleted: user.onboardingCompleted,
    profilePublic: user.profilePublic,
    showLocation: false,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
    joinedDaysAgo: Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / 86400000
    ),
    lastSeenMinutesAgo: minutesAgo,
    isOnline: minutesAgo < 5,
    lastActivity: lastSeen,
    stats: {
      totalAnnotations: user.counts?.annotations ?? 0,
      helpfulAnnotations: 0,
      totalUploads: user.counts?.uploads ?? 0,
      totalFavorites: user.counts?.favorites ?? 0,
      annotationsCount: user.counts?.annotations ?? 0,
      uploadScore: 0,
    },
    favoriteComposers: [],
    favoriteWorks: [],
    favoriteScores: [],
    instruments: [],
    wantToLearn: [],
    learned: [],
    annotations: [],
    teacherProfile: user.teacherProfile ?? undefined,
    studentProfile: user.studentProfile ?? undefined,
    isTeacher: user.isTeacher,
    isStudent: user.isStudent,
  };
}
