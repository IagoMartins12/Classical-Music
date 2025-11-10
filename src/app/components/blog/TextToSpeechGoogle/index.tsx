// components/blog/TextToSpeechGoogle.tsx - OTIMIZADO SEM RE-RENDERS
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  FiVolume2,
  FiPause,
  FiPlay,
  FiSquare,
  FiDownload,
  FiLoader,
} from 'react-icons/fi';

interface TextToSpeechGoogleProps {
  content: any; // TipTap JSON
  articleId: string;
  existingAudioUrl?: string | null;
  isAdmin?: boolean;
}

export function TextToSpeechGoogle({
  content,
  articleId,
  existingAudioUrl,
  isAdmin,
}: TextToSpeechGoogleProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(
    existingAudioUrl || null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // ✅ EXTRAIR TEXTO DO CONTEÚDO (memoizado)
  const extractText = useCallback((json: any): string => {
    if (!json || !json.content) return '';

    let text = '';

    const processNode = (node: any) => {
      if (node.type === 'text') {
        text += node.text + ' ';
      } else if (node.content && Array.isArray(node.content)) {
        node.content.forEach((child: any) => processNode(child));
      }

      if (node.type === 'paragraph' || node.type === 'heading') {
        text += '. ';
      }
    };

    json.content.forEach((node: any) => processNode(node));
    return text.trim();
  }, []);

  // ✅ CARREGAR ÁUDIO EXISTENTE (apenas na montagem)
  useEffect(() => {
    if (existingAudioUrl && !isInitializedRef.current) {
      setAudioUrl(existingAudioUrl);
      isInitializedRef.current = true;
    }
  }, [existingAudioUrl]);

  // ✅ CONFIGURAR ÁUDIO QUANDO URL MUDAR (com cleanup)
  useEffect(() => {
    if (!audioUrl) return;

    // Limpar áudio anterior
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    // Criar novo áudio
    const audio = new Audio(audioUrl);
    audio.volume = volume;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    audioRef.current = audio;

    // Cleanup
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl, volume]);

  // ✅ ATUALIZAR PROGRESSO (otimizado com cleanup)
  useEffect(() => {
    // Limpar intervalo anterior
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Criar novo intervalo apenas se estiver tocando
    if (isPlaying && audioRef.current) {
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 100);
    }

    // Cleanup
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isPlaying]);

  // ✅ GERAR ÁUDIO
  const handleGenerateAudio = useCallback(async () => {
    setIsGenerating(true);

    try {
      const fullText = extractText(content);

      if (!fullText) {
        alert('Não há texto para converter.');
        return;
      }

      const response = await fetch('/api/blog/tts/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullText,
          articleId,
          voiceName: 'pt-BR-Wavenet-B',
          speakingRate: 1.0,
          regenerate: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAudioUrl(data.audioUrl);
      } else {
        alert('Erro ao gerar áudio: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao gerar áudio:', error);
      alert('Erro ao gerar áudio. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  }, [content, articleId, extractText]);

  // ✅ TOCAR/PAUSAR
  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    } else {
      audioRef.current.play().catch((err) => {
        console.error('Erro ao reproduzir áudio:', err);
      });
      setIsPlaying(true);
      setIsPaused(false);
    }
  }, [isPlaying]);

  // ✅ PARAR
  const handleStop = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
  }, []);

  // ✅ BUSCAR (SEEK)
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;

    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  // ✅ VOLUME
  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
    },
    []
  );

  // ✅ BAIXAR
  const handleDownload = useCallback(() => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `artigo-audio.mp3`;
    a.click();
  }, [audioUrl]);

  // ✅ FORMATAR TEMPO (memoizado)
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // ✅ PROGRESSO EM % (memoizado)
  const progress = useMemo(() => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  }, [currentTime, duration]);

  // ✅ GRADIENTE DE PROGRESSO (memoizado)
  const progressGradient = useMemo(() => {
    return `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`;
  }, [progress]);

  // ✅ GRADIENTE DE VOLUME (memoizado)
  const volumeGradient = useMemo(() => {
    const volumePercent = volume * 100;
    return `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${volumePercent}%, #e5e7eb ${volumePercent}%, #e5e7eb 100%)`;
  }, [volume]);

  if (!audioUrl && !isAdmin) {
    return <></>;
  }
  return (
    <div className="classical-card p-6 my-8">
      {/* HEADER */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-3 bg-gradient-to-br from-brand-primary to-accent-purple rounded-lg shadow-theme-medium">
          <FiVolume2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-theme-primary">Ouça este artigo</h3>
        </div>
      </div>

      {/* PLAYER OU BOTÃO INICIAL */}
      {audioUrl ? (
        <div className="space-y-4">
          {/* Progresso */}
          <div>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: progressGradient,
              }}
            />
            <div className="flex justify-between text-xs text-theme-tertiary mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePlayPause}
              className="flex-1 btn-classical-primary flex items-center justify-center space-x-2"
            >
              {isPlaying ? (
                <>
                  <FiPause className="w-5 h-5" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <FiPlay className="w-5 h-5" />
                  <span>{isPaused ? 'Continuar' : 'Ouvir Artigo'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleStop}
              className="btn-classical-secondary p-3"
              title="Parar"
            >
              <FiSquare className="w-5 h-5" />
            </button>

            <button
              onClick={handleDownload}
              className="btn-classical-secondary p-3"
              title="Baixar áudio"
            >
              <FiDownload className="w-5 h-5" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center space-x-3">
            <FiVolume2 className="w-4 h-4 text-theme-secondary" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-1 rounded-lg appearance-none cursor-pointer"
              style={{
                background: volumeGradient,
              }}
            />
            <span className="text-xs text-theme-tertiary w-12 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={handleGenerateAudio}
            disabled={isGenerating}
            className="w-full btn-classical-primary flex items-center justify-center space-x-2 py-4"
          >
            {isGenerating ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                <span>Carregando áudio...</span>
              </>
            ) : (
              <>
                <FiPlay className="w-5 h-5" />
                <span>Clique para ouvir este post</span>
              </>
            )}
          </button>

          {isGenerating && (
            <div className="text-center">
              <p className="text-xs text-theme-tertiary">
                Isso pode levar alguns segundos
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
