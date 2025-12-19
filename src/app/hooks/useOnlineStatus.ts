// hooks/useOnlineStatus.ts
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';

interface UseOnlineStatusOptions {
  updateInterval?: number; // Intervalo de atualização em ms (padrão: 5 minutos)
  inactivityThreshold?: number; // Threshold de inatividade em ms (padrão: 30 minutos)
  enabled?: boolean; // Se o tracking está habilitado
}

export function useOnlineStatus(options: UseOnlineStatusOptions = {}) {
  const {
    updateInterval = 5 * 60 * 1000, // 5 minutos
    inactivityThreshold = 30 * 60 * 1000, // 30 minutos
    enabled = true,
  } = options;

  const { user, isAuthenticated } = useAuth();
  const lastActivityRef = useRef<number>(Date.now());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityCheckRef = useRef<NodeJS.Timeout | null>(null);
  const hasRefetchedRef = useRef<boolean>(false);

  // Atualizar timestamp de última atividade
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    hasRefetchedRef.current = false;
  }, []);

  // Enviar heartbeat para o servidor
  const sendHeartbeat = useCallback(async () => {
    if (!isAuthenticated || !user?.id || !enabled) return;

    try {
      await fetch('/api/user/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('❌ Erro ao enviar heartbeat:', error);
    }
  }, [isAuthenticated, user?.id, enabled]);

  // Verificar inatividade e fazer refetch se necessário
  const checkInactivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    // Se passou o threshold de inatividade e ainda não fez refetch
    if (
      timeSinceLastActivity >= inactivityThreshold &&
      !hasRefetchedRef.current
    ) {
      console.log('⏰ Inatividade detectada. Fazendo refetch...');

      // Marcar que já fez refetch
      hasRefetchedRef.current = true;

      // Invalidar cache e recarregar dados críticos
      if (typeof window !== 'undefined') {
        // Revalidar cache do Next.js
        fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: window.location.pathname }),
        }).catch(console.error);

        // Disparar evento customizado para outros componentes
        window.dispatchEvent(
          new CustomEvent('user-reactivated', {
            detail: { userId: user?.id, timestamp: now },
          })
        );
      }

      // Enviar heartbeat imediatamente
      sendHeartbeat();
    }
  }, [inactivityThreshold, sendHeartbeat, user?.id]);

  // Listeners de atividade do usuário
  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [enabled, isAuthenticated, updateActivity]);

  // Interval de heartbeat (a cada 5 minutos)
  useEffect(() => {
    if (!enabled || !isAuthenticated || !user?.id) return;

    // Enviar heartbeat inicial
    sendHeartbeat();

    // Configurar interval
    updateIntervalRef.current = setInterval(sendHeartbeat, updateInterval);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [enabled, isAuthenticated, user?.id, updateInterval, sendHeartbeat]);

  // Verificação de inatividade (a cada minuto)
  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    inactivityCheckRef.current = setInterval(checkInactivity, 60 * 1000); // Verifica a cada 1 minuto

    return () => {
      if (inactivityCheckRef.current) {
        clearInterval(inactivityCheckRef.current);
        inactivityCheckRef.current = null;
      }
    };
  }, [enabled, isAuthenticated, checkInactivity]);

  // Heartbeat ao sair da página
  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    const handleBeforeUnload = () => {
      // Enviar beacon para garantir que chegue mesmo se a página fechar
      if (navigator.sendBeacon && user?.id) {
        navigator.sendBeacon(
          '/api/user/heartbeat',
          JSON.stringify({
            userId: user.id,
            timestamp: new Date().toISOString(),
            type: 'beforeunload',
          })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, isAuthenticated, user?.id]);

  return {
    isActive: Date.now() - lastActivityRef.current < inactivityThreshold,
    lastActivity: lastActivityRef.current,
    forceUpdate: sendHeartbeat,
  };
}
