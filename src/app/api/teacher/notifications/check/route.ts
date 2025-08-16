// app/api/teacher/notifications/check/route.ts - CORRIGIDO COM DEDUPLICAÇÃO ROBUSTA
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
      `📬 [TEACHER-CHECK] 🚀 Verificando notificações para ${userId} (includeToast: ${includeToast})`
    );

    // 0. Limpeza automática de notificações antigas/duplicadas
    await cleanupNotifications(prisma, userId);

    // 1. Verificar aulas que precisam de notificação (CONDIÇÕES ESPECÍFICAS)
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

    // 3. Verificar convites pendentes
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

    // 4. Gerar notificações baseadas nas verificações (APENAS AUTOMÁTICAS COM DEDUPLICAÇÃO)
    const notificationsToCreate: any[] = [];

    // === AULAS PRÓXIMAS (CONDIÇÕES ESPECÍFICAS PARA EVITAR SPAM) ===
    for (const lesson of upcomingLessons) {
      const timeDiff = lesson.scheduledAt.getTime() - now.getTime();
      const studentName =
        `${lesson.student.user.firstName} ${lesson.student.user.lastName}`.trim();
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
          studentName,
          time,
        });

        const metadata = {
          studentName,
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
          actionUrl: `/teacher/lessons/${lesson.id}`,
          relatedEntityType: 'lesson',
          relatedEntityId: lesson.id,
          showInToast: includeToast,
          showInBrowser: includeBrowser,
          expiresAt: new Date(lesson.scheduledAt.getTime() + 60 * 60 * 1000),
          metadata,
          uniqueHash,
        });

        console.log(
          `📬 [TEACHER-LESSON-SOON] Preparando notificação para aula em 30min: ${lesson.id}`
        );
      }

      // 24 horas antes (apenas entre 18h-20h)
      const currentHour = now.getHours();
      if (
        timeDiff <= NOTIFICATION_CONFIG.LESSON_WARNING_TIMES.TOMORROW &&
        timeDiff >
          NOTIFICATION_CONFIG.LESSON_WARNING_TIMES.TOMORROW - 60 * 60 * 1000 &&
        currentHour >= 18 &&
        currentHour <= 20
      ) {
        const template = getNotificationTemplate('LESSON_TOMORROW', {
          studentName,
          time,
        });

        const metadata = {
          studentName,
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
          actionUrl: '/teacher/calendar',
          relatedEntityType: 'lesson',
          relatedEntityId: lesson.id,
          showInToast: includeToast,
          showInBrowser: false,
          expiresAt: new Date(lesson.scheduledAt.getTime()),
          metadata,
          uniqueHash,
        });

        console.log(
          `📬 [TEACHER-LESSON-TOMORROW] Preparando notificação para aula amanhã: ${lesson.id}`
        );
      }
    }

    // === AULAS PASSADAS SEM STATUS ===
    for (const lesson of pastLessons) {
      const studentName =
        `${lesson.student.user.firstName} ${lesson.student.user.lastName}`.trim();

      const template = getNotificationTemplate('LESSON_STATUS_PENDING', {
        studentName,
      });

      const metadata = {
        studentName,
        lessonTime: lesson.scheduledAt.toISOString(),
      };

      const uniqueHash = generateNotificationHash(
        userId,
        'LESSON_STATUS_PENDING',
        lesson.id,
        metadata
      );

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
        metadata,
        uniqueHash,
      });

      console.log(
        `📬 [TEACHER-STATUS-PENDING] Preparando notificação para status pendente: ${lesson.id}`
      );
    }

    // === CONVITES PENDENTES ===
    for (const invite of pendingInvites) {
      const studentName =
        `${invite.student.user.firstName} ${invite.student.user.lastName}`.trim();

      const template = getNotificationTemplate('STUDENT_INVITE_PENDING', {
        studentName,
      });

      const metadata = {
        studentName,
        inviteDate: invite.createdAt.toISOString(),
      };

      const uniqueHash = generateNotificationHash(
        userId,
        'STUDENT_INVITE_PENDING',
        invite.id,
        metadata
      );

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
        metadata,
        uniqueHash,
      });

      console.log(
        `📬 [TEACHER-INVITE-PENDING] Preparando notificação para convite pendente: ${invite.id}`
      );
    }

    // 5. Criar notificações usando TRANSAÇÃO SEGURA
    const createdNotifications = [];
    console.log(
      `📬 [TEACHER-CHECK] Tentando criar ${notificationsToCreate.length} notificações`
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
          `📬 [TEACHER-CHECK] Erro ao criar notificação ${notificationData.type}:`,
          error
        );
      }
    }

    console.log(
      `📬 [TEACHER-CHECK] ✅ Criadas ${createdNotifications.length} notificações (sem duplicatas)`
    );

    // 6. Buscar notificações existentes
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

    // 7. Filtrar notificações para toast e browser (SEM DUPLICATAS)
    const toastNotifications = allNotifications
      .filter((n) => n.showInToast && !n.toastShown && includeToast)
      .slice(0, NOTIFICATION_CONFIG.MAX_TOAST_NOTIFICATIONS);

    const browserNotifications = allNotifications
      .filter((n) => n.showInBrowser && !n.browserShown && includeBrowser)
      .slice(0, NOTIFICATION_CONFIG.MAX_BROWSER_NOTIFICATIONS);

    console.log(
      `📬 [TEACHER-CHECK] Filtradas - Toast: ${toastNotifications.length}, Browser: ${browserNotifications.length}`
    );

    // 8. Contar total não lidas
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

    console.log(`📬 [TEACHER-CHECK] ✅ Resposta final:`, {
      novas: result.newNotifications.length,
      toast: result.toastNotifications.length,
      browser: result.browserNotifications.length,
      naoLidas: result.totalUnread,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('📬 [TEACHER-CHECK] ❌ Erro geral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
