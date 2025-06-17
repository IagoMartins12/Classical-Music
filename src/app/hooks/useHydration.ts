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
