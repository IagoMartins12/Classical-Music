// app/components/Players/VideoAulaSection.tsx - CORRIGIDO E MELHORADO
'use client';

import React, { useState, useEffect } from 'react';
import {
  FiPlay,
  FiExternalLink,
  FiUser,
  FiClock,
  FiVideo,
  FiDownload,
  FiEdit3,
} from 'react-icons/fi';
import { SiYoutube, SiInstagram, SiTiktok } from 'react-icons/si';
import { AnimatedCard } from '../../animation/AnimatedComponents';
import { FaGraduationCap } from 'react-icons/fa';
import Button from '../../Common/Button';
import Image from 'next/image';

// ✅ INTERFACE CORRIGIDA - removendo null dos tipos
interface VideoAulaSectionProps {
  work: {
    id: string;
    title: string;
    composer: {
      fullName: string;
    };
    videoAulaUrl?: string; // string | undefined (sem null)
    videoAulaFile?: string; // string | undefined (sem null)
    videoAulaTitle?: string; // string | undefined (sem null)
    videoAulaType?: string; // string | undefined (sem null)
    videoAulaSource?: string; // string | undefined (sem null)
    videoAulaAddedBy?: string; // string | undefined (sem null)
    videoAulaAddedAt?: Date; // Date | undefined (sem null)
    videoAulaMetadata?: any; // any | undefined (sem null)
  };
  canEditMedia?: boolean;
  onOpenEditModal?: () => void;
}

// ✅ OPÇÕES ATUALIZADAS - removendo 'story'
const videoAulaTypeOptions = [
  { value: 'video', label: 'Vídeo Normal' },
  { value: 'reels', label: 'Reels/Shorts' }, // Removido 'story'
  { value: 'live', label: 'Live/Transmissão' },
];

const videoAulaSourceOptions = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'local', label: 'Upload Local' },
];

// ✅ INTERFACE PARA INFORMAÇÕES DO VÍDEO
interface VideoInfo {
  platform: string;
  embedUrl: string;
  thumbnailUrl: string;
  canEmbed: boolean;
  aspectRatio: string;
  displayType: string;
  embedHtml?: string; // Para TikTok oEmbed
}

