// app/components/Ads/AdDisplay.tsx - Componente premium com mídia responsiva
'use client';

import { useFrontAds } from '@/app/hooks/useFrontAds';
import React, { useEffect, useRef, useState } from 'react';
import {
  FiExternalLink,
  FiX,
  FiMessageCircle,
  FiPlay,
  FiStar,
  FiMusic,
} from 'react-icons/fi';
import {
  getResponsiveImageUrl,
  getImageSrcSet,
} from '@/app/libs/ads/mediaUtils';
import Image from 'next/image';

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
  const [dismissedAds, setDismissedAds] = useState<string[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const adRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Hook para detectar tipo de dispositivo
  const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>(
    'desktop'
  );

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

  const handleDismiss = (adId: string) => {
    setDismissedAds([...dismissedAds, adId]);
  };

  const getResponsiveMedia = (ad: any) => {
    const hasImageVersions =
      ad.imageVersions && typeof ad.imageVersions === 'object';
    const hasVideoVersions =
      ad.videoVersions && typeof ad.videoVersions === 'object';

    if (hasImageVersions) {
      return {
        type: 'image',
        src: getResponsiveImageUrl(ad.imageVersions, deviceType),
        srcSet: getImageSrcSet(ad.imageVersions),
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

  if (loading || ads.length === 0) {
    return null;
  }

  const adsToShow = ads
    .filter((ad) => !dismissedAds.includes(ad.id))
    .slice(0, maxAds);

  if (adsToShow.length === 0) {
    return null;
  }

  return (
    <div className={`ads-container ${className}`}>
      {adsToShow.map((ad) => (
        <PremiumAdItem
          key={ad.id}
          ad={ad}
          placement={placement}
          deviceType={deviceType}
          showTitle={showTitle}
          showAdvertiserName={showAdvertiserName}
          isHovered={hoveredAd === ad.id}
          onClick={() => handleAdClick(ad)}
          onMouseEnter={() => handleMouseEnter(ad.id)}
          onMouseLeave={() => handleMouseLeave(ad.id)}
          onDismiss={() => handleDismiss(ad.id)}
          media={getResponsiveMedia(ad)}
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

// Componente individual premium para cada ad
const PremiumAdItem = React.forwardRef<
  HTMLDivElement,
  {
    ad: any;
    placement: string;
    deviceType: 'desktop' | 'tablet' | 'mobile';
    showTitle: boolean;
    showAdvertiserName: boolean;
    isHovered: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onDismiss: () => void;
    media: any;
  }
>(
  (
    {
      ad,
      placement,
      deviceType,
      showTitle,
      showAdvertiserName,
      isHovered,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onDismiss,
      media,
    },
    ref
  ) => {
    // Renderização específica por placement com design premium
    if (placement === 'HEADER') {
      return (
        <HeaderPremiumAd
          ref={ref}
          ad={ad}
          media={media}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onDismiss={onDismiss}
        />
      );
    }

    if (placement === 'SIDEBAR_RIGHT' || placement === 'SIDEBAR_LEFT') {
      return (
        <SidebarPremiumAd
          ref={ref}
          ad={ad}
          media={media}
          showTitle={showTitle}
          showAdvertiserName={showAdvertiserName}
          isHovered={isHovered}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onDismiss={onDismiss}
        />
      );
    }

    if (
      placement === 'BETWEEN_CONTENT' ||
      placement === 'CONTENT_TOP' ||
      placement === 'CONTENT_BOTTOM'
    ) {
      return (
        <ContentPremiumAd
          ref={ref}
          ad={ad}
          media={media}
          placement={placement}
          showTitle={showTitle}
          showAdvertiserName={showAdvertiserName}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onDismiss={onDismiss}
        />
      );
    }

    // Layout padrão premium
    return (
      <div
        ref={ref}
        data-ad-id={ad.id}
        className="ad-premium-container cursor-pointer"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        role="button"
        tabIndex={0}
        aria-label={`Anúncio: ${ad.title}`}
      >
        {/* Ornamentos decorativos */}
        <div className="ad-ornament"></div>
        <div className="ad-ornament"></div>

        {/* Dismiss Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="absolute top-3 right-3 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 z-10"
          title="Fechar anúncio"
        >
          <FiX className="w-4 h-4" />
        </button>

        {/* Media */}
        {media && (
          <div className="relative overflow-hidden rounded-t-2xl">
            {media.type === 'image' ? (
              <Image
                src={media.src}
                alt={ad.title}
                width={400}
                height={300}
                className="ad-image w-full h-48 object-cover transition-transform duration-500"
                sizes={
                  media.srcSet
                    ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                    : undefined
                }
                priority={placement === 'HEADER'}
              />
            ) : (
              <div className="relative">
                <video
                  src={media.src}
                  className="ad-image w-full h-48 object-cover"
                  muted
                  loop
                  playsInline
                  poster={media.thumbnail}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                    <FiPlay className="w-5 h-5 text-white ml-1" />
                  </div>
                </div>
              </div>
            )}

            {/* Overlay gradiente */}
            <div className="ad-image-overlay absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
          </div>
        )}

        {/* Content */}
        <div className="ad-content p-6">
          {showTitle && (
            <h3 className="ad-title text-xl font-bold mb-3 leading-tight">
              {ad.title}
            </h3>
          )}

          {ad.description && (
            <p className="ad-description text-base mb-4 leading-relaxed">
              {ad.description}
            </p>
          )}

          <div className="ad-footer">
            {showAdvertiserName && (
              <span className="ad-advertiser text-xs">{ad.advertiserName}</span>
            )}

            {ad.ctaText && (
              <div className="ad-cta-text flex items-center gap-2">
                <span>{ad.ctaText}</span>
                {ad.linkType === 'whatsapp' ? (
                  <FiMessageCircle className="w-4 h-4" />
                ) : ad.isExternal ? (
                  <FiExternalLink className="w-4 h-4" />
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

// Componente específico para Header Premium
const HeaderPremiumAd = React.forwardRef<
  HTMLDivElement,
  {
    ad: any;
    media: any;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onDismiss: () => void;
  }
>(({ ad, media, onClick, onMouseEnter, onMouseLeave, onDismiss }, ref) => {
  return (
    <div
      ref={ref}
      data-ad-id={ad.id}
      className="ad-premium-header cursor-pointer group"
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
        className="absolute top-4 right-4 w-8 h-8 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
        title="Fechar"
      >
        <FiX className="w-4 h-4" />
      </button>

      {/* Content */}
      <div className="ad-content">
        <div className="flex items-center gap-4">
          {media && (
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={media.src}
                alt={ad.title}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-1">
            <h3 className="ad-title group-hover:underline">{ad.title}</h3>
            {ad.description && <p className="ad-subtitle">{ad.description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {ad.ctaText && (
            <button className="ad-cta-button">
              <FiStar className="w-4 h-4" />
              {ad.ctaText}
            </button>
          )}

          {ad.linkType === 'whatsapp' ? (
            <FiMessageCircle className="w-5 h-5 text-white/80" />
          ) : ad.isExternal ? (
            <FiExternalLink className="w-5 h-5 text-white/80" />
          ) : null}
        </div>
      </div>
    </div>
  );
});

// Componente específico para Sidebar Premium
const SidebarPremiumAd = React.forwardRef<
  HTMLDivElement,
  {
    ad: any;
    media: any;
    showTitle: boolean;
    showAdvertiserName: boolean;
    isHovered: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onDismiss: () => void;
  }
>(
  (
    {
      ad,
      media,
      showTitle,
      showAdvertiserName,
      isHovered,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onDismiss,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-ad-id={ad.id}
        className="ad-premium-sidebar cursor-pointer group"
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
          className="absolute top-3 right-3 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
          title="Fechar anúncio"
        >
          <FiX className="w-3 h-3" />
        </button>

        {/* Media */}
        {media && (
          <div className="ad-image-container">
            {media.type === 'image' ? (
              <Image
                src={media.src}
                alt={ad.title}
                width={300}
                height={200}
                className="ad-image"
                sizes="(max-width: 1024px) 100vw, 300px"
              />
            ) : (
              <video
                src={media.src}
                className="ad-image"
                muted
                loop
                playsInline
                poster={media.thumbnail}
              />
            )}

            <div className="ad-image-overlay">
              <FiMusic className="w-8 h-8 text-white" />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="ad-content">
          {showTitle && <h3 className="ad-title">{ad.title}</h3>}

          {ad.description && <p className="ad-description">{ad.description}</p>}

          <div className="ad-footer">
            {showAdvertiserName && (
              <span className="ad-advertiser">{ad.advertiserName}</span>
            )}

            {ad.ctaText && (
              <div className="ad-cta-text">
                <span>{ad.ctaText}</span>
                {ad.linkType === 'whatsapp' ? (
                  <FiMessageCircle className="w-4 h-4" />
                ) : (
                  <FiExternalLink className="w-4 h-4" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

// Componente específico para Content Premium
const ContentPremiumAd = React.forwardRef<
  HTMLDivElement,
  {
    ad: any;
    media: any;
    placement: string;
    showTitle: boolean;
    showAdvertiserName: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onDismiss: () => void;
  }
>(
  (
    {
      ad,
      media,
      placement,
      showTitle,
      showAdvertiserName,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onDismiss,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-ad-id={ad.id}
        className="ad-premium-content cursor-pointer group"
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
          className="absolute top-4 right-4 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
          title="Fechar anúncio"
        >
          <FiX className="w-4 h-4" />
        </button>

        <div className="ad-inner">
          <div className="ad-icon">
            <FiMusic />
          </div>

          <div className="ad-text">
            {showTitle && <h3 className="ad-title">{ad.title}</h3>}

            {ad.description && (
              <p className="ad-description">{ad.description}</p>
            )}
          </div>

          {media && (
            <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={media.src}
                alt={ad.title}
                width={96}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

// Definir displayName para os componentes
PremiumAdItem.displayName = 'PremiumAdItem';
HeaderPremiumAd.displayName = 'HeaderPremiumAd';
SidebarPremiumAd.displayName = 'SidebarPremiumAd';
ContentPremiumAd.displayName = 'ContentPremiumAd';
