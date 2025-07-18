// app/hooks/useMediaSearch.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { WorkDetails } from '@/app/requests/work-details';
import { isWorkTooComplexForAutoSearch } from '../libs/media-search/simplified-media-search';

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
    strategy?: string; // 🆕 Estratégia usada para encontrar
    qualityScore?: number; // 🆕 Score de qualidade
  } | null;
  youtube: {
    videoId: string;
    videoUrl: string;
    thumbnail: string | null;
    title: string;
    channel: string;
    publishedAt: string;
    strategy?: string; // 🆕 Estratégia usada para encontrar
    qualityScore?: number; // 🆕 Score de qualidade
  } | null;
  metadata?: {
    processingTime: number;
    apiCalls: number;
    queriesUsed: number; // 🆕 Número de queries utilizadas
    strategy: string;
  };
}

export interface UseMediaSearchResult {
  // Estados
  hasMedia: boolean;
  isSearching: boolean;
  searchCompleted: boolean;
  error: string | null;
  isComplexWork: boolean; // 🆕 Se a obra é muito complexa

  // Dados
  mediaData: MediaSearchResult | null;
  searchMetadata: any;

  // Ações
  searchMedia: (forceRefresh?: boolean) => Promise<void>;
  clearError: () => void;

  // Estados computados
  hasSpotify: boolean;
  hasYoutube: boolean;
  canPlayPreview: boolean;
  searchProgress: number;
  shouldAutoSearch: boolean; // 🆕 Se deve fazer busca automática
}

