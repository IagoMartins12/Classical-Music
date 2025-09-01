// app/teacher/students/[studentId]/page.tsx - Página de Detalhes do Aluno
import { Metadata } from 'next';
import TeacherStudentDetailPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Detalhes do Aluno | Professor - Opus Atlas',
      description:
        'Visualize o progresso detalhado do aluno, histórico de aulas e plano de estudos',
      keywords: [
        'aluno detalhes',
        'progresso musical',
        'histórico de aulas',
        'plano de estudos',
        'acompanhamento pedagógico',
        'evolução estudante',
      ],
      ogTitle: 'Detalhes do Aluno - Professor',
      ogDescription:
        'Acompanhe o progresso detalhado e histórico de aulas do seu aluno',
    },
    en: {
      title: 'Student Details | Teacher - Opus Atlas',
      description:
        'View detailed student progress, lesson history and study plan',
      keywords: [
        'student details',
        'musical progress',
        'lesson history',
        'study plan',
        'pedagogical monitoring',
        'student evolution',
      ],
      ogTitle: 'Student Details - Teacher',
      ogDescription:
        'Track detailed progress and lesson history of your student',
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

interface ComposerParams {
  studentId: string;
}

interface TeacherStudentDetailPageProps {
  params: Promise<ComposerParams>;
}

export default async function TeacherStudentDetailPage({
  params,
}: TeacherStudentDetailPageProps) {
  const paramsId = await params;

  const session = await getRequiredServerSession();

  return (
    <TeacherStudentDetailPageServer
      studentId={paramsId.studentId}
      userId={session.user.id}
    />
  );
}
