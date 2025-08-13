// app/api/student/notifications/check/route.ts - CORRIGIDO COMPLETAMENTE SEM SINTAXE JSON INCORRETA
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

  // Para feedbacks, usar consulta em duas etapas
  if (type === 'NEW_STUDENT_FEEDBACK' && metadata?.feedbackDate) {
    // Primeiro: buscar todas as notificações candidatas
    const candidates = await prisma.notification.findMany({
      where: baseWhere,
    });

    // Segundo: filtrar por metadata específico em JavaScript
    return candidates.find((n) => {
      if (!n.metadata || typeof n.metadata !== 'object') return false;
      const meta = n.metadata as any;
      return meta.feedbackDate === metadata.feedbackDate;
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

    // 5. Verificar novos feedbacks do professor
    const recentFeedbacks = await prisma.assignment.findMany({
      where: {
        studentId: studentProfile.id,
        teacherFeedback: { not: null },
        updatedAt: {
          gte: lastCheck
            ? new Date(lastCheck)
            : new Date(now.getTime() - 24 * 60 * 60 * 1000),
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

    // 6. Gerar notificações baseadas nas verificações
    const notificationsToCreate: any[] = [];

    // === AULAS PRÓXIMAS ===
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
            studentName: teacherName,
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
            message: `Sua aula com ${teacherName} começará em breve`,
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
          notificationsToCreate.push({
            userId,
            type: 'LESSON_TOMORROW',
            priority: 'MEDIUM',
            title: 'Aula amanhã',
            message: `Lembre-se: aula com ${teacherName} amanhã às ${lesson.scheduledAt.toLocaleTimeString(
              'pt-BR',
              { hour: '2-digit', minute: '2-digit' }
            )}`,
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

    // === TAREFAS VENCENDO ===
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
          notificationsToCreate.push({
            userId,
            type: 'ASSIGNMENT_DUE_TOMORROW',
            priority: 'MEDIUM',
            title: 'Tarefa vence amanhã',
            message: `A tarefa "${assignment.title}" vence amanhã`,
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

    // === TAREFAS EM ATRASO ===
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

    // === NOVOS FEEDBACKS (CORRIGIDO) ===
    for (const assignment of recentFeedbacks) {
      const teacherName =
        `${assignment.lesson.teacher.user.firstName} ${assignment.lesson.teacher.user.lastName}`.trim();

      const feedbackMetadata = {
        assignmentTitle: assignment.title,
        teacherName,
        feedbackDate: assignment.updatedAt.toISOString(),
      };

      // Verificação com metadata específico
      const existing = await checkExistingNotification(
        userId,
        'NEW_STUDENT_FEEDBACK',
        assignment.id,
        feedbackMetadata
      );

      if (!existing) {
        notificationsToCreate.push({
          userId,
          type: 'NEW_STUDENT_FEEDBACK',
          priority: 'LOW',
          title: 'Novo feedback do professor',
          message: `${teacherName} deu feedback na tarefa "${assignment.title}"`,
          actionText: 'Ver Feedback',
          actionUrl: `/student/assignments/${assignment.id}`,
          relatedEntityType: 'assignment',
          relatedEntityId: assignment.id,
          showInToast: includeToast,
          showInBrowser: false,
          expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          metadata: feedbackMetadata,
        });
      }
    }

    // === LEMBRETE DE PRÁTICA ===
    // const existingPracticeReminder = await prisma.notification.findFirst({
    //   where: {
    //     userId,
    //     type: 'PRACTICE_REMINDER',
    //     createdAt: {
    //       gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    //     },
    //     status: { in: ['UNREAD', 'READ'] },
    //   },
    // });

    // if (!existingPracticeReminder) {
    //   const lastLesson = await prisma.lesson.findFirst({
    //     where: {
    //       studentId: studentProfile.id,
    //       status: 'COMPLETED',
    //     },
    //     orderBy: { scheduledAt: 'desc' },
    //   });

    //   if (
    //     !lastLesson ||
    //     now.getTime() - lastLesson.scheduledAt.getTime() >
    //       2 * 24 * 60 * 60 * 1000
    //   ) {
    //     notificationsToCreate.push({
    //       userId,
    //       type: 'PRACTICE_REMINDER',
    //       priority: 'LOW',
    //       title: 'Hora de praticar!',
    //       message: 'Que tal dedicar um tempo aos seus estudos musicais hoje?',
    //       actionText: 'Ver Estudos',
    //       actionUrl: '/learning',
    //       relatedEntityType: 'practice',
    //       relatedEntityId: null,
    //       showInToast: includeToast,
    //       showInBrowser: false,
    //       expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    //       metadata: {
    //         reminderDate: now.toISOString(),
    //       },
    //     });
    //   }
    // }

    // 7. Criar notificações no banco usando transação
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

          // Para feedbacks, usar verificação específica
          if (
            notificationData.type === 'NEW_STUDENT_FEEDBACK' &&
            notificationData.metadata?.feedbackDate
          ) {
            const candidates = await tx.notification.findMany({
              where: baseWhere,
            });

            finalCheck = candidates.find((n) => {
              if (!n.metadata || typeof n.metadata !== 'object') return false;
              const meta = n.metadata as any;
              return (
                meta.feedbackDate === notificationData.metadata.feedbackDate
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

    // 8. Buscar notificações existentes
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

    // 9. Filtrar notificações para toast e browser
    const toastNotifications = allNotifications
      .filter((n) => n.showInToast && !n.toastShown && includeToast)
      .slice(0, NOTIFICATION_CONFIG.MAX_TOAST_NOTIFICATIONS);

    const browserNotifications = allNotifications
      .filter((n) => n.showInBrowser && !n.browserShown && includeBrowser)
      .slice(0, NOTIFICATION_CONFIG.MAX_BROWSER_NOTIFICATIONS);

    // 10. Contar total não lidas
    const totalUnread = await prisma.notification.count({
      where: {
        userId,
        status: 'UNREAD',
        expiresAt: { gte: now },
      },
    });

    // 11. Limpar notificações expiradas
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
    console.error('Error checking student notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
