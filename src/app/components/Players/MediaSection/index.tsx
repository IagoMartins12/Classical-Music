// app/components/Players/MediaSection.tsx - REDESIGN COMPLETO COM MELHORIAS
'use client';

import React, { useState, useEffect } from 'react';
import {
  FiMusic,
  FiVideo,
  FiRefreshCw,
  FiSearch,
  FiAlertCircle,
  FiEdit3,
  FiX,
  FiCheck,
  FiLoader,
  FiClock,
} from 'react-icons/fi';
import { SiSpotify, SiYoutube } from 'react-icons/si';
import { AnimatedCard, AnimatedItem } from '../../animation/AnimatedComponents';
import UniversalAudioPlayer from '../UniversalAudioPlayer';
import YouTubeVideoPlayer from '../YouTubeVideoPlayer';
import SpotifyRedirectCard from '../SpotifyRedirectCard';
import Button from '../../Common/Button';
import Input from '../../Common/Inputs';
import { useToast } from '@/app/hooks/useToast';

interface MediaData {
  spotify: {
    trackId: string;
    trackUrl: string;
    displayTitle?: string; // 🆕 "Composer - Interpreter"
    duration?: number; // 🆕 Duração em ms
    artists?: string[]; // 🆕 Lista de artistas
    previewUrl?: string | null;
    albumArt?: string | null;
    albumName?: string;
    popularity?: number;
  } | null;
  youtube: {
    videoId: string;
    videoUrl: string;
    title: string;
  } | null;
  customAudio: {
    url: string;
    file: string;
    title?: string;
  } | null;
  alternativeAudio: any[]; // 🆕 Fontes alternativas
}

interface MediaSectionProps {
  work: {
    id: string;
    title: string;
    composer: {
      fullName: string;
    };
    // 🆕 Dados de mídia expandidos
    spotifyTrackId?: string;
    spotifyTrackUrl?: string;
    spotifyDisplayTitle?: string; // 🆕
    spotifyDuration?: number; // 🆕
    spotifyArtists?: string; // 🆕 JSON string

    youtubeVideoId?: string;
    youtubeVideoUrl?: string;
    youtubeTitle?: string;

    customAudioUrl?: string;
    customAudioFile?: string;

    mediaSource?: string; // "auto", "manual", "none"
    lastMediaSearch?: Date;
    mediaSearchError?: string;
  };
  canEditMedia?: boolean;
}

