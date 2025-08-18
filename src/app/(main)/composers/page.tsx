import ComposersServer from './pageServer';

export const metadata = {
  title: 'Compositores Clássicos - Lista Completa',
  description:
    'Explore nossa coleção completa de compositores clássicos organizados por época e alfabeticamente.',
};

export const revalidate = 3600;

// A função agora é async e searchParams é uma Promise
export default async function ComposersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    epoch?: string;
  }>;
}) {
  // Aguarde a resolução dos searchParams
  const resolvedSearchParams = await searchParams;

  const page = Number(resolvedSearchParams.page) || 1;
  const search = resolvedSearchParams.search || '';
  const epochId = resolvedSearchParams.epoch || '';

  return <ComposersServer page={page} search={search} epochId={epochId} />;
}
