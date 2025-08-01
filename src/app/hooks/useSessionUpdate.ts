// hooks/useSessionUpdate.ts (versão melhorada com novos campos)
'use client';

import { useSession } from 'next-auth/react';
import { useCallback } from 'react';
import { useUserStore } from './userStore';
import { getUserById } from '@/app/actions/auth';

export function useSessionUpdate() {
  const { data: session, update: updateSession } = useSession();
  const { setUser, updateUser } = useUserStore();

  // 🔄 FUNÇÃO PARA ATUALIZAR SESSÃO COMPLETA
  const updateUserSession = useCallback(async (): Promise<boolean> => {
    if (!session?.user?.id) {
      console.warn('⚠️ Tentativa de atualizar sessão sem usuário autenticado');
      return false;
    }

    try {
      console.log('🔄 Atualizando sessão do usuário:', session.user.id);

      // 1. Buscar dados atualizados do banco
      const updatedUser = await getUserById(session.user.id);

      if (!updatedUser) {
        console.error('❌ Usuário não encontrado no banco');
        return false;
      }

      console.log('✅ Dados atualizados obtidos do banco:', {
        id: updatedUser.id,
        onboardingCompleted: updatedUser.onboardingCompleted,
        hasLocation: !!(
          updatedUser.city ||
          updatedUser.state ||
          updatedUser.country
        ),
        hasPhone: !!updatedUser.phone,
        phoneCountryCode: updatedUser.phoneCountryCode,
      });

      // 2. Atualizar sessão do NextAuth
      await updateSession({
        ...session,
        user: {
          ...session.user,
          ...updatedUser,
        },
      });

      // 3. Atualizar store local
      setUser({
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email!,
        image: updatedUser.image,
        bio: updatedUser.bio,
        role: updatedUser.role,
        onboardingCompleted: updatedUser.onboardingCompleted,
        userType: updatedUser.userType,

        // 🆕 CAMPOS DE LOCALIZAÇÃO
        city: updatedUser.city,
        state: updatedUser.state,
        country: updatedUser.country,

        // 🆕 CAMPOS DE TELEFONE
        phone: updatedUser.phone,
        phoneCountryCode: updatedUser.phoneCountryCode,
        phoneNumber: updatedUser.phoneNumber,

        // Campos existentes
        favoriteComposerId: updatedUser.favoriteComposerId,
        favoriteEpochId: updatedUser.favoriteEpochId,
        experienceLevel: updatedUser.experienceLevel,
        practiceTimePerWeek: updatedUser.practiceTimePerWeek,
        profilePublic: updatedUser.profilePublic,
        showLocation: updatedUser.showLocation,
      });

      console.log('✅ Sessão e store atualizados com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar sessão:', error);
      return false;
    }
  }, [session, updateSession, setUser]);

  // 🔄 FUNÇÃO PARA ATUALIZAR APENAS CAMPOS ESPECÍFICOS
  const updateUserField = useCallback(
    async (field: string, value: any): Promise<boolean> => {
      if (!session?.user?.id) {
        console.warn('⚠️ Tentativa de atualizar campo sem usuário autenticado');
        return false;
      }

      try {
        console.log(`🔄 Atualizando campo ${field}:`, value);

        // 1. Atualizar sessão
        await updateSession({
          ...session,
          user: {
            ...session.user,
            [field]: value,
          },
        });

        // 2. Atualizar store local
        updateUser({ [field]: value });

        console.log(`✅ Campo ${field} atualizado com sucesso`);
        return true;
      } catch (error) {
        console.error(`❌ Erro ao atualizar campo ${field}:`, error);
        return false;
      }
    },
    [session, updateSession, updateUser]
  );

  // 🔄 FUNÇÃO PARA ATUALIZAR MÚLTIPLOS CAMPOS
  const updateUserFields = useCallback(
    async (fields: Record<string, any>): Promise<boolean> => {
      if (!session?.user?.id) {
        console.warn(
          '⚠️ Tentativa de atualizar campos sem usuário autenticado'
        );
        return false;
      }

      try {
        console.log('🔄 Atualizando múltiplos campos:', fields);

        // 1. Atualizar sessão
        await updateSession({
          ...session,
          user: {
            ...session.user,
            ...fields,
          },
        });

        // 2. Atualizar store local
        updateUser(fields);

        console.log('✅ Múltiplos campos atualizados com sucesso');
        return true;
      } catch (error) {
        console.error('❌ Erro ao atualizar múltiplos campos:', error);
        return false;
      }
    },
    [session, updateSession, updateUser]
  );

  // 🔄 FUNÇÃO ESPECÍFICA PARA ATUALIZAR LOCALIZAÇÃO
  const updateUserLocation = useCallback(
    async (location: {
      city?: string | null;
      state?: string | null;
      country?: string | null;
    }): Promise<boolean> => {
      console.log('📍 Atualizando localização do usuário:', location);
      return await updateUserFields(location);
    },
    [updateUserFields]
  );

  // 🔄 FUNÇÃO ESPECÍFICA PARA ATUALIZAR TELEFONE
  const updateUserPhone = useCallback(
    async (phoneData: {
      phone?: string | null;
      phoneCountryCode?: string | null;
      phoneNumber?: string | null;
    }): Promise<boolean> => {
      console.log('📞 Atualizando telefone do usuário:', phoneData);
      return await updateUserFields(phoneData);
    },
    [updateUserFields]
  );

  // 🔄 FUNÇÃO PARA MARCAR ONBOARDING COMO COMPLETO
  const markOnboardingComplete = useCallback(async (): Promise<boolean> => {
    console.log('🎉 Marcando onboarding como completo');
    return await updateUserField('onboardingCompleted', true);
  }, [updateUserField]);

  // 🔄 FUNÇÃO PARA FORÇAR REFRESH COMPLETO
  const forceRefreshSession = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔄 Forçando refresh completo da sessão');

      // Força o NextAuth a buscar dados atualizados do banco
      await updateSession();

      // Em seguida, sincroniza com o store local
      const success = await updateUserSession();

      console.log('✅ Refresh completo da sessão finalizado');
      return success;
    } catch (error) {
      console.error('❌ Erro no refresh completo da sessão:', error);
      return false;
    }
  }, [updateSession, updateUserSession]);

  return {
    // Funções principais
    updateUserSession,
    updateUserField,
    updateUserFields,

    // Funções específicas
    updateUserLocation,
    updateUserPhone,
    markOnboardingComplete,

    // Função de refresh
    forceRefreshSession,

    // Estado atual
    isAuthenticated: !!session?.user?.id,
    currentUser: session?.user,
  };
}
