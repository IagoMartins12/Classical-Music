// app/components/Carousel/CarouselCard.tsx - Sophisticated version with theme system
'use client';

import { CarouselCardProps } from '@/app/types/types';
import LazyImage from '../../LazyImage';
import Link from 'next/link';
import { FiUser, FiCalendar } from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import FavoriteButton from '../../FavoriteButton';

const CarouselCard: React.FC<CarouselCardProps> = ({ item, isActive }) => {
  // const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="group cursor-pointer select-none h-full">
      <Link href={`/composer/${item.id}`}>
        <div
          className={`
            relative overflow-hidden rounded-2xl h-full
            classical-card
            transition-all duration-700 ease-out
            ${
              isActive
                ? 'opacity-100 scale-100 group-hover:scale-105 group-hover:-translate-y-2'
                : 'opacity-70 scale-95'
            }
          `}
        >
          {/* Image Container */}
          <div className="aspect-[4/5] relative overflow-hidden">
            {/* Loading Skeleton */}
            {/* {!imageLoaded && (
              <div className="absolute inset-0 loading-skeleton"></div>
            )} */}

            {/* Portrait Image */}
            <LazyImage
              src={item.portraitUrl}
              alt={item.name}
              width={400}
              height={500}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-95`}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              {/* Favorite Button */}
              <FavoriteButton
                id={item.id}
                type="composer"
                variant="small"
                size="md"
                itemName={item.fullName}
                showToast={true}
              />
            </div>

            {/* Period Badge */}
            {item.epochName && (
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                <span className="inline-flex items-center px-3 py-1 bg-brand-primary/20 backdrop-blur-md border border-brand-primary/30 rounded-full text-xs font-medium text-white">
                  <FiCalendar className="w-3 h-3 mr-1" />
                  {item.epochName}
                </span>
              </div>
            )}

            {/* Musical Note Decoration */}
            <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-30 transition-all duration-500 transform scale-150 group-hover:scale-100">
              <GiMusicalNotes className="w-6 h-6 text-brand-primary" />
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 music-note-background"></div>

            {/* Name and Info */}
            <div className="relative z-10">
              <h3 className="font-bold text-theme-primary text-lg classical-title mb-2 group-hover:text-brand-primary transition-colors duration-300 line-clamp-2">
                {item.fullName || item.name}
              </h3>

              {/* Subtitle with epoch info */}
              {item.epochName && (
                <p className="text-theme-secondary text-sm mb-3 flex items-center">
                  <FiUser className="w-3 h-3 mr-1 opacity-60" />
                  Compositor {item.epochName}
                </p>
              )}

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-theme-secondary">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                  <span className="text-xs text-theme-tertiary font-medium">
                    Explorar obras
                  </span>
                </div>

                {/* Arrow indicator */}
                <div className="w-6 h-6 border border-theme-primary rounded-full flex items-center justify-center group-hover:border-brand-primary group-hover:bg-brand-primary/10 transition-all duration-300">
                  <svg
                    className="w-3 h-3 text-theme-primary group-hover:text-brand-primary transition-all duration-300 transform group-hover:translate-x-0.5"
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
        </div>
      </Link>
    </div>
  );
};

export default CarouselCard;
