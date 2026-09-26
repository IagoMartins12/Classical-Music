// app/works/WorkCardList.tsx - Premium version with translations
'use client';

import { WorkListItem } from '@/app/requests/work-details';
import Link from '@/app/components/LocalizedLink';
import {
  PiBookOpen,
  PiCalendarBlank,
  PiCaretRight,
  PiClock,
  PiMusicNotes,
  PiUser,
} from 'react-icons/pi';
import FavoriteButton from '../../FavoriteButton';
import VerificationBadge from '../../Verification/VerificationBadge';
import { useTranslation } from '@/app/context/TranslationContext';
import { Inline, Stack } from '@/app/components/ui/Layout';

interface workCardListProps {
  work: WorkListItem;
}

const WorkCardList: React.FC<workCardListProps> = ({ work }) => {
  const { t } = useTranslation({ sections: ['pages/works'] });

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
      <Inline gap={4} className="flex-1 min-w-0">
        {/* Musical icon */}
        <div className="relative w-10 h-10 flex-shrink-0">
          <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-theme-sm group-hover:shadow-theme-glow">
            <PiMusicNotes className="w-5 h-5 text-theme-primary" />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title and opus */}
          <div className="flex items-start gap-3 mb-1">
            <div className="inline-flex items-center py-0.5">
              <h3 className="font-bold flex items-center gap-2 ml-1 text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-300  flex-1">
                {work.title}
                <VerificationBadge verified={work.isVerified} variant="icon" />
              </h3>
            </div>

            <div className="flex gap-4 items-center">
              {work.opOrCatalog && (
                <span className="inline-flex items-center px-2 py-0.5 bg-theme-elevated border border-theme-primary/30 text-theme-secondary rounded-md text-xs font-medium flex-shrink-0">
                  <PiBookOpen className="w-2.5 h-2.5 mr-1" />
                  {work.opOrCatalog}
                </span>
              )}
              <Stack
                gap={2}
                className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
              >
                <FavoriteButton
                  id={work.id}
                  type="work"
                  variant="default"
                  size="md"
                  itemName={work.title}
                  showToast={true}
                />
              </Stack>
            </div>
          </div>

          {/* Composer info */}
          <Inline gap={2} className="mb-2">
            <Link
              href={`/composer/${work.composer.id}`}
              className="inline-flex items-center text-sm text-accent-blue hover:text-accent-purple transition-colors font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              <PiUser className="w-3 h-3 mr-1" />
              {work.composer.fullName}
            </Link>

            {work.composer.epochName && (
              <>
                <span className="text-theme-tertiary">•</span>
                <span className="text-xs text-brand-primary font-medium">
                  {work.composer.epochName}
                </span>
              </>
            )}
          </Inline>

          {/* Additional details */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-theme-tertiary">
            {work.instrument?.name && (
              <div className="flex items-center">
                <PiMusicNotes className="w-3 h-3 mr-1 text-brand-primary" />
                <span>{work.instrument.name}</span>
              </div>
            )}

            {work.compositionYear && (
              <div className="flex items-center">
                <PiCalendarBlank className="w-3 h-3 mr-1 text-accent-green" />
                <span>{work.compositionYear}</span>
              </div>
            )}

            {work.mediaDuration && (
              <div className="flex items-center">
                <PiClock className="w-3 h-3 mr-1 text-accent-purple" />
                <span>{formatDuration(work.mediaDuration)}</span>
              </div>
            )}

            {work.tone && (
              <div className="flex items-center">
                <PiMusicNotes className="w-3 h-3 mr-1 text-brand-secondary" />
                <span>
                  {t('cardlist_jsx_span_key_label')} {work.tone}
                </span>
              </div>
            )}
          </div>
        </div>
      </Inline>

      {/* Right section - Action indicator */}
      <Inline gap={3} className="flex-shrink-0">
        {/* Action hint */}
        <div className="hidden md:flex items-center space-x-2 text-theme-tertiary text-xs">
          <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse"></div>
          <span className="font-medium">
            {t('cardlist_jsx_span_explore_work')}
          </span>
        </div>

        {/* Arrow */}
        <div className="w-8 h-8 border border-theme-primary rounded-full flex items-center justify-center group-hover:border-brand-primary group-hover:bg-brand-primary/10 transition-all duration-300">
          <PiCaretRight className="w-4 h-4 text-theme-primary group-hover:text-brand-primary transition-all duration-300 transform group-hover:translate-x-0.5" />
        </div>
      </Inline>

      {/* Hover background effect */}
      <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg pointer-events-none"></div>
    </div>
  );
};

export default WorkCardList;
