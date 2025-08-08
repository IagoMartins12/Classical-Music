// app/teacher/students/page.tsx - Página de Gerenciamento de Alunos

import { Metadata } from 'next';
import TeacherStudentsPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

export const metadata: Metadata = {
  title: 'Meus Alunos | Professor - Opus Atlas',
  description:
    'Gerencie seus alunos, acompanhe o progresso e organize as aulas de música',
  keywords:
    'alunos de música, gestão de estudantes, progresso musical, ensino musical',
  openGraph: {
    title: 'Gerenciamento de Alunos - Professor',
    description:
      'Acompanhe o progresso dos seus alunos e gerencie suas aulas de música',
    type: 'website',
  },
};

export default async function TeacherStudentsPage() {
  const session = await getRequiredServerSession();

  return (
    <TeacherStudentsPageServer
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
