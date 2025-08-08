// app/teacher/lessons/create/page.tsx - Página de Criar Nova Aula

import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { notFound } from 'next/navigation';
import CreateLessonPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

export const metadata: Metadata = {
  title: 'Criar Nova Aula | Professor - Opus Atlas',
  description:
    'Agende uma nova aula com seus alunos, configure recorrência e vincule materiais de estudo',
  keywords:
    'criar aula professor, agendar aula, nova aula música, cronograma ensino, planejamento aula',
  openGraph: {
    title: 'Criar Nova Aula - Professor | Opus Atlas',
    description:
      'Ferramentas completas para agendar e configurar suas aulas de música',
    type: 'website',
  },
};

export default async function CreateLessonPage() {
  const session = await getRequiredServerSession();

  return (
    <CreateLessonPageServer
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
