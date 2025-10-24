// components/blog/TextToSpeechGoogle.tsx - UX NATURAL E AUTOMÁTICA
'use client';

import { useState, useEffect, useRef } from 'react';
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
}

export function TextToSpeechGoogle({
  content,
  articleId,
  existingAudioUrl,
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

  // ✅ CARREGAR ÁUDIO EXISTENTE
  useEffect(() => {
    if (existingAudioUrl) {
      setAudioUrl(existingAudioUrl);
    }
  }, [existingAudioUrl]);

  // ✅ CONFIGURAR ÁUDIO QUANDO URL MUDAR
  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      const audio = new Audio(audioUrl);
      audio.volume = volume;

      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentTime(0);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };

      audioRef.current = audio;
    }
  }, [audioUrl, volume]);

  // ✅ ATUALIZAR PROGRESSO
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      progressIntervalRef.current = setInterval(() => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      }, 100);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // ✅ EXTRAIR TEXTO DO CONTEÚDO
  const extractText = (json: any): string => {
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
  };

  // ✅ GERAR ÁUDIO AUTOMATICAMENTE (primeira vez)
  const handleGenerateAudio = async () => {
    setIsGenerating(true);

    try {
      const fullText = extractText(content);

      if (!fullText) {
        alert('Não há texto para converter.');
        return;
      }

      console.log('🎤 Gerando áudio...', {
        textLength: fullText.length,
      });

      const response = await fetch('/api/blog/tts/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullText,
          articleId,
          voiceName: 'pt-BR-Wavenet-B', // ✅ VOZ FIXA
          speakingRate: 1.0, // ✅ VELOCIDADE FIXA
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
  };

  // ✅ TOCAR/PAUSAR
  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  // ✅ PARAR
  const handleStop = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
  };

  // ✅ BUSCAR (SEEK)
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;

    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // ✅ VOLUME
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // ✅ BAIXAR
  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `artigo-audio.mp3`;
    a.click();
  };

  // ✅ FORMATAR TEMPO
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ✅ PROGRESSO EM %
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

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
                background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`,
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
                background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`,
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
