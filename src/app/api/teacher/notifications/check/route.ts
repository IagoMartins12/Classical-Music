// app/api/teacher/notifications/check/route.ts - ATUALIZADO: REMOVENDO NOTIFICAÇÕES MOVIDAS PARA EVENTOS REAIS
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import {
  NotificationCheckResult,
  NOTIFICATION_CONFIG,
  getNotificationTemplate,
} from '@/app/types/notification';
import prisma from '@/app/libs/prismadb';

// Helper para verificar se notificação já existe (MANTIDO)
const checkExistingNotification = async (
  userId: string,
  type: string,
  relatedEntityId: string
) => {
  const baseWhere: any = {
    userId,
    type: type as any,
    relatedEntityId,
    status: { in: ['UNREAD', 'READ'] as const },
    expiresAt: { gte: new Date() },
  };

  return await prisma.notification.findFirst({
    where: baseWhere,
  });
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.isTeacher) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      lastCheck,
      includeToast = true,
      includeBrowser = false,
    } = await req.json();
    const userId = session.user.id;
    const now = new Date();

    console.log(
      `📬 [TEACHER-CHECK] Verificando notificações automáticas para ${userId}`
    );

    // 1. Verificar aulas que precisam de notificação (MANTIDO)
    const upcomingLessons = await prisma.lesson.findMany({
      where: {
        teacherId: userId,
        scheduledAt: {
          gte: now,
          lte: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        },
        status: 'SCHEDULED',
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    // 2. Verificar aulas passadas sem atualização de status (MANTIDO)
    const pastLessons = await prisma.lesson.findMany({
      where: {
        teacherId: userId,
        scheduledAt: {
          lt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
        status: 'SCHEDULED',
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    // 🗑️ REMOVIDO: Verificação de tarefas precisando de feedback (agora é evento real)
    // 🗑️ REMOVIDO: === TAREFAS PRECISANDO DE FEEDBACK ===

    // 4. Verificar convites pendentes (MANTIDO)
    const pendingInvites = await prisma.teacherStudent.findMany({
      where: {
        teacherId: userId,
        inviteStatus: 'PENDING',
        createdAt: {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    // 5. Gerar notificações baseadas nas verificações (APENAS AUTOMÁTICAS)
    const notificationsToCreate: any[] = [];

    // === AULAS PRÓXIMAS (MANTIDO) ===
    for (const lesson of upcomingLessons) {
      const timeDiff = lesson.scheduledAt.getTime() - now.getTime();
      const studentName =
        `${lesson.student.user.firstName} ${lesson.student.user.lastName}`.trim();

      // 30 minutos antes
      if (
        timeDiff <= NOTIFICATION_CONFIG.LESSON_WARNING_TIMES.STARTING_SOON &&
        timeDiff >
          NOTIFICATION_CONFIG.LESSON_WARNING_TIMES.STARTING_SOON - 5 * 60 * 1000
      ) {
        const existing = await checkExistingNotification(
          userId,
          'LESSON_STARTING_SOON',
          lesson.id
        );

        if (!existing) {
          const template = getNotificationTemplate('LESSON_STARTING_SOON', {
            studentName,
            time: lesson.scheduledAt.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          });

          notificationsToCreate.push({
            userId,
            type: 'LESSON_STARTING_SOON',
            priority: 'HIGH',
            title: template.title,
            message: template.message,
            actionText: template.actionText,
            actionUrl: `/teacher/lessons/${lesson.id}`,
            relatedEntityType: 'lesson',
            relatedEntityId: lesson.id,
            showInToast: includeToast,
            showInBrowser: includeBrowser,
            expiresAt: new Date(lesson.scheduledAt.getTime() + 60 * 60 * 1000),
            metadata: {
              studentName,
              lessonTime: lesson.scheduledAt.toISOString(),
            },
          });
        }
      }

      // 24 horas antes
      if (
        timeDiff <= NOTIFICATION_CONFIG.LESSON_WARNING_TIMES.TOMORROW &&
        timeDiff >
          NOTIFICATION_CONFIG.LESSON_WARNING_TIMES.TOMORROW - 60 * 60 * 1000
      ) {
        const existing = await checkExistingNotification(
          userId,
          'LESSON_TOMORROW',
          lesson.id
        );

        if (!existing) {
          const template = getNotificationTemplate('LESSON_TOMORROW', {
            studentName,
            time: lesson.scheduledAt.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          });

          notificationsToCreate.push({
            userId,
            type: 'LESSON_TOMORROW',
            priority: 'MEDIUM',
            title: template.title,
            message: template.message,
            actionText: 'Ver Agenda',
            actionUrl: '/teacher/calendar',
            relatedEntityType: 'lesson',
            relatedEntityId: lesson.id,
            showInToast: includeToast,
            showInBrowser: false,
            expiresAt: new Date(lesson.scheduledAt.getTime()),
            metadata: {
              studentName,
              lessonTime: lesson.scheduledAt.toISOString(),
            },
          });
        }
      }
    }

    // === AULAS PASSADAS SEM STATUS (MANTIDO) ===
    for (const lesson of pastLessons) {
      const studentName =
        `${lesson.student.user.firstName} ${lesson.student.user.lastName}`.trim();

      const existing = await checkExistingNotification(
        userId,
        'LESSON_STATUS_PENDING',
        lesson.id
      );

      if (!existing) {
        const template = getNotificationTemplate('LESSON_STATUS_PENDING', {
          studentName,
        });

        notificationsToCreate.push({
          userId,
          type: 'LESSON_STATUS_PENDING',
          priority: 'HIGH',
          title: template.title,
          message: template.message,
          actionText: template.actionText,
          actionUrl: `/teacher/lessons/${lesson.id}`,
          relatedEntityType: 'lesson',
          relatedEntityId: lesson.id,
          showInToast: includeToast,
          showInBrowser: false,
          expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          metadata: {
            studentName,
            lessonTime: lesson.scheduledAt.toISOString(),
          },
        });
      }
    }

    // === CONVITES PENDENTES (MANTIDO) ===
    for (const invite of pendingInvites) {
      const studentName =
        `${invite.student.user.firstName} ${invite.student.user.lastName}`.trim();

      const existing = await checkExistingNotification(
        userId,
        'STUDENT_INVITE_PENDING',
        invite.id
      );

      if (!existing) {
        const template = getNotificationTemplate('STUDENT_INVITE_PENDING', {
          studentName,
        });

        notificationsToCreate.push({
          userId,
          type: 'STUDENT_INVITE_PENDING',
          priority: 'MEDIUM',
          title: template.title,
          message: template.message,
          actionText: 'Ver Alunos',
          actionUrl: '/teacher/students',
          relatedEntityType: 'teacher_student',
          relatedEntityId: invite.id,
          showInToast: includeToast,
          showInBrowser: false,
          expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          metadata: {
            studentName,
            inviteDate: invite.createdAt.toISOString(),
          },
        });
      }
    }

    // 6. Criar notificações no banco usando transação (MANTIDO)
    const createdNotifications = [];

    for (const notificationData of notificationsToCreate) {
      try {
        const created = await prisma.$transaction(async (tx) => {
          const baseWhere: any = {
            userId: notificationData.userId,
            type: notificationData.type,
            relatedEntityId: notificationData.relatedEntityId,
            status: { in: ['UNREAD', 'read'] as const },
            expiresAt: { gte: now },
          };

          const finalCheck = await tx.notification.findFirst({
            where: baseWhere,
          });

          if (finalCheck) {
            return null; // Já existe
          }

          return await tx.notification.create({
            data: notificationData,
          });
        });

        if (created) {
          createdNotifications.push(created);
        }
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    }

    // 7. Buscar notificações existentes (MANTIDO)
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

    // Mapear para o tipo correto (MANTIDO)
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

    // 8. Filtrar notificações para toast e browser (MANTIDO)
    const toastNotifications = allNotifications
      .filter((n) => n.showInToast && !n.toastShown && includeToast)
      .slice(0, NOTIFICATION_CONFIG.MAX_TOAST_NOTIFICATIONS);

    const browserNotifications = allNotifications
      .filter((n) => n.showInBrowser && !n.browserShown && includeBrowser)
      .slice(0, NOTIFICATION_CONFIG.MAX_BROWSER_NOTIFICATIONS);

    // 9. Contar total não lidas (MANTIDO)
    const totalUnread = await prisma.notification.count({
      where: {
        userId,
        status: 'UNREAD',
        expiresAt: { gte: now },
      },
    });

    // 10. Limpar notificações expiradas (MANTIDO)
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
      `✅ [TEACHER-CHECK] Verificação concluída - ${createdNotifications.length} notificações automáticas criadas`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking teacher notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
