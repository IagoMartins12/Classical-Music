/**
 * Contribuições e atividade no painel (`/admin/uploads*` da API).
 *
 * A "atividade recente" do legado lia o `ActivityLog` (favoritos, anotações,
 * estudo, denúncias); a API expõe ao painel o histórico de contribuições —
 * cadastros, edições e exclusões de compositor, obra e partitura. Os outros
 * tipos de atividade não têm equivalente e voltam vazios.
 */
import { apiFetch } from '@/app/libs/api/client';
import {
  type AdminPeriod,
  type ApiCursorPagination,
  displayName,
  isObjectId,
  periodDays,
  periodStart,
  positiveInt,
} from '@/app/requests/admin/common';
import type { UploadItem } from '@/app/hooks/admin/useAdminUploads';
import type { ActivityItem } from '@/app/hooks/admin/useAdminActivity';

interface ApiUploadEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  reason: string | null;
  changes: unknown;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
  } | null;
  entity: Record<string, unknown> | null;
  entityExists: boolean;
}

const ENTITY_TYPES = ['composer', 'work', 'score'];

function entityName(entry: ApiUploadEntry): string {
  const entity = entry.entity ?? {};
  return String(
    entity.title ??
      entity.fullName ??
      entity.name ??
      `${entry.entityType} ${entry.entityId}`
  );
}

async function fetchEntries(
  query: Record<string, string | number | undefined>
) {
  return apiFetch<{
    entries: ApiUploadEntry[];
    pagination: ApiCursorPagination;
  }>('/admin/uploads', { query, cache: 'no-store' });
}

function toUploadItem(entry: ApiUploadEntry): UploadItem {
  return {
    id: entry.id,
    entityType: entry.entityType,
    entityId: entry.entityId,
    action: entry.action,
    changes: entry.changes,
    reason: entry.reason ?? undefined,
    createdAt: new Date(entry.createdAt),
    user: {
      id: entry.user?.id ?? '',
      name: entry.user ? displayName(entry.user) : '',
      email: '',
      uploadScore: 0,
    },
    entityDetails: entry.entity,
  };
}

/**
 * Uma fatia do histórico. `cursor` é o id do último envio já mostrado: a API
 * continua dali e não conta a base de novo, então `total` só vem na primeira.
 */
export async function listAdminUploads(
  input: object,
  period: AdminPeriod,
  cursor?: string
) {
  const filters = input as Record<string, unknown>;
  const entityType = String(filters.entityType ?? '').toLowerCase();
  const data = await fetchEntries({
    cursor,
    limit: Math.min(positiveInt(filters.limit) ?? 25, 100),
    search: (filters.search as string) || undefined,
    entityType: ENTITY_TYPES.includes(entityType) ? entityType : undefined,
    userId: isObjectId(filters.userId) ? filters.userId : undefined,
    from: (filters.dateFrom as string) || periodStart(period),
    to: (filters.dateTo as string) || undefined,
    sortOrder: filters.sortOrder === 'asc' ? 'asc' : undefined,
  });

  return {
    uploads: data.entries.map(toUploadItem),
    total: data.pagination.total,
    nextCursor: data.pagination.nextCursor,
  };
}

/** Estatísticas dos últimos dias do período (a API vai até 90). */
export async function getAdminUploadStats(period: AdminPeriod) {
  const days = Math.min(periodDays(period) ?? 90, 90);
  const [stats, contributors, recent] = await Promise.all([
    apiFetch<{
      total: number;
      byAction: Record<string, number>;
      byEntityType: Record<string, number>;
      timeline: {
        date: string;
        total: number;
        creates: number;
        updates: number;
      }[];
    }>('/admin/uploads/stats', { query: { days }, cache: 'no-store' }),
    apiFetch<{ userId: string; name: string; contributions: number }[]>(
      '/admin/uploads/contributors',
      { cache: 'no-store' }
    ),
    fetchEntries({ page: 1, limit: 10 }),
  ]);

  return {
    total: stats.total,
    recentCreations: stats.byAction.create ?? 0,
    recentUpdates: stats.byAction.update ?? 0,
    activeUsers: contributors.length,
    byType: Object.entries(stats.byEntityType).map(([type, count]) => ({
      type,
      count,
    })),
    byUser: contributors.map((contributor) => ({
      userId: contributor.userId,
      userName: contributor.name,
      count: contributor.contributions,
    })),
    recentActivity: recent.entries.map((entry) => ({
      ...toUploadItem(entry),
      userName: entry.user ? displayName(entry.user) : '',
    })),
    timeline: stats.timeline.map((day) => ({
      date: day.date,
      uploads: day.total,
      creates: day.creates,
      updates: day.updates,
    })),
  };
}

/** Atividade no formato do log de atividade: só o tipo `UPLOAD` tem dado na API. */
export async function listAdminActivity(options: {
  cursor?: string;
  limit?: number;
  type?: string;
  search?: string;
  period?: string;
  userId?: string;
}) {
  const type =
    options.type && options.type !== 'all' ? options.type : undefined;
  if (type && type !== 'UPLOAD') {
    return { activities: [] as ActivityItem[], total: 0, nextCursor: null };
  }

  const data = await fetchEntries({
    cursor: options.cursor,
    limit: Math.min(options.limit ?? 20, 100),
    search: options.search || undefined,
    userId: isObjectId(options.userId) ? options.userId : undefined,
    from: periodStart(options.period),
  });

  const activities: ActivityItem[] = data.entries.map((entry) => ({
    id: entry.id,
    type: 'UPLOAD',
    user: {
      id: entry.user?.id ?? '',
      name: entry.user ? displayName(entry.user) : '',
      email: '',
      avatar: entry.user?.image ?? undefined,
    },
    action: entry.action,
    target: {
      type: entry.entityType as 'composer' | 'work' | 'score',
      id: entry.entityId,
      name: entityName(entry),
    },
    timestamp: new Date(entry.createdAt),
    metadata: entry.changes,
    status: 'success',
  }));

  return {
    activities,
    total: data.pagination.total,
    nextCursor: data.pagination.nextCursor,
  };
}
