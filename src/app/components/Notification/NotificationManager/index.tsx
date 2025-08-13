// app/components/Notifications/NotificationManager.tsx - CORRIGIDO
'use client';

import { useEffect, useRef } from 'react';
import { useNotifications } from '@/app/hooks/notifications/useNotifications';

interface NotificationManagerProps {
  userRole: 'teacher' | 'student';
  userId: string;
  children?: React.ReactNode;
}

/**
 * Componente responsável por gerenciar notificações em background
 * Versão corrigida sem re-render loops
 */
export default function NotificationManager({
  userRole,
  userId,
  children,
}: NotificationManagerProps) {
  const initRef = useRef(false);
  const userRoleRef = useRef(userRole);
  const userIdRef = useRef(userId);

  const { unreadCount, isChecking, error } = useNotifications({
    userRole,
    userId,
    autoStart: true,
  });

  // Only log on significant changes, not every render
  useEffect(() => {
    if (!initRef.current) {
      console.log(
        `📬 [NOTIFICATION-MANAGER] Initialized for ${userRole.toUpperCase()} ${userId}`
      );
      initRef.current = true;
    }
  }, []);

  // Log errors only when they change
  useEffect(() => {
    if (error) {
      console.warn('📬 [NOTIFICATION-MANAGER] Error:', error);
    }
  }, [error]);

  // Update refs if props change (should be rare)
  useEffect(() => {
    if (userRoleRef.current !== userRole || userIdRef.current !== userId) {
      console.log(
        `📬 [NOTIFICATION-MANAGER] User changed from ${userRoleRef.current}:${userIdRef.current} to ${userRole}:${userId}`
      );
      userRoleRef.current = userRole;
      userIdRef.current = userId;
    }
  }, [userRole, userId]);

  return (
    <>
      {children}

      {/* Debug info - only in development, and only show on significant changes */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-[9999] bg-black/80 text-white text-xs p-2 rounded pointer-events-none">
          <div>Role: {userRole}</div>
          <div>Unread: {unreadCount}</div>
          <div
            className={`${isChecking ? 'text-yellow-400' : 'text-green-400'}`}
          >
            Status: {isChecking ? 'Checking...' : 'Ready'}
          </div>
          {error && (
            <div className="text-red-400">
              Error: {error.substring(0, 30)}...
            </div>
          )}
        </div>
      )}
    </>
  );
}
