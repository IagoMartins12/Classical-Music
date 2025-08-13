// app/(teacher)/notifications/page.tsx
import { Metadata } from 'next';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import TeacherNotificationsPageServer from './pageServer';

export const metadata: Metadata = {
  title: 'Notificações | Professor - Opus Atlas',
  description:
    'Visualize e gerencie todas as suas notificações de aulas, tarefas e alunos',
  keywords: 'notificações, professor, aulas, tarefas, alertas, lembretes',
  openGraph: {
    title: 'Notificações do Professor - Opus Atlas',
    description:
      'Centro de notificações para professores gerenciarem aulas e tarefas',
    type: 'website',
  },
};

export default async function TeacherNotificationsPage() {
  const session = await getRequiredServerSession();

  return (
    <TeacherNotificationsPageServer
      userId={session.user.id}
      userEmail={session.user.email || ''}
      userName={`${session.user.firstName || ''} ${
        session.user.lastName || ''
      }`.trim()}
    />
  );
}
