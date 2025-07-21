import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiRefreshCw,
  FiMusic,
  FiVideo,
  FiAlertCircle,
} from 'react-icons/fi';
import SpotifyAudioPlayer from '../SpotifyAudioPlayer';
import YouTubeVideoPlayer from '../YouTubeVideoPlayer';

interface MediaSectionProps {
  work: {
    id: string;
    title: string;
    composer: {
      fullName: string;
    };
    // Dados do Spotify (se já existir)
    spotifyTrackId?: string | null;
    spotifyTrackUrl?: string | null;
    spotifyPreviewUrl?: string | null;
    spotifyAlbumArt?: string | null;
    spotifyArtists?: string[] | null;
    spotifyAlbumName?: string | null;
    spotifyDuration?: number | null;
    spotifyPopularity?: number | null;
    // Dados do YouTube (se já existir)
    youtubeVideoId?: string | null;
    youtubeVideoUrl?: string | null;
    youtubeThumbnail?: string | null;
    youtubeTitle?: string | null;
    youtubeChannel?: string | null;
    youtubePublishedAt?: string | null;
    // Status da busca
    mediaSearchStatus?: string | null;
    mediaSearchError?: string | null;
    lastMediaSearch?: string | null;
  };
}

const MediaSection: React.FC<MediaSectionProps> = ({ work }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [spotifyData, setSpotifyData] = useState<any>(null);
  const [youtubeData, setYoutubeData] = useState<any>(null);

  // Inicializar dados existentes
  useEffect(() => {
    if (work.spotifyTrackId) {
      setSpotifyData({
        trackId: work.spotifyTrackId,
        trackUrl: work.spotifyTrackUrl,
        previewUrl: work.spotifyPreviewUrl,
        albumArt: work.spotifyAlbumArt,
        artists: work.spotifyArtists || [],
        albumName: work.spotifyAlbumName,
        duration: work.spotifyDuration,
        popularity: work.spotifyPopularity,
      });
    }

    if (work.youtubeVideoId) {
      setYoutubeData({
        videoId: work.youtubeVideoId,
        videoUrl: work.youtubeVideoUrl,
        thumbnail: work.youtubeThumbnail,
        title: work.youtubeTitle,
        channel: work.youtubeChannel,
        publishedAt: work.youtubePublishedAt,
      });
    }

    if (work.mediaSearchError) {
      setSearchError(work.mediaSearchError);
    }
  }, [work]);

  const searchMedia = async (forceRefresh = false) => {
    setIsSearching(true);
    setSearchError(null);

    try {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na busca');
      }

      if (data.success) {
        if (data.spotify) {
          setSpotifyData(data.spotify);
        }
        if (data.youtube) {
          setYoutubeData(data.youtube);
        }

        if (!data.spotify && !data.youtube) {
          setSearchError('Nenhuma mídia encontrada para esta obra');
        }
      } else {
        setSearchError(data.error || 'Erro na busca');
      }
    } catch (error) {
      console.error('Erro na busca de mídia:', error);
      setSearchError(
        error instanceof Error ? error.message : 'Erro desconhecido'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const hasAnyMedia = spotifyData || youtubeData;
  const canSearch = !isSearching && work.title && work.composer?.fullName;

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
          <FiMusic className="w-5 h-5" />
          <span>Áudio e Vídeo</span>
        </h3>
        {/* <UniversalAudioPlayer
          work={work}
          youtubeVideo={youtubeData}
          spotifyTrack={spotifyData}
        /> */}

        {canSearch && (
          <div className="flex space-x-2">
            {hasAnyMedia && (
              <button
                onClick={() => searchMedia(true)}
                disabled={isSearching}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm flex items-center space-x-2 transition-colors disabled:opacity-50"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`}
                />
                <span>Atualizar</span>
              </button>
            )}

            <button
              onClick={() => searchMedia(false)}
              disabled={isSearching || hasAnyMedia}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <FiSearch
                className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`}
              />
              <span>{isSearching ? 'Buscando...' : 'Buscar Mídia'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Área de conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spotify Audio */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <FiMusic className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-gray-300">
              Áudio (Spotify)
            </span>
          </div>

          {spotifyData ? (
            <SpotifyAudioPlayer
              track={spotifyData}
              workTitle={work.title}
              composer={work.composer.fullName}
            />
          ) : (
            <div className="bg-gray-800 rounded-xl p-6 border-2 border-dashed border-gray-600 text-center">
              <FiMusic className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">
                {isSearching
                  ? 'Procurando áudio...'
                  : 'Nenhum áudio encontrado'}
              </p>
            </div>
          )}
        </div>

        {/* YouTube Video */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <FiVideo className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-gray-300">
              Vídeo (YouTube)
            </span>
          </div>

          {youtubeData ? (
            <YouTubeVideoPlayer
              video={youtubeData}
              workTitle={work.title}
              composer={work.composer.fullName}
            />
          ) : (
            <div className="bg-gray-800 rounded-xl p-6 border-2 border-dashed border-gray-600 text-center">
              <FiVideo className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">
                {isSearching
                  ? 'Procurando vídeo...'
                  : 'Nenhum vídeo encontrado'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mensagem de erro */}
      {searchError && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 flex items-start space-x-3">
          <FiAlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-300 text-sm font-medium">
              Erro na busca de mídia
            </p>
            <p className="text-red-400 text-sm mt-1">{searchError}</p>
          </div>
        </div>
      )}

      {/* Info sobre rate limiting */}
      {work.lastMediaSearch && !hasAnyMedia && (
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            <strong>Dica:</strong> Para obras complexas (coletâneas, livros,
            etc.), a busca automática pode não funcionar. Considere adicionar
            mídia manualmente.
          </p>
          <p className="text-blue-400 text-xs mt-1">
            Última busca:{' '}
            {new Date(work.lastMediaSearch).toLocaleString('pt-BR')}
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaSection;
