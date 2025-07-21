// app/components/Ads/AdModal.tsx - Modal premium para publicidades
'use client';

import { useEffect, useState } from 'react';
import {
  FiX,
  FiExternalLink,
  FiMessageCircle,
  FiStar,
  FiMusic,
  FiPlay,
  FiPause,
} from 'react-icons/fi';
import { getResponsiveImageUrl } from '@/app/libs/ads/mediaUtils';
import Image from 'next/image';

interface AdModalProps {
  ad: any;
  onClose: () => void;
  onTrackEvent: (event: string, data?: any) => Promise<void>;
}

export default function AdModal({ ad, onClose, onTrackEvent }: AdModalProps) {
  const [closing, setClosing] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>(
    'desktop'
  );

  // Detectar tipo de dispositivo
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // Trackear impressão do modal
  useEffect(() => {
    onTrackEvent('modal_impression');
  }, [onTrackEvent]);

  // Prevenir scroll no body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = async () => {
    await onTrackEvent('modal_close', { action: 'manual' });
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleCtaClick = async () => {
    await onTrackEvent('modal_cta_click');

    if (ad.linkType === 'whatsapp' && ad.targetUrl) {
      const whatsappUrl = `https://wa.me/${ad.targetUrl.replace(
        /\D/g,
        ''
      )}?text=Olá, vi seu anúncio sobre ${encodeURIComponent(ad.title)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } else if (ad.targetUrl) {
      if (ad.isExternal) {
        window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = ad.targetUrl;
      }
    }

    handleClose();
  };

  const getResponsiveMedia = () => {
    const hasImageVersions =
      ad.imageVersions && typeof ad.imageVersions === 'object';
    const hasVideoVersions =
      ad.videoVersions && typeof ad.videoVersions === 'object';

    if (hasImageVersions) {
      return {
        type: 'image',
        src: getResponsiveImageUrl(ad.imageVersions, deviceType),
        versions: ad.imageVersions,
      };
    } else if (hasVideoVersions) {
      return {
        type: 'video',
        src: getResponsiveImageUrl(ad.videoVersions, deviceType),
        versions: ad.videoVersions,
        thumbnail: ad.thumbnailUrl,
      };
    } else if (ad.imageUrl) {
      return {
        type: 'image',
        src: ad.imageUrl,
      };
    } else if (ad.videoUrl) {
      return {
        type: 'video',
        src: ad.videoUrl,
        thumbnail: ad.thumbnailUrl,
      };
    }
    return null;
  };

  const media = getResponsiveMedia();

  // Auto-close após 15 segundos se não houver interação
  useEffect(() => {
    const timer = setTimeout(async () => {
      await onTrackEvent('modal_close', { action: 'auto_timeout' });
      handleClose();
    }, 15000);

    return () => clearTimeout(timer);
  }, [onTrackEvent]);

  return (
    <div
      className={`ad-premium-modal-overlay ${
        closing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleBackdropClick}
      style={{ transition: 'opacity 0.3s ease-out' }}
    >
      <div
        className={`ad-premium-modal ${
          closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          transformOrigin: 'center center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="ad-close-btn"
          title="Fechar"
          aria-label="Fechar anúncio"
        >
          <FiX className="w-4 h-4 text-white" />
        </button>

        {/* Media Section */}
        {media && (
          <div className="relative overflow-hidden">
            {media.type === 'image' ? (
              <Image
                src={media.src}
                alt={ad.title}
                width={600}
                height={400}
                className="ad-image w-full aspect-[3/2] object-cover"
                priority
                sizes="(max-width: 640px) 100vw, 600px"
              />
            ) : (
              <div className="relative">
                <video
                  src={media.src}
                  className="w-full aspect-[3/2] object-cover"
                  poster={media.thumbnail}
                  autoPlay={videoPlaying}
                  muted
                  loop
                  playsInline
                  onPlay={() => {
                    setVideoPlaying(true);
                    onTrackEvent('modal_video_play');
                  }}
                  onPause={() => setVideoPlaying(false)}
                />

                {/* Play/Pause overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const video =
                        e.currentTarget.parentElement?.querySelector('video');
                      if (video) {
                        if (video.paused) {
                          video.play();
                        } else {
                          video.pause();
                        }
                      }
                    }}
                    className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    {videoPlaying ? (
                      <FiPause className="w-6 h-6 text-white" />
                    ) : (
                      <FiPlay className="w-6 h-6 text-white ml-1" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Gradient overlay para melhor legibilidade do conteúdo */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-50" />

            {/* Ornamentos flutuantes */}
            <div className="absolute top-4 right-4 opacity-20">
              <FiMusic className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="absolute top-8 right-12 opacity-10">
              <FiStar
                className="w-4 h-4 text-white animate-pulse"
                style={{ animationDelay: '1s' }}
              />
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="ad-content">
          {/* Premium badge */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              ✨ PREMIUM
            </div>
          </div>

          {/* Title */}
          <h2 className="ad-title text-center mb-4">{ad.title}</h2>

          {/* Description */}
          {ad.description && (
            <p className="ad-description text-center mb-6 max-w-md mx-auto">
              {ad.description}
            </p>
          )}

          {/* Extended content if available */}
          {ad.content && (
            <div className="text-center text-theme-secondary mb-6 text-sm leading-relaxed max-w-lg mx-auto">
              <div dangerouslySetInnerHTML={{ __html: ad.content }} />
            </div>
          )}

          {/* Advertiser info */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-theme-secondary/50 rounded-full backdrop-blur">
              <FiMusic className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-medium text-theme-primary">
                {ad.advertiserName}
              </span>
              {ad.advertiserWebsite && (
                <a
                  href={ad.advertiserWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:text-brand-secondary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrackEvent('modal_website_click');
                  }}
                >
                  <FiExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* CTA Button */}
          {ad.ctaText && (
            <div className="text-center">
              <button onClick={handleCtaClick} className="ad-cta-button group">
                <span className="flex items-center justify-center space-x-2">
                  {ad.linkType === 'whatsapp' ? (
                    <>
                      <FiMessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>{ad.ctaText}</span>
                    </>
                  ) : (
                    <>
                      <FiStar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>{ad.ctaText}</span>
                      {ad.isExternal && (
                        <FiExternalLink className="w-4 h-4 ml-1 opacity-80" />
                      )}
                    </>
                  )}
                </span>
              </button>
            </div>
          )}

          {/* Secondary actions */}
          <div className="flex justify-center space-x-4 mt-6 text-sm">
            <button
              onClick={handleClose}
              className="text-theme-tertiary hover:text-theme-primary transition-colors"
            >
              Fechar
            </button>

            {ad.advertiserWebsite && (
              <a
                href={ad.advertiserWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-theme-tertiary hover:text-brand-primary transition-colors flex items-center space-x-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onTrackEvent('modal_learn_more_click');
                }}
              >
                <span>Saiba mais</span>
                <FiExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Progress bar (tempo restante) */}
          <div className="mt-8 px-4">
            <div className="w-full bg-theme-secondary/30 h-1 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-all duration-300 ease-out"
                style={{
                  animation: 'progressBar 15s linear forwards',
                  transformOrigin: 'left',
                }}
              />
            </div>
            <p className="text-center text-xs text-theme-tertiary mt-2 opacity-60">
              Fechará automaticamente
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-2 -left-2 w-6 h-6 border-l-4 border-t-4 border-brand-primary opacity-30 transform -rotate-45" />
        <div className="absolute -top-2 -right-2 w-6 h-6 border-r-4 border-t-4 border-brand-primary opacity-30 transform rotate-45" />
        <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-4 border-b-4 border-brand-primary opacity-30 transform rotate-45" />
        <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-4 border-b-4 border-brand-primary opacity-30 transform -rotate-45" />
      </div>

      <style jsx>{`
        @keyframes progressBar {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }

        .ad-premium-modal-overlay {
          backdrop-filter: blur(12px);
          background: rgba(0, 0, 0, 0.85);
        }

        .ad-premium-modal {
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
        }

        .ad-premium-modal::-webkit-scrollbar {
          width: 6px;
        }

        .ad-premium-modal::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .ad-premium-modal::-webkit-scrollbar-thumb {
          background: linear-gradient(
            135deg,
            var(--ad-gold-primary),
            var(--ad-gold-secondary)
          );
          border-radius: 3px;
        }

        .ad-premium-modal::-webkit-scrollbar-thumb:hover {
          background: var(--ad-gold-primary);
        }
      `}</style>
    </div>
  );
}
