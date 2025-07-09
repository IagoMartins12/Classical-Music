// app/works/page.tsx - VERSÃO ULTRA OTIMIZADA
import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';
import WorksServer from './WorksServer';
import WorksLoading from './loading';

interface WorksPageProps {
  searchParams: Promise<{
    page?: string;
    composer?: string;
    genre?: string;
    instrument?: string;
    epoch?: string;
    search?: string;
    workGenresArr?: string;
    categoryNames?: string;
  }>;
}

// 🚀 CACHE INTELIGENTE PARA METADATA - 2 horas
const getCachedMetadata = unstable_cache(
  async (searchParams: Record<string, string | undefined>) => {
    const page = parseInt(searchParams.page || '1');

    let title = 'Obras de Música Clássica';
    let description =
      'Explore nossa coleção completa de obras de música clássica organizadas por compositor, gênero e instrumento.';

    if (searchParams.search) {
      title = `Busca: "${searchParams.search}" - Obras Clássicas`;
      description = `Resultados da busca por "${searchParams.search}" em nossa coleção de obras clássicas.`;
    } else if (searchParams.composer) {
      title = `Obras por Compositor - Música Clássica`;
      description = `Explore todas as obras deste compositor em nossa coleção.`;
    } else if (searchParams.instrument) {
      title = `Obras para Instrumento - Música Clássica`;
      description = `Descubra obras clássicas para este instrumento específico.`;
    }

    if (page > 1) {
      title += ` - Página ${page}`;
    }

    return { title, description };
  },
  ['works-metadata'],
  {
    revalidate: 7200, // 2 horas
    tags: ['works-metadata'],
  }
);

// Gerar metadata otimizada
export async function generateMetadata({ searchParams }: WorksPageProps) {
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
  };
}

// 🚀 ISR - Regeneração Estática Incremental para páginas populares
export const revalidate = 1800; // 30 minutos (mais agressivo)

export default async function WorksPage({ searchParams }: WorksPageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="">
      <Suspense fallback={<WorksLoading />}>
        <WorksServer searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}

// 🚀 STATIC PARAMS para páginas mais populares (opcional)
export async function generateStaticParams() {
  // Retorna apenas as combinações mais comuns para pré-gerar
  return [
    { page: '1' },
    { composer: 'popular' },
    { instrument: 'piano' },
    // Adicione outros params populares conforme analytics
  ];
}
