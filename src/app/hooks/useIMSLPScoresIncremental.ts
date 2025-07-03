// app/hooks/useIMSLPScoresIncremental.ts - Hook com Carregamento Incremental
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { IMSLPWorkScoresIncremental } from '@/app/libs/imslp-score-scraper-incremental';

export interface UseIMSLPScoresIncrementalResult {
  scores: IMSLPWorkScoresIncremental | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  totalAvailable: number;
  currentLoaded: number;

  // Funções de carregamento
  refetch: () => Promise<void>;
  loadMore: (amount?: number) => Promise<void>;
  loadAll: () => Promise<void>;

  // Estados de cache
  fromCache: boolean;
  backgroundCaching: boolean;
  cacheProgress: number; // 0-100%

  // Seleção de partitura
  selectedScore: string | null;
  setSelectedScore: (scoreId: string | null) => void;
}

export interface UseIMSLPScoresIncrementalOptions {
  workId?: string;
  enabled?: boolean;
  initialLimit?: number;
  moreLimit?: number;
  priorityScoreId?: string;
  forceRefresh?: boolean;
  onScoresCached?: (fromCache: boolean) => void;
  onLoadMoreComplete?: (newCount: number, totalCount: number) => void;
}

export function useIMSLPScoresIncremental(
  imslpUrl: string,
  options: UseIMSLPScoresIncrementalOptions = {}
): UseIMSLPScoresIncrementalResult {
  const {
    enabled = true,
    initialLimit = 5,
    moreLimit = 20,
    priorityScoreId,
    forceRefresh = false,
    onScoresCached,
    onLoadMoreComplete,
  } = options;

  // Estados principais
  const [scores, setScores] = useState<IMSLPWorkScoresIncremental | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [backgroundCaching, setBackgroundCaching] = useState(false);
  const [cacheProgress, setCacheProgress] = useState(0);
  const [selectedScore, setSelectedScore] = useState<string | null>(
    priorityScoreId || null
  );

  // Estados de paginação
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Refs para controle
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUrlRef = useRef<string>('');
  const loadingRef = useRef(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 🚀 Função principal de carregamento
   */
  const fetchScores = useCallback(
    async (isLoadMore = false, customLimit?: number) => {
      if (!imslpUrl || !enabled || loadingRef.current) {
        return;
      }

      // Cancelar requisição anterior
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const isInitialLoad = !isLoadMore && currentOffset === 0;
      const offset = isLoadMore ? currentOffset : 0;
      const limit = customLimit || (isLoadMore ? moreLimit : initialLimit);

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null);
      loadingRef.current = true;

      console.log(
        `🎼 [HOOK-INC] ${
          isLoadMore ? 'Carregando mais' : 'Carregamento inicial'
        }: offset=${offset}, limit=${limit}`
      );

      try {
        const response = await fetch('/api/imslp-scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imslpUrl,
            workId: options.workId,
            priorityScoreId,
            forceRefresh: isInitialLoad ? forceRefresh : false,
            pagination: {
              limit,
              offset,
              loadMore: isLoadMore,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Erro HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.details || data.error);
        }

        // Atualizar estados
        if (isLoadMore && scores) {
          // Combinar com dados existentes
          const combinedData = combineScoresData(scores, data);
          setScores(combinedData);

          const newTotalLoaded = Object.values(
            combinedData.loadedCounts
          ).reduce((sum: number, count: number) => sum + count, 0);

          onLoadMoreComplete?.(
            newTotalLoaded,
            Object.values(combinedData.totalCounts).reduce(
              (sum: number, count: number) => sum + count,
              0
            )
          );
        } else {
          // Primeira carga ou cache hit
          setScores(data);
          onScoresCached?.(data.fromCache || false);
        }

        setFromCache(data.fromCache || false);

        // 🆕 Calcular hasMore baseado nos totais reais vs carregados
        const realTotalAvailable = Object.values(data.totalCounts).reduce(
          (sum: number, count: number) => sum + count,
          0
        );
        const realCurrentLoaded = Object.values(data.loadedCounts).reduce(
          (sum: number, count: number) => sum + count,
          0
        );

        const realHasMore = realCurrentLoaded < realTotalAvailable;
        setHasMore(realHasMore);

        // Atualizar offset para próximo carregamento
        if (isLoadMore) {
          setCurrentOffset(currentOffset + limit);
        } else {
          setCurrentOffset(realCurrentLoaded); // Para cache hit, offset = total já carregado
        }

        setError(null);

        console.log(
          `📊 [HOOK-INC] Estado atualizado: ${realCurrentLoaded}/${realTotalAvailable}, hasMore: ${realHasMore}`
        );

        // Auto-selecionar primeira partitura se necessário
        if (!selectedScore && data.scoresByType && !isLoadMore) {
          const firstScore = findFirstAvailableScore(data.scoresByType);
          if (firstScore) {
            setSelectedScore(firstScore.id);
          }
        }

        // Iniciar monitoramento de cache em background
        if (data.backgroundCachingStarted && options.workId) {
          setBackgroundCaching(true);
          startCacheProgressMonitoring(options.workId);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        console.error(`❌ [HOOK-INC] Erro:`, errorMessage);

        setError(errorMessage);
        if (!isLoadMore) {
          setScores(null);
          setFromCache(false);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        loadingRef.current = false;
      }
    },
    [
      imslpUrl,
      enabled,
      priorityScoreId,
      forceRefresh,
      currentOffset,
      initialLimit,
      moreLimit,
      onScoresCached,
      onLoadMoreComplete,
      selectedScore,
      scores,
      options.workId,
    ]
  );

  /**
   * 🚀 Carregar mais partituras
   */
  const loadMore = useCallback(
    async (amount = moreLimit) => {
      if (!hasMore || loadingMore || loading) {
        console.log(
          `⚠️ [HOOK-INC] LoadMore cancelado: hasMore=${hasMore}, loading=${
            loading || loadingMore
          }`
        );
        return;
      }

      await fetchScores(true, amount);
    },
    [hasMore, loadingMore, loading, fetchScores, moreLimit]
  );

  /**
   * 🚀 Carregar todas as partituras
   */
  const loadAll = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;

    console.log(`🚀 [HOOK-INC] Carregando todas as partituras restantes`);

    // Calcular quantas partituras restam
    if (scores) {
      const currentLoaded = Object.values(scores.loadedCounts).reduce(
        (sum: number, count: number) => sum + count,
        0
      );
      const totalAvailable = Object.values(scores.totalCounts).reduce(
        (sum: number, count: number) => sum + count,
        0
      );
      const remaining = totalAvailable - currentLoaded;

      if (remaining > 0) {
        await fetchScores(true, remaining);
      }
    }
  }, [hasMore, loadingMore, loading, scores, fetchScores]);

  /**
   * 🚀 Refetch completo
   */
  const refetch = useCallback(async () => {
    setCurrentOffset(0);
    setHasMore(true);
    await fetchScores(false);
  }, [fetchScores]);

  /**
   * 🚀 Monitorar progresso do cache em background
   */
  const startCacheProgressMonitoring = useCallback((workId: string) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    console.log(
      `📊 [HOOK-INC] Iniciando monitoramento de cache para ${workId}`
    );

    progressIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/imslp-scores?type=cache-progress&workId=${workId}`
        );
        const data = await response.json();

        if (data.progress !== undefined) {
          setCacheProgress(data.progress);

          if (data.progress >= 100 || data.completed) {
            setBackgroundCaching(false);
            setCacheProgress(100);
            clearInterval(progressIntervalRef.current!);
            progressIntervalRef.current = null;
            console.log(
              `✅ [HOOK-INC] Cache em background concluído para ${workId}`
            );
          }
        }
      } catch (error) {
        console.error(`❌ [HOOK-INC] Erro ao monitorar progresso:`, error);
      }
    }, 3000); // Verificar a cada 3 segundos
  }, []);

  // Effect principal
  useEffect(() => {
    if (imslpUrl && enabled && imslpUrl !== lastUrlRef.current) {
      lastUrlRef.current = imslpUrl;
      setCurrentOffset(0);
      setHasMore(true);
      fetchScores(false);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [imslpUrl, enabled, fetchScores]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      loadingRef.current = false;
    };
  }, []);

  // Calcular estatísticas
  const currentLoaded = scores
    ? Object.values(scores.loadedCounts).reduce(
        (sum: number, count: number) => sum + count,
        0
      )
    : 0;

  const totalAvailable = scores
    ? Object.values(scores.totalCounts).reduce(
        (sum: number, count: number) => sum + count,
        0
      )
    : 0;

  return {
    scores,
    loading,
    loadingMore,
    error,
    hasMore,
    totalAvailable,
    currentLoaded,
    refetch,
    loadMore,
    loadAll,
    fromCache,
    backgroundCaching,
    cacheProgress,
    selectedScore,
    setSelectedScore,
  };
}

/**
 * 🚀 Utilitários
 */
function combineScoresData(
  existing: IMSLPWorkScoresIncremental,
  newData: IMSLPWorkScoresIncremental
): IMSLPWorkScoresIncremental {
  const combined = { ...existing };

  // Combinar scoresByType
  Object.keys(newData.scoresByType).forEach((type) => {
    const existingGroups =
      existing.scoresByType[type as keyof typeof existing.scoresByType] || [];
    const newGroups =
      newData.scoresByType[type as keyof typeof newData.scoresByType] || [];

    // Combinar grupos (assumindo que os novos grupos vêm depois)
    combined.scoresByType[type as keyof typeof combined.scoresByType] = [
      ...existingGroups,
      ...newGroups,
    ];
  });

  // Atualizar contadores
  Object.keys(newData.loadedCounts).forEach((type) => {
    combined.loadedCounts[type as keyof typeof combined.loadedCounts] =
      (existing.loadedCounts[type as keyof typeof existing.loadedCounts] || 0) +
      (newData.loadedCounts[type as keyof typeof newData.loadedCounts] || 0);
  });

  // Atualizar hasMore e pagination
  combined.hasMore = newData.hasMore;
  combined.pagination = newData.pagination;

  return combined;
}

function findFirstAvailableScore(scoresByType: any): { id: string } | null {
  const typeOrder = [
    'scores',
    'parts',
    'arrangements',
    'librettos',
    'others',
    'sources',
  ];

  for (const type of typeOrder) {
    const groups = scoresByType[type];
    if (groups && groups.length > 0) {
      const firstGroup = groups[0];
      if (firstGroup.scores && firstGroup.scores.length > 0) {
        return firstGroup.scores[0];
      }
    }
  }

  return null;
}
