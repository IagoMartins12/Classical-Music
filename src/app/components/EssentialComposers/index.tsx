// app/components/EssentialComposers.tsx - Updated for list layout with theme system
'use client';

import { FiStar, FiAward } from 'react-icons/fi';
import SectionTitle from '../Utils/SectionTitle';
import ListComposers from '../Lists/ListComposers';
import { pageComposersInterface } from '../PopularComposers';

const EssentialComposers: React.FC<pageComposersInterface> = ({
  composersData,
}) => {
  return (
    <section className="section-wrap">
      <SectionTitle
        title="Compositores Essenciais"
        subtitle="Os pilares fundamentais da música clássica que todo músico deve conhecer"
        linkText="Explorar coleção completa"
        linkHref="/composers"
        icon={<FiAward className="w-6 h-6" />}
        accent="purple"
      />

      {/* Background decorative elements */}
      <div className="relative">
        <div className="absolute top-32 -right-10 w-28 h-28 bg-brand-gradient opacity-5 rounded-full blur-2xl"></div>

        <ListComposers composers={composersData} />
      </div>
    </section>
  );
};

export default EssentialComposers;
