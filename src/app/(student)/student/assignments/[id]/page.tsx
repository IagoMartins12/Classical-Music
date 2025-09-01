// app/student/assignments/[id]/page.tsx - Página de Detalhes da Tarefa do Aluno
import { Metadata } from 'next';
import StudentAssignmentDetailsPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

interface serverProps {
  id: string;
}

interface StudentAssignmentDetailsPageProps {
  params: Promise<serverProps>;
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Detalhes da Tarefa | Aluno - Opus Atlas',
      description:
        'Acompanhe seu progresso, marque metas alcançadas e entregue sua tarefa musical',
      keywords: [
        'tarefa musical aluno',
        'progresso estudante',
        'metas musicais',
        'assignment estudante',
        'atividade musical',
        'entrega tarefa',
      ],
      ogTitle: 'Detalhes da Tarefa - Aluno',
      ogDescription: 'Acompanhe e entregue sua tarefa musical',
    },
    en: {
      title: 'Assignment Details | Student - Opus Atlas',
      description:
        'Track your progress, mark achieved goals and submit your musical assignment',
      keywords: [
        'student musical assignment',
        'student progress',
        'musical goals',
        'student assignment',
        'musical activity',
        'assignment submission',
      ],
      ogTitle: 'Assignment Details - Student',
      ogDescription: 'Track and submit your musical assignment',
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

export default async function StudentAssignmentDetailsPage({
  params,
}: StudentAssignmentDetailsPageProps) {
  const session = await getRequiredServerSession();
  const resolvedParams = await params;

  return (
    <StudentAssignmentDetailsPageServer
      assignmentId={resolvedParams.id}
      userId={session.user.id}
      userRole={session.user.role}
    />
  );
}
