// app/(student)/student/progress/[reportId]/page.tsx - Página para Visualizar Relatório Compartilhado
import { Metadata } from 'next';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import StudentSharedReportPageClient from './pageClient';
import { ApiError } from '@/app/libs/api/client';
import { getServerAccessToken } from '@/app/libs/api/server-session';
import { loadSharedReport } from '@/app/requests/portal/shared-reports';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Relatório de Progresso | Aluno - Opus Atlas',
      description:
        'Visualize seu relatório detalhado de progresso criado pelo seu professor',
      keywords: [
        'relatório progresso aluno',
        'feedback professor',
        'evolução musical',
        'desenvolvimento estudante',
        'avaliação progresso',
        'relatório detalhado',
      ],
      ogTitle: 'Relatório de Progresso - Aluno',
      ogDescription:
        'Visualize seu relatório detalhado de progresso e conquistas musicais',
    },
    en: {
      title: 'Progress Report | Student - Opus Atlas',
      description: 'View your detailed progress report created by your teacher',
      keywords: [
        'student progress report',
        'teacher feedback',
        'musical evolution',
        'student development',
        'progress assessment',
        'detailed report',
      ],
      ogTitle: 'Progress Report - Student',
      ogDescription:
        'View your detailed progress report and musical achievements',
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

interface StudentSharedReportPageParams {
  reportId: string;
}

interface StudentSharedReportPageProps {
  params: Promise<StudentSharedReportPageParams>;
}

export default async function StudentSharedReportPage({
  params,
}: StudentSharedReportPageProps) {
  const paramsResolved = await params;
  const session = await getRequiredServerSession();
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'student/progressId',
  ]);
  // Relatório pela API, com o token do cookie da requisição.
  let initialData: Awaited<ReturnType<typeof loadSharedReport>> | null = null;
  let errorMessage: string | undefined;

  const token = await getServerAccessToken();

  if (!token) {
    errorMessage = 'Sessão expirada. Entre novamente.';
  } else {
    try {
      initialData = await loadSharedReport(paramsResolved.reportId, token);
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 0;

      if (status === 404) {
        errorMessage = 'Relatório não encontrado';
      } else if (status === 403) {
        errorMessage = 'Acesso negado a este relatório';
      } else if (status === 410) {
        errorMessage = 'Este relatório expirou ou não está mais disponível';
      } else if (status) {
        errorMessage = `Erro ao carregar relatório: ${status}`;
      } else {
        console.error('Error fetching shared report:', error);
        errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
      }
    }
  }

  return (
    <TranslationProvider language={language} translations={translations}>
      <StudentSharedReportPageClient
        reportId={paramsResolved.reportId}
        userId={session.user.id}
        initialData={initialData}
        errorMessage={errorMessage}
      />
    </TranslationProvider>
  );
}
