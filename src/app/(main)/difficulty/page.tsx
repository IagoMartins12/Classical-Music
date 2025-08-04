// app/difficulty/page.tsx - Página Principal de Dificuldade

import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';
import DifficultyServer from './DifficultyServer';
import DifficultyLoading from './loading';

interface DifficultyPageProps {
  searchParams: Promise<{
    instrument?: string;
    level?: string;
    system?: string;
    search?: string;
    page?: string;
  }>;
}

// 🚀 CACHE PARA METADATA
const getCachedMetadata = unstable_cache(
  async (searchParams: Record<string, string | undefined>) => {
    let title = 'Níveis de Dificuldade - Música Clássica';
    let description =
      'Explore obras de música clássica organizadas por nível de dificuldade baseado nos sistemas IMSLP e RCM.';

    if (searchParams.instrument) {
      title = `Níveis de Dificuldade - ${searchParams.instrument} - Música Clássica`;
      description = `Descubra obras para ${searchParams.instrument} organizadas por nível de dificuldade.`;
    }

    if (searchParams.level) {
      title += ` - Nível ${searchParams.level}`;
    }

    return { title, description };
  },
  ['difficulty-metadata'],
  { revalidate: 7200, tags: ['difficulty-metadata'] }
);

// GERAR METADATA
export async function generateMetadata({ searchParams }: DifficultyPageProps) {
  const resolvedParams = await searchParams;
  const { title, description } = await getCachedMetadata(resolvedParams);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    keywords: [
      'música clássica',
      'níveis de dificuldade',
      'IMSLP',
      'RCM',
      'partituras',
      'graus de dificuldade',
      'estudo musical',
    ],
  };
}

export const revalidate = 1800; // 30 minutos

export default async function DifficultyPage({
  searchParams,
}: DifficultyPageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="min-h-screen">
      <Suspense fallback={<DifficultyLoading />}>
        <DifficultyServer searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}

// STATIC PARAMS para páginas populares
export async function generateStaticParams() {
  return [
    { instrument: 'all' },
    { instrument: 'piano' },
    { instrument: 'violin' },
    { level: '1' },
    { level: '5' },
  ];
}
