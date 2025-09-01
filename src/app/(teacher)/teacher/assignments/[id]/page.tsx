// app/teacher/assignments/[id]/page.tsx - Página de Detalhes da Tarefa
import { Metadata } from 'next';
import AssignmentDetailsPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

interface serverProps {
  id: string;
}

interface AssignmentDetailsPageProps {
  params: Promise<serverProps>;
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Detalhes da Tarefa | Professor - Opus Atlas',
      description:
        'Veja submissões dos alunos, forneça feedback e avalie o progresso',
      keywords: [
        'detalhes tarefa professor',
        'feedback aluno',
        'avaliar progresso',
        'submissão musical',
        'correção tarefa',
        'acompanhamento pedagógico',
      ],
      ogTitle: 'Detalhes da Tarefa - Professor',
      ogDescription:
        'Avalie submissões e forneça feedback pedagógico detalhado',
    },
    en: {
      title: 'Assignment Details | Teacher - Opus Atlas',
      description:
        'View student submissions, provide feedback and evaluate progress',
      keywords: [
        'teacher assignment details',
        'student feedback',
        'evaluate progress',
        'musical submission',
        'task correction',
        'pedagogical monitoring',
      ],
      ogTitle: 'Assignment Details - Teacher',
      ogDescription:
        'Evaluate submissions and provide detailed pedagogical feedback',
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

export default async function AssignmentDetailsPage({
  params,
}: AssignmentDetailsPageProps) {
  const session = await getRequiredServerSession();
  const resolvedParams = await params;

  return (
    <AssignmentDetailsPageServer
      assignmentId={resolvedParams.id}
      userId={session.user.id}
      userRole={session.user.role}
    />
  );
}
