// app/student/lessons/page.tsx - Página Principal das Aulas do Aluno
import { Metadata } from 'next';
import StudentLessonsPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Minhas Aulas | Aluno - Opus Atlas',
      description:
        'Visualize suas aulas passadas e futuras, acompanhe seu progresso musical e acesse os materiais de estudo',
      keywords: [
        'aulas música',
        'progresso musical',
        'cronograma estudo',
        'partituras',
        'feedback professor',
        'aulas passadas',
        'próximas aulas',
      ],
      ogTitle: 'Minhas Aulas - Opus Atlas',
      ogDescription:
        'Acompanhe suas aulas de música e o progresso nos estudos musicais',
    },
    en: {
      title: 'My Lessons | Student - Opus Atlas',
      description:
        'View your past and future lessons, track your musical progress and access study materials',
      keywords: [
        'music lessons',
        'musical progress',
        'study schedule',
        'sheet music',
        'teacher feedback',
        'past lessons',
        'upcoming lessons',
      ],
      ogTitle: 'My Lessons - Opus Atlas',
      ogDescription: 'Track your music lessons and progress in musical studies',
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

export default async function StudentLessonsPage() {
  const session = await getRequiredServerSession();

  return <StudentLessonsPageServer userId={session.user.id} />;
}
