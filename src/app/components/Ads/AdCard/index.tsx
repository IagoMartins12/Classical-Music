// app/components/Ads/AdCard.tsx - Card de publicidade para sidebar
'use client';

import { useState } from 'react';
import { FiX, FiExternalLink } from 'react-icons/fi';

interface AdCardProps {
  ad: any;
  onTrackEvent: (event: string, data?: any) => void;
  className?: string;
}

export default function AdCard({
  ad,
  onTrackEvent,
  className = '',
}: AdCardProps) {
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

  const mainMedia = ad.mediaFiles?.find((media: any) => media.isMain);

  return (
    <div
      className={`relative bg-theme-elevated border border-theme-primary rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Fechar"
      >
        <FiX className="w-3 h-3" />
      </button>

      {/* Card Content */}
      <div className="cursor-pointer group" onClick={handleClick}>
        {/* Image */}
        {(mainMedia?.url || ad.imageUrl) && (
          <div className="aspect-video overflow-hidden">
            <img
              src={mainMedia?.url || ad.imageUrl}
              alt={mainMedia?.altText || ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-theme-primary mb-1 group-hover:text-brand-primary transition-colors line-clamp-2">
            {ad.title}
          </h3>

          {ad.description && (
            <p className="text-sm text-theme-secondary mb-3 line-clamp-2">
              {ad.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-theme-tertiary">
              {ad.advertiserName}
            </span>

            {ad.ctaText && (
              <div className="flex items-center space-x-1 text-brand-primary text-sm font-medium">
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
