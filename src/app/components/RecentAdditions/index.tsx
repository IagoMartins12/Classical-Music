// app/components/RecentAdditions/RecentAdditions.tsx
'use client';

import { FiPlus } from 'react-icons/fi';

import SectionTitle from '../Utils/SectionTitle';
import RecentComposerCard from './RecentComposerCard';
import RecentWorkCard, { RecentWorkProps } from './RecentWorkCard';
import { useTranslation } from '@/app/hooks/useTranslation';

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
        icon={<FiPlus className="w-6 h-6" />}
        accent="green"
      />

      {/* Grid responsivo */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-xl font-bold text-theme-primary classical-title">
            {t('recent_additions_composers_section')}
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-orange-500/20 to-transparent"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {composers.map((composer) => (
            <RecentComposerCard key={composer.id} composer={composer} />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-xl font-bold text-theme-primary classical-title">
            {t('recent_additions_works_section')}
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-purple-500/20 to-transparent"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {works.map((work) => (
            <RecentWorkCard key={work.id} work={work} />
          ))}
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 right-16 w-32 h-32 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-16 left-16 w-24 h-24 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

export default RecentAdditions;
