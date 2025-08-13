// app/hooks/notifications/useBrowserNotifications.ts - CORRIGIDO
'use client';

import { useState, useCallback, useRef } from 'react';
import { NotificationData } from '@/app/types/notification';

export const useBrowserNotifications = () => {
  const [permission, setPermission] =
    useState<NotificationPermission>('default');
  const permissionChecked = useRef(false);

  // Check permission only once
  const checkPermission = useCallback(() => {
    if (!('Notification' in window)) return 'denied' as NotificationPermission;

    if (!permissionChecked.current) {
      setPermission(Notification.permission);
      permissionChecked.current = true;
    }

    return Notification.permission;
  }, []);

  // Request permission
  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!('Notification' in window)) return 'denied';

      try {
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
      }
    }, []);

  // Send browser notification
  const sendBrowserNotification = useCallback(
    async (notificationData: NotificationData): Promise<boolean> => {
      if (!('Notification' in window)) return false;

      let currentPermission = checkPermission();

      if (currentPermission === 'default') {
        currentPermission = await requestPermission();
      }

      if (currentPermission !== 'granted') return false;

      try {
        const notification = new Notification(notificationData.title, {
          body: notificationData.message,
          icon: '/favicon.ico',
          badge: '/icon-192x192.png',
          tag: `opus-atlas-${notificationData.id}`,
          requireInteraction:
            notificationData.priority === 'HIGH' ||
            notificationData.priority === 'CRITICAL',
          silent: notificationData.priority === 'LOW',
          data: {
            notificationId: notificationData.id,
            actionUrl: notificationData.actionUrl,
          },
        });

        notification.onclick = () => {
          window.focus();
          if (notificationData.actionUrl) {
            window.location.href = notificationData.actionUrl;
          }
          notification.close();
        };

        // Auto-close for low priority
        if (
          notificationData.priority === 'LOW' ||
          notificationData.priority === 'MEDIUM'
        ) {
          setTimeout(() => notification.close(), 8000);
        }

        return true;
      } catch (error) {
        console.error('Error sending browser notification:', error);
        return false;
      }
    },
    [checkPermission, requestPermission]
  );

  return {
    permission,
    checkPermission,
    requestPermission,
    sendBrowserNotification,
    isSupported: typeof window !== 'undefined' && 'Notification' in window,
  };
};
