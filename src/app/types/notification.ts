// app/types/notification.ts - TIPOS CORRIGIDOS

import { JsonValue } from '@prisma/client/runtime/library';

export type NotificationType =
  | 'LESSON_STARTING_SOON'
  | 'LESSON_TOMORROW'
  | 'LESSON_STATUS_PENDING'
  | 'LESSON_NO_SHOW'
  | 'ASSIGNMENT_DUE_SOON'
  | 'ASSIGNMENT_DUE_TOMORROW'
  | 'ASSIGNMENT_OVERDUE'
  | 'ASSIGNMENT_FEEDBACK_NEEDED'
  | 'ASSIGNMENT_COMPLETED'
  | 'STUDENT_INVITE_PENDING'
  | 'STUDENT_MULTIPLE_LATE'
  | 'NEW_STUDENT_FEEDBACK'
  | 'WEEKLY_REPORT_AVAILABLE'
  | 'PRACTICE_REMINDER'
  | 'SYSTEM_MAINTENANCE'
  | 'GENERAL_ANNOUNCEMENT';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type NotificationStatus = 'UNREAD' | 'READ' | 'DISMISSED' | 'EXPIRED';

export interface NotificationData {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message: string;
  actionText?: string; // undefined em vez de null
  actionUrl?: string; // undefined em vez de null
  relatedEntityType?: string; // undefined em vez de null
  relatedEntityId?: string; // undefined em vez de null
  metadata?: Record<string, any> | JsonValue;
  showInToast: boolean;
  showInBrowser: boolean;
  showInPage: boolean;
  lastShownAt?: Date; // undefined em vez de null
  scheduledFor?: Date; // undefined em vez de null
  expiresAt?: Date; // undefined em vez de null
  toastShown: boolean;
  browserShown: boolean;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date; // undefined em vez de null
}

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: Record<string, any>;
  showInToast?: boolean;
  showInBrowser?: boolean;
  showInPage?: boolean;
  scheduledFor?: Date;
  expiresAt?: Date;
}

export interface NotificationCheckResult {
  newNotifications: NotificationData[];
  toastNotifications: NotificationData[];
  browserNotifications: NotificationData[];
  totalUnread: number;
}

// 🆕 HELPER PARA MAPEAR DADOS DO PRISMA PARA NotificationData
export const mapPrismaNotificationToData = (
  prismaNotification: any
): NotificationData => {
  return {
    ...prismaNotification,
    actionText: prismaNotification.actionText || undefined,
    actionUrl: prismaNotification.actionUrl || undefined,
    relatedEntityType: prismaNotification.relatedEntityType || undefined,
    relatedEntityId: prismaNotification.relatedEntityId || undefined,
    scheduledFor: prismaNotification.scheduledFor || undefined,
    expiresAt: prismaNotification.expiresAt || undefined,
    lastShownAt: prismaNotification.lastShownAt || undefined,
    readAt: prismaNotification.readAt || undefined,
  };
};

// Constantes do sistema (sem mudanças)
export const NOTIFICATION_CONFIG = {
  // Intervals
  CHECK_INTERVAL: 30 * 60 * 1000, // 30 minutos
  COOLDOWN_DURATION: 30 * 60 * 1000, // 30 minutos entre repetições (removido)
  NOTIFICATION_STORAGE_KEY: 'opus_atlas_notification_cache',
  DEFAULT_EXPIRY_DAYS: 30, // 30 dias por padrão
  CLEANUP_OLDER_THAN_DAYS: 30, // Limpar notificações mais antigas que 30 dias

  // Timing para diferentes tipos
  LESSON_WARNING_TIMES: {
    STARTING_SOON: 30 * 60 * 1000, // 30 minutos antes
    TOMORROW: 24 * 60 * 60 * 1000, // 24 horas antes
    STATUS_CHECK: 2 * 60 * 60 * 1000, // 2 horas após aula
  },

  ASSIGNMENT_WARNING_TIMES: {
    DUE_SOON: 2 * 60 * 60 * 1000, // 2 horas antes
    DUE_TOMORROW: 24 * 60 * 60 * 1000, // 24 horas antes
    OVERDUE_CHECK: 24 * 60 * 60 * 1000, // 24 horas após vencimento
  },

  // Limites
  MAX_NOTIFICATIONS_PER_CHECK: 50,
  MAX_TOAST_NOTIFICATIONS: 5,
  MAX_BROWSER_NOTIFICATIONS: 3,
} as const;

// Configurações por tipo de notificação (sem mudanças)
export const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  {
    priority: NotificationPriority;
    showInToast: boolean;
    showInBrowser: boolean;
    icon: string;
    color: string;
    defaultExpiry?: number; // dias
  }
