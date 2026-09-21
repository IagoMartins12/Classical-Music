// app/(student)/notifications/pageServer.tsx
import StudentNotificationsPageClient from './pageClient';
import { loadNotificationCenter } from '@/app/requests/portal/notifications';
import { withServerToken } from '@/app/requests/portal/server';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';

interface StudentNotificationsPageServerProps {
  userId: string;
}

export default async function StudentNotificationsPageServer(
  _props: StudentNotificationsPageServerProps
) {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'student/notifications',
  ]);

  const center = await withServerToken(
    'STUDENT-NOTIFICATIONS-SERVER',
    loadNotificationCenter
  );

  if (!center) {
    return (
      <TranslationProvider language={language} translations={translations}>
        <StudentNotificationsPageClient
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
      <StudentNotificationsPageClient
        initialNotifications={center.notifications}
        unreadCount={center.unreadCount}
        notificationStats={center.notificationStats}
      />
    </TranslationProvider>
  );
}
