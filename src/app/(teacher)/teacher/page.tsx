//teacher/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { notFound } from 'next/navigation';
import TeacherPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

export const metadata: Metadata = {
  title: 'Dashboard do Professor | Opus Atlas',
  description:
    'Gerencie seus alunos, aulas e cronograma de ensino musical de forma profissional',
  keywords:
    'professor de música, gestão de alunos, aulas de música, cronograma musical, ensino musical',
  openGraph: {
    title: 'Dashboard do Professor - Opus Atlas',
    description:
      'Plataforma completa para professores de música gerenciarem seus alunos e aulas',
    type: 'website',
  },
};

export default async function TeacherPage() {
  const session = await getRequiredServerSession();

  return (
    <TeacherPageServer
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
