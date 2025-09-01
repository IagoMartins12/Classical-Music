// app/(student)/notifications/page.tsx
import { Metadata } from 'next';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import StudentNotificationsPageServer from './pageServer';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Notificações | Estudante - Opus Atlas',
      description:
        'Visualize e gerencie todas as suas notificações de aulas, tarefas e estudos',
      keywords: [
        'notificações',
        'estudante',
        'aulas',
        'tarefas',
        'lembretes',
        'alertas',
        'avisos',
        'comunicados',
      ],
      ogTitle: 'Notificações do Estudante - Opus Atlas',
      ogDescription:
        'Centro de notificações para estudantes acompanharem aulas e tarefas',
    },
    en: {
      title: 'Notifications | Student - Opus Atlas',
      description:
        'View and manage all your notifications for lessons, assignments and studies',
      keywords: [
        'notifications',
        'student',
        'lessons',
        'assignments',
        'reminders',
        'alerts',
        'notices',
        'announcements',
      ],
      ogTitle: 'Student Notifications - Opus Atlas',
      ogDescription:
        'Notification center for students to track lessons and assignments',
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

export default async function StudentNotificationsPage() {
  const session = await getRequiredServerSession();

  return <StudentNotificationsPageServer userId={session.user.id} />;
}
