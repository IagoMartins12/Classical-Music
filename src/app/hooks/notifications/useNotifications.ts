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

// Helper para cache local simplificado (apenas para prevenção de duplicatas)
const getNotificationCache = () => {
  if (typeof window === 'undefined') return { shownNotifications: new Set() };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : { shownNotifications: [] };
    return {
      shownNotifications: new Set(parsed.shownNotifications || []),
    };
  } catch {
    return { shownNotifications: new Set() };
  }
};

const saveNotificationCache = (cache: any) => {
  if (typeof window === 'undefined') return;
  try {
    const cacheData = {
      shownNotifications: Array.from(cache.shownNotifications),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to save notification cache:', error);
  }
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

  // Refs to prevent re-render loops
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);
  const lastCheckRef = useRef<Date | null>(null);
  const cacheRef = useRef(getNotificationCache());

  // Stable check function that doesn't change reference
  const checkNotifications = useCallback(
    async (force = false): Promise<NotificationCheckResult | null> => {
      // Prevent multiple simultaneous calls
      if (isCheckingRef.current && !force) {
        console.log('📬 [NOTIFICATIONS] Check already in progress, skipping');
        return null;
      }

      isCheckingRef.current = true;
      setIsChecking(true);
      setError(null);

      try {
        const now = new Date();

        // Throttle requests - don't check too frequently (but more lenient)
        if (!force && lastCheckRef.current) {
          const timeSinceLastCheck =
            now.getTime() - lastCheckRef.current.getTime();
          const minInterval = 5 * 1000; // Minimum 5 seconds between checks (reduced)

          if (timeSinceLastCheck < minInterval) {
            console.log(
              '📬 [NOTIFICATIONS] Too soon since last check, skipping'
            );
            return null;
          }
        }

        console.log(
          '📬 [NOTIFICATIONS] Checking notifications for',
          userRole,
          userId
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

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result: NotificationCheckResult = await response.json();

        console.log('📬 [NOTIFICATIONS] Got result:', {
          newNotifications: result.newNotifications?.length || 0,
          toastNotifications: result.toastNotifications?.length || 0,
          totalUnread: result.totalUnread,
        });

        // Process notifications (MELHORADO - sem cooldown)
        await processNotifications(result);

        // Update state
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const newOnes =
            result.newNotifications?.filter((n) => !existingIds.has(n.id)) ||
            [];
          return [...newOnes, ...prev].slice(0, 100);
        });

        setUnreadCount(result.totalUnread || 0);

        // Update refs
        lastCheckRef.current = now;
        setLastCheck(now);

        return result;
      } catch (error) {
        console.error(
          '📬 [NOTIFICATIONS] Error checking notifications:',
          error
        );
        setError(
          error instanceof Error
            ? error.message
            : 'Erro ao verificar notificações'
        );
        return null;
      } finally {
        isCheckingRef.current = false;
        setIsChecking(false);
      }
    },
    [userRole, userId, isPageVisible]
  ); // Stable dependencies

  // Process notifications (MELHORADO - sem cooldown)
  const processNotifications = useCallback(
    async (result: NotificationCheckResult) => {
      const cache = cacheRef.current;

      // Process toast notifications (SEM VERIFICAÇÃO DE COOLDOWN)
      if (result.toastNotifications && result.toastNotifications.length > 0) {
        console.log(
          '📬 [NOTIFICATIONS] Processing',
          result.toastNotifications.length,
          'toast notifications'
        );

        for (const notification of result.toastNotifications) {
          // Verificação simples baseada apenas no ID da notificação
          const notificationId = notification.id;

          // Verificar se já foi mostrada nesta sessão
          if (!cache.shownNotifications.has(notificationId)) {
            // Show toast based on priority
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

            // Show toast
            toast[toastType](
              notification.title,
              notification.message,
              toastOptions
            );

            // Adicionar ao cache local
            cache.shownNotifications.add(notificationId);

            // Mark as shown in server
            markAsShown(notification.id, 'toast');
          }
        }
      }

      // Process browser notifications (SEM VERIFICAÇÃO DE COOLDOWN)
      if (
        result.browserNotifications &&
        result.browserNotifications.length > 0
      ) {
        console.log(
          '📬 [NOTIFICATIONS] Processing',
          result.browserNotifications.length,
          'browser notifications'
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

      // Save updated cache
      cacheRef.current = cache;
      saveNotificationCache(cache);

      // Limpar cache local se ficar muito grande (manter apenas últimas 100)
      if (cache.shownNotifications.size > 100) {
        const recentIds = Array.from(cache.shownNotifications).slice(-50);
        cache.shownNotifications = new Set(recentIds);
        saveNotificationCache(cache);
      }
    },
    [toast, sendBrowserNotification]
  );

  // Mark as shown - stable function
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

  // Mark as read - stable function
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

  // Mark all as read - stable function
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

  // Fetch notifications - stable function
  const fetchNotifications = useCallback(
    async (page = 1, limit = 20) => {
      try {
        const response = await fetch(
          `/api/${userRole}/notifications?page=${page}&limit=${limit}`
        );

        if (response.ok) {
          const data = await response.json();
          // Mapear os dados do Prisma para o tipo correto
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

  // Start/stop checking functions - stable
  const startChecking = useCallback(() => {
    if (intervalRef.current) {
      console.log('📬 [NOTIFICATIONS] Interval already running');
      return;
    }

    console.log(
      '📬 [NOTIFICATIONS] Starting notification checks every',
      NOTIFICATION_CONFIG.CHECK_INTERVAL / 1000,
      'seconds'
    );

    // Initial check
    checkNotifications(false);

    // Set interval for subsequent checks
    intervalRef.current = setInterval(() => {
      checkNotifications(false);
    }, NOTIFICATION_CONFIG.CHECK_INTERVAL);
  }, [checkNotifications]);

  const stopChecking = useCallback(() => {
    if (intervalRef.current) {
      console.log('📬 [NOTIFICATIONS] Stopping notification checks');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Effect for auto-start/stop - ONLY runs when autoStart or visibility changes
  useEffect(() => {
    if (autoStart && isPageVisible) {
      startChecking();
    } else {
      stopChecking();
    }

    // Cleanup on unmount
    return () => {
      stopChecking();
    };
  }, [autoStart, isPageVisible, startChecking, stopChecking]);

  // Force refresh function
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
    checkNotifications: refresh, // Use the force refresh version for manual calls
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    startChecking,
    stopChecking,
    refresh,
  };
};
