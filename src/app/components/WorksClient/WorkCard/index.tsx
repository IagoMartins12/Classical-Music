// app/works/WorkCard.tsx - Premium version with translations
'use client';

import { WorkListItem } from '@/app/requests/work-details';
import Link from '@/app/components/LocalizedLink';
import {
  PiBookOpen,
  PiCalendarBlank,
  PiClock,
  PiHeadphones,
  PiMusicNotes,
  PiUser,
} from 'react-icons/pi';
import FavoriteButton from '../../FavoriteButton';
import VerificationBadge from '../../Verification/VerificationBadge';
import { useTranslation } from '@/app/context/TranslationContext';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface workCardProps {
  work: WorkListItem;
  goToWorkPage: (composerId: string) => void;
}

const WorkCard: React.FC<workCardProps> = ({ work, goToWorkPage }) => {
  const { t } = useTranslation({ sections: ['pages/works'] });

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
        className="classical-card h-full flex flex-col overflow-hidden transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-2"
      >
        {/* Header Section */}
        <div className="relative p-2 md:p-6 pb-0 md:pb-4 border-b border-theme-secondary">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5 music-note-background"></div>

          {/* Floating action buttons */}
          <Stack
            gap={2}
            className="absolute top-4 right-4 z-50 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
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

          <div className="relative z-10">
            {/* Title */}
            <h3 className="text-lg flex items-center gap-2 font-bold text-theme-primary classical-title mb-3 line-clamp-2 transition-colors duration-300 leading-tight">
              <Link href={`/works/${work.id}`} className="transition-colors">
                {work.title}
              </Link>
              <VerificationBadge verified={work.isVerified} variant="icon" />
            </h3>

            {/* Opus/Catalog */}
            {work.opOrCatalog && (
              <div className="flex items-center mb-3">
                <PiBookOpen className="w-3 h-3 text-theme-tertiary mr-2" />
                <Text papel="rotulo" tom="suave" className="font-medium">
                  {work.opOrCatalog}
                </Text>
              </div>
            )}

            {/* Composer */}
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2">
                <PiUser className="w-3 h-3 text-theme-primary" />
              </div>
              <Link
                href={`/composer/${work.composer.id}`}
                className="text-sm transition-colors font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {work.composer.fullName}
              </Link>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 md:p-6 flex-1 w-full flex flex-col">
          {/* Work Details */}
          <div className="space-y-3 mb-4 flex-1">
            {/* Instrument */}
            {work.instrument?.name && (
              <div className="flex items-center">
                <PiMusicNotes className="w-4 h-4 text-ouro-texto mr-2 flex-shrink-0" />
                <Text papel="rotulo" tom="suave">
                  {work.instrument.name}
                </Text>
              </div>
            )}

            {/* Composition Year */}
            {work.compositionYear && (
              <div className="flex items-center">
                <PiCalendarBlank className="w-4 h-4 mr-2 flex-shrink-0" />
                <Text papel="rotulo" tom="suave">
                  {work.compositionYear}
                </Text>
              </div>
            )}

            {/* Duration */}
            {work.mediaDuration && (
              <div className="flex items-center">
                <PiClock className="w-4 h-4 mr-2 flex-shrink-0" />
                <Text papel="rotulo" tom="suave">
                  {formatDuration(work.mediaDuration)}
                </Text>
              </div>
            )}

            {/* Tone/Key */}
            {work.tone && (
              <div className="flex items-center">
                <PiMusicNotes className="w-4 h-4 text-ouro-texto mr-2 flex-shrink-0" />
                <Text papel="rotulo" tom="suave">
                  {t('card_jsx_span_key_label')} {work.tone}
                </Text>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {work.epoch && work.epoch.name && (
              <Text
                papel="legenda"
                tom="ouro"
                className="inline-flex items-center px-2 py-1 rounded-full font-medium bg-sup-2"
              >
                <PiClock className="w-2.5 h-2.5 mr-1" />
                {work.epoch.name}
              </Text>
            )}
          </div>

          {/* Action Section */}
          <Stack gap={3}>
            {/* Main Action Button */}
            <Link
              href={`/works/${work.id}`}
              className="btn-classical-primary w-full text-center flex items-center justify-center space-x-2 group/btn"
              onClick={(e) => e.stopPropagation()}
            >
              <PiHeadphones className="w-4 h-4" />
              <span>{t('card_jsx_button_explore_work')}</span>
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
              <Inline gap={2} className="text-theme-tertiary text-xs">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse"></div>
                <span className="font-medium">
                  {t('card_jsx_span_full_details')}
                </span>
              </Inline>

              <Inline gap={2}>
                {/* Quick preview button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Quick preview functionality
                  }}
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  title={t('card_jsx_button_quick_preview')}
                >
                  <svg
                    className="w-3 h-3 text-theme-primary transition-colors"
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
              </Inline>
            </div>
          </Stack>

          {/* Hover glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
        </div>

        {/* Floating mini indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100"></div>
      </div>
    </div>
  );
};

export default WorkCard;
