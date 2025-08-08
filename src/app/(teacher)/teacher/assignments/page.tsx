// app/teacher/assignments/page.tsx - Página de Gerenciamento de Tarefas do Professor

import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { notFound } from 'next/navigation';
import TeacherAssignmentsPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

export const metadata: Metadata = {
  title: 'Gerenciar Tarefas | Professor - Opus Atlas',
  description:
    'Crie, gerencie e acompanhe tarefas e assignments para seus alunos de música',
  keywords:
    'tarefas professor, assignments musicais, homework, atividades aluno, acompanhamento progresso',
  openGraph: {
    title: 'Gerenciamento de Tarefas - Opus Atlas',
    description:
      'Organize tarefas e acompanhe o progresso dos seus alunos de forma eficiente',
    type: 'website',
  },
};

export default async function TeacherAssignmentsPage() {
  const session = await getRequiredServerSession();

  return (
    <TeacherAssignmentsPageServer
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
