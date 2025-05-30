import { Suspense } from 'react';
import ComposersServer from './ComposersServer';
import ComposersLoading from './loading';

export const metadata = {
  title: 'Compositores Clássicos - Lista Completa',
  description:
    'Explore nossa coleção completa de compositores clássicos organizados por época e alfabeticamente.',
};

export const revalidate = 3600;

export default function ComposersPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    epoch?: string;
  };
}) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || '';
  const epochId = searchParams.epoch || '';

  return (
    <Suspense fallback={<ComposersLoading />}>
      <ComposersServer page={page} search={search} epochId={epochId} />
    </Suspense>
  );
}
