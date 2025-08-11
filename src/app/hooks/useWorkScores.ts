// hooks/useWorkScores.ts - Hook CORRIGIDO SEM LOOPS INFINITOS
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

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
  limit?: number;
  limitPerType?: number;
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
  loadMoreForType: (scoreType: string) => Promise<void>;
  findWorkScore: (
    sourceId: string,
    source?: string
  ) => Promise<WorkScore | null>;
  pagination: {
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalByType?: { [key: string]: number };
    loadedByType?: { [key: string]: number };
  };
}

export const useWorkScores = (
  options: UseWorkScoresOptions
): UseWorkScoresReturn => {
  const {
    workId,
    source,
    limit = 50,
    limitPerType,
    enabled = true,
    autoRefetch = false,
    refetchInterval = 0,
  } = options;

  // 🔥 ESTADOS ESTÁVEIS
  const [workScores, setWorkScores] = useState<WorkScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  // 🔥 ESTADO DE PAGINAÇÃO SIMPLIFICADO
  const [pagination, setPagination] = useState(() => ({
    limit: limitPerType || limit,
    offset: 0,
    hasNext: false,
    hasPrev: false,
    totalByType: {} as { [key: string]: number },
    loadedByType: {} as { [key: string]: number },
  }));

  // 🔥 USAR REFS PARA CONTROLE DE CHAMADAS E EVITAR LOOPS
  const loadingRef = useRef(false);
  const lastWorkIdRef = useRef<string>('');
  const hasInitializedRef = useRef(false);
  const autoRefetchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🔥 MEMOIZAR OPÇÕES DE FORMA ULTRA ESTÁVEL
  const stableOptions = useMemo(
    () => ({
      workId: workId || '',
      source: source || undefined,
      limit: limit || 50,
      limitPerType: limitPerType || undefined,
      enabled: enabled !== false,
    }),
    [workId, source, limit, limitPerType, enabled]
  );

  // 🔥 FUNÇÃO PARA BUSCAR WORK SCORES - ULTRA CONTROLADA
  const fetchWorkScores = useCallback(
    async (resetOffset = true) => {
      // 🔥 VERIFICAÇÕES MÚLTIPLAS PARA EVITAR CHAMADAS DESNECESSÁRIAS
      if (
        !stableOptions.enabled ||
        !stableOptions.workId ||
        loadingRef.current
      ) {
        console.log('🔍 [USE-WORK-SCORES] Busca ignorada:', {
          enabled: stableOptions.enabled,
          workId: !!stableOptions.workId,
          loading: loadingRef.current,
        });
        return;
      }

      console.log('🚀 [USE-WORK-SCORES] Carregando dados iniciais...');

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const currentOffset = resetOffset ? 0 : offset;
        const params = new URLSearchParams({
          workId: stableOptions.workId,
          offset: currentOffset.toString(),
        });

        console.log(
          '🔍 [USE-WORK-SCORES] Buscando WorkScores para obra:',
          stableOptions.workId,
          {
            limitPerType: stableOptions.limitPerType,
            limit: stableOptions.limit,
            resetOffset,
          }
        );

        // Usar limitPerType se fornecido
        if (stableOptions.limitPerType) {
          params.append('limitPerType', stableOptions.limitPerType.toString());
        } else {
          params.append('limit', stableOptions.limit.toString());
        }

        if (stableOptions.source) {
          params.append('source', stableOptions.source);
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
            // INCREMENTAL: Adicionar sem duplicar
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

          // 🔥 ATUALIZAR PAGINAÇÃO DE FORMA MAIS ESTÁVEL
          setPagination((prev) => {
            const newTotalByType =
              result.totalByType || result.pagination?.totalByType || {};
            const newLoadedByType =
              result.loadedByType || result.pagination?.loadedByType || {};

            // Só atualizar se realmente mudou
            const hasChanged =
              JSON.stringify(prev.totalByType) !==
                JSON.stringify(newTotalByType) ||
              JSON.stringify(prev.loadedByType) !==
                JSON.stringify(newLoadedByType);

            if (!hasChanged && !resetOffset) {
              return prev; // Manter objeto existente se não houve mudanças
            }

            return {
              limit: stableOptions.limitPerType || stableOptions.limit,
              offset: currentOffset,
              hasNext: result.hasMore || false,
              hasPrev: currentOffset > 0,
              totalByType: newTotalByType,
              loadedByType: newLoadedByType,
            };
          });

          console.log(
            '✅ [USE-WORK-SCORES] Carregados',
            newWorkScores.length,
            '/',
            result.total,
            'WorkScores',
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
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [stableOptions, offset]
  );

  // 🔥 FUNÇÃO PARA RECARREGAR DO INÍCIO - MEMOIZADA E ESTÁVEL
  const refetch = useCallback(async () => {
    console.log('🔄 [USE-WORK-SCORES] Refetch solicitado');
    hasInitializedRef.current = false; // Permitir nova inicialização
    await fetchWorkScores(true);
    hasInitializedRef.current = true;
  }, [fetchWorkScores]);

  // 🔥 FUNÇÃO PARA CARREGAR MAIS - MEMOIZADA E ESTÁVEL
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current) {
      console.log('⚠️ [USE-WORK-SCORES] LoadMore cancelado:', {
        hasMore,
        loading: loadingRef.current,
      });
      return;
    }
    console.log('📈 [USE-WORK-SCORES] Carregando mais...');
    await fetchWorkScores(false);
  }, [hasMore, fetchWorkScores]);

  // 🔥 FUNÇÃO PARA CARREGAR MAIS DE UM TIPO ESPECÍFICO - MEMOIZADA E ESTÁVEL
  const loadMoreForType = useCallback(
    async (scoreType: string) => {
      if (!hasMore || loadingRef.current) {
        console.log('⚠️ [USE-WORK-SCORES] LoadMoreForType cancelado:', {
          hasMore,
          loading: loadingRef.current,
          scoreType,
        });
        return;
      }

      console.log(
        `📈 [USE-WORK-SCORES] Carregando mais para tipo: ${scoreType}`
      );
      await fetchWorkScores(false);
    },
    [hasMore, fetchWorkScores]
  );

  // 🔥 FUNÇÃO PARA BUSCAR WORK SCORE ESPECÍFICO - MEMOIZADA E ESTÁVEL
  const findWorkScore = useCallback(
    async (
      sourceId: string,
      scoreSource?: string
    ): Promise<WorkScore | null> => {
      if (!stableOptions.workId || !sourceId) return null;

      console.log(
        `🎯 [USE-WORK-SCORES] Buscando WorkScore específico: ${sourceId}`
      );

      try {
        const params = new URLSearchParams({
          workId: stableOptions.workId,
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
    [stableOptions.workId]
  );

  // 🔥 EFFECT PARA CARREGAR DADOS INICIAIS - ULTRA CONTROLADO
  useEffect(() => {
    // Verificar se workId mudou
    const workIdChanged = lastWorkIdRef.current !== stableOptions.workId;

    if (workIdChanged) {
      console.log('🔄 [USE-WORK-SCORES] WorkId mudou, resetando estado...', {
        anterior: lastWorkIdRef.current,
        novo: stableOptions.workId,
      });

      // Reset completo do estado
      setWorkScores([]);
      setError(null);
      setTotal(0);
      setHasMore(false);
      setOffset(0);
      setPagination({
        limit: stableOptions.limitPerType || stableOptions.limit,
        offset: 0,
        hasNext: false,
        hasPrev: false,
        totalByType: {},
        loadedByType: {},
      });

      lastWorkIdRef.current = stableOptions.workId;
      hasInitializedRef.current = false;
      loadingRef.current = false;
    }

    // Carregar dados se habilitado e não inicializado
    if (
      stableOptions.enabled &&
      stableOptions.workId &&
      !hasInitializedRef.current &&
      !loadingRef.current
    ) {
      console.log(
        '🚀 [USE-WORK-SCORES] Inicializando carregamento de dados...'
      );
      hasInitializedRef.current = true;
      fetchWorkScores(true);
    }
  }, [stableOptions.workId, stableOptions.enabled, fetchWorkScores]);

  // 🔥 AUTO-REFETCH (SE HABILITADO) - EFFECT ULTRA CONTROLADO
  useEffect(() => {
    // Limpar interval anterior se existir
    if (autoRefetchIntervalRef.current) {
      clearInterval(autoRefetchIntervalRef.current);
      autoRefetchIntervalRef.current = null;
    }

    if (!autoRefetch || !refetchInterval || refetchInterval <= 0) return;

    console.log(
      `⏰ [USE-WORK-SCORES] Auto-refetch habilitado: ${refetchInterval}ms`
    );

    autoRefetchIntervalRef.current = setInterval(() => {
      if (
        stableOptions.enabled &&
        stableOptions.workId &&
        !loadingRef.current
      ) {
        console.log('🔄 [USE-WORK-SCORES] Auto-refetch executando...');
        refetch();
      }
    }, refetchInterval);

    return () => {
      if (autoRefetchIntervalRef.current) {
        console.log('🛑 [USE-WORK-SCORES] Limpando auto-refetch');
        clearInterval(autoRefetchIntervalRef.current);
        autoRefetchIntervalRef.current = null;
      }
    };
  }, [
    autoRefetch,
    refetchInterval,
    stableOptions.enabled,
    stableOptions.workId,
    refetch,
  ]);

  // 🔥 CLEANUP EFFECT
  useEffect(() => {
    return () => {
      if (autoRefetchIntervalRef.current) {
        clearInterval(autoRefetchIntervalRef.current);
        autoRefetchIntervalRef.current = null;
      }
      loadingRef.current = false;
    };
  }, []);

  // 🔥 MEMOIZAR RETORNO PARA EVITAR RE-RENDERS DESNECESSÁRIOS
  const returnValue = useMemo(
    () => ({
      workScores,
      loading,
      error,
      total,
      hasMore,
      refetch,
      loadMore,
      loadMoreForType,
      findWorkScore,
      pagination,
    }),
    [
      workScores,
      loading,
      error,
      total,
      hasMore,
      refetch,
      loadMore,
      loadMoreForType,
      findWorkScore,
      pagination,
    ]
  );

  return returnValue;
};

// Hook simplificado para buscar um WorkScore específico (mantido igual)
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

  const returnValue = useMemo(
    () => ({
      workScore,
      loading,
      error,
      refetch: fetchWorkScore,
    }),
    [workScore, loading, error, fetchWorkScore]
  );

  return returnValue;
};
