// app/teacher/history/page.tsx - Página de Histórico de Atividades do Professor
import { Metadata } from 'next';
import TeacherHistoryClient from './pageClient';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Histórico de Atividades | Professor - Opus Atlas',
      description:
        'Acompanhe todas as suas atividades como professor: aulas criadas, tarefas atribuídas, alunos adicionados e alterações de perfil',
      keywords: [
        'professor',
        'histórico de atividades',
        'aulas',
        'tarefas',
        'alunos',
        'ensino musical',
        'gestão educacional',
        'atividades pedagógicas',
      ],
      ogTitle: 'Histórico de Atividades do Professor - Opus Atlas',
      ogDescription:
        'Visualize e monitore todas as suas atividades como professor na plataforma',
    },
    en: {
      title: 'Activity History | Teacher - Opus Atlas',
      description:
        'Track all your activities as a teacher: lessons created, assignments assigned, students added and profile changes',
      keywords: [
        'teacher',
        'activity history',
        'lessons',
        'assignments',
        'students',
        'musical teaching',
        'educational management',
        'pedagogical activities',
      ],
      ogTitle: 'Teacher Activity History - Opus Atlas',
      ogDescription:
        'View and monitor all your activities as a teacher on the platform',
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

interface TeacherHistoryPageProps {
  searchParams: Promise<{
    page?: string;
    action?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function TeacherHistoryPage({
  searchParams,
}: TeacherHistoryPageProps) {
  const resolvedSearchParams = await searchParams;

  // Extrair parâmetros de busca
  const page = parseInt(resolvedSearchParams.page || '1');
  const action = resolvedSearchParams.action || 'all';
  const entityType = resolvedSearchParams.entityType || 'all';
  const dateFrom = resolvedSearchParams.dateFrom || '';
  const dateTo = resolvedSearchParams.dateTo || '';
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'teacher/history',
  ]);
  return (
    <TranslationProvider language={language} translations={translations}>
      <TeacherHistoryClient
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
