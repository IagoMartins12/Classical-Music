// app/teacher/assignments/create/page.tsx - Página de Criar Nova Tarefa

import { Metadata } from 'next';
import CreateAssignmentPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

export const metadata: Metadata = {
  title: 'Criar Nova Tarefa | Professor - Opus Atlas',
  description:
    'Crie tarefas personalizadas para seus alunos com materiais, metas específicas e prazos',
  keywords:
    'criar tarefa professor, lição de casa música, assignment aluno, planejamento pedagógico',
  openGraph: {
    title: 'Criar Nova Tarefa - Professor | Opus Atlas',
    description:
      'Ferramentas completas para criar e gerenciar tarefas musicais personalizadas',
    type: 'website',
  },
};

export default async function CreateAssignmentPage() {
  const session = await getRequiredServerSession();

  return (
    <CreateAssignmentPageServer
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
