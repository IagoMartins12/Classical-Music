// app/teacher/assignments/create/page.tsx - Página de Criar Nova Tarefa

import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { notFound } from 'next/navigation';
import CreateAssignmentPageServer from './pageServer';

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
  const session = await getServerSession(authOptions);

  // Verificar se está logado
  if (!session?.user?.id) {
    return notFound();
  }

  // Verificar se tem role de professor (role 1)
  if (session.user.role !== 1) {
    return notFound();
  }

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
