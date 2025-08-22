'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { FiPlay, FiExternalLink, FiCalendar, FiUser } from 'react-icons/fi';
import { SiYoutube } from 'react-icons/si';
import { useTranslation } from '@/app/hooks/useTranslation';

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
    <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-xl border border-red-700/30 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-red-700/30">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <SiYoutube className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm">{workTitle}</h3>
            <p className="text-gray-400 text-xs">{composer}</p>
          </div>
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <FiExternalLink className="w-4 h-4" />
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
                  <SiYoutube className="w-16 h-16 text-red-600" />
                </div>
              )}

              {/* Overlay com botão play */}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                <div className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <FiPlay className="w-8 h-8 text-white ml-1" />
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
      <div className="p-4 space-y-3">
        <div>
          <h4 className="text-white text-sm font-medium line-clamp-2">
            {video.title}
          </h4>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <FiUser className="w-3 h-3" />
            <span className="truncate">{video.channel}</span>
          </div>

          <div className="flex items-center space-x-1">
            <FiCalendar className="w-3 h-3" />
            <span>{formatDate(video.publishedAt)}</span>
          </div>
        </div>

        {!isPlayerVisible && (
          <button
            onClick={showPlayer}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <FiPlay className="w-4 h-4" />
            <span>{t('youtube_button_span')}</span>
          </button>
        )}
      </div>

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
