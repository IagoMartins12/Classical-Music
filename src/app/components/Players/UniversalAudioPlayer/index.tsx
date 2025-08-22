// app/components/Players/UniversalAudioPlayer/index.tsx - COM IMPORT DO WAVEFORM E TRADUÇÕES
'use client';

import React, { useState, useEffect, useRef, useCallback, JSX } from 'react';
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiAlertTriangle,
  FiMusic,
  FiUpload,
  FiDatabase,
} from 'react-icons/fi';
import { SiYoutube } from 'react-icons/si';
import { useTranslation } from '@/app/hooks/useTranslation';

// Importar componente Waveform e tipos
import Waveform from '../../Waveform';
export interface AudioSource {
  type:
    | 'youtube-audio'
    | 'custom-audio'
    | 'alternative-saved'
    | 'alternative-fresh';
  url: string;
  duration?: number;
  quality?: string;
  label: string;
  requiresAuth?: boolean;
  isPersistent?: boolean;
  metadata?: Record<string, any>;
}

export interface AlternativeAudioSource {
  audioUrl: string;
  duration?: number;
  quality?: string;
  source: string;
  [key: string]: any;
}

export interface Work {
  id: string;
  title: string;
  composer: {
    fullName: string;
    [key: string]: any;
  };
  customAudioUrl?: string | null;
  customAudioFile?: string | null;
  customAudioSource?: string | null;
  customAudioMetadata?: any;
}

export interface CustomAudio {
  url: string;
  file: string;
  title?: string;
  isPersistent?: boolean;
}

export interface UniversalAudioPlayerProps {
  work: Work;
  isSearching: boolean;
  searchError: string | null;
  customAudio?: CustomAudio | null;
  alternativeAudioSources?: AlternativeAudioSource[];
}

export interface WaveformProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek?: (time: number) => void;
  height?: number;
  width?: number;
  className?: string;
}

// Tipos para eventos de áudio
export interface AudioEventHandlers {
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  onEnded: () => void;
  onError: (error: Event) => void;
}

// Estados do player
export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
}

// Configurações do waveform
export interface WaveformConfig {
  barCount: number;
  maxHeight: number;
  colors: {
    played: string[];
    unplayed: string;
    progress: string;
    glow: string;
  };
}

// Para análise de áudio
export interface AudioAnalysisData {
  waveformData: number[];
  isAnalyzing: boolean;
  audioContext: AudioContext | null;
}

