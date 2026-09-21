// app/hooks/admin/useAdminActivity.ts - ATUALIZADO COM TIPOS CORRETOS
import { useCallback, useState } from 'react';
import { adminKeys, useAdminInfinite } from './query';
import { listAdminActivity } from '@/app/requests/admin/uploads';

export interface ActivityItem {
  id: string;
  type: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  target?: {
    type: 'composer' | 'work' | 'score' | 'user';
    id: string;
    name: string;
  };
  timestamp: Date;
  metadata?: any;
  status?: 'success' | 'warning' | 'error';
}

export interface ActivityFilters {
  type?: string;
  search?: string;
  period?: string;
  userId?: string;
}

export interface ActivityPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Tipos de atividade. Na API só há o histórico de contribuições (`UPLOAD`);
// os outros filtros voltam vazios.
export const ACTIVITY_TYPES = {
  ALL: 'all',
  UPLOAD: 'UPLOAD', // Do UploadHistory
  FAVORITE: 'favorite', // Mapeado para múltiplos tipos de favoritos
  ANNOTATION: 'annotation', // Mapeado para múltiplos tipos de anotação
  STUDY: 'study_session', // Mapeado para tipos de estudo
  MODERATION: 'moderation', // Denúncias
  SYSTEM: 'system', // Ações do sistema
} as const;

/** Quantas atividades por página — o mesmo do legado. */
const PAGE_SIZE = 50;

/**
 * Trilha de atividades do painel.
 *
 * A lista vem por cursor (`useAdminInfinite`): o "carregar mais" pede a fatia
 * seguinte a partir do id do último item mostrado, e o acúmulo é do próprio
 * TanStack Query — trocar o filtro troca a chave, e a lista recomeça.
 */
export function useAdminActivity() {
  const [filters, setFilters] = useState<ActivityFilters>({ period: '7d' });

  const list = useAdminInfinite(
    adminKeys.list('activity', filters),
    async (cursor) => {
      const data = await listAdminActivity({
        ...filters,
        cursor,
        limit: PAGE_SIZE,
      });

      return {
        items: data.activities,
        total: data.total,
        nextCursor: data.nextCursor,
      };
    }
  );

  const setActivityFilters = useCallback(
    (newFilters: Partial<ActivityFilters>) => {
      setFilters((previous) => ({ ...previous, ...newFilters }));
    },
    []
  );

  const refreshActivities = useCallback(async () => {
    await list.refetch();
  }, [list]);

  const loadMoreActivities = useCallback(async () => {
    list.loadMore();
  }, [list]);

  return {
    activities: list.items,
    loading: list.loading,
    /** Buscando a fatia seguinte, com a lista já na tela. */
    loadingMore: list.loadingMore,
    error: list.error,
    filters,
    pagination: {
      // "Página" é só quantas fatias já vieram; quem manda é o cursor.
      page: Math.max(1, Math.ceil(list.items.length / PAGE_SIZE)),
      limit: PAGE_SIZE,
      total: list.total ?? list.items.length,
      hasMore: list.hasMore,
    } satisfies ActivityPagination,
    setActivityFilters,
    refreshActivities,
    loadMoreActivities,
  };
}
