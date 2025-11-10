'use client';

import Link from 'next/link';
import { FaUser, FaMusic, FaFileAlt } from 'react-icons/fa';

interface RelatedEntitiesProps {
  composerIds: string[];
  workIds: string[];
  scoreIds: string[];
}

async function getComposers(ids: string[]) {
  if (ids.length === 0) return [];
  // Aqui você buscaria os compositores do seu banco
  // Por enquanto, retornando array vazio
  return [];
}

async function getWorks(ids: string[]) {
  if (ids.length === 0) return [];
  // Aqui você buscaria as obras do seu banco
  return [];
}

async function getScores(ids: string[]) {
  if (ids.length === 0) return [];
  // Aqui você buscaria as partituras do seu banco
  return [];
}

export async function RelatedEntities({
  composerIds,
  workIds,
  scoreIds,
}: RelatedEntitiesProps) {
  const [composers, works, scores] = await Promise.all([
    getComposers(composerIds),
    getWorks(workIds),
    getScores(scoreIds),
  ]);

  if (composers.length === 0 && works.length === 0 && scores.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-2">
        <FaMusic className="text-brand-primary" />
        Vinculações
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Compositores */}
        {composers.length > 0 && (
          <div className="classical-card p-6">
            <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
              <FaUser className="text-brand-primary" />
              Compositores Mencionados
            </h3>
            <div className="space-y-3">
              {composers.map((composer: any) => (
                <Link
                  key={composer.id}
                  href={`/composer/${composer.id}`}
                  className="block p-3 rounded-lg bg-theme-elevated hover:bg-theme-classical transition-all group"
                >
                  <div className="font-medium text-theme-primary group-hover:text-brand-primary transition-colors">
                    {composer.name}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    {composer.epochName}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Obras */}
        {works.length > 0 && (
          <div className="classical-card p-6">
            <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
              <FaMusic className="text-brand-primary" />
              Obras Mencionadas
            </h3>
            <div className="space-y-3">
              {works.map((work: any) => (
                <Link
                  key={work.id}
                  href={`/works/${work.id}`}
                  className="block p-3 rounded-lg bg-theme-elevated hover:bg-theme-classical transition-all group"
                >
                  <div className="font-medium text-theme-primary group-hover:text-brand-primary transition-colors line-clamp-1">
                    {work.title}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    {work.composer?.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Partituras */}
        {scores.length > 0 && (
          <div className="classical-card p-6">
            <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
              <FaFileAlt className="text-brand-primary" />
              Partituras Relacionadas
            </h3>
            <div className="space-y-3">
              {scores.map((score: any) => (
                <Link
                  key={score.id}
                  href={`/scores/${score.id}`}
                  className="block p-3 rounded-lg bg-theme-elevated hover:bg-theme-classical transition-all group"
                >
                  <div className="font-medium text-theme-primary group-hover:text-brand-primary transition-colors line-clamp-1">
                    {score.title}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    {score.type}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
