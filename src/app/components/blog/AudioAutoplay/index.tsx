// components/blog/AudioAutoplay.tsx - COM PLAYER COMPLETO
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FiVolume2, FiVolumeX, FiX, FiPlay, FiPause } from 'react-icons/fi';

interface AudioAutoplayProps {
  audioUrl: string;
  audioType: 'upload' | 'youtube';
  title?: string;
}

export function AudioAutoplay({
  audioUrl,
  audioType,
  title,
}: AudioAutoplayProps) {
  const [status, setStatus] = useState<
    'loading' | 'muted' | 'playing' | 'error'
  >('loading');
  const [showBanner, setShowBanner] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false); // ✅ Controle do player no desktop
  const [showMobilePlayer, setShowMobilePlayer] = useState(false); // ✅ Controle do player no mobile
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const volume = 0.3;

  const audioRef = useRef<HTMLAudioElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const attemptedAutoplay = useRef(false);
  const isPlayerReady = useRef(false);
  const isMounted = useRef(true);
  const cleanupDone = useRef(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // ✅ EXTRAIR ID DO YOUTUBE
  const extractYoutubeId = useCallback((url: string): string | null => {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }, []);

  // ✅ ATUALIZAR PROGRESSO
  const updateProgress = useCallback(() => {
    if (isSeeking) return;

    if (audioType === 'upload' && audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    } else if (audioType === 'youtube' && youtubePlayerRef.current) {
      try {
        const current = youtubePlayerRef.current.getCurrentTime() || 0;
        const total = youtubePlayerRef.current.getDuration() || 0;
        setCurrentTime(current);
        setDuration(total);
      } catch {
        // Ignorar erros de API não pronta
      }
    }
  }, [audioType, isSeeking]);

  // ✅ INICIAR TRACKING DE PROGRESSO
  useEffect(() => {
    if (status === 'playing') {
      progressInterval.current = setInterval(updateProgress, 500);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [status, updateProgress]);

  // ✅ SEEK (AVANÇAR/VOLTAR)
  const handleSeek = useCallback(
    (value: number) => {
      setIsSeeking(true);
      setCurrentTime(value);

      if (audioType === 'upload' && audioRef.current) {
        audioRef.current.currentTime = value;
      } else if (audioType === 'youtube' && youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.seekTo(value, true);
        } catch (error) {
          console.error('Erro ao fazer seek:', error);
        }
      }

      setTimeout(() => setIsSeeking(false), 100);
    },
    [audioType]
  );

  // ✅ PLAY/PAUSE
  const togglePlayPause = useCallback(() => {
    if (audioType === 'upload' && audioRef.current) {
      if (status === 'playing') {
        audioRef.current.pause();
        setStatus('muted');
      } else {
        audioRef.current.play().catch(console.error);
        setStatus('playing');
      }
    } else if (audioType === 'youtube' && youtubePlayerRef.current) {
      try {
        const playerState = youtubePlayerRef.current.getPlayerState();
        if (playerState === 1) {
          // Tocando
          youtubePlayerRef.current.pauseVideo();
          setStatus('muted');
        } else {
          youtubePlayerRef.current.playVideo();
          setStatus('playing');
        }
      } catch (error) {
        console.error('Erro ao alternar play/pause:', error);
      }
    }
  }, [audioType, status]);

  // ✅ FORMATAR TEMPO
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ✅ TENTAR AUTOPLAY
  const tryAutoplay = useCallback(async () => {
    if (attemptedAutoplay.current || !isMounted.current) return;
    attemptedAutoplay.current = true;

    console.log('🔊 Tentando autoplay...');

    try {
      if (audioType === 'upload' && audioRef.current) {
        audioRef.current.muted = true;
        audioRef.current.volume = 0;

        try {
          await audioRef.current.play();
          console.log('✅ Autoplay mudo funcionou');
          if (isMounted.current) setStatus('muted');

          setTimeout(async () => {
            if (!isMounted.current || !audioRef.current) return;
            try {
              audioRef.current.muted = false;
              audioRef.current.volume = volume;
              console.log('✅ Som ativado automaticamente');
              if (isMounted.current) setStatus('playing');
            } catch {
              if (isMounted.current) {
                console.log('⚠️ Mostrar banner (upload)');
                setShowBanner(true);
              }
            }
          }, 1000);
        } catch {
          console.log('❌ Autoplay bloqueado');
          if (isMounted.current) {
            setStatus('error');
            setShowBanner(true);
          }
        }
      } else if (
        audioType === 'youtube' &&
        youtubePlayerRef.current &&
        isPlayerReady.current &&
        isMounted.current
      ) {
        console.log('🎬 Tentando autoplay para YouTube');

        try {
          youtubePlayerRef.current.mute();
          await youtubePlayerRef.current.playVideo();

          console.log('✅ Autoplay mudo funcionou (YouTube)');
          if (isMounted.current) setStatus('muted');

          setTimeout(() => {
            if (!isMounted.current || !youtubePlayerRef.current) return;
            try {
              youtubePlayerRef.current.unMute();
              youtubePlayerRef.current.setVolume(volume * 100);
              console.log('✅ Som ativado automaticamente (YouTube)');
              if (isMounted.current) setStatus('playing');
            } catch {
              if (isMounted.current) {
                console.log('⚠️ Mostrar banner (YouTube)');
                setShowBanner(true);
              }
            }
          }, 1500);
        } catch {
          console.log('❌ Autoplay bloqueado (YouTube)');
          if (isMounted.current) {
            setStatus('error');
            setShowBanner(true);
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro no autoplay:', error);
      if (isMounted.current) {
        setStatus('error');
        setShowBanner(true);
      }
    }
  }, [audioType, volume]);

  // ✅ INICIALIZAR PLAYER YOUTUBE
  const initializeYoutubePlayer = useCallback(() => {
    if (!isMounted.current) return;

    const youtubeId = extractYoutubeId(audioUrl);

    if (!youtubeId) {
      console.error('❌ ID do YouTube inválido');
      setStatus('error');
      setShowBanner(true);
      return;
    }

    if (!playerContainerRef.current) {
      console.error('❌ Container do player não encontrado');
      return;
    }

    if (youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.destroy();
        youtubePlayerRef.current = null;
      } catch (error) {
        console.error('Erro ao destruir player anterior:', error);
      }
    }

    console.log('🎬 Criando player do YouTube para ID:', youtubeId);

    try {
      const playerDiv = document.createElement('div');
      playerContainerRef.current.appendChild(playerDiv);

      youtubePlayerRef.current = new window.YT.Player(playerDiv, {
        height: '0',
        width: '0',
        videoId: youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            if (!isMounted.current) return;
            console.log('✅ Player do YouTube pronto');
            isPlayerReady.current = true;
            tryAutoplay();
          },
          onStateChange: (event: any) => {
            if (!isMounted.current) return;

            if (event.data === window.YT.PlayerState.PLAYING) {
              setStatus('playing');
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setStatus('muted');
            } else if (event.data === window.YT.PlayerState.ENDED) {
              if (youtubePlayerRef.current) {
                youtubePlayerRef.current.seekTo(0);
                youtubePlayerRef.current.playVideo();
              }
            }
          },
          onError: (event: any) => {
            if (!isMounted.current) return;
            console.error('❌ Erro no player do YouTube:', event.data);
            setStatus('error');
            setShowBanner(true);
          },
        },
      });
    } catch (error) {
      console.error('❌ Erro ao criar player do YouTube:', error);
      if (isMounted.current) {
        setStatus('error');
        setShowBanner(true);
      }
    }
  }, [audioUrl, extractYoutubeId, tryAutoplay]);

  // ✅ CARREGAR YOUTUBE API
  useEffect(() => {
    if (audioType !== 'youtube') return;

    isMounted.current = true;
    attemptedAutoplay.current = false;
    isPlayerReady.current = false;

    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializeYoutubePlayer();
        return;
      }

      if ((window as any).youtubeAPILoading) {
        return;
      }

      (window as any).youtubeAPILoading = true;

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;

      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        (window as any).youtubeAPILoading = false;
        if (isMounted.current) {
          initializeYoutubePlayer();
        }
      };
    };

    loadYouTubeAPI();

    return () => {
      isMounted.current = false;
      if (youtubePlayerRef.current && !cleanupDone.current) {
        cleanupDone.current = true;
        try {
          youtubePlayerRef.current.destroy();
          youtubePlayerRef.current = null;
        } catch (error) {
          console.error('Erro no cleanup:', error);
        }
      }
    };
  }, [audioType, initializeYoutubePlayer]);

  // ✅ SETUP PARA ÁUDIO UPLOAD
  useEffect(() => {
    if (audioType !== 'upload' || !audioRef.current) return;

    isMounted.current = true;
    attemptedAutoplay.current = false;

    const handleLoadedData = () => {
      if (isMounted.current) {
        tryAutoplay();
      }
    };

    audioRef.current.addEventListener('loadeddata', handleLoadedData);

    return () => {
      isMounted.current = false;
      audioRef.current?.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [audioType, tryAutoplay]);

  // ✅ ATIVAR SOM MANUALMENTE
  const activateAudio = useCallback(() => {
    if (audioType === 'upload' && audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.volume = volume;
      if (audioRef.current.paused) {
        audioRef.current.play().catch(console.error);
      }
      setStatus('playing');
      setShowBanner(false);
    } else if (audioType === 'youtube' && youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.unMute();
        youtubePlayerRef.current.setVolume(volume * 100);

        const playerState = youtubePlayerRef.current.getPlayerState();
        if (playerState !== 1) {
          youtubePlayerRef.current.playVideo();
        }

        setStatus('playing');
        setShowBanner(false);
      } catch (error) {
        console.error('Erro ao ativar áudio:', error);
      }
    }
  }, [audioType, volume]);

  // ✅ MUTAR/DESMUTAR
  const toggleMute = useCallback(() => {
    if (audioType === 'upload' && audioRef.current) {
      if (audioRef.current.muted) {
        audioRef.current.muted = false;
        audioRef.current.volume = volume;
        setStatus('playing');
      } else {
        audioRef.current.muted = true;
        setStatus('muted');
      }
    } else if (audioType === 'youtube' && youtubePlayerRef.current) {
      try {
        if (youtubePlayerRef.current.isMuted()) {
          youtubePlayerRef.current.unMute();
          youtubePlayerRef.current.setVolume(volume * 100);
          setStatus('playing');
        } else {
          youtubePlayerRef.current.mute();
          setStatus('muted');
        }
      } catch (error) {
        console.error('Erro ao alternar mute:', error);
      }
    }
  }, [audioType, volume]);

  // ✅ COMPONENTE DO PLAYER
  const AudioPlayer = () => (
    <div className="classical-card-simple rounded-lg shadow-xl p-4  ">
      {/* Título */}
      <div className="mb-3">
        <p className="text-sm font-medium text-theme-primary truncate">
          {title || 'Música de fundo'}
        </p>
      </div>

      {/* Controles */}
      <div className="flex items-center space-x-3 mb-3">
        {/* Play/Pause */}
        <button
          onClick={togglePlayPause}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-brand-primary text-theme-primary rounded-full hover:bg-brand-secondary transition-colors"
          title={status === 'playing' ? 'Pausar' : 'Tocar'}
        >
          {status === 'playing' ? (
            <FiPause className="w-5 h-5" />
          ) : (
            <FiPlay className="w-5 h-5 ml-0.5" />
          )}
        </button>

        {/* Tempo e Progress Bar */}
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-brand-primary
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:w-4
                     [&::-moz-range-thumb]:h-4
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-brand-primary
                     [&::-moz-range-thumb]:border-0
                     [&::-moz-range-thumb]:cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${(currentTime / duration) * 100}%, var(--interactive-disabled) ${(currentTime / duration) * 100}%, var(--interactive-disabled) 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-theme-tertiary mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Mute */}
        <button
          onClick={toggleMute}
          className="flex-shrink-0 p-2 hover:bg-theme-classical rounded-full transition-colors"
          title={status === 'muted' ? 'Ativar som' : 'Silenciar'}
        >
          {status === 'muted' ? (
            <FiVolumeX className="w-5 h-5 text-theme-secondary" />
          ) : (
            <FiVolume2 className="w-5 h-5 text-brand-primary" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* BANNER DE AVISO */}
      {showBanner && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-gradient-to-r from-brand-primary to-accent-purple text-theme-primary p-4 rounded-lg shadow-2xl backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                <FiVolume2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold mb-1">
                  🎵 Este artigo possui áudio de fundo
                </p>
                <p className="text-xs opacity-90 mb-3">
                  {title || 'Ative o som para uma melhor experiência'}
                </p>
                <button
                  onClick={activateAudio}
                  className="w-full text-theme-primary text-brand-primary px-4 py-2 rounded-lg font-medium text-sm ansition-colors shadow-md"
                >
                  🔊 Ativar Áudio
                </button>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="flex-shrink-0 text-theme-primary transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLAYER MOBILE (expansível) */}
      {(status === 'playing' || status === 'muted') && !showBanner && (
        <div className="lg:hidden w-full fixed bottom-20 left-0 right-0 z-40">
          {showMobilePlayer ? (
            <div className="animate-slide-up">
              <div className="flex justify-end items-center mb-2">
                <button
                  onClick={() => setShowMobilePlayer(false)}
                  className="text-theme-tertiary hover:text-theme-primary transition-colors"
                  aria-label="Recolher player"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
              <AudioPlayer />
            </div>
          ) : (
            <button
              onClick={() => setShowMobilePlayer(true)}
              className="w-full classical-card-simple rounded-t-lg shadow-xl py-3 px-4 flex items-center justify-center space-x-2 hover:bg-theme-classical transition-colors"
              aria-label="Expandir player de áudio"
            >
              <svg
                className="w-5 h-5 text-brand-primary animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              <span className="text-sm font-medium text-theme-primary">
                {status === 'playing' ? 'Áudio tocando' : 'Áudio pausado'}
              </span>
              {status === 'playing' && (
                <div className="flex space-x-1">
                  <div
                    className="w-1 h-3 bg-brand-primary rounded-full animate-pulse"
                    style={{ animationDelay: '0s' }}
                  />
                  <div
                    className="w-1 h-3 bg-brand-primary rounded-full animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className="w-1 h-3 bg-brand-primary rounded-full animate-pulse"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
              )}
            </button>
          )}
        </div>
      )}

      {/* CONTROLE DESKTOP */}
      {(status === 'playing' || status === 'muted') && !showBanner && (
        <div className="hidden lg:block fixed bottom-8 right-8 z-40">
          {showPlayer ? (
            <div className="w-80">
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setShowPlayer(false)}
                  className="text-theme-tertiary hover:text-theme-primary transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <AudioPlayer />
            </div>
          ) : (
            <div
              onClick={() => setShowPlayer(true)}
              className="rounded-full classical-card-simple shadow-2xl p-3 flex items-center space-x-3  hover:shadow-xl transition-all cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowPlayer(true);
                }
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="p-2 hover:bg-theme-classical rounded-full transition-colors"
                title={status === 'muted' ? 'Ativar som' : 'Silenciar'}
              >
                {status === 'muted' ? (
                  <FiVolumeX className="w-5 h-5 text-theme-secondary" />
                ) : (
                  <FiVolume2 className="w-5 h-5 text-brand-primary" />
                )}
              </button>

              {status === 'playing' && (
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div
                      className="w-1 h-4 bg-brand-primary rounded-full animate-pulse"
                      style={{ animationDelay: '0s' }}
                    />
                    <div
                      className="w-1 h-4 bg-brand-primary rounded-full animate-pulse"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <div
                      className="w-1 h-4 bg-brand-primary rounded-full animate-pulse"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                  <span className="text-xs text-theme-secondary">
                    Áudio tocando
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PLAYER INVISÍVEL */}
      {audioType === 'upload' && (
        <audio ref={audioRef} src={audioUrl} loop className="hidden" />
      )}

      {audioType === 'youtube' && (
        <div ref={playerContainerRef} className="hidden" />
      )}

      {/* ✅ ANIMAÇÃO PARA MOBILE */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
