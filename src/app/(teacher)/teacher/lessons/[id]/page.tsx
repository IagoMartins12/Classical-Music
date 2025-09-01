// app/teacher/lessons/[id]/page.tsx - Página de Detalhes da Aula
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TeacherLessonDetailsPageServer from './pageServer';
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
      title: 'Detalhes da Aula | Professor - Opus Atlas',
      description:
        'Visualize e edite todos os detalhes da aula, progresso do aluno e materiais de estudo',
      keywords: [
        'detalhes aula professor',
        'progresso aluno',
        'notas aula',
        'homework',
        'gestão ensino',
        'materiais pedagógicos',
      ],
      ogTitle: 'Detalhes da Aula - Professor | Opus Atlas',
      ogDescription:
        'Acesso completo aos detalhes da aula, progresso e materiais pedagógicos',
    },
    en: {
      title: 'Lesson Details | Teacher - Opus Atlas',
      description:
        'View and edit all lesson details, student progress and study materials',
      keywords: [
        'teacher lesson details',
        'student progress',
        'lesson notes',
        'homework',
        'teaching management',
        'pedagogical materials',
      ],
      ogTitle: 'Lesson Details - Teacher | Opus Atlas',
      ogDescription:
        'Complete access to lesson details, progress and pedagogical materials',
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

export default async function TeacherLessonDetailsPage({
  params,
}: LessonIdProps) {
  const resolvedParams = await params;

  const lessonId = resolvedParams.id;

  const session = await getRequiredServerSession();

  // Verificar se ID da aula é válido
  if (!lessonId || lessonId.length !== 24) {
    return notFound();
  }

  return (
    <TeacherLessonDetailsPageServer
      lessonId={lessonId}
      userId={session.user.id}
      userRole={session.user.role}
    />
  );
}