const VideoAulaSection: React.FC<VideoAulaSectionProps> = ({
  work,
  canEditMedia = false,
  onOpenEditModal,
}) => {
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loadingEmbed, setLoadingEmbed] = useState(false);

  // Só renderizar se tiver conteúdo
  const hasVideoAula = !!(work.videoAulaUrl || work.videoAulaFile);

  // ✅ FUNÇÃO PARA DETECTAR INFORMAÇÕES DO VÍDEO - MELHORADA
  const detectVideoInfo = async (
    url: string,
    type?: string,
    source?: string
  ): Promise<VideoInfo> => {
    const videoType = type || 'video';
    const videoSource = source || 'external';
    const aspectRatio = getAspectRatio(videoType);
    const displayType = getDisplayType(videoType);

    console.log('🎥 [VIDEO-AULA] Detectando info:', {
      url,
      type: videoType,
      source: videoSource,
    });

    // ✅ YOUTUBE
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = extractYouTubeId(url);
      return {
        platform: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        canEmbed: true,
        aspectRatio,
        displayType,
      };
    }

    // ✅ TIKTOK - usando oEmbed API
    if (url.includes('tiktok.com')) {
      try {
        setLoadingEmbed(true);
        const oEmbedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(
          url
        )}`;
        const response = await fetch(oEmbedUrl);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ [VIDEO-AULA] TikTok oEmbed success:', data);

          return {
            platform: 'tiktok',
            embedUrl: url,
            thumbnailUrl: data.thumbnail_url || '',
            canEmbed: true,
            aspectRatio: '9:16', // TikTok é sempre vertical
            displayType: 'TikTok',
            embedHtml: data.html, // HTML do embed
          };
        } else {
          console.warn('⚠️ [VIDEO-AULA] TikTok oEmbed falhou, usando fallback');
        }
      } catch (error) {
        console.error('❌ [VIDEO-AULA] Erro TikTok oEmbed:', error);
      } finally {
        setLoadingEmbed(false);
      }

      // Fallback para TikTok
      return {
        platform: 'tiktok',
        embedUrl: url,
        thumbnailUrl:
          work.videoAulaMetadata?.thumbnail || '/images/tiktok-placeholder.png',
        canEmbed: false, // Forçar abrir em nova aba se oEmbed falhou
        aspectRatio: '9:16',
        displayType: 'TikTok',
      };
    }

    // ✅ INSTAGRAM - tentar embed, fallback para nova aba
    if (url.includes('instagram.com')) {
      if (url.includes('/reel/') || videoType === 'reels') {
        // Instagram Reels - embed básico
        const postUrl = url.replace('/reel/', '/p/'); // Converter reel para post

        return {
          platform: 'instagram-reel',
          embedUrl: `${postUrl}embed/`,
          thumbnailUrl:
            work.videoAulaMetadata?.thumbnail ||
            '/images/instagram-placeholder.png',
          canEmbed: true, // Tentar embed
          aspectRatio: '9:16',
          displayType: 'Instagram Reel',
        };
      } else {
        // Instagram Post normal
        return {
          platform: 'instagram',
          embedUrl: `${url}embed/`,
          thumbnailUrl:
            work.videoAulaMetadata?.thumbnail ||
            '/images/instagram-placeholder.png',
          canEmbed: true,
          aspectRatio: '1:1',
          displayType: 'Instagram Post',
        };
      }
    }

    // ✅ UPLOAD LOCAL
    if (videoSource === 'local' || url.startsWith('/uploads/')) {
      return {
        platform: 'local',
        embedUrl: url,
        thumbnailUrl:
          work.videoAulaMetadata?.thumbnail || '/images/video-placeholder.png',
        canEmbed: true,
        aspectRatio,
        displayType,
      };
    }

    // ✅ VÍDEO DIRETO (mp4, webm, etc.)
    if (url.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
      return {
        platform: 'direct',
        embedUrl: url,
        thumbnailUrl:
          work.videoAulaMetadata?.thumbnail || '/images/video-placeholder.png',
        canEmbed: true,
        aspectRatio,
        displayType,
      };
    }

    // ✅ URL EXTERNA GENÉRICA
    return {
      platform: 'external',
      embedUrl: url,
      thumbnailUrl:
        work.videoAulaMetadata?.thumbnail ||
        '/images/external-video-placeholder.png',
      canEmbed: false,
      aspectRatio,
      displayType,
    };
  };

  // ✅ FUNÇÕES AUXILIARES
  const getAspectRatio = (type?: string) => {
    switch (type) {
      case 'reels':
        return '9:16'; // Vertical
      case 'live':
      case 'video':
      default:
        return '16:9'; // Horizontal
    }
  };

  const getDisplayType = (type?: string) => {
    switch (type) {
      case 'reels':
        return 'Reels';
      case 'live':
        return 'Live';
      case 'video':
      default:
        return 'Vídeo';
    }
  };

  const extractYouTubeId = (url: string): string => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  // ✅ FUNÇÃO PARA OBTER ÍCONE DA PLATAFORMA
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <SiYoutube className="w-4 h-4 text-red-400" />;
      case 'instagram':
      case 'instagram-reel':
        return <SiInstagram className="w-4 h-4 text-pink-400" />;
      case 'tiktok':
        return <SiTiktok className="w-4 h-4 text-black dark:text-white" />;
      case 'local':
      case 'direct':
        return <FiVideo className="w-4 h-4 text-blue-400" />;
      default:
        return <FiExternalLink className="w-4 h-4 text-theme-tertiary" />;
    }
  };

  // ✅ FUNÇÃO PARA OBTER LABEL DA PLATAFORMA
  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return 'YouTube';
      case 'instagram':
        return 'Instagram';
      case 'instagram-reel':
        return 'Instagram Reel';
      case 'tiktok':
        return 'TikTok';
      case 'local':
        return 'Vídeo Local';
      case 'direct':
        return 'Vídeo Direto';
      default:
        return 'Externo';
    }
  };

  // ✅ FUNÇÃO PARA FORMATEAR DATA
  const formatDate = (dateString?: Date) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // ✅ FUNÇÃO PARA MOSTRAR PLAYER
  const showPlayer = () => {
    if (videoInfo?.canEmbed) {
      setIsPlayerVisible(true);
    } else {
      // Abrir em nova aba para plataformas que não permitem embed
      const url = work.videoAulaUrl || work.videoAulaFile;
      if (url) {
        window.open(url, '_blank');
      }
    }
  };

  // ✅ FUNÇÃO PARA OBTER CLASSE DO CONTAINER
  const getContainerClass = () => {
    if (!videoInfo) return 'aspect-video';

    switch (videoInfo.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-w-sm max-h-96'; // Vertical (Reels)
      case '1:1':
        return 'aspect-square max-w-sm max-h-80'; // Quadrado (Instagram posts)
      default:
        return 'aspect-video'; // 16:9 padrão
    }
  };

  // ✅ FUNÇÃO PARA ESTILO DO CONTAINER
  const getContainerStyle = () => {
    if (!videoInfo) return {};

    // Para vídeos verticais, centralizar e limitar largura
    if (videoInfo.aspectRatio === '9:16') {
      return {
        maxWidth: '300px',
        margin: '0 auto',
      };
    }

    return {};
  };

  // ✅ DETECTAR PLATAFORMA E GERAR URLs DE EMBED
  useEffect(() => {
    const loadVideoInfo = async () => {
      if (work.videoAulaUrl) {
        const info = await detectVideoInfo(
          work.videoAulaUrl,
          work.videoAulaType,
          work.videoAulaSource
        );
        setVideoInfo(info);
      } else if (work.videoAulaFile) {
        const info = await detectVideoInfo(
          work.videoAulaFile,
          work.videoAulaType,
          'local'
        );
        setVideoInfo(info);
      }
    };

    loadVideoInfo();
  }, [
    work.videoAulaUrl,
    work.videoAulaFile,
    work.videoAulaType,
    work.videoAulaSource,
  ]);

  // ✅ SE NÃO TEM VÍDEO AULA, NÃO RENDERIZAR
  if (!hasVideoAula) {
    return null;
  }

  // ✅ LOADING STATE
  if (!videoInfo || loadingEmbed) {
    return (
      <AnimatedCard hover="lift" className="classical-card">
        <div className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-theme-secondary">
            {loadingEmbed ? 'Carregando embed...' : 'Carregando video aula...'}
          </p>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard hover="lift" className="classical-card overflow-hidden">
      {/* ✅ HEADER */}
      <div className="p-6 border-b border-theme-secondary bg-gradient-to-r from-blue-900/10 to-purple-800/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FaGraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-theme-primary classical-title">
                Video Aula
              </h3>
              <div className="flex items-center space-x-2">
                {getPlatformIcon(videoInfo.platform)}
                <span className="text-blue-400 text-sm">
                  {getPlatformLabel(videoInfo.platform)} •{' '}
                  {videoInfo.displayType}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {canEditMedia && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiEdit3 />}
                onClick={onOpenEditModal}
              >
                Editar
              </Button>
            )}

            {/* Link externo se não puder fazer embed */}
            {!videoInfo.canEmbed &&
              (work.videoAulaUrl || work.videoAulaFile) && (
                <a
                  href={work.videoAulaUrl || work.videoAulaFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors p-2 hover:bg-blue-400/10 rounded-lg"
                  title="Abrir em nova aba"
                >
                  <FiExternalLink className="w-5 h-5" />
                </a>
              )}
          </div>
        </div>
      </div>

      {/* ✅ ÁREA DO VÍDEO */}
      <div className="p-6">
        <div className="relative" style={getContainerStyle()}>
          {!isPlayerVisible || !videoInfo.canEmbed ? (
            // ✅ THUMBNAIL COM BOTÃO PLAY
            <div
              className={`relative group cursor-pointer ${getContainerClass()}`}
              onClick={showPlayer}
            >
              <div className="w-full h-full bg-gradient-to-br from-blue-800/50 to-purple-800/50 relative overflow-hidden rounded-xl">
                {videoInfo.thumbnailUrl ? (
                  <Image
                    width={videoInfo.aspectRatio === '9:16' ? 300 : 800}
                    height={videoInfo.aspectRatio === '9:16' ? 533 : 450}
                    src={videoInfo.thumbnailUrl}
                    alt={work.videoAulaTitle || `Video aula - ${work.title}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback para placeholder se thumbnail falhar
                      e.currentTarget.src = '/images/video-placeholder.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaGraduationCap className="w-16 h-16 text-blue-400" />
                  </div>
                )}

                {/* ✅ OVERLAY COM BOTÃO PLAY */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                  <div className="w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                    {videoInfo.canEmbed ? (
                      <FiPlay className="w-8 h-8 text-white ml-1" />
                    ) : (
                      <FiExternalLink className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>

                {/* ✅ BADGE DA PLATAFORMA */}
                <div className="absolute top-3 right-3">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
                    {getPlatformIcon(videoInfo.platform)}
                    <span className="text-white text-xs font-medium">
                      {videoInfo.displayType}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // ✅ PLAYER EMBEDADO
            <div className={getContainerClass()}>
              {videoInfo.platform === 'youtube' ? (
                <iframe
                  src={`${videoInfo.embedUrl}&autoplay=1`}
                  title={work.videoAulaTitle || `Video aula - ${work.title}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-xl"
                />
              ) : videoInfo.platform === 'tiktok' && videoInfo.embedHtml ? (
                // TikTok oEmbed HTML
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: videoInfo.embedHtml }}
                />
              ) : videoInfo.platform === 'instagram-reel' ||
                videoInfo.platform === 'instagram' ? (
                // Instagram embed (pode falhar, fallback para nova aba)
                <iframe
                  src={videoInfo.embedUrl}
                  title={work.videoAulaTitle || `Video aula - ${work.title}`}
                  frameBorder="0"
                  allowFullScreen
                  className="w-full h-full rounded-xl"
                  onError={() => {
                    // Se embed falhar, abrir em nova aba
                    window.open(work.videoAulaUrl, '_blank');
                  }}
                />
              ) : videoInfo.platform === 'local' ||
                videoInfo.platform === 'direct' ? (
                // Vídeo local/direto
                <video
                  src={videoInfo.embedUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover rounded-xl"
                  poster={videoInfo.thumbnailUrl}
                >
                  Seu navegador não suporta vídeos HTML5.
                </video>
              ) : (
                // Fallback para iframe genérico
                <iframe
                  src={videoInfo.embedUrl}
                  title={work.videoAulaTitle || `Video aula - ${work.title}`}
                  frameBorder="0"
                  allowFullScreen
                  className="w-full h-full rounded-xl"
                />
              )}
            </div>
          )}
        </div>

        {/* ✅ INFORMAÇÕES DO VÍDEO */}
        <div className="mt-4 space-y-3">
          {/* Título e Descrição */}
          <div>
            <h4 className="text-theme-primary font-semibold text-lg">
              {work.videoAulaTitle || `Video Aula: ${work.title}`}
            </h4>
            <p className="text-theme-secondary text-sm mt-1">
              {work.composer.fullName} • {videoInfo.displayType}
            </p>
          </div>

          {/* ✅ METADADOS */}
          <div className="flex items-center justify-between text-sm text-theme-tertiary flex-wrap gap-2">
            <div className="flex items-center space-x-4">
              {/* Data de adição */}
              {work.videoAulaAddedAt && (
                <div className="flex items-center space-x-1">
                  <FiUser className="w-4 h-4" />
                  <span>{formatDate(work.videoAulaAddedAt)}</span>
                </div>
              )}

              {/* Duração se disponível */}
              {work.videoAulaMetadata?.duration && (
                <div className="flex items-center space-x-1">
                  <FiClock className="w-4 h-4" />
                  <span>{work.videoAulaMetadata.duration}</span>
                </div>
              )}
            </div>

            {/* ✅ DOWNLOAD (para vídeos locais) */}
            {videoInfo.platform === 'local' && work.videoAulaFile && (
              <a
                href={work.videoAulaFile}
                download
                className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors hover:bg-blue-400/10 px-2 py-1 rounded"
                title="Download do vídeo"
              >
                <FiDownload className="w-4 h-4" />
                <span>Download</span>
              </a>
            )}
          </div>

          {/* ✅ BOTÃO DE AÇÃO */}
          {!isPlayerVisible && (
            <Button
              onClick={showPlayer}
              variant="primary"
              size="md"
              leftIcon={videoInfo.canEmbed ? <FiPlay /> : <FiExternalLink />}
              className="w-full"
            >
              {videoInfo.canEmbed
                ? 'Assistir Video Aula'
                : `Abrir no ${getPlatformLabel(videoInfo.platform)}`}
            </Button>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
};

export default VideoAulaSection;
