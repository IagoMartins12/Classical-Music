// app/components/VideoAula/VideoAulaSection.tsx
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
import { WorkDetails } from '@/app/requests/work-page-details';

interface VideoAulaSectionProps {
  work: {
    id: string;
    title: string;
    composer: {
      fullName: string;
    };
    videoAulaUrl?: string;
    videoAulaFile?: string;
    videoAulaTitle?: string;
    videoAulaType?: string;
    videoAulaSource?: string;
    videoAulaAddedBy?: string;
    videoAulaAddedAt?: Date;
    videoAulaMetadata?: any;
  };
  canEditMedia?: boolean;
  onOpenEditModal?: () => void;
}

const VideoAulaSection: React.FC<VideoAulaSectionProps> = ({
  work,
  canEditMedia = false,
  onOpenEditModal,
}) => {
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [videoInfo, setVideoInfo] = useState<{
    platform: string;
    embedUrl: string;
    thumbnailUrl: string;
    canEmbed: boolean;
    aspectRatio: string;
    displayType: string;
  } | null>(null);

  // Só renderizar se tiver conteúdo
  const hasVideoAula = !!(work.videoAulaUrl || work.videoAulaFile);

  const detectVideoInfo = (url: string, type?: string) => {
    const videoType = type || 'video';
    const aspectRatio = getAspectRatio(videoType);
    const displayType = getDisplayType(videoType);

    // YouTube
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

    // Instagram
    if (url.includes('instagram.com')) {
      // Instagram Stories, Reels, Posts têm tratamentos diferentes
      if (url.includes('/stories/') || type === 'story') {
        return {
          platform: 'instagram-story',
          embedUrl: url,
          thumbnailUrl: work.videoAulaMetadata?.thumbnail || '',
          canEmbed: false, // Stories não podem ser embedados facilmente
          aspectRatio: '9:16',
          displayType: 'story',
        };
      } else if (url.includes('/reel/') || type === 'reels') {
        return {
          platform: 'instagram-reel',
          embedUrl: url.replace('/reel/', '/p/'), // Converter para post embed
          thumbnailUrl: work.videoAulaMetadata?.thumbnail || '',
          canEmbed: true,
          aspectRatio: '9:16',
          displayType: 'reel',
        };
      } else {
        return {
          platform: 'instagram',
          embedUrl: url,
          thumbnailUrl: work.videoAulaMetadata?.thumbnail || '',
          canEmbed: true,
          aspectRatio: '1:1',
          displayType: 'post',
        };
      }
    }

    // TikTok
    if (url.includes('tiktok.com')) {
      return {
        platform: 'tiktok',
        embedUrl: url,
        thumbnailUrl: work.videoAulaMetadata?.thumbnail || '',
        canEmbed: true,
        aspectRatio: '9:16',
        displayType: 'vertical',
      };
    }

    // Vídeo direto (mp4, etc.)
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return {
        platform: 'direct',
        embedUrl: url,
        thumbnailUrl: work.videoAulaMetadata?.thumbnail || '',
        canEmbed: true,
        aspectRatio,
        displayType,
      };
    }

    // URL genérica
    return {
      platform: 'external',
      embedUrl: url,
      thumbnailUrl: work.videoAulaMetadata?.thumbnail || '',
      canEmbed: false,
      aspectRatio,
      displayType,
    };
  };

  const getAspectRatio = (type?: string) => {
    switch (type) {
      case 'story':
      case 'reels':
        return '9:16';
      case 'live':
        return '16:9';
      default:
        return '16:9';
    }
  };

  const getDisplayType = (type?: string) => {
    switch (type) {
      case 'story':
        return 'Story';
      case 'reels':
        return 'Reels';
      case 'live':
        return 'Live';
      case 'tutorial':
        return 'Tutorial';
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

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <SiYoutube className="w-4 h-4 text-red-400" />;
      case 'instagram':
      case 'instagram-story':
      case 'instagram-reel':
        return <SiInstagram className="w-4 h-4 text-pink-400" />;
      case 'tiktok':
        return <SiTiktok className="w-4 h-4 text-black" />;
      case 'local':
        return <FiVideo className="w-4 h-4 text-blue-400" />;
      default:
        return <FiExternalLink className="w-4 h-4 text-theme-tertiary" />;
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return 'YouTube';
      case 'instagram':
        return 'Instagram';
      case 'instagram-story':
        return 'Instagram Story';
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const showPlayer = () => {
    if (videoInfo?.canEmbed) {
      setIsPlayerVisible(true);
    } else {
      // Abrir em nova aba para plataformas que não permitem embed
      window.open(work.videoAulaUrl, '_blank');
    }
  };

  const getContainerClass = () => {
    if (!videoInfo) return 'aspect-video';

    switch (videoInfo.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-96'; // Vertical (Stories, Reels)
      case '1:1':
        return 'aspect-square max-h-80'; // Quadrado (Instagram posts)
      default:
        return 'aspect-video'; // 16:9 padrão
    }
  };

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

  // Detectar plataforma e gerar URLs de embed
  useEffect(() => {
    if (work.videoAulaUrl) {
      const info = detectVideoInfo(work.videoAulaUrl, work.videoAulaType);
      setVideoInfo(info);
    } else if (work.videoAulaFile) {
      setVideoInfo({
        platform: 'local',
        embedUrl: work.videoAulaFile,
        thumbnailUrl: work.videoAulaMetadata?.thumbnail || '',
        canEmbed: true,
        aspectRatio: work.videoAulaMetadata?.aspectRatio || '16:9',
        displayType: getDisplayType(work.videoAulaType),
      });
    }
  }, [work]);

  // Se não tem vídeo aula, não renderizar nada
  if (!hasVideoAula) {
    return null;
  }
  if (!videoInfo) {
    return (
      <AnimatedCard hover="lift" className="classical-card">
        <div className="p-6 text-center">
          <p className="text-theme-secondary">Carregando video aula...</p>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard hover="lift" className="classical-card overflow-hidden">
      {/* Header */}
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
          {!videoInfo.canEmbed && work.videoAulaUrl && (
            <a
              href={work.videoAulaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
              title="Abrir em nova aba"
            >
              <FiExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>

      {/* Área do Vídeo */}
      <div className="p-6">
        <div className="relative" style={getContainerStyle()}>
          {!isPlayerVisible || !videoInfo.canEmbed ? (
            // Thumbnail com botão play
            <div
              className={`relative group cursor-pointer ${getContainerClass()}`}
              onClick={showPlayer}
            >
              <div className="w-full h-full bg-gradient-to-br from-blue-800/50 to-purple-800/50 relative overflow-hidden rounded-xl">
                {videoInfo.thumbnailUrl ? (
                  <Image
                    width={50}
                    height={50}
                    src={videoInfo.thumbnailUrl}
                    alt={work.videoAulaTitle || `Video aula - ${work.title}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaGraduationCap className="w-16 h-16 text-blue-400" />
                  </div>
                )}

                {/* Overlay com botão play */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                  <div className="w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                    {videoInfo.canEmbed ? (
                      <FiPlay className="w-8 h-8 text-white ml-1" />
                    ) : (
                      <FiExternalLink className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>

                {/* Badge da plataforma */}
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
            // Player embedado
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
              ) : videoInfo.platform === 'local' ||
                videoInfo.platform === 'direct' ? (
                <video
                  src={videoInfo.embedUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover rounded-xl"
                  poster={videoInfo.thumbnailUrl}
                >
                  Seu navegador não suporta vídeos HTML5.
                </video>
              ) : videoInfo.platform === 'instagram-reel' ? (
                <blockquote
                  className="instagram-media"
                  data-instgrm-permalink={videoInfo.embedUrl}
                  data-instgrm-version="14"
                  style={{
                    background: '#FFF',
                    border: 0,
                    borderRadius: '12px',
                    margin: '1px',
                    maxWidth: '540px',
                    minWidth: '326px',
                    padding: 0,
                    width: '100%',
                  }}
                />
              ) : (
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

        {/* Informações do Vídeo */}
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

          {/* Metadados */}
          <div className="flex items-center justify-between text-sm text-theme-tertiary">
            <div className="flex items-center space-x-4">
              {/* Data de adição */}
              {work.videoAulaAddedAt && (
                <div className="flex items-center space-x-1">
                  <FiUser className="w-4 h-4" />
                  <span>{formatDate(work.videoAulaAddedAt.toISOString())}</span>
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

            {/* Download (para vídeos locais) */}
            {videoInfo.platform === 'local' && work.videoAulaFile && (
              <a
                href={work.videoAulaFile}
                download
                className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                title="Download do vídeo"
              >
                <FiDownload className="w-4 h-4" />
                <span>Download</span>
              </a>
            )}
          </div>

          {/* Botão de ação */}
          {!isPlayerVisible && (
            <Button
              onClick={showPlayer}
              variant="primary"
              size="md"
              leftIcon={videoInfo.canEmbed ? <FiPlay /> : <FiExternalLink />}
              className="w-full"
            >
              {videoInfo.canEmbed ? 'Assistir Video Aula' : 'Abrir Video Aula'}
            </Button>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
};

export default VideoAulaSection;
