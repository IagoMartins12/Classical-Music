// app/components/Ads/AdBanner.tsx - Banner simples para header
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FiX, FiExternalLink } from 'react-icons/fi';

interface AdBannerProps {
  ad: any;
  onTrackEvent: (event: string, data?: any) => void;
  className?: string;
}

export default function AdBanner({
  ad,
  onTrackEvent,
  className = '',
}: AdBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

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

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
  };

  return (
    <div
      className={`relative bg-gradient-to-r from-accent-blue to-accent-purple ${className}`}
    >
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 w-6 h-6 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
        title="Fechar"
      >
        <FiX className="w-3 h-3" />
      </button>

      {/* Banner Content */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer group"
        onClick={handleClick}
      >
        <div className="flex items-center space-x-4">
          {ad.imageUrl && (
            <Image
              height={12}
              width={12}
              src={ad.imageUrl}
              alt={ad.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}

          <div>
            <h3 className="text-white font-semibold group-hover:underline">
              {ad.title}
            </h3>
            {ad.tagline && (
              <p className="text-white/80 text-sm">{ad.tagline}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {ad.ctaText && (
            <span className="text-white font-medium bg-white/20 px-3 py-1 rounded-full text-sm">
              {ad.ctaText}
            </span>
          )}

          {ad.isExternal && (
            <FiExternalLink className="w-4 h-4 text-white/80" />
          )}
        </div>
      </div>
    </div>
  );
}
