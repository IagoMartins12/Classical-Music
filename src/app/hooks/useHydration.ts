// hooks/useHydration.ts (hook para gerenciar hidratação)
'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from './userStore';

interface HydrationState {
  isHydrated: boolean;
  isUserStoreReady: boolean;
  isClientSide: boolean;
}

export function useHydration(): HydrationState {
  const [isClientSide, setIsClientSide] = useState(false);
  const isUserStoreHydrated = useUserStore((state) => state.isHydrated);

  useEffect(() => {
    // Marcar que estamos no lado do cliente
    setIsClientSide(true);
  }, []);

  const isHydrated = isClientSide && isUserStoreHydrated;
  const isUserStoreReady = isUserStoreHydrated;

  return {
    isHydrated,
    isUserStoreReady,
    isClientSide,
  };
}

// Hook para aguardar hidratação completa
export function useWaitForHydration() {
  const { isHydrated } = useHydration();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isHydrated && !isReady) {
      // Pequeno delay para garantir que tudo está pronto
      const timeout = setTimeout(() => {
        setIsReady(true);
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [isHydrated, isReady]);

  return isReady;
}

// Hook para debug de hidratação
export function useHydrationDebug() {
  const hydrationState = useHydration();
  const userStoreState = useUserStore();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Hydration Debug:', {
        ...hydrationState,
        userStoreUser: userStoreState.user?.id || 'null',
        userStoreAuthenticated: userStoreState.isAuthenticated,
      });
    }
  }, [hydrationState, userStoreState.user, userStoreState.isAuthenticated]);

  return hydrationState;
}
