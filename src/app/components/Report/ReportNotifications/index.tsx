// app/components/Notifications/ReportNotifications.tsx - Notificações específicas para reports
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { FiFlag, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { AnimatedItem } from '@/app/components/animation/AnimatedComponents';

interface ReportNotification {
  id: string;
  type: 'new_report' | 'report_resolved' | 'verification_changed';
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  read: boolean;
}

export default function ReportNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<ReportNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const isAdmin = session?.user?.role === 2;

  useEffect(() => {
    if (isAdmin) {
      fetchNotifications();
      // Configurar polling para atualizações em tempo real
      const interval = setInterval(fetchNotifications, 30000); // 30 segundos
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/reports');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/reports/${notificationId}/read`, {
        method: 'POST',
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_report':
        return <FiFlag className="w-4 h-4 text-accent-red" />;
      case 'report_resolved':
        return <FiCheck className="w-4 h-4 text-accent-green" />;
      case 'verification_changed':
        return <FiCheck className="w-4 h-4 text-accent-blue" />;
      default:
        return <FiClock className="w-4 h-4 text-theme-tertiary" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isAdmin || notifications.length === 0) return null;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-lg text-theme-tertiary hover:text-theme-primary hover:bg-theme-secondary transition-all"
        title="Notificações de reports"
      >
        <FiFlag className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-red text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowNotifications(false)}
          />

          <div className="absolute right-0 top-full mt-2 w-80 bg-theme-elevated border border-theme-primary rounded-lg shadow-theme-medium z-20 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-theme-secondary">
              <h3 className="font-semibold text-theme-primary">
                Notificações de Reports
              </h3>
              {unreadCount > 0 && (
                <p className="text-sm text-theme-secondary">
                  {unreadCount} não lida(s)
                </p>
              )}
            </div>

            <div className="py-2">
              {notifications.slice(0, 10).map((notification) => (
                <AnimatedItem key={notification.id} direction="left">
                  <div
                    className={`px-4 py-3 hover:bg-theme-secondary cursor-pointer ${
                      !notification.read ? 'bg-brand-primary/5' : ''
                    }`}
                    onClick={() => {
                      markAsRead(notification.id);
                      setShowNotifications(false);
                      // Navegar para o item se necessário
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-sm ${
                            !notification.read ? 'font-semibold' : 'font-medium'
                          } text-theme-primary`}
                        >
                          {notification.title}
                        </h4>
                        <p className="text-xs text-theme-secondary mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-theme-tertiary mt-1">
                          {new Date(notification.createdAt).toLocaleString(
                            'pt-BR'
                          )}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-accent-blue rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                </AnimatedItem>
              ))}
            </div>

            {notifications.length > 10 && (
              <div className="p-3 border-t border-theme-secondary text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    // Navegar para página completa de notificações
                  }}
                  className="text-sm text-brand-primary hover:text-brand-secondary"
                >
                  Ver todas as notificações
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
