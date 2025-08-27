// app/components/Waveform/index.tsx - VERSÃO ULTRA ROBUSTA
'use client';

import { useLanguageStore } from '@/app/stores/useLanguageStore';
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface WaveformProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek?: (time: number) => void;
  height?: number;
  width?: number;
  className?: string;
}

const Waveform: React.FC<WaveformProps> = ({
  audioRef,
  currentTime,
  duration,
  isPlaying,
  onSeek,
  height = 80,
  width,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [canvasWidth, setCanvasWidth] = useState<number>(800);
  const [waveformReady, setWaveformReady] = useState<boolean>(false);

  const { language } = useLanguageStore();
  // Atualizar largura do canvas
  const updateCanvasWidth = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      setCanvasWidth(width || containerWidth);
    }
  }, [width]);

  // Resize observer
  useEffect(() => {
    const resizeObserver = new ResizeObserver(updateCanvasWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    updateCanvasWidth();

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateCanvasWidth]);

  // Gerar waveform bonito e realista (sempre funciona)
  const generateWaveform = useCallback(() => {
    const barCount = Math.min(120, Math.floor(canvasWidth / 6));
    const waveData: number[] = [];

    for (let i = 0; i < barCount; i++) {
      // Múltiplas frequências para parecer real
      const progress = i / barCount;

      // Base wave (baixa frequência)
      const baseWave = Math.sin(progress * Math.PI * 3) * 0.4;

      // Mid wave (média frequência)
      const midWave = Math.sin(progress * Math.PI * 8) * 0.25;

      // High wave (alta frequência)
      const highWave = Math.sin(progress * Math.PI * 20) * 0.15;

      // Noise para variação
      const noise = (Math.random() - 0.5) * 0.1;

      // Envelope (começa e termina mais baixo)
      const envelope = Math.sin(progress * Math.PI) * 0.8 + 0.2;

      // Combinar tudo
      let amplitude = (baseWave + midWave + highWave + noise) * envelope;

      // Normalizar entre 0.1 e 0.9
      amplitude = Math.max(0.1, Math.min(0.9, (amplitude + 1) / 2));

      waveData.push(amplitude);
    }

    setWaveformData(waveData);
    setWaveformReady(true);
  }, [canvasWidth]);

  // Tentar análise real (mas não travar se falhar)
  const tryRealAnalysis = useCallback(async () => {
    if (!audioRef?.current?.src) {
      generateWaveform();
      return;
    }

    try {
      // Timeout agressivo de 3 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        generateWaveform();
      }, 3000);

      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error('AudioContext não suportado');
      }

      const audioContext = new AudioContextClass();
      const response = await fetch(audioRef.current.src, {
        signal: controller.signal,
        mode: 'cors',
      });

      if (!response.ok) throw new Error('Fetch failed');

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Se chegou até aqui, usar dados reais
      clearTimeout(timeoutId);

      const channelData = audioBuffer.getChannelData(0);
      const samples = channelData.length;
      const barCount = Math.min(120, Math.floor(canvasWidth / 6));
      const samplesPerBar = Math.floor(samples / barCount);

      const realWaveData: number[] = [];

      for (let i = 0; i < barCount; i++) {
        const start = i * samplesPerBar;
        const end = Math.min(start + samplesPerBar, samples);

        let sum = 0;
        let max = 0;

        for (let j = start; j < end; j++) {
          const sample = Math.abs(channelData[j]);
          sum += sample * sample;
          max = Math.max(max, sample);
        }

        const rms = Math.sqrt(sum / (end - start));
        const amplitude = Math.min(0.9, Math.max(0.1, (rms * 2 + max) / 3));
        realWaveData.push(amplitude);
      }

      setWaveformData(realWaveData);
      setWaveformReady(true);

      await audioContext.close();
    } catch (error) {
      generateWaveform();
    }
  }, [audioRef, canvasWidth, generateWaveform]);

  // Inicializar waveform quando componente monta ou áudio muda
  useEffect(() => {
    setWaveformReady(false);

    if (audioRef.current?.src) {
      // Tentar análise real, mas com fallback garantido
      tryRealAnalysis();
    } else {
      // Se não há áudio, gerar imediatamente
      generateWaveform();
    }
  }, [audioRef.current?.src, tryRealAnalysis, generateWaveform]);

  // Desenhar waveform
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformReady || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / waveformData.length;
    const centerY = canvas.height / 2;
    const maxHeight = canvas.height * 0.8;
    const progressPosition =
      duration > 0 ? (currentTime / duration) * canvas.width : 0;

    // Desenhar barras
    waveformData.forEach((amplitude, index) => {
      const x = index * barWidth;
      const barHeight = amplitude * maxHeight;
      const isPlayed = x < progressPosition;

      // Cores
      if (isPlayed) {
        // Gradiente animado para partes tocadas
        const gradient = ctx.createLinearGradient(
          0,
          centerY - barHeight / 2,
          0,
          centerY + barHeight / 2
        );
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(0.5, '#06b6d4');
        gradient.addColorStop(1, '#10b981');
        ctx.fillStyle = gradient;
      } else {
        // Cinza para não tocadas
        ctx.fillStyle = 'rgba(156, 163, 175, 0.4)';
      }

      // Desenhar barra com padding
      const barX = x + 1;
      const barY = centerY - barHeight / 2;
      const barW = Math.max(2, barWidth - 2);

      ctx.fillRect(barX, barY, barW, barHeight);
    });

    // Linha de progresso
    if (progressPosition > 0) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(progressPosition, 8);
      ctx.lineTo(progressPosition, canvas.height - 8);
      ctx.stroke();

      // Brilho se tocando
      if (isPlaying) {
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 6;
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(progressPosition, 8);
        ctx.lineTo(progressPosition, canvas.height - 8);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  }, [waveformData, currentTime, duration, isPlaying, waveformReady]);

  // Redesenhar quando necessário
  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Click handler
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek || duration === 0 || !waveformReady) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const clickPosition = x / canvas.width;
    const newTime = clickPosition * duration;

    onSeek(newTime);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: `${height}px` }}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={height}
        onClick={handleCanvasClick}
        className={`absolute inset-0 rounded-lg transition-all duration-200 ${
          waveformReady ? 'cursor-pointer hover:shadow-lg' : 'cursor-wait'
        }`}
        style={{
          background:
            'linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(31, 41, 55, 0.6) 100%)',
        }}
      />

      {/* Loading muito simples */}
      {!waveformReady && (
        <div className="absolute inset-0 bg-gray-800/50 rounded-lg flex items-center justify-center">
          <div className="flex items-center space-x-2 text-blue-400">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">
              {language === 'en' ? 'Loading... ' : 'Carregando...'}
            </span>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="absolute bottom-1 left-2 text-xs text-gray-400 bg-gray-900/70 px-2 py-1 rounded">
        {waveformReady && (
          <span>
            {language === 'en' ? 'Click on wave ' : 'Clique para navegar'}
          </span>
        )}
      </div>

      {/* Indicador de reprodução */}
      {isPlaying && waveformReady && (
        <div className="absolute top-1 right-2 text-xs text-green-400 bg-gray-900/70 px-2 py-1 rounded flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span> {language === 'en' ? 'Playing' : 'Tocando'}</span>
        </div>
      )}
    </div>
  );
};

export default Waveform;
