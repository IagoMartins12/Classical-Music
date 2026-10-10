'use client';

import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { SIGN_IN_GATE, type GatedAction } from '@/app/conteudo/site/signIn';
import { useAuth } from '@/app/hooks/useAuth';
import { useOverlayLanguage } from '@/app/hooks/useRouteLanguage';
import { useLoginModal } from '@/app/stores/authStore';

/**
 * For actions that need an account: `allowed('favorite')` is true when
 * signed in; otherwise it says why in a toast, opens the sign-in modal and
 * returns false. One place, so every button explains itself the same way.
 */
export function useSignInGate() {
  const { isAuthenticated, user } = useAuth();
  const { open } = useLoginModal();
  const language = useOverlayLanguage();
  const signedIn = isAuthenticated && !!user?.id;

  return useCallback(
    (action: GatedAction = 'other') => {
      if (signedIn) return true;
      toast(SIGN_IN_GATE[language][action], { id: 'sign-in-gate' });
      open();
      return false;
    },
    [signedIn, open, language]
  );
}
