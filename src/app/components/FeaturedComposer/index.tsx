// app/components/FeaturedComposer/FeaturedComposer.tsx
'use client';

import Image from '@/app/components/SmartImage';
import Link from '@/app/components/LocalizedLink';
import {
  PiArrowSquareOut,
  PiCalendarBlank,
  PiMusicNotes,
  PiStar,
  PiUser,
} from 'react-icons/pi';
import FavoriteButton from '../FavoriteButton';
import VerificationBadge from '../Verification/VerificationBadge';
import { translateEpochWithHook } from '@/app/utils/translations/epochTranslationComposer';
import { useTranslation } from '@/app/context/TranslationContext';
import { useComposerBiography } from '@/app/hooks/useComposerBiography';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';
import { Stack } from '@/app/components/ui/Layout';

interface FeaturedComposerProps {
  composer: {
    id: string;
    name: string;
    isVerified?: boolean;
    fullName: string;
    birthDate?: string | null;
    deathDate?: string | null;
    portraitUrl: string | null;
    bio: string | null;
    permLinkImslp: string | null;
    wikipediaLink: string | null;
    epochName: string | null;
    works: {
      id: string;
      title: string;
      imslpPermlink: string;
    }[];
    curiosities: {
      id: string;
      icon: string;
      text: {
        pt: string;
        en: string;
      };
    }[];
  };
}

