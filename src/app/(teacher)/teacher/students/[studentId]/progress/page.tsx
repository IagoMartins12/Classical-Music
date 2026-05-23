// app/(teacher)/teacher/students/[studentId]/progress/page.tsx - Página de Relatório de Progresso
import { Metadata } from 'next';
import {
  PageContainer,
  AnimatedCard,
} from '@/app/components/animation/AnimatedComponents';
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
  // const paramsResolved = await params;
  // const searchParamsResolved = await searchParams;
  console.log('📊 [PROGRESS PAGE] Parâmetros recebidos:', {
    params,
    searchParams,
  });

  // // Extract query parameters
  // const period = (searchParamsResolved.period as string) || '6months';
  // const startDate = searchParamsResolved.startDate as string;
  // const endDate = searchParamsResolved.endDate as string;

  return (
    <PageContainer showBackground={true}>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16">
        <AnimatedCard
          hover="none"
          className="classical-card p-10 max-w-3xl mx-auto text-center"
        >
          <span className="text-sm uppercase tracking-[0.3em] text-theme-tertiary mb-4 inline-block">
            Em breve
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-theme-primary classical-title mb-4">
            Relatório de Progresso
          </h1>
          <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
            Esta página ainda está em desenvolvimento. Em breve você poderá
            acompanhar o progresso detalhado do aluno aqui.
          </p>
        </AnimatedCard>
      </div>

      {/*
      <TeacherProgressPageServer
        studentId={paramsResolved.studentId}
        initialPeriod={period}
        customStartDate={startDate}
        customEndDate={endDate}
      />
      */}
    </PageContainer>
  );
}
