// app/(teacher)/notifications/pageServer.tsx
import TeacherNotificationsPageClient from './pageClient';
import { loadNotificationCenter } from '@/app/requests/portal/notifications';
import { withServerToken } from '@/app/requests/portal/server';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';

interface TeacherNotificationsPageServerProps {
  userId: string;
}

export default async function TeacherNotificationsPageServer(
  _props: TeacherNotificationsPageServerProps
) {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'teacher/notifications',
  ]);

  const center = await withServerToken(
    'TEACHER-NOTIFICATIONS-SERVER',
    loadNotificationCenter
  );

  if (!center) {
    return (
      <TranslationProvider language={language} translations={translations}>
        <TeacherNotificationsPageClient
          initialNotifications={[]}
          unreadCount={0}
          notificationStats={[]}
          errorMessage="Erro ao carregar notificações. Tente recarregar a página."
        />
      </TranslationProvider>
    );
  }

  return (
    <TranslationProvider language={language} translations={translations}>
      <TeacherNotificationsPageClient
        initialNotifications={center.notifications}
        unreadCount={center.unreadCount}
        notificationStats={center.notificationStats}
      />
    </TranslationProvider>
  );
}
