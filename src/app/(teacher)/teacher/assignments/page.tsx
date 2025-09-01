// app/teacher/assignments/page.tsx - Página de Gerenciamento de Tarefas do Professor
import { Metadata } from 'next';
import TeacherAssignmentsPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Gerenciar Tarefas | Professor - Opus Atlas',
      description:
        'Crie, gerencie e acompanhe tarefas e assignments para seus alunos de música',
      keywords: [
        'tarefas professor',
        'assignments musicais',
        'homework',
        'atividades aluno',
        'acompanhamento progresso',
        'gestão pedagógica',
      ],
      ogTitle: 'Gerenciamento de Tarefas - Opus Atlas',
      ogDescription:
        'Organize tarefas e acompanhe o progresso dos seus alunos de forma eficiente',
    },
    en: {
      title: 'Manage Assignments | Teacher - Opus Atlas',
      description:
        'Create, manage and track assignments and tasks for your music students',
      keywords: [
        'teacher assignments',
        'musical assignments',
        'homework',
        'student activities',
        'progress tracking',
        'pedagogical management',
      ],
      ogTitle: 'Assignment Management - Opus Atlas',
      ogDescription:
        'Organize assignments and track your students progress efficiently',
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

export default async function TeacherAssignmentsPage() {
  const session = await getRequiredServerSession();

  return <TeacherAssignmentsPageServer userId={session.user.id} />;
}
