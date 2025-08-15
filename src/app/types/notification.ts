// app/types/notification.ts - TIPOS ATUALIZADOS COM NOVOS TIPOS DE NOTIFICAÇÃO

import { JsonValue } from '@prisma/client/runtime/library';

export type NotificationType =
  // NOTIFICAÇÕES AUTOMÁTICAS (mantidas no check/route.ts)
  | 'LESSON_STARTING_SOON' // 30min antes da aula
  | 'LESSON_TOMORROW' // 24h antes da aula
  | 'ASSIGNMENT_DUE_SOON' // 2h antes do vencimento
  | 'ASSIGNMENT_DUE_TOMORROW' // 24h antes do vencimento
  | 'ASSIGNMENT_OVERDUE' // Tarefa já atrasada
  | 'LESSON_STATUS_PENDING' // Aula passou sem status atualizado

  // 🆕 NOTIFICAÇÕES PARA ESTUDANTES (eventos reais)
  | 'TEACHER_GAVE_FEEDBACK' // Professor deu feedback na tarefa
  | 'LESSON_CANCELLED_BY_TEACHER' // Professor cancelou aula
  | 'LESSON_RESCHEDULED_BY_TEACHER' // Professor reagendou aula
  | 'LESSON_MARKED_NO_SHOW' // Professor marcou falta
  | 'NEW_ASSIGNMENT_CREATED' // Professor criou nova tarefa
  | 'ASSIGNMENT_UPDATED_BY_TEACHER' // Professor alterou tarefa
  | 'NEW_LESSON_SCHEDULED' // Nova aula agendada (só PAI ou solo)

  // 🆕 NOTIFICAÇÕES PARA PROFESSORES (eventos reais)
  | 'STUDENT_SUBMITTED_ASSIGNMENT' // Aluno enviou submissão
  | 'STUDENT_COMPLETED_ASSIGNMENT' // Aluno completou tarefa
  | 'STUDENT_GAVE_LESSON_FEEDBACK' // Aluno deu feedback na aula
  | 'STUDENT_INFORMED_ABSENCE' // Aluno informou ausência
  | 'STUDENT_REQUESTED_RESCHEDULE' // Aluno solicitou reagendamento

  // NOTIFICAÇÕES ANTIGAS (manter para compatibilidade se existirem)
  | 'LESSON_NO_SHOW'
  | 'ASSIGNMENT_FEEDBACK_NEEDED' // 🗑️ SERÁ REMOVIDA do check/route.ts
  | 'ASSIGNMENT_COMPLETED'
  | 'STUDENT_INVITE_PENDING'
  | 'STUDENT_MULTIPLE_LATE'
  | 'NEW_STUDENT_FEEDBACK' // 🗑️ SERÁ REMOVIDA do check/route.ts
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
  actionText?: string;
  actionUrl?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: Record<string, any> | JsonValue;
  showInToast: boolean;
  showInBrowser: boolean;
  showInPage: boolean;
  lastShownAt?: Date;
  scheduledFor?: Date;
  expiresAt?: Date;
  toastShown: boolean;
  browserShown: boolean;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
  uniqueHash?: string | null;
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

// Helper para mapear dados do Prisma para NotificationData
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

// Constantes do sistema
export const NOTIFICATION_CONFIG = {
  CHECK_INTERVAL: 30 * 60 * 1000, // 30 minutos
  NOTIFICATION_STORAGE_KEY: 'opus_atlas_notification_cache',
  DEFAULT_EXPIRY_DAYS: 30,
  CLEANUP_OLDER_THAN_DAYS: 30,

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

  MAX_NOTIFICATIONS_PER_CHECK: 50,
  MAX_TOAST_NOTIFICATIONS: 5,
  MAX_BROWSER_NOTIFICATIONS: 3,
} as const;

// 🆕 CONFIGURAÇÕES POR TIPO ATUALIZADAS
export const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  {
    priority: NotificationPriority;
    showInToast: boolean;
    showInBrowser: boolean;
    icon: string;
    color: string;
    defaultExpiry?: number;
  }
