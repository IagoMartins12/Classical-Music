// app/composers/ComposerCardList.tsx - Premium version with theme system
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  FiUser,
  FiCalendar,
  FiExternalLink,
  FiChevronRight,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import { ComposerImslp } from '..';
import FavoriteButton from '../../FavoriteButton';

interface composerCardListProps {
  composer: ComposerImslp;
}

const ComposerCardList: React.FC<composerCardListProps> = ({ composer }) => {
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

  return (
    <div className="flex items-center justify-between w-full group">
      {/* Left section - Portrait and basic info */}
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {/* Portrait */}
        <div className="relative w-12 h-12 flex-shrink-0">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 loading-skeleton rounded-full"></div>
          )}

          {composer.portraitUrl && !imageError ? (
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-brand-primary/20 group-hover:border-brand-primary/50 transition-all duration-300">
              <Image
                src={composer.portraitUrl}
                alt={composer.name}
                fill
                sizes="48px"
                className={`object-cover transition-all duration-500 group-hover:scale-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-2 border-brand-primary/20 group-hover:border-brand-primary/50 transition-all duration-300">
              <FiUser className="w-5 h-5 text-theme-inverse" />
            </div>
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-300 truncate">
            {composer.name}
          </h3>

          {composer.fullName !== composer.name && (
            <p className="text-sm text-theme-secondary truncate mt-0.5">
              {composer.fullName}
            </p>
          )}

          <div className="flex items-center space-x-4 mt-1">
            {/* Period */}
            {composer.epochName && (
              <span className="inline-flex items-center text-xs text-brand-primary font-medium">
                <GiMusicalNotes className="w-3 h-3 mr-1" />
                {composer.epochName}
              </span>
            )}

            {/* Dates */}
            {formatDates() && (
              <span className="inline-flex items-center text-xs text-theme-tertiary">
                <FiCalendar className="w-3 h-3 mr-1" />
                {formatDates()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center section - External links */}
      <div className="flex items-center  space-x-2 mx-4">
        {composer.wikipediaLink && (
          <a
            href={composer.wikipediaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2 py-1 bg-accent-blue/10 border border-accent-blue/20 text-accent-blue rounded-md text-xs font-medium hover:bg-accent-blue/20 hover:scale-105 transition-all duration-300 group/link"
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
            className="inline-flex items-center px-2 py-1 bg-accent-green/10 border border-accent-green/20 text-accent-green rounded-md text-xs font-medium hover:bg-accent-green/20 hover:scale-105 transition-all duration-300 group/link"
            onClick={(e) => e.stopPropagation()}
          >
            IMSLP
            <FiExternalLink className="w-2.5 h-2.5 ml-1 opacity-60 group-hover/link:opacity-100 transition-opacity" />
          </a>
        )}

        <div className=" flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <FavoriteButton
            id={composer.id}
            type="composer"
            variant="default"
            size="md"
            itemName={composer.fullName}
            showToast={true}
          />
        </div>
      </div>

      {/* Right section - Action indicator */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        {/* Action hint */}
        <div className="hidden md:flex items-center space-x-2 text-theme-tertiary text-xs">
          <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse"></div>
          <span className="font-medium">Ver obras</span>
        </div>

        {/* Arrow */}
        <div className="w-8 h-8 border border-theme-primary rounded-full flex items-center justify-center group-hover:border-brand-primary group-hover:bg-brand-primary/10 transition-all duration-300">
          <FiChevronRight className="w-4 h-4 text-theme-primary group-hover:text-brand-primary transition-all duration-300 transform group-hover:translate-x-0.5" />
        </div>
      </div>

      {/* Hover background effect */}
      <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg pointer-events-none"></div>
    </div>
  );
};

export default ComposerCardList;
