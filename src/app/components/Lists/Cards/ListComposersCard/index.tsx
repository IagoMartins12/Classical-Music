// app/components/Cards/ListComposersCard.tsx - Sophisticated version matching CarouselCard design
'use client';

import React from 'react';
import LazyImage from '@/app/components/LazyImage';
import { composerHomeProps } from '@/app/components/PopularComposers';
import Link from 'next/link';
import { FiCalendar } from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import FavoriteButton from '@/app/components/FavoriteButton';

interface listComposersCardsProps {
  composer: composerHomeProps;
  isActive: boolean;
}

const ListComposersCards: React.FC<listComposersCardsProps> = ({
  composer,
  isActive,
}) => {
  // const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="group cursor-pointer select-none h-full">
      <Link href={`/composer/${composer.id}`}>
        <div
          className={`
            relative overflow-hidden rounded-2xl h-full
            classical-card
            transition-all duration-700 ease-out
            ${
              isActive
                ? 'opacity-100 scale-100 group-hover:scale-105 group-hover:-translate-y-3'
                : 'opacity-95 scale-100'
            }
            hover:shadow-theme-glow
          `}
        >
          {/* Image Container */}
          <div className="aspect-square relative overflow-hidden">
            {/* Loading Skeleton */}
            {/* {!imageLoaded && (
              <div className="absolute inset-0 loading-skeleton"></div>
            )} */}

            {/* Portrait Image */}
            <LazyImage
              src={composer.portraitUrl}
              alt={composer.name}
              width={300}
              height={300}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-100`}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

            {/* Floating Action Buttons */}
            <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              {/* Favorite Button */}
              <FavoriteButton
                id={composer.id}
                type="composer"
                variant="small"
                size="md"
                itemName={composer.fullName}
                showToast={true}
              />
            </div>

            {/* Period Badge */}
            {composer.epochName && (
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                <span className="inline-flex items-center px-2 py-1 bg-brand-primary/20 backdrop-blur-md border border-brand-primary/30 rounded-full text-xs font-medium text-white">
                  <FiCalendar className="w-2.5 h-2.5 mr-1" />
                  {composer.epochName}
                </span>
              </div>
            )}

            {/* Musical Note Decoration */}
            <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-30 transition-all duration-500 transform scale-150 group-hover:scale-100">
              <GiMusicalNotes className="w-4 h-4 text-brand-primary" />
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 music-note-background"></div>

            {/* Name and Info */}
            <div className="relative z-10">
              <h3 className="font-bold text-theme-primary mb-3 text-sm classical-title group-hover:text-brand-primary transition-colors duration-300 line-clamp-2 leading-tight">
                {composer.fullName || composer.name}
              </h3>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-theme-secondary">
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse"></div>
                  <span className="text-xs text-theme-tertiary font-medium">
                    Ver obras
                  </span>
                </div>

                {/* Arrow indicator */}
                <div className="w-5 h-5 border border-theme-primary rounded-full flex items-center justify-center group-hover:border-brand-primary group-hover:bg-brand-primary/10 transition-all duration-300">
                  <svg
                    className="w-2.5 h-2.5 text-theme-primary group-hover:text-brand-primary transition-all duration-300 transform group-hover:translate-x-0.5"
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

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-b-2xl"></div>
          </div>

          {/* Active State Indicator */}
          {isActive && (
            <div className="absolute inset-0 border-2 border-brand-primary/50 rounded-2xl pointer-events-none">
              <div className="absolute top-2 left-2 w-3 h-3 bg-brand-primary rounded-full shadow-brand-glow animate-pulse"></div>
            </div>
          )}

          {/* Floating mini badge for interaction feedback */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-gradient rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100 shadow-brand-glow"></div>
        </div>
      </Link>
    </div>
  );
};

export default ListComposersCards;
