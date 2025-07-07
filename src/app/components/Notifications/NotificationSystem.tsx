// app/components/notifications/NotificationSystem.tsx
'use client';

import { useEffect } from 'react';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiX,
  FiXCircle,
} from 'react-icons/fi';
import { AnimatedItem } from '../animation/AnimatedComponents';

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

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationSystem = ({
  notifications,
  onRemove,
}: NotificationSystemProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-5 h-5 text-accent-green" />;
      case 'error':
        return <FiXCircle className="w-5 h-5 text-accent-red" />;
      case 'warning':
        return <FiAlertCircle className="w-5 h-5 text-accent-amber" />;
      default:
        return <FiInfo className="w-5 h-5 text-accent-blue" />;
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-accent-green/10 border-accent-green/20';
      case 'error':
        return 'bg-accent-red/10 border-accent-red/20';
      case 'warning':
        return 'bg-accent-amber/10 border-accent-amber/20';
      default:
        return 'bg-accent-blue/10 border-accent-blue/20';
    }
  };

  // Auto-remove notifications after duration
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          onRemove(notification.id);
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onRemove]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <AnimatedItem
          key={notification.id}
          direction="right"
          springType="bouncy"
        >
          <div
            className={`classical-card p-4 max-w-md border ${getColorClasses(
              notification.type
            )}`}
          >
            <div className="flex items-start space-x-3">
              {getIcon(notification.type)}

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-theme-primary">
                  {notification.title}
                </h4>
                <p className="text-sm text-theme-secondary mt-1">
                  {notification.message}
                </p>

                {notification.action && (
                  <button
                    onClick={notification.action.onClick}
                    className="text-sm text-brand-primary hover:text-brand-secondary mt-2 font-medium"
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>

              <button
                onClick={() => onRemove(notification.id)}
                className="text-theme-tertiary hover:text-theme-primary transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        </AnimatedItem>
      ))}
    </div>
  );
};

export default NotificationSystem;
