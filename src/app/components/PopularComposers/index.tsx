// app/components/PopularComposers.tsx - Updated with theme system
'use client';

import { FiTrendingUp } from 'react-icons/fi';
import SectionTitle from '../Utils/SectionTitle';
import Carousel from '../Carousel/Carousel';
import { useTranslation } from '@/app/context/TranslationContext';

export interface composerHomeProps {
  epochName: string;
  id: string;
  name: string;
  epoch: {
    name: string;
  };
  fullName: string;
  portraitUrl: string | null;
  isVerified: boolean;
}

export interface pageComposersInterface {
  composersData: composerHomeProps[];
}

const PopularComposers: React.FC<pageComposersInterface> = ({
  composersData,
}) => {
  const { t } = useTranslation({
    sections: ['pages/home'],
  });

  return (
    <section className="section-wrap">
      <SectionTitle
        title={t('popular_composers')}
        subtitle={t('master_composers')}
        linkText={t('see_all_composers')}
        linkHref="/composers"
        icon={<FiTrendingUp className="w-6 h-6" />}
        accent="gold"
      />

      {/* Background decorative elements */}
      <div className="relative">
        <Carousel
          items={composersData}
          itemsPerView={4}
          autoPlay={false}
          autoPlayInterval={4000}
        />
      </div>
    </section>
  );
};

export default PopularComposers;
