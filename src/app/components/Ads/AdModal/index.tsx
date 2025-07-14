// app/components/Ads/AdModal.tsx - Modal para ads popup
'use client';

import { useState, useEffect } from 'react';
import { FiX, FiExternalLink } from 'react-icons/fi';

interface AdModalProps {
  ad: any;
  onClose: () => void;
  onTrackEvent: (event: string, data?: any) => void;
}

export default function AdModal({ ad, onClose, onTrackEvent }: AdModalProps) {
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    // Registrar impressão
    onTrackEvent('impression');

    // Countdown para permitir fechar
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTrackEvent]);

  const handleClick = () => {
    onTrackEvent('click');

    if (ad.targetUrl) {
      if (ad.isExternal) {
        window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = ad.targetUrl;
      }
    }
  };

  const handleClose = () => {
    if (canClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-theme-elevated border border-theme-primary rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={!canClose}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all ${
            canClose
              ? 'bg-white/20 text-white hover:bg-white/30'
              : 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
          }`}
          title={canClose ? 'Fechar' : `Aguarde ${countdown}s`}
        >
          {canClose ? <FiX className="w-4 h-4" /> : countdown}
        </button>

        {/* Ad Content */}
        <div className="cursor-pointer group" onClick={handleClick}>
          {/* Media */}
          <div className="relative aspect-video overflow-hidden">
            {ad.type === 'VIDEO' && ad.videoUrl ? (
              <video
                src={ad.videoUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : ad.imageUrl ? (
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">{ad.title}</h3>
                  {ad.tagline && (
                    <p className="text-lg opacity-90">{ad.tagline}</p>
                  )}
                </div>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-theme-primary mb-2">
              {ad.title}
            </h2>

            {ad.description && (
              <p className="text-theme-secondary mb-4 leading-relaxed">
                {ad.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-theme-tertiary">
                Por {ad.advertiserName}
              </span>

              {ad.ctaText && (
                <div className="flex items-center space-x-2 text-brand-primary font-medium">
                  <span>{ad.ctaText}</span>
                  {ad.isExternal && <FiExternalLink className="w-4 h-4" />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