const FeaturedComposer: React.FC<FeaturedComposerProps> = ({ composer }) => {
  const { t, language } = useTranslation({ sections: ['pages/home'] });
  // ✅ USAR O NOVO HOOK ao invés da biografia do banco diretamente
  const { biography } = useComposerBiography(
    composer.id,
    composer.fullName || composer.name,
    composer.bio // Fallback para a biografia do banco se não tiver no cache
  );
  const formatDates = () => {
    if (!composer.birthDate && !composer.deathDate) return null;

    const birth = composer.birthDate
      ? new Date(composer.birthDate).getFullYear()
      : '?';
    const death = composer.deathDate
      ? new Date(composer.deathDate).getFullYear()
      : language === 'pt'
        ? 'presente'
        : 'present';

    return `${birth} - ${death}`;
  };

  const formatBio = (bio?: string | null) => {
    if (!bio) return '';
    return bio.length > 200 ? `${bio.substring(0, 200)}...` : bio;
  };

  return (
    <div className="section-wrap">
      <div className="relative overflow-hidden rounded-3xl classical-card group hover:scale-[1.01] transition-all duration-700">
        {/* Background Pattern */}
        <div className="absolute inset-0 music-note-background opacity-5"></div>

        <div className="relative py-4 md:p-8 lg:p-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 fill-ouro rounded-2xl flex items-center justify-center">
              <PiMusicNotes className="w-6 h-6 text-theme-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-theme-primary classical-title">
                {t('featured_composer_title')}
              </h2>
              <p className="text-theme-secondary">
                {t('featured_composer_subtitle')}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Portrait Section */}
            <div className="lg:col-span-1 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="relative w-48 h-48 lg:w-72 lg:h-72">
                  {/* Portrait or fallback */}
                  {composer.portraitUrl ? (
                    <Link href={`/composer/${composer.id}`}>
                      <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-ouro/20 group-hover:border-ouro/40 transition-all duration-500 shadow-theme-medium group-hover:shadow-[var(--sombra-2)]">
                        <Image
                          src={composer.portraitUrl}
                          alt={composer.name}
                          fill
                          sizes="224px"
                          className={`object-cover transition-all duration-700 group-hover:scale-110  opacity-100`}
                          priority
                          quality={90}
                        />

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      </div>
                    </Link>
                  ) : (
                    <div className="w-full h-full fill-ouro rounded-3xl flex items-center justify-center border border-ouro/20 group-hover:border-ouro/40 transition-all duration-500 shadow-theme-medium group-hover:shadow-[var(--sombra-2)]">
                      <PiUser className="w-16 h-16 text-theme-inverse" />
                    </div>
                  )}

                  {/* Floating action button */}
                  <div className="absolute -top-2 -right-2 ">
                    <FavoriteButton
                      id={composer.id}
                      type="composer"
                      variant="default"
                      size="lg"
                      itemName={composer.fullName}
                      showToast={true}
                    />
                  </div>
                </div>
              </div>

              {/* Name and dates */}
              <Stack gap={2}>
                <h3 className="text-2xl lg:text-3xl font-bold text-theme-primary classical-title group-hover:text-ouro-texto transition-colors duration-300">
                  {composer.name}
                </h3>

                <span className="text-lg flex justify-center items-center text-theme-secondary font-medium">
                  {composer.fullName}
                  <VerificationBadge
                    verified={composer.isVerified}
                    variant="icon"
                  />
                </span>

                {formatDates() && (
                  <p className="text-theme-tertiary font-medium">
                    {formatDates()}
                  </p>
                )}

                <div className="">
                  <Text
                    papel="rotulo"
                    tom="forte"
                    className="inline-flex items-center px-4 py-2 classical-card-simple rounded-2xl font-semibold shadow-theme-medium"
                  >
                    <PiCalendarBlank className="w-4 h-4 mr-2 text-theme-primary" />
                    {composer.epochName &&
                      translateEpochWithHook(composer.epochName, t)}
                  </Text>
                </div>
              </Stack>

              {/* External links */}
              <div className="flex gap-3 mt-6">
                {composer.wikipediaLink && (
                  <a
                    href={composer.wikipediaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-aviso/10 border border-aviso/20 text-aviso rounded-xl text-sm font-medium hover:bg-aviso/20 hover:scale-105 transition-all duration-300 group/link"
                  >
                    Wikipedia
                    <PiArrowSquareOut className="w-3 h-3 ml-2 opacity-60 group-hover/link:opacity-100" />
                  </a>
                )}
                {composer.permLinkImslp && (
                  <a
                    href={composer.permLinkImslp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-ok/10 border border-ok/20 text-ok rounded-xl text-sm font-medium hover:bg-ok/20 hover:scale-105 transition-all duration-300 group/link"
                  >
                    IMSLP
                    <PiArrowSquareOut className="w-3 h-3 ml-2 opacity-60 group-hover/link:opacity-100" />
                  </a>
                )}
              </div>
            </div>

            {/* Content Section */}
            <Stack gap={8} className="lg:col-span-2">
              {/* Biography */}
              {composer.bio && (
                <Stack>
                  <h4 className="text-xl font-bold text-theme-primary classical-title flex items-center gap-2">
                    <PiUser className="w-5 h-5 text-brand-primary" />
                    {t('featured_composer_biography')}
                  </h4>
                  <p className="text-theme-secondary leading-relaxed text-lg">
                    {formatBio(biography)}
                  </p>
                </Stack>
              )}

              {/* Curiosidades */}
              {composer.curiosities && composer.curiosities.length > 0 && (
                <Stack>
                  <h4 className="text-xl font-bold text-theme-primary classical-title flex items-center gap-2">
                    <PiStar className="w-5 h-5 text-brand-primary" />
                    {t('featured_composer_curiosities')}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {composer.curiosities.map((curiosity, index) => (
                      <div
                        key={curiosity.id}
                        className="flex items-center gap-4 p-4 w-full sm:w-[48%] classical-card-simple hover:scale-[1.02] transition-all duration-300 group/curiosity"
                        style={{
                          animationDelay: `${index * 100}ms`,
                        }}
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-ouro/10 rounded-2xl flex items-center justify-center text-2xl group-hover/curiosity:scale-110 transition-transform duration-300">
                          {curiosity.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-theme-secondary leading-relaxed group-hover/curiosity:text-texto transition-colors duration-300">
                            {curiosity.text[language]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Stack>
              )}

              {/* Famous works */}
              {composer.works.length > 0 && (
                <Stack>
                  <h4 className="text-xl font-bold text-theme-primary classical-title flex items-center gap-2">
                    <PiMusicNotes className="w-5 h-5 text-brand-primary" />
                    {t('featured_composer_works')}
                  </h4>
                  <div className="grid gap-3">
                    {composer.works.map((work) => (
                      <Link href={`/works/${work.id}`} key={work.id}>
                        <Card
                          nivel={2}
                          densidade="compacta"
                          className="flex items-center justify-between hover:scale-[1.02] transition-all duration-300 group/work"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-ouro rounded-full animate-pulse"></div>
                            <span className="text-theme-primary font-medium group-hover/work:text-ouro-texto transition-colors">
                              {work.title}
                            </span>
                          </div>
                          <div className="text-theme-tertiary hover:text-ouro-texto transition-colors">
                            <PiArrowSquareOut className="w-4 h-4" />
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </Stack>
              )}

              {/* CTA Button */}
              <div className="pt-6">
                <Link
                  href={`/composer/${composer.id}`}
                  className="inline-flex items-center px-8 py-4 fill-ouro text-theme-primary font-semibold rounded-2xl hover:scale-105 hover:shadow-[var(--sombra-2)] transition-all duration-300 group/cta"
                >
                  {t('featured_composer_explore_all')}
                  <svg
                    className="ml-2 w-5 h-5 transition-transform group-hover/cta:translate-x-1"
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
              </div>
            </Stack>
          </div>

          {/* Floating decoration */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-ouro/10 rounded-3xl flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity duration-500">
            <PiMusicNotes className="w-8 h-8 text-brand-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedComposer;
