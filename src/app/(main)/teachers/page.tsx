// ================================
// app/public/teachers/page.tsx - CORRIGIDO
// ================================
import { Metadata } from 'next';
import { Suspense } from 'react';
import PublicTeachersPageServer from './pageServer';
import { ListPageLoading } from '@/app/wrappers/SuspenseWrapper';

export const metadata: Metadata = {
  title: 'Conheça Nossos Professores | Opus Atlas',
  description:
    'Encontre o professor ideal para suas aulas de música. Navegue por perfis verificados, especialidades e avaliações de alunos.',
  keywords:
    'professores de música, aulas de música, professores particulares, ensino musical, instrumento musical, aulas online',
};

interface PublicTeachersPageProps {
  searchParams?: Promise<{
    instrument?: string;
    specialty?: string;
    skillLevel?: string;
    ageGroup?: string;
    location?: string;
    verified?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export default async function PublicTeachersPage({
  searchParams,
}: PublicTeachersPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = {
    instrument: resolvedSearchParams?.instrument,
    specialty: resolvedSearchParams?.specialty,
    skillLevel: resolvedSearchParams?.skillLevel,
    ageGroup: resolvedSearchParams?.ageGroup,
    location: resolvedSearchParams?.location,
    verified: resolvedSearchParams?.verified === 'true',
    sortBy: resolvedSearchParams?.sortBy || 'rating',
    page: parseInt(resolvedSearchParams?.page || '1'),
  };

  return (
    <Suspense fallback={<ListPageLoading />}>
      <PublicTeachersPageServer filters={filters} />
    </Suspense>
  );
}
