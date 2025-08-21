// components/RecentWorkCard/RecentWorkCard.tsx
'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import {
  FiClock,
  FiPlus,
  FiExternalLink,
  FiCalendar,
  FiMusic,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';

export interface RecentWorkProps {
  id: string;
  title: string;
  mediaDuration: string | null;
  createdAt: Date;
  composer: {
    fullName: string;
  };
  instrument: {
    name: string;
  };
  epoch: {
    name: string;
  };
}
interface RecentWorkCardProps {
  work: RecentWorkProps;
  showExtendedInfo?: boolean;
}

export const workUtils = {
  // Format opus/catalog information
  formatOpusCatalog: (opOrCatalog?: string): string => {
    if (!opOrCatalog) return '';

    // Common patterns for opus/catalog formatting
    if (opOrCatalog.toLowerCase().includes('op.')) {
      return opOrCatalog.replace(/op\./gi, 'Op. ');
    }
    if (opOrCatalog.toLowerCase().includes('bwv')) {
      return opOrCatalog.toUpperCase();
    }
    if (opOrCatalog.toLowerCase().includes('k.')) {
      return opOrCatalog.replace(/k\./gi, 'K. ');
    }

    return opOrCatalog;
  },

  // Format duration
  formatDuration: (duration?: string): string => {
    if (!duration) return '';

    // Handle different duration formats
    if (duration.includes(':')) {
      return duration;
    }

    // Convert minutes to MM:SS format if it's just a number
    const minutes = parseInt(duration);
    if (!isNaN(minutes)) {
      return `${minutes}:00`;
    }

    return duration;
  },
};

const RecentWorkCard = ({ work }: RecentWorkCardProps) => {
  const formatTimeAgo = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return 'Hoje';
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
    return `${Math.floor(diffInDays / 30)} meses atrás`;
  }, []);

  // Get work styling
  const formattedDuration = workUtils.formatDuration(work.mediaDuration ?? '');

  return (
    <div className="group cursor-pointer select-none">
      <Link href={`/works/${work.id}`}>
        <div className="classical-card-simple overflow-hidden transition-all duration-500 ease-out group-hover:scale-[1.02] hover:shadow-theme-glow relative">
          {/* Badges */}
          {/* <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 backdrop-blur-md rounded-full px-2 py-1 text-xs font-medium text-green-400 flex items-center gap-1">
              <FiPlus className="w-2.5 h-2.5" />
              Novo
            </div>
          </div> */}

          {/* Time indicator */}
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="bg-theme-elevated/80 border border-theme-primary/20 backdrop-blur-md rounded-full px-2 py-1 text-xs text-theme-tertiary flex items-center gap-1">
              <FiClock className="w-2.5 h-2.5" />
              {formatTimeAgo(String(work.createdAt))}
            </div>
          </div>

          <div className="p-5">
            {/* Work icon and basic info */}
            <div className="flex items-start gap-4 mb-4">
              <div className="relative flex-shrink-0">
                <div className="relative w-14 h-14">
                  {/* Work icon */}
                  <div
                    className={`w-full h-full bg-gradient-to-br  rounded-2xl flex items-center justify-center border-2 border-green-400/20 group-hover:border-green-400/50 transition-all duration-500 group-hover:scale-110 shadow-lg`}
                  >
                    <FiMusic className="w-7 h-7 text-white drop-shadow-sm" />
                  </div>

                  {/* Pulse indicator */}
                  {/* <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                    <FiPlus className="w-2 h-2 text-white" />
                  </div> */}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-theme-primary classical-title group-hover:text-green-400 transition-colors duration-300 line-clamp-2 leading-tight mb-1">
                  {work.title}
                </h3>

                {/* Composer name */}
                {work.composer && (
                  <p className="text-sm text-theme-secondary line-clamp-1 mb-1">
                    {work.composer.fullName}
                  </p>
                )}

                {/* Essential info row */}
                <div className="flex items-center gap-3 text-xs text-theme-tertiary">
                  {/* Epoch */}
                  {work.epoch && (
                    <div className="flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      <span className="font-medium">{work.epoch.name}</span>
                    </div>
                  )}

                  {/* Duration */}
                  {formattedDuration && (
                    <div className="flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      <span className="font-medium">{formattedDuration}</span>
                    </div>
                  )}

                  {/* Instrument */}
                  {work.instrument && (
                    <div className="flex items-center gap-1">
                      <GiMusicalNotes className="w-3 h-3" />
                      <span className="font-medium truncate max-w-20">
                        {work.instrument.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Favorite button */}
              {/* <button
                className={`w-8 h-8 rounded-full transition-all duration-300 hover:scale-110 flex-shrink-0 `}
              >
                <FiHeart
                  className={`w-3.5 h-3.5 mx-auto transition-all duration-300`}
                />
              </button> */}
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-between pt-3 border-t border-theme-secondary/50">
              <div className="flex items-center space-x-2 text-theme-tertiary text-xs">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Recém-adicionado</span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 border border-theme-tertiary/30 rounded-full flex items-center justify-center text-theme-tertiary hover:border-blue-400 hover:text-blue-400 transition-all duration-300"
                  title="Disponível no IMSLP"
                >
                  <FiExternalLink className="w-2.5 h-2.5" />
                </div>

                {/* Navigation arrow */}
                <div className="w-6 h-6 border border-theme-tertiary/30 rounded-full flex items-center justify-center group-hover:border-green-400 group-hover:bg-green-400/10 transition-all duration-300">
                  <svg
                    className="w-3 h-3 text-theme-tertiary group-hover:text-green-400 transition-all duration-300 transform group-hover:translate-x-0.5"
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
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none"></div>

          {/* Additional subtle overlay for depth */}
          <div
            className={`absolute inset-0 bg-gradient-to-br  opacity-0 group-hover:opacity-5 transition-opacity duration-700 rounded-xl pointer-events-none`}
          ></div>
        </div>
      </Link>
    </div>
  );
};

export default RecentWorkCard;
