// app/teacher/lessons/create/page.tsx - Página de Criar Nova Aula
import { Metadata } from 'next';
import CreateLessonPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Criar Nova Aula | Professor - Opus Atlas',
      description:
        'Agende uma nova aula com seus alunos, configure recorrência e vincule materiais de estudo',
      keywords: [
        'criar aula professor',
        'agendar aula',
        'nova aula música',
        'cronograma ensino',
        'planejamento aula',
        'materiais estudo',
      ],
      ogTitle: 'Criar Nova Aula - Professor | Opus Atlas',
      ogDescription:
        'Ferramentas completas para agendar e configurar suas aulas de música',
    },
    en: {
      title: 'Create New Lesson | Teacher - Opus Atlas',
      description:
        'Schedule a new lesson with your students, configure recurrence and link study materials',
      keywords: [
        'create teacher lesson',
        'schedule lesson',
        'new music lesson',
        'teaching schedule',
        'lesson planning',
        'study materials',
      ],
      ogTitle: 'Create New Lesson - Teacher | Opus Atlas',
      ogDescription:
        'Complete tools to schedule and configure your music lessons',
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

export default async function CreateLessonPage() {
  const session = await getRequiredServerSession();

  return <CreateLessonPageServer userId={session.user.id} />;
}
