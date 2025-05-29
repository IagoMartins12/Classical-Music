'use client';
import { useEffect, useState } from 'react';

interface Composer {
  id: string;
  name: string;
  link: string;
}

const AllComposerList = () => {
  const [composers, setComposers] = useState<Composer[]>([]);

  useEffect(() => {
    const fetchComposers = async () => {
      try {
        const response = await fetch('/api/allcomposers?start=3');
        const data = await response.json();
        console.log('data', data);
        setComposers(data);
      } catch (error) {
        console.error('Erro ao buscar compositores:', error);
      }
    };

    fetchComposers();
  }, []);

  return (
    <ul>
      {/* {composers.map((composer) => (
        <li key={composer.id}>{composer.name}</li>
      ))} */}
    </ul>
  );
};

export default AllComposerList;
