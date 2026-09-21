// app/teachers/pageServer.tsx - Server Component para Professores Públicos

import { getPublicTeachers } from '@/app/requests/public-teachers-requests';
import PublicTeachersPageClient from './pageClient';
import { Suspense } from 'react';
import ComumnLoading from './TeachersLoading';

interface PublicTeachersPageServerProps {
  filters: {
    instrument?: string;
    specialty?: string;
    skillLevel?: string;
    ageGroup?: string;
    location?: string;
    verified?: boolean;
    sortBy?: string;
    page?: number;
  };
}

export default async function PublicTeachersPageServer({
  filters,
}: PublicTeachersPageServerProps) {
  console.log(
    `👨‍🏫 [PUBLIC-TEACHERS-PAGE-SERVER] Loading with filters:`,
    filters
  );

  const limit = 12;
  const offset = ((filters.page || 1) - 1) * limit;

  // Buscar professores públicos
  console.log('🔍 Loading public teachers...');
  const teachersData = await getPublicTeachers({
    instrument: filters.instrument,
    specialty: filters.specialty,
    skillLevel: filters.skillLevel,
    ageGroup: filters.ageGroup,
    location: filters.location,
    verified: filters.verified,
    sortBy: filters.sortBy as any,
    limit,
    offset,
  });

  if (!teachersData) {
    // Em tempo de execução, falhar alto é o certo: melhor um 500 do que uma
    // página em cache dizendo que não há professor nenhum. No build do CI,
    // onde não existe API, a página é gerada vazia e se preenche na primeira
    // revalidação — ver `libs/api/build-tolerance`.
    if (
      process.env.NEXT_PHASE !== 'phase-production-build' ||
      process.env.ALLOW_BUILD_WITHOUT_API !== 'true'
    ) {
      throw new Error('Failed to load teachers data');
    }

    console.warn('[build] /teachers: a API não respondeu; página vazia.');

    return null;
  }

  console.log(
    `✅ [PUBLIC-TEACHERS-PAGE-SERVER] Loaded ${teachersData.teachers.length} teachers successfully`
  );

  return (
    <Suspense fallback={<ComumnLoading />}>
      <PublicTeachersPageClient
        initialData={teachersData}
        currentFilters={filters}
      />
    </Suspense>
  );
}
