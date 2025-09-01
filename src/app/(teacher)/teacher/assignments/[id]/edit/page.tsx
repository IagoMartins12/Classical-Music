// app/teacher/assignments/[id]/edit/page.tsx - Página de Editar Tarefa
import { Metadata } from 'next';
import EditAssignmentPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Editar Tarefa | Professor - Opus Atlas',
      description:
        'Edite tarefas existentes com materiais, metas específicas e prazos personalizados para seus alunos',
      keywords: [
        'editar tarefa professor',
        'atualizar assignment',
        'modificar lição casa música',
        'gestão pedagógica',
        'tarefa musical',
        'edição atividade',
      ],
      ogTitle: 'Editar Tarefa - Professor | Opus Atlas',
      ogDescription:
        'Ferramentas completas para editar e atualizar tarefas musicais personalizadas',
    },
    en: {
      title: 'Edit Assignment | Teacher - Opus Atlas',
      description:
        'Edit existing assignments with materials, specific goals and custom deadlines for your students',
      keywords: [
        'edit teacher assignment',
        'update assignment',
        'modify music homework',
        'pedagogical management',
        'musical task',
        'activity editing',
      ],
      ogTitle: 'Edit Assignment - Teacher | Opus Atlas',
      ogDescription:
        'Complete tools to edit and update personalized musical assignments',
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

interface serverProps {
  id: string;
}

interface AssignmentDetailsPageProps {
  params: Promise<serverProps>;
}

export default async function EditAssignmentPage({
  params,
}: AssignmentDetailsPageProps) {
  const session = await getRequiredServerSession();
  const resolvedParams = await params;

  return (
    <EditAssignmentPageServer
      assignmentId={resolvedParams.id}
      userId={session.user.id}
    />
  );
}
