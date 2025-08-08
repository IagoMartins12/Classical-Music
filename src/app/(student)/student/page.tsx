// app/student/page.tsx - Página Principal do Dashboard do Aluno

import { Metadata } from 'next';

import StudentPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

export const metadata: Metadata = {
  title: 'Dashboard do Aluno | Opus Atlas',
  description:
    'Acompanhe suas aulas de música, progresso nos estudos e comunicação com seus professores',
  keywords:
    'aluno de música, aulas de música, progresso musical, estudos musicais, professor de música',
  openGraph: {
    title: 'Dashboard do Aluno - Opus Atlas',
    description:
      'Plataforma para alunos acompanharem seu progresso musical e interagirem com professores',
    type: 'website',
  },
};

export default async function StudentPage() {
  const session = await getRequiredServerSession();

  return (
    <StudentPageServer
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
