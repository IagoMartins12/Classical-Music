// app/(teacher)/teacher/students/[studentId]/progress/page.tsx - Página de Relatório de Progresso
import { Metadata } from 'next';
import TeacherProgressPageServer from './pageServer';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Relatório Detalhado de Progresso | Professor - Opus Atlas',
      description:
        'Análise pedagógica completa e insights avançados do progresso do aluno',
      keywords: [
        'relatório progresso',
        'análise pedagógica',
        'insights musicais',
        'evolução aluno',
        'estatísticas ensino',
        'avaliação detalhada',
      ],
      ogTitle: 'Relatório Detalhado de Progresso - Professor',
      ogDescription:
        'Análise pedagógica completa com insights avançados e recomendações personalizadas',
    },
    en: {
      title: 'Detailed Progress Report | Teacher - Opus Atlas',
      description:
        'Complete pedagogical analysis and advanced insights of student progress',
      keywords: [
        'progress report',
        'pedagogical analysis',
        'musical insights',
        'student evolution',
        'teaching statistics',
        'detailed assessment',
      ],
      ogTitle: 'Detailed Progress Report - Teacher',
      ogDescription:
        'Complete pedagogical analysis with advanced insights and personalized recommendations',
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

interface ProgressPageParams {
  studentId: string;
}

interface TeacherProgressPageProps {
  params: Promise<ProgressPageParams>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TeacherProgressPage({
  params,
  searchParams,
}: TeacherProgressPageProps) {
  const paramsResolved = await params;
  const searchParamsResolved = await searchParams;

  // Extract query parameters
  const period = (searchParamsResolved.period as string) || '6months';
  const startDate = searchParamsResolved.startDate as string;
  const endDate = searchParamsResolved.endDate as string;

  return (
    <TeacherProgressPageServer
      studentId={paramsResolved.studentId}
      initialPeriod={period}
      customStartDate={startDate}
      customEndDate={endDate}
    />
  );
}
