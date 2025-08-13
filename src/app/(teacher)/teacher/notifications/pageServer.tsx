// app/(teacher)/notifications/pageServer.tsx
import prisma from '@/app/libs/prismadb';
import TeacherNotificationsPageClient from './pageClient';
import { NotificationData } from '@/app/types/notification';

interface TeacherNotificationsPageServerProps {
  userId: string;
  userEmail: string;
  userName: string;
}

export default async function TeacherNotificationsPageServer({
  userId,
  userEmail,
  userName,
}: TeacherNotificationsPageServerProps) {
  try {
    const now = new Date();

    // Buscar notificações do professor
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId,
          expiresAt: { gte: now },
        },
        orderBy: { createdAt: 'desc' },
        take: 50, // Primeiras 50 notificações
      }),
      prisma.notification.count({
        where: {
          userId,
          status: 'UNREAD',
          expiresAt: { gte: now },
        },
      }),
    ]);

    // Buscar estatísticas por tipo
    const notificationStats = await prisma.notification.groupBy({
      by: ['type'],
      where: {
        userId,
        expiresAt: { gte: now },
        createdAt: {
          gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // últimos 30 dias
        },
      },
      _count: {
        id: true,
      },
    });

    console.log(
      `✅ [TEACHER-NOTIFICATIONS-SERVER] Loaded ${notifications.length} notifications for user ${userId}`
    );

    return (
      <TeacherNotificationsPageClient
        initialNotifications={notifications as NotificationData[]}
        unreadCount={unreadCount}
        notificationStats={notificationStats}
        userProfile={{
          id: userId,
          name: userName,
          email: userEmail,
        }}
      />
    );
  } catch (error) {
    console.error('❌ [TEACHER-NOTIFICATIONS-SERVER] Error:', error);

    return (
      <TeacherNotificationsPageClient
        initialNotifications={[]}
        unreadCount={0}
        notificationStats={[]}
        userProfile={{
          id: userId,
          name: userName,
          email: userEmail,
        }}
        errorMessage="Erro ao carregar notificações. Tente recarregar a página."
      />
    );
  }
}
