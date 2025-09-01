// app/(teacher)/notifications/page.tsx
import { Metadata } from 'next';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import TeacherNotificationsPageServer from './pageServer';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Notificações | Professor - Opus Atlas',
      description:
        'Visualize e gerencie todas as suas notificações de aulas, tarefas e alunos',
      keywords: [
        'notificações',
        'professor',
        'aulas',
        'tarefas',
        'alertas',
        'lembretes',
        'comunicados',
        'avisos pedagógicos',
      ],
      ogTitle: 'Notificações do Professor - Opus Atlas',
      ogDescription:
        'Centro de notificações para professores gerenciarem aulas e tarefas',
    },
    en: {
      title: 'Notifications | Teacher - Opus Atlas',
      description:
        'View and manage all your notifications for lessons, assignments and students',
      keywords: [
        'notifications',
        'teacher',
        'lessons',
        'assignments',
        'alerts',
        'reminders',
        'announcements',
        'pedagogical notices',
      ],
      ogTitle: 'Teacher Notifications - Opus Atlas',
      ogDescription:
        'Notification center for teachers to manage lessons and assignments',
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

export default async function TeacherNotificationsPage() {
  const session = await getRequiredServerSession();

  return <TeacherNotificationsPageServer userId={session.user.id} />;
}
