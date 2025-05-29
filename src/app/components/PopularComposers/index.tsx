'use client';

import { useEffect, useState } from 'react';
import SectionTitle from '../Utils/SectionTitle';
import CarouselControl from '../Carousel';

const PopularComposers = () => {
  return (
    <section className="section-wrap ">
      <SectionTitle title="Compositores populares" />
      <CarouselControl showComposers="popular" />
    </section>
  );
};

export default PopularComposers;
