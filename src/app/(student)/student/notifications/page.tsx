// app/(student)/notifications/page.tsx
import { Metadata } from 'next';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import StudentNotificationsPageServer from './pageServer';

export const metadata: Metadata = {
  title: 'Notificações | Estudante - Opus Atlas',
  description:
    'Visualize e gerencie todas as suas notificações de aulas, tarefas e estudos',
  keywords: 'notificações, estudante, aulas, tarefas, lembretes, alertas',
  openGraph: {
    title: 'Notificações do Estudante - Opus Atlas',
    description:
      'Centro de notificações para estudantes acompanharem aulas e tarefas',
    type: 'website',
  },
};

export default async function StudentNotificationsPage() {
  const session = await getRequiredServerSession();

  return (
    <StudentNotificationsPageServer
      userId={session.user.id}
      userEmail={session.user.email || ''}
      userName={`${session.user.firstName || ''} ${
        session.user.lastName || ''
      }`.trim()}
    />
  );
}
