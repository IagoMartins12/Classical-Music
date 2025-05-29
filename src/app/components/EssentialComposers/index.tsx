'use client';

import SectionTitle from '../Utils/SectionTitle';
import CarouselControl from '../Carousel';
import { useEffect, useState } from 'react';
import ListComposers from '../Lists/ListComposers';

const EssentialComposers = () => {
  const [actualComposers, setActualComposers] = useState<Composers[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchComposers = async () => {
      setLoading(true);
      setError(null);

      const endpoint = '/api/essentialComposers';

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
  }, []);

  return (
    <section className="section-wrap ">
      <SectionTitle title="Compositores essenciais" />
      <ListComposers composers={actualComposers} />
      {/* <CarouselControl showComposers="essential" /> */}
    </section>
  );
};

export default EssentialComposers;
