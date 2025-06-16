// hooks/useAuth.ts (versão com proteção SSR)
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const { data: session, status } = useSession();
  const { setUser, setLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (status === 'loading') {
      setLoading(true);
    } else {
      setLoading(false);

      if (session?.user) {
        setUser({
          id: session.user.id,
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          email: session.user.email!,
          image: session.user.image,
          role: session.user.role,
          onboardingCompleted: session.user.onboardingCompleted,
          userType: session.user.userType,
          city: session.user.city,
          state: session.user.state,
          country: session.user.country,
          favoriteComposerId: session.user.favoriteComposerId,
          favoriteEpochId: session.user.favoriteEpochId,
          experienceLevel: session.user.experienceLevel,
          practiceTimePerWeek: session.user.practiceTimePerWeek,
          profilePublic: session.user.profilePublic,
          showLocation: session.user.showLocation,
        });
      } else {
        setUser(null);
      }
    }
  }, [session, status, setUser, setLoading, mounted]);

  // Retorna valores seguros para SSR
  if (!mounted) {
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
    };
  }

  return {
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
  };
}
