// app/student/history/page.tsx - Página de Histórico de Atividades do Aluno

import { Metadata } from 'next';
import StudentHistoryClient from './pageClient';

export const metadata: Metadata = {
  title: 'Histórico de Atividades | Aluno - Opus Atlas',
  description:
    'Acompanhe todas as suas atividades como aluno: submissões enviadas, tarefas concluídas, feedbacks dados e alterações de perfil',
  keywords:
    'aluno, histórico de atividades, submissões, tarefas, feedbacks, aprendizado musical, progresso estudantil',
  openGraph: {
    title: 'Histórico de Atividades do Aluno - Opus Atlas',
    description:
      'Visualize e monitore todas as suas atividades como aluno na plataforma',
    type: 'website',
  },
};

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

  return (
    <StudentHistoryClient
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
