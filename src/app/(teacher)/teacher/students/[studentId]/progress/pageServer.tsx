// app/(teacher)/teacher/students/[studentId]/progress/pageServer.tsx - Relatório de Progresso (API, Etapa 4)

import { notFound } from 'next/navigation';
import TeacherProgressPageClient from './pageClient';
import { getServerAccessToken } from '@/app/libs/api/server-session';
import { loadTeacherProgressReport } from '@/app/requests/portal/progress-report';
import type { PeriodOption } from '@/app/types/teacherProgressReport';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';

interface TeacherProgressPageServerProps {
  studentId: string;
  initialPeriod: string;
  customStartDate?: string;
  customEndDate?: string;
}

export default async function TeacherProgressPageServer({
  studentId,
  initialPeriod,
  customStartDate,
  customEndDate,
}: TeacherProgressPageServerProps) {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'teacher/progress',
  ]);

  const period = initialPeriod as PeriodOption;
  const custom =
    customStartDate && customEndDate
      ? { start: new Date(customStartDate), end: new Date(customEndDate) }
      : undefined;

  const renderClient = (
    initialData: Awaited<ReturnType<typeof loadTeacherProgressReport>>,
    errorMessage?: string
  ) => (
    <TranslationProvider language={language} translations={translations}>
      <TeacherProgressPageClient
        studentId={studentId}
        initialData={initialData}
        errorMessage={errorMessage}
        initialPeriod={period}
      />
    </TranslationProvider>
  );

  const token = await getServerAccessToken();

  if (!token) {
    return renderClient(null, 'Sessão expirada. Entre novamente.');
  }

  let report: Awaited<ReturnType<typeof loadTeacherProgressReport>>;

  try {
    report = await loadTeacherProgressReport(studentId, period, custom, token);
  } catch (error) {
    console.error(
      '❌ [TEACHER-PROGRESS-PAGE-SERVER]',
      error instanceof Error ? error.message : error
    );
    return renderClient(
      null,
      error instanceof Error && error.message
        ? `Erro ao carregar relatório: ${error.message}`
        : 'Erro interno do servidor. Tente novamente mais tarde.'
    );
  }

  // Aluno fora dos vínculos do professor.
  if (!report) {
    return notFound();
  }

  return renderClient(report);
}
