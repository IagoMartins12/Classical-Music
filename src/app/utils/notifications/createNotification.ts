// app/utils/createNotification.ts - UTILITÁRIO PARA CRIAR NOTIFICAÇÕES EM ROTAS

import {
  NotificationType,
  getNotificationTemplate,
  NOTIFICATION_TYPE_CONFIG,
} from '@/app/types/notification';
import prisma from '@/app/libs/prismadb';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: Record<string, any>;
  customTitle?: string;
  customMessage?: string;
  actionUrl?: string;
}

/**
 * 🆕 Função principal para criar notificações em rotas de ação
 * Evita duplicatas e cria com configurações automáticas
 */
export async function createNotification({
  userId,
  type,
  relatedEntityType,
  relatedEntityId,
  metadata = {},
  customTitle,
  customMessage,
  actionUrl,
}: CreateNotificationParams): Promise<any | null> {
  try {
    console.log(`📬 [CREATE-NOTIFICATION] Criando ${type} para ${userId}`, {
      entityType: relatedEntityType,
      entityId: relatedEntityId,
      metadata: Object.keys(metadata),
    });

    const config = NOTIFICATION_TYPE_CONFIG[type];
    const template = getNotificationTemplate(type, metadata);
    const now = new Date();

    // 🔍 VERIFICAR DUPLICATA ESPECÍFICA PARA CADA TIPO
    const existingNotification = await checkForExistingNotification(
      userId,
      type,
      relatedEntityId,
      metadata
    );

    if (existingNotification) {
      console.log(
        `📬 [CREATE-NOTIFICATION] Notificação ${type} já existe para ${userId}, pulando...`
      );
      return null;
    }

    // 📝 CONSTRUIR DADOS DA NOTIFICAÇÃO
    const notificationData = {
      userId,
      type,
      priority: config.priority,
      title: customTitle || template.title,
      message: customMessage || template.message,
      actionText: template.actionText,
      actionUrl: actionUrl || buildActionUrl(type, relatedEntityId, metadata),
      relatedEntityType,
      relatedEntityId,
      metadata,
      showInToast: config.showInToast,
      showInBrowser: config.showInBrowser,
      showInPage: true,
      expiresAt: config.defaultExpiry
        ? new Date(now.getTime() + config.defaultExpiry * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 dias padrão
    };

    // ✅ CRIAR NOTIFICAÇÃO
    const createdNotification = await prisma.notification.create({
      data: notificationData,
    });

    console.log(
      `✅ [CREATE-NOTIFICATION] Notificação ${type} criada:`,
      createdNotification.id
    );

    return createdNotification;
  } catch (error) {
    console.error(
      `❌ [CREATE-NOTIFICATION] Erro ao criar notificação ${type}:`,
      error
    );
    return null;
  }
}

/**
 * 🔍 Verificar se já existe notificação similar (evitar duplicatas)
 */
async function checkForExistingNotification(
  userId: string,
  type: NotificationType,
  relatedEntityId?: string,
  metadata?: Record<string, any>
): Promise<any | null> {
  const now = new Date();

  const baseWhere: any = {
    userId,
    type,
    status: { in: ['UNREAD', 'READ'] as const },
    expiresAt: { gte: now },
  };

  // Para notificações com entidade relacionada
  if (relatedEntityId) {
    baseWhere.relatedEntityId = relatedEntityId;
  }

  // 🔍 VERIFICAÇÕES ESPECÍFICAS POR TIPO
  switch (type) {
    case 'TEACHER_GAVE_FEEDBACK':
      // Verificar por feedback específico (evitar múltiplos feedbacks na mesma tarefa)
      if (metadata?.feedbackDate) {
        const candidates = await prisma.notification.findMany({
          where: baseWhere,
        });
        return candidates.find((n: any) => {
          const meta = n.metadata as any;
          return meta?.feedbackDate === metadata.feedbackDate;
        });
      }
      break;

    case 'LESSON_RESCHEDULED_BY_TEACHER':
      // Verificar por data específica (evitar múltiplos reagendamentos)
      if (metadata?.newScheduledAt) {
        const candidates = await prisma.notification.findMany({
          where: baseWhere,
        });
        return candidates.find((n: any) => {
          const meta = n.metadata as any;
          return meta?.newScheduledAt === metadata.newScheduledAt;
        });
      }
      break;

    case 'ASSIGNMENT_UPDATED_BY_TEACHER':
      // Verificar por timestamp de atualização (evitar múltiplas atualizações)
      if (metadata?.updatedAt) {
        const candidates = await prisma.notification.findMany({
          where: baseWhere,
        });
        return candidates.find((n: any) => {
          const meta = n.metadata as any;
          return meta?.updatedAt === metadata.updatedAt;
        });
      }
      break;

    case 'STUDENT_SUBMITTED_ASSIGNMENT':
      // Verificar por submissão específica
      if (metadata?.submissionDate) {
        const candidates = await prisma.notification.findMany({
          where: baseWhere,
        });
        return candidates.find((n: any) => {
          const meta = n.metadata as any;
          return meta?.submissionDate === metadata.submissionDate;
        });
      }
      break;

    case 'STUDENT_INFORMED_ABSENCE':
    case 'STUDENT_REQUESTED_RESCHEDULE':
      // Para mensagens do aluno, verificar por dia (evitar spam)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      baseWhere.createdAt = {
        gte: today,
        lt: tomorrow,
      };
      break;

    default:
      // Para outros tipos, verificação simples por entidade
      break;
  }

  return await prisma.notification.findFirst({
    where: baseWhere,
  });
}

