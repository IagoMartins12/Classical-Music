// app/student/history/page.tsx - Página de Histórico de Atividades do Aluno

import { Metadata } from 'next';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
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
  searchParams: {
    page?: string;
    action?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export default async function StudentHistoryPage({
  searchParams,
}: StudentHistoryPageProps) {
  const session = await getRequiredServerSession();

  // Verificar se é aluno
  if (session.user.role !== 0) {
    throw new Error('Acesso negado - Apenas alunos');
  }

  // Extrair parâmetros de busca
  const page = parseInt(searchParams.page || '1');
  const action = searchParams.action || 'all';
  const entityType = searchParams.entityType || 'all';
  const dateFrom = searchParams.dateFrom || '';
  const dateTo = searchParams.dateTo || '';

  return (
    <StudentHistoryClient
      userId={session.user.id}
      userEmail={session.user.email || ''}
      userName={`${session.user.firstName || ''} ${
        session.user.lastName || ''
      }`.trim()}
      userImage={session.user.image}
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
