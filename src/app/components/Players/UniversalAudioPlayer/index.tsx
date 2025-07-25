// app/components/Players/UniversalAudioPlayer.tsx - ATUALIZADO
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiRefreshCw,
  FiAlertTriangle,
  FiMusic,
  FiUpload,
} from 'react-icons/fi';
import { SiYoutube } from 'react-icons/si';

interface AudioSource {
  type: 'youtube-audio' | 'custom-audio' | 'alternative';
  url: string;
  duration?: number;
  quality?: string;
  label: string;
  requiresAuth?: boolean;
}

interface UniversalAudioPlayerProps {
  work: {
    id: string;
    title: string;
    composer: { fullName: string };
  };

  customAudio?: {
    url: string;
    file: string;
    title?: string;
  } | null;
}

const UniversalAudioPlayer: React.FC<UniversalAudioPlayerProps> = ({
  work,
  customAudio,
}) => {
  // Estados do player
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados das fontes de áudio
  const [audioSources, setAudioSources] = useState<AudioSource[]>([]);
  const [currentSource, setCurrentSource] = useState<AudioSource | null>(null);
  const [isSearchingAlternatives, setIsSearchingAlternatives] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);

  // Inicializar fontes de áudio disponíveis
  useEffect(() => {
    const sources: AudioSource[] = [];

    // 1. Áudio Customizado (prioridade máxima)
    if (customAudio?.url || customAudio?.file) {
      sources.push({
        type: 'custom-audio',
        url: customAudio.url || customAudio.file,
        duration: 0, // Será detectado pelo player
        quality: 'original',
        label: customAudio.title || 'Áudio Personalizado',
      });
    }

    setAudioSources(sources);

    // Definir fonte padrão (priorizar áudio customizado)
    if (sources.length > 0 && !currentSource) {
      setCurrentSource(sources[0]);
    }
  }, [customAudio, currentSource]);

  // Buscar fontes alternativas de áudio
  const searchAlternativeAudioSources = useCallback(async () => {
    if (isSearchingAlternatives) return;

    setIsSearchingAlternatives(true);

    try {
      // 2. Buscar em fontes gratuitas (Internet Archive, etc.)
      const alternativeSources = await searchFreeAudioSources();
      if (alternativeSources.length > 0) {
        setAudioSources((prev) => [
          ...prev,
          ...alternativeSources.map((source) => ({
            type: 'alternative' as const,
            url: source.audioUrl,
            duration: source.duration,
            quality: 'varies',
            label: `${source.source} (Grátis)`,
          })),
        ]);
      }
    } catch (error) {
      console.error('Erro ao buscar fontes alternativas:', error);
    } finally {
      setIsSearchingAlternatives(false);
    }
  }, [isSearchingAlternatives]);

  // Buscar fontes gratuitas
  const searchFreeAudioSources = async () => {
    try {
      const response = await fetch('/api/alternative-audio-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: work.title,
          composer: work.composer.fullName,
        }),
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.sources || [];
    } catch (error) {
      console.error('Erro ao buscar fontes alternativas:', error);
      return [];
    }
  };

  // Configurar player de áudio
  useEffect(() => {
    if (
      currentSource?.type === 'custom-audio' ||
      currentSource?.type === 'youtube-audio' ||
      currentSource?.type === 'alternative'
    ) {
      const audio = new Audio(currentSource.url);
      audio.volume = isMuted ? 0 : volume;
      audio.crossOrigin = 'anonymous';
      audioRef.current = audio;

      const handleTimeUpdate = () => setCurrentTime(audio.currentTime * 1000);
      const handleLoadedMetadata = () => setDuration(audio.duration * 1000);
      const handleEnded = () => setIsPlaying(false);
      const handleError = () => {
        console.error('Erro ao carregar áudio:', currentSource.url);
        tryNextAudioSource();
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.pause();
      };
    }
  }, [currentSource, volume, isMuted]);

  // Tentar próxima fonte de áudio em caso de erro
  const tryNextAudioSource = useCallback(() => {
    const currentIndex = audioSources.findIndex(
      (source) => source === currentSource
    );
    const nextSource = audioSources[currentIndex + 1];

    if (nextSource) {
      setCurrentSource(nextSource);
    } else {
      // Buscar fontes alternativas se nenhuma funcionou
      searchAlternativeAudioSources();
    }
  }, [audioSources, currentSource, searchAlternativeAudioSources]);

  // Controles do player
  const togglePlay = async () => {
    if (!currentSource) return;

    try {
      setIsLoading(true);

      // Usar HTML5 Audio para todos os outros tipos
      if (!audioRef.current) return;

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }

      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Erro ao controlar reprodução:', error);
      tryNextAudioSource();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume;
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSourceIcon = (source: AudioSource) => {
    switch (source.type) {
      case 'youtube-audio':
        return <SiYoutube className="w-4 h-4 text-red-400" />;
      case 'custom-audio':
        return <FiUpload className="w-4 h-4 text-blue-400" />;
      default:
        return <FiMusic className="w-4 h-4 text-purple-400" />;
    }
  };

  const getAudioCover = () => {
    if (customAudio) {
      // Para áudio customizado, usar uma imagem padrão ou do compositor
      return (
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <FiMusic className="w-8 h-8 text-white" />
        </div>
      );
    }

    // Fallback padrão
    return (
      <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg flex items-center justify-center">
        <FiMusic className="w-8 h-8 text-gray-400" />
      </div>
    );
  };

  if (audioSources.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="text-center">
          <FiAlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">
            Nenhuma fonte de áudio disponível
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Não foi possível encontrar áudio para esta obra.
          </p>
          <button
            onClick={searchAlternativeAudioSources}
            disabled={isSearchingAlternatives}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors disabled:opacity-50"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${
                isSearchingAlternatives ? 'animate-spin' : ''
              }`}
            />
            <span>
              {isSearchingAlternatives
                ? 'Buscando...'
                : 'Buscar Fontes de Áudio'}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start space-x-4">
          <div className="relative">
            {getAudioCover()}
            {isPlaying && (
              <div className="absolute inset-0 rounded-lg border-2 border-green-400 animate-pulse" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate text-lg">
              {work.title}
            </h3>
            <p className="text-gray-400 text-sm">{work.composer.fullName}</p>

            {/* Fonte atual */}
            {currentSource && (
              <div className="flex items-center space-x-2 mt-2">
                {getSourceIcon(currentSource)}
                <span className="text-xs text-gray-300">
                  {currentSource.label}
                </span>
                {currentSource.quality && (
                  <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                    {currentSource.quality}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={searchAlternativeAudioSources}
              disabled={isSearchingAlternatives}
              className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Buscar mais fontes"
            >
              <FiRefreshCw
                className={`w-4 h-4 ${
                  isSearchingAlternatives ? 'animate-spin' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Seletor de fontes */}
      {audioSources.length > 1 && (
        <div className="px-6 pb-4">
          <div className="flex space-x-2 overflow-x-auto">
            {audioSources.map((source, index) => (
              <button
                key={index}
                onClick={() => setCurrentSource(source)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  currentSource === source
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {getSourceIcon(source)}
                <span>{source.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Waveform/Progress */}
      <div className="px-6 pb-4">
        <div
          ref={waveformRef}
          className="h-16 bg-gray-800/50 rounded-lg relative overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 flex items-center px-2">
            <div className="w-full h-2 bg-gray-600 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-100"
                style={{
                  width:
                    duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="px-6 pb-6">
        <div className="flex items-center space-x-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <FiPause className="w-7 h-7" />
            ) : (
              <FiPlay className="w-7 h-7 ml-1" />
            )}
          </button>

          {/* Time info */}
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>
                {formatTime(duration || currentSource?.duration || 0)}
              </span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-2 text-gray-400 hover:text-white transition-colors"
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
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default UniversalAudioPlayer;
