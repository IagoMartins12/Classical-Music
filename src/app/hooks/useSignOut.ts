'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/hooks/useAuth';
import { signOut } from '@/app/libs/session';
import { useAuthStore } from '@/app/stores/authStore';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';
import { useLearningStore } from '@/app/stores/useLearningStore';

/**
 * Signs out and clears every per-user store, so the next person on the same
 * browser does not see the previous one's favorites or studies.
 */
export function useSignOut(messages: { done: string; failed: string }) {
  const router = useRouter();
  const { logout } = useAuth();
  const resetAuth = useAuthStore((s) => s.logout);
  const resetFavorites = useFavoritesStore((s) => s.reset);
  const resetLearning = useLearningStore((s) => s.reset);

  return useCallback(async () => {
    try {
      resetFavorites();
      resetLearning();
      logout();
      resetAuth();
      await signOut({ redirect: false });
      toast.success(messages.done);
      router.refresh();
    } catch {
      toast.error(messages.failed);
    }
  }, [
    logout,
    messages.done,
    messages.failed,
    resetAuth,
    resetFavorites,
    resetLearning,
    router,
  ]);
}
