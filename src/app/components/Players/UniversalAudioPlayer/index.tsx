// app/components/Players/UniversalAudioPlayer.tsx - SIMPLIFICADO SEM BUSCA DE FONTES
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

interface AudioSource {
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
  isPersistent?: boolean; // 🆕 Se está salvo no banco
  metadata?: any; // 🆕 Metadados da fonte
}

interface UniversalAudioPlayerProps {
  work: {
    id: string;
    title: string;
    composer: { fullName: string };
    // 🆕 Campos expandidos para áudio customizado
    customAudioUrl?: string | null;
    customAudioFile?: string | null;
    customAudioSource?: string | null; // "upload" ou nome da fonte
    customAudioMetadata?: any; // Metadados JSON
  };

  customAudio?: {
    url: string;
    file: string;
    title?: string;
    isPersistent?: boolean;
  } | null;

  // 🆕 Prop para fontes alternativas temporárias (vindas do MediaSection)
  alternativeAudioSources?: any[];
}

const UniversalAudioPlayer: React.FC<UniversalAudioPlayerProps> = ({
  work,
  customAudio,
  alternativeAudioSources = [],
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
  const [sourcesInitialized, setSourcesInitialized] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);

  // 🆕 Função para inicializar fontes de áudio COM PRIORIDADES CORRETAS
  const initializeAudioSources = useCallback(() => {
    const sources: AudioSource[] = [];

    console.log('🎵 [AUDIO-PLAYER] Inicializando fontes com prioridades:', {
      hasCustomAudio: !!customAudio,
      hasWorkAudioUrl: !!work.customAudioUrl,
      workAudioSource: work.customAudioSource,
      alternativeSourcesCount: alternativeAudioSources.length,
    });

    // 🎯 PRIORIDADE 1: Áudio Customizado (UPLOAD) - SEMPRE PRIMEIRO
    if (customAudio?.url || customAudio?.file) {
      sources.push({
        type: 'custom-audio',
        url: customAudio.url || customAudio.file,
        duration: 0,
        quality: 'original',
        label: customAudio.title || 'Áudio Personalizado',
        isPersistent: customAudio.isPersistent ?? true,
      });
      console.log('✅ [AUDIO-PLAYER] Adicionado: Áudio customizado (upload)');
    }

    // 🎯 PRIORIDADE 2: Fonte Alternativa SALVA no banco (se não for upload)
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
        label: `${work.customAudioSource} (Salvo)`,
        isPersistent: true,
        metadata: work.customAudioMetadata,
      });
      console.log(
        '✅ [AUDIO-PLAYER] Adicionado: Fonte alternativa salva -',
        work.customAudioSource
      );
    }

    // 🎯 PRIORIDADE 3: Fontes alternativas TEMPORÁRIAS (não salvas) - vindas do MediaSection
    if (alternativeAudioSources.length > 0) {
      const freshAlternativeSources = alternativeAudioSources.map(
        (source: any, index: number) => ({
          type: 'alternative-fresh' as const,
          url: source.audioUrl,
          duration: source.duration,
          quality: source.quality || 'varies',
          label: `${source.source} (${index + 1})`,
          isPersistent: false, // NÃO são persistentes
          metadata: source,
        })
      );

      sources.push(...freshAlternativeSources);
      console.log(
        `✅ [AUDIO-PLAYER] Adicionado: ${freshAlternativeSources.length} fonte(s) alternativa(s) temporária(s)`
      );
    }

    setAudioSources(sources);

    // 🆕 Definir fonte padrão (sempre a primeira disponível)
    if (sources.length > 0 && !currentSource) {
      console.log(
        '🎵 [AUDIO-PLAYER] Definindo fonte padrão:',
        sources[0].label
      );
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
  ]);

  // 🆕 Inicializar fontes quando componente monta ou props mudam
  useEffect(() => {
    initializeAudioSources();
  }, [initializeAudioSources]);

  // Configurar player de áudio
  useEffect(() => {
    if (!currentSource) return;

    console.log('🎵 [AUDIO-PLAYER] Configurando player para:', {
      label: currentSource.label,
      type: currentSource.type,
      isPersistent: currentSource.isPersistent,
    });

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
        '❌ [AUDIO-PLAYER] Todas as fontes falharam. Use o botão "Mais Fontes" no MediaSection para buscar alternativas.'
      );
    }
  }, [audioSources, currentSource]);

  // 🆕 Função para selecionar fonte manualmente
  const selectAudioSource = useCallback(
    (source: AudioSource) => {
      console.log('🎵 [AUDIO-PLAYER] Fonte selecionada manualmente:', {
        label: source.label,
        type: source.type,
        isPersistent: source.isPersistent,
      });

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

  // 🆕 Ícone da fonte com indicadores de persistência
  const getSourceIcon = (source: AudioSource) => {
    switch (source.type) {
      case 'youtube-audio':
        return <SiYoutube className="w-4 h-4 text-red-400" />;
      case 'custom-audio':
        return <FiUpload className="w-4 h-4 text-blue-400" />;
      case 'alternative-saved':
        return <FiDatabase className="w-4 h-4 text-green-400" />; // 🆕 Ícone para salvas
      case 'alternative-fresh':
        return <FiMusic className="w-4 h-4 text-purple-400" />; // 🆕 Ícone para temporárias
      default:
        return <FiMusic className="w-4 h-4 text-gray-400" />;
    }
  };

  const getAudioCover = () => {
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

    // Fallback padrão
    return (
      <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg flex items-center justify-center">
        <FiMusic className="w-8 h-8 text-gray-400" />
      </div>
    );
  };

  // 🆕 Status de inicialização
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

  // 🆕 Estado sem fontes disponíveis
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
          <p className="text-gray-500 text-xs">
            Use o botão "Carregar Mídia" ou "Mais Fontes" acima para buscar
            fontes de áudio.
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

            {/* 🆕 Fonte atual com indicadores de persistência */}
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
                {currentSource.isPersistent && (
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded flex items-center space-x-1">
                    <FiDatabase className="w-3 h-3" />
                    <span>Salvo</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🆕 Seletor de fontes com indicadores de persistência */}
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
                    title="Salvo no banco"
                  />
                )}
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
