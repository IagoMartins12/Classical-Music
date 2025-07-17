// app/components/Ads/AdDisplay.tsx - Componente atualizado para exibir publicidades
'use client';

import { useFrontAds } from '@/app/hooks/useFrontAds';
import React, { useEffect, useRef, useState } from 'react';
import { FiExternalLink, FiX, FiMessageCircle, FiEye } from 'react-icons/fi';

interface AdDisplayProps {
  placement: string;
  targetType?: string;
  instrumentId?: string;
  userLevel?: string;
  className?: string;
  maxAds?: number;
  showTitle?: boolean;
  showAdvertiserName?: boolean;
}

export default function AdDisplay({
  placement,
  targetType = 'GENERAL',
  instrumentId,
  userLevel = 'ALL',
  className = '',
  maxAds = 1,
  showTitle = true,
  showAdvertiserName = true,
}: AdDisplayProps) {
  const { ads, loading, trackEvent } = useFrontAds({
    placement,
    targetType,
    instrumentId,
    userLevel,
  });

  const [visibleAds, setVisibleAds] = useState<string[]>([]);
  const [hoveredAd, setHoveredAd] = useState<string | null>(null);
  const [hoverStartTime, setHoverStartTime] = useState<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const adRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Configurar observer para tracking de impressões
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const adId = entry.target.getAttribute('data-ad-id');
          if (adId && entry.isIntersecting && !visibleAds.includes(adId)) {
            setVisibleAds((prev) => [...prev, adId]);
            trackEvent(adId, 'impression');
          }
        });
      },
      { threshold: 0.5 }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [trackEvent, visibleAds]);

  // Observar ads quando mudarem
  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;

    observer.disconnect();
    adRefs.current.forEach((element) => {
      observer.observe(element);
    });
  }, [ads]);

  const handleAdClick = async (ad: any) => {
    await trackEvent(ad.id, 'click');

    if (ad.linkType === 'whatsapp' && ad.targetUrl) {
      // Formato WhatsApp: https://wa.me/5511999999999?text=Olá, vi seu anúncio
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
  };

  const handleMouseEnter = (adId: string) => {
    setHoveredAd(adId);
    setHoverStartTime(Date.now());
  };

  const handleMouseLeave = async (adId: string) => {
    if (hoverStartTime) {
      const duration = Date.now() - hoverStartTime;
      if (duration > 1000) {
        await trackEvent(adId, 'hover', { duration });
      }
    }
    setHoveredAd(null);
    setHoverStartTime(null);
  };

  if (loading || ads.length === 0) {
    return null;
  }

  const adsToShow = ads.slice(0, maxAds);

  return (
    <div className={`ads-container ${className}`}>
      {adsToShow.map((ad) => (
        <AdItem
          key={ad.id}
          ad={ad}
          placement={placement}
          showTitle={showTitle}
          showAdvertiserName={showAdvertiserName}
          isHovered={hoveredAd === ad.id}
          onClick={() => handleAdClick(ad)}
          onMouseEnter={() => handleMouseEnter(ad.id)}
          onMouseLeave={() => handleMouseLeave(ad.id)}
          ref={(el) => {
            if (el) {
              adRefs.current.set(ad.id, el);
            } else {
              adRefs.current.delete(ad.id);
            }
          }}
        />
      ))}
    </div>
  );
}

// Componente individual para cada ad
const AdItem = React.forwardRef<
  HTMLDivElement,
  {
    ad: any;
    placement: string;
    showTitle: boolean;
    showAdvertiserName: boolean;
    isHovered: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  }
