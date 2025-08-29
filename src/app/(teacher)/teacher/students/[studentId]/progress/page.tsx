// app/(teacher)/teacher/students/[studentId]/progress/page.tsx - Página de Relatório de Progresso

import { Metadata } from 'next';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import TeacherProgressPageServer from './pageServer';

export const metadata: Metadata = {
  title: 'Relatório Detalhado de Progresso | Professor - Opus Atlas',
  description:
    'Análise pedagógica completa e insights avançados do progresso do aluno',
  keywords:
    'relatório progresso, análise pedagógica, insights musicais, evolução aluno, estatísticas ensino',
  openGraph: {
    title: 'Relatório Detalhado de Progresso - Professor',
    description:
      'Análise pedagógica completa com insights avançados e recomendações personalizadas',
    type: 'website',
  },
};

interface ProgressPageParams {
  studentId: string;
}

interface TeacherProgressPageProps {
  params: Promise<ProgressPageParams>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TeacherProgressPage({
  params,
  searchParams,
}: TeacherProgressPageProps) {
  const paramsResolved = await params;
  const searchParamsResolved = await searchParams;

  const session = await getRequiredServerSession();

  // Extract query parameters
  const period = (searchParamsResolved.period as string) || '6months';
  const startDate = searchParamsResolved.startDate as string;
  const endDate = searchParamsResolved.endDate as string;

  return (
    <TeacherProgressPageServer
      studentId={paramsResolved.studentId}
      userId={session.user.id}
      initialPeriod={period}
      customStartDate={startDate}
      customEndDate={endDate}
    />
  );
}
