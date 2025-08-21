// app/teachers/pageServer.tsx - Server Component para Professores Públicos

import { getPublicTeachers } from '@/app/requests/public-teachers-requests';
import PublicTeachersPageClient from './pageClient';
import { Suspense } from 'react';
import ComumnLoading from './loading';

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
    throw new Error('Failed to load teachers data');
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
