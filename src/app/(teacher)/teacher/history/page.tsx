// app/teacher/history/page.tsx - Página de Histórico de Atividades do Professor

import { Metadata } from 'next';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
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
  searchParams: {
    page?: string;
    action?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export default async function TeacherHistoryPage({
  searchParams,
}: TeacherHistoryPageProps) {
  const session = await getRequiredServerSession();

  // Verificar se é professor
  if (session.user.role !== 1) {
    throw new Error('Acesso negado - Apenas professores');
  }

  // Extrair parâmetros de busca
  const page = parseInt(searchParams.page || '1');
  const action = searchParams.action || 'all';
  const entityType = searchParams.entityType || 'all';
  const dateFrom = searchParams.dateFrom || '';
  const dateTo = searchParams.dateTo || '';

  return (
    <TeacherHistoryClient
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
