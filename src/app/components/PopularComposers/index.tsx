'use client';

import { useEffect, useState } from 'react';
import SectionTitle from '../Utils/SectionTitle';
import CarouselControl from '../Carousel';
import { Composer } from '@prisma/client';
import { ComposerImslp } from '../ComposersClient';
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
    <section className="section-wrap ">
      <SectionTitle title="Compositores populares" />
      <Carousel
        items={composersData}
        itemsPerView={4}
        autoPlay={false}
        autoPlayInterval={4000}
      />
    </section>
  );
};

export default PopularComposers;
