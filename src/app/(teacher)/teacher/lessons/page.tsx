// app/teacher/lessons/page.tsx - Página de Gerenciamento de Aulas

import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { notFound } from 'next/navigation';
import TeacherLessonsPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

export const metadata: Metadata = {
  title: 'Gerenciar Aulas | Professor - Opus Atlas',
  description:
    'Gerencie todas suas aulas, visualize agendamentos, edite informações e acompanhe o progresso dos alunos',
  keywords:
    'gerenciar aulas professor, aulas agendadas, cronograma ensino, gestão alunos, aulas música',
  openGraph: {
    title: 'Gerenciamento de Aulas - Professor | Opus Atlas',
    description:
      'Controle total sobre suas aulas: agendamentos, progresso dos alunos e planejamento pedagógico',
    type: 'website',
  },
};

export default async function TeacherLessonsPage() {
  const session = await getRequiredServerSession();

  return (
    <TeacherLessonsPageServer
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
