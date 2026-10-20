// app/hooks/useAccountManagement.ts - Custom hook for account management
'use client';

import { useState, useCallback } from 'react';
import { signOut, useSession } from '@/app/libs/session';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  requestEmailChange,
  changeUserType,
  deleteUserAccount,
  getAccountCascadeInfo,
} from '@/app/actions/profile';
import { useAuth } from './useAuth';
import { porIdioma } from '@/app/utils/porIdioma';

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
        toast.error(porIdioma('Usuário não encontrado', 'User not found'));
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
        toast.error(
          porIdioma(
            'Não foi possível pedir a troca de e-mail',
            'Could not request the email change'
          )
        );
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
        toast.error(porIdioma('Usuário não encontrado', 'User not found'));
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
        toast.error(
          porIdioma(
            'Não foi possível mudar o tipo de conta',
            'Could not change the account type'
          )
        );
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
      toast.error(porIdioma('Usuário não encontrado', 'User not found'));
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
      toast.error(
        porIdioma(
          'Não foi possível carregar a conta',
          'Could not load the account'
        )
      );
      return { success: false, error: 'Erro interno' };
    } finally {
      setIsCascadeLoading(false);
    }
  }, [user?.id]);

  // Delete account function — a API pede a senha atual de quem tem senha
  const deleteAccount = useCallback(
    async (currentPassword?: string) => {
      if (!user?.id) {
        toast.error(porIdioma('Usuário não encontrado', 'User not found'));
        return { success: false };
      }

      setIsDeleting(true);
      try {
        const result = await deleteUserAccount(
          user.id,
          window.location.hostname,
          navigator.userAgent,
          currentPassword
        );

        if (result.success) {
          await signOut({ redirect: false });
          toast.success(
            porIdioma(
              'Sua conta foi excluída. Sentiremos sua falta.',
              'Your account was deleted. We will miss you.'
            )
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
        toast.error(
          porIdioma(
            'Não foi possível excluir a conta',
            'Could not delete the account'
          )
        );
        return { success: false, error: 'Erro interno' };
      } finally {
        setIsDeleting(false);
      }
    },
    [user?.id, logout, router]
  );

  // Helper function to get user type label
  const getUserTypeLabel = useCallback(
    (userType: string | null | undefined) => {
      switch (userType) {
        case 'MUSIC_STUDENT':
          return porIdioma('Estudante de música', 'Music student');
        case 'CASUAL_USER':
          return porIdioma('Entusiasta', 'Enthusiast');
        case 'PROFESSIONAL':
          return porIdioma('Profissional', 'Professional');
        case 'TEACHER':
          return porIdioma('Professor', 'Teacher');
        default:
          return porIdioma('Não definido', 'Not set');
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
