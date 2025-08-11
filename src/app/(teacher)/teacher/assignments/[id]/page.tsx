// app/teacher/assignments/[id]/page.tsx - Página de Detalhes da Tarefa

import { Metadata } from 'next';
import AssignmentDetailsPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

interface serverProps {
  id: string;
}

interface AssignmentDetailsPageProps {
  params: Promise<serverProps>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Detalhes da Tarefa | Professor - Opus Atlas',
    description:
      'Veja submissões dos alunos, forneça feedback e avalie o progresso',
    keywords:
      'detalhes tarefa professor, feedback aluno, avaliar progresso, submissão musical',
  };
}

export default async function AssignmentDetailsPage({
  params,
}: AssignmentDetailsPageProps) {
  const session = await getRequiredServerSession();
  const resolvedParams = await params;

  return (
    <AssignmentDetailsPageServer
      assignmentId={resolvedParams.id}
      userId={session.user.id}
      userRole={session.user.role}
    />
  );
}