>(
  (
    {
      ad,
      placement,
      showTitle,
      showAdvertiserName,
      isHovered,
      onClick,
      onMouseEnter,
      onMouseLeave,
    },
    ref
  ) => {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    // Renderização específica por placement
    if (placement === 'HEADER') {
      return (
        <HeaderAdItem
          ref={ref}
          ad={ad}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onDismiss={() => setDismissed(true)}
        />
      );
    }

    if (placement === 'MODAL') {
      return null; // Modal é tratado separadamente
    }

    // Layout padrão para sidebar e outros
    return (
      <div
        ref={ref}
        data-ad-id={ad.id}
        data-target={ad.targetType}
        className={`
          ad-item classical-card group cursor-pointer
          ${
            isHovered
              ? 'transform scale-[1.02] shadow-theme-glow'
              : 'hover:shadow-theme-medium'
          }
          ${
            placement === 'SIDEBAR_RIGHT' || placement === 'SIDEBAR_LEFT'
              ? 'max-w-[300px]'
              : 'w-full'
          }
          ${placement === 'BETWEEN_CONTENT' ? 'my-8' : ''}
        `}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        role="button"
        tabIndex={0}
        aria-label={`Anúncio: ${ad.title}`}
      >
        {/* Dismiss Button */}
        {placement !== 'MODAL' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            title="Fechar anúncio"
          >
            <FiX className="w-3 h-3" />
          </button>
        )}

        {/* Image */}
        {ad.imageUrl && (
          <div className="relative overflow-hidden">
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className={`
                w-full object-cover transition-transform duration-300 group-hover:scale-105
                ${
                  placement === 'SIDEBAR_RIGHT' || placement === 'SIDEBAR_LEFT'
                    ? 'aspect-video rounded-t-xl'
                    : 'aspect-[2/1] rounded-t-xl'
                }
              `}
              loading="lazy"
            />

            {/* Overlay com conteúdo */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
              {placement !== 'SIDEBAR_RIGHT' &&
                placement !== 'SIDEBAR_LEFT' && (
                  <>
                    {showTitle && (
                      <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
                        {ad.title}
                      </h3>
                    )}
                    {ad.description && (
                      <p className="text-white/90 text-sm mb-2 line-clamp-2">
                        {ad.description}
                      </p>
                    )}
                  </>
                )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {(placement === 'SIDEBAR_RIGHT' ||
            placement === 'SIDEBAR_LEFT' ||
            !ad.imageUrl) && (
            <>
              {showTitle && (
                <h3 className="font-semibold text-theme-primary mb-2 group-hover:text-brand-primary transition-colors line-clamp-2">
                  {ad.title}
                </h3>
              )}

              {ad.description && (
                <p className="text-sm text-theme-secondary mb-3 line-clamp-3">
                  {ad.description}
                </p>
              )}
            </>
          )}

          <div className="flex items-center justify-between">
            {showAdvertiserName && (
              <span className="text-xs text-theme-tertiary">
                {ad.advertiserName}
              </span>
            )}

            {ad.ctaText && (
              <div className="flex items-center space-x-1 text-brand-primary text-sm font-medium">
                <span>{ad.ctaText}</span>
                {ad.linkType === 'whatsapp' ? (
                  <FiMessageCircle className="w-3 h-3" />
                ) : ad.isExternal ? (
                  <FiExternalLink className="w-3 h-3" />
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

// Componente específico para Header
const HeaderAdItem = React.forwardRef<
  HTMLDivElement,
  {
    ad: any;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onDismiss: () => void;
  }
>(({ ad, onClick, onMouseEnter, onMouseLeave, onDismiss }, ref) => {
  return (
    <div
      ref={ref}
      data-ad-id={ad.id}
      className="ad-container-header group"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="button"
      tabIndex={0}
      aria-label={`Anúncio: ${ad.title}`}
    >
      {/* Dismiss Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="absolute top-2 right-2 w-6 h-6 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
        title="Fechar"
      >
        <FiX className="w-3 h-3" />
      </button>

      {/* Header Content */}
      <div className="ad-content">
        <div className="flex items-center space-x-4">
          {ad.imageUrl && (
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}

          <div>
            <h3 className="ad-title group-hover:underline">{ad.title}</h3>
            {ad.description && <p className="ad-tagline">{ad.description}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {ad.ctaText && <span className="ad-cta">{ad.ctaText}</span>}

          {ad.linkType === 'whatsapp' ? (
            <FiMessageCircle className="w-4 h-4 text-white/80" />
          ) : ad.isExternal ? (
            <FiExternalLink className="w-4 h-4 text-white/80" />
          ) : null}
        </div>
      </div>
    </div>
  );
});

AdItem.displayName = 'AdItem';
HeaderAdItem.displayName = 'HeaderAdItem';
