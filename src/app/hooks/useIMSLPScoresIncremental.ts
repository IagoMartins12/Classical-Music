// app/hooks/useIMSLPScoresIncremental.ts - Hook Corrigido
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
  cacheProgress: number; // 0-100%

  // Seleção de partitura
  selectedScore: string | null;
  setSelectedScore: (scoreId: string | null) => void;

  // 🆕 Estatísticas por tab corrigidas
  getTabStats: (tabType: string) => TabStatistics;
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

  // Refs para controle
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUrlRef = useRef<string>('');
  const loadingRef = useRef(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 🚀 Função principal de carregamento
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
      } else {
        setLoading(true);
      }

      setError(null);
      loadingRef.current = true;

      const loadType = specificType
        ? `específico (${specificType})`
        : isLoadMore
        ? 'mais partituras'
        : 'carregamento inicial';

      console.log(`🎼 [HOOK-INC] ${loadType}: limit=${limit}`);

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
              offset: 0, // API calcula offset automaticamente
              loadMore: isLoadMore,
              specificTypes: specificType ? [specificType] : undefined,
              targetTabType: specificType, // 🆕 Usar tab específica
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

        // 🆕 Lógica atualizada para lidar com cache e loadMore
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

        // 🆕 Calcular hasMore baseado nos dados reais
        const realTotalAvailable = sumTotalCounts(data.totalCounts);
        const realCurrentLoaded = sumLoadedCounts(data.loadedCounts);
        const realHasMore = hasMoreScores(data.loadedCounts, data.totalCounts);

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
          `⚠️ [HOOK-INC] LoadMore cancelado: sem dados ou já carregando`
        );
        return;
      }

      const hasMoreToLoad = hasMoreScores(
        scores.loadedCounts,
        scores.totalCounts
      );
      if (!hasMoreToLoad) {
        console.log(`⚠️ [HOOK-INC] LoadMore cancelado: sem mais partituras`);
        return;
      }

      await fetchScores(true, amount, specificType);
    },
    [scores, loadingMore, loading, fetchScores, moreLimit]
  );

  /**
   * 🆕 Carregar mais partituras para uma tab específica
   */
  const loadMoreForTab = useCallback(
    async (tabType: string, amount = moreLimit) => {
      if (!scores || loadingMore || loading) {
        console.log(`⚠️ [HOOK-INC] LoadMoreForTab cancelado: ${tabType}`);
        return;
      }

      const tabStats = getTabStats(tabType);
      if (!tabStats.hasMore) {
        console.log(`⚠️ [HOOK-INC] Tab ${tabType} não tem mais partituras`);
        return;
      }

      console.log(
        `🎯 [HOOK-INC] Carregando mais partituras para tab: ${tabType}`
      );
      await fetchScores(true, amount, tabType);
    },
    [scores, loadingMore, loading, fetchScores, moreLimit]
  );

  /**
   * 🚀 Carregar todas as partituras
   */
  const loadAll = useCallback(async () => {
    if (!scores || loadingMore || loading) {
      console.log(`⚠️ [HOOK-INC] LoadAll cancelado`);
      return;
    }

    const hasMoreToLoad = hasMoreScores(
      scores.loadedCounts,
      scores.totalCounts
    );
    if (!hasMoreToLoad) {
      console.log(`⚠️ [HOOK-INC] LoadAll cancelado: sem mais partituras`);
      return;
    }

    console.log(`🚀 [HOOK-INC] Carregando todas as partituras restantes`);

    // Calcular quantas partituras restam
    const currentLoaded = sumLoadedCounts(scores.loadedCounts);
    const totalAvailable = sumTotalCounts(scores.totalCounts);
    const remaining = totalAvailable - currentLoaded;

    if (remaining > 0) {
      await fetchScores(true, remaining); // Sem specificType = carrega todas
    }
  }, [scores, loadingMore, loading, fetchScores]);

  /**
   * 🚀 Refetch completo
   */
  const refetch = useCallback(async () => {
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

    // 🆕 Evitar duplicatas - apenas adicionar grupos que não existem
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

  // 🆕 Atualizar contadores corretamente
  Object.keys(newData.loadedCounts).forEach((type) => {
    // Contar partituras reais ao invés de somar contadores
    const typeGroups =
      combined.scoresByType[type as keyof typeof combined.scoresByType] || [];
    const realCount = typeGroups.reduce(
      (sum, group) => sum + group.scores.length,
      0
    );
    combined.loadedCounts[type as keyof typeof combined.loadedCounts] =
      realCount;
  });

  // Manter totais do existente (que são os corretos)
  // combined.totalCounts já está correto

  // Atualizar hasMore
  combined.hasMore = hasMoreScores(combined.loadedCounts, combined.totalCounts);

  const totalLoaded = sumLoadedCounts(combined.loadedCounts);
  const totalAvailable = sumTotalCounts(combined.totalCounts);

  console.log(
    `🔄 [HOOK-INC] Dados combinados: ${totalLoaded}/${totalAvailable} partituras`
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
