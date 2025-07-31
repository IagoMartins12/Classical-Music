// hooks/useWorkScores.ts - Hook MELHORADO para buscar limite por tipo
import { useState, useEffect, useCallback } from 'react';

export interface WorkScore {
  id: string;
  workId: string;
  sourceId: string;
  source: 'IMSLP' | 'CUSTOM' | 'UPLOAD';
  title: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  fileSize?: string;
  pageCount?: string;
  fileFormat: string;
  type: string;
  editor?: string;
  publisher?: string;
  copyright?: string;
  uploadDate?: string;
  uploader?: string;
  notes?: string;
  priority: number;
  accessCount: number;
  lastAccessed: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  processingStatus: string;
  dataQuality?: string;
  verificationStatus?: string;
}

interface UseWorkScoresOptions {
  workId: string;
  source?: 'IMSLP' | 'CUSTOM' | 'UPLOAD';
  limit?: number; // ✅ ANTIGO: limite total
  limitPerType?: number; // ✅ NOVO: limite por tipo de partitura
  enabled?: boolean;
  autoRefetch?: boolean;
  refetchInterval?: number;
}

interface UseWorkScoresReturn {
  workScores: WorkScore[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  findWorkScore: (
    sourceId: string,
    source?: string
  ) => Promise<WorkScore | null>;
  pagination: {
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalByType?: { [key: string]: number }; // ✅ NOVO: Total por tipo
    loadedByType?: { [key: string]: number }; // ✅ NOVO: Carregado por tipo
  };
}

export const useWorkScores = (
  options: UseWorkScoresOptions
): UseWorkScoresReturn => {
  const {
    workId,
    source,
    limit = 50,
    limitPerType, // ✅ NOVO: limite por tipo
    enabled = true,
    autoRefetch = false,
    refetchInterval = 0,
  } = options;

  const [workScores, setWorkScores] = useState<WorkScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [pagination, setPagination] = useState({
    limit: limitPerType || limit,
    offset: 0,
    hasNext: false,
    hasPrev: false,
    totalByType: {} as { [key: string]: number },
    loadedByType: {} as { [key: string]: number },
  });

  // ✅ Função para buscar WorkScores com limite por tipo
  const fetchWorkScores = useCallback(
    async (resetOffset = true) => {
      if (!enabled || !workId) return;

      console.log(
        `🔍 [USE-WORK-SCORES] Buscando WorkScores para obra: ${workId}`,
        { limitPerType, limit, resetOffset }
      );

      setLoading(true);
      setError(null);

      try {
        const currentOffset = resetOffset ? 0 : offset;
        const params = new URLSearchParams({
          workId,
          offset: currentOffset.toString(),
        });

        // ✅ NOVO: Usar limitPerType se fornecido
        if (limitPerType) {
          params.append('limitPerType', limitPerType.toString());
          console.log(
            `📊 [USE-WORK-SCORES] Usando limitPerType: ${limitPerType}`
          );
        } else {
          params.append('limit', limit.toString());
          console.log(`📊 [USE-WORK-SCORES] Usando limit total: ${limit}`);
        }

        if (source) {
          params.append('source', source);
        }

        const response = await fetch(`/api/work-scores?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          const newWorkScores = result.workScores || [];

          if (resetOffset) {
            setWorkScores(newWorkScores);
            setOffset(newWorkScores.length);
          } else {
            // ✅ INCREMENTAL: Adicionar sem duplicar
            setWorkScores((prev) => {
              const existingIds = new Set(prev.map((ws) => ws.id));
              const uniqueNew = newWorkScores.filter(
                (ws: WorkScore) => !existingIds.has(ws.id)
              );
              return [...prev, ...uniqueNew];
            });
            setOffset((prev) => prev + newWorkScores.length);
          }

          setTotal(result.total || 0);
          setHasMore(result.hasMore || false);

          // ✅ NOVO: Atualizar paginação com dados por tipo
          setPagination(
            result.pagination || {
              limit: limitPerType || limit,
              offset: currentOffset,
              hasNext: false,
              hasPrev: false,
              totalByType: result.totalByType || {},
              loadedByType: result.loadedByType || {},
            }
          );

          console.log(
            `✅ [USE-WORK-SCORES] Carregados ${newWorkScores.length}/${result.total} WorkScores`,
            {
              totalByType: result.totalByType,
              loadedByType: result.loadedByType,
              hasMore: result.hasMore,
            }
          );
        } else {
          throw new Error(result.error || 'Erro ao buscar WorkScores');
        }
      } catch (error) {
        console.error('❌ [USE-WORK-SCORES] Erro:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    },
    [workId, source, limit, limitPerType, enabled, offset]
  );

  // ✅ Função para recarregar do início
  const refetch = useCallback(async () => {
    await fetchWorkScores(true);
  }, [fetchWorkScores]);

  // ✅ Função para carregar mais (INCREMENTAL)
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) {
      console.log('⚠️ [USE-WORK-SCORES] LoadMore cancelado:', {
        hasMore,
        loading,
      });
      return;
    }
    console.log('📈 [USE-WORK-SCORES] Carregando mais...');
    await fetchWorkScores(false);
  }, [hasMore, loading, fetchWorkScores]);

  // ✅ Função para buscar WorkScore específico
  const findWorkScore = useCallback(
    async (
      sourceId: string,
      scoreSource?: string
    ): Promise<WorkScore | null> => {
      if (!workId || !sourceId) return null;

      console.log(
        `🎯 [USE-WORK-SCORES] Buscando WorkScore específico: ${sourceId}`
      );

      try {
        const params = new URLSearchParams({
          workId,
          sourceId,
        });

        if (scoreSource) {
          params.append('source', scoreSource);
        }

        const response = await fetch(`/api/work-scores?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.found && result.workScore) {
          console.log(
            `✅ [USE-WORK-SCORES] WorkScore encontrado: ${result.workScore.id}`
          );
          return result.workScore;
        } else {
          console.log(
            `⚠️ [USE-WORK-SCORES] WorkScore não encontrado: ${sourceId}`
          );
          return null;
        }
      } catch (error) {
        console.error(
          '❌ [USE-WORK-SCORES] Erro ao buscar WorkScore específico:',
          error
        );
        return null;
      }
    },
    [workId]
  );

  // ✅ Carregar dados iniciais
  useEffect(() => {
    if (enabled && workId) {
      fetchWorkScores(true);
    }
  }, [workId, source, enabled, limitPerType, limit, fetchWorkScores]);

  // ✅ Auto-refetch (se habilitado)
  useEffect(() => {
    if (!autoRefetch || !refetchInterval || refetchInterval <= 0) return;

    const interval = setInterval(() => {
      if (enabled && workId) {
        refetch();
      }
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [autoRefetch, refetchInterval, enabled, workId, refetch]);

  // ✅ Reset quando workId muda
  useEffect(() => {
    setWorkScores([]);
    setError(null);
    setTotal(0);
    setHasMore(false);
    setOffset(0);
    setPagination({
      limit: limitPerType || limit,
      offset: 0,
      hasNext: false,
      hasPrev: false,
      totalByType: {},
      loadedByType: {},
    });
  }, [workId, limitPerType, limit]);

  return {
    workScores,
    loading,
    error,
    total,
    hasMore,
    refetch,
    loadMore,
    findWorkScore,
    pagination,
  };
};

// ✅ Hook simplificado para buscar um WorkScore específico (mantido igual)
export const useWorkScore = (
  workId: string,
  sourceId: string,
  source?: string
) => {
  const [workScore, setWorkScore] = useState<WorkScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkScore = useCallback(async () => {
    if (!workId || !sourceId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        workId,
        sourceId,
      });

      if (source) {
        params.append('source', source);
      }

      const response = await fetch(`/api/work-scores?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.found && result.workScore) {
        setWorkScore(result.workScore);
      } else {
        setWorkScore(null);
      }
    } catch (error) {
      console.error('❌ [USE-WORK-SCORE] Erro:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      setWorkScore(null);
    } finally {
      setLoading(false);
    }
  }, [workId, sourceId, source]);

  useEffect(() => {
    fetchWorkScore();
  }, [fetchWorkScore]);

  return {
    workScore,
    loading,
    error,
    refetch: fetchWorkScore,
  };
};
