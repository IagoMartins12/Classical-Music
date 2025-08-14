// app/api/student/notifications/check/route.ts - ATUALIZADO: REMOVENDO NOTIFICAÇÕES MOVIDAS PARA EVENTOS REAIS
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
  relatedEntityId: string,
  metadata?: any
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

    console.log(
      `📬 [STUDENT-CHECK] Verificando notificações automáticas para ${userId}`
    );

    // 1. Buscar perfil do estudante
    const studentProfile = await prisma.student.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    // 2. Verificar próximas aulas do aluno
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

    // 3. Verificar tarefas do aluno
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

    // 🗑️ REMOVIDO: Verificação de novos feedbacks (agora é evento real)
    // 🗑️ REMOVIDO: === NOVOS FEEDBACKS ===

    // 6. Gerar notificações baseadas nas verificações (APENAS AUTOMÁTICAS)
    const notificationsToCreate: any[] = [];

    // === AULAS PRÓXIMAS (MANTIDO) ===
    for (const lesson of upcomingLessons) {
      const timeDiff = lesson.scheduledAt.getTime() - now.getTime();
      const teacherName =
        `${lesson.teacher.user.firstName} ${lesson.teacher.user.lastName}`.trim();

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
            teacherName,
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
            actionUrl: `/student/lessons/${lesson.id}`,
            relatedEntityType: 'lesson',
            relatedEntityId: lesson.id,
            showInToast: includeToast,
            showInBrowser: includeBrowser,
            expiresAt: new Date(lesson.scheduledAt.getTime() + 60 * 60 * 1000),
            metadata: {
              teacherName,
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
            teacherName,
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
            actionUrl: '/student/lessons',
            relatedEntityType: 'lesson',
            relatedEntityId: lesson.id,
            showInToast: includeToast,
            showInBrowser: false,
            expiresAt: new Date(lesson.scheduledAt.getTime()),
            metadata: {
              teacherName,
              lessonTime: lesson.scheduledAt.toISOString(),
            },
          });
        }
      }
    }

    // === TAREFAS VENCENDO (MANTIDO) ===
    for (const assignment of assignments) {
      const timeDiff = assignment.dueDate!.getTime() - now.getTime();
      const teacherName =
        `${assignment.lesson.teacher.user.firstName} ${assignment.lesson.teacher.user.lastName}`.trim();

      // 2 horas antes do vencimento
      if (
        timeDiff <= NOTIFICATION_CONFIG.ASSIGNMENT_WARNING_TIMES.DUE_SOON &&
        timeDiff >
          NOTIFICATION_CONFIG.ASSIGNMENT_WARNING_TIMES.DUE_SOON - 30 * 60 * 1000
      ) {
        const existing = await checkExistingNotification(
          userId,
          'ASSIGNMENT_DUE_SOON',
          assignment.id
        );

        if (!existing) {
          const template = getNotificationTemplate('ASSIGNMENT_DUE_SOON', {
            assignmentTitle: assignment.title,
          });

          notificationsToCreate.push({
            userId,
            type: 'ASSIGNMENT_DUE_SOON',
            priority: 'HIGH',
            title: template.title,
            message: template.message,
            actionText: template.actionText,
            actionUrl: `/student/assignments/${assignment.id}`,
            relatedEntityType: 'assignment',
            relatedEntityId: assignment.id,
            showInToast: includeToast,
            showInBrowser: includeBrowser,
            expiresAt: assignment.dueDate!,
            metadata: {
              assignmentTitle: assignment.title,
              teacherName,
              dueDate: assignment.dueDate!.toISOString(),
            },
          });
        }
      }

      // 24 horas antes do vencimento
      if (
        timeDiff <= NOTIFICATION_CONFIG.ASSIGNMENT_WARNING_TIMES.DUE_TOMORROW &&
        timeDiff >
          NOTIFICATION_CONFIG.ASSIGNMENT_WARNING_TIMES.DUE_TOMORROW -
            60 * 60 * 1000
      ) {
        const existing = await checkExistingNotification(
          userId,
          'ASSIGNMENT_DUE_TOMORROW',
          assignment.id
        );

        if (!existing) {
          const template = getNotificationTemplate('ASSIGNMENT_DUE_TOMORROW', {
            assignmentTitle: assignment.title,
          });

          notificationsToCreate.push({
            userId,
            type: 'ASSIGNMENT_DUE_TOMORROW',
            priority: 'MEDIUM',
            title: template.title,
            message: template.message,
            actionText: 'Ver Tarefa',
            actionUrl: `/student/assignments/${assignment.id}`,
            relatedEntityType: 'assignment',
            relatedEntityId: assignment.id,
            showInToast: includeToast,
            showInBrowser: false,
            expiresAt: assignment.dueDate!,
            metadata: {
              assignmentTitle: assignment.title,
              teacherName,
              dueDate: assignment.dueDate!.toISOString(),
            },
          });
        }
      }
    }

    // === TAREFAS EM ATRASO (MANTIDO) ===
    for (const assignment of overdueAssignments) {
      const teacherName =
        `${assignment.lesson.teacher.user.firstName} ${assignment.lesson.teacher.user.lastName}`.trim();

      const existing = await checkExistingNotification(
        userId,
        'ASSIGNMENT_OVERDUE',
        assignment.id
      );

      if (!existing) {
        const template = getNotificationTemplate('ASSIGNMENT_OVERDUE', {
          assignmentTitle: assignment.title,
        });

        notificationsToCreate.push({
          userId,
          type: 'ASSIGNMENT_OVERDUE',
          priority: 'HIGH',
          title: template.title,
          message: template.message,
          actionText: template.actionText,
          actionUrl: `/student/assignments/${assignment.id}`,
          relatedEntityType: 'assignment',
          relatedEntityId: assignment.id,
          showInToast: includeToast,
          showInBrowser: false,
          expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          metadata: {
            assignmentTitle: assignment.title,
            teacherName,
            dueDate: assignment.dueDate!.toISOString(),
          },
        });
      }
    }

    // 7. Criar notificações no banco usando transação (MANTIDO)
    const createdNotifications = [];

    for (const notificationData of notificationsToCreate) {
      try {
        const created = await prisma.$transaction(async (tx) => {
          const baseWhere: any = {
            userId: notificationData.userId,
            type: notificationData.type,
            relatedEntityId: notificationData.relatedEntityId,
            status: { in: ['UNREAD', 'READ'] as const },
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

    // 8. Buscar notificações existentes (MANTIDO)
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

    // 9. Filtrar notificações para toast e browser (MANTIDO)
    const toastNotifications = allNotifications
      .filter((n) => n.showInToast && !n.toastShown && includeToast)
      .slice(0, NOTIFICATION_CONFIG.MAX_TOAST_NOTIFICATIONS);

    const browserNotifications = allNotifications
      .filter((n) => n.showInBrowser && !n.browserShown && includeBrowser)
      .slice(0, NOTIFICATION_CONFIG.MAX_BROWSER_NOTIFICATIONS);

    // 10. Contar total não lidas (MANTIDO)
    const totalUnread = await prisma.notification.count({
      where: {
        userId,
        status: 'UNREAD',
        expiresAt: { gte: now },
      },
    });

    // 11. Limpar notificações expiradas (MANTIDO)
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
      `✅ [STUDENT-CHECK] Verificação concluída - ${createdNotifications.length} notificações automáticas criadas`
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
