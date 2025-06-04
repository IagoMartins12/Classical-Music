'use client';

import SectionTitle from '../Utils/SectionTitle';
import CarouselControl from '../Carousel';
import { useEffect, useState } from 'react';
import ListComposers from '../Lists/ListComposers';
import { pageComposersInterface } from '../PopularComposers';

const EssentialComposers: React.FC<pageComposersInterface> = ({
  composersData,
}) => {
  return (
    <section className="section-wrap ">
      <SectionTitle title="Compositores essenciais" />
      <ListComposers composers={composersData} />
      {/* <CarouselControl showComposers="essential" /> */}
    </section>
  );
};

export default EssentialComposers;
