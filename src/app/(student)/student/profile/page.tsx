// app/student/profile/page.tsx - Página do Perfil do Aluno

import { Metadata } from 'next';

import StudentProfilePageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

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
  const session = await getRequiredServerSession();

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
