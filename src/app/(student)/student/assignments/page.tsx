// app/student/assignments/page.tsx - Página de Tarefas do Aluno
import { Metadata } from 'next';
import StudentAssignmentsPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Minhas Tarefas | Aluno - Opus Atlas',
      description:
        'Visualize suas tarefas musicais, acompanhe prazos e marque tarefas como concluídas',
      keywords: [
        'tarefas aluno música',
        'lição casa musical',
        'assignments estudante',
        'progresso tarefas',
        'atividades musicais',
        'prazos entregas',
      ],
      ogTitle: 'Minhas Tarefas - Aluno | Opus Atlas',
      ogDescription:
        'Gerencie suas tarefas musicais de forma organizada e acompanhe seu progresso',
    },
    en: {
      title: 'My Assignments | Student - Opus Atlas',
      description:
        'View your musical assignments, track deadlines and mark tasks as completed',
      keywords: [
        'student music assignments',
        'musical homework',
        'student assignments',
        'assignment progress',
        'musical activities',
        'submission deadlines',
      ],
      ogTitle: 'My Assignments - Student | Opus Atlas',
      ogDescription:
        'Manage your musical assignments in an organized way and track your progress',
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

export default async function StudentAssignmentsPage() {
  const session = await getRequiredServerSession();

  return <StudentAssignmentsPageServer userId={session.user.id} />;
}
