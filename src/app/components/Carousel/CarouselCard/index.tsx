// app/components/Carousel/CarouselCard.tsx - Sophisticated version with theme system
'use client';

import { CarouselCardProps } from '@/app/types/types';
import LazyImage from '../../LazyImage';
import Link from '@/app/components/LocalizedLink';
import { PiCalendarBlank, PiMusicNotes, PiUser } from 'react-icons/pi';
import FavoriteButton from '../../FavoriteButton';
import VerificationBadge from '../../Verification/VerificationBadge';
import { useTranslation } from '@/app/context/TranslationContext';
import { translateEpochWithHook } from '@/app/utils/translations/epochTranslationComposer';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

const CarouselCard: React.FC<CarouselCardProps> = ({
  item,
  isActive,
  isMobile,
}) => {
  const { t, language } = useTranslation({ sections: ['pages/home'] });
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
            <div className="absolute block md:hidden inset-0 bg-black/30"></div>

            {/* Floating Action Buttons */}
            <Stack
              gap={2}
              className="absolute top-4 right-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
            >
              {/* Favorite Button */}
              <FavoriteButton
                id={item.id}
                type="composer"
                variant="small"
                size="md"
                itemName={item.fullName}
                showToast={true}
                highlightMobile
                isMobile={isMobile}
              />
            </Stack>

            {/* Period Badge */}
            {item.epochName && (
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                <span className="inline-flex items-center px-3 py-1 backdrop-blur-md rounded-full text-xs font-medium text-white bg-sup-2">
                  <PiCalendarBlank className="w-3 h-3 mr-1" />
                  {translateEpochWithHook(
                    translateEpochWithHook(item.epochName, t),
                    t
                  )}
                </span>
              </div>
            )}

            {/* Musical Note Decoration */}
            <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-30 transition-all duration-500 transform scale-150 group-hover:scale-100">
              <PiMusicNotes className="w-6 h-6 text-ouro-texto" />
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 pb-0 md:p-6 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 music-note-background"></div>

            {/* Name and Info */}
            <div className="relative z-10">
              <h3 className="font-bold !flex items-center gap-2 text-theme-primary text-lg classical-title mb-2 transition-colors duration-300 line-clamp-2">
                {item.fullName || item.name}

                <VerificationBadge verified={item.isVerified} variant="icon" />
              </h3>

              {/* Subtitle with epoch info */}
              {item.epochName && (
                <Text
                  papel="rotulo"
                  tom="suave"
                  as="p"
                  className="mb-3 flex items-center"
                >
                  <PiUser className="w-3 h-3 mr-1 opacity-60" />

                  {language === 'en' ? (
                    <>
                      {translateEpochWithHook(
                        translateEpochWithHook(item.epochName, t),
                        t
                      )}{' '}
                      {t('random_discoveries_composer_badge')}
                    </>
                  ) : (
                    <>
                      {t('random_discoveries_composer_badge')}{' '}
                      {translateEpochWithHook(
                        translateEpochWithHook(item.epochName, t),
                        t
                      )}
                    </>
                  )}
                </Text>
              )}

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-theme-secondary">
                <Inline gap={2}>
                  <div className="w-2 h-2 rounded-full animate-pulse"></div>
                  <Text papel="legenda" tom="fraco" className="font-medium">
                    {t('home_quick_actions_explore')}
                  </Text>
                </Inline>

                {/* Arrow indicator */}
                <div className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300">
                  <svg
                    className="w-3 h-3 text-theme-primary transition-all duration-300 transform group-hover:translate-x-0.5"
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
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-b-2xl"></div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CarouselCard;
