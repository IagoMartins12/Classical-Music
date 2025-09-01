// app/teacher/assignments/create/page.tsx - Página de Criar Nova Tarefa
import { Metadata } from 'next';
import CreateAssignmentPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Criar Nova Tarefa | Professor - Opus Atlas',
      description:
        'Crie tarefas personalizadas para seus alunos com materiais, metas específicas e prazos',
      keywords: [
        'criar tarefa professor',
        'lição de casa música',
        'assignment aluno',
        'planejamento pedagógico',
        'nova atividade',
        'tarefa personalizada',
      ],
      ogTitle: 'Criar Nova Tarefa - Professor | Opus Atlas',
      ogDescription:
        'Ferramentas completas para criar e gerenciar tarefas musicais personalizadas',
    },
    en: {
      title: 'Create New Assignment | Teacher - Opus Atlas',
      description:
        'Create personalized assignments for your students with materials, specific goals and deadlines',
      keywords: [
        'create teacher assignment',
        'music homework',
        'student assignment',
        'pedagogical planning',
        'new activity',
        'personalized task',
      ],
      ogTitle: 'Create New Assignment - Teacher | Opus Atlas',
      ogDescription:
        'Complete tools to create and manage personalized musical assignments',
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

export default async function CreateAssignmentPage() {
  const session = await getRequiredServerSession();

  return <CreateAssignmentPageServer userId={session.user.id} />;
}
