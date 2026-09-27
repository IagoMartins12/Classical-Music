// app/components/RandomDiscoveries/RandomDiscoveries.tsx
'use client';

import {
  PiEye,
  PiMapTrifold,
  PiMusicNotes,
  PiPianoKeys,
  PiShuffle,
  PiUser,
} from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import Link from '@/app/components/LocalizedLink';
import { useState } from 'react';
import SectionTitle from '../Utils/SectionTitle';
import { translateEpochWithHook } from '@/app/utils/translations/epochTranslationComposer';
import { useTranslation } from '@/app/context/TranslationContext';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface Composer {
  id: string;
  name: string;
  fullName: string;
  portraitUrl?: string | null;
  epochName: string;
}

interface Work {
  id: string;
  title: string;
  imslpPermlink: string;
  tone?: string | null;
  epochName: string;
  instrumentName: string;
  composerName: string;
  composer: {
    id: string;
    name: string;
    fullName: string;
    portraitUrl?: string | null;
  };
}

interface RandomDiscoveriesProps {
  composers: Composer[];
  works: Work[];
}

const DiscoveryComposerCard = ({ composer }: { composer: Composer }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation({ sections: ['pages/home'] });

  return (
    <div className="group cursor-pointer select-none">
      <Link href={`/composer/${composer.id}`}>
        <div className="classical-card overflow-hidden transition-all duration-700 ease-out group-hover:-translate-y-1 relative">
          {/* Discovery badge */}
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-sup-2 backdrop-blur-md rounded-full px-2 py-1 text-xs font-medium text-ouro-texto flex items-center gap-1">
              <PiMapTrifold className="w-2.5 h-2.5" />
              {t('random_discoveries_composer_badge')}
            </div>
          </div>

          {/* Portrait Section */}
          <div className="relative p-5 pb-3">
            <div className="flex justify-center mb-3">
              <div className="relative w-16 h-16">
                {/* Loading skeleton */}
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 loading-skeleton rounded-full"></div>
                )}

                {/* Portrait image or fallback */}
                {composer.portraitUrl && !imageError ? (
                  <div className="relative w-full h-full rounded-full overflow-hidden transition-all duration-500">
                    <Image
                      src={composer.portraitUrl}
                      alt={composer.name}
                      fill
                      sizes="64px"
                      className={`object-cover transition-all duration-700 group-hover:scale-110 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full fundo-sup-2 rounded-full flex items-center justify-center transition-all duration-500">
                    <PiUser className="w-6 h-6 text-ouro-texto" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-5 pb-5 relative">
            <Stack gap={2} className="relative z-10 text-center">
              {/* Name */}
              <h3 className="text-sm font-bold text-theme-primary classical-title group-hover:text-ouro-texto transition-colors duration-300 line-clamp-2">
                {composer.name}
              </h3>

              {/* Period info */}
              <div className="flex justify-center">
                <Text
                  papel="legenda"
                  tom="fraco"
                  className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-sup-2"
                >
                  <PiMusicNotes className="w-2 h-2 mr-1" />
                  {translateEpochWithHook(composer.epochName, t)}
                </Text>
              </div>

              {/* Action indicator */}
              <div className="flex items-center justify-center pt-2 border-t border-linha">
                <Inline gap={1} className="text-theme-tertiary text-xs">
                  <div className="w-1 h-1 bg-texto-fraco rounded-full"></div>
                  <span className="font-medium">
                    {t('random_discoveries_explore')}
                  </span>
                  <PiEye className="w-2.5 h-2.5" />
                </Inline>
              </div>
            </Stack>
          </div>

          {/* Hover glow effect */}
        </div>
      </Link>
    </div>
  );
};

const DiscoveryWorkCard = ({ work }: { work: Work }) => {
  const { t } = useTranslation({ sections: ['pages/home'] });

  const formatTitle = (title: string) => {
    return title.length > 40 ? `${title.substring(0, 40)}...` : title;
  };

  return (
    <div className="group cursor-pointer select-none">
      <Link href={`/works/${work.id}`}>
        <div className="classical-card overflow-hidden transition-all duration-700 ease-out group-hover:-translate-y-1 relative">
          {/* Discovery badge */}
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-sup-2 backdrop-blur-md rounded-full px-2 py-1 text-xs font-medium text-ouro-texto flex items-center gap-1">
              <PiPianoKeys className="w-2.5 h-2.5" />
              {t('random_discoveries_work_badge')}
            </div>
          </div>

          {/* Music icon section */}
          <div className="relative p-5 pb-3">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 fundo-sup-2 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110">
                <PiMusicNotes className="w-6 h-6 text-ouro-texto" />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-5 pb-5 relative">
            <Stack gap={2} className="relative z-10 text-center">
              {/* Title */}
              <h3 className="text-sm font-bold text-theme-primary classical-title group-hover:text-ouro-texto transition-colors duration-300 line-clamp-2">
                {formatTitle(work.title)}
              </h3>

              {/* Composer */}
              <Text papel="legenda" tom="suave" as="p" className="line-clamp-1">
                {work.composerName}
              </Text>

              {/* Details */}
              <div className="flex justify-center flex-wrap gap-1">
                <Text
                  papel="legenda"
                  tom="fraco"
                  className="inline-flex items-center px-1.5 py-0.5 rounded bg-sup-2"
                >
                  {work.instrumentName}
                </Text>
                {work.tone && (
                  <span className="inline-flex items-center px-1.5 py-0.5 bg-sup-2 text-ouro-texto rounded text-xs">
                    {work.tone}
                  </span>
                )}
              </div>

              {/* Action indicator */}
              <div className="flex items-center justify-center pt-2 border-t border-linha">
                <Inline gap={1} className="text-theme-tertiary text-xs">
                  <div className="w-1 h-1 bg-texto-fraco rounded-full"></div>
                  <span className="font-medium">
                    {t('random_discoveries_study')}
                  </span>
                  <PiMusicNotes className="w-2.5 h-2.5" />
                </Inline>
              </div>
            </Stack>
          </div>

          {/* Hover glow effect */}
        </div>
      </Link>
    </div>
  );
};

const RandomDiscoveries: React.FC<RandomDiscoveriesProps> = ({
  works,
  composers,
}) => {
  const { t } = useTranslation({ sections: ['pages/home'] });

  return (
    <section className="section-wrap relative !mb-8">
      <SectionTitle
        title={t('random_discoveries_title')}
        subtitle={t('random_discoveries_subtitle')}
        linkText={t('random_discoveries_link_text')}
        linkHref="/composers?random=true"
        icon={<PiShuffle className="w-6 h-6" />}
      />

      {/* Seção de Compositores */}
      <Stack gap={6} className="mb-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 fundo-sup-2 rounded-xl flex items-center justify-center">
            <PiUser className="w-4 h-4 text-ouro-texto" />
          </div>
          <h3 className="text-xl font-bold text-theme-primary classical-title">
            {t('random_discoveries_composers_section')}
          </h3>
          <div className="flex-1 h-px bg-linha"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {composers.map((composer) => (
            <DiscoveryComposerCard key={composer.id} composer={composer} />
          ))}
        </div>
      </Stack>

      {/* Seção de Obras */}
      <Stack gap={6} className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 fundo-sup-2 rounded-xl flex items-center justify-center">
            <PiMusicNotes className="w-4 h-4 text-ouro-texto" />
          </div>
          <h3 className="text-xl font-bold text-theme-primary classical-title">
            {t('random_discoveries_works_section')}
          </h3>
          <div className="flex-1 h-px bg-linha"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {works.map((work) => (
            <DiscoveryWorkCard key={work.id} work={work} />
          ))}
        </div>
      </Stack>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none"></div>
    </section>
  );
};

export default RandomDiscoveries;
