// app/hooks/notifications/useNotifications.ts - CORRIGIDO COM CHECK IMEDIATO E DEDUPLICAÇÃO ROBUSTA
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  NotificationData,
  NotificationCheckResult,
  NOTIFICATION_CONFIG,
  mapPrismaNotificationToData,
} from '@/app/types/notification';
import { useToast } from '@/app/hooks/useToast';
import { useSimplePageVisibility } from './usePageVisibility';
import { useBrowserNotifications } from './useBrowserNotifications';

interface UseNotificationsOptions {
  userRole: 'teacher' | 'student';
  userId: string;
  autoStart?: boolean;
}

const STORAGE_KEY = 'opus_atlas_notification_cache';

// 🔥 CACHE APRIMORADO - trackeia notificações por hash único MAIS ROBUSTO
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
    console.warn('📬 [CACHE] Failed to save notification cache:', error);
  }
};

// 🔥 GERAÇÃO DE CHAVE ÚNICA CONSISTENTE - evita duplicatas
const generateConsistentKey = (notification: NotificationData): string => {
  // Se tem uniqueHash, usar ele
  if (notification.uniqueHash) {
    return notification.uniqueHash;
  }

  // Senão, criar chave baseada em tipo + entidade relacionada + data (só dia, não hora)
  const dateOnly = new Date(notification.createdAt).toDateString();

  if (notification.relatedEntityId && notification.relatedEntityType) {
    return `${notification.type}_${notification.relatedEntityType}_${notification.relatedEntityId}_${dateOnly}`;
  }

  // Fallback para ID + data
  return `${notification.id}_${dateOnly}`;
};

