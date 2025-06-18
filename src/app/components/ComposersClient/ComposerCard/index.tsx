// app/composers/ComposerCard.tsx - Updated with Favorites
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiUser, FiCalendar, FiExternalLink } from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import { ComposerImslp } from '..';
import FavoriteButton from '../../FavoriteButton';

interface composerCardProps {
  composer: ComposerImslp;
}

const ComposerCard: React.FC<composerCardProps> = ({ composer }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDates = () => {
    if (!composer.birthDate && !composer.deathDate) return null;

    const birth = composer.birthDate
      ? new Date(composer.birthDate).getFullYear()
      : '?';
    const death = composer.deathDate
      ? new Date(composer.deathDate).getFullYear()
      : 'presente';

    return `${birth} - ${death}`;
  };

  const hasExternalLinks = composer.wikipediaLink || composer.permLinkImslp;

  return (
    <div className="group cursor-pointer select-none h-full">
      <div className="classical-card h-full overflow-hidden transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-2 hover:shadow-theme-glow">
        {/* Portrait Section */}
        <div className="relative p-6 pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 md:w-28 md:h-28">
              {/* Loading skeleton */}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 loading-skeleton rounded-full"></div>
              )}

              {/* Portrait image or fallback */}
              {composer.portraitUrl && !imageError ? (
                <div className="relative w-full h-full rounded-full overflow-hidden border-3 border-brand-primary/20 group-hover:border-brand-primary/50 transition-all duration-500">
                  <Image
                    src={composer.portraitUrl}
                    alt={composer.name}
                    fill
                    sizes="112px"
                    className={`object-cover transition-all duration-700 group-hover:scale-110 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    priority={false}
                    loading="lazy"
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full"></div>
                </div>
              ) : (
                // Fallback avatar
                <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-3 border-brand-primary/20 group-hover:border-brand-primary/50 transition-all duration-500 group-hover:scale-110">
                  <FiUser className="w-8 h-8 md:w-10 md:h-10 text-theme-inverse" />
                </div>
              )}
            </div>
          </div>

          {/* Floating action buttons */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <FavoriteButton
              id={composer.id}
              type="composer"
              variant="small"
              size="md"
              itemName={composer.fullName}
              showToast={true}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-6 relative">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5 music-note-background"></div>

          <div className="relative z-10 space-y-3">
            {/* Name */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-300 line-clamp-2">
                {composer.name}
              </h3>

              {/* Full name if different */}
              {composer.fullName !== composer.name && (
                <p className="text-sm text-theme-secondary mt-1 line-clamp-2">
                  {composer.fullName}
                </p>
              )}
            </div>

            {/* Dates */}
            {formatDates() && (
              <div className="flex items-center justify-center text-theme-tertiary text-sm">
                <FiCalendar className="w-3 h-3 mr-1" />
                {formatDates()}
              </div>
            )}

            {/* Period info */}
            {composer.epochName && (
              <div className="text-center">
                <span className="inline-flex items-center px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-full text-xs font-medium hover:bg-brand-primary/20 transition-colors duration-300">
                  <GiMusicalNotes className="w-3 h-3 mr-1" />
                  {composer.epochName}
                </span>
              </div>
            )}

            {/* External links */}
            {hasExternalLinks && (
              <div className="flex justify-center space-x-2 pt-2">
                {composer.wikipediaLink && (
                  <a
                    href={composer.wikipediaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-accent-blue/10 border border-accent-blue/20 text-accent-blue rounded-full text-xs font-medium hover:bg-accent-blue/20 hover:scale-105 transition-all duration-300 group/link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Wikipedia
                    <FiExternalLink className="w-2.5 h-2.5 ml-1 opacity-60 group-hover/link:opacity-100 transition-opacity" />
                  </a>
                )}
                {composer.permLinkImslp && (
                  <a
                    href={composer.permLinkImslp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-accent-green/10 border border-accent-green/20 text-accent-green rounded-full text-xs font-medium hover:bg-accent-green/20 hover:scale-105 transition-all duration-300 group/link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    IMSLP
                    <FiExternalLink className="w-2.5 h-2.5 ml-1 opacity-60 group-hover/link:opacity-100 transition-opacity" />
                  </a>
                )}
              </div>
            )}

            {/* Action indicator */}
            <div className="flex items-center justify-center pt-4 border-t border-theme-secondary mt-4">
              <div className="flex items-center space-x-2 text-theme-tertiary text-xs">
                <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                <span className="font-medium">Explorar obras</span>
                <svg
                  className="w-3 h-3 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-b-2xl"></div>
        </div>

        {/* Floating mini indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-gradient rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100 shadow-brand-glow"></div>
      </div>
    </div>
  );
};

export default ComposerCard;
