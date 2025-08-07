// app/student/assignments/page.tsx - Página de Tarefas do Aluno

import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { notFound } from 'next/navigation';
import StudentAssignmentsPageServer from './pageServer';

export const metadata: Metadata = {
  title: 'Minhas Tarefas | Aluno - Opus Atlas',
  description:
    'Visualize suas tarefas musicais, acompanhe prazos e marque tarefas como concluídas',
  keywords:
    'tarefas aluno música, lição casa musical, assignments estudante, progresso tarefas',
  openGraph: {
    title: 'Minhas Tarefas - Aluno | Opus Atlas',
    description:
      'Gerencie suas tarefas musicais de forma organizada e acompanhe seu progresso',
    type: 'website',
  },
};

export default async function StudentAssignmentsPage() {
  const session = await getServerSession(authOptions);

  // Verificar se está logado
  if (!session?.user?.id) {
    return notFound();
  }

  // Verificar se tem role de aluno (role 0)
  if (session.user.role !== 0) {
    return notFound();
  }

  return (
    <StudentAssignmentsPageServer
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
