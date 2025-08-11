// app/student/assignments/page.tsx - Página de Tarefas do Aluno

import { Metadata } from 'next';

import StudentAssignmentsPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

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
  const session = await getRequiredServerSession();

  return <StudentAssignmentsPageServer userId={session.user.id} />;
}