// 🔥 DEBOUNCE para evitar múltiplas chamadas
const useDebounce = (callback: any, delay: number) => {
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
  const isPageVisible = useSimplePageVisibility();
  const { sendBrowserNotification } = useBrowserNotifications();

  // Refs para evitar re-render loops
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);
  const lastCheckRef = useRef<Date | null>(null);
  const cacheRef = useRef(getNotificationCache());
  const requestIdRef = useRef(0);
  const hasInitialCheckRef = useRef(false); // 🆕 Para controlar check inicial
  const mutexRef = useRef(false); // 🆕 MUTEX para evitar chamadas simultâneas

  // 🔥 LIMPEZA AUTOMÁTICA DO CACHE (6h -> 3h para ser mais agressivo)
  const cleanupCache = useCallback(() => {
    const cache = cacheRef.current;
    const now = Date.now();

    // Limpar cache a cada 3 horas (mais agressivo)
    if (now - cache.lastCleanup > 3 * 60 * 60 * 1000) {
      console.log('📬 [CACHE-CLEANUP] Limpando cache antigo');

      // Manter apenas últimas 30 notificações (era 50)
      const recentIds = Array.from(cache.shownNotifications).slice(-30);
      cache.shownNotifications = new Set(recentIds);
      cache.lastCleanup = now;

      cacheRef.current = cache;
      saveNotificationCache(cache);
    }
  }, []);

  // 🔥 FUNÇÃO DE CHECK COM MUTEX PARA EVITAR CHAMADAS SIMULTÂNEAS
  const checkNotifications = useCallback(
    async (force = false): Promise<NotificationCheckResult | null> => {
      const requestId = ++requestIdRef.current;

      // 🆕 MUTEX: Verificar se já há uma chamada em andamento
      if (mutexRef.current && !force) {
        console.log(
          `📬 [NOTIFICATIONS] 🔒 MUTEX ativo, aguardando chamada anterior terminar (requestId: ${requestId})`
        );
        return null;
      }

      // 🆕 Ativar MUTEX
      mutexRef.current = true;

      console.log(
        `📬 [NOTIFICATIONS] 🚀 Iniciando check (force: ${force}, requestId: ${requestId}, mutex: ativo)`
      );

      // Prevenir múltiplas chamadas simultâneas (backup)
      if (isCheckingRef.current && !force) {
        console.log('📬 [NOTIFICATIONS] Check já em progresso, pulando');
        mutexRef.current = false; // Liberar mutex
        return null;
      }

      isCheckingRef.current = true;
      setIsChecking(true);
      setError(null);

      try {
        const now = new Date();

        // Throttle menos rigoroso para initial check
        if (!force && !hasInitialCheckRef.current && lastCheckRef.current) {
          const timeSinceLastCheck =
            now.getTime() - lastCheckRef.current.getTime();
          const minInterval = 3 * 1000; // 🆕 Reduzido para 3 segundos

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
          browser: result.browserNotifications?.length || 0,
          naoLidas: result.totalUnread,
        });

        // Processar notificações com deduplicação ROBUSTA
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
        hasInitialCheckRef.current = true; // 🆕 Marcar que já fez check inicial

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
        // 🆕 SEMPRE liberar MUTEX
        mutexRef.current = false;
        console.log(
          `📬 [NOTIFICATIONS] 🔓 MUTEX liberado (requestId: ${requestId})`
        );
      }
    },
    [userRole, userId, isPageVisible, cleanupCache]
  );

  // 🔥 PROCESSAMENTO COM DEDUPLICAÇÃO APRIMORADA E MARCAÇÃO OTIMISTA
  const processNotifications = useCallback(
    async (result: NotificationCheckResult) => {
      const cache = cacheRef.current;

      // Processar toast notifications
      if (result.toastNotifications && result.toastNotifications.length > 0) {
        console.log(
          `📬 [NOTIFICATIONS] Processando ${result.toastNotifications.length} toast notifications`
        );

        for (const notification of result.toastNotifications) {
          // 🔥 CHAVE ÚNICA CONSISTENTE
          const uniqueKey = generateConsistentKey(notification);

          console.log(
            `📬 [TOAST] Verificando notificação: ${notification.title} (key: ${uniqueKey})`
          );

          // Verificar se já foi mostrada
          if (!cache.shownNotifications.has(uniqueKey)) {
            // 🆕 MARCAÇÃO OTIMISTA: Marcar como shown ANTES de mostrar o toast
            cache.shownNotifications.add(uniqueKey);
            cacheRef.current = cache;
            saveNotificationCache(cache);

            // 🆕 Marcar no servidor de forma assíncrona (não bloquear o toast)
            markAsShown(notification.id, 'toast').catch((error) => {
              console.warn(
                `📬 [MARK-SHOWN] Erro ao marcar ${notification.id}:`,
                error
              );
              // Se falhar no servidor, remover do cache local para tentar novamente
              cache.shownNotifications.delete(uniqueKey);
              cacheRef.current = cache;
              saveNotificationCache(cache);
            });

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

            console.log(
              `📬 [TOAST] ✅ Mostrado: ${notification.title} (key: ${uniqueKey})`
            );
          } else {
            console.log(
              `📬 [TOAST] ⏭️ Pulado (já mostrado): ${notification.title} (key: ${uniqueKey})`
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
    },
    [toast, sendBrowserNotification]
  );

  // Debounced check function (menos agressivo devido ao MUTEX)
  const debouncedCheck = useDebounce(checkNotifications, 1000); // Volta para 1000ms

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
        console.warn(
          '📬 [MARK-SHOWN] Failed to mark notification as shown:',
          error
        );
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
        console.error(
          '📬 [MARK-READ] Error marking notification as read:',
          error
        );
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
      console.error(
        '📬 [MARK-ALL-READ] Error marking all notifications as read:',
        error
      );
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
        console.error('📬 [FETCH] Error fetching notifications:', error);
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

    // 🆕 CHECK IMEDIATO ao inicializar
    if (!hasInitialCheckRef.current) {
      console.log('📬 [NOTIFICATIONS] 🚀 Executando check inicial IMEDIATO');
      checkNotifications(true); // Force check inicial
    }

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

  // 🆕 Effect para verificar quando volta para a aba
  useEffect(() => {
    if (isPageVisible && hasInitialCheckRef.current) {
      console.log(
        '📬 [PAGE-FOCUS] Usuário voltou para a aba, verificando notificações'
      );
      debouncedCheck(false);
    }
  }, [isPageVisible, debouncedCheck]);

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
    console.log('📬 [REFRESH] Forçando verificação manual');
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
