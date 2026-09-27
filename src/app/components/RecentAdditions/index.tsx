// app/components/RecentAdditions/RecentAdditions.tsx
'use client';

import { PiPlus } from 'react-icons/pi';

import SectionTitle from '../Utils/SectionTitle';
import RecentComposerCard from './RecentComposerCard';
import RecentWorkCard, { RecentWorkProps } from './RecentWorkCard';
import { useTranslation } from '@/app/context/TranslationContext';
import { Stack } from '@/app/components/ui/Layout';

export interface RecentComposerProps {
  name: string;
  id: string;
  createdAt: Date;
  fullName: string;
  portraitUrl: string | null;
  epochName: string | null;
}

interface RecentAdditionsProps {
  composers: RecentComposerProps[];
  works: RecentWorkProps[];
}

const RecentAdditions: React.FC<RecentAdditionsProps> = ({
  composers,
  works,
}) => {
  const { t } = useTranslation({ sections: ['pages/home'] });

  return (
    <section className="section-wrap relative !mb-8">
      <SectionTitle
        title={t('recent_additions_title')}
        subtitle={t('recent_additions_subtitle')}
        linkText={t('recent_additions_link_text')}
        linkHref="/composers?sort=recent"
        icon={<PiPlus className="w-6 h-6" />}
        accent="green"
      />

      {/* Grid responsivo */}
      <Stack gap={6} className="mb-12">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-theme-primary classical-title">
            {t('recent_additions_composers_section')}
          </h3>
          <div className="flex-1 h-px bg-linha"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {composers.map((composer) => (
            <RecentComposerCard key={composer.id} composer={composer} />
          ))}
        </div>
      </Stack>

      <Stack gap={6} className="mb-8">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-theme-primary classical-title">
            {t('recent_additions_works_section')}
          </h3>
          <div className="flex-1 h-px bg-linha"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {works.map((work) => (
            <RecentWorkCard key={work.id} work={work} />
          ))}
        </div>
      </Stack>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none"></div>
    </section>
  );
};

export default RecentAdditions;
