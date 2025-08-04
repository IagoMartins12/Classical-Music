// app/hooks/useAccountManagement.ts - Custom hook for account management
'use client';

import { useState, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  requestEmailChange,
  changeUserType,
  deleteUserAccount,
  getAccountCascadeInfo,
} from '@/app/actions/profile';
import { useAuth } from './useAuth';

export interface CascadeInfo {
  totalItems: number;
  composersCount: number;
  worksCount: number;
  scoresCount: number;
  annotationsCount: number;
  favoritesCount: number;
  instrumentsCount: number;
  favoriteComposersCount: number;
  learnedWorksCount: number;
  wantToLearnCount: number;
  sampleComposers: { id: string; name: string; epochName?: string | null }[];
  sampleWorks: { id: string; title: string; composer: { name: string } }[];
  sampleAnnotations: { id: string; title: string; work: { title: string } }[];
}

interface EmailChangeData {
  newEmail: string;
  currentPassword: string;
}

interface UserTypeChangeData {
  userType: 'MUSIC_STUDENT' | 'CASUAL_USER' | 'PROFESSIONAL' | 'TEACHER';
}

export const useAccountManagement = () => {
  const { data: session, update: updateSession } = useSession();
  const { logout, user, updateUser } = useAuth();
  const router = useRouter();

  // Loading states
  const [isEmailChanging, setIsEmailChanging] = useState(false);
  const [isUserTypeChanging, setIsUserTypeChanging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCascadeLoading, setIsCascadeLoading] = useState(false);

  // Data states
  const [cascadeInfo, setCascadeInfo] = useState<
    CascadeInfo | null | undefined
  >(null);

  // Email change function
  const changeEmail = useCallback(
    async (data: EmailChangeData) => {
      if (!user?.id) {
        toast.error('Usuário não encontrado');
        return { success: false };
      }

      setIsEmailChanging(true);
      try {
        const result = await requestEmailChange(
          user.id,
          data,
          window.location.hostname,
          navigator.userAgent
        );

        if (result.success) {
          toast.success(result.message);
          return { success: true, data: result.data };
        } else {
          toast.error(result.message);
          return { success: false, error: result.message };
        }
      } catch (error) {
        console.error('Error changing email:', error);
        toast.error('Erro ao solicitar mudança de email');
        return { success: false, error: 'Erro interno' };
      } finally {
        setIsEmailChanging(false);
      }
    },
    [user?.id]
  );

  // User type change function
  const changeAccountType = useCallback(
    async (data: UserTypeChangeData) => {
      if (!user?.id) {
        toast.error('Usuário não encontrado');
        return { success: false };
      }

      setIsUserTypeChanging(true);
      try {
        const result = await changeUserType(user.id, data);

        if (result.success) {
          toast.success(result.message);

          // Update local user state
          updateUser({ userType: data.userType });

          // Update session
          if (updateSession && session) {
            await updateSession({
              ...session,
              user: { ...session.user, userType: data.userType },
            });
          }

          return { success: true, data: result.data };
        } else {
          toast.error(result.message);
          return { success: false, error: result.message };
        }
      } catch (error) {
        console.error('Error changing user type:', error);
        toast.error('Erro ao alterar tipo de conta');
        return { success: false, error: 'Erro interno' };
      } finally {
        setIsUserTypeChanging(false);
      }
    },
    [user?.id, updateUser, updateSession, session]
  );

  // Load cascade info for account deletion
  const loadCascadeInfo = useCallback(async () => {
    if (!user?.id) {
      toast.error('Usuário não encontrado');
      return { success: false };
    }

    setIsCascadeLoading(true);
    try {
      const result = await getAccountCascadeInfo(user.id);

      if (result.success) {
        setCascadeInfo(result.data);
        return { success: true, data: result.data };
      } else {
        toast.error(result.message);
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Error loading cascade info:', error);
      toast.error('Erro ao carregar informações da conta');
      return { success: false, error: 'Erro interno' };
    } finally {
      setIsCascadeLoading(false);
    }
  }, [user?.id]);

  // Delete account function
  const deleteAccount = useCallback(async () => {
    if (!user?.id) {
      toast.error('Usuário não encontrado');
      return { success: false };
    }

    setIsDeleting(true);
    try {
      const result = await deleteUserAccount(
        user.id,
        window.location.hostname,
        navigator.userAgent
      );

      if (result.success) {
        await signOut({ redirect: false });
        toast.success(
          'Sua conta foi excluída com sucesso. Sentiremos sua falta!'
        );
        router.push('/');
        logout();

        return { success: true, data: result.data };
      } else {
        toast.error(result.message);
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Erro ao deletar conta');
      return { success: false, error: 'Erro interno' };
    } finally {
      setIsDeleting(false);
    }
  }, [user?.id, logout, router]);

  // Helper function to get user type label
  const getUserTypeLabel = useCallback(
    (userType: string | null | undefined) => {
      switch (userType) {
        case 'MUSIC_STUDENT':
          return 'Estudante de Música';
        case 'CASUAL_USER':
          return 'Entusiasta';
        case 'PROFESSIONAL':
          return 'Profissional';
        case 'TEACHER':
          return 'Professor';
        default:
          return 'Não definido';
      }
    },
    []
  );

  // Helper function to validate email
  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Clear cascade info
  const clearCascadeInfo = useCallback(() => {
    setCascadeInfo(null);
  }, []);

  return {
    // State
    isEmailChanging,
    isUserTypeChanging,
    isDeleting,
    isCascadeLoading,
    cascadeInfo,

    // Functions
    changeEmail,
    changeAccountType,
    loadCascadeInfo,
    deleteAccount,
    clearCascadeInfo,

    // Helpers
    getUserTypeLabel,
    validateEmail,

    // User info
    user,
    session,
  };
};
