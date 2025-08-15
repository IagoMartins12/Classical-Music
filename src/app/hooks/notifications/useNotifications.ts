// app/hooks/notifications/useNotifications.ts - CORRIGIDO SEM DUPLICATAS
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  NotificationData,
  NotificationCheckResult,
  NOTIFICATION_CONFIG,
  mapPrismaNotificationToData,
} from '@/app/types/notification';
import { useToast } from '@/app/hooks/useToast';
import { usePageVisibility } from './usePageVisibility';
import { useBrowserNotifications } from './useBrowserNotifications';

interface UseNotificationsOptions {
  userRole: 'teacher' | 'student';
  userId: string;
  autoStart?: boolean;
}

const STORAGE_KEY = 'opus_atlas_notification_cache';

// 🔥 CACHE APRIMORADO - trackeia notificações por hash único
const getNotificationCache = () => {
  if (typeof window === 'undefined')
    return {
      shownNotifications: new Set(),
      lastCleanup: Date.now(),
    };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored
      ? JSON.parse(stored)
      : {
          shownNotifications: [],
          lastCleanup: Date.now(),
        };

    return {
      shownNotifications: new Set(parsed.shownNotifications || []),
      lastCleanup: parsed.lastCleanup || Date.now(),
    };
  } catch {
    return {
      shownNotifications: new Set(),
      lastCleanup: Date.now(),
    };
  }
};

