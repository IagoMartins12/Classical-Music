// app/hooks/useIMSLPScores.ts - Hook Ultra-Otimizado com Cache Inteligente
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { IMSLPWorkScores } from '@/app/libs/imslp-score-scraper';

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
}

export interface UseIMSLPScoresOptions {
  workId?: string;
  enabled?: boolean;
  priorityScoreId?: string; // Partitura a ser priorizada no cache
  forceRefresh?: boolean; // Forçar refresh ignorando cache
  onScoresCached?: (fromCache: boolean) => void; // Callback quando partituras são carregadas
}

export function useIMSLPScores(
  imslpUrl: string,
  options: UseIMSLPScoresOptions = {}
): UseIMSLPScoresResult {
  const {
    enabled = true,
    priorityScoreId,
    forceRefresh = false,
    onScoresCached,
  } = options;

  const [scores, setScores] = useState<IMSLPWorkScores | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [selectedScore, setSelectedScore] = useState<string | null>(
    priorityScoreId || null
  );

  // Refs para evitar re-execuções desnecessárias
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUrlRef = useRef<string>('');
  const loadingRef = useRef(false);

  const fetchScores = useCallback(async () => {
    if (!imslpUrl || !enabled) {
      return;
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();
    // const signal = abortControllerRef.current.signal;

    setLoading(true);
    setError(null);
    loadingRef.current = true;

    console.log(`🎼 [HOOK] Iniciando busca para URL: ${imslpUrl}`);
    console.log(
      `📊 [HOOK] Partitura prioritária: ${priorityScoreId || 'nenhuma'}`
    );

    try {
      const response = await fetch('/api/imslp-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imslpUrl,
          priorityScoreId,
          forceRefresh,
          workId: options.workId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.details || data.error);
      }

      // Atualizar estado
      setScores(data);
      setFromCache(data.fromCache || false);
      setCacheStats(data.cacheStats || null);
      setError(null);

      // Callback de sucesso
      onScoresCached?.(data.fromCache || false);

      // Auto-selecionar primeira partitura se nenhuma estiver selecionada
      if (!selectedScore && data.scoresByType) {
        const firstScore = findFirstAvailableScore(data.scoresByType);
        if (firstScore) {
          setSelectedScore(firstScore.id);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro desconhecido ao buscar partituras';
      console.error(`❌ [HOOK] Erro ao buscar partituras:`, errorMessage);

      setError(errorMessage);
      setScores(null);
      setFromCache(false);
      setCacheStats(null);
    } finally {
      setLoading(false);
    }
  }, [
    imslpUrl,
    enabled,
    priorityScoreId,
    forceRefresh,
    onScoresCached,
    selectedScore,
  ]);

  const refetch = useCallback(async () => {
    await fetchScores();
  }, [fetchScores]);

  // Effect principal - buscar partituras
  useEffect(() => {
    // if (imslpUrl && enabled && imslpUrl !== lastUrlRef.current) {

    // Só executar se a URL mudou ou se é a primeira vez
    if (imslpUrl && enabled && imslpUrl !== lastUrlRef.current) {
      lastUrlRef.current = imslpUrl;
      fetchScores();
    }

    // Cleanup
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

  // Effect para sincronizar selectedScore com priorityScoreId
  useEffect(() => {
    if (priorityScoreId && priorityScoreId !== selectedScore) {
      setSelectedScore(priorityScoreId);
    }
  }, [priorityScoreId, selectedScore]);

  return {
    scores,
    loading,
    error,
    refetch,
    fromCache,
    cacheStats,
    selectedScore,
    setSelectedScore,
  };
}

/**
 * Hook simplificado para verificar apenas se partituras existem no cache
 */
export function useIMSLPScoresCache(workId: string) {
  const [cached, setCached] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workId) return;

    const checkCache = async () => {
      try {
        const response = await fetch(`/api/imslp-scores/cache-check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workId }),
        });

        const data = await response.json();
        setCached(data.cached || false);
      } catch (error) {
        console.error('Erro ao verificar cache:', error);
        setCached(false);
      } finally {
        setLoading(false);
      }
    };

    checkCache();
  }, [workId]);

  return { cached, loading };
}

/**
 * Hook para estatísticas de cache
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

/**
 * Utilitários
 */
function findFirstAvailableScore(scoresByType: any): { id: string } | null {
  // Prioridade: scores > parts > arrangements > outros
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
 * Hook para gerenciar selected score com persistência local
 */
export function useSelectedScoreManager(
  workId: string,
  defaultScoreId?: string
) {
  const [selectedScore, setSelectedScore] = useState<string | null>(null);

  // Carregar do localStorage na inicialização
  useEffect(() => {
    if (typeof window !== 'undefined' && workId) {
      const stored = localStorage.getItem(`selected-score-${workId}`);
      setSelectedScore(stored || defaultScoreId || null);
    }
  }, [workId, defaultScoreId]);

  // Salvar no localStorage quando mudar
  const updateSelectedScore = useCallback(
    (scoreId: string | null) => {
      setSelectedScore(scoreId);

      if (typeof window !== 'undefined' && workId) {
        if (scoreId) {
          localStorage.setItem(`selected-score-${workId}`, scoreId);
        } else {
          localStorage.removeItem(`selected-score-${workId}`);
        }
      }
    },
    [workId]
  );

  return [selectedScore, updateSelectedScore] as const;
}
