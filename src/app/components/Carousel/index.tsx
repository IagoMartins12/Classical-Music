'use client';

import React, { useEffect, useState } from 'react';
import Carousel from './Carousel';

interface CarouselControlsProp {
  showComposers: 'popular' | 'random' | 'essential';
}

const CarouselControl: React.FC<CarouselControlsProp> = ({ showComposers }) => {
  const [actualComposers, setActualComposers] = useState<Composers[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchComposers = async () => {
      setLoading(true);
      setError(null);

      const redirectUrl: Record<string, string> = {
        popular: '/api/popularComposers',
        essential: '/api/essentialComposers',
        random: '/api/randomComposers', // Certifique-se de que esta rota existe
      };

      const endpoint = redirectUrl[showComposers];

      if (!endpoint) {
        setError('Tipo de compositor inválido.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(endpoint);
        if (!res.ok) {
          throw new Error(`Erro na requisição: ${res.statusText}`);
        }
        const data = await res.json();
        setActualComposers(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchComposers();
  }, [showComposers]);

  if (loading) {
    return <div>Carregando compositores...</div>;
  }

  if (error) {
    return <div>Erro ao carregar compositores: {error}</div>;
  }

  return (
    <Carousel
      items={actualComposers}
      itemsPerView={4}
      autoPlay={false}
      autoPlayInterval={4000}
    />
  );
};

export default CarouselControl;
