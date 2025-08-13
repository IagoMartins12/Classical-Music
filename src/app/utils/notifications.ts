// app/utils/notifications.ts - ATUALIZADO COM PREVENÇÃO DE DUPLICATAS
import {
  NotificationData,
  NotificationType,
  NotificationPriority,
  CreateNotificationData,
  NOTIFICATION_CONFIG,
  NOTIFICATION_TYPE_CONFIG,
  getNotificationTemplate,
} from '@/app/types/notification';
import crypto from 'crypto';

/**
 * 🆕 Helper para criar hash único de notificação
 * Usado para prevenir duplicatas absolutas
 */
export const createNotificationUniqueHash = (
  type: NotificationType,
  userId: string,
  relatedEntityId?: string,
  metadata?: Record<string, any>
): string => {
  let hashInput = `${type}_${userId}`;

  if (relatedEntityId) {
    hashInput += `_${relatedEntityId}`;
  }

  // Para tipos específicos, incluir metadados relevantes
  switch (type) {
    case 'NEW_STUDENT_FEEDBACK':
      // Incluir timestamp do feedback para detectar mudanças reais
      if (metadata?.feedbackDate) {
        hashInput += `_${metadata.feedbackDate}`;
      }
      break;

    case 'ASSIGNMENT_FEEDBACK_NEEDED':
      // Incluir timestamp de completion para detectar novas submissions
      if (metadata?.assignmentCompletedAt) {
        hashInput += `_${metadata.assignmentCompletedAt}`;
      }
      break;

    case 'LESSON_STARTING_SOON':
    case 'LESSON_TOMORROW':
      // Incluir data da aula para distinguir aulas diferentes
      if (metadata?.lessonTime) {
        hashInput += `_${metadata.lessonTime}`;
      }
      break;

    case 'ASSIGNMENT_DUE_SOON':
    case 'ASSIGNMENT_DUE_TOMORROW':
    case 'ASSIGNMENT_OVERDUE':
      // Incluir data de vencimento
      if (metadata?.dueDate) {
        hashInput += `_${metadata.dueDate}`;
      }
      break;

    case 'PRACTICE_REMINDER':
      // Incluir data do lembrete para permitir um por dia
      const today = new Date().toISOString().split('T')[0];
      hashInput += `_${today}`;
      break;

    default:
      // Para outros tipos, usar apenas tipo + entidade
      break;
  }

  // Criar hash SHA-256 curto
  return crypto
    .createHash('sha256')
    .update(hashInput)
    .digest('hex')
    .substring(0, 16);
};

/**
 * 🆕 Helper para verificar se notificação já existe (query otimizada)
 */
export const buildDuplicateCheckQuery = (
  userId: string,
  type: NotificationType,
  relatedEntityId?: string,
  metadata?: Record<string, any>
) => {
  const now = new Date();

  const baseQuery = {
    userId,
    type,
    status: { in: ['UNREAD', 'READ'] },
    expiresAt: { gte: now }, // Apenas não expiradas
  };

  // Adicionar filtro por entidade relacionada se existe
  if (relatedEntityId) {
    (baseQuery as any).relatedEntityId = relatedEntityId;
  }

  // Para tipos específicos, adicionar verificações de metadata
  switch (type) {
    case 'NEW_STUDENT_FEEDBACK':
      if (metadata?.feedbackDate) {
        (baseQuery as any).metadata = {
          path: ['feedbackDate'],
          equals: metadata.feedbackDate,
        };
      }
      break;

    case 'ASSIGNMENT_FEEDBACK_NEEDED':
      if (metadata?.assignmentCompletedAt) {
        (baseQuery as any).metadata = {
          path: ['assignmentCompletedAt'],
          equals: metadata.assignmentCompletedAt,
        };
      }
      break;

    case 'PRACTICE_REMINDER':
      // Para lembretes de prática, verificar se já existe um hoje
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      (baseQuery as any).createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
      break;
  }

  return baseQuery;
};

/**
 * Helper melhorado para criar notificações padronizadas
 */
export class NotificationBuilder {
  private data: Partial<CreateNotificationData & { uniqueHash?: string }> = {};

