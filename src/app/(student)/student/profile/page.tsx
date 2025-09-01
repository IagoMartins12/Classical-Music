// app/student/profile/page.tsx - Página do Perfil do Aluno
import { Metadata } from 'next';
import StudentProfilePageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Meu Perfil | Aluno - Opus Atlas',
      description:
        'Gerencie suas informações pessoais, configurações de privacidade e preferências de estudo musical',
      keywords: [
        'perfil aluno música',
        'configurações privacidade',
        'preferências estudo musical',
        'dados pessoais',
        'configurações conta',
        'perfil estudante',
      ],
      ogTitle: 'Meu Perfil - Aluno | Opus Atlas',
      ogDescription:
        'Personalize sua experiência de aprendizado musical com configurações completas',
    },
    en: {
      title: 'My Profile | Student - Opus Atlas',
      description:
        'Manage your personal information, privacy settings and musical study preferences',
      keywords: [
        'music student profile',
        'privacy settings',
        'musical study preferences',
        'personal data',
        'account settings',
        'student profile',
      ],
      ogTitle: 'My Profile - Student | Opus Atlas',
      ogDescription:
        'Customize your musical learning experience with complete settings',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas' }],
    robots: { index: false, follow: false }, // Página privada
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      siteName: 'Opus Atlas',
    },
  };
}

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