/**
 * 🔗 Construir URL de ação baseada no tipo de notificação
 */
function buildActionUrl(
  type: NotificationType,
  relatedEntityId?: string,
  metadata?: Record<string, any>
): string {
  switch (type) {
    // ESTUDANTE
    case 'TEACHER_GAVE_FEEDBACK':
    case 'NEW_ASSIGNMENT_CREATED':
    case 'ASSIGNMENT_UPDATED_BY_TEACHER':
      return `/student/assignments/${relatedEntityId}`;

    case 'LESSON_CANCELLED_BY_TEACHER':
    case 'LESSON_RESCHEDULED_BY_TEACHER':
    case 'LESSON_MARKED_NO_SHOW':
      return `/student/lessons/${relatedEntityId}`;

    case 'NEW_LESSON_SCHEDULED':
      return '/student/lessons';

    // PROFESSOR
    case 'STUDENT_SUBMITTED_ASSIGNMENT':
    case 'STUDENT_COMPLETED_ASSIGNMENT':
      return `/teacher/assignments/${relatedEntityId}`;

    case 'STUDENT_GAVE_LESSON_FEEDBACK':
    case 'STUDENT_INFORMED_ABSENCE':
    case 'STUDENT_REQUESTED_RESCHEDULE':
      return `/teacher/lessons/${relatedEntityId}`;

    default:
      return '/notifications';
  }
}

/**
 * 🏭 FACTORY FUNCTIONS para tipos específicos de notificação
 */
