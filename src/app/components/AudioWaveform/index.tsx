// components/AudioWaveform.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface AudioWaveformProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onSeek?: (time: number) => void;
  className?: string;
}

interface AudioContextRefs {
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  dataArray: Uint8Array | null;
  source: MediaElementAudioSourceNode | null;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioRef,
  isPlaying,
  currentTime,
  duration,
  onSeek,
  className = 'w-full h-16 bg-gray-800/50 rounded-lg overflow-hidden cursor-pointer',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRefs = useRef<AudioContextRefs>({
    audioContext: null,
    analyser: null,
    dataArray: null,
    source: null,
  });

  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Inicializar Web Audio API
  const initializeAudioContext = useCallback(async (): Promise<void> => {
    if (!audioRef.current || isInitialized) return;

    try {
      setInitError(null);

      // Verificar se AudioContext está disponível
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API não suportada neste navegador');
      }

      // Criar contexto de áudio
      const audioContext: AudioContext = new AudioContextClass();
      const analyser: AnalyserNode = audioContext.createAnalyser();

      // Configurar o analyser
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;

      // Conectar o áudio ao analyser
      const source: MediaElementAudioSourceNode =
        audioContext.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      // Criar array para dados de frequência
      const bufferLength: number = analyser.frequencyBinCount;
      const dataArray: Uint8Array = new Uint8Array(bufferLength);

      // Armazenar referências
      audioContextRefs.current = {
        audioContext,
        analyser,
        dataArray,
        source,
      };

      setIsInitialized(true);
      console.log('🎵 [AudioWaveform] AudioContext inicializado com sucesso');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(
        '❌ [AudioWaveform] Erro ao inicializar AudioContext:',
        errorMessage
      );
      setInitError(errorMessage);
    }
  }, [audioRef, isInitialized]);

  // Desenhar waveform
  const drawWaveform = useCallback((): void => {
    const canvas = canvasRef.current;
    const { analyser, dataArray } = audioContextRefs.current;

    if (!canvas || !analyser || !dataArray) return;

    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) return;

    const width: number = canvas.width;
    const height: number = canvas.height;

    // Obter dados de frequência
    analyser.getByteFrequencyData(dataArray);

    // Limpar canvas
    ctx.fillStyle = 'rgba(17, 24, 39, 0.3)'; // bg-gray-900 com transparência
    ctx.fillRect(0, 0, width, height);

    // Configurar estilo das barras
    const barWidth: number = (width / dataArray.length) * 2;
    let x: number = 0;

    // Desenhar barras de frequência
    for (let i = 0; i < dataArray.length; i++) {
      const normalizedHeight: number = dataArray[i] / 255;
      const barHeight: number = normalizedHeight * height * 0.8;

      // Gradient das barras baseado na altura
      const gradient: CanvasGradient = ctx.createLinearGradient(
        0,
        height - barHeight,
        0,
        height
      );

      if (normalizedHeight > 0.6) {
        gradient.addColorStop(0, '#10b981'); // green-500
        gradient.addColorStop(1, '#3b82f6'); // blue-500
      } else if (normalizedHeight > 0.3) {
        gradient.addColorStop(0, '#3b82f6'); // blue-500
        gradient.addColorStop(1, '#8b5cf6'); // purple-500
      } else {
        gradient.addColorStop(0, '#6b7280'); // gray-500
        gradient.addColorStop(1, '#9ca3af'); // gray-400
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

      x += barWidth;
    }

    // Desenhar linha de progresso
    if (duration > 0) {
      const progressX: number = (currentTime / duration) * width;

      // Linha principal de progresso
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)'; // red-500
      ctx.fillRect(progressX - 1, 0, 2, height);

      // Sombra da linha de progresso
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.fillRect(progressX - 3, 0, 6, height);

      // Área reproduzida (overlay sutil)
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'; // blue-500 muito transparente
      ctx.fillRect(0, 0, progressX, height);
    }

    // Continuar animação se estiver tocando
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(drawWaveform);
    }
  }, [isPlaying, currentTime, duration]);

  // Desenhar estado estático (quando pausado)
  const drawStaticWaveform = useCallback((): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) return;

    const width: number = canvas.width;
    const height: number = canvas.height;

    // Limpar canvas
    ctx.fillStyle = 'rgba(17, 24, 39, 0.5)';
    ctx.fillRect(0, 0, width, height);

    // Desenhar barras estáticas simuladas
    const barCount: number = 64;
    const barWidth: number = width / barCount;

    for (let i = 0; i < barCount; i++) {
      const normalizedHeight: number = Math.abs(Math.sin(i * 0.1)) * 0.5 + 0.1;
      const barHeight: number = normalizedHeight * height;

      ctx.fillStyle = '#4b5563'; // gray-600
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
    }

    // Linha de progresso no estado pausado
    if (duration > 0) {
      const progressX: number = (currentTime / duration) * width;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.fillRect(progressX - 1, 0, 2, height);

      // Área reproduzida
      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.fillRect(0, 0, progressX, height);
    }
  }, [currentTime, duration]);

  // Gerenciar animação
  useEffect(() => {
    if (isPlaying && isInitialized && !initError) {
      // Retomar contexto se necessário
      const { audioContext } = audioContextRefs.current;
      if (audioContext?.state === 'suspended') {
        audioContext.resume().catch((error: Error) => {
          console.error(
            '❌ [AudioWaveform] Erro ao retomar AudioContext:',
            error.message
          );
        });
      }
      drawWaveform();
    } else {
      // Parar animação
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      // Desenhar estado estático quando pausado
      if (isInitialized && !isPlaying) {
        drawStaticWaveform();
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, isInitialized, initError, drawWaveform, drawStaticWaveform]);

  // Inicializar quando o áudio estiver pronto
  useEffect(() => {
    if (!audioRef.current || isInitialized) return;

    const audio: HTMLAudioElement = audioRef.current;

    const handleCanPlay = (): void => {
      initializeAudioContext();
    };

    const handleLoadedData = (): void => {
      initializeAudioContext();
    };

    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      initializeAudioContext();
    } else {
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('loadeddata', handleLoadedData);

      return () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('loadeddata', handleLoadedData);
      };
    }
  }, [audioRef, initializeAudioContext, isInitialized]);

  // Redimensionar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = (): void => {
      const rect: DOMRect = canvas.getBoundingClientRect();
      const dpr: number = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);

        // Redesenhar após redimensionamento
        if (isInitialized) {
          if (isPlaying) {
            drawWaveform();
          } else {
            drawStaticWaveform();
          }
        }
      }
    };

    // Usar ResizeObserver para melhor performance
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);

    // Primeira configuração
    resizeCanvas();

    return () => {
      resizeObserver.disconnect();
    };
  }, [isInitialized, isPlaying, drawWaveform, drawStaticWaveform]);

  // Handle click para seek
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>): void => {
      const canvas = canvasRef.current;
      if (!canvas || !onSeek || duration === 0) return;

      const rect: DOMRect = canvas.getBoundingClientRect();
      const x: number = event.clientX - rect.left;
      const percentage: number = x / rect.width;
      const newTime: number = percentage * duration;

      // Garantir que o tempo está dentro dos limites
      const clampedTime: number = Math.max(0, Math.min(newTime, duration));
      onSeek(clampedTime);
    },
    [onSeek, duration]
  );

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      const { audioContext } = audioContextRefs.current;
      if (audioContext) {
        audioContext.close().catch((error: Error) => {
          console.error(
            '❌ [AudioWaveform] Erro ao fechar AudioContext:',
            error.message
          );
        });
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative group ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onClick={handleCanvasClick}
        style={{ width: '100%', height: '100%' }}
        aria-label="Audio waveform - clique para navegar"
        role="button"
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent<HTMLCanvasElement>) => {
          if ((e.key === 'Enter' || e.key === ' ') && onSeek && duration > 0) {
            // Seek para o meio ao pressionar Enter/Space
            onSeek(duration / 2);
          }
        }}
      />

      {/* Overlay para melhor UX */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />

      {/* Indicador de posição no hover */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          left:
            duration > 0
              ? `${Math.min(100, Math.max(0, (currentTime / duration) * 100))}%`
              : '0%',
        }}
      />

      {/* Loading indicator quando não inicializado */}
      {!isInitialized && !initError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Inicializando waveform...</span>
          </div>
        </div>
      )}

      {/* Error indicator */}
      {initError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-2 text-red-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs">Erro no waveform</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioWaveform;
