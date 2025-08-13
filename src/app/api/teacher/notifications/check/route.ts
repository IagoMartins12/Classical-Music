// app/api/teacher/notifications/check/route.ts - CORRIGIDO COMPLETAMENTE SEM SINTAXE JSON INCORRETA
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import {
  NotificationCheckResult,
  NOTIFICATION_CONFIG,
  getNotificationTemplate,
} from '@/app/types/notification';
import prisma from '@/app/libs/prismadb';

// Helper para verificar se notificação já existe (CORRIGIDO)
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

  // Para assignments, usar consulta em duas etapas
  if (
    type === 'ASSIGNMENT_FEEDBACK_NEEDED' &&
    metadata?.assignmentCompletedAt
  ) {
    // Primeiro: buscar todas as notificações candidatas
    const candidates = await prisma.notification.findMany({
      where: baseWhere,
    });

    // Segundo: filtrar por metadata específico em JavaScript
    return candidates.find((n) => {
      if (!n.metadata || typeof n.metadata !== 'object') return false;
      const meta = n.metadata as any;
      return meta.assignmentCompletedAt === metadata.assignmentCompletedAt;
    });
  }

  // Para outras notificações, verificação simples
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

    // 1. Verificar aulas que precisam de notificação
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

    // 2. Verificar aulas passadas sem atualização de status
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

    // 3. Verificar tarefas que precisam de feedback
    const assignmentsNeedingFeedback = await prisma.assignment.findMany({
      where: {
        lesson: {
          teacherId: userId,
        },
        isCompleted: true,
        teacherFeedback: null,
        completedAt: {
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

    // 4. Verificar convites pendentes
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

    // 5. Gerar notificações baseadas nas verificações
    const notificationsToCreate: any[] = [];

    // === AULAS PRÓXIMAS ===
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

    // === AULAS PASSADAS SEM STATUS ===
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

    // === TAREFAS PRECISANDO DE FEEDBACK (CORRIGIDO) ===
    for (const assignment of assignmentsNeedingFeedback) {
      const studentName =
        `${assignment.student.user.firstName} ${assignment.student.user.lastName}`.trim();

      const feedbackMetadata = {
        studentName,
        assignmentTitle: assignment.title,
        assignmentCompletedAt: assignment.completedAt?.toISOString(),
      };

      // Verificação com metadata específico
      const existing = await checkExistingNotification(
        userId,
        'ASSIGNMENT_FEEDBACK_NEEDED',
        assignment.id,
        feedbackMetadata
      );

      if (!existing) {
        const template = getNotificationTemplate('ASSIGNMENT_FEEDBACK_NEEDED', {
          studentName,
          assignmentTitle: assignment.title,
        });

        notificationsToCreate.push({
          userId,
          type: 'ASSIGNMENT_FEEDBACK_NEEDED',
          priority: 'MEDIUM',
          title: template.title,
          message: template.message,
          actionText: 'Dar Feedback',
          actionUrl: `/teacher/assignments/${assignment.id}`,
          relatedEntityType: 'assignment',
          relatedEntityId: assignment.id,
          showInToast: includeToast,
          showInBrowser: false,
          expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          metadata: feedbackMetadata,
        });
      }
    }

    // === CONVITES PENDENTES ===
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

    // 6. Criar notificações no banco usando transação
    const createdNotifications = [];

    for (const notificationData of notificationsToCreate) {
      try {
        const created = await prisma.$transaction(async (tx) => {
          // Verificação final dentro da transação
          const baseWhere: any = {
            userId: notificationData.userId,
            type: notificationData.type,
            relatedEntityId: notificationData.relatedEntityId,
            status: { in: ['UNREAD', 'READ'] as const },
            expiresAt: { gte: now },
          };

          let finalCheck;

          // Para assignments, usar verificação específica
          if (
            notificationData.type === 'ASSIGNMENT_FEEDBACK_NEEDED' &&
            notificationData.metadata?.assignmentCompletedAt
          ) {
            const candidates = await tx.notification.findMany({
              where: baseWhere,
            });

            finalCheck = candidates.find((n) => {
              if (!n.metadata || typeof n.metadata !== 'object') return false;
              const meta = n.metadata as any;
              return (
                meta.assignmentCompletedAt ===
                notificationData.metadata.assignmentCompletedAt
              );
            });
          } else {
            finalCheck = await tx.notification.findFirst({
              where: baseWhere,
            });
          }

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

    // 7. Buscar notificações existentes
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

    // 8. Filtrar notificações para toast e browser
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

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking teacher notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
