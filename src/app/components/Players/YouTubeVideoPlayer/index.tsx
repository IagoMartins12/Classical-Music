'use client';

import { useTranslation } from '@/app/context/TranslationContext';
import Image from '@/app/components/SmartImage';
import React, { useState } from 'react';
import {
  PiArrowSquareOut,
  PiCalendarBlank,
  PiPlay,
  PiUser,
  PiYoutubeLogo,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';

interface YouTubePlayerProps {
  video: {
    videoId: string;
    videoUrl: string;
    thumbnail: string | null;
    title: string;
    channel: string;
    publishedAt: string;
  };
  workTitle: string;
  composer: string;
}

const YouTubeVideoPlayer: React.FC<YouTubePlayerProps> = ({
  video,
  workTitle,
  composer,
}) => {
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const { t } = useTranslation({ sections: ['pages/workId'] });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const showPlayer = () => {
    setIsPlayerVisible(true);
  };

  return (
    <div className="bg-erro/20 rounded-xl border border-erro/30 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-erro/30">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-erro rounded-lg flex items-center justify-center">
            <PiYoutubeLogo className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm">{workTitle}</h3>
            <p className="text-texto-fraco text-xs">{composer}</p>
          </div>
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t('youtube_abrir_no_youtube')}: ${workTitle}`}
            className="text-erro hover:text-erro transition-colors"
          >
            <PiArrowSquareOut className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Video Area */}
      <div className="relative">
        {!isPlayerVisible ? (
          // Thumbnail com botão play
          <div className="relative group cursor-pointer" onClick={showPlayer}>
            <div className="aspect-video bg-gray-800 relative overflow-hidden">
              {video.thumbnail ? (
                <Image
                  width={100}
                  height={100}
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PiYoutubeLogo className="w-16 h-16 text-erro" />
                </div>
              )}

              {/* Overlay com botão play */}
              <div className="absolute inset-0 bg-black flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                <div className="w-16 h-16 bg-erro hover:bg-erro rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <PiPlay className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // YouTube embed
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}
      </div>

      {/* Video Info */}
      <Stack gap={3} className="p-4">
        <div>
          <h4 className="text-white text-sm font-medium line-clamp-2">
            {video.title}
          </h4>
        </div>

        <div className="flex items-center justify-between text-xs text-texto-fraco">
          <Inline gap={1}>
            <PiUser className="w-3 h-3" />
            <span className="truncate">{video.channel}</span>
          </Inline>

          <Inline gap={1}>
            <PiCalendarBlank className="w-3 h-3" />
            <span>{formatDate(video.publishedAt)}</span>
          </Inline>
        </div>

        {!isPlayerVisible && (
          <Inline
            as="button"
            gap={2}
            onClick={showPlayer}
            className="w-full bg-erro hover:bg-erro text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors justify-center"
          >
            <PiPlay className="w-4 h-4" />
            <span>{t('youtube_button_span')}</span>
          </Inline>
        )}
      </Stack>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default YouTubeVideoPlayer;
