// app/hooks/useIMSLPScores.ts - Hook Ultra-Otimizado com Carregamento Incremental
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { IMSLPWorkScores, IMSLPScore } from '@/app/libs/imslp-score-scraper';

export interface UseIMSLPScoresResult {
  scores: IMSLPWorkScores | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fromCache: boolean;
  cacheStats: {
    totalCached: number;
    lastUpdated: Date | null;
    completeness: number;
  } | null;
  selectedScore: string | null;
  setSelectedScore: (scoreId: string | null) => void;
  // 🆕 Novos campos para carregamento incremental
  hasMore: boolean;
  totalAvailable: number;
  loadingMore: boolean;
  loadMore: () => Promise<void>;
  loadAll: () => Promise<void>;
  canLoadMore: boolean;
}

export interface UseIMSLPScoresOptions {
  workId?: string;
  enabled?: boolean;
  priorityScoreId?: string;
  forceRefresh?: boolean;
  initialLimit?: number; // 🆕 Limite inicial de partituras
  onScoresCached?: (fromCache: boolean) => void;
  onScoreSelected?: (score: IMSLPScore | null) => void; // 🆕 Callback para seleção
}

export function useIMSLPScores(
  imslpUrl: string,
  options: UseIMSLPScoresOptions = {}
): UseIMSLPScoresResult {
  const {
    enabled = true,
    priorityScoreId,
    forceRefresh = false,
    initialLimit = 5, // 🆕 Limite padrão otimizado
    onScoresCached,
    onScoreSelected,
  } = options;

  // Estados existentes
  const [scores, setScores] = useState<IMSLPWorkScores | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [selectedScore, setSelectedScoreState] = useState<string | null>(
    priorityScoreId || null
  );

  // 🆕 Novos estados para carregamento incremental
  const [hasMore, setHasMore] = useState(false);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);

  // Refs para controle
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUrlRef = useRef<string>('');
  const loadingRef = useRef(false);
  const scoresMapRef = useRef<Map<string, IMSLPScore>>(new Map());

  // 🆕 Função para salvar partitura selecionada automaticamente
  const saveSelectedScore = useCallback(
    async (score: IMSLPScore) => {
      if (!options.workId) return;

      try {
        console.log(
          `💾 [HOOK-OPT] Salvando partitura selecionada: ${score.id}`
        );

        await fetch('/api/imslp-scores', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workId: options.workId,
            scoreData: score,
          }),
        });

        console.log(`✅ [HOOK-OPT] Partitura selecionada salva com sucesso`);
      } catch (error) {
        console.error(
          `❌ [HOOK-OPT] Erro ao salvar partitura selecionada:`,
          error
        );
      }
    },
    [options.workId]
  );

  // 🆕 Função otimizada para definir partitura selecionada
  const setSelectedScore = useCallback(
    (scoreId: string | null) => {
      setSelectedScoreState(scoreId);

      if (scoreId && scoresMapRef.current.has(scoreId)) {
        const score = scoresMapRef.current.get(scoreId)!;

        // Salvar automaticamente em background
        saveSelectedScore(score).catch(console.error);

        // Callback para o parent
        onScoreSelected?.(score);
      } else {
        onScoreSelected?.(null);
      }
    },
    [saveSelectedScore, onScoreSelected]
  );

  // 🆕 Função para atualizar mapa de partituras
  const updateScoresMap = useCallback((scoresData: IMSLPWorkScores) => {
    for (const groups of Object.values(scoresData.scoresByType)) {
      for (const group of groups) {
        for (const score of group.scores) {
          scoresMapRef.current.set(score.id, score);
        }
      }
    }
  }, []);

  // 🆕 Função para mesclar dados de partituras
  const mergeScoresData = useCallback(
    (
      existingData: IMSLPWorkScores,
      newData: IMSLPWorkScores
    ): IMSLPWorkScores => {
      const merged = { ...existingData };

      // Mesclar cada tipo de partitura
      for (const [type, newGroups] of Object.entries(newData.scoresByType)) {
        const existingGroups =
          merged.scoresByType[type as keyof typeof merged.scoresByType] || [];

        // Criar mapa de grupos existentes
        const existingGroupsMap = new Map(
          existingGroups.map((group) => [group.groupIndex, group])
        );

        // Mesclar grupos
        const mergedGroups = [...existingGroups];

        for (const newGroup of newGroups) {
          const existingGroup = existingGroupsMap.get(newGroup.groupIndex);

          if (existingGroup) {
            // Mesclar scores do grupo, evitando duplicatas
            const existingScoreIds = new Set(
              existingGroup.scores.map((s) => s.id)
            );
            const newScores = newGroup.scores.filter(
              (s) => !existingScoreIds.has(s.id)
            );

            if (newScores.length > 0) {
              existingGroup.scores.push(...newScores);
            }
          } else {
            mergedGroups.push(newGroup);
          }
        }

        merged.scoresByType[type as keyof typeof merged.scoresByType] =
          mergedGroups;
      }

      // Atualizar contadores
      for (const [type, groups] of Object.entries(merged.scoresByType)) {
        const totalScores = groups.reduce(
          (sum, group) => sum + group.scores.length,
          0
        );
        merged.totalCounts[type as keyof typeof merged.totalCounts] =
          totalScores;
      }

      return merged;
    },
    []
  );

  // Função principal de busca otimizada
  const fetchScores = useCallback(
    async (isLoadMore = false) => {
      if (!imslpUrl || !enabled) return;

      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      loadingRef.current = true;

      const offset = isLoadMore ? currentOffset : 0;
      const limit = isLoadMore ? 20 : initialLimit; // Mais partituras ao carregar mais

      console.log(
        `🎼 [HOOK-OPT] Buscando partituras (isLoadMore: ${isLoadMore}, offset: ${offset}, limit: ${limit})`
      );

      try {
        const response = await fetch('/api/imslp-scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imslpUrl,
            priorityScoreId,
            forceRefresh: !isLoadMore && forceRefresh,
            workId: options.workId,
            limit,
            offset,
            loadAll: false,
          }),
          signal,
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
          // Mesclar com dados existentes
          const mergedScores = mergeScoresData(scores, data);
          setScores(mergedScores);
          updateScoresMap(mergedScores);
        } else {
          // Primeira carga ou refresh
          setScores(data);
          updateScoresMap(data);
        }

        setFromCache(data.fromCache || false);
        setCacheStats(data.cacheStats || null);
        setHasMore(data.hasMore || false);
        setTotalAvailable(data.totalAvailable || 0);
        setCurrentOffset(
          offset + (data.scoresByType ? this.countReturnedScores(data) : 0)
        );
        setError(null);

        // Callback de sucesso
        onScoresCached?.(data.fromCache || false);

        // Auto-selecionar primeira partitura se necessário
        if (!isLoadMore && !selectedScore && data.scoresByType) {
          const firstScore = findFirstAvailableScore(data.scoresByType);
          if (firstScore) {
            setSelectedScore(firstScore.id);
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log(`⏹️ [HOOK-OPT] Requisição cancelada`);
          return;
        }

        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Erro desconhecido ao buscar partituras';
        console.error(`❌ [HOOK-OPT] Erro ao buscar partituras:`, errorMessage);

        if (!isLoadMore) {
          setError(errorMessage);
          setScores(null);
          setFromCache(false);
          setCacheStats(null);
        }
      } finally {
        if (isLoadMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
        loadingRef.current = false;
      }
    },
    [
      imslpUrl,
      enabled,
      priorityScoreId,
      forceRefresh,
      initialLimit,
      onScoresCached,
      selectedScore,
      currentOffset,
      scores,
      mergeScoresData,
      updateScoresMap,
      options.workId,
    ]
  );

  // Função auxiliar para contar partituras retornadas
  const countReturnedScores = useCallback((data: any): number => {
    if (!data.scoresByType) return 0;

    return Object.values(data.scoresByType).reduce(
      (total: number, groups: any) => {
        return (
          total +
          groups.reduce((groupTotal: number, group: any) => {
            return groupTotal + (group.scores?.length || 0);
          }, 0)
        );
      },
      0
    );
  }, []);

  // 🆕 Função para carregar mais partituras
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !options.workId) return;

    console.log(`📄 [HOOK-OPT] Carregando mais partituras...`);

    try {
      setLoadingMore(true);

      const response = await fetch(
        `/api/imslp-scores?type=load-more&workId=${options.workId}&limit=20&offset=${currentOffset}`
      );
      const data = await response.json();

      if (data.success && data.scores && scores) {
        const mergedScores = mergeScoresData(scores, data.scores);
        setScores(mergedScores);
        updateScoresMap(mergedScores);
        setHasMore(data.hasMore || false);
        setCurrentOffset(currentOffset + countReturnedScores(data));
      }
    } catch (error) {
      console.error(`❌ [HOOK-OPT] Erro ao carregar mais partituras:`, error);
    } finally {
      setLoadingMore(false);
    }
  }, [
    hasMore,
    loadingMore,
    options.workId,
    currentOffset,
    scores,
    mergeScoresData,
    updateScoresMap,
    countReturnedScores,
  ]);

  // 🆕 Função para carregar todas as partituras
  const loadAll = useCallback(async () => {
    if (allLoaded || !options.workId) return;

    console.log(`📚 [HOOK-OPT] Carregando todas as partituras...`);

    try {
      setLoadingMore(true);

      const response = await fetch(
        `/api/imslp-scores?type=load-all&workId=${options.workId}`
      );
      const data = await response.json();

      if (data.success && data.scores) {
        setScores(data.scores);
        updateScoresMap(data.scores);
        setHasMore(false);
        setAllLoaded(true);
        setTotalAvailable(countReturnedScores(data));
      }
    } catch (error) {
      console.error(
        `❌ [HOOK-OPT] Erro ao carregar todas as partituras:`,
        error
      );
    } finally {
      setLoadingMore(false);
    }
  }, [allLoaded, options.workId, updateScoresMap, countReturnedScores]);

  const refetch = useCallback(async () => {
    setCurrentOffset(0);
    setAllLoaded(false);
    await fetchScores(false);
  }, [fetchScores]);

  // Effect principal
  useEffect(() => {
    if (imslpUrl && enabled && imslpUrl !== lastUrlRef.current) {
      lastUrlRef.current = imslpUrl;
      setCurrentOffset(0);
      setAllLoaded(false);
      fetchScores(false);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [imslpUrl, enabled, fetchScores]);

  // Effect para cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      loadingRef.current = false;
    };
  }, []);

  // Effect para sincronizar selectedScore
  useEffect(() => {
    if (priorityScoreId && priorityScoreId !== selectedScore) {
      setSelectedScore(priorityScoreId);
    }
  }, [priorityScoreId, selectedScore, setSelectedScore]);

  const canLoadMore = hasMore && !loadingMore && !allLoaded;

  return {
    scores,
    loading,
    error,
    refetch,
    fromCache,
    cacheStats,
    selectedScore,
    setSelectedScore,
    // 🆕 Novos retornos
    hasMore,
    totalAvailable,
    loadingMore,
    loadMore,
    loadAll,
    canLoadMore,
  };
}

/**
 * Utilitários
 */
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

/**
 * 🆕 Hook simplificado para verificação rápida de cache
 */
export function useIMSLPScoresCache(workId: string) {
  const [cached, setCached] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [totalAvailable, setTotalAvailable] = useState(0);

  useEffect(() => {
    if (!workId) return;

    const checkCache = async () => {
      try {
        const response = await fetch(
          `/api/imslp-scores?type=cache-check&workId=${workId}`
        );
        const data = await response.json();

        setCached(data.cached || false);
        setHasMore(data.hasMore || false);
        setTotalAvailable(data.totalAvailable || 0);
      } catch (error) {
        console.error('Erro ao verificar cache:', error);
        setCached(false);
      } finally {
        setLoading(false);
      }
    };

    checkCache();
  }, [workId]);

  return { cached, loading, hasMore, totalAvailable };
}

/**
 * 🆕 Hook para estatísticas de cache
 */
export function useIMSLPCacheStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/imslp-scores?type=cache-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas de cache:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}
