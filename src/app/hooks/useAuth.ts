// hooks/useAuth.ts (versão atualizada com novos campos)
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useUserStore } from './userStore';

export function useAuth() {
  const { data: session, status } = useSession();

  const {
    user,
    isLoading: userLoading,
    isAuthenticated,
    setUser,
    setLoading,
    updateUser,
    logout: userLogout,
  } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sincronizar com a sessão do NextAuth apenas na inicialização ou quando a sessão muda
  useEffect(() => {
    if (!mounted) return;

    if (status === 'loading') {
      setLoading(true);
    } else {
      setLoading(false);

      if (session?.user) {
        // Só atualiza se o usuário mudou (para evitar loops)
        if (!user || user.id !== session.user.id) {
          setUser({
            id: session.user.id,
            firstName: session.user.firstName,
            lastName: session.user.lastName,
            email: session.user.email!,
            image: session.user.image,
            bio: session.user.bio,
            role: session.user.role,
            onboardingCompleted: session.user.onboardingCompleted,
            userType: session.user.userType,

            // 🆕 CAMPOS DE LOCALIZAÇÃO
            city: session.user.city,
            state: session.user.state,
            country: session.user.country,

            // 🆕 CAMPOS DE TELEFONE
            phone: session.user.phone,
            phoneCountryCode: session.user.phoneCountryCode,
            phoneNumber: session.user.phoneNumber,

            // Campos existentes
            favoriteComposerId: session.user.favoriteComposerId,
            favoriteEpochId: session.user.favoriteEpochId,
            experienceLevel: session.user.experienceLevel,
            practiceTimePerWeek: session.user.practiceTimePerWeek,
            profilePublic: session.user.profilePublic,
            showLocation: session.user.showLocation,
            isStudent: session.user.isStudent,
            isTeacher: session.user.isTeacher,
            studentInviteStatus: session.user.studentInviteStatus,
          });
        }
      } else {
        setUser(null);
      }
    }
  }, [session, status, setUser, setLoading, mounted, user?.id]);

  // Logout function que limpa tanto a sessão quanto o store
  const logout = async () => {
    userLogout();
    // Aqui você pode adicionar a lógica de logout do NextAuth se necessário
  };

  // Retorna valores seguros para SSR
  if (!mounted) {
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      updateUser: () => {},
      logout: () => {},
    };
  }

  // Agora retorna do store em vez da sessão
  return {
    user,
    isLoading: userLoading || status === 'loading',
    isAuthenticated,
    updateUser,
    logout,
  };
}
