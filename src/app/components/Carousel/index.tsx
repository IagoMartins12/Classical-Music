import React, { useEffect, useState } from 'react';
import Carousel from './Carousel';

interface CarouselControl {
  showComposers: 'popular' | 'random' | '';
}
const CarouselControl: React.FC = () => {
  const [actualComposers, setActualComposers] = useState<Composers[]>([]);

  const fetchPopularComposers = async () => {
    const res = await fetch(`/api/popularComposers`);
    const data = await res.json();
    setActualComposers(data);
  };

  useEffect(() => {
    fetchPopularComposers();
  }, []);

  return (
    <>
      <Carousel
        items={actualComposers}
        itemsPerView={4}
        autoPlay={false}
        autoPlayInterval={4000}
      />
    </>
  );
};

export default CarouselControl;
