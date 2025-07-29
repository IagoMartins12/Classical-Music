// app/components/Players/MediaSection.tsx - ATUALIZADO COM BUSCA INTEGRADA DE ÁUDIO
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
  FiDatabase,
  FiTrash2,
} from 'react-icons/fi';
import { SiSpotify, SiYoutube } from 'react-icons/si';
import { AnimatedCard, AnimatedItem } from '../../animation/AnimatedComponents';
import UniversalAudioPlayer from '../UniversalAudioPlayer';
import YouTubeVideoPlayer from '../YouTubeVideoPlayer';
import SpotifyRedirectCard from '../SpotifyRedirectCard';
import Button from '../../Common/Button';
import Input from '../../Common/Inputs';
import { useToast } from '@/app/hooks/useToast';
import { WorkDetails } from '@/app/requests/work-page-details';

interface MediaData {
  spotify: {
    trackId: string;
    trackUrl: string;
    displayTitle?: string | null;
    duration?: number | null;
    artists?: string[];
    thumbnail?: string | null;
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
    isPersistent?: boolean;
  } | null;
  alternativeAudio: any[];
}

interface MediaSectionProps {
  work: WorkDetails;
  canEditMedia?: boolean;
  onMediaUpdate?: (newMediaData: any) => void; // 🆕 Callback para atualizações
}

