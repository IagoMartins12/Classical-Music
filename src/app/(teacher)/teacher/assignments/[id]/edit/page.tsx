// app/teacher/assignments/[id]/edit/page.tsx - Página de Editar Tarefa

import { Metadata } from 'next';
import EditAssignmentPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

export const metadata: Metadata = {
  title: 'Editar Tarefa | Professor - Opus Atlas',
  description:
    'Edite tarefas existentes com materiais, metas específicas e prazos personalizados para seus alunos',
  keywords:
    'editar tarefa professor, atualizar assignment, modificar lição casa música, gestão pedagógica',
  openGraph: {
    title: 'Editar Tarefa - Professor | Opus Atlas',
    description:
      'Ferramentas completas para editar e atualizar tarefas musicais personalizadas',
    type: 'website',
  },
};

interface serverProps {
  id: string;
}

interface AssignmentDetailsPageProps {
  params: Promise<serverProps>;
}

export default async function EditAssignmentPage({
  params,
}: AssignmentDetailsPageProps) {
  const session = await getRequiredServerSession();
  const resolvedParams = await params;

  return (
    <EditAssignmentPageServer
      assignmentId={resolvedParams.id}
      userId={session.user.id}
    />
  );
}