  constructor(userId: string, type: NotificationType) {
    const config = NOTIFICATION_TYPE_CONFIG[type];
    const template = getNotificationTemplate(type);

    this.data = {
      userId,
      type,
      priority: config.priority,
      title: template.title,
      message: template.message,
      actionText: template.actionText,
      showInToast: config.showInToast,
      showInBrowser: config.showInBrowser,
      showInPage: true,
      expiresAt: config.defaultExpiry
        ? new Date(Date.now() + config.defaultExpiry * 24 * 60 * 60 * 1000)
        : new Date(
            Date.now() +
              NOTIFICATION_CONFIG.DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000
          ),
    };
  }

  title(title: string): this {
    this.data.title = title;
    return this;
  }

  message(message: string): this {
    this.data.message = message;
    return this;
  }

  action(text: string, url: string): this {
    this.data.actionText = text;
    this.data.actionUrl = url;
    return this;
  }

  priority(priority: NotificationPriority): this {
    this.data.priority = priority;
    return this;
  }

  relatedTo(entityType: string, entityId: string): this {
    this.data.relatedEntityType = entityType;
    this.data.relatedEntityId = entityId;
    return this;
  }

  metadata(metadata: Record<string, any>): this {
    this.data.metadata = metadata;
    return this;
  }

  scheduledFor(date: Date): this {
    this.data.scheduledFor = date;
    return this;
  }

  expiresAt(date: Date): this {
    this.data.expiresAt = date;
    return this;
  }

  showInToast(show: boolean = true): this {
    this.data.showInToast = show;
    return this;
  }

  showInBrowser(show: boolean = true): this {
    this.data.showInBrowser = show;
    return this;
  }

  // 🆕 Método para gerar hash único automaticamente
  generateUniqueHash(): this {
    if (this.data.userId && this.data.type) {
      this.data.uniqueHash = createNotificationUniqueHash(
        this.data.type,
        this.data.userId,
        this.data.relatedEntityId,
        this.data.metadata
      );
    }
    return this;
  }

  build(): CreateNotificationData & { uniqueHash?: string } {
    if (
      !this.data.userId ||
      !this.data.type ||
      !this.data.title ||
      !this.data.message
    ) {
      throw new Error('Missing required notification fields');
    }

    // Gerar hash único automaticamente se não foi gerado
    if (!this.data.uniqueHash) {
      this.generateUniqueHash();
    }

    return this.data as CreateNotificationData & { uniqueHash?: string };
  }
}

/**
 * Factory functions atualizadas para tipos específicos de notificação
 */
export const NotificationFactory = {
  // === AULAS ===
  lessonStartingSoon: (
    userId: string,
    lessonId: string,
    studentName: string,
    time: string,
    lessonTime: string
  ) => {
    return new NotificationBuilder(userId, 'LESSON_STARTING_SOON')
      .title('Aula em 30 minutos')
      .message(`Sua aula com ${studentName} começará em breve`)
      .action('Ver Aula', `/teacher/lessons/${lessonId}`)
      .relatedTo('lesson', lessonId)
      .metadata({ studentName, time, lessonTime })
      .showInBrowser(true)
      .generateUniqueHash()
      .build();
  },

  lessonTomorrow: (
    userId: string,
    lessonId: string,
    studentName: string,
    time: string,
    lessonTime: string
  ) => {
    return new NotificationBuilder(userId, 'LESSON_TOMORROW')
      .title('Aula amanhã')
      .message(`Lembre-se: aula com ${studentName} amanhã às ${time}`)
      .action('Ver Agenda', '/teacher/calendar')
      .relatedTo('lesson', lessonId)
      .metadata({ studentName, time, lessonTime })
      .generateUniqueHash()
      .build();
  },

  // === TAREFAS ===
  assignmentDueSoon: (
    userId: string,
    assignmentId: string,
    assignmentTitle: string,
    dueDate: string
  ) => {
    return new NotificationBuilder(userId, 'ASSIGNMENT_DUE_SOON')
      .title('Tarefa vence em 2 horas')
      .message(`A tarefa "${assignmentTitle}" vence em breve`)
      .action('Ver Tarefa', `/student/assignments/${assignmentId}`)
      .relatedTo('assignment', assignmentId)
      .metadata({ assignmentTitle, dueDate })
      .showInBrowser(true)
      .generateUniqueHash()
      .build();
  },

  assignmentFeedbackNeeded: (
    userId: string,
    assignmentId: string,
    studentName: string,
    assignmentTitle: string,
    assignmentCompletedAt: string
  ) => {
    return new NotificationBuilder(userId, 'ASSIGNMENT_FEEDBACK_NEEDED')
      .title('Tarefa precisa de feedback')
      .message(
        `${studentName} completou "${assignmentTitle}" e aguarda seu feedback`
      )
      .action('Dar Feedback', `/teacher/assignments/${assignmentId}`)
      .relatedTo('assignment', assignmentId)
      .metadata({ studentName, assignmentTitle, assignmentCompletedAt })
      .generateUniqueHash()
      .build();
  },

  newStudentFeedback: (
    userId: string,
    assignmentId: string,
    teacherName: string,
    assignmentTitle: string,
    feedbackDate: string
  ) => {
    return new NotificationBuilder(userId, 'NEW_STUDENT_FEEDBACK')
      .title('Novo feedback do professor')
      .message(`${teacherName} deu feedback na tarefa "${assignmentTitle}"`)
      .action('Ver Feedback', `/student/assignments/${assignmentId}`)
      .relatedTo('assignment', assignmentId)
      .metadata({ teacherName, assignmentTitle, feedbackDate })
      .generateUniqueHash()
      .build();
  },

  // === ESTUDOS ===
  practiceReminder: (userId: string) => {
    return new NotificationBuilder(userId, 'PRACTICE_REMINDER')
      .title('Hora de praticar!')
      .message('Que tal dedicar um tempo aos seus estudos musicais hoje?')
      .action('Ver Estudos', '/learning')
      .relatedTo('practice', '')
      .expiresAt(new Date(Date.now() + 24 * 60 * 60 * 1000)) // 24h
      .generateUniqueHash()
      .build();
  },
};

