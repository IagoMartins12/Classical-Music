'use client';

import Link from 'next/link';
import { PiFileText, PiMusicNotes, PiUser } from 'react-icons/pi';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';
import { Stack } from '@/app/components/ui/Layout';

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
    <Stack gap={8}>
      <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-2">
        <PiMusicNotes className="text-ouro-texto" />
        Vinculações
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Compositores */}
        {composers.length > 0 && (
          <Card>
            <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
              <PiUser className="text-ouro-texto" />
              Compositores Mencionados
            </h3>
            <Stack gap={3}>
              {composers.map((composer: any) => (
                <Link
                  key={composer.id}
                  href={`/composer/${composer.id}`}
                  data-vira={`compositor-${composer.id}`}
                  className="block p-3 rounded-lg bg-theme-elevated transition-all group"
                >
                  <div className="font-medium text-theme-primary transition-colors">
                    {composer.name}
                  </div>
                  <Text papel="rotulo" tom="fraco" as="div">
                    {composer.epochName}
                  </Text>
                </Link>
              ))}
            </Stack>
          </Card>
        )}

        {/* Obras */}
        {works.length > 0 && (
          <Card>
            <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
              <PiMusicNotes className="text-ouro-texto" />
              Obras Mencionadas
            </h3>
            <Stack gap={3}>
              {works.map((work: any) => (
                <Link
                  key={work.id}
                  href={`/works/${work.id}`}
                  data-vira={`obra-${work.id}`}
                  className="block p-3 rounded-lg bg-theme-elevated transition-all group"
                >
                  <div className="font-medium text-theme-primary transition-colors line-clamp-1">
                    {work.title}
                  </div>
                  <Text papel="rotulo" tom="fraco" as="div">
                    {work.composer?.name}
                  </Text>
                </Link>
              ))}
            </Stack>
          </Card>
        )}

        {/* Partituras */}
        {scores.length > 0 && (
          <Card>
            <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
              <PiFileText className="text-ouro-texto" />
              Partituras Relacionadas
            </h3>
            <Stack gap={3}>
              {scores.map((score: any) => (
                <Link
                  key={score.id}
                  href={`/scores/${score.id}`}
                  className="block p-3 rounded-lg bg-theme-elevated transition-all group"
                >
                  <div className="font-medium text-theme-primary transition-colors line-clamp-1">
                    {score.title}
                  </div>
                  <Text papel="rotulo" tom="fraco" as="div">
                    {score.type}
                  </Text>
                </Link>
              ))}
            </Stack>
          </Card>
        )}
      </div>
    </Stack>
  );
}
