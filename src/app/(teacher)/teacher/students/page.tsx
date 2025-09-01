// app/teacher/students/page.tsx - Página de Gerenciamento de Alunos
import { Metadata } from 'next';
import TeacherStudentsPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Meus Alunos | Professor - Opus Atlas',
      description:
        'Gerencie seus alunos, acompanhe o progresso e organize as aulas de música',
      keywords: [
        'alunos de música',
        'gestão de estudantes',
        'progresso musical',
        'ensino musical',
        'lista alunos',
        'acompanhamento pedagógico',
      ],
      ogTitle: 'Gerenciamento de Alunos - Professor',
      ogDescription:
        'Acompanhe o progresso dos seus alunos e gerencie suas aulas de música',
    },
    en: {
      title: 'My Students | Teacher - Opus Atlas',
      description:
        'Manage your students, track progress and organize music lessons',
      keywords: [
        'music students',
        'student management',
        'musical progress',
        'musical teaching',
        'student list',
        'pedagogical monitoring',
      ],
      ogTitle: 'Student Management - Teacher',
      ogDescription:
        'Track your students progress and manage their music lessons',
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

export default async function TeacherStudentsPage() {
  const session = await getRequiredServerSession();

  return <TeacherStudentsPageServer userId={session.user.id} />;
}
