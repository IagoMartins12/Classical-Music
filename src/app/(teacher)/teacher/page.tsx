// app/teacher/page.tsx - Página Principal do Dashboard do Professor
import { Metadata } from 'next';
import TeacherPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Dashboard do Professor | Opus Atlas',
      description:
        'Gerencie seus alunos, aulas e cronograma de ensino musical de forma profissional',
      keywords: [
        'professor de música',
        'gestão de alunos',
        'aulas de música',
        'cronograma musical',
        'ensino musical',
        'dashboard professor',
        'educação musical',
        'conservatório virtual',
      ],
      ogTitle: 'Dashboard do Professor - Opus Atlas',
      ogDescription:
        'Plataforma completa para professores de música gerenciarem seus alunos e aulas',
    },
    en: {
      title: 'Teacher Dashboard | Opus Atlas',
      description:
        'Manage your students, lessons and musical teaching schedule professionally',
      keywords: [
        'music teacher',
        'student management',
        'music lessons',
        'musical schedule',
        'musical teaching',
        'teacher dashboard',
        'music education',
        'virtual conservatory',
      ],
      ogTitle: 'Teacher Dashboard - Opus Atlas',
      ogDescription:
        'Complete platform for music teachers to manage their students and lessons',
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
