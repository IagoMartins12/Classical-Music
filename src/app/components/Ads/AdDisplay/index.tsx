// app/components/Ads/AdDisplay.tsx - Componente para exibir publicidades
'use client';

import { useFrontAds } from '@/app/hooks/useFrontAds';
import React, { useEffect, useRef, useState } from 'react';
import { FiExternalLink, FiX } from 'react-icons/fi';

interface AdDisplayProps {
  placement: string;
  targetType?: string;
  instrumentIds?: string[];
  composerIds?: string[];
  epochIds?: string[];
  className?: string;
  maxAds?: number;
  showTitle?: boolean;
  showAdvertiserName?: boolean;
}

export default function AdDisplay({
  placement,
  targetType,
  instrumentIds,
  composerIds,
  epochIds,
  className = '',
  maxAds = 1,
  showTitle = true,
  showAdvertiserName = true,
}: AdDisplayProps) {
  const { ads, loading, trackEvent } = useFrontAds({
    placement,
    targetType,
    instrumentIds,
    composerIds,
    epochIds,
  });

  console.log('ads', ads);
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
      { threshold: 0.5 } // Ad deve estar 50% visível
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [trackEvent, visibleAds]);

  // Observar ads quando mudarem
  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;

    // Limpar observações anteriores
    observer.disconnect();

    // Observar novos ads
    adRefs.current.forEach((element) => {
      observer.observe(element);
    });
  }, [ads]);

  const handleAdClick = async (ad: any) => {
    await trackEvent(ad.id, 'click');

    if (ad.targetUrl) {
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
        // Só trackear se hover durou mais de 1 segundo
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

    const mainMedia = ad.mediaFiles?.find((media: any) => media.isMain) || null;

    return (
      <div
        ref={ref}
        data-ad-id={ad.id}
        className={`
        ad-item relative bg-theme-elevated border border-theme-primary rounded-xl overflow-hidden
        transition-all duration-300 cursor-pointer group
        ${isHovered ? 'transform scale-[1.02] shadow-xl' : 'hover:shadow-lg'}
        ${ad.type === 'BANNER' ? 'aspect-[3/1]' : 'aspect-video'}
      `}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Dismiss Button */}
        {ad.placement !== 'MODAL' && (
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

        {/* Media Content */}
        <div className="relative w-full h-full">
          {ad.type === 'VIDEO' && ad.videoUrl ? (
            <video
              src={ad.videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : mainMedia?.type === 'IMAGE' || ad.imageUrl ? (
            <img
              src={mainMedia?.url || ad.imageUrl}
              alt={mainMedia?.altText || ad.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-xl font-bold mb-2">{ad.title}</h3>
                {ad.tagline && (
                  <p className="text-sm opacity-90">{ad.tagline}</p>
                )}
              </div>
            </div>
          )}

          {/* Overlay Content */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
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

            <div className="flex items-center justify-between">
              {showAdvertiserName && (
                <span className="text-white/80 text-xs">
                  {ad.advertiserName}
                </span>
              )}

              {ad.ctaText && (
                <div className="flex items-center space-x-1 text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  <span>{ad.ctaText}</span>
                  {ad.isExternal && <FiExternalLink className="w-3 h-3" />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AdItem.displayName = 'AdItem';
