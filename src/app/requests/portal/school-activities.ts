// app/requests/portal/school-activities.ts — histórico escolar pela API (Etapa 4)
//
// Mesma lista para professor e aluno (`as`). O legado já mandava o texto
// relativo ("há 2 horas"), o nome da entidade e o resumo das mudanças prontos;
// aqui eles saem dos campos da API.
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { portalGet, type ApiPagination } from './common';

interface ApiActivity {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  entityName: string | null;
  title: string;
  description: string | null;
  changes: unknown;
  metadata: unknown;
  createdAt: string;
  entity: { title?: string; name?: string } | null;
  entityExists: boolean;
  changedFields: string[];
}

interface ApiActivityStats {
  total: number;
  last24h: number;
  byAction: Record<string, number>;
  byEntityType: Record<string, number>;
}

export interface ActivityFilters {
  as: 'teacher' | 'student';
  page: number;
  action?: string;
  entityType?: string;
  /** `AAAA-MM-DD`, como o campo de data da tela. */
  dateFrom?: string;
  dateTo?: string;
}

const PAGE_SIZE = 20;

/**
 * Tipos de entidade que a API filtra. O filtro "usuário" da tela do professor
 * era a edição do próprio perfil, que na API é `profile`.
 */
const ENTITY_TYPES = new Set([
  'lesson',
  'assignment',
  'student',
  'profile',
  'report',
]);

function entityTypeFilter(value?: string): string | undefined {
  if (!value) return undefined;
  const mapped = value === 'user' ? 'profile' : value;
  return ENTITY_TYPES.has(mapped) ? mapped : undefined;
}

function dayBoundary(date: string, end: boolean): string {
  return new Date(`${date}T${end ? '23:59:59.999' : '00:00:00'}`).toISOString();
}

export async function loadSchoolActivities(filters: ActivityFilters) {
  const data = await portalGet<{
    activities: ApiActivity[];
    pagination: ApiPagination;
    stats?: ApiActivityStats;
  }>('/school-activities', {
    as: filters.as,
    page: filters.page,
    limit: PAGE_SIZE,
    action: filters.action,
    entityType: entityTypeFilter(filters.entityType),
    from: filters.dateFrom ? dayBoundary(filters.dateFrom, false) : undefined,
    to: filters.dateTo ? dayBoundary(filters.dateTo, true) : undefined,
    stats: true,
  });

  return {
    activities: data.activities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      entityType: activity.entityType,
      entityId: activity.entityId ?? undefined,
      entityName: activity.entityName ?? undefined,
      title: activity.title,
      description: activity.description ?? undefined,
      changes: activity.changes,
      metadata: activity.metadata,
      createdAt: activity.createdAt,
      timeAgo: formatDistanceToNow(new Date(activity.createdAt), {
        addSuffix: true,
        locale: ptBR,
      }),
      entityExists: activity.entityExists,
      entityDisplayName:
        activity.entity?.title ??
        activity.entity?.name ??
        activity.entityName ??
        '',
      changesSummary: activity.changedFields.length
        ? activity.changedFields.join(', ')
        : undefined,
    })),
    totalPages: data.pagination.totalPages,
    totalCount: data.pagination.total,
    stats: {
      totalActivities: data.stats?.total ?? 0,
      recentActivity: data.stats?.last24h ?? 0,
      breakdown: {
        byAction: data.stats?.byAction ?? {},
        byEntityType: data.stats?.byEntityType ?? {},
      },
    },
  };
}