const UniversalAudioPlayer: React.FC<UniversalAudioPlayerProps> = ({
  work,
  customAudio,
  isSearching,
  searchError,
  alternativeAudioSources = [],
}) => {
  const { t } = useTranslation({ sections: ['pages/workId'] });

  // Estados do player
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.7);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Estados das fontes de áudio
  const [audioSources, setAudioSources] = useState<AudioSource[]>([]);
  const [currentSource, setCurrentSource] = useState<AudioSource | null>(null);
  const [sourcesInitialized, setSourcesInitialized] = useState<boolean>(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Função para inicializar fontes de áudio
  const initializeAudioSources = useCallback(() => {
    const sources: AudioSource[] = [];

    // PRIORIDADE 1: Áudio Customizado (UPLOAD)
    if (customAudio?.url || customAudio?.file) {
      sources.push({
        type: 'custom-audio',
        url: customAudio.url || customAudio.file,
        duration: 0,
        quality: 'original',
        label: customAudio.title || t('universal_audio_player_personalizado'),
        isPersistent: customAudio.isPersistent ?? true,
      });
    }

    // PRIORIDADE 2: Fonte Alternativa SALVA no banco
    if (
      work.customAudioUrl &&
      work.customAudioSource &&
      work.customAudioSource !== 'upload'
    ) {
      sources.push({
        type: 'alternative-saved',
        url: work.customAudioUrl,
        duration: work.customAudioMetadata?.duration || 0,
        quality: work.customAudioMetadata?.quality || 'varies',
        label: `${work.customAudioSource} ${t('universal_audio_player_salvo')}`,
        isPersistent: true,
        metadata: work.customAudioMetadata,
      });
    }

    // PRIORIDADE 3: Fontes alternativas TEMPORÁRIAS
    if (alternativeAudioSources.length > 0) {
      const freshAlternativeSources: AudioSource[] =
        alternativeAudioSources.map(
          (source: AlternativeAudioSource, index: number) => ({
            type: 'alternative-fresh' as const,
            url: source.audioUrl,
            duration: source.duration,
            quality: source.quality || 'varies',
            label: `${source.source} (${index + 1})`,
            isPersistent: false,
            metadata: source,
          })
        );

      sources.push(...freshAlternativeSources);
    }

    setAudioSources(sources);

    if (sources.length > 0 && !currentSource) {
      setCurrentSource(sources[0]);
    }

    setSourcesInitialized(true);
  }, [
    customAudio,
    work.customAudioUrl,
    work.customAudioSource,
    work.customAudioMetadata,
    alternativeAudioSources,
    currentSource,
    t,
  ]);

  useEffect(() => {
    initializeAudioSources();
  }, [initializeAudioSources]);

  // Configurar player de áudio
  useEffect(() => {
    if (!currentSource) return;

    const audio = new Audio(currentSource.url);
    audio.volume = isMuted ? 0 : volume;
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime * 1000);
    const handleLoadedMetadata = () => setDuration(audio.duration * 1000);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.error('❌ Erro ao carregar áudio:', currentSource.url, e);
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
  }, [currentSource, volume, isMuted]);

  // Tentar próxima fonte de áudio
  const tryNextAudioSource = useCallback(() => {
    const currentIndex = audioSources.findIndex(
      (source) => source === currentSource
    );
    const nextSource = audioSources[currentIndex + 1];

    if (nextSource) {
      setCurrentSource(nextSource);
    }
  }, [audioSources, currentSource]);

  // Selecionar fonte manualmente
  const selectAudioSource = useCallback(
    (source: AudioSource) => {
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      setCurrentSource(source);
    },
    [isPlaying]
  );

  // Controles do player
  const togglePlay = async () => {
    if (!currentSource || !audioRef.current) return;

    try {
      setIsLoading(true);

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }

      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('❌ Erro ao controlar reprodução:', error);
      tryNextAudioSource();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume;
    }
  };

  // Função para navegação no áudio (waveform)
  const handleSeek = useCallback(
    (timeInMs: number) => {
      if (audioRef.current && duration > 0) {
        const timeInSeconds = timeInMs / 1000;
        audioRef.current.currentTime = timeInSeconds;
        setCurrentTime(timeInMs);
      }
    },
    [duration]
  );

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSourceIcon = (source: AudioSource): JSX.Element => {
    switch (source.type) {
      case 'youtube-audio':
        return <SiYoutube className="w-4 h-4 text-red-400" />;
      case 'custom-audio':
        return <FiUpload className="w-4 h-4 text-blue-400" />;
      case 'alternative-saved':
        return <FiDatabase className="w-4 h-4 text-green-400" />;
      case 'alternative-fresh':
        return <FiMusic className="w-4 h-4 text-purple-400" />;
      default:
        return <FiMusic className="w-4 h-4 text-gray-400" />;
    }
  };

  const getAudioCover = (): JSX.Element => {
    if (currentSource?.type === 'custom-audio') {
      return (
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <FiUpload className="w-8 h-8 text-white" />
        </div>
      );
    }

    if (currentSource?.type === 'alternative-saved') {
      return (
        <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
          <FiDatabase className="w-8 h-8 text-white" />
        </div>
      );
    }

    if (currentSource?.type === 'alternative-fresh') {
      return (
        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
          <FiMusic className="w-8 h-8 text-white" />
        </div>
      );
    }

    return (
      <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg flex items-center justify-center">
        <FiMusic className="w-8 h-8 text-gray-400" />
      </div>
    );
  };

  if (!sourcesInitialized) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">
            {t('universal_audio_player_inicializando')}
          </p>
        </div>
      </div>
    );
  }

  if (audioSources.length === 0) {
    return (
      <div className="bg-theme-elevated rounded-xl p-8 border-2 border-dashed border-theme-secondary text-center">
        <div className="text-center">
          <FiAlertTriangle className="w-12 h-12 text-theme-tertiary mx-auto mb-3" />
          <p className="text-theme-secondary">
            {isSearching
              ? t('universal_audio_player_procurando')
              : searchError
              ? t('universal_audio_player_sem_audio')
              : t('universal_audio_player_nenhum_encontrado')}
          </p>
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

            {currentSource && (
              <div className="flex items-center space-x-2 mt-2">
                {getSourceIcon(currentSource)}
                <span className="text-xs text-gray-300">
                  {currentSource.label}
                </span>
              </div>
            )}
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
                onClick={() => selectAudioSource(source)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  currentSource === source
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {getSourceIcon(source)}
                <span>{source.label}</span>
                {source.isPersistent && (
                  <FiDatabase
                    className="w-3 h-3 text-green-400"
                    title={t('universal_audio_player_banco')}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Waveform - COMPONENTE IMPORTADO */}
      {audioRef !== null && (
        <div className="px-6 pb-4">
          <Waveform
            audioRef={audioRef}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onSeek={handleSeek}
            height={80}
            className="rounded-lg border border-gray-600"
          />
        </div>
      )}

      {/* Controles */}
      <div className="px-6 pb-6">
        <div className="flex items-center space-x-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            disabled={isLoading || !currentSource}
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
