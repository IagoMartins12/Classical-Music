// app/(teacher)/teacher/students/[studentId]/progress/pageServer.tsx - Server Component para Relatório de Progresso

import { notFound } from 'next/navigation';
import TeacherProgressPageClient from './pageClient';

interface TeacherProgressPageServerProps {
  studentId: string;
  userId: string;
  initialPeriod: string;
  customStartDate?: string;
  customEndDate?: string;
}

export default async function TeacherProgressPageServer({
  studentId,
  userId,
  initialPeriod,
  customStartDate,
  customEndDate,
}: TeacherProgressPageServerProps) {
  console.log(
    `📊 [TEACHER-PROGRESS-PAGE-SERVER] Loading progress report for student ${studentId} by teacher ${userId}`
  );

  try {
    // Build query parameters for the API call
    const params = new URLSearchParams({
      period: initialPeriod,
    });

    if (customStartDate) {
      params.append('startDate', customStartDate);
    }
    if (customEndDate) {
      params.append('endDate', customEndDate);
    }

    // Fetch initial data from our API route
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/teacher/students/${studentId}/progress-report?${params}`,
      {
        headers: {
          'Content-Type': 'application/json',
          // Include session cookies for server-side request
          ...(process.env.NODE_ENV === 'production' && {
            Cookie: '', // In production, you might need to pass cookies
          }),
        },
      }
    );

    if (response.status === 404) {
      console.log(
        `❌ [TEACHER-PROGRESS-PAGE-SERVER] Student not found or no access: ${studentId}`
      );
      return notFound();
    }

    if (!response.ok) {
      return (
        <TeacherProgressPageClient
          studentId={studentId}
          initialData={null}
          errorMessage={`Erro ao carregar relatório: ${response.status}`}
          initialPeriod={initialPeriod as any}
        />
      );
    }

    const data = await response.json();

    if (!data.success) {
      console.error(
        `❌ [TEACHER-PROGRESS-PAGE-SERVER] API returned error:`,
        data.error
      );
      return (
        <TeacherProgressPageClient
          studentId={studentId}
          initialData={null}
          errorMessage={data.error}
          initialPeriod={initialPeriod as any}
        />
      );
    }

    console.log(
      `✅ [TEACHER-PROGRESS-PAGE-SERVER] Progress report loaded successfully`
    );

    return (
      <TeacherProgressPageClient
        studentId={studentId}
        initialData={data.report}
        initialPeriod={initialPeriod as any}
      />
    );
  } catch (error) {
    console.error(
      '❌ [TEACHER-PROGRESS-PAGE-SERVER] Critical error loading progress report:',
      error
    );

    // Return client component with error message instead of throwing
    return (
      <TeacherProgressPageClient
        studentId={studentId}
        initialData={null}
        errorMessage="Erro interno do servidor. Tente novamente mais tarde."
        initialPeriod={initialPeriod as any}
      />
    );
  }
}
