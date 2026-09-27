// app/composers/ComposerCardList.tsx - Premium version with theme system
'use client';

import { useState } from 'react';
import Image from '@/app/components/SmartImage';
import Link from '@/app/components/LocalizedLink';
import {
  PiArrowSquareOut,
  PiCalendarBlank,
  PiCaretRight,
  PiMusicNotes,
  PiUser,
} from 'react-icons/pi';
import FavoriteButton from '../../FavoriteButton';
import VerificationBadge from '../../Verification/VerificationBadge';
import { translateEpochWithHook } from '@/app/utils/translations/epochTranslationComposer';
import { ComposerImslp } from '@/app/[lang]/(main)/composers/pageClient';
import { useTranslation } from '@/app/context/TranslationContext';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface composerCardListProps {
  composer: ComposerImslp;
}

const ComposerCardList: React.FC<composerCardListProps> = ({ composer }) => {
  const { t } = useTranslation({ sections: ['pages/composers'] });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDates = () => {
    if (!composer.birthDate && !composer.deathDate) return null;

    const birth = composer.birthDate
      ? new Date(composer.birthDate).getFullYear()
      : '?';
    const death = composer.deathDate
      ? new Date(composer.deathDate).getFullYear()
      : composer.deathDate;

    return `${birth} - ${death}`;
  };

  return (
    // Link esticado sobre a linha inteira; ver o comentário em `ComposerCard`.
    <div className="relative flex items-center justify-between w-full group">
      {/* Left section - Portrait and basic info */}
      <Inline gap={4} className="flex-1 min-w-0">
        {/* Portrait */}
        <div className="relative w-12 h-12 flex-shrink-0">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 loading-skeleton rounded-full"></div>
          )}

          {composer.portraitUrl && !imageError ? (
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 transition-all duration-300">
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
            <div className="w-full h-full rounded-full flex items-center justify-center border-2 transition-all duration-300">
              <PiUser className="w-5 h-5 text-theme-inverse" />
            </div>
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-theme-primary classical-title transition-colors duration-300 truncate">
            <Link
              href={`/composer/${composer.id}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 rounded"
            >
              {composer.name}
            </Link>
          </h3>

          <Text
            papel="rotulo"
            tom="suave"
            className="flex items-center gap-2 truncate mt-0.5"
          >
            {composer.fullName}
            <VerificationBadge verified={composer.isVerified} variant="icon" />
          </Text>

          <Inline gap={4} className="mt-1">
            {/* Period */}
            {composer.epochName && (
              <Text
                papel="legenda"
                tom="ouro"
                className="inline-flex items-center font-medium"
              >
                <PiMusicNotes className="w-3 h-3 mr-1" />
                {translateEpochWithHook(composer.epochName, t)}
              </Text>
            )}

            {/* Dates */}
            {formatDates() && (
              <Text
                papel="legenda"
                tom="fraco"
                className="inline-flex items-center"
              >
                <PiCalendarBlank className="w-3 h-3 mr-1" />
                {formatDates()}
              </Text>
            )}
          </Inline>
        </div>
      </Inline>

      {/* Center section - External links */}
      <div className="relative z-10 hidden sm:flex items-center  space-x-2 mx-4">
        {composer.wikipediaLink && (
          <a
            href={composer.wikipediaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium hover:scale-105 transition-all duration-300 group/link bg-sup-2"
            onClick={(e) => e.stopPropagation()}
          >
            Wikipedia
            <PiArrowSquareOut className="w-2.5 h-2.5 ml-1 opacity-60 group-hover/link:opacity-100 transition-opacity" />
          </a>
        )}

        {composer.permLinkImslp && (
          <a
            href={composer.permLinkImslp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium hover:scale-105 transition-all duration-300 group/link bg-sup-2"
            onClick={(e) => e.stopPropagation()}
          >
            IMSLP
            <PiArrowSquareOut className="w-2.5 h-2.5 ml-1 opacity-60 group-hover/link:opacity-100 transition-opacity" />
          </a>
        )}

        <Stack
          gap={2}
          className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
        >
          <FavoriteButton
            id={composer.id}
            type="composer"
            variant="default"
            size="md"
            itemName={composer.fullName}
            showToast={true}
          />
        </Stack>
      </div>

      {/* Right section - Action indicator */}
      <Inline gap={3} className="flex-shrink-0">
        {/* Action hint */}
        <Text
          papel="legenda"
          tom="fraco"
          as="div"
          className="hidden md:flex items-center space-x-2"
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse"></div>
          <span className="font-medium">
            {t('cardlist_jsx_span_children_0__ver_obras')}
          </span>
        </Text>

        {/* Arrow */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300">
          <PiCaretRight className="w-4 h-4 text-theme-primary transition-all duration-300 transform group-hover:translate-x-0.5" />
        </div>
      </Inline>

      {/* Hover background effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg pointer-events-none"></div>
    </div>
  );
};

export default ComposerCardList;
