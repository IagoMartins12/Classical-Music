// app/requests/portal/notifications.ts — central de notificações pela API (Etapa 4)
//
// Isomórfico: a página servidora passa o token; o navegador vai pela sessão.
import { apiFetch } from '@/app/libs/api/client';
import type {
  NotificationCheckResult,
  NotificationData,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from '@/app/types/notification';
import { collectPages, portalGet, toDate, toOptionalDate } from './common';

export interface ApiNotification {
  id: string;
  type: string;
  priority: string;
  status: string;
  title: string;
  message: string;
  actionText: string | null;
  actionUrl: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  toastShown: boolean;
  browserShown: boolean;
  expiresAt: string | null;
  createdAt: string;
  readAt: string | null;
}

/**
 * Formato de `NotificationData`. A API não devolve o dono (é quem chama), os
 * canais configurados nem a data de atualização: o dono vem vazio, a página
 * mostra todas, e `updatedAt` repete a leitura ou a criação.
 */
export function toNotificationData(
  notification: ApiNotification
): NotificationData {
  return {
    id: notification.id,
    userId: '',
    type: notification.type as NotificationType,
    priority: notification.priority as NotificationPriority,
    status: notification.status as NotificationStatus,
    title: notification.title,
    message: notification.message,
    actionText: notification.actionText ?? undefined,
    actionUrl: notification.actionUrl ?? undefined,
    relatedEntityType: notification.relatedEntityType ?? undefined,
    relatedEntityId: notification.relatedEntityId ?? undefined,
    showInToast: notification.toastShown,
    showInBrowser: notification.browserShown,
    showInPage: true,
    toastShown: notification.toastShown,
    browserShown: notification.browserShown,
    expiresAt: toOptionalDate(notification.expiresAt),
    createdAt: toDate(notification.createdAt),
    updatedAt: toDate(notification.readAt ?? notification.createdAt),
    readAt: toOptionalDate(notification.readAt),
  };
}

const PAGE_LIMIT = 50;
const STATS_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Página de notificações: as 50 mais recentes (sem as vencidas), o total de
 * não lidas e a contagem por tipo dos últimos 30 dias (até 200 notificações).
 */
export async function loadNotificationCenter(token?: string) {
  const [recent, unread] = await Promise.all([
    collectPages<ApiNotification>(
      '/notifications',
      'notifications',
      {},
      token,
      {
        limit: PAGE_LIMIT,
        maxPages: 4,
      }
    ),
    portalGet<{ unreadCount: number }>(
      '/notifications/unread-count',
      undefined,
      token
    ),
  ]);

  const since = Date.now() - STATS_WINDOW_MS;
  const byType = new Map<string, number>();

  for (const notification of recent.items) {
    if (toDate(notification.createdAt).getTime() >= since) {
      byType.set(notification.type, (byType.get(notification.type) ?? 0) + 1);
    }
  }

  return {
    notifications: recent.items.slice(0, PAGE_LIMIT).map(toNotificationData),
    unreadCount: unread.unreadCount,
    notificationStats: [...byType].map(([type, count]) => ({
      type,
      _count: { id: count },
    })),
  };
}

// ====================================
// AÇÕES (navegador)
// ====================================

export async function fetchNotificationsPage(
  page = 1,
  limit = 20
): Promise<NotificationData[]> {
  const data = await portalGet<{ notifications: ApiNotification[] }>(
    '/notifications',
    { page, limit: Math.min(limit, PAGE_LIMIT) }
  );

  return data.notifications.map(toNotificationData);
}

export function markNotificationRead(notificationId: string) {
  return apiFetch<void>(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}

export function markAllNotificationsRead() {
  return apiFetch<{ updated: number }>('/notifications/read-all', {
    method: 'PATCH',
  });
}

export function markNotificationShown(
  notificationId: string,
  channel: 'toast' | 'browser'
) {
  return apiFetch<void>(`/notifications/${notificationId}/shown`, {
    method: 'PATCH',
    body: { channel },
  });
}

/**
 * O "check" periódico do legado: o que falta exibir (toast e, com a aba em
 * segundo plano, notificação do navegador) e o total de não lidas. A API
 * guarda o que já foi exibido; o front confirma com `markNotificationShown`.
 */
export async function checkPendingNotifications(
  includeBrowser: boolean
): Promise<NotificationCheckResult> {
  const [toast, browser, unread] = await Promise.all([
    portalGet<{ notifications: ApiNotification[] }>('/notifications/pending', {
      channel: 'toast',
    }),
    includeBrowser
      ? portalGet<{ notifications: ApiNotification[] }>(
          '/notifications/pending',
          { channel: 'browser' }
        )
      : Promise.resolve({ notifications: [] as ApiNotification[] }),
    portalGet<{ unreadCount: number }>('/notifications/unread-count'),
  ]);

  const toastNotifications = toast.notifications.map(toNotificationData);
  const browserNotifications = browser.notifications.map(toNotificationData);

  const newNotifications: NotificationData[] = [];
  const seen = new Set<string>();

  for (const notification of [...toastNotifications, ...browserNotifications]) {
    if (!seen.has(notification.id)) {
      seen.add(notification.id);
      newNotifications.push(notification);
    }
  }

  return {
    newNotifications,
    toastNotifications,
    browserNotifications,
    totalUnread: unread.unreadCount,
  };
}
