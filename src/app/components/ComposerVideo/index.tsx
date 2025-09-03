// app/components/ComposerVideo/ComposerVideo.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiPlay, FiAlertCircle } from 'react-icons/fi';
import { AnimatedCard, AnimatedItem } from '../animation/AnimatedComponents';
import { useTranslation } from '@/app/context/TranslationContext';

// Tipos para o vídeo
export type VideoType = 'youtube' | 'vimeo' | 'direct' | 'invalid';

export interface VideoInfo {
  type: VideoType;
  embedUrl?: string;
  originalUrl: string;
  videoId?: string;
}

interface ComposerVideoProps {
  videoUrl: string;
  composerName: string;
}

// Função para detectar e processar a URL do vídeo
const processVideoUrl = (url: string): VideoInfo => {
  if (!url || typeof url !== 'string') {
    return { type: 'invalid', originalUrl: url };
  }

  const cleanUrl = url.trim();

  // YouTube detection
  const youtubeRegex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const youtubeMatch = cleanUrl.match(youtubeRegex);

  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      originalUrl: cleanUrl,
      videoId,
    };
  }

  // Vimeo detection
  const vimeoRegex =
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/i;
  const vimeoMatch = cleanUrl.match(vimeoRegex);

  if (vimeoMatch) {
    const videoId = vimeoMatch[3];
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      originalUrl: cleanUrl,
      videoId,
    };
  }

  // Direct video URL detection (common video formats)
  const videoExtensions = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)(\?.*)?$/i;
  if (videoExtensions.test(cleanUrl)) {
    return {
      type: 'direct',
      originalUrl: cleanUrl,
    };
  }

  // Check if it's a valid URL format but not recognized video type
  try {
    new URL(cleanUrl);
    return { type: 'invalid', originalUrl: cleanUrl };
  } catch {
    return { type: 'invalid', originalUrl: cleanUrl };
  }
};

const ComposerVideo: React.FC<ComposerVideoProps> = ({
  videoUrl,
  composerName,
}) => {
  const { t } = useTranslation({ sections: ['pages/composerId'] });
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!videoUrl) {
      setIsLoading(false);
      return;
    }

    const processVideo = async () => {
      try {
        const info = processVideoUrl(videoUrl);

        if (info.type === 'invalid') {
          setHasError(true);
          setIsLoading(false);
          return;
        }

        setVideoInfo(info);
        setIsLoading(false);
      } catch (error) {
        console.error('Error processing video URL:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    processVideo();
  }, [videoUrl]);

  const handleVideoError = () => {
    setHasError(true);
  };

  const handleVideoLoad = () => {
    setHasError(false);
  };

  // Não renderizar se não há URL, está carregando, tem erro ou videoInfo inválido
  if (
    !videoUrl ||
    isLoading ||
    hasError ||
    !videoInfo ||
    videoInfo.type === 'invalid'
  ) {
    return null;
  }

  const renderVideoPlayer = () => {
    switch (videoInfo.type) {
      case 'youtube':
      case 'vimeo':
        return (
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-theme-glow">
            <iframe
              src={videoInfo.embedUrl}
              title={`${t('video_about')} ${composerName}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
              onError={handleVideoError}
              onLoad={handleVideoLoad}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        );

      case 'direct':
        return (
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-theme-glow">
            <video
              src={videoInfo.originalUrl}
              controls
              className="w-full h-full object-contain"
              onError={handleVideoError}
              onLoadedData={handleVideoLoad}
              preload="metadata"
            >
              <source src={videoInfo.originalUrl} />
              {t('video_not_supported')}
            </video>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatedCard hover="lift" className="classical-card p-8">
      <AnimatedItem direction="left" springType="smooth">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-purple rounded-2xl flex items-center justify-center">
            <FiPlay className="w-6 h-6 text-theme-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-theme-primary classical-title">
              {t('video_title')}
            </h2>
            <p className="text-theme-secondary classical-subtitle">
              {t('video_subtitle')} {composerName}
            </p>
          </div>
        </div>
      </AnimatedItem>

      <AnimatedItem direction="up" springType="gentle">
        <div className="space-y-4">
          {renderVideoPlayer()}

          {/* Video info/description */}
          <div className="flex items-start justify-between text-sm text-theme-secondary">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
              <span>
                {videoInfo.type === 'youtube' && 'YouTube'}
                {videoInfo.type === 'vimeo' && 'Vimeo'}
                {videoInfo.type === 'direct' && t('video_direct')}
              </span>
            </div>
            <a
              href={videoInfo.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:text-brand-secondary transition-colors duration-200 font-medium"
            >
              {t('video_watch_original')}
            </a>
          </div>
        </div>
      </AnimatedItem>

      {hasError && (
        <AnimatedItem direction="up" springType="gentle">
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">
                  {t('video_error_title')}
                </p>
                <p className="text-red-600 text-sm mt-1">
                  {t('video_error_message')}
                </p>
              </div>
            </div>
          </div>
        </AnimatedItem>
      )}
    </AnimatedCard>
  );
};

export default ComposerVideo;