export const NotificationFactory = {
  // === PARA ESTUDANTES ===
  teacherGaveFeedback: (
    studentUserId: string,
    assignmentId: string,
    teacherName: string,
    assignmentTitle: string
  ) =>
    createNotification({
      userId: studentUserId,
      type: 'TEACHER_GAVE_FEEDBACK',
      relatedEntityType: 'assignment',
      relatedEntityId: assignmentId,
      metadata: {
        teacherName,
        assignmentTitle,
        feedbackDate: new Date().toISOString(),
      },
    }),

  lessonCancelledByTeacher: (
    studentUserId: string,
    lessonId: string,
    teacherName: string,
    lessonTitle: string,
    reason?: string
  ) =>
    createNotification({
      userId: studentUserId,
      type: 'LESSON_CANCELLED_BY_TEACHER',
      relatedEntityType: 'lesson',
      relatedEntityId: lessonId,
      metadata: {
        teacherName,
        lessonTitle,
        reason,
        cancelledAt: new Date().toISOString(),
      },
    }),

  lessonRescheduledByTeacher: (
    studentUserId: string,
    lessonId: string,
    teacherName: string,
    lessonTitle: string,
    newScheduledAt: Date,
    oldScheduledAt: Date
  ) =>
    createNotification({
      userId: studentUserId,
      type: 'LESSON_RESCHEDULED_BY_TEACHER',
      relatedEntityType: 'lesson',
      relatedEntityId: lessonId,
      metadata: {
        teacherName,
        lessonTitle,
        newScheduledAt: newScheduledAt.toISOString(),
        oldScheduledAt: oldScheduledAt.toISOString(),
        newDate: newScheduledAt.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    }),

  lessonMarkedNoShow: (
    studentUserId: string,
    lessonId: string,
    teacherName: string,
    lessonTitle: string
  ) =>
    createNotification({
      userId: studentUserId,
      type: 'LESSON_MARKED_NO_SHOW',
      relatedEntityType: 'lesson',
      relatedEntityId: lessonId,
      metadata: {
        teacherName,
        lessonTitle,
        markedAt: new Date().toISOString(),
      },
    }),

  newAssignmentCreated: (
    studentUserId: string,
    assignmentId: string,
    teacherName: string,
    assignmentTitle: string
  ) =>
    createNotification({
      userId: studentUserId,
      type: 'NEW_ASSIGNMENT_CREATED',
      relatedEntityType: 'assignment',
      relatedEntityId: assignmentId,
      metadata: {
        teacherName,
        assignmentTitle,
        createdAt: new Date().toISOString(),
      },
    }),

  assignmentUpdatedByTeacher: (
    studentUserId: string,
    assignmentId: string,
    teacherName: string,
    assignmentTitle: string,
    changedFields: string[]
  ) =>
    createNotification({
      userId: studentUserId,
      type: 'ASSIGNMENT_UPDATED_BY_TEACHER',
      relatedEntityType: 'assignment',
      relatedEntityId: assignmentId,
      metadata: {
        teacherName,
        assignmentTitle,
        changedFields,
        updatedAt: new Date().toISOString(),
      },
    }),

  newLessonScheduled: (
    studentUserId: string,
    lessonId: string,
    teacherName: string,
    lessonTitle: string,
    isRecurring: boolean
  ) =>
    createNotification({
      userId: studentUserId,
      type: 'NEW_LESSON_SCHEDULED',
      relatedEntityType: 'lesson',
      relatedEntityId: lessonId,
      metadata: {
        teacherName,
        lessonTitle,
        isRecurring,
        scheduledAt: new Date().toISOString(),
      },
    }),

  // === PARA PROFESSORES ===
  studentSubmittedAssignment: (
    teacherUserId: string,
    assignmentId: string,
    studentName: string,
    assignmentTitle: string
  ) =>
    createNotification({
      userId: teacherUserId,
      type: 'STUDENT_SUBMITTED_ASSIGNMENT',
      relatedEntityType: 'assignment',
      relatedEntityId: assignmentId,
      metadata: {
        studentName,
        assignmentTitle,
        submissionDate: new Date().toISOString(),
      },
    }),

  studentCompletedAssignment: (
    teacherUserId: string,
    assignmentId: string,
    studentName: string,
    assignmentTitle: string
  ) =>
    createNotification({
      userId: teacherUserId,
      type: 'STUDENT_COMPLETED_ASSIGNMENT',
      relatedEntityType: 'assignment',
      relatedEntityId: assignmentId,
      metadata: {
        studentName,
        assignmentTitle,
        completedAt: new Date().toISOString(),
      },
    }),

  studentGaveLessonFeedback: (
    teacherUserId: string,
    lessonId: string,
    studentName: string,
    lessonTitle: string
  ) =>
    createNotification({
      userId: teacherUserId,
      type: 'STUDENT_GAVE_LESSON_FEEDBACK',
      relatedEntityType: 'lesson',
      relatedEntityId: lessonId,
      metadata: {
        studentName,
        lessonTitle,
        feedbackDate: new Date().toISOString(),
      },
    }),

  studentInformedAbsence: (
    teacherUserId: string,
    lessonId: string,
    studentName: string,
    lessonTitle: string,
    message?: string
  ) =>
    createNotification({
      userId: teacherUserId,
      type: 'STUDENT_INFORMED_ABSENCE',
      relatedEntityType: 'lesson',
      relatedEntityId: lessonId,
      metadata: {
        studentName,
        lessonTitle,
        message,
        informedAt: new Date().toISOString(),
      },
    }),

  studentRequestedReschedule: (
    teacherUserId: string,
    lessonId: string,
    studentName: string,
    lessonTitle: string,
    message?: string
  ) =>
    createNotification({
      userId: teacherUserId,
      type: 'STUDENT_REQUESTED_RESCHEDULE',
      relatedEntityType: 'lesson',
      relatedEntityId: lessonId,
      metadata: {
        studentName,
        lessonTitle,
        message,
        requestedAt: new Date().toISOString(),
      },
    }),
};
