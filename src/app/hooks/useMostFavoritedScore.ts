// hooks/useMostFavoritedScore.ts - VERSÃO SIMPLES PARA DESTACAR PARTITURA
'use client';

import { useState, useEffect, useRef } from 'react';

interface MostFavoritedData {
  scoreId: string | null;
  scoreSource: string;
  totalFavorites: number;
}

// Cache simples para evitar múltiplas requisições
const cache = new Map<string, { data: MostFavoritedData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useMostFavoritedScore(workId: string) {
  const [mostFavorited, setMostFavorited] = useState<MostFavoritedData>({
    scoreId: null,
    scoreSource: 'IMSLP',
    totalFavorites: 0,
  });
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!workId || fetchingRef.current) return;

    const fetchMostFavorited = async () => {
      // Verificar cache
      const cached = cache.get(workId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setMostFavorited(cached.data);
        return;
      }

      fetchingRef.current = true;
      setLoading(true);

      try {
        const response = await fetch(
          `/api/favorites/scores?type=most-favorited&workId=${workId}`,
          {
            method: 'GET',
            cache: 'no-store', // Evitar cache do browser
          }
        );

        console.log('RESPONSE', response);

        if (response.ok) {
          const data = await response.json();

          // Extrair apenas o necessário
          const result: MostFavoritedData = {
            scoreId: data[0]?.scoreId || null,
            scoreSource: data[0]?.scoreSource || 'IMSLP',
            totalFavorites: data[0]?.totalFavorites || 0,
          };

          setMostFavorited(result);

          // Salvar no cache
          cache.set(workId, { data: result, timestamp: Date.now() });
        }
      } catch (error) {
        console.error('Erro ao buscar partitura mais favoritada:', error);
        // Manter estado vazio em caso de erro
        setMostFavorited({
          scoreId: null,
          scoreSource: 'IMSLP',
          totalFavorites: 0,
        });
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    // Debounce de 200ms para evitar múltiplas chamadas
    const timeoutId = setTimeout(fetchMostFavorited, 200);
    return () => clearTimeout(timeoutId);
  }, [workId]);

  // Função para verificar se uma partitura específica é a mais favoritada
  const isScoreMostFavorited = (scoreId: string, scoreSource = 'IMSLP') => {
    return (
      mostFavorited.scoreId === scoreId &&
      mostFavorited.scoreSource === scoreSource &&
      mostFavorited.totalFavorites > 0
    );
  };

  return {
    mostFavoritedScoreId: mostFavorited.scoreId,
    mostFavoritedSource: mostFavorited.scoreSource,
    hasFavorites: mostFavorited.totalFavorites > 0,
    isScoreMostFavorited,
    loading,
  };
}

// Hook ainda mais simples para usar apenas com scoreId
export function useIsMostFavorited(
  workId: string,
  scoreId: string,
  scoreSource = 'IMSLP'
) {
  const { isScoreMostFavorited, loading } = useMostFavoritedScore(workId);

  return {
    isMostFavorited: isScoreMostFavorited(scoreId, scoreSource),
    loading,
  };
}
