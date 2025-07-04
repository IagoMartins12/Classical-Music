// app/hooks/useNotifications.ts
'use client';

import { useState, useCallback } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = `notification-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const newNotification = {
        ...notification,
        id,
        duration: notification.duration || 5000, // 5 segundos por padrão
      };

      setNotifications((prev) => [...prev, newNotification]);
      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper functions for common notification types
  const notifySuccess = useCallback(
    (title: string, message: string, options?: Partial<Notification>) => {
      return addNotification({ type: 'success', title, message, ...options });
    },
    [addNotification]
  );

  const notifyError = useCallback(
    (title: string, message: string, options?: Partial<Notification>) => {
      return addNotification({
        type: 'error',
        title,
        message,
        duration: 8000,
        ...options,
      });
    },
    [addNotification]
  );

  const notifyInfo = useCallback(
    (title: string, message: string, options?: Partial<Notification>) => {
      return addNotification({ type: 'info', title, message, ...options });
    },
    [addNotification]
  );

  const notifyWarning = useCallback(
    (title: string, message: string, options?: Partial<Notification>) => {
      return addNotification({ type: 'warning', title, message, ...options });
    },
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
  };
};
