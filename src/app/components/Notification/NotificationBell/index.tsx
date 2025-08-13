// app/components/Notifications/NotificationBell.tsx - CORRIGIDO
'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  FiBell,
  FiX,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiInfo,
  FiExternalLink,
} from 'react-icons/fi';
import { useNotifications } from '@/app/hooks/notifications/useNotifications';
import {
  NotificationData,
  NOTIFICATION_TYPE_CONFIG,
} from '@/app/types/notification';

interface NotificationBellProps {
  userRole: 'teacher' | 'student';
  userId: string;
  className?: string;
}

export default function NotificationBell({
  userRole,
  userId,
  className = '',
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<
    NotificationData[]
  >([]);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  const {
    unreadCount,
    isChecking,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications({
    userRole,
    userId,
    autoStart: true,
  });

  // Memoized functions to prevent re-renders
  const loadRecentNotifications = useCallback(async () => {
    if (loading || loadedRef.current) return;

    setLoading(true);
    loadedRef.current = true;

    try {
      const notifications = await fetchNotifications(1, 10);
      setRecentNotifications(notifications);
    } catch (error) {
      console.error('Failed to load recent notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchNotifications, loading]);

  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      await markAsRead(notificationId);
      setRecentNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, status: 'READ' as const, readAt: new Date() }
            : n
        )
      );
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
    setRecentNotifications((prev) =>
      prev.map((n) => ({ ...n, status: 'READ' as const, readAt: new Date() }))
    );
  }, [markAllAsRead]);

  const handleBellClick = useCallback(() => {
    setIsOpen(!isOpen);
    if (!isOpen && !loadedRef.current) {
      loadRecentNotifications();
    }
  }, [isOpen, loadRecentNotifications]);

  // Memoized helper functions
  const formatTime = useCallback((date: Date | string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours =
      (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}min atrás`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d atrás`;
    }
  }, []);

  const getNotificationIcon = useCallback((type: string, priority: string) => {
    if (priority === 'HIGH' || priority === 'CRITICAL') {
      return <FiAlertTriangle className="w-4 h-4 text-accent-red" />;
    } else if (priority === 'MEDIUM') {
      return <FiClock className="w-4 h-4 text-accent-amber" />;
    } else {
      return <FiInfo className="w-4 h-4 text-accent-blue" />;
    }
  }, []);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'CRITICAL':
        return 'border-l-accent-red';
      case 'MEDIUM':
        return 'border-l-accent-amber';
      default:
        return 'border-l-accent-blue';
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Reset loaded state when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      loadedRef.current = false;
    }
  }, [isOpen]);

  // Memoize bell appearance to prevent unnecessary re-renders
  const bellAppearance = useMemo(
    () => ({
      iconColor:
        unreadCount > 0
          ? 'text-brand-primary'
          : 'text-theme-secondary group-hover:text-brand-primary',
      badgeVisible: unreadCount > 0,
      badgeText: unreadCount > 99 ? '99+' : unreadCount.toString(),
    }),
    [unreadCount]
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-lg hover:bg-interactive-hover transition-colors group"
        title="Notificações"
      >
        <FiBell
          className={`w-5 h-5 transition-colors ${bellAppearance.iconColor}`}
        />

        {/* Badge de contagem */}
        {bellAppearance.badgeVisible && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-red text-theme-primary text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {bellAppearance.badgeText}
          </span>
        )}

        {/* Indicator de carregamento */}
        {isChecking && (
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-accent-blue rounded-full animate-pulse"></div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-theme-secondary backdrop-blur-xl rounded-2xl shadow-xl border border-theme-secondary z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-theme-secondary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-theme-primary">
                  Notificações
                </h3>
                <p className="text-sm text-theme-tertiary">
                  {unreadCount > 0
                    ? `${unreadCount} não lidas`
                    : 'Tudo em dia!'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-brand-primary hover:text-brand-secondary transition-colors flex items-center space-x-1"
                    title="Marcar todas como lidas"
                  >
                    <FiCheckCircle className="w-3 h-3" />
                    <span>Marcar todas</span>
                  </button>
                )}

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-interactive-hover transition-colors"
                >
                  <FiX className="w-4 h-4 text-theme-tertiary" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-theme-tertiary mt-2">
                  Carregando...
                </p>
              </div>
            ) : recentNotifications.length > 0 ? (
              <div className="divide-y divide-theme-secondary">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-interactive-hover transition-colors border-l-4 ${getPriorityColor(
                      notification.priority
                    )} ${
                      notification.status === 'UNREAD'
                        ? 'bg-theme-elevated/50'
                        : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Ícone */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(
                          notification.type,
                          notification.priority
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4
                              className={`text-sm font-medium ${
                                notification.status === 'UNREAD'
                                  ? 'text-theme-primary'
                                  : 'text-theme-secondary'
                              }`}
                            >
                              {notification.title}
                            </h4>
                            <p className="text-sm text-theme-tertiary mt-1 line-clamp-2">
                              {notification.message}
                            </p>

                            {/* Ações */}
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-theme-tertiary">
                                {formatTime(notification.createdAt)}
                              </span>

                              <div className="flex items-center space-x-2">
                                {notification.actionUrl && (
                                  <Link
                                    href={notification.actionUrl}
                                    onClick={() => {
                                      handleMarkAsRead(notification.id);
                                      setIsOpen(false);
                                    }}
                                    className="text-xs text-brand-primary hover:text-brand-secondary transition-colors flex items-center space-x-1"
                                  >
                                    <span>
                                      {notification.actionText || 'Ver'}
                                    </span>
                                    <FiExternalLink className="w-3 h-3" />
                                  </Link>
                                )}

                                {notification.status === 'UNREAD' && (
                                  <button
                                    onClick={() =>
                                      handleMarkAsRead(notification.id)
                                    }
                                    className="text-xs text-theme-tertiary hover:text-accent-green transition-colors"
                                    title="Marcar como lida"
                                  >
                                    <FiCheck className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <FiBell className="w-12 h-12 text-theme-tertiary mx-auto mb-3 opacity-50" />
                <p className="text-theme-tertiary">Nenhuma notificação</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="p-3 border-t border-theme-secondary">
              <Link
                href={`/${userRole}/notifications`}
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-brand-primary hover:text-brand-secondary transition-colors"
              >
                Ver todas as notificações
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
