// app/api/student/notifications/check/route.ts - CORRIGIDO COM DEDUPLICAÇÃO ROBUSTA
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import {
  NotificationCheckResult,
  NOTIFICATION_CONFIG,
  getNotificationTemplate,
} from '@/app/types/notification';
import {
  generateNotificationHash,
  createNotificationSafely,
  cleanupNotifications,
} from '@/app/utils/notifications/deduplication';
import prisma from '@/app/libs/prismadb';

// 🔥 CONDIÇÕES ESPECÍFICAS PARA EVITAR SPAM DE NOTIFICAÇÕES
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

    console.log(
      `📬 [STUDENT-CHECK] 🚀 Verificando notificações para ${userId} (includeToast: ${includeToast})`
    );

    // 0. Limpeza automática de notificações antigas/duplicadas
    await cleanupNotifications(prisma, userId);

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

    // 5. Gerar notificações com DEDUPLICAÇÃO ROBUSTA
    const notificationsToCreate: any[] = [];

    // === AULAS PRÓXIMAS (CONDIÇÕES ESPECÍFICAS PARA EVITAR SPAM) ===
    for (const lesson of upcomingLessons) {
      const timeDiff = lesson.scheduledAt.getTime() - now.getTime();
      const teacherName =
        `${lesson.teacher.user.firstName} ${lesson.teacher.user.lastName}`.trim();
      const time = lesson.scheduledAt.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      // 30 minutos antes (janela de 5 minutos para evitar spam)
      if (
        timeDiff <= NOTIFICATION_CONFIG.LESSON_WARNING_TIMES.STARTING_SOON &&
        timeDiff >
          NOTIFICATION_CONFIG.LESSON_WARNING_TIMES.STARTING_SOON - 5 * 60 * 1000
      ) {
        const template = getNotificationTemplate('LESSON_STARTING_SOON', {
          teacherName,
          time,
        });

        const metadata = {
          teacherName,
          lessonTime: lesson.scheduledAt.toISOString(),
          time,
        };

        const uniqueHash = generateNotificationHash(
          userId,
          'LESSON_STARTING_SOON',
          lesson.id,
          metadata
        );

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
          metadata,
          uniqueHash,
        });

        console.log(
          `📬 [LESSON-SOON] Preparando notificação para aula em 30min: ${lesson.id}`
        );
      }

      // 24 horas antes (apenas entre 18h-20h)
      if (shouldCreateTimeBasedNotification(timeDiff, 'TOMORROW')) {
        const template = getNotificationTemplate('LESSON_TOMORROW', {
          teacherName,
          time,
        });

        const metadata = {
          teacherName,
          lessonTime: lesson.scheduledAt.toISOString(),
          time,
        };

        const uniqueHash = generateNotificationHash(
          userId,
          'LESSON_TOMORROW',
          lesson.id,
          metadata
        );

        notificationsToCreate.push({
          userId,
          type: 'LESSON_TOMORROW',
          priority: 'MEDIUM',
          title: template.title,
          message: template.message,
          actionText: 'Ver Agenda',
          actionUrl: '/student/calendar',
          relatedEntityType: 'lesson',
          relatedEntityId: lesson.id,
          showInToast: includeToast,
          showInBrowser: false,
          expiresAt: new Date(lesson.scheduledAt.getTime()),
          metadata,
          uniqueHash,
        });

        console.log(
          `📬 [LESSON-TOMORROW] Preparando notificação para aula amanhã: ${lesson.id}`
        );
      }
    }

    // === TAREFAS VENCENDO (CONDIÇÕES ESPECÍFICAS PARA EVITAR SPAM) ===
    for (const assignment of assignments) {
      const timeDiff = assignment.dueDate!.getTime() - now.getTime();

      // 2 horas antes (janela de 15 minutos para evitar spam)
      if (shouldCreateTimeBasedNotification(timeDiff, 'SOON')) {
        const template = getNotificationTemplate('ASSIGNMENT_DUE_SOON', {
          assignmentTitle: assignment.title,
        });

        const metadata = {
          assignmentTitle: assignment.title,
          dueDate: assignment.dueDate!.toISOString(),
        };

        const uniqueHash = generateNotificationHash(
          userId,
          'ASSIGNMENT_DUE_SOON',
          assignment.id,
          metadata
        );

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
          metadata,
          uniqueHash,
        });

        console.log(
          `📬 [ASSIGNMENT-SOON] Preparando notificação para tarefa em 2h: ${assignment.id}`
        );
      }

      // 24 horas antes (apenas entre 18h-20h)
      if (shouldCreateTimeBasedNotification(timeDiff, 'TOMORROW')) {
        const template = getNotificationTemplate('ASSIGNMENT_DUE_TOMORROW', {
          assignmentTitle: assignment.title,
        });

        const metadata = {
          assignmentTitle: assignment.title,
          dueDate: assignment.dueDate!.toISOString(),
        };

        const uniqueHash = generateNotificationHash(
          userId,
          'ASSIGNMENT_DUE_TOMORROW',
          assignment.id,
          metadata
        );

        notificationsToCreate.push({
          userId,
          type: 'ASSIGNMENT_DUE_TOMORROW',
          priority: 'MEDIUM',
          title: template.title,
          message: template.message,
          actionText: template.actionText,
          actionUrl: `/student/assignments/${assignment.id}`,
          relatedEntityType: 'assignment',
          relatedEntityId: assignment.id,
          showInToast: includeToast,
          showInBrowser: false,
          expiresAt: assignment.dueDate!,
          metadata,
          uniqueHash,
        });

        console.log(
          `📬 [ASSIGNMENT-TOMORROW] Preparando notificação para tarefa amanhã: ${assignment.id}`
        );
      }
    }

    // === TAREFAS EM ATRASO (apenas às 9h da manhã uma vez por dia) ===
    for (const assignment of overdueAssignments) {
      if (shouldCreateTimeBasedNotification(0, 'OVERDUE')) {
        const template = getNotificationTemplate('ASSIGNMENT_OVERDUE', {
          assignmentTitle: assignment.title,
        });

        const metadata = {
          assignmentTitle: assignment.title,
          dueDate: assignment.dueDate!.toISOString(),
          daysOverdue: Math.floor(
            (now.getTime() - assignment.dueDate!.getTime()) /
              (24 * 60 * 60 * 1000)
          ),
        };

        const uniqueHash = generateNotificationHash(
          userId,
          'ASSIGNMENT_OVERDUE',
          assignment.id,
          metadata
        );

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
          metadata,
          uniqueHash,
        });

        console.log(
          `📬 [ASSIGNMENT-OVERDUE] Preparando notificação para tarefa em atraso: ${assignment.id}`
        );
      }
    }

    // 6. Criar notificações usando TRANSAÇÃO SEGURA
    const createdNotifications = [];
    console.log(
      `📬 [STUDENT-CHECK] Tentando criar ${notificationsToCreate.length} notificações`
    );

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
        console.error(
          `📬 [STUDENT-CHECK] Erro ao criar notificação ${notificationData.type}:`,
          error
        );
      }
    }

    console.log(
      `📬 [STUDENT-CHECK] ✅ Criadas ${createdNotifications.length} notificações (sem duplicatas)`
    );

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

    console.log(
      `📬 [STUDENT-CHECK] Filtradas - Toast: ${toastNotifications.length}, Browser: ${browserNotifications.length}`
    );

    // 9. Contar total não lidas
    const totalUnread = await prisma.notification.count({
      where: {
        userId,
        status: 'UNREAD',
        expiresAt: { gte: now },
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

    console.log(`📬 [STUDENT-CHECK] ✅ Resposta final:`, {
      novas: result.newNotifications.length,
      toast: result.toastNotifications.length,
      browser: result.browserNotifications.length,
      naoLidas: result.totalUnread,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('📬 [STUDENT-CHECK] ❌ Erro geral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
