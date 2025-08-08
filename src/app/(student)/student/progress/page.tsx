// app/student/progress/page.tsx - Página de Progresso do Aluno

import { Metadata } from 'next';
import StudentProgressPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

export const metadata: Metadata = {
  title: 'Meu Progresso Musical | Aluno - Opus Atlas',
  description:
    'Acompanhe sua evolução musical, histórico de aprendizado e estatísticas de estudo detalhadas',
  keywords:
    'progresso musical, evolução aluno, estatísticas estudo, histórico aprendizado, gráficos progresso',
  openGraph: {
    title: 'Progresso Musical - Opus Atlas',
    description:
      'Visualize sua jornada musical com gráficos detalhados e estatísticas de progresso',
    type: 'website',
  },
};

export default async function StudentProgressPage() {
  const session = await getRequiredServerSession();

  return (
    <StudentProgressPageServer
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
