import React, { useState } from 'react';
import ListComposersCards from '../Cards/ListComposersCard';
import { composerHomeProps } from '../../PopularComposers';
import { useRouter } from 'next/router';
import { useNavigate } from '@/app/hooks/useNavigate';

interface listComposersProps {
  composers: composerHomeProps[];
}

const ListComposers: React.FC<listComposersProps> = ({ composers }) => {
  const [activeComposerId, setActiveComposerId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  const { navigateToUrl } = useNavigate();
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const visibleComposers = composers.slice(0, visibleCount);

  return (
    <div className="flex flex-wrap w-full mx-auto py-6">
      {visibleComposers.map((composer) => (
        <div
          className="w-[50%] sm:w-[25%] lg:w-[20%] p-2"
          key={composer.id}
          onMouseEnter={() => setActiveComposerId(Number(composer.id))}
          onMouseLeave={() => setActiveComposerId(null)}
        >
          <ListComposersCards
            composer={composer}
            isActive={activeComposerId === Number(composer.id)}
          />
        </div>
      ))}

      {visibleCount < composers.length ? (
        <div className="w-full flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Mais compositores
          </button>
        </div>
      ) : (
        <div className="w-full flex justify-center mt-6">
          <button
            onClick={() => navigateToUrl('composers')}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Ver todos compositores
          </button>
        </div>
      )}
    </div>
  );
};

export default ListComposers;
