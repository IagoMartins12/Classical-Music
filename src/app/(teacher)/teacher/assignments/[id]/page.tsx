// app/teacher/assignments/[id]/page.tsx - Página de Detalhes da Tarefa

import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { notFound } from 'next/navigation';
import AssignmentDetailsPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

interface AssignmentDetailsPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: AssignmentDetailsPageProps): Promise<Metadata> {
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

  return (
    <AssignmentDetailsPageServer
      assignmentId={params.id}
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
