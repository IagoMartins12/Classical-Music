// app/student/history/page.tsx - Página de Histórico de Atividades do Aluno
import { Metadata } from 'next';
import StudentHistoryClient from './pageClient';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Histórico de Atividades | Aluno - Opus Atlas',
      description:
        'Acompanhe todas as suas atividades como aluno: submissões enviadas, tarefas concluídas, feedbacks dados e alterações de perfil',
      keywords: [
        'aluno',
        'histórico de atividades',
        'submissões',
        'tarefas',
        'feedbacks',
        'aprendizado musical',
        'progresso estudantil',
        'atividades estudante',
      ],
      ogTitle: 'Histórico de Atividades do Aluno - Opus Atlas',
      ogDescription:
        'Visualize e monitore todas as suas atividades como aluno na plataforma',
    },
    en: {
      title: 'Activity History | Student - Opus Atlas',
      description:
        'Track all your activities as a student: submissions sent, tasks completed, feedback given and profile changes',
      keywords: [
        'student',
        'activity history',
        'submissions',
        'tasks',
        'feedback',
        'musical learning',
        'student progress',
        'student activities',
      ],
      ogTitle: 'Student Activity History - Opus Atlas',
      ogDescription:
        'View and monitor all your activities as a student on the platform',
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

interface StudentHistoryPageProps {
  searchParams: Promise<{
    page?: string;
    action?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function StudentHistoryPage({
  searchParams,
}: StudentHistoryPageProps) {
  const resolvedSearchParams = await searchParams;

  // Extrair parâmetros de busca
  const page = parseInt(resolvedSearchParams.page || '1');
  const action = resolvedSearchParams.action || 'all';
  const entityType = resolvedSearchParams.entityType || 'all';
  const dateFrom = resolvedSearchParams.dateFrom || '';
  const dateTo = resolvedSearchParams.dateTo || '';
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'student/history',
  ]);
  return (
    <TranslationProvider language={language} translations={translations}>
      <StudentHistoryClient
        initialFilters={{
          page,
          action,
          entityType,
          dateFrom,
          dateTo,
        }}
      />
    </TranslationProvider>
  );
}
