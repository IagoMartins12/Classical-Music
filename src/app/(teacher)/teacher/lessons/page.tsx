// app/teacher/lessons/page.tsx - Página de Gerenciamento de Aulas
import { Metadata } from 'next';
import TeacherLessonsPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Gerenciar Aulas | Professor - Opus Atlas',
      description:
        'Gerencie todas suas aulas, visualize agendamentos, edite informações e acompanhe o progresso dos alunos',
      keywords: [
        'gerenciar aulas professor',
        'aulas agendadas',
        'cronograma ensino',
        'gestão alunos',
        'aulas música',
        'planejamento pedagógico',
      ],
      ogTitle: 'Gerenciamento de Aulas - Professor | Opus Atlas',
      ogDescription:
        'Controle total sobre suas aulas: agendamentos, progresso dos alunos e planejamento pedagógico',
    },
    en: {
      title: 'Manage Lessons | Teacher - Opus Atlas',
      description:
        'Manage all your lessons, view schedules, edit information and track student progress',
      keywords: [
        'manage teacher lessons',
        'scheduled lessons',
        'teaching schedule',
        'student management',
        'music lessons',
        'pedagogical planning',
      ],
      ogTitle: 'Lesson Management - Teacher | Opus Atlas',
      ogDescription:
        'Complete control over your lessons: schedules, student progress and pedagogical planning',
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

export default async function TeacherLessonsPage() {
  const session = await getRequiredServerSession();

  return <TeacherLessonsPageServer userId={session.user.id} />;
}
