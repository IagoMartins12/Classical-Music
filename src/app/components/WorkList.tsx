'use client';
import { useState } from 'react';
import { Obra } from '../types/obra';

type Props = {
  works: Obra[];
};

export default function WorkList({ works }: Props) {
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = async (work: Obra) => {
    await fetch('/api/favoritos', {
      method: 'POST',
      body: JSON.stringify(work),
    });
    setFavorites((prev) => [...prev, work.title]);
  };

  console.log('works', works);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Obras</h2>
      <ul className="space-y-3">
        {works.map((work) => (
          <li key={work.id} className="border p-4 rounded shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">{work.title}</h3>
                <p className="text-sm text-gray-500">{work.genre}</p>
                {work.subtitle && <p>{work.subtitle}</p>}
              </div>
              <button
                onClick={() => toggleFavorite(work)}
                className="text-sm text-blue-600 hover:underline"
              >
                Favoritar
              </button>
            </div>
            {work.youtube && (
              <div className="mt-2">
                <iframe
                  width="100%"
                  height="200"
                  src={`https://www.youtube.com/embed/${work.youtube}`}
                  title="YouTube Video"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
