// app/api/student/notifications/check/route.ts - CORRIGIDO SEM DUPLICATAS
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import {
  NotificationCheckResult,
  NOTIFICATION_CONFIG,
} from '@/app/types/notification';
import {
  NotificationFactory,
  createNotificationSafely,
} from '@/app/utils/notifications';
import prisma from '@/app/libs/prismadb';

// 🔥 NOVA ABORDAGEM: Helper para determinar se já é hora de criar a notificação
const shouldCreateTimeBasedNotification = (
  timeDiff: number,
  notificationType: 'TOMORROW' | 'SOON' | 'OVERDUE'
): boolean => {
  const now = new Date();
  const currentHour = now.getHours();

  switch (notificationType) {
    case 'TOMORROW':
      // Criar apenas entre 18h-20h do dia anterior (janela específica)
      return (
        timeDiff <= NOTIFICATION_CONFIG.ASSIGNMENT_WARNING_TIMES.DUE_TOMORROW &&
        timeDiff >
          NOTIFICATION_CONFIG.ASSIGNMENT_WARNING_TIMES.DUE_TOMORROW -
            2 * 60 * 60 * 1000 &&
        currentHour >= 18 &&
        currentHour <= 20
      );

    case 'SOON':
      // Criar apenas quando faltam exatamente 2 horas (janela de 15 min)
      return (
        timeDiff <= NOTIFICATION_CONFIG.ASSIGNMENT_WARNING_TIMES.DUE_SOON &&
        timeDiff >
          NOTIFICATION_CONFIG.ASSIGNMENT_WARNING_TIMES.DUE_SOON - 15 * 60 * 1000
      );

    case 'OVERDUE':
      // Criar apenas uma vez por dia, às 9h da manhã
      return currentHour === 9;

    default:
      return false;
  }
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.isStudent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      lastCheck,
      includeToast = true,
      includeBrowser = false,
    } = await req.json();
    const userId = session.user.id;
    const now = new Date();

    console.log(`📬 [STUDENT-CHECK] Verificando notificações para ${userId}`);

    // 1. Buscar perfil do estudante
    const studentProfile = await prisma.student.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    // 2. Verificar próximas aulas (CONDIÇÕES MAIS PRECISAS)
    const upcomingLessons = await prisma.lesson.findMany({
      where: {
        studentId: studentProfile.id,
        scheduledAt: {
          gte: now,
          lte: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        },
        status: 'SCHEDULED',
      },
      include: {
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    // 3. Verificar tarefas próximas do vencimento
    const assignments = await prisma.assignment.findMany({
      where: {
        studentId: studentProfile.id,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: {
          gte: now,
          lte: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        },
      },
      include: {
        lesson: {
          include: {
            teacher: {
              include: {
                user: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        },
      },
    });

    // 4. Verificar tarefas em atraso
    const overdueAssignments = await prisma.assignment.findMany({
      where: {
        studentId: studentProfile.id,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: {
          lt: now,
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        lesson: {
          include: {
            teacher: {
              include: {
                user: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        },
      },
    });

    // 5. Gerar notificações usando Factory com hash único
    const notificationsToCreate: any[] = [];

    // === AULAS PRÓXIMAS (CONDIÇÕES MAIS ESPECÍFICAS) ===
    for (const lesson of upcomingLessons) {
      const timeDiff = lesson.scheduledAt.getTime() - now.getTime();
      const teacherName =
        `${lesson.teacher.user.firstName} ${lesson.teacher.user.lastName}`.trim();
      const time = lesson.scheduledAt.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      // 30 minutos antes (janela de 5 minutos)
      if (
        timeDiff <= NOTIFICATION_CONFIG.LESSON_WARNING_TIMES.STARTING_SOON &&
        timeDiff >
          NOTIFICATION_CONFIG.LESSON_WARNING_TIMES.STARTING_SOON - 5 * 60 * 1000
      ) {
        const notification = NotificationFactory.lessonStartingSoon(
          userId,
          lesson.id,
          teacherName,
          time,
          lesson.scheduledAt.toISOString()
        );

        // Configurar toast e browser
        notification.showInToast = includeToast;
        notification.showInBrowser = includeBrowser;

        notificationsToCreate.push(notification);
      }

      // 24 horas antes (apenas entre 18h-20h)
      if (shouldCreateTimeBasedNotification(timeDiff, 'TOMORROW')) {
        const notification = NotificationFactory.lessonTomorrow(
          userId,
          lesson.id,
          teacherName,
          time,
          lesson.scheduledAt.toISOString()
        );

        notification.showInToast = includeToast;
        notification.showInBrowser = false;

        notificationsToCreate.push(notification);
      }
    }

    // === TAREFAS VENCENDO (CONDIÇÕES MAIS ESPECÍFICAS) ===
    for (const assignment of assignments) {
      const timeDiff = assignment.dueDate!.getTime() - now.getTime();

      // 2 horas antes (janela de 15 minutos)
      if (shouldCreateTimeBasedNotification(timeDiff, 'SOON')) {
        const notification = NotificationFactory.assignmentDueSoon(
          userId,
          assignment.id,
          assignment.title,
          assignment.dueDate!.toISOString()
        );

        notification.showInToast = includeToast;
        notification.showInBrowser = includeBrowser;

        notificationsToCreate.push(notification);
      }

      // 24 horas antes (apenas entre 18h-20h)
      if (shouldCreateTimeBasedNotification(timeDiff, 'TOMORROW')) {
        const notification = NotificationFactory.assignmentDueTomorrow(
          userId,
          assignment.id,
          assignment.title,
          assignment.dueDate!.toISOString()
        );

        notification.showInToast = includeToast;
        notification.showInBrowser = false;

        notificationsToCreate.push(notification);
      }
    }

    // === TAREFAS EM ATRASO (apenas às 9h da manhã) ===
    for (const assignment of overdueAssignments) {
      if (shouldCreateTimeBasedNotification(0, 'OVERDUE')) {
        const notification = NotificationFactory.assignmentOverdue(
          userId,
          assignment.id,
          assignment.title,
          assignment.dueDate!.toISOString()
        );

        notification.showInToast = includeToast;
        notification.showInBrowser = false;

        notificationsToCreate.push(notification);
      }
    }

    // 6. Criar notificações usando transação SEGURA
    const createdNotifications = [];

    for (const notificationData of notificationsToCreate) {
      try {
        const created = await createNotificationSafely(
          prisma,
          notificationData
        );
        if (created) {
          createdNotifications.push(created);
        }
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    }

    // 7. Buscar notificações existentes (apenas não expiradas)
    const rawNotifications = await prisma.notification.findMany({
      where: {
        userId,
        status: { in: ['UNREAD', 'READ'] as const },
        expiresAt: { gte: now },
        OR: [
          {
            createdAt: {
              gte: lastCheck
                ? new Date(lastCheck)
                : new Date(now.getTime() - 60 * 60 * 1000),
            },
          },
          { status: 'UNREAD' },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: NOTIFICATION_CONFIG.MAX_NOTIFICATIONS_PER_CHECK,
    });

    // Mapear para o tipo correto
    const allNotifications = rawNotifications.map((n) => ({
      ...n,
      actionText: n.actionText || undefined,
      actionUrl: n.actionUrl || undefined,
      relatedEntityType: n.relatedEntityType || undefined,
      relatedEntityId: n.relatedEntityId || undefined,
      scheduledFor: n.scheduledFor || undefined,
      expiresAt: n.expiresAt || undefined,
      lastShownAt: n.lastShownAt || undefined,
      readAt: n.readAt || undefined,
    }));

    // 8. Filtrar notificações para toast e browser (SEM DUPLICATAS)
    const toastNotifications = allNotifications
      .filter((n) => n.showInToast && !n.toastShown && includeToast)
      .slice(0, NOTIFICATION_CONFIG.MAX_TOAST_NOTIFICATIONS);

    const browserNotifications = allNotifications
      .filter((n) => n.showInBrowser && !n.browserShown && includeBrowser)
      .slice(0, NOTIFICATION_CONFIG.MAX_BROWSER_NOTIFICATIONS);

    // 9. Contar total não lidas
    const totalUnread = await prisma.notification.count({
      where: {
        userId,
        status: 'UNREAD',
        expiresAt: { gte: now },
      },
    });

    // 10. Limpar notificações expiradas
    await prisma.notification.deleteMany({
      where: {
        userId,
        expiresAt: { lt: now },
      },
    });

    const result: NotificationCheckResult = {
      newNotifications: createdNotifications.map((n) => ({
        ...n,
        actionText: n.actionText || undefined,
        actionUrl: n.actionUrl || undefined,
        relatedEntityType: n.relatedEntityType || undefined,
        relatedEntityId: n.relatedEntityId || undefined,
        scheduledFor: n.scheduledFor || undefined,
        expiresAt: n.expiresAt || undefined,
        lastShownAt: n.lastShownAt || undefined,
        readAt: n.readAt || undefined,
      })),
      toastNotifications,
      browserNotifications,
      totalUnread,
    };

    console.log(
      `✅ [STUDENT-CHECK] Verificação concluída - ${createdNotifications.length} notificações criadas (sem duplicatas)`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking student notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
