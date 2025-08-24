// app/components/EssentialComposers.tsx - Updated for list layout with theme system
'use client';

import { FiAward } from 'react-icons/fi';
import SectionTitle from '../Utils/SectionTitle';
import ListComposers from '../Lists/ListComposers';
import { pageComposersInterface } from '../PopularComposers';
import { useTranslation } from '@/app/hooks/useTranslation';

const EssentialComposers: React.FC<pageComposersInterface> = ({
  composersData,
}) => {
  const { t } = useTranslation({ sections: ['pages/home'] });

  return (
    <section className="section-wrap">
      <SectionTitle
        title={t('essential_composers_title')}
        subtitle={t('essential_composers_subtitle')}
        linkText={t('essential_composers_link_text')}
        linkHref="/composers"
        icon={<FiAward className="w-6 h-6" />}
        accent="purple"
      />

      {/* Background decorative elements */}
      <div className="relative">
        <ListComposers composers={composersData} />
      </div>
    </section>
  );
};

export default EssentialComposers;
