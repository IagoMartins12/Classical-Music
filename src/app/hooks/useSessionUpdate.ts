// hooks/useSessionUpdate.ts (hook personalizado para updates)
'use client';

import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

export function useSessionUpdate() {
  const { update: updateSession } = useSession();

  const updateUserSession = useCallback(async () => {
    try {
      // Força o NextAuth a buscar dados atualizados do banco
      await updateSession();
      console.log('Sessão atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
    }
  }, [updateSession]);

  const updateUserData = useCallback(
    async (data: any) => {
      try {
        // Atualizar a sessão com dados específicos
        await updateSession(data);
        console.log('Dados da sessão atualizados:', data);
      } catch (error) {
        console.error('Erro ao atualizar dados da sessão:', error);
      }
    },
    [updateSession]
  );

  return {
    updateUserSession,
    updateUserData,
  };
}
