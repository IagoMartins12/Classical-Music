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

export default async function EditAssignmentPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getRequiredServerSession();

  return (
    <EditAssignmentPageServer
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
