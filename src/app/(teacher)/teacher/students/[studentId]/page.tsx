// app/teacher/students/[studentId]/page.tsx - Página de Detalhes do Aluno

import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { notFound } from 'next/navigation';
import TeacherStudentDetailPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

export const metadata: Metadata = {
  title: 'Detalhes do Aluno | Professor - Opus Atlas',
  description:
    'Visualize o progresso detalhado do aluno, histórico de aulas e plano de estudos',
  keywords:
    'aluno detalhes, progresso musical, histórico de aulas, plano de estudos',
  openGraph: {
    title: 'Detalhes do Aluno - Professor',
    description:
      'Acompanhe o progresso detalhado e histórico de aulas do seu aluno',
    type: 'website',
  },
};

interface ComposerParams {
  studentId: string;
}

interface TeacherStudentDetailPageProps {
  params: Promise<ComposerParams>;
}

export default async function TeacherStudentDetailPage({
  params,
}: TeacherStudentDetailPageProps) {
  const paramsId = await params;

  const session = await getRequiredServerSession();

  return (
    <TeacherStudentDetailPageServer
      studentId={paramsId.studentId}
      userId={session.user.id}
      userEmail={session.user.email || ''}
      userName={`${session.user.firstName || ''} ${
        session.user.lastName || ''
      }`.trim()}
      userImage={session.user.image}
      userRole={session.user.role}
    />
  );
}