> = {
  // AUTOMÁTICAS (mantidas)
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
  LESSON_STATUS_PENDING: {
    priority: 'HIGH',
    showInToast: true,
    showInBrowser: false,
    icon: '⏰',
    color: 'accent-red',
  },

  // 🆕 PARA ESTUDANTES
  TEACHER_GAVE_FEEDBACK: {
    priority: 'MEDIUM',
    showInToast: true,
    showInBrowser: false,
    icon: '💬',
    color: 'accent-blue',
  },
  LESSON_CANCELLED_BY_TEACHER: {
    priority: 'HIGH',
    showInToast: true,
    showInBrowser: true,
    icon: '❌',
    color: 'accent-red',
  },
  LESSON_RESCHEDULED_BY_TEACHER: {
    priority: 'HIGH',
    showInToast: true,
    showInBrowser: true,
    icon: '📅',
    color: 'accent-amber',
  },
  LESSON_MARKED_NO_SHOW: {
    priority: 'HIGH',
    showInToast: true,
    showInBrowser: false,
    icon: '⚠️',
    color: 'accent-red',
  },
  NEW_ASSIGNMENT_CREATED: {
    priority: 'MEDIUM',
    showInToast: true,
    showInBrowser: false,
    icon: '📋',
    color: 'accent-blue',
  },
  ASSIGNMENT_UPDATED_BY_TEACHER: {
    priority: 'MEDIUM',
    showInToast: true,
    showInBrowser: false,
    icon: '✏️',
    color: 'accent-amber',
  },
  NEW_LESSON_SCHEDULED: {
    priority: 'MEDIUM',
    showInToast: true,
    showInBrowser: false,
    icon: '📅',
    color: 'accent-green',
  },

  // 🆕 PARA PROFESSORES
  STUDENT_SUBMITTED_ASSIGNMENT: {
    priority: 'MEDIUM',
    showInToast: true,
    showInBrowser: false,
    icon: '📤',
    color: 'accent-blue',
  },
  STUDENT_COMPLETED_ASSIGNMENT: {
    priority: 'MEDIUM',
    showInToast: true,
    showInBrowser: false,
    icon: '✅',
    color: 'accent-green',
  },
  STUDENT_GAVE_LESSON_FEEDBACK: {
    priority: 'LOW',
    showInToast: true,
    showInBrowser: false,
    icon: '💭',
    color: 'accent-blue',
  },
  STUDENT_INFORMED_ABSENCE: {
    priority: 'MEDIUM',
    showInToast: true,
    showInBrowser: false,
    icon: '🏃',
    color: 'accent-amber',
  },
  STUDENT_REQUESTED_RESCHEDULE: {
    priority: 'MEDIUM',
    showInToast: true,
    showInBrowser: false,
    icon: '🔄',
    color: 'accent-amber',
  },

  // ANTIGAS (manter compatibilidade)
  LESSON_NO_SHOW: {
    priority: 'MEDIUM',
    showInToast: true,
    showInBrowser: false,
    icon: '❌',
    color: 'accent-amber',
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
  STUDENT_INVITE_PENDING: {
    priority: 'MEDIUM',
    showInToast: true,
    showInBrowser: false,
    icon: '👥',
    color: 'accent-amber',
    defaultExpiry: 7,
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
  WEEKLY_REPORT_AVAILABLE: {
    priority: 'LOW',
    showInToast: false,
    showInBrowser: false,
    icon: '📊',
    color: 'accent-blue',
    defaultExpiry: 7,
  },
  PRACTICE_REMINDER: {
    priority: 'LOW',
    showInToast: true,
    showInBrowser: false,
    icon: '🎵',
    color: 'accent-blue',
  },
  SYSTEM_MAINTENANCE: {
    priority: 'MEDIUM',
    showInToast: true,
    showInBrowser: true,
    icon: '🔧',
    color: 'accent-amber',
    defaultExpiry: 3,
  },
  GENERAL_ANNOUNCEMENT: {
    priority: 'LOW',
    showInToast: false,
    showInBrowser: false,
    icon: '📢',
    color: 'accent-blue',
    defaultExpiry: 14,
  },
};

// Helpers para localStorage
export const NOTIFICATION_STORAGE_KEY = 'opus_atlas_notification_cache';

export interface NotificationCache {
  shownNotifications: Set<string>;
}

// 🆕 TEMPLATES DE MENSAGEM ATUALIZADOS
export const getNotificationTemplate = (
  type: NotificationType,
  metadata?: Record<string, any>
): { title: string; message: string; actionText?: string } => {
  switch (type) {
    // AUTOMÁTICAS (mantidas)
    case 'LESSON_STARTING_SOON':
      return {
        title: 'Aula em 30 minutos',
        message: `Sua aula${
          metadata?.teacherName ? ` com ${metadata.teacherName}` : ''
        } começará em breve`,
        actionText: 'Ver Aula',
      };

    case 'LESSON_TOMORROW':
      return {
        title: 'Aula amanhã',
        message: `Lembre-se: aula${
          metadata?.teacherName ? ` com ${metadata.teacherName}` : ''
        } amanhã às ${metadata?.time}`,
        actionText: 'Ver Agenda',
      };

    case 'ASSIGNMENT_DUE_SOON':
      return {
        title: 'Tarefa vence em 2 horas',
        message: `A tarefa "${
          metadata?.assignmentTitle || 'Tarefa'
        }" vence em breve`,
        actionText: 'Ver Tarefa',
      };

    case 'ASSIGNMENT_DUE_TOMORROW':
      return {
        title: 'Tarefa vence amanhã',
        message: `A tarefa "${
          metadata?.assignmentTitle || 'Tarefa'
        }" vence amanhã`,
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

    case 'LESSON_STATUS_PENDING':
      return {
        title: 'Atualizar status da aula',
        message: `A aula${
          metadata?.studentName ? ` com ${metadata.studentName}` : ''
        } já passou. Atualize o status.`,
        actionText: 'Atualizar',
      };

    // 🆕 PARA ESTUDANTES
    case 'TEACHER_GAVE_FEEDBACK':
      return {
        title: 'Novo feedback do professor',
        message: `${
          metadata?.teacherName || 'Professor'
        } deu feedback na tarefa "${metadata?.assignmentTitle || 'Tarefa'}"`,
        actionText: 'Ver Feedback',
      };

    case 'LESSON_CANCELLED_BY_TEACHER':
      return {
        title: 'Aula cancelada',
        message: `${metadata?.teacherName || 'Professor'} cancelou a aula "${
          metadata?.lessonTitle || 'Aula'
        }"${metadata?.reason ? ` - ${metadata.reason}` : ''}`,
        actionText: 'Ver Detalhes',
      };

    case 'LESSON_RESCHEDULED_BY_TEACHER':
      return {
        title: 'Aula reagendada',
        message: `${metadata?.teacherName || 'Professor'} reagendou a aula "${
          metadata?.lessonTitle || 'Aula'
        }" para ${metadata?.newDate || 'nova data'}`,
        actionText: 'Ver Nova Data',
      };

    case 'LESSON_MARKED_NO_SHOW':
      return {
        title: 'Falta registrada',
        message: `${
          metadata?.teacherName || 'Professor'
        } marcou sua ausência na aula "${metadata?.lessonTitle || 'Aula'}"`,
        actionText: 'Ver Aula',
      };

    case 'NEW_ASSIGNMENT_CREATED':
      return {
        title: 'Nova tarefa criada',
        message: `${metadata?.teacherName || 'Professor'} criou a tarefa "${
          metadata?.assignmentTitle || 'Nova Tarefa'
        }"`,
        actionText: 'Ver Tarefa',
      };

    case 'ASSIGNMENT_UPDATED_BY_TEACHER':
      return {
        title: 'Tarefa atualizada',
        message: `${metadata?.teacherName || 'Professor'} atualizou a tarefa "${
          metadata?.assignmentTitle || 'Tarefa'
        }"`,
        actionText: 'Ver Mudanças',
      };

    case 'NEW_LESSON_SCHEDULED':
      return {
        title: 'Nova aula agendada',
        message: `${metadata?.teacherName || 'Professor'} agendou${
          metadata?.isRecurring ? ' nova série de aulas' : ' nova aula'
        }: "${metadata?.lessonTitle || 'Aula'}"`,
        actionText: 'Ver Agenda',
      };

    // 🆕 PARA PROFESSORES
    case 'STUDENT_SUBMITTED_ASSIGNMENT':
      return {
        title: 'Submissão recebida',
        message: `${
          metadata?.studentName || 'Aluno'
        } enviou submissão na tarefa "${
          metadata?.assignmentTitle || 'Tarefa'
        }"`,
        actionText: 'Ver Submissão',
      };

    case 'STUDENT_COMPLETED_ASSIGNMENT':
      return {
        title: 'Tarefa concluída',
        message: `${metadata?.studentName || 'Aluno'} completou a tarefa "${
          metadata?.assignmentTitle || 'Tarefa'
        }"`,
        actionText: 'Ver Tarefa',
      };

    case 'STUDENT_GAVE_LESSON_FEEDBACK':
      return {
        title: 'Feedback do aluno',
        message: `${
          metadata?.studentName || 'Aluno'
        } deixou feedback na aula "${metadata?.lessonTitle || 'Aula'}"`,
        actionText: 'Ver Feedback',
      };

    case 'STUDENT_INFORMED_ABSENCE':
      return {
        title: 'Aluno informou ausência',
        message: `${
          metadata?.studentName || 'Aluno'
        } informou que não poderá comparecer à aula "${
          metadata?.lessonTitle || 'Aula'
        }"`,
        actionText: 'Ver Detalhes',
      };

    case 'STUDENT_REQUESTED_RESCHEDULE':
      return {
        title: 'Solicitação de reagendamento',
        message: `${
          metadata?.studentName || 'Aluno'
        } solicitou reagendamento da aula "${metadata?.lessonTitle || 'Aula'}"`,
        actionText: 'Ver Solicitação',
      };

    // ANTIGAS (compatibilidade)
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
