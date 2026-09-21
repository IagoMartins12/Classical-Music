// app/hooks/useAdminModeration.ts
import { useCallback, useState } from 'react';
import { adminKeys, useAdminQuery, useInvalidateAdmin } from './query';
import { apiFetch } from '@/app/libs/api/client';
import { listModerations, resolveModeration } from '@/app/requests/moderation';

export interface ModerationStats {
  pending: number;
  processed: number;
  approved: number;
  rejected: number;
  avgProcessingTime: number;
  topModerators: Array<{
    id: string;
    name: string;
    processed: number;
    accuracy: number;
  }>;
  qualityTrends: Array<{
    date: string;
    avgQuality: number;
    totalItems: number;
  }>;
}

export interface ModerationItem {
  id: string;
  type: 'composer' | 'work' | 'score' | 'annotation';
  title: string;
  uploader: {
    id: string;
    name: string;
    email: string;
    uploadScore: number;
  };
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  submittedAt: Date;
  reportCount: number;
  qualityScore?: number;
  issues: string[];
  content: {
    description?: string;
    metadata?: any;
    fileUrl?: string;
  };
}

interface UseAdminModerationReturn {
  stats: ModerationStats | null;
  items: ModerationItem[];
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  refreshItems: (filters?: any) => Promise<void>;
  approveItem: (itemId: string, notes?: string) => Promise<boolean>;
  rejectItem: (
    itemId: string,
    reason?: string,
    notes?: string
  ) => Promise<boolean>;
}

interface ApiModerationStats {
  byStatus: Record<string, number>;
  pending: { total: number };
  period: { resolved: number; avgResolutionHours: number | null };
}

const statusCount = (byStatus: Record<string, number>, status: string) =>
  byStatus[status] ?? byStatus[status.toLowerCase()] ?? 0;

/**
 * A fila e as estatísticas vêm da moderação de contribuições da API
 * (`/uploads/moderation`), a mesma de `/moderation` no site. Não há ranking de
 * moderadores nem tendência de qualidade: ficam vazios.
 */
export const useAdminModeration = (): UseAdminModerationReturn => {
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const invalidate = useInvalidateAdmin();

  const stats = useAdminQuery(adminKeys.area('moderation-stats'), async () => {
    const data = await apiFetch<ApiModerationStats>(
      '/uploads/moderation/stats',
      { cache: 'no-store' }
    );

    return {
      pending: data.pending.total,
      processed: data.period.resolved,
      approved: statusCount(data.byStatus, 'APPROVED'),
      rejected: statusCount(data.byStatus, 'REJECTED'),
      avgProcessingTime: data.period.avgResolutionHours ?? 0,
      topModerators: [],
      qualityTrends: [],
    } as ModerationStats;
  });

  const queue = useAdminQuery(adminKeys.list('moderation', page), async () => {
    const result = await listModerations(page, 'pending');

    if (!result.ok) {
      throw new Error(result.error);
    }

    return result.data.moderations.map((moderation: any) => {
      const entity = moderation.entityDetails ?? {};

      return {
        id: moderation.id,
        type: moderation.entityType,
        title:
          entity.title ?? entity.fullName ?? entity.name ?? moderation.entityId,
        uploader: {
          id: moderation.reporter?.id ?? '',
          name: moderation.reporter?.name ?? '',
          email: '',
          uploadScore: 0,
        },
        status: 'pending',
        priority: String(moderation.priority ?? 'normal').toLowerCase(),
        submittedAt: new Date(moderation.createdAt),
        reportCount: 1,
        issues: [moderation.reason].filter(Boolean),
        content: { description: moderation.description ?? undefined },
      } as ModerationItem;
    });
  });

  const resolve = useCallback(
    async (itemId: string, action: 'approve' | 'reject', notes?: string) => {
      const result = await resolveModeration(itemId, action, notes);

      if (!result.ok) {
        console.error(
          `Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} item:`,
          result.error
        );
        setActionError(result.error);
        return false;
      }

      setActionError(null);
      // A fila e os números mudam juntos: os dois voltam do servidor.
      await Promise.all([invalidate('moderation'), stats.refetch()]);
      return true;
    },
    [invalidate, stats]
  );

  const approveItem = useCallback(
    (itemId: string, notes?: string) => resolve(itemId, 'approve', notes),
    [resolve]
  );

  // A API guarda uma nota só: motivo e observação vão juntos.
  const rejectItem = useCallback(
    (itemId: string, reason?: string, notes?: string) =>
      resolve(itemId, 'reject', [reason, notes].filter(Boolean).join(' — ')),
    [resolve]
  );

  const refreshItems = useCallback(
    async (filters?: { page?: number }) => {
      if (filters?.page && filters.page !== page) {
        setPage(filters.page);
        return;
      }

      await queue.refetch();
    },
    [page, queue]
  );

  return {
    stats: stats.data ?? null,
    items: queue.data ?? [],
    loading: queue.loading,
    error: queue.error ?? stats.error ?? actionError,
    refreshStats: stats.refetch,
    refreshItems,
    approveItem,
    rejectItem,
  };
};