const saveNotificationCache = (cache: any) => {
  if (typeof window === 'undefined') return;

  try {
    const cacheData = {
      shownNotifications: Array.from(cache.shownNotifications),
      lastCleanup: cache.lastCleanup,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to save notification cache:', error);
  }
};

// 🔥 DEBOUNCE para evitar múltiplas chamadas
const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

export const useNotifications = ({
  userRole,
  userId,
  autoStart = true,
}: UseNotificationsOptions) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();
  const isPageVisible = usePageVisibility();
  const { sendBrowserNotification } = useBrowserNotifications();

  // Refs para evitar re-render loops
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);
  const lastCheckRef = useRef<Date | null>(null);
  const cacheRef = useRef(getNotificationCache());
  const requestIdRef = useRef(0); // Para cancelar requests antigos

  // 🔥 LIMPEZA AUTOMÁTICA DO CACHE
  const cleanupCache = useCallback(() => {
    const cache = cacheRef.current;
    const now = Date.now();

    // Limpar cache a cada 6 horas
    if (now - cache.lastCleanup > 6 * 60 * 60 * 1000) {
      console.log('📬 [CACHE-CLEANUP] Limpando cache antigo');

      // Manter apenas últimas 50 notificações
      const recentIds = Array.from(cache.shownNotifications).slice(-50);
      cache.shownNotifications = new Set(recentIds);
      cache.lastCleanup = now;

      cacheRef.current = cache;
      saveNotificationCache(cache);
    }
  }, []);

  // 🔥 FUNÇÃO DE CHECK COM DEBOUNCE E DEDUPLICAÇÃO
  const checkNotifications = useCallback(
    async (force = false): Promise<NotificationCheckResult | null> => {
      const requestId = ++requestIdRef.current;

      // Prevenir múltiplas chamadas simultâneas
      if (isCheckingRef.current && !force) {
        console.log('📬 [NOTIFICATIONS] Check já em progresso, pulando');
        return null;
      }

      isCheckingRef.current = true;
      setIsChecking(true);
      setError(null);

      try {
        const now = new Date();

        // Throttle mais rigoroso
        if (!force && lastCheckRef.current) {
          const timeSinceLastCheck =
            now.getTime() - lastCheckRef.current.getTime();
          const minInterval = 10 * 1000; // Mínimo 10 segundos

          if (timeSinceLastCheck < minInterval) {
            console.log(
              '📬 [NOTIFICATIONS] Muito cedo desde última verificação'
            );
            return null;
          }
        }

        console.log(
          `📬 [NOTIFICATIONS] Verificando notificações para ${userRole} ${userId}`
        );

        const response = await fetch(`/api/${userRole}/notifications/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lastCheck: lastCheckRef.current?.toISOString(),
            includeToast: true,
            includeBrowser: !isPageVisible,
          }),
        });

        // Verificar se request ainda é válido
        if (requestId !== requestIdRef.current) {
          console.log(
            '📬 [NOTIFICATIONS] Request cancelado (mais recente existe)'
          );
          return null;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result: NotificationCheckResult = await response.json();

        console.log('📬 [NOTIFICATIONS] Resultado:', {
          novas: result.newNotifications?.length || 0,
          toast: result.toastNotifications?.length || 0,
          naoLidas: result.totalUnread,
        });

        // Processar notificações com deduplicação
        await processNotifications(result);

        // Atualizar estado
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const newOnes =
            result.newNotifications?.filter((n) => !existingIds.has(n.id)) ||
            [];
          return [...newOnes, ...prev].slice(0, 100);
        });

        setUnreadCount(result.totalUnread || 0);

        // Atualizar refs
        lastCheckRef.current = now;
        setLastCheck(now);

        // Limpar cache periodicamente
        cleanupCache();

        return result;
      } catch (error) {
        console.error('📬 [NOTIFICATIONS] Erro:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Erro ao verificar notificações'
        );
        return null;
      } finally {
        // Apenas alterar estado se este ainda for o request mais recente
        if (requestId === requestIdRef.current) {
          isCheckingRef.current = false;
          setIsChecking(false);
        }
      }
    },
    [userRole, userId, isPageVisible, cleanupCache]
  );

  // 🔥 PROCESSAMENTO COM DEDUPLICAÇÃO APRIMORADA
  const processNotifications = useCallback(
    async (result: NotificationCheckResult) => {
      const cache = cacheRef.current;

      // Processar toast notifications
      if (result.toastNotifications && result.toastNotifications.length > 0) {
        console.log(
          `📬 [NOTIFICATIONS] Processando ${result.toastNotifications.length} toast notifications`
        );

        for (const notification of result.toastNotifications) {
          // 🔥 CHAVE ÚNICA: usar hash se existir, senão ID + timestamp
          const uniqueKey =
            notification.uniqueHash ||
            `${notification.id}_${new Date(
              notification.createdAt
            ).toDateString()}`;

          // Verificar se já foi mostrada
          if (!cache.shownNotifications.has(uniqueKey)) {
            // Determinar tipo do toast
            const toastType =
              notification.priority === 'HIGH' ||
              notification.priority === 'CRITICAL'
                ? 'error'
                : notification.priority === 'MEDIUM'
                ? 'warning'
                : 'info';

            const toastOptions = {
              duration:
                notification.priority === 'HIGH' ||
                notification.priority === 'CRITICAL'
                  ? 8000
                  : 4000,
            };

            // Mostrar toast
            toast[toastType](
              notification.title,
              notification.message,
              toastOptions
            );

            // Adicionar ao cache
            cache.shownNotifications.add(uniqueKey);

            // Marcar como mostrada no servidor
            markAsShown(notification.id, 'toast');

            console.log(`📬 [TOAST] Mostrado: ${notification.title}`);
          } else {
            console.log(
              `📬 [TOAST] Pulado (já mostrado): ${notification.title}`
            );
          }
        }
      }

      // Processar browser notifications
      if (
        result.browserNotifications &&
        result.browserNotifications.length > 0
      ) {
        console.log(
          `📬 [NOTIFICATIONS] Processando ${result.browserNotifications.length} browser notifications`
        );

        for (const notification of result.browserNotifications) {
          if (!notification.browserShown) {
            const success = await sendBrowserNotification(notification);
            if (success) {
              markAsShown(notification.id, 'browser');
            }
          }
        }
      }

      // Salvar cache atualizado
      cacheRef.current = cache;
      saveNotificationCache(cache);
    },
    [toast, sendBrowserNotification]
  );

  // Debounced check function
  const debouncedCheck = useDebounce(checkNotifications, 1000);

  // Mark as shown - função estável
  const markAsShown = useCallback(
    async (notificationId: string, type: 'toast' | 'browser') => {
      try {
        await fetch(
          `/api/${userRole}/notifications/${notificationId}/mark-shown`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type }),
          }
        );
      } catch (error) {
        console.warn('Failed to mark notification as shown:', error);
      }
    },
    [userRole]
  );

  // Mark as read - função estável
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const response = await fetch(
          `/api/${userRole}/notifications/${notificationId}/mark-read`,
          {
            method: 'POST',
          }
        );

        if (response.ok) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationId
                ? { ...n, status: 'READ' as const, readAt: new Date() }
                : n
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    [userRole]
  );

  // Mark all as read - função estável
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/${userRole}/notifications/mark-all-read`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            status: 'READ' as const,
            readAt: new Date(),
          }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [userRole]);

  // Fetch notifications - função estável
  const fetchNotifications = useCallback(
    async (page = 1, limit = 20) => {
      try {
        const response = await fetch(
          `/api/${userRole}/notifications?page=${page}&limit=${limit}`
        );

        if (response.ok) {
          const data = await response.json();
          return data.notifications.map(
            mapPrismaNotificationToData
          ) as NotificationData[];
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
      return [];
    },
    [userRole]
  );

  // Start checking - função estável
  const startChecking = useCallback(() => {
    if (intervalRef.current) {
      console.log('📬 [NOTIFICATIONS] Interval já rodando');
      return;
    }

    console.log(
      `📬 [NOTIFICATIONS] Iniciando verificações a cada ${
        NOTIFICATION_CONFIG.CHECK_INTERVAL / 1000
      }s`
    );

    // Check inicial
    checkNotifications(false);

    // Interval para checks subsequentes
    intervalRef.current = setInterval(() => {
      debouncedCheck(false);
    }, NOTIFICATION_CONFIG.CHECK_INTERVAL);
  }, [checkNotifications, debouncedCheck]);

  const stopChecking = useCallback(() => {
    if (intervalRef.current) {
      console.log('📬 [NOTIFICATIONS] Parando verificações');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Effect para auto-start/stop
  useEffect(() => {
    if (autoStart && isPageVisible) {
      startChecking();
    } else {
      stopChecking();
    }

    return () => {
      stopChecking();
    };
  }, [autoStart, isPageVisible, startChecking, stopChecking]);

  // Force refresh
  const refresh = useCallback(() => {
    checkNotifications(true);
  }, [checkNotifications]);

  return {
    // State
    notifications,
    unreadCount,
    isChecking,
    lastCheck,
    error,

    // Functions
    checkNotifications: refresh,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    startChecking,
    stopChecking,
    refresh,
  };
};
