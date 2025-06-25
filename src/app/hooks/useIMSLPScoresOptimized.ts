// hooks/useIMSLPScoresOptimized.ts
import { useEffect, useState, useCallback } from 'react';
import { IMSLPWorkScores, IMSLPScore } from '@/app/libs/imslp-score-scraper';

interface CacheEntry {
  data: IMSLPWorkScores;
  timestamp: number;
  selectedScores: IMSLPScore[];
}

interface UseOptimizedIMSLPScoresResult {
  scores: IMSLPWorkScores | null;
  selectedScores: IMSLPScore[];
  loading: boolean;
  error: string | null;
  saveSelectedScore: (score: IMSLPScore) => Promise<boolean>;
  removeSelectedScore: (scoreId: string) => Promise<boolean>;
  refreshScores: () => void;
  isScoreSelected: (scoreId: string) => boolean;
}

// Cache em memória (5 minutos TTL)
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export function useIMSLPScoresOptimized(
  imslpUrl?: string,
  workId?: string
): UseOptimizedIMSLPScoresResult {
  const [scores, setScores] = useState<IMSLPWorkScores | null>(null);
  const [selectedScores, setSelectedScores] = useState<IMSLPScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar partituras selecionadas do usuário
  const loadSelectedScores = useCallback(async () => {
    if (!workId) return;

    try {
      const response = await fetch(
        `/api/user/selected-scores?workId=${workId}`
      );
      const result = await response.json();

      if (result.success) {
        setSelectedScores(result.selectedScores);
      }
    } catch (error) {
      console.error('Erro ao carregar partituras selecionadas:', error);
    }
  }, [workId]);

  // Verificar se uma partitura está selecionada
  const isScoreSelected = useCallback(
    (scoreId: string) => {
      return selectedScores.some((score) => score.id === scoreId);
    },
    [selectedScores]
  );

  // Salvar partitura selecionada
  const saveSelectedScore = useCallback(
    async (score: IMSLPScore): Promise<boolean> => {
      if (!workId) return false;

      try {
        const response = await fetch('/api/user/selected-scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workId, score }),
        });

        const result = await response.json();

        if (result.success) {
          // Atualizar estado local
          setSelectedScores((prev) => {
            const exists = prev.some((s) => s.id === score.id);
            return exists ? prev : [...prev, score];
          });
          return true;
        }

        return false;
      } catch (error) {
        console.error('Erro ao salvar partitura:', error);
        return false;
      }
    },
    [workId]
  );

  // Remover partitura selecionada
  const removeSelectedScore = useCallback(
    async (scoreId: string): Promise<boolean> => {
      if (!workId) return false;

      try {
        const response = await fetch(
          `/api/user/selected-scores?workId=${workId}&scoreId=${scoreId}`,
          { method: 'DELETE' }
        );

        const result = await response.json();

        if (result.success) {
          // Atualizar estado local
          setSelectedScores((prev) => prev.filter((s) => s.id !== scoreId));
          return true;
        }

        return false;
      } catch (error) {
        console.error('Erro ao remover partitura:', error);
        return false;
      }
    },
    [workId]
  );

  // Carregar partituras com cache inteligente
  const loadScores = useCallback(
    async (forceRefresh = false) => {
      if (!imslpUrl) return;

      const cacheKey = imslpUrl;
      const cached = cache.get(cacheKey);
      const now = Date.now();

      // Usar cache se válido e não é refresh forçado
      if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL) {
        console.log('🚀 [CACHE] Usando dados do cache para:', imslpUrl);
        setScores(cached.data);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🌐 [FETCH] Buscando partituras do IMSLP...');

        const response = await fetch('/api/imslp-scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imslpUrl }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status}`);
        }

        const scoresData = await response.json();

        // Atualizar cache
        cache.set(cacheKey, {
          data: scoresData,
          timestamp: now,
          selectedScores: selectedScores,
        });

        // Limpar entradas antigas do cache
        for (const [key, entry] of cache.entries()) {
          if (now - entry.timestamp > CACHE_TTL) {
            cache.delete(key);
          }
        }

        setScores(scoresData);
        console.log('✅ [FETCH] Partituras carregadas e cacheadas');
      } catch (err) {
        console.error('❌ [FETCH] Erro ao carregar partituras:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    },
    [imslpUrl, selectedScores]
  );

  // Função para refresh manual
  const refreshScores = useCallback(() => {
    loadScores(true);
  }, [loadScores]);

  // Carregar dados ao montar componente
  useEffect(() => {
    loadSelectedScores();
  }, [loadSelectedScores]);

  useEffect(() => {
    if (imslpUrl) {
      loadScores();
    }
  }, [loadScores]);

  return {
    scores,
    selectedScores,
    loading,
    error,
    saveSelectedScore,
    removeSelectedScore,
    refreshScores,
    isScoreSelected,
  };
}
