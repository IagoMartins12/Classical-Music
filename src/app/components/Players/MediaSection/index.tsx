// app/components/Players/MediaSection.tsx - COM TRADUÇÕES
'use client';

import React, { useState, useEffect } from 'react';
import {
  FiMusic,
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
import { useTranslation } from '@/app/context/TranslationContext';

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
  onMediaUpdate?: (newMediaData: any) => void;
  userRole?: number;
  isAdmin?: boolean;
}

const MediaSection: React.FC<MediaSectionProps> = ({
  work,
  canEditMedia = false,
  onMediaUpdate,
  userRole,
  isAdmin = false,
}) => {
  const { t } = useTranslation({ sections: ['pages/workId'] });
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

  // CONTROLE LOCAL DE BUSCA REALIZADA NESTA SESSÃO
  const [hasSearchedInSession, setHasSearchedInSession] = useState(false);

  const toast = useToast();

  // VERIFICAR SE JÁ FOI FEITA ALGUMA BUSCA (SERVIDOR OU SESSÃO ATUAL)
  const hasSearchBeenMade =
    !!work.lastMediaSearch ||
    hasSearchedInSession ||
    !work.youtubeVideoUrl ||
    !work.spotifyTrackId;

  // VERIFICAR SE É ADMIN (role 2 ou isAdmin como fallback)
  const isAdminUser = userRole === 2 || isAdmin;

  // VERIFICAR SE PODE BUSCAR (admin pode sempre, usuário comum só se não buscou)
  const canSearch = isAdminUser || !hasSearchBeenMade;

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

  // Inicializar dados da mídia E pré-popular campos de edição
  useEffect(() => {
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

      customAudio:
        work.customAudioUrl || work.customAudioFile
          ? {
              url: work.customAudioUrl || work.customAudioFile!,
              file: work.customAudioFile!,
              title:
                work.customAudioSource === 'upload'
                  ? `${work.title} - ${t('media_audio_personalizado')}`
                  : `${work.title} - ${work.customAudioSource}`,
              isPersistent: true,
            }
          : null,

      alternativeAudio: [],
    };

    setMediaData(initialData);
    setSearchError(work.mediaSearchError || null);

    // Pré-popular campos de edição com dados existentes
    setEditData({
      spotifyUrl: work.spotifyTrackUrl || '',
      youtubeUrl: work.youtubeVideoUrl || '',
      audioFile: null,
      removeCustomAudio: false,
    });
  }, [work, t]);

  // Buscar mídia automaticamente (INTEGRADA: Spotify + YouTube + Áudio)
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
        throw new Error(data.error || t('media_erro_busca'));
      }

      if (data.success) {
        // MARCAR QUE A BUSCA FOI FEITA NESTA SESSÃO
        setHasSearchedInSession(true);

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

        // Notificar o parent sobre a atualização
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

        // Atualizar campos de edição com novos dados encontrados
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
          foundSources.push(`Audio`);
        }

        if (foundSources.length > 0) {
          toast.success(t('media_encontrada'));
        } else {
          setSearchError(t('media_nenhuma_encontrada'));
          toast.warning(t('media_nenhuma_encontrada'));
        }
      } else {
        throw new Error(data.error || t('media_erro_busca'));
      }
    } catch (error) {
      console.error('❌ [MEDIA-SECTION] Erro na busca de mídia:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      setSearchError(errorMessage);
      toast.error(`${t('media_erro_busca_geral')} ${errorMessage}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Função para deletar áudio customizado (física + banco)
  const deleteCustomAudio = async () => {
    if (!canEditMedia) {
      toast.error(t('media_erro_permissao'));
      return;
    }

    if (!work.customAudioFile && !work.customAudioUrl) {
      toast.error(t('media_audio_nao_encontrado'));
      return;
    }

    try {
      setIsUploading(true);

      // Deletar arquivo físico (se for upload local)
      if (work.customAudioFile && work.customAudioSource === 'upload') {
        const fileName = work.customAudioFile.split('/').pop();
        if (fileName) {
          await fetch(
            `/api/works/${work.id}/media/upload?fileName=${fileName}&mediaType=audio`,
            { method: 'DELETE' }
          );
        }
      }

      // Limpar campos no banco
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
        throw new Error(data.error || t('media_erro_deletar'));
      }

      // Limpar interface
      setMediaData((prev) => ({
        ...prev,
        customAudio: null,
      }));

      setEditData((prev) => ({
        ...prev,
        removeCustomAudio: false,
      }));

      // Notificar o parent sobre a remoção
      if (onMediaUpdate) {
        onMediaUpdate({
          customAudio: null,
        });
      }

      toast.success(t('media_audio_removido_sucesso'));
    } catch (error) {
      console.error(
        '❌ [MEDIA-SECTION] Erro ao deletar áudio customizado:',
        error
      );
      toast.error(
        error instanceof Error ? error.message : t('media_erro_deletar_audio')
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Salvar mídia manual
  const saveManualMedia = async () => {
    if (!canEditMedia) {
      toast.error(t('media_erro_permissao'));
      return;
    }

    // VERIFICAÇÃO MELHORADA - deve ter feito busca primeiro
    if (!hasSearchBeenMade) {
      toast.error(t('media_erro_busca_primeiro'));
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
          throw new Error(t('media_spotify_invalido'));
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
          throw new Error(t('media_youtube_invalido'));
        }
      }

      // Remover áudio customizado
      if (editData.removeCustomAudio) {
        updateData.removeCustomAudio = true;
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
          throw new Error(uploadData.error || t('media_erro_upload'));
        }

        updateData.customAudioFile = uploadData.url;
        updateData.customAudioUrl = uploadData.url;
        updateData.customAudioSource = 'upload';
        updateData.customAudioMetadata = {
          title: `${work.title} - ${t('media_audio_personalizado')}`,
          source: 'upload',
          originalName: editData.audioFile.name,
          uploadedAt: new Date().toISOString(),
        };
      }

      // Marcar como manual
      updateData.mediaSource = 'manual';

      // Salvar no banco
      const response = await fetch(`/api/works/${work.id}/media`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('media_erro_salvar'));
      }

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
              title: `${work.title} - ${t('media_audio_personalizado')}`,
              isPersistent: true,
            }
          : prev.customAudio,
      }));

      // Notificar o parent sobre a atualização
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
                title: `${work.title} - ${t('media_audio_personalizado')}`,
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
      toast.success(t('media_sucesso_salvar'));
    } catch (error) {
      console.error('❌ [MEDIA-SECTION] Erro ao salvar mídia manual:', error);
      toast.error(
        error instanceof Error ? error.message : t('media_erro_salvar_geral')
      );
    } finally {
      setIsUploading(false);
    }
  };

  // VERIFICAR SE TEM ALGUMA MÍDIA DISPONÍVEL
  const hasAnyMedia =
    mediaData.spotify ||
    mediaData.youtube ||
    mediaData.customAudio ||
    mediaData.alternativeAudio.length > 0;

  // VERIFICAR SE TEM APENAS ÁUDIO (para layout responsivo)
  const hasOnlyAudio =
    (mediaData.spotify || mediaData.customAudio) && !mediaData.youtube;
  const hasOnlyVideo =
    mediaData.youtube && !mediaData.spotify && !mediaData.customAudio;
  const hasAudioAndVideo =
    (mediaData.spotify || mediaData.customAudio) && mediaData.youtube;

  // ESTADOS PARA EXIBIÇÃO
  const shouldShowLoadButton = !hasSearchBeenMade && !hasAnyMedia;
  const shouldShowNoMediaMessage =
    hasSearchBeenMade && !hasAnyMedia && !isSearching;
  const shouldShowContent = hasAnyMedia;

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
                {t('media_titulo')}
              </h2>
              <p className="text-theme-secondary text-sm">
                {t('media_subtitulo')}
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
                {showEditMode ? t('media_cancelar') : t('media_editar')}
              </Button>
            )}

            {/* BOTÃO DE BUSCA COM LÓGICA MELHORADA */}
            {canSearch && (
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
                {isSearching
                  ? t('media_buscando')
                  : hasSearchBeenMade
                  ? t('media_buscar_novamente')
                  : t('media_carregar')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* MODO DE EDIÇÃO COM VALIDAÇÃO MELHORADA */}
      {showEditMode && canEditMedia && (
        <div className="px-8 pb-6">
          <AnimatedCard className="bg-blue-900/20 border border-blue-700/30 p-4">
            <h3 className="text-lg font-semibold text-theme-primary mb-4">
              {t('media_adicionar_manual')}
            </h3>

            {/* ALERTA MELHORADO - Mais claro sobre a necessidade da busca */}
            {!hasSearchBeenMade && (
              <div className="mb-4 bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 flex items-start space-x-3">
                <FiAlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-amber-300 font-medium">
                    {t('media_busca_necessaria')}
                  </p>
                  <p className="text-amber-400 text-sm mt-1">
                    {t('media_busca_instrucoes')}{' '}
                    <strong>&quot;{t('media_carregar')}&quot;</strong>{' '}
                    {t('media_busca_instrucoes_2')}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Campos de entrada */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('media_spotify_url')}
                  value={editData.spotifyUrl}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      spotifyUrl: e.target.value,
                    }))
                  }
                  placeholder="https://open.spotify.com/track/..."
                  leftIcon={<SiSpotify />}
                  disabled={!hasSearchBeenMade}
                />

                <Input
                  label={t('media_youtube_url')}
                  value={editData.youtubeUrl}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      youtubeUrl: e.target.value,
                    }))
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                  leftIcon={<SiYoutube />}
                  disabled={!hasSearchBeenMade}
                />
              </div>

              {/* Seção de áudio customizado */}
              <div>
                <label className="block text-sm font-medium text-theme-tertiary mb-2">
                  {t('media_audio_personalizado')}
                </label>

                {/* Mostrar áudio existente com opção de deletar */}
                {mediaData.customAudio && (
                  <div className="mb-3 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FiDatabase className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-300">
                          {work.customAudioSource === 'upload'
                            ? t('media_audio_salvo')
                            : `${t('media_fonte_alternativa')} ${
                                work.customAudioSource
                              }`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={deleteCustomAudio}
                          disabled={isUploading || !hasSearchBeenMade}
                          className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center space-x-1"
                        >
                          <FiTrash2 className="w-3 h-3" />
                          <span>{t('media_deletar')}</span>
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
                  disabled={!hasSearchBeenMade}
                  className="w-full p-3 bg-theme-elevated border border-theme-secondary rounded-xl text-theme-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {editData.audioFile && (
                  <p className="text-sm text-theme-secondary mt-1">
                    {t('media_novo_arquivo')} {editData.audioFile.name}
                  </p>
                )}
                {work.customAudioMetadata &&
                  (work.customAudioMetadata as any)?.title &&
                  !editData.audioFile && (
                    <p className="text-sm text-theme-secondary mt-1">
                      {t('media_arquivo_selecionado')}{' '}
                      {(work.customAudioMetadata as any).title}
                    </p>
                  )}
                {editData.removeCustomAudio && (
                  <p className="text-sm text-red-400 mt-1">
                    ⚠️ {t('media_audio_removido')}
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
                    !hasSearchBeenMade ||
                    (!editData.spotifyUrl &&
                      !editData.youtubeUrl &&
                      !editData.audioFile &&
                      !editData.removeCustomAudio)
                  }
                  className={
                    !hasSearchBeenMade ? 'opacity-50 cursor-not-allowed' : ''
                  }
                >
                  {isUploading ? t('media_salvando') : t('media_salvar')}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiX />}
                  onClick={() => {
                    setShowEditMode(false);
                    // Restaurar campos com dados existentes
                    setEditData({
                      spotifyUrl: work.spotifyTrackUrl || '',
                      youtubeUrl: work.youtubeVideoUrl || '',
                      audioFile: null,
                      removeCustomAudio: false,
                    });
                  }}
                >
                  {t('media_cancelar')}
                </Button>
              </div>

              {/* FEEDBACK ADICIONAL */}
              {!hasSearchBeenMade && (
                <div className="mt-3 text-xs text-theme-tertiary text-center">
                  💡 {t('media_dica_busca')}
                </div>
              )}
            </div>
          </AnimatedCard>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL COM NOVA LÓGICA */}
      <div className="px-8 pb-8">
        {/* ESTADO: Nenhuma busca foi feita e não tem mídia */}
        {shouldShowLoadButton && (
          <AnimatedItem direction="up" delay={0.1}>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-blue rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiSearch className="w-8 h-8 text-theme-primary" />
              </div>
              <h3 className="text-xl font-semibold text-theme-primary mb-3">
                {t('media_buscar_multimidia')}
              </h3>
              <p className="text-theme-secondary mb-6 max-w-md mx-auto">
                {t('media_buscar_instrucoes')}
              </p>
              <Button
                variant="primary"
                size="md"
                leftIcon={<FiSearch />}
                onClick={() => searchMedia(false)}
                disabled={isSearching}
              >
                {isSearching ? t('media_buscando') : t('media_carregar')}
              </Button>
            </div>
          </AnimatedItem>
        )}

        {/* ESTADO: Busca foi feita mas não encontrou nada */}
        {shouldShowNoMediaMessage && (
          <AnimatedItem direction="up" delay={0.1}>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiMusic className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-theme-primary mb-3">
                {t('media_sem_midia')}
              </h3>
              <p className="text-theme-secondary mb-6 max-w-md mx-auto">
                {t('media_nao_encontrado')}
              </p>
              {isAdminUser && (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiRefreshCw />}
                  onClick={() => searchMedia(true)}
                  disabled={isSearching}
                >
                  {t('media_tentar_novamente')}
                </Button>
              )}
            </div>
          </AnimatedItem>
        )}

        {/* ESTADO: Tem mídia disponível - LAYOUT RESPONSIVO */}
        {shouldShowContent && (
          <>
            {/* Layout para apenas áudio OU apenas vídeo - VERTICAL */}
            {(hasOnlyAudio || hasOnlyVideo) && (
              <div className="space-y-6">
                {/* Spotify */}
                {mediaData.spotify && (
                  <AnimatedItem direction="up" delay={0.1}>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <SiSpotify className="w-5 h-5 text-green-400" />
                        <h3 className="text-lg font-semibold text-theme-primary classical-title">
                          {t('media_spotify')}
                        </h3>
                      </div>
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
                    </div>
                  </AnimatedItem>
                )}

                {/* Áudio */}
                {mediaData.customAudio && (
                  <AnimatedItem direction="up" delay={0.2}>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <FiMusic className="w-5 h-5 text-accent-green" />
                        <h3 className="text-lg font-semibold text-theme-primary classical-title">
                          {t('media_reproducao_audio')}
                        </h3>
                      </div>
                      <UniversalAudioPlayer
                        work={work}
                        customAudio={mediaData.customAudio}
                        alternativeAudioSources={mediaData.alternativeAudio}
                        isSearching={isSearching}
                        searchError={searchError}
                      />
                    </div>
                  </AnimatedItem>
                )}

                {/* YouTube */}
                {mediaData.youtube && (
                  <AnimatedItem direction="up" delay={0.3}>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <SiYoutube className="w-5 h-5 text-red-400" />
                        <h3 className="text-lg font-semibold text-theme-primary classical-title">
                          {t('media_youtube')}
                        </h3>
                      </div>
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
                    </div>
                  </AnimatedItem>
                )}
              </div>
            )}

            {/* Layout para áudio E vídeo - GRID 2 COLUNAS */}
            {hasAudioAndVideo && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Coluna 1: Áudio */}
                <div className="space-y-6">
                  {/* Spotify */}
                  {mediaData.spotify && (
                    <AnimatedItem direction="up" delay={0.2}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <SiSpotify className="w-5 h-5 text-green-400" />
                          <h3 className="text-lg font-semibold text-theme-primary classical-title">
                            {t('media_spotify')}
                          </h3>
                        </div>
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
                            albumName:
                              mediaData.spotify.albumName || work.title,
                            popularity: mediaData.spotify.popularity || 0,
                          }}
                        />
                      </div>
                    </AnimatedItem>
                  )}

                  {/* Áudio Player */}
                  {mediaData.customAudio && (
                    <AnimatedItem direction="up" delay={0.1}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <FiMusic className="w-5 h-5 text-accent-green" />
                          <h3 className="text-lg font-semibold text-theme-primary classical-title">
                            {t('media_reproducao_audio')}
                          </h3>
                        </div>
                        <UniversalAudioPlayer
                          work={work}
                          customAudio={mediaData.customAudio}
                          alternativeAudioSources={mediaData.alternativeAudio}
                          isSearching={isSearching}
                          searchError={searchError}
                        />
                      </div>
                    </AnimatedItem>
                  )}
                </div>

                {/* Coluna 2: Vídeo */}
                {mediaData.youtube && (
                  <div className="space-y-6">
                    <AnimatedItem direction="up" delay={0.3}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <SiYoutube className="w-5 h-5 text-red-400" />
                          <h3 className="text-lg font-semibold text-theme-primary classical-title">
                            {t('media_youtube')}
                          </h3>
                        </div>
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
                      </div>
                    </AnimatedItem>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Status de Carregamento Global */}
        {isSearching && (
          <AnimatedItem direction="up" delay={0.1}>
            <div className="mt-6 bg-blue-900/20 border border-blue-700/30 rounded-xl p-4 flex items-center space-x-3">
              <FiRefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
              <div className="flex-1">
                <p className="text-blue-300 text-sm font-medium">
                  {t('media_buscando_para')} &quot;{work.title}&quot;...
                </p>
                <p className="text-blue-400 text-xs mt-1">
                  🎵 Spotify • 📺 YouTube • 🎼 Fontes de Áudio
                </p>
              </div>
            </div>
          </AnimatedItem>
        )}

        {/* Mensagem de Erro */}
        {searchError && hasSearchBeenMade && (
          <AnimatedItem direction="up" delay={0.5}>
            <div className="mt-6 bg-red-900/20 border border-red-700/30 rounded-xl p-4 flex items-start space-x-3">
              <FiAlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 text-sm font-medium">
                  {t('media_erro_busca')}
                </p>
                <p className="text-red-400 text-sm mt-1">{searchError}</p>
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
                    {t('media_disponivel')}
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
                      <span>Áudio</span>
                    </div>
                  )}

                  {mediaData.alternativeAudio.length > 0 && (
                    <div className="flex items-center space-x-1 text-purple-400">
                      <FiMusic className="w-3 h-3" />
                      <span>
                        {mediaData.alternativeAudio.length}{' '}
                        {t('media_temporarias')}
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
