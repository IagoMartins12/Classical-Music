// ============================================
// AudioPlayerExtension - COM UPLOAD/YOUTUBE (ÁUDIO APENAS)
// ============================================
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';
import { BiPause, BiPlay } from 'react-icons/bi';
import { FiVolume2, FiMusic } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';
import Link from 'next/link';

// Declaração do tipo para YouTube Player API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const AudioPlayerComponent = (props: any) => {
  const { node, deleteNode } = props;
  const {
    audioUrl,
    audioType,
    title,
    composerId,
    composerName,
    workId,
    workTitle,
  } = node.attrs;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [volume, setVolume] = useState(70);
  const audioRef = useRef<HTMLAudioElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Extrair ID do YouTube
  const extractYoutubeId = (url: string) => {
    const match = url.match(/embed\/([^?]+)/);
    return match ? match[1] : null;
  };

  // Carregar YouTube IFrame API
  useEffect(() => {
    if (audioType === 'youtube') {
      // Verifica se a API já está carregada
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
          initializePlayer();
        };
      } else {
        initializePlayer();
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
      }
    };
  }, [audioType]);

  const initializePlayer = () => {
    const youtubeId = extractYoutubeId(audioUrl);
    if (!youtubeId || !playerContainerRef.current) return;

    youtubePlayerRef.current = new window.YT.Player(
      playerContainerRef.current,
      {
        height: '0',
        width: '0',
        videoId: youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event: any) => {
            setDuration(event.target.getDuration());
            event.target.setVolume(volume);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startProgressTracking();
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              setIsPlaying(false);
              stopProgressTracking();
            }
          },
        },
      }
    );
  };

  const startProgressTracking = () => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      if (youtubePlayerRef.current && youtubePlayerRef.current.getCurrentTime) {
        setCurrentTime(youtubePlayerRef.current.getCurrentTime());
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const togglePlay = (e: any) => {
    e.stopPropagation();
    if (audioType === 'upload' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (audioType === 'youtube' && youtubePlayerRef.current) {
      if (isPlaying) {
        youtubePlayerRef.current.pauseVideo();
      } else {
        youtubePlayerRef.current.playVideo();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    if (audioType === 'upload' && audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    } else if (audioType === 'youtube' && youtubePlayerRef.current) {
      youtubePlayerRef.current.setVolume(newVolume);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);

    if (audioType === 'upload' && audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    } else if (audioType === 'youtube' && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(time, true);
      setCurrentTime(time);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Remover player de áudio?')) {
      deleteNode();
    }
  };

  return (
    <NodeViewWrapper
      className="audio-player my-6 relative"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="rounded-lg classical-card-simple border-l-4 border-accent-purple shadow-md overflow-hidden">
        {/* Controles de Edição */}
        {showControls && (
          <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 p-2 shadow-lg rounded-lg">
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Remover"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-accent-purple to-brand-primary rounded-lg flex items-center justify-center shadow-md">
              <FiMusic className="w-7 h-7 text-white" />
            </div>

            <div className="flex-1">
              <h4 className="text-lg font-bold text-theme-primary">{title}</h4>

              {/* Vinculações */}
              <div className="flex items-center space-x-2 text-sm text-theme-secondary mt-1">
                {composerName && (
                  <>
                    {composerId ? (
                      <Link
                        href={`/composer/${composerId}`}
                        target="_blank"
                        className="text-accent-purple hover:underline"
                      >
                        {composerName}
                      </Link>
                    ) : (
                      <span>{composerName}</span>
                    )}
                  </>
                )}

                {workTitle && (
                  <>
                    <span className="text-theme-tertiary">•</span>
                    {workId ? (
                      <Link
                        href={`/works/${workId}`}
                        target="_blank"
                        className="text-accent-purple hover:underline"
                      >
                        {workTitle}
                      </Link>
                    ) : (
                      <span>{workTitle}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Player Unificado - Mesmo visual para Upload e YouTube */}
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              {/* Play/Pause Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  togglePlay(e);
                }}
                className="p-3 bg-accent-purple text-white rounded-full hover:opacity-90 transition-opacity shadow-md"
              >
                {isPlaying ? (
                  <BiPause className="w-6 h-6" />
                ) : (
                  <BiPlay className="w-6 h-6" />
                )}
              </button>

              {/* Progress Bar */}
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--accent-purple) 0%, var(--accent-purple) ${
                      (currentTime / duration) * 100
                    }%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-theme-tertiary mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-2 w-24">
                <FiVolume2 className="w-5 h-5 text-theme-secondary" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--accent-purple) 0%, var(--accent-purple) ${volume}%, #e5e7eb ${volume}%, #e5e7eb 100%)`,
                  }}
                />
              </div>
            </div>

            {/* Hidden Audio Element (para upload) */}
            {audioType === 'upload' && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            )}

            {/* Hidden YouTube Player (para youtube) */}
            {audioType === 'youtube' && (
              <div ref={playerContainerRef} className="hidden" />
            )}
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const AudioPlayerExtension = Node.create({
  name: 'audioPlayer',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      audioUrl: {
        default: null,
      },
      audioType: {
        default: 'upload', // 'upload' ou 'youtube'
      },
      title: {
        default: 'Áudio sem título',
      },
      composerId: {
        default: null,
      },
      composerName: {
        default: null,
      },
      workId: {
        default: null,
      },
      workTitle: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="audio-player"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'audio-player' }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioPlayerComponent);
  },
});
