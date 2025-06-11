// app/components/PopularComposers.tsx - Updated with theme system
'use client';

import { FiTrendingUp } from 'react-icons/fi';
import SectionTitle from '../Utils/SectionTitle';
import Carousel from '../Carousel/Carousel';

export interface composerHomeProps {
  epochName: string;
  id: string;
  name: string;
  epoch: {
    name: string;
  };
  fullName: string;
  portraitUrl: string | null;
}

export interface pageComposersInterface {
  composersData: composerHomeProps[];
}

const PopularComposers: React.FC<pageComposersInterface> = ({
  composersData,
}) => {
  return (
    <section className="section-wrap">
      <SectionTitle
        title="Compositores Populares"
        subtitle="Os grandes mestres mais explorados pela comunidade"
        linkText="Ver todos compositores"
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
