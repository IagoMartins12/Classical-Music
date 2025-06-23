// app/works/page.tsx
import { Suspense } from 'react';
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
  }>;
}

// Gerar metadata para SEO
export async function generateMetadata({ searchParams }: WorksPageProps) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1');

  let title = 'Obras de Música Clássica';
  let description =
    'Explore nossa coleção completa de obras de música clássica organizadas por compositor, gênero e instrumento.';

  if (resolvedParams.search) {
    title = `Busca: "${resolvedParams.search}" - Obras Clássicas`;
    description = `Resultados da busca por "${resolvedParams.search}" em nossa coleção de obras clássicas.`;
  }

  if (page > 1) {
    title += ` - Página ${page}`;
  }

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

// Cache da página por 1 hora
export const revalidate = 3600;

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
