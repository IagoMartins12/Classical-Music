// app/components/Players/UniversalAudioPlayer.tsx - CORRIGIDO
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

  // 🆕 Prop para fontes alternativas vindas da busca de mídia
  alternativeAudioSources?: any[];
}

const UniversalAudioPlayer: React.FC<UniversalAudioPlayerProps> = ({
  work,
  customAudio,
  alternativeAudioSources = [], // 🆕 Receber fontes alternativas
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
  const [sourcesInitialized, setSourcesInitialized] = useState(false); // 🆕 Flag para controlar inicialização

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);

  // 🆕 Função para inicializar fontes de áudio
  const initializeAudioSources = useCallback(() => {
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

    // 2. 🆕 Fontes alternativas vindas da busca de mídia
    if (alternativeAudioSources && alternativeAudioSources.length > 0) {
      const alternativeSources = alternativeAudioSources.map(
        (source, index) => ({
          type: 'alternative' as const,
          url: source.audioUrl,
          duration: source.duration,
          quality: source.quality || 'varies',
          label: source.source || `Fonte Alternativa ${index + 1}`,
        })
      );
      sources.push(...alternativeSources);
    }

    console.log('🎵 [AUDIO-PLAYER] Fontes inicializadas:', sources.length);

    setAudioSources(sources);

    // 🆕 FIX: Definir fonte padrão quando há fontes disponíveis
    if (sources.length > 0 && !currentSource) {
      console.log(
        '🎵 [AUDIO-PLAYER] Definindo fonte padrão:',
        sources[0].label
      );
      setCurrentSource(sources[0]);
    }

    setSourcesInitialized(true); // 🆕 Marcar como inicializado
  }, [customAudio, alternativeAudioSources, currentSource]);

  // 🆕 Inicializar fontes quando componente monta ou props mudam
  useEffect(() => {
    if (!sourcesInitialized) {
      initializeAudioSources();
    }
  }, [initializeAudioSources, sourcesInitialized]);

  // Buscar fontes alternativas adicionais (quando chamado manualmente)
  const searchAlternativeAudioSources = useCallback(async () => {
    if (isSearchingAlternatives) return;

    setIsSearchingAlternatives(true);

    try {
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
        const alternativeSources = newSources.map(
          (source: any, index: number) => ({
            type: 'alternative' as const,
            url: source.audioUrl,
            duration: source.duration,
            quality: source.quality || 'varies',
            label: source.source || `Fonte Alternativa ${index + 1}`,
          })
        );

        // 🆕 FIX: Adicionar novas fontes sem duplicar
        setAudioSources((prev) => {
          const existingUrls = new Set(prev.map((s) => s.url));
          const uniqueNewSources = alternativeSources.filter(
            (s: any) => !existingUrls.has(s.url)
          );

          const updatedSources = [...prev, ...uniqueNewSources];

          // Se não havia fonte selecionada, selecionar a primeira nova
          if (!currentSource && uniqueNewSources.length > 0) {
            setCurrentSource(uniqueNewSources[0]);
          }

          return updatedSources;
        });

        console.log(
          `✅ [AUDIO-PLAYER] ${newSources.length} novas fontes adicionadas`
        );
      }
    } catch (error) {
      console.error('Erro ao buscar fontes alternativas:', error);
    } finally {
      setIsSearchingAlternatives(false);
    }
  }, [
    isSearchingAlternatives,
    work.title,
    work.composer.fullName,
    currentSource,
  ]);

  // Configurar player de áudio
  useEffect(() => {
    if (!currentSource) return;

    console.log(
      '🎵 [AUDIO-PLAYER] Configurando player para:',
      currentSource.label
    );

    const audio = new Audio(currentSource.url);
    audio.volume = isMuted ? 0 : volume;
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime * 1000);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration * 1000);
      console.log(
        '🎵 [AUDIO-PLAYER] Áudio carregado, duração:',
        audio.duration
      );
    };
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: any) => {
      console.error(
        '❌ [AUDIO-PLAYER] Erro ao carregar áudio:',
        currentSource.url,
        e
      );
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

  // Tentar próxima fonte de áudio em caso de erro
  const tryNextAudioSource = useCallback(() => {
    const currentIndex = audioSources.findIndex(
      (source) => source === currentSource
    );
    const nextSource = audioSources[currentIndex + 1];

    if (nextSource) {
      console.log(
        '🔄 [AUDIO-PLAYER] Tentando próxima fonte:',
        nextSource.label
      );
      setCurrentSource(nextSource);
    } else {
      console.log(
        '🔍 [AUDIO-PLAYER] Todas as fontes falharam, buscando alternativas...'
      );
      searchAlternativeAudioSources();
    }
  }, [audioSources, currentSource, searchAlternativeAudioSources]);

  // 🆕 FIX: Função para selecionar fonte manualmente
  const selectAudioSource = useCallback(
    (source: AudioSource) => {
      console.log(
        '🎵 [AUDIO-PLAYER] Fonte selecionada manualmente:',
        source.label
      );

      // Parar áudio atual se estiver tocando
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
    if (!currentSource || !audioRef.current) {
      console.warn('🎵 [AUDIO-PLAYER] Nenhuma fonte ou player disponível');
      return;
    }

    try {
      setIsLoading(true);

      if (isPlaying) {
        audioRef.current.pause();
        console.log('⏸️ [AUDIO-PLAYER] Pausado');
      } else {
        await audioRef.current.play();
        console.log('▶️ [AUDIO-PLAYER] Reproduzindo');
      }

      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('❌ [AUDIO-PLAYER] Erro ao controlar reprodução:', error);
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

  // 🆕 FIX: Renderizar baseado no estado de inicialização
  if (!sourcesInitialized) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">
            Inicializando player de áudio...
          </p>
        </div>
      </div>
    );
  }

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
                onClick={() => selectAudioSource(source)} // 🆕 FIX: Usar função correta
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
