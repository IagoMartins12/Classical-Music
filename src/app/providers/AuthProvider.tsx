// providers/AuthProvider.tsx (versão apenas cliente)
'use client';

import React, { useEffect, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

// Import modals
import LoginModal from '@/app/components/auth/LoginModal';
import RegisterModal from '@/app/components/auth/RegisterModal';
import OnboardingModal from '@/app/components/auth/OnboardingModal';

// Import the auth hook and onboarding logic
import { useAuth } from '@/app/hooks/useAuth';
import { useAuthStore, useOnboardingModal } from '../stores/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

// Component to handle onboarding logic
const OnboardingChecker: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { open: openOnboarding, isOpen: isOnboardingOpen } =
    useOnboardingModal();

  useEffect(() => {
    // Check if user needs onboarding after authentication is settled
    if (
      !isLoading &&
      isAuthenticated &&
      user &&
      !user.onboardingCompleted &&
      !isOnboardingOpen
    ) {
      // Small delay to ensure modals don't conflict
      const timer = setTimeout(() => {
        openOnboarding();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, user, openOnboarding, isOnboardingOpen]);

  return null;
};

// Hydration component
const StoreHydration: React.FC = () => {
  const setHydrated = useAuthStore((state) => state.setHydrated);

  useEffect(() => {
    setHydrated(true);
  }, [setHydrated]);

  return null;
};

// Inner component that uses auth hooks
const AuthContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Store Hydration */}
      <StoreHydration />

      {/* Authentication Modals */}
      <LoginModal />
      <RegisterModal />
      <OnboardingModal />

      {/* Onboarding Logic */}
      <OnboardingChecker />

      {/* App Content */}
      {children}
    </>
  );
};

// Main AuthProvider component
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <SessionProvider>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: {
              primary: 'var(--accent-green)',
              secondary: 'var(--text-inverse)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--accent-red)',
              secondary: 'var(--text-inverse)',
            },
          },
        }}
      />

      <AuthContent>{children}</AuthContent>
    </SessionProvider>
  );
};

export default AuthProvider;
