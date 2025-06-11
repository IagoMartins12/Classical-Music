import React from 'react';
import Carousel from './Carousel';
import { composerHomeProps } from '../PopularComposers';

interface CarouselControlsProp {
  popularComposers: composerHomeProps[];
}

const CarouselControl: React.FC<CarouselControlsProp> = ({
  popularComposers,
}) => {
  return (
    <Carousel
      items={popularComposers}
      itemsPerView={4}
      autoPlay={false}
      autoPlayInterval={4000}
    />
  );
};

export default CarouselControl;
