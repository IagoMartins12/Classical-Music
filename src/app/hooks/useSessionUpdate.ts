// hooks/useSessionUpdate.ts
'use client';

import { useCallback } from 'react';
import { useSession } from '@/app/libs/session';
import { User, useUserStore } from './userStore';

/**
 * Relê a sessão depois de uma edição de perfil.
 *
 * A fonte agora é a API (`GET /profile?include=account`): não há sessão do
 * NextAuth para reescrever à mão com os valores novos. Quem chama já gravou a
 * mudança; aqui a sessão é relida, e o store local acompanha. As funções têm
 * os mesmos nomes e retornos de antes, para as telas não mudarem.
 */
export function useSessionUpdate() {
  const { data: session, update } = useSession();
  const { setUser, updateUser } = useUserStore();

  const updateUserSession = useCallback(async (): Promise<boolean> => {
    try {
      const fresh = await update();

      if (!fresh?.user) {
        return false;
      }

      setUser(fresh.user as unknown as User);
      return true;
    } catch {
      return false;
    }
  }, [update, setUser]);

  const updateUserFields = useCallback(
    async (fields: Record<string, unknown>): Promise<boolean> => {
      if (!session?.user?.id) {
        return false;
      }

      // Otimista: a tela já mostra o novo valor enquanto a sessão é relida.
      updateUser(fields as Partial<User>);
      return updateUserSession();
    },
    [session?.user?.id, updateUser, updateUserSession]
  );

  const updateUserField = useCallback(
    (field: string, value: unknown): Promise<boolean> =>
      updateUserFields({ [field]: value }),
    [updateUserFields]
  );

  const updateUserLocation = useCallback(
    (location: {
      city?: string | null;
      state?: string | null;
      country?: string | null;
    }): Promise<boolean> => updateUserFields(location),
    [updateUserFields]
  );

  const updateUserPhone = useCallback(
    (phoneData: {
      phone?: string | null;
      phoneCountryCode?: string | null;
      phoneNumber?: string | null;
    }): Promise<boolean> => updateUserFields(phoneData),
    [updateUserFields]
  );

  const markOnboardingComplete = useCallback(
    (): Promise<boolean> => updateUserField('onboardingCompleted', true),
    [updateUserField]
  );

  return {
    updateUserSession,
    updateUserField,
    updateUserFields,
    updateUserLocation,
    updateUserPhone,
    markOnboardingComplete,
    forceRefreshSession: updateUserSession,
    isAuthenticated: !!session?.user?.id,
    currentUser: session?.user,
  };
}