/**
 * 🆕 Helper para executar verificação de duplicata segura com transação
 */
export const createNotificationSafely = async (
  prisma: any,
  notificationData: CreateNotificationData & { uniqueHash?: string }
) => {
  return await prisma.$transaction(async (tx: any) => {
    // Verificação final dentro da transação
    const duplicateQuery = buildDuplicateCheckQuery(
      notificationData.userId,
      notificationData.type,
      notificationData.relatedEntityId,
      notificationData.metadata
    );

    const existing = await tx.notification.findFirst({
      where: duplicateQuery,
    });

    if (existing) {
      console.log('📬 [DUPLICATE-PREVENTION] Notification already exists:', {
        type: notificationData.type,
        entityId: notificationData.relatedEntityId,
        existingId: existing.id,
      });
      return null; // Já existe
    }

    // Criar notificação
    const created = await tx.notification.create({
      data: notificationData,
    });

    console.log('📬 [NOTIFICATION-CREATED] New notification:', {
      id: created.id,
      type: created.type,
      title: created.title,
      entityId: created.relatedEntityId,
    });

    return created;
  });
};

/**
 * Helpers existentes mantidos...
 */
export const getNotificationCache = () => {
  if (typeof window === 'undefined') return { lastShown: {} };

  try {
    const stored = localStorage.getItem(
      NOTIFICATION_CONFIG.NOTIFICATION_STORAGE_KEY
    );
    return stored ? JSON.parse(stored) : { lastShown: {} };
  } catch {
    return { lastShown: {} };
  }
};

export const saveNotificationCache = (cache: any) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      NOTIFICATION_CONFIG.NOTIFICATION_STORAGE_KEY,
      JSON.stringify(cache)
    );
  } catch (error) {
    console.warn('Failed to save notification cache:', error);
  }
};

/**
 * Helper para agrupar notificações por data
 */
export const groupNotificationsByDate = (notifications: NotificationData[]) => {
  const groups: Record<string, NotificationData[]> = {};

  notifications.forEach((notification) => {
    const date = new Date(notification.createdAt);
    const key = date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(notification);
  });

  return groups;
};

/**
 * Helper para determinar cor da prioridade
 */
export const getPriorityColor = (priority: NotificationPriority): string => {
  switch (priority) {
    case 'CRITICAL':
    case 'HIGH':
      return 'accent-red';
    case 'MEDIUM':
      return 'accent-amber';
    case 'LOW':
    default:
      return 'accent-blue';
  }
};

/**
 * Helper para limpar notificações expiradas do cache local
 */
export const cleanupExpiredNotifications = (
  notifications: NotificationData[]
): NotificationData[] => {
  const now = new Date();
  return notifications.filter((notification) => {
    if (!notification.expiresAt) return true;
    return new Date(notification.expiresAt) > now;
  });
};
