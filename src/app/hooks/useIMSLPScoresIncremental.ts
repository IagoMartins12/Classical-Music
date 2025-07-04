// app/hooks/useIMSLPScoresIncremental.ts - Hook CORRIGIDO para Nova Lógica
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { IMSLPWorkScoresIncremental } from '@/app/libs/imslp-score-scraper-incremental';
import {
  sumLoadedCounts,
  sumTotalCounts,
  hasMoreScores,
  TabStatistics,
  getTabStatistics,
} from '@/app/utils/type-utils';

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
  loadMore: (amount?: number, specificType?: string) => Promise<void>;
  loadMoreForTab: (tabType: string, amount?: number) => Promise<void>;
  loadAll: () => Promise<void>;

  // Estados de cache
  fromCache: boolean;
  backgroundCaching: boolean;
  cacheProgress: number;

  // Seleção de partitura
  selectedScore: string | null;
  setSelectedScore: (scoreId: string | null) => void;

  // Estatísticas por tab
  getTabStats: (tabType: string) => TabStatistics;

  // 🆕 Debug info
  strategy: 'first-time-limited' | 'cache-all' | 'load-more';
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
  const [strategy, setStrategy] = useState<
    'first-time-limited' | 'cache-all' | 'load-more'
  >('first-time-limited');

  // Refs para controle
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUrlRef = useRef<string>('');
  const loadingRef = useRef(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 🆕 Função principal de carregamento com nova lógica
   */
  const fetchScores = useCallback(
    async (isLoadMore = false, customLimit?: number, specificType?: string) => {
      if (!imslpUrl || !enabled || loadingRef.current) {
        return;
      }

      // Cancelar requisição anterior
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const isInitialLoad = !isLoadMore;
      const limit = customLimit || (isLoadMore ? moreLimit : initialLimit);

      if (isLoadMore) {
        setLoadingMore(true);
        setStrategy('load-more');
      } else {
        setLoading(true);
        setStrategy('first-time-limited');
      }

      setError(null);
      loadingRef.current = true;

      const loadType = specificType
        ? `específico (${specificType})`
        : isLoadMore
        ? 'mais partituras'
        : 'carregamento inicial';

      console.log(`🎼 [HOOK-NEW] ${loadType}: limit=${limit}`);

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
              offset: 0, // API gerencia offset automaticamente
              loadMore: isLoadMore,
              specificTypes: specificType ? [specificType] : undefined,
              targetTabType: specificType,
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

        // 🆕 Interpretar a estratégia da API
        const apiStrategy = data._metadata?.strategy || 'unknown';
        console.log(`📋 [HOOK-NEW] Estratégia da API: ${apiStrategy}`);

        if (apiStrategy === 'show-all-cached') {
          console.log(
            `✅ [HOOK-NEW] API retornou TODAS as partituras do cache`
          );
          setStrategy('cache-all');
          setFromCache(true);
        } else if (apiStrategy === 'first-time-limited') {
          console.log(
            `✅ [HOOK-NEW] API retornou partituras limitadas (primeira vez)`
          );
          setStrategy('first-time-limited');
          setFromCache(false);
        }

        // 🆕 Lógica de atualização baseada na estratégia
        if (isLoadMore && scores && !data.fromCache) {
          // LoadMore com scraping adicional - combinar dados
          const combinedData = combineScoresData(scores, data);
          setScores(combinedData);

          const newTotalLoaded = sumLoadedCounts(combinedData.loadedCounts);
          const totalAvailable = sumTotalCounts(combinedData.totalCounts);

          onLoadMoreComplete?.(newTotalLoaded, totalAvailable);
        } else {
          // Primeira carga ou cache hit completo
          setScores(data);
          onScoresCached?.(data.fromCache || false);
        }

        setFromCache(data.fromCache || false);
        setError(null);

        // Calcular estatísticas
        const realTotalAvailable = sumTotalCounts(data.totalCounts);
        const realCurrentLoaded = sumLoadedCounts(data.loadedCounts);
        const realHasMore = hasMoreScores(data.loadedCounts, data.totalCounts);

        console.log(
          `📊 [HOOK-NEW] Estado atualizado: ${realCurrentLoaded}/${realTotalAvailable}, hasMore: ${realHasMore}, strategy: ${apiStrategy}`
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
        console.error(`❌ [HOOK-NEW] Erro:`, errorMessage);

        setError(errorMessage);
        if (!isLoadMore) {
          setScores(null);
          setFromCache(false);
          setStrategy('first-time-limited');
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
   * 🚀 Carregar mais partituras gerais
   */
  const loadMore = useCallback(
    async (amount = moreLimit, specificType?: string) => {
      if (!scores || loadingMore || loading) {
        console.log(
          `⚠️ [HOOK-NEW] LoadMore cancelado: sem dados ou já carregando`
        );
        return;
      }

      const hasMoreToLoad = hasMoreScores(
        scores.loadedCounts,
        scores.totalCounts
      );
      if (!hasMoreToLoad) {
        console.log(`⚠️ [HOOK-NEW] LoadMore cancelado: sem mais partituras`);
        return;
      }

      console.log(
        `🔄 [HOOK-NEW] Executando loadMore com strategy: ${strategy}`
      );
      await fetchScores(true, amount, specificType);
    },
    [scores, loadingMore, loading, fetchScores, moreLimit, strategy]
  );

  /**
   * 🆕 Carregar mais partituras para uma tab específica
   */
  const loadMoreForTab = useCallback(
    async (tabType: string, amount = moreLimit) => {
      if (!scores || loadingMore || loading) {
        console.log(`⚠️ [HOOK-NEW] LoadMoreForTab cancelado: ${tabType}`);
        return;
      }

      const tabStats = getTabStats(tabType);
      if (!tabStats.hasMore) {
        console.log(`⚠️ [HOOK-NEW] Tab ${tabType} não tem mais partituras`);
        return;
      }

      console.log(
        `🎯 [HOOK-NEW] Carregando mais partituras para tab: ${tabType}, strategy: ${strategy}`
      );
      await fetchScores(true, amount, tabType);
    },
    [scores, loadingMore, loading, fetchScores, moreLimit, strategy]
  );

  /**
   * 🚀 Carregar todas as partituras
   */
  const loadAll = useCallback(async () => {
    if (!scores || loadingMore || loading) {
      console.log(`⚠️ [HOOK-NEW] LoadAll cancelado`);
      return;
    }

    const hasMoreToLoad = hasMoreScores(
      scores.loadedCounts,
      scores.totalCounts
    );
    if (!hasMoreToLoad) {
      console.log(`⚠️ [HOOK-NEW] LoadAll cancelado: sem mais partituras`);
      return;
    }

    console.log(
      `🚀 [HOOK-NEW] Carregando todas as partituras restantes, strategy: ${strategy}`
    );

    const currentLoaded = sumLoadedCounts(scores.loadedCounts);
    const totalAvailable = sumTotalCounts(scores.totalCounts);
    const remaining = totalAvailable - currentLoaded;

    if (remaining > 0) {
      await fetchScores(true, remaining);
    }
  }, [scores, loadingMore, loading, fetchScores, strategy]);

  /**
   * 🚀 Refetch completo
   */
  const refetch = useCallback(async () => {
    console.log(`🔄 [HOOK-NEW] Executando refetch, resetando strategy`);
    setStrategy('first-time-limited');
    await fetchScores(false);
  }, [fetchScores]);

  /**
   * 🆕 Obter estatísticas de uma tab específica
   */
  const getTabStats = useCallback(
    (tabType: string): TabStatistics => {
      if (!scores) {
        return {
          loaded: 0,
          total: 0,
          remaining: 0,
          hasMore: false,
          progress: 0,
        };
      }

      return getTabStatistics(tabType, scores.loadedCounts, scores.totalCounts);
    },
    [scores]
  );

  /**
   * 🚀 Monitorar progresso do cache em background
   */
  const startCacheProgressMonitoring = useCallback((workId: string) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    console.log(
      `📊 [HOOK-NEW] Iniciando monitoramento de cache para ${workId}`
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
              `✅ [HOOK-NEW] Cache em background concluído para ${workId}`
            );
          }
        }
      } catch (error) {
        console.error(`❌ [HOOK-NEW] Erro ao monitorar progresso:`, error);
      }
    }, 3000);
  }, []);

  // Effect principal
  useEffect(() => {
    if (imslpUrl && enabled && imslpUrl !== lastUrlRef.current) {
      lastUrlRef.current = imslpUrl;
      setStrategy('first-time-limited'); // Reset strategy
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

  // Calcular estatísticas gerais
  const currentLoaded = scores ? sumLoadedCounts(scores.loadedCounts) : 0;
  const totalAvailable = scores ? sumTotalCounts(scores.totalCounts) : 0;
  const hasMore = scores
    ? hasMoreScores(scores.loadedCounts, scores.totalCounts)
    : false;

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
    loadMoreForTab,
    loadAll,
    fromCache,
    backgroundCaching,
    cacheProgress,
    selectedScore,
    setSelectedScore,
    getTabStats,
    strategy, // 🆕 Expor strategy para debug
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

    // Evitar duplicatas - apenas adicionar grupos que não existem
    const combinedGroups = [...existingGroups];

    for (const newGroup of newGroups) {
      const existingGroup = combinedGroups.find(
        (g) => g.groupIndex === newGroup.groupIndex
      );

      if (!existingGroup) {
        combinedGroups.push(newGroup);
      } else {
        // Combinar scores dentro do grupo, evitando duplicatas
        const existingScoreIds = new Set(existingGroup.scores.map((s) => s.id));
        const newScores = newGroup.scores.filter(
          (s) => !existingScoreIds.has(s.id)
        );
        existingGroup.scores.push(...newScores);
      }
    }

    combined.scoresByType[type as keyof typeof combined.scoresByType] =
      combinedGroups;
  });

  // Atualizar contadores corretamente
  Object.keys(newData.loadedCounts).forEach((type) => {
    const typeGroups =
      combined.scoresByType[type as keyof typeof combined.scoresByType] || [];
    const realCount = typeGroups.reduce(
      (sum, group) => sum + group.scores.length,
      0
    );
    combined.loadedCounts[type as keyof typeof combined.loadedCounts] =
      realCount;
  });

  // Atualizar hasMore
  combined.hasMore = hasMoreScores(combined.loadedCounts, combined.totalCounts);

  const totalLoaded = sumLoadedCounts(combined.loadedCounts);
  const totalAvailable = sumTotalCounts(combined.totalCounts);

  console.log(
    `🔄 [HOOK-NEW] Dados combinados: ${totalLoaded}/${totalAvailable} partituras`
  );

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
