// ============================================
// QuoteMusicalExtension - COM PLAYER CUSTOMIZADO (corrigido)
// ============================================

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';
import { MdFormatQuote } from 'react-icons/md';
import { BiMusic, BiPause, BiPlay } from 'react-icons/bi';
import { FiVolume2 } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';

// Declaração do tipo para YouTube Player API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const QuoteMusicalComponent = (props: any) => {
  const { node, deleteNode } = props;
  const {
    quote,
    author,
    backgroundAudioUrl,
    backgroundAudioType,
    backgroundAudioVolume,
  } = node.attrs;

  const [mounted, setMounted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(backgroundAudioVolume || 30);
  const [showPlayer, setShowPlayer] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Garantir que o componente só renderize no client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Extrair ID do YouTube
  const extractYoutubeId = (url: string) => {
    const match = url.match(/embed\/([^?]+)/);
    return match ? match[1] : null;
  };

  // Carregar YouTube IFrame API
  useEffect(() => {
    if (!mounted) return;

    if (backgroundAudioUrl && backgroundAudioType === 'youtube') {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = () => {
          initializePlayer();
        };
      } else {
        initializePlayer();
      }
    }

    return () => {
      if (youtubePlayerRef.current && youtubePlayerRef.current.destroy) {
        youtubePlayerRef.current.destroy();
        youtubePlayerRef.current = null;
      }
    };
  }, [mounted, backgroundAudioUrl, backgroundAudioType]);

  const initializePlayer = () => {
    const youtubeId = extractYoutubeId(backgroundAudioUrl);
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
          loop: 1,
          playlist: youtubeId,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(volume);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              setIsPlaying(false);
              if (event.data === window.YT.PlayerState.ENDED) {
                event.target.playVideo();
              }
            }
          },
        },
      }
    );
  };

  const togglePlay = () => {
    if (backgroundAudioType === 'upload' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (backgroundAudioType === 'youtube' && youtubePlayerRef.current) {
      if (isPlaying) {
        youtubePlayerRef.current.pauseVideo();
      } else {
        youtubePlayerRef.current.playVideo();
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (backgroundAudioType === 'upload' && audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    } else if (backgroundAudioType === 'youtube' && youtubePlayerRef.current) {
      youtubePlayerRef.current.setVolume(newVolume);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Remover citação musical?')) {
      deleteNode();
    }
  };

  return (
    <NodeViewWrapper
      className="quote-musical my-8 relative"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="relative classical-card p-8 border-l-4 border-accent-purple">
        {/* Controles de Edição */}
        {showControls && (
          <div className="absolute top-2 right-2 z-20 flex items-center space-x-2 p-2 shadow-lg rounded-lg">
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Remover"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quote Icon */}
        <MdFormatQuote className="absolute top-4 right-4 w-12 h-12 text-theme-tertiary opacity-20" />

        {/* Quote */}
        <blockquote className="relative z-10">
          <p className="text-2xl font-serif italic text-theme-primary mb-4">
            &quot;{quote}&quot;
          </p>
          <footer className="flex items-center justify-between flex-wrap gap-4">
            <cite className="text-lg font-semibold text-brand-primary not-italic">
              — {author}
            </cite>

            {mounted && backgroundAudioUrl && (
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowPlayer(!showPlayer);
                  }}
                  className="flex items-center space-x-2 text-sm text-accent-purple hover:text-brand-primary transition-colors"
                >
                  <BiMusic className="w-5 h-5" />
                  <span>{showPlayer ? 'Ocultar' : 'Mostrar'} controles</span>
                </button>
              </div>
            )}
          </footer>
        </blockquote>

        {/* Player de Áudio — NÃO desmonta mais, só esconde */}
        <div
          className={`mt-6 p-4 rounded-lg classical-card-simple transition-all duration-200 ${
            showPlayer && backgroundAudioUrl ? 'block' : 'hidden'
          }`}
        >
          <div className="flex items-center space-x-4">
            {/* Play/Pause */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                togglePlay();
              }}
              className="p-2 bg-accent-purple text-white rounded-full hover:opacity-90 transition-opacity"
            >
              {isPlaying ? (
                <BiPause className="w-5 h-5" />
              ) : (
                <BiPlay className="w-5 h-5" />
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center space-x-2 flex-1">
              <FiVolume2 className="w-5 h-5 text-theme-secondary" />
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--accent-purple) 0%, var(--accent-purple) ${volume}%, #e5e7eb ${volume}%, #e5e7eb 100%)`,
                }}
              />
              <span className="text-xs text-theme-tertiary w-10 text-right">
                {volume}%
              </span>
            </div>
          </div>
          <p className="text-xs text-theme-tertiary mt-2 text-center">
            🎵 Música de fundo em loop
          </p>
        </div>

        {/* Hidden Audio Element (para upload) */}
        {mounted && backgroundAudioUrl && backgroundAudioType === 'upload' && (
          <audio
            ref={audioRef}
            src={backgroundAudioUrl}
            loop
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />
        )}

        {/* Hidden YouTube Player (para youtube) */}
        {mounted && backgroundAudioUrl && backgroundAudioType === 'youtube' && (
          <div ref={playerContainerRef} className="hidden" />
        )}
      </div>
    </NodeViewWrapper>
  );
};

export const QuoteMusicalExtension = Node.create({
  name: 'quoteMusical',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      quote: { default: '' },
      author: { default: '' },
      backgroundAudioUrl: { default: null },
      backgroundAudioType: { default: 'upload' },
      backgroundAudioVolume: { default: 30 },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="quote-musical"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'quote-musical' }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(QuoteMusicalComponent);
  },
});
