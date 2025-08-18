// app/composers/page.tsx - CORRIGIDO
import { Suspense } from 'react';
import ComposersServer from './pageServer';
import { ListPageLoading } from '@/app/wrappers/SuspenseWrapper';

export const metadata = {
  title: 'Compositores Clássicos - Lista Completa',
  description:
    'Explore nossa coleção completa de compositores clássicos organizados por época e alfabeticamente.',
};

export const revalidate = 3600;

export default async function ComposersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    epoch?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const search = resolvedSearchParams.search || '';
  const epochId = resolvedSearchParams.epoch || '';

  return (
    <Suspense fallback={<ListPageLoading />}>
      <ComposersServer page={page} search={search} epochId={epochId} />
    </Suspense>
  );
}
