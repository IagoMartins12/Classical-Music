// hooks/useScoreFavorites.ts - VERSÃO OTIMIZADA SEM LOOPS
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';

export interface ScoreFavoriteStats {
  scoreId: string;
  scoreSource: string;
  totalFavorites: number;
  avgRating?: number;
  scoreTitle: string;
  scoreType: string;
  downloadUrl?: string;
  isMostFavorited?: boolean;
}

export interface UseScoreFavoritesResult {
  stats: ScoreFavoriteStats[];
  loading: boolean;
  error: string | null;
  mostFavorited: ScoreFavoriteStats | null;
  refetch: () => Promise<void>;
  getScoreStats: (
    scoreId: string,
    scoreSource?: string
  ) => ScoreFavoriteStats | null;
  publicStats: {
    totalFavorites: number;
    totalScores: number;
    mostFavoritedScore: ScoreFavoriteStats | null;
  };
}

// 🆕 Cache global para evitar múltiplas requisições
const statsCache = new Map<
  string,
  {
    data: any;
    timestamp: number;
    loading: boolean;
  }
>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const REQUEST_TIMEOUT = 10000; // 10 segundos

// 🆕 Função de debounce para evitar múltiplas chamadas
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 🆕 Função centralizada para buscar estatísticas
async function fetchWorkStats(workId: string): Promise<any> {
  const cacheKey = `work-stats-${workId}`;
  const cached = statsCache.get(cacheKey);

  // Verificar cache válido
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Verificar se já está carregando
  if (cached?.loading) {
    return new Promise((resolve) => {
      const checkCache = () => {
        const current = statsCache.get(cacheKey);
        if (current && !current.loading) {
          resolve(current.data);
        } else {
          setTimeout(checkCache, 100);
        }
      };
      setTimeout(checkCache, 100);
    });
  }

  // Marcar como carregando
  statsCache.set(cacheKey, {
    data: null,
    timestamp: Date.now(),
    loading: true,
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(
      `/api/favorites/scores?type=work-stats&workId=${workId}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Salvar no cache
    statsCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      loading: false,
    });

    return data;
  } catch (error) {
    // Remover entrada de loading em caso de erro
    statsCache.delete(cacheKey);
    throw error;
  }
}

// 🆕 Hook principal otimizado
export function useScoreFavorites(workId: string): UseScoreFavoritesResult {
  const [stats, setStats] = useState<ScoreFavoriteStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicStats, setPublicStats] = useState({
    totalFavorites: 0,
    totalScores: 0,
    mostFavoritedScore: null as ScoreFavoriteStats | null,
  });

  // 🆕 Ref para evitar múltiplas chamadas
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  const store = useFavoritesStore();

  // 🆕 Função de fetch otimizada
  const fetchStats = useCallback(async () => {
    if (!workId || fetchingRef.current) return;

    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWorkStats(workId);

      // Verificar se o componente ainda está montado
      if (!mountedRef.current) return;

      // Processar dados
      const processedStats =
        data.topScores?.map((stat: any, index: number) => ({
          ...stat,
          isMostFavorited: index === 0 && stat.totalFavorites > 0,
        })) || [];

      setStats(processedStats);
      setPublicStats({
        totalFavorites: data.totalFavorites || 0,
        totalScores: data.totalScores || 0,
        mostFavoritedScore: data.mostFavorited || null,
      });

      // Atualizar store se disponível (mas sem causar re-renders)
      if (store.setScoreStats && processedStats.length > 0) {
        // Usar setTimeout para evitar loops
        setTimeout(() => {
          if (mountedRef.current) {
            store.setScoreStats(workId, processedStats);
          }
        }, 0);
      }
    } catch (err) {
      if (!mountedRef.current) return;

      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro ao buscar estatísticas de favoritos:', errorMessage);
      setError(errorMessage);
      setStats([]);
      setPublicStats({
        totalFavorites: 0,
        totalScores: 0,
        mostFavoritedScore: null,
      });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, [workId]); // 🆕 Apenas workId como dependência

  // 🆕 Debounced fetch
  const debouncedFetch = useCallback(debounce(fetchStats, 300), [fetchStats]);

  const getScoreStats = useCallback(
    (scoreId: string, scoreSource = 'IMSLP') => {
      return (
        stats.find(
          (stat) => stat.scoreId === scoreId && stat.scoreSource === scoreSource
        ) || null
      );
    },
    [stats]
  );

  // 🆕 Effect simplificado
  useEffect(() => {
    if (workId) {
      debouncedFetch();
    }
  }, [workId, debouncedFetch]);

  // 🆕 Cleanup na desmontagem
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const mostFavorited = stats.length > 0 ? stats[0] : null;

  return {
    stats,
    loading,
    error,
    mostFavorited,
    refetch: fetchStats,
    getScoreStats,
    publicStats,
  };
}

// 🆕 Hook simplificado apenas para dados públicos
export function usePublicScoreFavorites(workId: string) {
  const [publicStats, setPublicStats] = useState({
    totalFavorites: 0,
    totalScores: 0,
    mostFavoritedScore: null as ScoreFavoriteStats | null,
    topScores: [] as ScoreFavoriteStats[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchingRef = useRef(false);

  const fetchPublicStats = useCallback(async () => {
    if (!workId || fetchingRef.current) return;

    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWorkStats(workId);

      setPublicStats({
        totalFavorites: data.totalFavorites || 0,
        totalScores: data.totalScores || 0,
        mostFavoritedScore: data.mostFavorited || null,
        topScores: data.topScores || [],
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro ao buscar estatísticas públicas:', errorMessage);
      setError(errorMessage);
      setPublicStats({
        totalFavorites: 0,
        totalScores: 0,
        mostFavoritedScore: null,
        topScores: [],
      });
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [workId]);

  // 🆕 Effect com debounce
  useEffect(() => {
    if (workId) {
      const timeoutId = setTimeout(fetchPublicStats, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [workId, fetchPublicStats]);

  return {
    publicStats,
    loading,
    error,
    refetch: fetchPublicStats,
  };
}

// 🆕 Hook simplificado para verificar favoritos
export function useIsScoreFavorited(
  workId: string,
  scoreId: string,
  scoreSource = 'IMSLP'
) {
  const store = useFavoritesStore();

  return {
    isFavorited:
      store.isScoreFavorited?.(workId, scoreId, scoreSource) ?? false,
    favoriteData:
      store.getScoreFavorite?.(workId, scoreId, scoreSource) ?? null,
  };
}

// 🆕 Função para limpar cache manualmente
export function clearScoreStatsCache(workId?: string) {
  if (workId) {
    statsCache.delete(`work-stats-${workId}`);
  } else {
    statsCache.clear();
  }
}

// 🆕 Hook para estatísticas globais
export function useGlobalScoreFavorites() {
  const [globalStats, setGlobalStats] = useState({
    totalScoreFavorites: 0,
    topScores: [] as ScoreFavoriteStats[],
    topWorks: [] as any[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGlobalStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/favorites/scores?type=global-stats');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setGlobalStats(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro ao buscar estatísticas globais:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalStats();
  }, [fetchGlobalStats]);

  return {
    globalStats,
    loading,
    error,
    refetch: fetchGlobalStats,
  };
}

// 🆕 Hook para favoritos do usuário
export function useUserScoreFavorites() {
  const store = useFavoritesStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/favorites/scores?type=user-favorites');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.favorites;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro ao buscar favoritos do usuário:', errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const favoritesByWork = store.favoriteScores.reduce((acc, favorite) => {
    if (!acc[favorite.workId]) {
      acc[favorite.workId] = [];
    }
    acc[favorite.workId].push(favorite);
    return acc;
  }, {} as Record<string, typeof store.favoriteScores>);

  return {
    favorites: store.favoriteScores,
    favoritesByWork,
    count: store.getFavoriteScoresCount?.() ?? 0,
    loading,
    error,
    refetch: fetchUserFavorites,
  };
}