export function useMediaSearch(work: WorkDetails): UseMediaSearchResult {
  const [isSearching, setIsSearching] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaData, setMediaData] = useState<MediaSearchResult | null>(null);
  const [searchMetadata, setSearchMetadata] = useState<any>(null);
  const [searchProgress, setSearchProgress] = useState(0);

  // 🆕 Verificar se a obra é muito complexa para busca automática
  const isComplexWork = isWorkTooComplexForAutoSearch({
    title: work.title,
    composer: { fullName: work.composer.fullName },
    workType: work.workType,
    movementNumber: work.movementNumber,
    instrument: work.instrument,
    id: work.id,
  });

  // Verificar se já tem mídia nos dados iniciais da obra
  const hasInitialMedia = !!(work.spotifyTrackId || work.youtubeVideoId);

  // 🆕 Lógica melhorada para decidir se deve fazer busca automática
  const shouldAutoSearch = !hasInitialMedia && !isComplexWork;

  // Inicializar dados existentes
  useEffect(() => {
    if (hasInitialMedia) {
      const initialMedia: MediaSearchResult = {
        spotify: work.spotifyTrackId
          ? {
              trackId: work.spotifyTrackId,
              trackUrl: work.spotifyTrackUrl || '',
              previewUrl: work.spotifyPreviewUrl || null,
              albumArt: work.spotifyAlbumArt || null,
              artists: work.spotifyArtists || [],
              albumName: work.spotifyAlbumName || '',
              duration: work.spotifyDuration || 0,
              popularity: work.spotifyPopularity || 0,
            }
          : null,
        youtube: work.youtubeVideoId
          ? {
              videoId: work.youtubeVideoId,
              videoUrl: work.youtubeVideoUrl || '',
              thumbnail: work.youtubeThumbnail || null,
              title: work.youtubeTitle || '',
              channel: work.youtubeChannel || '',
              publishedAt: work.youtubePublishedAt?.toString() || '',
            }
          : null,
      };

      setMediaData(initialMedia);
      setSearchCompleted(true);

      console.log(`🎵 [MEDIA-HOOK] Mídia existente carregada: ${work.title}`);
    }
  }, [work, hasInitialMedia]);

  /**
   * 🆕 Buscar mídia na API com sistema simplificado
   */
  const searchMedia = useCallback(
    async (forceRefresh = false) => {
      if (isSearching) {
        console.log(`⚠️ [MEDIA-HOOK] Busca já em andamento: ${work.title}`);
        return;
      }

      // Se já tem mídia e não é refresh forçado, não buscar
      if (!forceRefresh && hasInitialMedia) {
        console.log(`ℹ️ [MEDIA-HOOK] Mídia já existe: ${work.title}`);
        return;
      }

      // 🆕 Verificar se é obra muito complexa (só em refresh manual)
      if (!forceRefresh && isComplexWork) {
        console.log(`⏸️ [MEDIA-HOOK] Obra muito complexa: ${work.title}`);
        setError(
          'Esta obra é muito complexa para busca automática. Use o botão "Buscar Mídia" para tentar manualmente.'
        );
        return;
      }

      setIsSearching(true);
      setError(null);
      setSearchProgress(10);

      try {
        console.log(
          `🔍 [MEDIA-HOOK] Iniciando busca simplificada: ${work.title} - ${work.composer.fullName}`
        );

        setSearchProgress(30);

        const response = await fetch('/api/media-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workId: work.id,
            forceRefresh,
          }),
        });

        setSearchProgress(60);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erro HTTP ${response.status}`);
        }

        const result = await response.json();

        setSearchProgress(90);

        if (result.success) {
          const newMediaData: MediaSearchResult = {
            spotify: result.spotify,
            youtube: result.youtube,
            metadata: result.metadata,
          };

          setMediaData(newMediaData);
          setSearchMetadata(result.metadata);
          setSearchCompleted(true);

          // 🆕 Logs melhorados
          const foundCount =
            (result.spotify ? 1 : 0) + (result.youtube ? 1 : 0);
          console.log(
            `✅ [MEDIA-HOOK] Busca concluída: ${foundCount}/2 tipos encontrados`
          );

          if (result.spotify) {
            console.log(
              `🎵 [SPOTIFY] "${result.spotify.artists?.join(', ')}" - ${
                result.spotify.trackUrl
              }`
            );
          }

          if (result.youtube) {
            console.log(
              `📺 [YOUTUBE] "${result.youtube.title}" - ${result.youtube.videoUrl}`
            );
          }

          // 🆕 Log de performance
          if (result.metadata) {
            console.log(
              `⚡ [PERFORMANCE] ${result.metadata.processingTime}ms, ${result.metadata.apiCalls} API calls`
            );
          }
        } else {
          throw new Error(result.error || 'Falha na busca de mídia');
        }

        setSearchProgress(100);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        console.error(`❌ [MEDIA-HOOK] Erro na busca:`, errorMessage);

        // 🆕 Mensagens de erro mais específicas
        let userFriendlyError = errorMessage;
        if (errorMessage.includes('muito complexa')) {
          userFriendlyError =
            'Esta obra é muito complexa para busca automática. Tente buscar manualmente ou adicione mídia personalizada.';
        } else if (
          errorMessage.includes('rate limit') ||
          errorMessage.includes('Aguarde')
        ) {
          userFriendlyError =
            'Muitas buscas recentes. Aguarde alguns minutos antes de tentar novamente.';
        } else if (
          errorMessage.includes('API') ||
          errorMessage.includes('Network')
        ) {
          userFriendlyError =
            'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (
          errorMessage.includes('401') ||
          errorMessage.includes('unauthorized')
        ) {
          userFriendlyError =
            'Erro de autenticação nas APIs de música. Contate o suporte.';
        }

        setError(userFriendlyError);
        setSearchProgress(0);
      } finally {
        setIsSearching(false);

        // Reset do progresso após um tempo
        setTimeout(() => {
          setSearchProgress(0);
        }, 2000);
      }
    },
    [work, isSearching, hasInitialMedia, isComplexWork]
  );

  /**
   * 🆕 Busca automática melhorada
   */
  useEffect(() => {
    // Condições para busca automática:
    // 1. Não tem mídia existente
    // 2. Não está buscando
    // 3. Não completou busca
    // 4. Não é obra complexa
    // 5. Tipo de obra apropriado
    if (shouldAutoSearch && !isSearching && !searchCompleted) {
      console.log(`🚀 [MEDIA-HOOK] Preparando busca automática: ${work.title}`);

      // 🆕 Delay inteligente baseado no tipo de obra
      let delay = 1000; // Base: 1 segundo

      // Obras individuais: busca mais rápida
      if (work.workType === 'INDIVIDUAL') {
        delay = 500;
      }
      // Coleções pequenas: delay moderado
      else if (
        work.workType === 'COLLECTED_WORKS' &&
        work.movementNumber &&
        work.movementNumber <= 3
      ) {
        delay = 1500;
      }
      // Outras obras: delay maior
      else {
        delay = 2000;
      }

      // Adicionar randomização para evitar sobrecarga
      delay += Math.random() * 1000;

      console.log(`⏰ [MEDIA-HOOK] Busca automática em ${Math.round(delay)}ms`);

      const timeoutId = setTimeout(() => {
        searchMedia();
      }, delay);

      // Cleanup
      return () => clearTimeout(timeoutId);
    } else if (isComplexWork) {
      console.log(
        `⏸️ [MEDIA-HOOK] Busca automática desabilitada (obra complexa): ${work.title}`
      );
    } else if (hasInitialMedia) {
      console.log(
        `✅ [MEDIA-HOOK] Mídia já existe, busca desnecessária: ${work.title}`
      );
    }
  }, [
    work,
    shouldAutoSearch,
    isSearching,
    searchCompleted,
    searchMedia,
    isComplexWork,
    hasInitialMedia,
  ]);

  /**
   * Limpar erro
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 🆕 Estados computados melhorados
  const hasMedia = !!(mediaData?.spotify || mediaData?.youtube);
  const hasSpotify = !!mediaData?.spotify;
  const hasYoutube = !!mediaData?.youtube;
  const canPlayPreview = !!mediaData?.spotify?.previewUrl;

  // 🆕 Debug info em desenvolvimento
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 [MEDIA-HOOK DEBUG] ${work.title}:`, {
        hasInitialMedia,
        isComplexWork,
        shouldAutoSearch,
        hasMedia,
        workType: work.workType,
        movementNumber: work.movementNumber,
      });
    }
  }, [
    work.title,
    hasInitialMedia,
    isComplexWork,
    shouldAutoSearch,
    hasMedia,
    work.workType,
    work.movementNumber,
  ]);

  return {
    // Estados
    hasMedia,
    isSearching,
    searchCompleted,
    error,
    isComplexWork, // 🆕

    // Dados
    mediaData,
    searchMetadata,

    // Ações
    searchMedia,
    clearError,

    // Estados computados
    hasSpotify,
    hasYoutube,
    canPlayPreview,
    searchProgress,
    shouldAutoSearch, // 🆕
  };
}
