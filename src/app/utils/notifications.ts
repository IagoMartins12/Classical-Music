// app/utils/notifications.ts - CORRIGIDO COM PREVENÇÃO ROBUSTA DE DUPLICATAS
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
 * 🆕 Helper para criar hash único MAIS ESPECÍFICO
 * Inclui data específica para notificações baseadas em tempo
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
    case 'ASSIGNMENT_DUE_SOON':
    case 'ASSIGNMENT_DUE_TOMORROW':
    case 'ASSIGNMENT_OVERDUE':
      // Incluir data de vencimento E data atual para permitir apenas 1 por dia
      if (metadata?.dueDate) {
        const dueDate = new Date(metadata.dueDate).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        hashInput += `_${dueDate}_${today}`;
      }
      break;

    case 'LESSON_STARTING_SOON':
    case 'LESSON_TOMORROW':
      // Incluir data da aula específica
      if (metadata?.lessonTime) {
        const lessonDate = new Date(metadata.lessonTime)
          .toISOString()
          .split('T')[0];
        hashInput += `_${lessonDate}`;
      }
      break;

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
 * 🆕 Helper para verificar se notificação já existe usando HASH ÚNICO
 */
export const buildDuplicateCheckQuery = (
  userId: string,
  type: NotificationType,
  uniqueHash: string,
  relatedEntityId?: string
) => {
  const now = new Date();

  return {
    userId,
    uniqueHash, // 🔥 PRINCIPAL MUDANÇA - usar hash único como chave primária
    status: { in: ['UNREAD', 'READ'] },
    expiresAt: { gte: now }, // Apenas não expiradas
  };
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
 * 🆕 Helper para executar verificação de duplicata MAIS ROBUSTA
 */
export const createNotificationSafely = async (
  prisma: any,
  notificationData: CreateNotificationData & { uniqueHash?: string }
) => {
  return await prisma.$transaction(async (tx: any) => {
    // 🔥 VERIFICAÇÃO BASEADA EM HASH ÚNICO
    if (notificationData.uniqueHash) {
      const existing = await tx.notification.findFirst({
        where: {
          userId: notificationData.userId,
          uniqueHash: notificationData.uniqueHash,
          status: { in: ['UNREAD', 'read'] },
          expiresAt: { gte: new Date() },
        },
      });

      if (existing) {
        console.log('📬 [DUPLICATE-PREVENTION] Notification already exists:', {
          type: notificationData.type,
          hash: notificationData.uniqueHash,
          existingId: existing.id,
        });
        return null; // Já existe
      }
    }

    // Criar notificação
    const created = await tx.notification.create({
      data: notificationData,
    });

    console.log('📬 [NOTIFICATION-CREATED] New notification:', {
      id: created.id,
      type: created.type,
      title: created.title,
      hash: created.uniqueHash,
    });

    return created;
  });
};

/**
 * Factory functions CORRIGIDAS com hash único
 */
export const NotificationFactory = {
  // === TAREFAS ===
  assignmentDueTomorrow: (
    userId: string,
    assignmentId: string,
    assignmentTitle: string,
    dueDate: string
  ) => {
    return new NotificationBuilder(userId, 'ASSIGNMENT_DUE_TOMORROW')
      .title('Tarefa vence amanhã')
      .message(`A tarefa "${assignmentTitle}" vence amanhã`)
      .action('Ver Tarefa', `/student/assignments/${assignmentId}`)
      .relatedTo('assignment', assignmentId)
      .metadata({ assignmentTitle, dueDate })
      .generateUniqueHash()
      .build();
  },

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

  assignmentOverdue: (
    userId: string,
    assignmentId: string,
    assignmentTitle: string,
    dueDate: string
  ) => {
    return new NotificationBuilder(userId, 'ASSIGNMENT_OVERDUE')
      .title('Tarefa em atraso')
      .message(`A tarefa "${assignmentTitle}" está em atraso`)
      .action('Ver Tarefa', `/student/assignments/${assignmentId}`)
      .relatedTo('assignment', assignmentId)
      .metadata({ assignmentTitle, dueDate })
      .priority('HIGH')
      .generateUniqueHash()
      .build();
  },

  // === AULAS ===
  lessonStartingSoon: (
    userId: string,
    lessonId: string,
    teacherName: string,
    time: string,
    lessonTime: string
  ) => {
    return new NotificationBuilder(userId, 'LESSON_STARTING_SOON')
      .title('Aula em 30 minutos')
      .message(`Sua aula com ${teacherName} começará em breve`)
      .action('Ver Aula', `/student/lessons/${lessonId}`)
      .relatedTo('lesson', lessonId)
      .metadata({ teacherName, time, lessonTime })
      .showInBrowser(true)
      .generateUniqueHash()
      .build();
  },

  lessonTomorrow: (
    userId: string,
    lessonId: string,
    teacherName: string,
    time: string,
    lessonTime: string
  ) => {
    return new NotificationBuilder(userId, 'LESSON_TOMORROW')
      .title('Aula amanhã')
      .message(`Lembre-se: aula com ${teacherName} amanhã às ${time}`)
      .action('Ver Agenda', '/student/lessons')
      .relatedTo('lesson', lessonId)
      .metadata({ teacherName, time, lessonTime })
      .generateUniqueHash()
      .build();
  },
};

// Helpers existentes mantidos...
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

export const cleanupExpiredNotifications = (
  notifications: NotificationData[]
): NotificationData[] => {
  const now = new Date();
  return notifications.filter((notification) => {
    if (!notification.expiresAt) return true;
    return new Date(notification.expiresAt) > now;
  });
};
