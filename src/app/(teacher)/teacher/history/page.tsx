// app/teacher/history/page.tsx - Página de Histórico de Atividades do Professor

import { Metadata } from 'next';
import TeacherHistoryClient from './pageClient';

export const metadata: Metadata = {
  title: 'Histórico de Atividades | Professor - Opus Atlas',
  description:
    'Acompanhe todas as suas atividades como professor: aulas criadas, tarefas atribuídas, alunos adicionados e alterações de perfil',
  keywords:
    'professor, histórico de atividades, aulas, tarefas, alunos, ensino musical, gestão educacional',
  openGraph: {
    title: 'Histórico de Atividades do Professor - Opus Atlas',
    description:
      'Visualize e monitore todas as suas atividades como professor na plataforma',
    type: 'website',
  },
};

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

  return (
    <TeacherHistoryClient
      initialFilters={{
        page,
        action,
        entityType,
        dateFrom,
        dateTo,
      }}
    />
  );
}
