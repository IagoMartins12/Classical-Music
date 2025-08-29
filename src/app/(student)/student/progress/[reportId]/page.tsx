// app/(student)/student/progress/[reportId]/page.tsx - Página para Visualizar Relatório Compartilhado

import { Metadata } from 'next';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import StudentSharedReportPageClient from './pageClient';

export const metadata: Metadata = {
  title: 'Relatório de Progresso | Aluno - Opus Atlas',
  description:
    'Visualize seu relatório detalhado de progresso criado pelo seu professor',
  keywords:
    'relatório progresso aluno, feedback professor, evolução musical, desenvolvimento estudante',
  openGraph: {
    title: 'Relatório de Progresso - Aluno',
    description:
      'Visualize seu relatório detalhado de progresso e conquistas musicais',
    type: 'website',
  },
};

interface StudentSharedReportPageParams {
  reportId: string;
}

interface StudentSharedReportPageProps {
  params: Promise<StudentSharedReportPageParams>;
}

export default async function StudentSharedReportPage({
  params,
}: StudentSharedReportPageProps) {
  const paramsResolved = await params;
  const session = await getRequiredServerSession();

  // Fetch initial data on server
  let initialData = null;
  let errorMessage = null;

  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/student/progress/${paramsResolved.reportId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          // In production, you might need to handle cookies properly
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        initialData = data.report;
      } else {
        errorMessage = data.error;
      }
    } else {
      if (response.status === 404) {
        errorMessage = 'Relatório não encontrado';
      } else if (response.status === 403) {
        errorMessage = 'Acesso negado a este relatório';
      } else if (response.status === 410) {
        errorMessage = 'Este relatório expirou ou não está mais disponível';
      } else {
        errorMessage = `Erro ao carregar relatório: ${response.status}`;
      }
    }
  } catch (error) {
    console.error('Error fetching shared report:', error);
    errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
  }

  return (
    <StudentSharedReportPageClient
      reportId={paramsResolved.reportId}
      userId={session.user.id}
      initialData={initialData}
      errorMessage={errorMessage}
    />
  );
}