> = {
  // AULAS - Alta prioridade
  LESSON_STARTING_SOON: {
    priority: 'HIGH',
    showInToast: true,
    showInBrowser: true,
    icon: '🔔',
    color: 'accent-red',
  },
  LESSON_TOMORROW: {
    priority: 'MEDIUM',
    showInToast: true,
    showInBrowser: false,
    icon: '📅',
    color: 'accent-amber',
  },
  LESSON_STATUS_PENDING: {
    priority: 'HIGH',
    showInToast: true,
    showInBrowser: false,
    icon: '⏰',
    color: 'accent-red',
  },
  LESSON_NO_SHOW: {
    priority: 'MEDIUM',
    showInToast: true,
    showInBrowser: false,
    icon: '❌',
    color: 'accent-amber',
  },

  // TAREFAS - Prioridade variável
  ASSIGNMENT_DUE_SOON: {
    priority: 'HIGH',
    showInToast: true,
    showInBrowser: true,
    icon: '📝',
    color: 'accent-red',
  },
  ASSIGNMENT_DUE_TOMORROW: {
    priority: 'MEDIUM',
    showInToast: true,
    showInBrowser: false,
    icon: '📋',
    color: 'accent-amber',
  },
  ASSIGNMENT_OVERDUE: {
    priority: 'HIGH',
    showInToast: true,
    showInBrowser: false,
    icon: '🚨',
    color: 'accent-red',
  },
  ASSIGNMENT_FEEDBACK_NEEDED: {
    priority: 'MEDIUM',
    showInToast: true,
    showInBrowser: false,
    icon: '💬',
    color: 'accent-amber',
  },
  ASSIGNMENT_COMPLETED: {
    priority: 'LOW',
    showInToast: true,
    showInBrowser: false,
    icon: '✅',
    color: 'accent-green',
  },

  // RELAÇÕES - Prioridade variável
  STUDENT_INVITE_PENDING: {
    priority: 'MEDIUM',
    showInToast: true,
    showInBrowser: false,
    icon: '👥',
    color: 'accent-amber',
    defaultExpiry: 7, // 7 dias para convites
  },
  STUDENT_MULTIPLE_LATE: {
    priority: 'MEDIUM',
    showInToast: true,
    showInBrowser: false,
    icon: '⚠️',
    color: 'accent-amber',
  },
  NEW_STUDENT_FEEDBACK: {
    priority: 'LOW',
    showInToast: true,
    showInBrowser: false,
    icon: '📢',
    color: 'accent-blue',
  },

  // PROGRESSO - Baixa prioridade
  WEEKLY_REPORT_AVAILABLE: {
    priority: 'LOW',
    showInToast: false,
    showInBrowser: false,
    icon: '📊',
    color: 'accent-blue',
    defaultExpiry: 7, // 7 dias para relatórios
  },
  PRACTICE_REMINDER: {
    priority: 'LOW',
    showInToast: true,
    showInBrowser: false,
    icon: '🎵',
    color: 'accent-blue',
  },

  // SISTEMA - Informativo
  SYSTEM_MAINTENANCE: {
    priority: 'MEDIUM',
    showInToast: true,
    showInBrowser: true,
    icon: '🔧',
    color: 'accent-amber',
    defaultExpiry: 3, // 3 dias para manutenção
  },
  GENERAL_ANNOUNCEMENT: {
    priority: 'LOW',
    showInToast: false,
    showInBrowser: false,
    icon: '📢',
    color: 'accent-blue',
    defaultExpiry: 14, // 14 dias para anúncios
  },
};

// Helpers para localStorage
export const NOTIFICATION_STORAGE_KEY = 'opus_atlas_notification_cache';

export interface NotificationCache {
  shownNotifications: Set<string>; // IDs já mostrados nesta sessão
}

// Mensagens padrão por tipo
export const getNotificationTemplate = (
  type: NotificationType,
  metadata?: Record<string, any>
): { title: string; message: string; actionText?: string } => {
  switch (type) {
    case 'LESSON_STARTING_SOON':
      return {
        title: 'Aula em 30 minutos',
        message: `Sua aula com ${
          metadata?.studentName || 'aluno'
        } começará em breve`,
        actionText: 'Ver Aula',
      };

    case 'LESSON_TOMORROW':
      return {
        title: 'Aula amanhã',
        message: `Lembre-se: aula com ${
          metadata?.studentName || 'aluno'
        } amanhã às ${metadata?.time}`,
        actionText: 'Ver Agenda',
      };

    case 'LESSON_STATUS_PENDING':
      return {
        title: 'Atualizar status da aula',
        message: `A aula com ${
          metadata?.studentName || 'aluno'
        } já passou. Atualize o status.`,
        actionText: 'Atualizar',
      };

    case 'ASSIGNMENT_DUE_SOON':
      return {
        title: 'Tarefa vence em 2 horas',
        message: `A tarefa "${
          metadata?.assignmentTitle || 'Tarefa'
        }" vence em breve`,
        actionText: 'Ver Tarefa',
      };

    case 'ASSIGNMENT_OVERDUE':
      return {
        title: 'Tarefa em atraso',
        message: `A tarefa "${
          metadata?.assignmentTitle || 'Tarefa'
        }" está atrasada`,
        actionText: 'Ver Tarefa',
      };

    case 'STUDENT_INVITE_PENDING':
      return {
        title: 'Convite pendente',
        message: `${
          metadata?.studentName || 'Aluno'
        } ainda não respondeu ao convite`,
        actionText: 'Reenviar',
      };

    default:
      return {
        title: 'Nova notificação',
        message: 'Você tem uma nova notificação',
        actionText: 'Ver',
      };
  }
};
