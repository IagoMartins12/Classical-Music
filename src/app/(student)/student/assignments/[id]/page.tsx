// app/student/assignments/[id]/page.tsx - Página de Detalhes da Tarefa do Aluno

import { Metadata } from 'next';
import StudentAssignmentDetailsPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

interface serverProps {
  id: string;
}

interface StudentAssignmentDetailsPageProps {
  params: Promise<serverProps>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Detalhes da Tarefa | Aluno - Opus Atlas',
    description:
      'Acompanhe seu progresso, marque metas alcançadas e entregue sua tarefa musical',
    keywords:
      'tarefa musical aluno, progresso estudante, metas musicais, assignment estudante',
  };
}

export default async function StudentAssignmentDetailsPage({
  params,
}: StudentAssignmentDetailsPageProps) {
  const session = await getRequiredServerSession();
  const resolvedParams = await params;

  return (
    <StudentAssignmentDetailsPageServer
      assignmentId={resolvedParams.id}
      userId={session.user.id}
      userRole={session.user.role}
    />
  );
}
