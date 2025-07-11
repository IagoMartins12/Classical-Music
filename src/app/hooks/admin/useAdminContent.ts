// app/hooks/useAdminContent.ts
import { useState, useEffect, useCallback } from 'react';

export interface ContentMetrics {
  totalComposers: number;
  verifiedComposers: number;
  totalWorks: number;
  totalScores: number;
  avgScoresPerWork: number;
  mostPopularWorks: Array<{
    id: string;
    title: string;
    composer: string;
    favoritesCount: number;
    studySessionsCount: number;
    annotationsCount: number;
    scoresCount: number;
  }>;
  mostPopularComposers: Array<{
    id: string;
    name: string;
    worksCount: number;
    totalFavorites: number;
    totalStudySessions: number;
    epoch: string;
  }>;
  contentByEpoch: Array<{
    epoch: string;
    composersCount: number;
    worksCount: number;
    scoresCount: number;
  }>;
  qualityMetrics: {
    highQualityContent: number;
    mediumQualityContent: number;
    lowQualityContent: number;
    averageQualityScore: number;
  };
  recentContent: Array<{
    id: string;
    type: 'composer' | 'work' | 'score';
    title: string;
    uploader: string;
    uploadDate: Date;
    quality: string;
    verified: boolean;
  }>;
}

interface UseAdminContentReturn {
  metrics: ContentMetrics | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export const useAdminContent = (): UseAdminContentReturn => {
  const [metrics, setMetrics] = useState<ContentMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/content');

      if (!response.ok) {
        throw new Error('Erro ao carregar métricas de conteúdo');
      }

      const data = await response.json();

      if (data.success) {
        setMetrics(data.metrics);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar métricas de conteúdo:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    metrics,
    loading,
    error,
    refreshData,
  };
};
