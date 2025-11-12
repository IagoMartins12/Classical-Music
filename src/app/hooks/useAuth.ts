// hooks/useAuth.ts
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
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

  // ✅ Use ref para armazenar o último ID processado
  const lastProcessedSessionId = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ CORREÇÃO: Remova setUser, setLoading e user?.id das dependências
  useEffect(() => {
    if (!mounted) return;

    if (status === 'loading') {
      setLoading(true);
      return;
    }

    setLoading(false);

    if (session?.user) {
      // ✅ Só atualiza se o ID da sessão realmente mudou
      if (lastProcessedSessionId.current !== session.user.id) {
        lastProcessedSessionId.current = session.user.id;

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
          city: session.user.city,
          state: session.user.state,
          country: session.user.country,
          phone: session.user.phone,
          phoneCountryCode: session.user.phoneCountryCode,
          phoneNumber: session.user.phoneNumber,
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
    } else if (lastProcessedSessionId.current !== null) {
      // ✅ Limpa o usuário apenas se havia uma sessão antes
      lastProcessedSessionId.current = null;
      setUser(null);
    }
  }, [session, status, mounted]); // ✅ Apenas estas dependências

  const logout = async () => {
    lastProcessedSessionId.current = null;
    userLogout();
  };

  if (!mounted) {
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      updateUser: () => {},
      logout: () => {},
    };
  }

  return {
    user,
    isLoading: userLoading || status === 'loading',
    isAuthenticated,
    updateUser,
    logout,
  };
}