const MediaSection: React.FC<MediaSectionProps> = ({
  work,
  canEditMedia = false,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [mediaData, setMediaData] = useState<MediaData>({
    spotify: null,
    youtube: null,
    customAudio: null,
    alternativeAudio: [], // 🆕
  });
  const [showEditMode, setShowEditMode] = useState(false);
  const [editData, setEditData] = useState({
    spotifyUrl: '',
    youtubeUrl: '',
    audioFile: null as File | null,
  });
  const [isUploading, setIsUploading] = useState(false);

  const toast = useToast();

  // Função para parsear artistas do Spotify
  const parseSpotifyArtists = (artistsData: any): string[] => {
    if (!artistsData) return [];

    try {
      // Se já é um array, extrair nomes
      if (Array.isArray(artistsData)) {
        return artistsData.map((artist) =>
          typeof artist === 'string' ? artist : artist.name || artist
        );
      }

      // Se é string JSON, parsear
      if (typeof artistsData === 'string') {
        const parsed = JSON.parse(artistsData);
        if (Array.isArray(parsed)) {
          return parsed.map((artist) =>
            typeof artist === 'string' ? artist : artist.name || artist
          );
        }
      }

      return [];
    } catch (error) {
      console.error('Erro ao parsear artistas do Spotify:', error);
      return [];
    }
  };

  // Inicializar dados da mídia
  useEffect(() => {
    const initialData: MediaData = {
      spotify: work.spotifyTrackId
        ? {
            trackId: work.spotifyTrackId,
            trackUrl: work.spotifyTrackUrl!,
            displayTitle: work.spotifyDisplayTitle,
            duration: work.spotifyDuration,
            artists: parseSpotifyArtists(work.spotifyArtists), // 🔧 CORRIGIDO
            previewUrl: null,
            albumArt: null,
            albumName: '',
            popularity: 0,
          }
        : null,

      youtube: work.youtubeVideoId
        ? {
            videoId: work.youtubeVideoId,
            videoUrl: work.youtubeVideoUrl!,
            title: work.youtubeTitle!,
          }
        : null,

      customAudio:
        work.customAudioUrl || work.customAudioFile
          ? {
              url: work.customAudioUrl!,
              file: work.customAudioFile!,
              title: `${work.title} - Áudio Personalizado`,
            }
          : null,

      alternativeAudio: [], // 🆕 Será carregado dinamicamente
    };

    setMediaData(initialData);
    setSearchError(work.mediaSearchError || null);
  }, [work]);

  // Verificar se tem alguma mídia
  const hasAnyMedia =
    mediaData.spotify ||
    mediaData.youtube ||
    mediaData.customAudio ||
    mediaData.alternativeAudio.length > 0; // 🆕

  // Verificar fonte da mídia
  const isAutomatic = work.mediaSource === 'auto';
  const isManual = work.mediaSource === 'manual';

  // 🆕 Lógica dos botões atualizada
  const showLoadMediaButton = !hasAnyMedia && !isSearching;
  const showRefreshButton = hasAnyMedia && isAutomatic && !isSearching;

  // 🆕 Buscar mídia automaticamente - TODAS AS 3 FONTES
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
        // 🆕 Atualizar dados locais com TODAS as fontes
        setMediaData((prev) => ({
          ...prev,
          spotify: data.spotify || prev.spotify,
          youtube: data.youtube || prev.youtube,
          alternativeAudio: data.alternativeAudio || [], // 🆕 Fontes alternativas
        }));

        const foundSources = [];
        if (data.spotify) foundSources.push('Spotify');
        if (data.youtube) foundSources.push('YouTube');
        if (data.alternativeAudio?.length > 0) {
          foundSources.push(
            `${data.alternativeAudio.length} fonte(s) alternativa(s)`
          );
        }

        if (foundSources.length > 0) {
          toast.success(`Mídia encontrada! ${foundSources.join(', ')}`);
        } else {
          setSearchError('Nenhuma mídia encontrada para esta obra');
          toast.warning('Nenhuma mídia encontrada');
        }
      } else {
        throw new Error(data.error || 'Erro na busca');
      }
    } catch (error) {
      console.error('Erro na busca de mídia:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      setSearchError(errorMessage);
      toast.error(`Erro na busca: ${errorMessage}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Salvar mídia manual
  const saveManualMedia = async () => {
    if (!canEditMedia) {
      toast.error('Você não tem permissão para editar mídia');
      return;
    }

    try {
      setIsUploading(true);

      const updateData: any = {};

      // Spotify
      if (editData.spotifyUrl) {
        if (editData.spotifyUrl.includes('spotify.com/track/')) {
          const trackId = editData.spotifyUrl.split('/track/')[1].split('?')[0];
          updateData.spotifyTrackId = trackId;
          updateData.spotifyTrackUrl = editData.spotifyUrl;
        } else {
          throw new Error('URL do Spotify inválida');
        }
      }

      // YouTube
      if (editData.youtubeUrl) {
        if (
          editData.youtubeUrl.includes('youtube.com/watch?v=') ||
          editData.youtubeUrl.includes('youtu.be/')
        ) {
          const videoId = editData.youtubeUrl.includes('youtu.be/')
            ? editData.youtubeUrl.split('youtu.be/')[1].split('?')[0]
            : editData.youtubeUrl.split('v=')[1].split('&')[0];

          updateData.youtubeVideoId = videoId;
          updateData.youtubeVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
          updateData.youtubeTitle = `${work.title} - ${work.composer.fullName}`;
        } else {
          throw new Error('URL do YouTube inválida');
        }
      }

      // Upload de áudio
      if (editData.audioFile) {
        const formData = new FormData();
        formData.append('file', editData.audioFile);
        formData.append('mediaType', 'audio');

        const uploadResponse = await fetch(
          `/api/works/${work.id}/media/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || 'Erro no upload');
        }

        updateData.customAudioFile = uploadData.url;
      }

      // Marcar como manual
      updateData.mediaSource = 'manual';

      // Salvar no banco
      const response = await fetch(`/api/works/${work.id}/media`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar');
      }

      // Atualizar interface
      setMediaData((prev) => ({
        ...prev,
        spotify: updateData.spotifyTrackId
          ? {
              trackId: updateData.spotifyTrackId,
              trackUrl: updateData.spotifyTrackUrl,
            }
          : prev.spotify,
        youtube: updateData.youtubeVideoId
          ? {
              videoId: updateData.youtubeVideoId,
              videoUrl: updateData.youtubeVideoUrl,
              title: updateData.youtubeTitle,
            }
          : prev.youtube,
        customAudio: updateData.customAudioFile
          ? {
              url: updateData.customAudioFile,
              file: updateData.customAudioFile,
              title: `${work.title} - Áudio Personalizado`,
            }
          : prev.customAudio,
      }));

      setShowEditMode(false);
      setEditData({ spotifyUrl: '', youtubeUrl: '', audioFile: null });
      toast.success('Mídia salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar mídia manual:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar mídia'
      );
    } finally {
      setIsUploading(false);
    }
  };

  // 🆕 Formatador de duração melhorado
  const formatDuration = (durationMs?: number) => {
    if (!durationMs) return null;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatedCard hover="lift" className="classical-card overflow-hidden">
      {/* Header da Seção */}
      <div className="p-8 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
              <FiMusic className="w-5 h-5 text-theme-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-theme-primary classical-title">
                Multimídia
              </h2>
              <p className="text-theme-secondary text-sm">
                Áudio, vídeos e conteúdo musical
                {/* 🆕 Mostrar fonte da mídia */}
                {hasAnyMedia && (
                  <span className="ml-2 text-xs">
                    •{' '}
                    {isAutomatic ? 'Automático' : isManual ? 'Manual' : 'Misto'}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center space-x-3">
            {/* Botão de Editar (se permitido) */}
            {canEditMedia && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiEdit3 />}
                onClick={() => setShowEditMode(!showEditMode)}
              >
                {showEditMode ? 'Cancelar' : 'Editar Mídia'}
              </Button>
            )}

            {/* Botão de Carregar Mídia */}
            {showLoadMediaButton && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={
                  isSearching ? (
                    <FiRefreshCw className="animate-spin" />
                  ) : (
                    <FiSearch />
                  )
                }
                onClick={() => searchMedia(false)}
                disabled={isSearching}
              >
                {isSearching ? 'Buscando...' : 'Carregar Mídia'}
              </Button>
            )}

            {/* 🆕 Botão de Refresh (só para mídia automática) */}
            {showRefreshButton && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={
                  <FiRefreshCw className={isSearching ? 'animate-spin' : ''} />
                }
                onClick={() => searchMedia(true)}
                disabled={isSearching}
                title="Atualizar mídia automática"
              >
                Atualizar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modo de Edição */}
      {showEditMode && canEditMedia && (
        <div className="px-8 pb-6">
          <AnimatedCard className="bg-blue-900/20 border border-blue-700/30 p-4">
            <h3 className="text-lg font-semibold text-theme-primary mb-4">
              Adicionar Mídia Manualmente
            </h3>

            <div className="space-y-4">
              <Input
                label="URL do Spotify"
                value={editData.spotifyUrl}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    spotifyUrl: e.target.value,
                  }))
                }
                placeholder="https://open.spotify.com/track/..."
                leftIcon={<SiSpotify />}
              />

              <Input
                label="URL do YouTube"
                value={editData.youtubeUrl}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    youtubeUrl: e.target.value,
                  }))
                }
                placeholder="https://www.youtube.com/watch?v=..."
                leftIcon={<SiYoutube />}
              />

              <div>
                <label className="block text-sm font-medium text-theme-tertiary mb-2">
                  Upload de Áudio
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      audioFile: e.target.files?.[0] || null,
                    }))
                  }
                  className="w-full p-3 bg-theme-elevated border border-theme-secondary rounded-xl text-theme-primary"
                />
                {editData.audioFile && (
                  <p className="text-sm text-theme-secondary mt-1">
                    Arquivo: {editData.audioFile.name}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={
                    isUploading ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiCheck />
                    )
                  }
                  onClick={saveManualMedia}
                  disabled={
                    isUploading ||
                    (!editData.spotifyUrl &&
                      !editData.youtubeUrl &&
                      !editData.audioFile)
                  }
                >
                  {isUploading ? 'Salvando...' : 'Salvar Mídia'}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiX />}
                  onClick={() => {
                    setShowEditMode(false);
                    setEditData({
                      spotifyUrl: '',
                      youtubeUrl: '',
                      audioFile: null,
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="px-8 pb-8">
        {/* Grid de Mídia */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Coluna 1: Áudio */}
          <div className="space-y-6">
            {/* Player de Áudio Universal */}
            <AnimatedItem direction="up" delay={0.1}>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FiMusic className="w-5 h-5 text-accent-green" />
                  <h3 className="text-lg font-semibold text-theme-primary classical-title">
                    Reprodução de Áudio
                  </h3>
                  {/* 🆕 Contador de fontes alternativas */}
                  {mediaData.alternativeAudio.length > 0 && (
                    <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                      +{mediaData.alternativeAudio.length} fontes
                    </span>
                  )}
                </div>

                <UniversalAudioPlayer
                  work={work}
                  customAudio={mediaData.customAudio}
                  alternativeAudioSources={mediaData.alternativeAudio} // 🆕 Passar fontes alternativas
                />
              </div>
            </AnimatedItem>

            {/* Link do Spotify */}
            <AnimatedItem direction="up" delay={0.2}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <SiSpotify className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-theme-primary classical-title">
                      Spotify
                    </h3>
                  </div>

                  {/* 🆕 Mostrar duração se disponível */}
                  {mediaData.spotify?.duration && (
                    <div className="flex items-center space-x-1 text-green-400">
                      <FiClock className="w-3 h-3" />
                      <span className="text-sm font-medium">
                        {formatDuration(mediaData.spotify.duration)}
                      </span>
                    </div>
                  )}
                </div>

                {mediaData.spotify ? (
                  <SpotifyRedirectCard
                    spotify={{
                      trackId: mediaData.spotify.trackId,
                      trackUrl: mediaData.spotify.trackUrl,
                      displayTitle: mediaData.spotify.displayTitle, // 🆕
                      duration: mediaData.spotify.duration || 0, // 🆕
                      previewUrl: mediaData.spotify.previewUrl || null,
                      albumArt: mediaData.spotify.albumArt || null,
                      artists: mediaData.spotify.artists || [
                        work.composer.fullName,
                      ],
                      albumName: mediaData.spotify.albumName || work.title,
                      popularity: mediaData.spotify.popularity || 0,
                    }}
                  />
                ) : (
                  <div className="bg-theme-elevated rounded-xl p-6 border-2 border-dashed border-theme-secondary text-center">
                    <SiSpotify className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                    <p className="text-theme-secondary text-sm">
                      {isSearching
                        ? 'Procurando no Spotify...'
                        : searchError
                        ? 'Peça não encontrada no Spotify'
                        : 'Não encontrado no Spotify'}
                    </p>
                  </div>
                )}
              </div>
            </AnimatedItem>
          </div>

          {/* Coluna 2: Vídeos */}
          <div className="space-y-6">
            {/* Vídeo do YouTube */}
            <AnimatedItem direction="up" delay={0.3}>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <SiYoutube className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-semibold text-theme-primary classical-title">
                    YouTube
                  </h3>
                </div>

                {mediaData.youtube ? (
                  <YouTubeVideoPlayer
                    video={{
                      videoId: mediaData.youtube.videoId,
                      videoUrl: mediaData.youtube.videoUrl,
                      thumbnail: `https://img.youtube.com/vi/${mediaData.youtube.videoId}/maxresdefault.jpg`,
                      title: mediaData.youtube.title,
                      channel: work.composer.fullName,
                      publishedAt: new Date().toISOString(),
                    }}
                    workTitle={work.title}
                    composer={work.composer.fullName}
                  />
                ) : (
                  <div className="bg-theme-elevated rounded-xl p-8 border-2 border-dashed border-theme-secondary text-center">
                    <FiVideo className="w-12 h-12 text-theme-tertiary mx-auto mb-3" />
                    <p className="text-theme-secondary">
                      {isSearching
                        ? 'Procurando vídeos...'
                        : searchError
                        ? 'Sem vídeo encontrado'
                        : 'Nenhum vídeo encontrado'}
                    </p>
                  </div>
                )}
              </div>
            </AnimatedItem>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {searchError && (
          <AnimatedItem direction="up" delay={0.5}>
            <div className="mt-6 bg-red-900/20 border border-red-700/30 rounded-xl p-4 flex items-start space-x-3">
              <FiAlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 text-sm font-medium">
                  Erro na busca de mídia
                </p>
                <p className="text-red-400 text-sm mt-1">{searchError}</p>
              </div>
            </div>
          </AnimatedItem>
        )}

        {/* Status de Carregamento Global */}
        {isSearching && (
          <AnimatedItem direction="up" delay={0.1}>
            <div className="mt-6 bg-blue-900/20 border border-blue-700/30 rounded-xl p-4 flex items-center space-x-3">
              <FiRefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
              <div className="flex-1">
                <p className="text-blue-300 text-sm font-medium">
                  Buscando mídia para &quot;{work.title}&quot;...
                </p>
                <p className="text-blue-400 text-xs mt-1">
                  🎵 Spotify • 📺 YouTube • 🎼 Fontes Alternativas
                </p>
              </div>
            </div>
          </AnimatedItem>
        )}

        {/* 🆕 Resumo das Fontes Encontradas */}
        {hasAnyMedia && !isSearching && (
          <AnimatedItem direction="up" delay={0.6}>
            <div className="mt-6 bg-gradient-to-r from-green-900/10 to-blue-900/10 border border-green-700/20 rounded-xl p-4">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-theme-secondary">
                    Mídia disponível:
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  {mediaData.spotify && (
                    <div className="flex items-center space-x-1 text-green-400">
                      <SiSpotify className="w-3 h-3" />
                      <span>Spotify</span>
                    </div>
                  )}

                  {mediaData.youtube && (
                    <div className="flex items-center space-x-1 text-red-400">
                      <SiYoutube className="w-3 h-3" />
                      <span>YouTube</span>
                    </div>
                  )}

                  {mediaData.customAudio && (
                    <div className="flex items-center space-x-1 text-blue-400">
                      <FiMusic className="w-3 h-3" />
                      <span>Áudio Customizado</span>
                    </div>
                  )}

                  {mediaData.alternativeAudio.length > 0 && (
                    <div className="flex items-center space-x-1 text-purple-400">
                      <FiMusic className="w-3 h-3" />
                      <span>
                        {mediaData.alternativeAudio.length} alternativa(s)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AnimatedItem>
        )}
      </div>
    </AnimatedCard>
  );
};

export default MediaSection;
