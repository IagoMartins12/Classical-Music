// app/public/teachers/[id]/pageServer.tsx - Server Component para Detalhes do Professor

import { notFound } from 'next/navigation';
import { getPublicTeacherDetails } from '@/app/requests/public-teachers-requests';
import PublicTeacherDetailsPageClient from './pageClient';

interface PublicTeacherDetailsPageServerProps {
  teacherId: string;
}

export default async function PublicTeacherDetailsPageServer({
  teacherId,
}: PublicTeacherDetailsPageServerProps) {
  console.log(
    `👨‍🏫 [TEACHER-DETAILS-PAGE-SERVER] Loading teacher details for ID: ${teacherId}`
  );

  try {
    // Buscar detalhes completos do professor
    console.log('🔍 Loading teacher detailed profile...');
    const teacherDetails = await getPublicTeacherDetails(teacherId);

    if (!teacherDetails) {
      console.log(
        `❌ [TEACHER-DETAILS-PAGE-SERVER] Teacher ${teacherId} not found`
      );
      notFound();
    }

    console.log(
      `✅ [TEACHER-DETAILS-PAGE-SERVER] Teacher details loaded successfully: ${teacherDetails.name}`
    );

    return <PublicTeacherDetailsPageClient teacher={teacherDetails} />;
  } catch (error) {
    console.error('❌ [TEACHER-DETAILS-PAGE-SERVER] Critical error:', error);

    // Em caso de erro crítico, mostrar 404
    notFound();
  }
}
