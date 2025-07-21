'use client';
// app/hooks/useMediaSearch.ts
import { useState, useEffect, useCallback } from 'react';

export interface MediaSearchResult {
  spotify: {
    trackId: string;
    trackUrl: string;
    previewUrl: string | null;
    albumArt: string | null;
    artists: string[];
    albumName: string;
    duration: number;
    popularity: number;
  } | null;
  youtube: {
    videoId: string;
    videoUrl: string;
    thumbnail: string | null;
    title: string;
    channel: string;
    publishedAt: string;
  } | null;
}

export interface MediaSearchState {
  isLoading: boolean;
  error: string | null;
  lastSearched: string | null;
  canSearch: boolean;
  hasMedia: boolean;
  data: MediaSearchResult;
}

export interface UseMediaSearchOptions {
  workId: string;
  initialData?: Partial<MediaSearchResult>;
  autoLoad?: boolean;
}

export function useMediaSearch({
  workId,
  initialData,
  autoLoad = true,
}: UseMediaSearchOptions) {
  const [state, setState] = useState<MediaSearchState>({
    isLoading: false,
    error: null,
    lastSearched: null,
    canSearch: true,
    hasMedia: false,
    data: {
      spotify: initialData?.spotify || null,
      youtube: initialData?.youtube || null,
    },
  });

  // Verificar se tem mídia
  useEffect(() => {
    const hasMedia = !!(state.data.spotify || state.data.youtube);
    setState((prev) => ({ ...prev, hasMedia }));
  }, [state.data]);

  // Carregar dados iniciais se autoLoad estiver ativo
  useEffect(() => {
    if (autoLoad && workId && !state.hasMedia && !state.isLoading) {
      checkExistingMedia();
    }
  }, [workId, autoLoad]);

  const checkExistingMedia = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch(`/api/works/${workId}/media`);

      if (!response.ok) {
        throw new Error('Erro ao verificar mídia existente');
      }

      const data = await response.json();

      setState((prev) => ({
        ...prev,
        isLoading: false,
        data: {
          spotify: data.spotify || null,
          youtube: data.youtube || null,
        },
        lastSearched: data.lastSearched || null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }));
    }
  }, [workId]);

  const searchMedia = useCallback(
    async (forceRefresh = false) => {
      if (!workId) {
        setState((prev) => ({ ...prev, error: 'ID da obra é obrigatório' }));
        return;
      }

      try {
        setState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
          canSearch: false,
        }));

        const response = await fetch('/api/media-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workId,
            forceRefresh,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro na busca de mídia');
        }

        if (data.success) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            canSearch: true,
            data: {
              spotify: data.spotify || prev.data.spotify,
              youtube: data.youtube || prev.data.youtube,
            },
            lastSearched: new Date().toISOString(),
          }));

          return {
            success: true,
            found: !!(data.spotify || data.youtube),
            spotify: !!data.spotify,
            youtube: !!data.youtube,
          };
        } else {
          throw new Error(data.error || 'Nenhuma mídia encontrada');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido';

        setState((prev) => ({
          ...prev,
          isLoading: false,
          canSearch: true,
          error: errorMessage,
        }));

        // Se o erro for de rate limiting, ajustar canSearch
        if (errorMessage.includes('Aguarde')) {
          setState((prev) => ({ ...prev, canSearch: false }));

          // Re-habilitar busca após 30 minutos
          setTimeout(() => {
            setState((prev) => ({ ...prev, canSearch: true }));
          }, 30 * 60 * 1000);
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [workId]
  );

  const refreshMedia = useCallback(() => {
    return searchMedia(true);
  }, [searchMedia]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const updateSpotifyData = useCallback(
    (spotifyData: MediaSearchResult['spotify']) => {
      setState((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          spotify: spotifyData,
        },
      }));
    },
    []
  );

  const updateYouTubeData = useCallback(
    (youtubeData: MediaSearchResult['youtube']) => {
      setState((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          youtube: youtubeData,
        },
      }));
    },
    []
  );

  const clearMedia = useCallback(() => {
    setState((prev) => ({
      ...prev,
      data: {
        spotify: null,
        youtube: null,
      },
      error: null,
    }));
  }, []);

  // Verificar se pode buscar (rate limiting)
  const checkCanSearch = useCallback(() => {
    if (!state.lastSearched) return true;

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const lastSearch = new Date(state.lastSearched);

    return lastSearch < thirtyMinutesAgo;
  }, [state.lastSearched]);

  useEffect(() => {
    setState((prev) => ({ ...prev, canSearch: checkCanSearch() }));
  }, [checkCanSearch]);

  return {
    // Estado
    ...state,

    // Ações
    searchMedia,
    refreshMedia,
    clearError,
    clearMedia,
    checkExistingMedia,
    updateSpotifyData,
    updateYouTubeData,

    // Computed
    needsSearch: !state.hasMedia && !state.error,
    isRateLimited: !state.canSearch && !!state.lastSearched,
    timeUntilCanSearch: state.lastSearched
      ? Math.max(
          0,
          30 * 60 * 1000 - (Date.now() - new Date(state.lastSearched).getTime())
        )
      : 0,
  };
}

