// app/works/WorkCard.tsx - Premium version with theme system
'use client';

import { WorkListItem } from '@/app/requests/work-details';
import Link from 'next/link';
import {
  FiClock,
  FiMusic,
  FiUser,
  FiCalendar,
  FiBookOpen,
  FiHeadphones,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import FavoriteButton from '../../FavoriteButton';
import VerificationBadge from '../../Verification/VerificationBadge';

interface workCardProps {
  work: WorkListItem;
  goToWorkPage: (composerId: string) => void;
}

const WorkCard: React.FC<workCardProps> = ({ work, goToWorkPage }) => {
  const formatDuration = (duration: string | null) => {
    if (!duration) return null;
    // Se já está formatado, retorna como está
    if (duration.includes('min') || duration.includes(':')) return duration;
    // Se é só número, assume minutos
    const num = parseInt(duration);
    if (!isNaN(num)) return `${num} min`;
    return duration;
  };

  return (
    <div className="group cursor-pointer select-none h-full">
      <div
        onClick={(ev) => {
          ev.preventDefault();
          goToWorkPage(work.id);
        }}
        className="classical-card h-full flex flex-col overflow-hidden transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-2 hover:shadow-theme-glow"
      >
        {/* Header Section */}
        <div className="relative p-6 pb-4 border-b border-theme-secondary">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5 music-note-background"></div>

          {/* Floating action buttons */}
          <div className="absolute top-4 right-4 z-50 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <FavoriteButton
              id={work.id}
              type="work"
              variant="default"
              size="md"
              itemName={work.title}
              showToast={true}
            />
          </div>

          <div className="relative z-10">
            {/* Title */}
            <h3 className="text-lg flex items-center gap-2 font-bold text-theme-primary classical-title mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors duration-300 leading-tight">
              <Link
                href={`/works/${work.id}`}
                className="hover:text-brand-primary transition-colors"
              >
                {work.title}
              </Link>
              <VerificationBadge verified={work.isVerified} variant="icon" />
            </h3>

            {/* Opus/Catalog */}
            {work.opOrCatalog && (
              <div className="flex items-center mb-3">
                <FiBookOpen className="w-3 h-3 text-theme-tertiary mr-2" />
                <span className="text-sm text-theme-secondary font-medium">
                  {work.opOrCatalog}
                </span>
              </div>
            )}

            {/* Composer */}
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center mr-2">
                <FiUser className="w-3 h-3 text-theme-primary" />
              </div>
              <Link
                href={`/composer/${work.composer.id}`}
                className="text-sm text-accent-blue hover:text-accent-purple transition-colors font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {work.composer.fullname}
              </Link>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex-1 w-full flex flex-col">
          {/* Work Details */}
          <div className="space-y-3 mb-4 flex-1">
            {/* Instrument */}
            {work.instrument?.name && (
              <div className="flex items-center">
                <FiMusic className="w-4 h-4 text-brand-primary mr-2 flex-shrink-0" />
                <span className="text-sm text-theme-secondary">
                  {work.instrument.name}
                </span>
              </div>
            )}

            {/* Composition Year */}
            {work.compositionYear && (
              <div className="flex items-center">
                <FiCalendar className="w-4 h-4 text-accent-green mr-2 flex-shrink-0" />
                <span className="text-sm text-theme-secondary">
                  {work.compositionYear}
                </span>
              </div>
            )}

            {/* Duration */}
            {work.mediaDuration && (
              <div className="flex items-center">
                <FiClock className="w-4 h-4 text-accent-purple mr-2 flex-shrink-0" />
                <span className="text-sm text-theme-secondary">
                  {formatDuration(work.mediaDuration)}
                </span>
              </div>
            )}

            {/* Tone/Key */}
            {work.tone && (
              <div className="flex items-center">
                <GiMusicalNotes className="w-4 h-4 text-brand-secondary mr-2 flex-shrink-0" />
                <span className="text-sm text-theme-secondary">
                  Tom: {work.tone}
                </span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {work.epoch && work.epoch.name && (
              <span className="inline-flex items-center px-2 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-full text-xs font-medium">
                <FiClock className="w-2.5 h-2.5 mr-1" />
                {work.epoch.name}
              </span>
            )}

            {work.isPartOfCollection && (
              <span className="inline-flex items-center px-2 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-full text-xs font-medium">
                <FiBookOpen className="w-2.5 h-2.5 mr-1" />
                Coleção
              </span>
            )}
          </div>

          {/* Action Section */}
          <div className="space-y-3">
            {/* Main Action Button */}
            <Link
              href={`/works/${work.id}`}
              className="btn-classical-primary w-full text-center flex items-center justify-center space-x-2 group/btn"
              onClick={(e) => e.stopPropagation()}
            >
              <FiHeadphones className="w-4 h-4" />
              <span>Explorar Obra</span>
              <svg
                className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
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
            </Link>

            {/* Secondary Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-theme-secondary">
              <div className="flex items-center space-x-2 text-theme-tertiary text-xs">
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse"></div>
                <span className="font-medium">Detalhes completos</span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Quick preview button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Quick preview functionality
                  }}
                  className="w-6 h-6 border border-theme-primary rounded-full flex items-center justify-center group-hover:border-brand-primary group-hover:bg-brand-primary/10 transition-all duration-300 hover:scale-110"
                  title="Preview rápido"
                >
                  <svg
                    className="w-3 h-3 text-theme-primary group-hover:text-brand-primary transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
        </div>

        {/* Floating mini indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-gradient rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100 shadow-brand-glow"></div>
      </div>
    </div>
  );
};

export default WorkCard;
