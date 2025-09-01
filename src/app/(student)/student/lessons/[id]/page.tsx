// app/student/lessons/[id]/page.tsx - Página de Detalhes da Aula (Aluno)
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StudentLessonDetailPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

interface lessonProps {
  id: string;
}

interface LessonIdProps {
  params: Promise<lessonProps>;
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Detalhes da Aula | Aluno - Opus Atlas',
      description:
        'Visualize os detalhes da aula, materiais de estudo, objetivos e adicione seu feedback',
      keywords: [
        'aula música',
        'detalhes aula',
        'materiais estudo',
        'feedback aluno',
        'partituras',
        'objetivos aula',
        'conteúdo aula',
      ],
      ogTitle: 'Detalhes da Aula - Opus Atlas',
      ogDescription: 'Acesse informações detalhadas sobre sua aula de música',
    },
    en: {
      title: 'Lesson Details | Student - Opus Atlas',
      description:
        'View lesson details, study materials, objectives and add your feedback',
      keywords: [
        'music lesson',
        'lesson details',
        'study materials',
        'student feedback',
        'sheet music',
        'lesson objectives',
        'lesson content',
      ],
      ogTitle: 'Lesson Details - Opus Atlas',
      ogDescription: 'Access detailed information about your music lesson',
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

export default async function StudentLessonDetailPage({
  params,
}: LessonIdProps) {
  const resolvedParams = await params;
  const lessonId = resolvedParams.id;

  const session = await getRequiredServerSession();

  // Validar ID da aula
  if (!lessonId || lessonId.length !== 24) {
    return notFound();
  }

  return (
    <StudentLessonDetailPageServer
      lessonId={lessonId}
      userId={session.user.id}
    />
  );
}