// Hook para usar com múltiplas obras (batch)
export function useMediaSearchBatch() {
  const [jobs, setJobs] = useState<Map<string, MediaSearchState>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);

  const addWork = useCallback(
    (workId: string, initialData?: Partial<MediaSearchResult>) => {
      setJobs((prev) => {
        const newJobs = new Map(prev);
        newJobs.set(workId, {
          isLoading: false,
          error: null,
          lastSearched: null,
          canSearch: true,
          hasMedia: !!(initialData?.spotify || initialData?.youtube),
          data: {
            spotify: initialData?.spotify || null,
            youtube: initialData?.youtube || null,
          },
        });
        return newJobs;
      });
    },
    []
  );

  const removeWork = useCallback((workId: string) => {
    setJobs((prev) => {
      const newJobs = new Map(prev);
      newJobs.delete(workId);
      return newJobs;
    });
  }, []);

  const processWork = useCallback(
    async (workId: string) => {
      const currentJob = jobs.get(workId);
      if (!currentJob || currentJob.hasMedia) return;

      setJobs((prev) => {
        const newJobs = new Map(prev);
        const job = newJobs.get(workId);
        if (job) {
          newJobs.set(workId, { ...job, isLoading: true, error: null });
        }
        return newJobs;
      });

      try {
        const response = await fetch('/api/media-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workId }),
        });

        const data = await response.json();

        setJobs((prev) => {
          const newJobs = new Map(prev);
          const job = newJobs.get(workId);
          if (job) {
            newJobs.set(workId, {
              ...job,
              isLoading: false,
              hasMedia: !!(data.spotify || data.youtube),
              data: {
                spotify: data.spotify || null,
                youtube: data.youtube || null,
              },
              lastSearched: new Date().toISOString(),
            });
          }
          return newJobs;
        });

        return data;
      } catch (error) {
        setJobs((prev) => {
          const newJobs = new Map(prev);
          const job = newJobs.get(workId);
          if (job) {
            newJobs.set(workId, {
              ...job,
              isLoading: false,
              error:
                error instanceof Error ? error.message : 'Erro desconhecido',
            });
          }
          return newJobs;
        });
      }
    },
    [jobs]
  );

  const processAllWorks = useCallback(async () => {
    setIsProcessing(true);

    const workIds = Array.from(jobs.keys()).filter((workId) => {
      const job = jobs.get(workId);
      return job && !job.hasMedia && !job.isLoading;
    });

    for (const workId of workIds) {
      await processWork(workId);
      // Delay para rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setIsProcessing(false);
  }, [jobs, processWork]);

  const getJobStats = useCallback(() => {
    const allJobs = Array.from(jobs.values());
    return {
      total: allJobs.length,
      withMedia: allJobs.filter((job) => job.hasMedia).length,
      loading: allJobs.filter((job) => job.isLoading).length,
      errors: allJobs.filter((job) => job.error).length,
      pending: allJobs.filter(
        (job) => !job.hasMedia && !job.error && !job.isLoading
      ).length,
    };
  }, [jobs]);

  return {
    jobs: Object.fromEntries(jobs),
    isProcessing,
    addWork,
    removeWork,
    processWork,
    processAllWorks,
    getJobStats: getJobStats(),
  };
}