const MediaSection: React.FC<MediaSectionProps> = ({
  work,
  canEditMedia = false,
  onMediaUpdate, // 🆕 Callback para atualizações
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [mediaData, setMediaData] = useState<MediaData>({
    spotify: null,
    youtube: null,
    customAudio: null,
    alternativeAudio: [],
  });
  const [showEditMode, setShowEditMode] = useState(false);
  const [editData, setEditData] = useState({
    spotifyUrl: '',
    youtubeUrl: '',
    audioFile: null as File | null,
    removeCustomAudio: false,
  });
  const [isUploading, setIsUploading] = useState(false);

  const toast = useToast();

  // Função para parsear artistas do Spotify
  const parseSpotifyArtists = (artistsData: any): string[] => {
    if (!artistsData) return [];

    try {
      if (Array.isArray(artistsData)) {
        return artistsData.map((artist) =>
          typeof artist === 'string' ? artist : artist.name || artist
        );
      }

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

  // 🆕 Inicializar dados da mídia E pré-popular campos de edição
  useEffect(() => {
    console.log('🎵 [MEDIA-SECTION] Inicializando dados de mídia:', {
      workId: work.id,
      hasSpotify: !!work.spotifyTrackId,
      hasYoutube: !!work.youtubeVideoId,
      hasCustomAudio: !!(work.customAudioUrl || work.customAudioFile),
      customAudioSource: work.customAudioSource,
      spotifyThumbnail: work.spotifyThumbnail,
    });

    const initialData: MediaData = {
      spotify: work.spotifyTrackId
        ? {
            trackId: work.spotifyTrackId,
            trackUrl: work.spotifyTrackUrl!,
            displayTitle: work.spotifyDisplayTitle,
            duration: work.spotifyDuration,
            artists: parseSpotifyArtists(work.spotifyArtists),
            thumbnail: work.spotifyThumbnail,
            previewUrl: null,
            albumArt: work.spotifyThumbnail,
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

      // 🆕 ÁUDIO CUSTOMIZADO - distinguir entre upload e fonte alternativa salva
      customAudio:
        work.customAudioUrl || work.customAudioFile
          ? {
              url: work.customAudioUrl || work.customAudioFile!,
              file: work.customAudioFile!,
              title:
                work.customAudioSource === 'upload'
                  ? `${work.title} - Áudio Personalizado`
                  : `${work.title} - ${work.customAudioSource}`,
              isPersistent: true,
            }
          : null,

      alternativeAudio: [],
    };

    setMediaData(initialData);
    setSearchError(work.mediaSearchError || null);

    // 🆕 PRÉ-POPULAR CAMPOS DE EDIÇÃO com dados existentes
    setEditData({
      spotifyUrl: work.spotifyTrackUrl || '', // 🎯 Pré-popular Spotify
      youtubeUrl: work.youtubeVideoUrl || '', // 🎯 Pré-popular YouTube
      audioFile: null,
      removeCustomAudio: false,
    });

    console.log(
      '✅ [MEDIA-SECTION] Dados inicializados e campos pré-populados:',
      {
        spotify: !!initialData.spotify,
        youtube: !!initialData.youtube,
        customAudio: !!initialData.customAudio,
        customAudioSource: work.customAudioSource,
        prePopulatedSpotify: !!work.spotifyTrackUrl,
        prePopulatedYoutube: !!work.youtubeVideoUrl,
      }
    );
  }, [work]);

  // 🆕 Buscar mídia automaticamente (INTEGRADA: Spotify + YouTube + Áudio)
  const searchMedia = async (forceRefresh = false) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      console.log('🔍 [MEDIA-SECTION] Iniciando busca COMPLETA de mídia:', {
        workId: work.id,
        forceRefresh,
      });

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
        console.log('✅ [MEDIA-SECTION] Busca COMPLETA concluída:', {
          spotify: !!data.spotify,
          youtube: !!data.youtube,
          alternativeAudio: data.alternativeAudio?.length || 0,
          spotifyThumbnail: data.spotify?.thumbnail,
          audioSaved: data.metadata?.audioSourceSaved || false, // 🆕 Verificar se áudio foi salvo
        });

        // Atualizar dados locais
        setMediaData((prev) => ({
          ...prev,
          spotify: data.spotify
            ? {
                ...data.spotify,
                thumbnail: data.spotify.thumbnail,
                albumArt: data.spotify.thumbnail || data.spotify.albumArt,
              }
            : prev.spotify,
          youtube: data.youtube || prev.youtube,
          // 🆕 Se foi salva uma fonte alternativa, mostrar ela como customAudio
          customAudio: data.metadata?.audioSourceSaved
            ? {
                url: data.metadata.savedAudioUrl,
                file: data.metadata.savedAudioUrl,
                title: `${work.title} - ${data.metadata.savedAudioSource}`,
                isPersistent: true,
              }
            : prev.customAudio,
          alternativeAudio: data.alternativeAudio || [],
        }));

        // 🆕 Notificar o parent sobre a atualização
        if (onMediaUpdate) {
          onMediaUpdate({
            spotify: data.spotify
              ? {
                  trackId: data.spotify.trackId,
                  trackUrl: data.spotify.trackUrl,
                  displayTitle: data.spotify.displayTitle,
                  duration: data.spotify.duration,
                  artists: data.spotify.artists,
                  thumbnail: data.spotify.thumbnail,
                }
              : null,
            youtube: data.youtube
              ? {
                  videoId: data.youtube.videoId,
                  videoUrl: data.youtube.videoUrl,
                  title: data.youtube.title,
                }
              : null,
            customAudio: data.metadata?.audioSourceSaved
              ? {
                  url: data.metadata.savedAudioUrl,
                  file: data.metadata.savedAudioUrl,
                  source: data.metadata.savedAudioSource,
                  metadata: data.metadata,
                  isUpload: false,
                  isAlternativeSource: true,
                  isPersistent: true,
                  title: `${work.title} - ${data.metadata.savedAudioSource}`,
                }
              : null,
          });
        }

        // 🆕 Atualizar campos de edição com novos dados encontrados
        if (data.spotify && !editData.spotifyUrl) {
          setEditData((prev) => ({
            ...prev,
            spotifyUrl: data.spotify.trackUrl,
          }));
        }
        if (data.youtube && !editData.youtubeUrl) {
          setEditData((prev) => ({
            ...prev,
            youtubeUrl: data.youtube.videoUrl,
          }));
        }

        const foundSources = [];
        if (data.spotify) {
          foundSources.push('Spotify');
        }
        if (data.youtube) foundSources.push('YouTube');
        if (data.metadata?.audioSourceSaved) {
          foundSources.push(`Áudio: ${data.metadata.savedAudioSource}`);
        }
        if (data.alternativeAudio?.length > 0) {
          foundSources.push(
            `${data.alternativeAudio.length} fonte(s) alternativa(s) temporária(s)`
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
      console.error('❌ [MEDIA-SECTION] Erro na busca de mídia:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      setSearchError(errorMessage);
      toast.error(`Erro na busca: ${errorMessage}`);
    } finally {
      setIsSearching(false);
    }
  };

  // 🆕 Buscar APENAS fontes alternativas adicionais (para botão "Buscar mais fontes")
  const searchAlternativeAudioSources = async () => {
    try {
      console.log(
        '🔍 [MEDIA-SECTION] Buscando fontes alternativas adicionais...'
      );

      const response = await fetch('/api/alternative-audio-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: work.title,
          composer: work.composer.fullName,
        }),
      });

      if (!response.ok) {
        console.error('Erro ao buscar fontes alternativas:', response.status);
        return;
      }

      const data = await response.json();
      const newSources = data.sources || [];

      if (newSources.length > 0) {
        // 🆕 Adicionar novas fontes temporárias (não salvas no banco)
        setMediaData((prev) => ({
          ...prev,
          alternativeAudio: newSources,
        }));

        // 🆕 Notificar o parent sobre as novas fontes (opcionalmente)
        if (onMediaUpdate) {
          onMediaUpdate({
            alternativeAudio: newSources,
          });
        }

        toast.success(
          `${newSources.length} fonte(s) alternativa(s) temporária(s) encontrada(s)!`
        );
      } else {
        toast.warning('Nenhuma fonte alternativa adicional encontrada');
      }
    } catch (error) {
      console.error('Erro ao buscar fontes alternativas:', error);
      toast.error('Erro ao buscar fontes alternativas');
    }
  };

  // 🆕 Função para deletar áudio customizado (física + banco)
  const deleteCustomAudio = async () => {
    if (!canEditMedia) {
      toast.error('Você não tem permissão para editar mídia');
      return;
    }

    if (!work.customAudioFile && !work.customAudioUrl) {
      toast.error('Nenhum áudio customizado para deletar');
      return;
    }

    try {
      setIsUploading(true);

      console.log('🗑️ [MEDIA-SECTION] Deletando áudio customizado:', {
        customAudioFile: work.customAudioFile,
        customAudioSource: work.customAudioSource,
      });

      // 🎯 DELETAR ARQUIVO FÍSICO (se for upload local)
      if (work.customAudioFile && work.customAudioSource === 'upload') {
        const fileName = work.customAudioFile.split('/').pop();
        if (fileName) {
          const deleteFileResponse = await fetch(
            `/api/works/${work.id}/media/upload?fileName=${fileName}&mediaType=audio`,
            { method: 'DELETE' }
          );

          if (!deleteFileResponse.ok) {
            console.warn('⚠️ [MEDIA-SECTION] Falha ao deletar arquivo físico');
          } else {
            console.log('✅ [MEDIA-SECTION] Arquivo físico deletado');
          }
        }
      }

      // 🎯 LIMPAR CAMPOS NO BANCO
      const response = await fetch(`/api/works/${work.id}/media`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          removeCustomAudio: true,
          mediaSource: 'manual',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar');
      }

      console.log('✅ [MEDIA-SECTION] Áudio customizado deletado com sucesso');

      // 🎯 LIMPAR INTERFACE
      setMediaData((prev) => ({
        ...prev,
        customAudio: null,
      }));

      setEditData((prev) => ({
        ...prev,
        removeCustomAudio: false,
      }));

      // 🆕 Notificar o parent sobre a remoção
      if (onMediaUpdate) {
        onMediaUpdate({
          customAudio: null,
        });
      }

      toast.success('Áudio customizado removido com sucesso!');
    } catch (error) {
      console.error(
        '❌ [MEDIA-SECTION] Erro ao deletar áudio customizado:',
        error
      );
      toast.error(
        error instanceof Error ? error.message : 'Erro ao deletar áudio'
      );
    } finally {
      setIsUploading(false);
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

      console.log('💾 [MEDIA-SECTION] Salvando mídia manual:', {
        spotifyUrl: !!editData.spotifyUrl,
        youtubeUrl: !!editData.youtubeUrl,
        audioFile: !!editData.audioFile,
        removeCustomAudio: editData.removeCustomAudio,
      });

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

      // Remover áudio customizado
      if (editData.removeCustomAudio) {
        updateData.removeCustomAudio = true;
      }

      // Upload de áudio
      if (editData.audioFile) {
        console.log(
          '📤 [MEDIA-SECTION] Fazendo upload de áudio customizado...'
        );

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

        console.log('✅ [MEDIA-SECTION] Upload concluído:', uploadData.url);

        updateData.customAudioFile = uploadData.url;
        updateData.customAudioUrl = uploadData.url;
        updateData.customAudioSource = 'upload'; // 🆕 Marcar como upload
        updateData.customAudioMetadata = {
          title: `${work.title} - Áudio Personalizado`,
          source: 'upload',
          originalName: editData.audioFile.name,
          uploadedAt: new Date().toISOString(),
        };
      }

      // Marcar como manual
      updateData.mediaSource = 'manual';

      // Salvar no banco
      console.log('💾 [MEDIA-SECTION] Salvando na base de dados...');

      const response = await fetch(`/api/works/${work.id}/media`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar');
      }

      console.log('✅ [MEDIA-SECTION] Dados salvos com sucesso');

      // Atualizar interface
      setMediaData((prev) => ({
        ...prev,
        spotify: updateData.spotifyTrackId
          ? {
              trackId: updateData.spotifyTrackId,
              trackUrl: updateData.spotifyTrackUrl,
              displayTitle: updateData.spotifyDisplayTitle,
              duration: updateData.spotifyDuration,
              artists: updateData.spotifyArtists
                ? JSON.parse(updateData.spotifyArtists)
                : [],
              thumbnail: updateData.spotifyThumbnail,
            }
          : prev.spotify,
        youtube: updateData.youtubeVideoId
          ? {
              videoId: updateData.youtubeVideoId,
              videoUrl: updateData.youtubeVideoUrl,
              title: updateData.youtubeTitle,
            }
          : prev.youtube,
        customAudio: editData.removeCustomAudio
          ? null
          : updateData.customAudioFile
          ? {
              url: updateData.customAudioFile,
              file: updateData.customAudioFile,
              title: `${work.title} - Áudio Personalizado`,
              isPersistent: true,
            }
          : prev.customAudio,
      }));

      // 🆕 Notificar o parent sobre a atualização
      if (onMediaUpdate) {
        onMediaUpdate({
          spotify: updateData.spotifyTrackId
            ? {
                trackId: updateData.spotifyTrackId,
                trackUrl: updateData.spotifyTrackUrl,
                displayTitle: updateData.spotifyDisplayTitle,
                duration: updateData.spotifyDuration,
                artists: updateData.spotifyArtists
                  ? JSON.parse(updateData.spotifyArtists)
                  : [],
                thumbnail: updateData.spotifyThumbnail,
              }
            : null,
          youtube: updateData.youtubeVideoId
            ? {
                videoId: updateData.youtubeVideoId,
                videoUrl: updateData.youtubeVideoUrl,
                title: updateData.youtubeTitle,
              }
            : null,
          customAudio: editData.removeCustomAudio
            ? null
            : updateData.customAudioFile
            ? {
                url: updateData.customAudioFile,
                file: updateData.customAudioFile,
                source: 'upload',
                metadata: updateData.customAudioMetadata,
                isUpload: true,
                isAlternativeSource: false,
                isPersistent: true,
                title: `${work.title} - Áudio Personalizado`,
              }
            : null,
        });
      }

      setShowEditMode(false);
      setEditData({
        spotifyUrl: updateData.spotifyTrackUrl || '',
        youtubeUrl: updateData.youtubeVideoUrl || '',
        audioFile: null,
        removeCustomAudio: false,
      });
      toast.success('Mídia salva com sucesso!');
    } catch (error) {
      console.error('❌ [MEDIA-SECTION] Erro ao salvar mídia manual:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar mídia'
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Verificar se tem alguma mídia
  const hasAnyMedia =
    mediaData.spotify ||
    mediaData.youtube ||
    mediaData.customAudio ||
    mediaData.alternativeAudio.length > 0;

  // Verificar fonte da mídia
  const isAutomatic = work.mediaSource === 'auto';

  // Lógica dos botões
  const showLoadMediaButton = !hasAnyMedia && !isSearching;
  const showRefreshButton = hasAnyMedia && isAutomatic;

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
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center space-x-3">
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
                {isSearching ? 'Atualizando...' : 'Atualizar Mídia'}
              </Button>
            )}

            {/* 🆕 Botão para buscar mais fontes alternativas */}
            {hasAnyMedia && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<FiMusic />}
                onClick={searchAlternativeAudioSources}
                title="Buscar mais fontes de áudio alternativas"
              >
                Mais Fontes
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 🆕 Modo de Edição COM CAMPOS PRÉ-POPULADOS */}
      {showEditMode && canEditMedia && (
        <div className="px-8 pb-6">
          <AnimatedCard className="bg-blue-900/20 border border-blue-700/30 p-4">
            <h3 className="text-lg font-semibold text-theme-primary mb-4">
              Adicionar Mídia Manualmente
            </h3>

            <div className="space-y-4">
              {/* 🎯 Campo Spotify PRÉ-POPULADO */}
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

              {/* 🎯 Campo YouTube PRÉ-POPULADO */}
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

              {/* 🆕 Seção de áudio customizado melhorada */}
              <div>
                <label className="block text-sm font-medium text-theme-tertiary mb-2">
                  Áudio Personalizado
                </label>

                {/* 🆕 Mostrar áudio existente com opção de deletar */}
                {mediaData.customAudio && (
                  <div className="mb-3 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FiDatabase className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-300">
                          {work.customAudioSource === 'upload'
                            ? 'Áudio personalizado já salvo'
                            : `Fonte alternativa salva: ${work.customAudioSource}`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEditData((prev) => ({
                              ...prev,
                              removeCustomAudio: !prev.removeCustomAudio,
                            }))
                          }
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            editData.removeCustomAudio
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          }`}
                        >
                          {editData.removeCustomAudio
                            ? 'Cancelar Remoção'
                            : 'Remover'}
                        </button>
                        {/* 🆕 Botão de deletar direto */}
                        <button
                          type="button"
                          onClick={deleteCustomAudio}
                          disabled={isUploading}
                          className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center space-x-1"
                        >
                          <FiTrash2 className="w-3 h-3" />
                          <span>Deletar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      audioFile: e.target.files?.[0] || null,
                      removeCustomAudio: false,
                    }))
                  }
                  className="w-full p-3 bg-theme-elevated border border-theme-secondary rounded-xl text-theme-primary"
                />
                {editData.audioFile && (
                  <p className="text-sm text-theme-secondary mt-1">
                    Novo arquivo: {editData.audioFile.name}
                  </p>
                )}
                {editData.removeCustomAudio && (
                  <p className="text-sm text-red-400 mt-1">
                    ⚠️ O áudio atual será removido
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
                      !editData.audioFile &&
                      !editData.removeCustomAudio)
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
                    // 🆕 Restaurar campos com dados existentes
                    setEditData({
                      spotifyUrl: work.spotifyTrackUrl || '',
                      youtubeUrl: work.youtubeVideoUrl || '',
                      audioFile: null,
                      removeCustomAudio: false,
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
            <AnimatedItem direction="up" delay={0.1}>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FiMusic className="w-5 h-5 text-accent-green" />
                  <h3 className="text-lg font-semibold text-theme-primary classical-title">
                    Reprodução de Áudio
                  </h3>
                  <div className="flex items-center space-x-2">
                    {mediaData.alternativeAudio.length > 0 && (
                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                        +{mediaData.alternativeAudio.length} fontes temporárias
                      </span>
                    )}
                    {mediaData.customAudio?.isPersistent && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full flex items-center space-x-1">
                        <FiDatabase className="w-3 h-3" />
                        <span>Salvo</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 🆕 Player simplificado - apenas recebe as fontes */}
                <UniversalAudioPlayer
                  work={work}
                  customAudio={mediaData.customAudio}
                  alternativeAudioSources={mediaData.alternativeAudio}
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
                </div>

                {mediaData.spotify ? (
                  <SpotifyRedirectCard
                    spotify={{
                      trackId: mediaData.spotify.trackId,
                      trackUrl: mediaData.spotify.trackUrl,
                      displayTitle: mediaData.spotify.displayTitle,
                      duration: mediaData.spotify.duration || 0,
                      previewUrl: mediaData.spotify.previewUrl || null,
                      albumArt: mediaData.spotify.albumArt || null,
                      thumbnail: mediaData.spotify.thumbnail,
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
                  🎵 Spotify • 📺 YouTube • 🎼 Fontes de Áudio Alternativas
                </p>
              </div>
            </div>
          </AnimatedItem>
        )}

        {/* Resumo das Fontes Encontradas */}
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
                      <span>
                        {work.customAudioSource === 'upload'
                          ? 'Áudio Customizado'
                          : `Fonte: ${work.customAudioSource}`}
                      </span>
                      {mediaData.customAudio.isPersistent && (
                        <span className="text-xs bg-blue-600 px-1 rounded">
                          SALVO
                        </span>
                      )}
                    </div>
                  )}

                  {mediaData.alternativeAudio.length > 0 && (
                    <div className="flex items-center space-x-1 text-purple-400">
                      <FiMusic className="w-3 h-3" />
                      <span>
                        {mediaData.alternativeAudio.length} temporária(s)
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
