// hooks/useAuthGuard.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { useLoginModal } from '../stores/authStore';

interface UseAuthGuardOptions {
  redirectTo?: string;
  openModal?: boolean;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { redirectTo, openModal = true } = options;
  const { isAuthenticated, isLoading } = useAuth();
  const { open: openLogin } = useLoginModal();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (redirectTo) {
        router.push(redirectTo);
      } else if (openModal) {
        openLogin();
      }
    }
  }, [isAuthenticated, isLoading, redirectTo, openModal, router, openLogin]);

  return {
    isAuthenticated,
    isLoading,
    canAccess: isAuthenticated || isLoading,
  };
}
