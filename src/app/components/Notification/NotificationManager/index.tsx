// app/components/Notifications/NotificationManager.tsx - CORRIGIDO PARA EVITAR MÚLTIPLAS INSTÂNCIAS
'use client';

import { useEffect, useRef } from 'react';
import { useNotifications } from '@/app/hooks/notifications/useNotifications';

interface NotificationManagerProps {
  userRole: 'teacher' | 'student';
  userId: string;
  children?: React.ReactNode;
}

// 🆕 INSTÂNCIA GLOBAL para evitar múltiplos managers
const globalInstanceTracker = new Map<string, boolean>();

/**
 * Componente responsável por gerenciar notificações em background
 * Versão corrigida para evitar múltiplas instâncias simultâneas
 */
export default function NotificationManager({
  userRole,
  userId,
  children,
}: NotificationManagerProps) {
  const initRef = useRef(false);
  const userRoleRef = useRef(userRole);
  const userIdRef = useRef(userId);
  const instanceKey = `${userRole}_${userId}`;

  // 🆕 Verificar se já existe uma instância para este usuário
  const isMainInstance = useRef(false);

  const { error } = useNotifications({
    userRole,
    userId,
    autoStart: isMainInstance.current, // 🆕 Só auto-start se for a instância principal
  });

  // 🆕 Controle de instância única
  useEffect(() => {
    const hasExistingInstance = globalInstanceTracker.get(instanceKey);

    if (!hasExistingInstance) {
      // Esta é a primeira instância para este usuário
      globalInstanceTracker.set(instanceKey, true);
      isMainInstance.current = true;

      console.log(
        `📬 [NOTIFICATION-MANAGER] 👑 Instância PRINCIPAL criada para ${instanceKey}`
      );
    } else {
      // Já existe uma instância para este usuário
      isMainInstance.current = false;
      console.log(
        `📬 [NOTIFICATION-MANAGER] 👥 Instância SECUNDÁRIA ignorada para ${instanceKey}`
      );
    }

    // Cleanup quando componente desmonta
    return () => {
      if (isMainInstance.current) {
        globalInstanceTracker.delete(instanceKey);
        console.log(
          `📬 [NOTIFICATION-MANAGER] 🗑️ Instância PRINCIPAL removida para ${instanceKey}`
        );
      }
    };
  }, [instanceKey]);

  // Log inicial apenas para instância principal
  useEffect(() => {
    if (isMainInstance.current && !initRef.current) {
      console.log(
        `📬 [NOTIFICATION-MANAGER] ✅ Initialized MAIN instance for ${userRole.toUpperCase()} ${userId}`
      );
      initRef.current = true;
    }
  }, [userRole, userId]);

  // Log errors apenas da instância principal
  useEffect(() => {
    if (isMainInstance.current && error) {
      console.warn('📬 [NOTIFICATION-MANAGER] Error:', error);
    }
  }, [error]);

  // Update refs se props mudarem
  useEffect(() => {
    if (userRoleRef.current !== userRole || userIdRef.current !== userId) {
      console.log(
        `📬 [NOTIFICATION-MANAGER] User changed from ${userRoleRef.current}:${userIdRef.current} to ${userRole}:${userId}`
      );
      userRoleRef.current = userRole;
      userIdRef.current = userId;
    }
  }, [userRole, userId]);

  return <>{children}</>;
}
