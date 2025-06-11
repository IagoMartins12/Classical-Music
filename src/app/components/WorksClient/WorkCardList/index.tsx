// app/works/WorkCardList.tsx - Premium version with theme system
'use client';

import { WorkListItem } from '@/app/requests/work-details';
import Link from 'next/link';
import {
  FiUser,
  FiMusic,
  FiClock,
  FiCalendar,
  FiChevronRight,
  FiBookOpen,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';

interface workCardListProps {
  work: WorkListItem;
}

const WorkCardList: React.FC<workCardListProps> = ({ work }) => {
  const formatDuration = (duration: string | null) => {
    if (!duration) return null;
    if (duration.includes('min') || duration.includes(':')) return duration;
    const num = parseInt(duration);
    if (!isNaN(num)) return `${num} min`;
    return duration;
  };

  return (
    <div className="flex items-center justify-between w-full group">
      {/* Left section - Main info */}
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {/* Musical icon */}
        <div className="relative w-10 h-10 flex-shrink-0">
          <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-theme-sm group-hover:shadow-theme-glow">
            <GiMusicalNotes className="w-5 h-5 text-theme-primary" />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title and opus */}
          <div className="flex items-start gap-3 mb-1">
            <h3 className="font-bold text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-300 truncate flex-1">
              {work.title}
            </h3>

            {work.opOrCatalog && (
              <span className="inline-flex items-center px-2 py-0.5 bg-theme-elevated border border-theme-primary/30 text-theme-secondary rounded-md text-xs font-medium flex-shrink-0">
                <FiBookOpen className="w-2.5 h-2.5 mr-1" />
                {work.opOrCatalog}
              </span>
            )}
          </div>

          {/* Composer info */}
          <div className="flex items-center space-x-2 mb-2">
            <Link
              href={`/composer/${work.composer.id}`}
              className="inline-flex items-center text-sm text-accent-blue hover:text-accent-purple transition-colors font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              <FiUser className="w-3 h-3 mr-1" />
              {work.composer.name}
            </Link>

            {work.composer.epochName && (
              <>
                <span className="text-theme-tertiary">•</span>
                <span className="text-xs text-brand-primary font-medium">
                  {work.composer.epochName}
                </span>
              </>
            )}
          </div>

          {/* Additional details */}
          <div className="flex items-center gap-4 text-sm text-theme-tertiary">
            {work.instrument?.name && (
              <div className="flex items-center">
                <FiMusic className="w-3 h-3 mr-1 text-brand-primary" />
                <span>{work.instrument.name}</span>
              </div>
            )}

            {work.compositionYear && (
              <div className="flex items-center">
                <FiCalendar className="w-3 h-3 mr-1 text-accent-green" />
                <span>{work.compositionYear}</span>
              </div>
            )}

            {work.mediaDuration && (
              <div className="flex items-center">
                <FiClock className="w-3 h-3 mr-1 text-accent-purple" />
                <span>{formatDuration(work.mediaDuration)}</span>
              </div>
            )}

            {work.tone && (
              <div className="flex items-center">
                <GiMusicalNotes className="w-3 h-3 mr-1 text-brand-secondary" />
                <span>Tom: {work.tone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center section - Badges */}
      <div className="flex items-center space-x-2 mx-4 flex-shrink-0">
        {work.isPartOfCollection && (
          <span className="inline-flex items-center px-2 py-1 bg-accent-blue/10 border border-accent-blue/20 text-accent-blue rounded-md text-xs font-medium">
            <FiBookOpen className="w-2.5 h-2.5 mr-1" />
            Coleção
          </span>
        )}
      </div>

      {/* Right section - Action indicator */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        {/* Action hint */}
        <div className="hidden md:flex items-center space-x-2 text-theme-tertiary text-xs">
          <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse"></div>
          <span className="font-medium">Explorar obra</span>
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

export default WorkCardList;
