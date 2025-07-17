// app/components/Ads/AdModal.tsx - Modal atualizado para ads popup
'use client';

import { useState, useEffect } from 'react';
import { FiX, FiExternalLink, FiMessageCircle } from 'react-icons/fi';

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

    if (ad.linkType === 'whatsapp' && ad.targetUrl) {
      // Formato WhatsApp com mensagem personalizada
      const whatsappNumber = ad.targetUrl.replace(/\D/g, '');
      const message = `Olá! Vi seu anúncio "${ad.title}" e gostaria de saber mais informações.`;
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } else if (ad.targetUrl) {
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
    <div className="ad-modal-overlay" onClick={handleClose}>
      <div className="ad-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={!canClose}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all ${
            canClose
              ? 'bg-white/20 text-white hover:bg-white/30 cursor-pointer'
              : 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
          }`}
          title={canClose ? 'Fechar' : `Aguarde ${countdown}s`}
        >
          {canClose ? <FiX className="w-4 h-4" /> : countdown}
        </button>

        {/* Ad Content */}
        <div className="cursor-pointer group" onClick={handleClick}>
          {/* Media */}
          <div className="relative overflow-hidden">
            {ad.type === 'VIDEO' && ad.videoUrl ? (
              <video
                src={ad.videoUrl}
                className="ad-modal-image"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : ad.imageUrl ? (
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="ad-modal-image group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="aspect-video bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <h3 className="text-2xl font-bold mb-2">{ad.title}</h3>
                  {ad.description && (
                    <p className="text-lg opacity-90">{ad.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="ad-modal-body">
            <h2 className="ad-modal-title">{ad.title}</h2>

            {ad.description && (
              <p className="ad-modal-description">{ad.description}</p>
            )}

            {/* Advertiser info */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-theme-tertiary">
                Por {ad.advertiserName}
              </span>

              {ad.advertiserWebsite && (
                <a
                  href={ad.advertiserWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Visitar site
                </a>
              )}
            </div>

            {/* CTA Button */}
            {ad.ctaText && (
              <button className="ad-modal-cta group">
                <span>{ad.ctaText}</span>
                {ad.linkType === 'whatsapp' ? (
                  <FiMessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                ) : ad.isExternal ? (
                  <FiExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                ) : null}
              </button>
            )}

            {/* Additional info for WhatsApp */}
            {ad.linkType === 'whatsapp' && (
              <p className="text-xs text-theme-tertiary text-center mt-2">
                Você será redirecionado para o WhatsApp
              </p>
            )}
          </div>
        </div>

        {/* Ad indicator */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
          Publicidade
        </div>
      </div>
    </div>
  );
}
