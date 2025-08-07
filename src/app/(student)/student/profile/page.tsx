// app/student/profile/page.tsx - Página do Perfil do Aluno

import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { notFound } from 'next/navigation';
import StudentProfilePageServer from './pageServer';

export const metadata: Metadata = {
  title: 'Meu Perfil | Aluno - Opus Atlas',
  description:
    'Gerencie suas informações pessoais, configurações de privacidade e preferências de estudo musical',
  keywords:
    'perfil aluno música, configurações privacidade, preferências estudo musical, dados pessoais',
  openGraph: {
    title: 'Meu Perfil - Aluno | Opus Atlas',
    description:
      'Personalize sua experiência de aprendizado musical com configurações completas',
    type: 'website',
  },
};

export default async function StudentProfilePage() {
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
    <StudentProfilePageServer
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
