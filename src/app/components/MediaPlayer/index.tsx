// app/components/MediaPlayer/MediaPlayer.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiExternalLink,
  FiMusic,
  FiRefreshCw,
  FiAlertCircle,
  FiLoader,
  FiMaximize2,
} from 'react-icons/fi';
import { SiSpotify, SiYoutube } from 'react-icons/si';
import { UseMediaSearchResult } from '@/app/hooks/useMediaSearch';

interface MediaPlayerProps {
  workTitle: string;
  composerName: string;
  mediaSearch: UseMediaSearchResult;
  className?: string;
}

export default function MediaPlayer({
  workTitle,
  composerName,
  mediaSearch,
  className = '',
}: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [activeTab, setActiveTab] = useState<'spotify' | 'youtube'>('spotify');
  const [youtubeExpanded, setYoutubeExpanded] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    hasMedia,
    hasSpotify,
    hasYoutube,
    canPlayPreview,
    mediaData,
    isSearching,
    error,
    searchProgress,
    searchMedia,
    clearError,
  } = mediaSearch;

  // Auto-selecionar tab baseado na disponibilidade
  useEffect(() => {
    if (hasSpotify && !hasYoutube) {
      setActiveTab('spotify');
    } else if (hasYoutube && !hasSpotify) {
      setActiveTab('youtube');
    } else if (hasSpotify) {
      setActiveTab('spotify'); // Preferir Spotify se ambos disponíveis
    }
  }, [hasSpotify, hasYoutube]);

  // Controle de áudio melhorado
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [mediaData?.spotify?.previewUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (timeInSeconds: number): string => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Estados de loading, erro, etc.
  if (!hasMedia && !isSearching && !error) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FiMusic className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Áudio e Vídeo
          </h3>
        </div>

        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMusic className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Buscar áudio e vídeo para esta obra
          </p>
          <button
            onClick={() => searchMedia()}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Buscar Mídia</span>
          </button>
        </div>
      </div>
    );
  }

  if (isSearching) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FiLoader className="w-4 h-4 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Buscando Mídia
          </h3>
        </div>

        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLoader className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Procurando no Spotify e YouTube...
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${searchProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {searchProgress}% concluído
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center">
            <FiAlertCircle className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Erro na Busca
          </h3>
        </div>

        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Não foi possível buscar mídia
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {error}
          </p>
          <div className="flex space-x-2 justify-center">
            <button
              onClick={clearError}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Fechar
            </button>
            <button
              onClick={() => searchMedia(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Tentar Novamente</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasMedia) return null;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FiMusic className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Reprodução
          </h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-6">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {hasSpotify && (
            <button
              onClick={() => setActiveTab('spotify')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'spotify'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <SiSpotify className="w-4 h-4 text-green-500" />
              <span>Spotify</span>
            </button>
          )}
          {hasYoutube && (
            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'youtube'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <SiYoutube className="w-4 h-4 text-red-500" />
              <span>YouTube</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Spotify Player */}
        {activeTab === 'spotify' && hasSpotify && (
          <div className="space-y-6">
            {/* Track Info */}
            <div className="flex items-start space-x-4">
              {mediaData?.spotify?.albumArt && (
                <img
                  src={mediaData.spotify.albumArt}
                  alt="Capa do álbum"
                  className="w-20 h-20 rounded-lg object-cover shadow-md flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2 leading-tight">
                  {workTitle}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                  🎭 {mediaData?.spotify?.artists?.join(', ') || composerName}
                </p>
                {mediaData?.spotify?.albumName && (
                  <p className="text-gray-500 dark:text-gray-500 text-sm mb-2">
                    💿 {mediaData.spotify.albumName}
                  </p>
                )}
                <div className="flex items-center space-x-4 text-xs text-gray-400 dark:text-gray-500">
                  {mediaData?.spotify?.duration && (
                    <span>⏱️ {formatDuration(mediaData.spotify.duration)}</span>
                  )}
                  {mediaData?.spotify?.popularity && (
                    <span>📊 {mediaData.spotify.popularity}% popular</span>
                  )}
                </div>
              </div>
            </div>

            {/* Audio Preview Player */}
            {canPlayPreview ? (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Preview 30s
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Spotify
                  </span>
                </div>

                <audio
                  ref={audioRef}
                  src={mediaData?.spotify?.previewUrl || ''}
                  muted={isMuted}
                  preload="metadata"
                />

                {/* Controls */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg"
                  >
                    {isPlaying ? (
                      <FiPause className="w-6 h-6" />
                    ) : (
                      <FiPlay className="w-6 h-6 ml-1" />
                    )}
                  </button>

                  <div className="flex-1 space-y-2">
                    {/* Progress Bar */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={duration ? (currentTime / duration) * 100 : 0}
                      onChange={handleSeek}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />

                    {/* Time Display */}
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-mono">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Volume Control */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={toggleMute}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {isMuted ? (
                      <FiVolumeX className="w-4 h-4" />
                    ) : (
                      <FiVolume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  ℹ️ Preview não disponível para esta faixa
                </p>
              </div>
            )}

            {/* Spotify Link */}
            <a
              href={mediaData?.spotify?.trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors group"
            >
              <SiSpotify className="w-5 h-5" />
              <span className="font-medium">Ouvir Completo no Spotify</span>
              <FiExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        )}

        {/* YouTube Player */}
        {activeTab === 'youtube' && hasYoutube && (
          <div className="space-y-4">
            {/* Video Info */}
            <div className="flex items-start space-x-4">
              {mediaData?.youtube?.thumbnail && (
                <img
                  src={mediaData.youtube.thumbnail}
                  alt="Thumbnail do vídeo"
                  className="w-20 h-14 rounded-lg object-cover shadow-md flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                  {mediaData?.youtube?.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs mb-1 truncate">
                  📺 {mediaData?.youtube?.channel}
                </p>
                {mediaData?.youtube?.publishedAt && (
                  <p className="text-gray-500 dark:text-gray-500 text-xs">
                    📅{' '}
                    {new Date(mediaData.youtube.publishedAt).toLocaleDateString(
                      'pt-BR'
                    )}
                  </p>
                )}
              </div>
              <button
                onClick={() => setYoutubeExpanded(!youtubeExpanded)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FiMaximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* YouTube Embed */}
            <div
              className={`relative bg-black rounded-lg overflow-hidden transition-all duration-300 ${
                youtubeExpanded ? 'aspect-video' : 'aspect-[16/10]'
              }`}
            >
              <iframe
                src={`https://www.youtube.com/embed/${mediaData?.youtube?.videoId}?enablejsapi=1&rel=0&modestbranding=1`}
                title={mediaData?.youtube?.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>

            {/* YouTube Link */}
            <a
              href={mediaData?.youtube?.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-red-500 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group"
            >
              <SiYoutube className="w-4 h-4" />
              <span>Abrir no YouTube</span>
              <FiExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <button
          onClick={() => searchMedia(true)}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center space-x-1 mx-auto"
        >
          <FiRefreshCw className="w-3 h-3" />
          <span>Atualizar mídia</span>
        </button>
      </div>
    </div>
  );
}
