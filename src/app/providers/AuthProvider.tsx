// providers/AuthProvider.tsx - VERSÃO OTIMIZADA com renderização condicional
'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';
import dynamic from 'next/dynamic';

// Import modals
import LoginModal from '@/app/components/auth/LoginModal';
import RegisterModal from '@/app/components/auth/RegisterModal';
import OnboardingModal from '@/app/components/auth/OnboardingModal';

// Import hooks and stores
import { useAuth } from '@/app/hooks/useAuth';
import { useOnboardingModal, usePromptModal } from '../stores/authStore';
import { useHydration } from '../hooks/useHydration';
import { useUserStore } from '../hooks/userStore';
import { useOnboardingPersistence } from '../hooks/useOnboardingPersistence';
import OnboardingPrompt from '../components/auth/onboarding/OnboardingPrompt';

// Dynamic import do GoogleRegistrationHandler sem SSR
const GoogleRegistrationHandler = dynamic(
  () => import('../components/auth/GoogleRegistrationHandler'),
  {
    ssr: false,
    loading: () => null,
  }
);

interface AuthProviderProps {
  children: React.ReactNode;
}

// ================================
// COMPONENTES INTERNOS OTIMIZADOS
// ================================

// Gerenciador de onboarding OTIMIZADO - só roda se necessário
const OnboardingManager: React.FC<{ shouldRender: boolean }> = ({
  shouldRender,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const {
    open: openOnboarding,
    isOpen: isOnboardingOpen,
    hasProgress,
  } = useOnboardingModal();
  const { open: openPromptModal, isOpen: isPromptModalOpen } = usePromptModal();
  const { isHydrated } = useHydration();
  const [hasCheckedProgress, setHasCheckedProgress] = useState(false);

  // Hook de persistência só se necessário
  useOnboardingPersistence({
    autoSaveDelay: 800,
    enableLocalBackup: shouldRender,
    showSaveIndicator: shouldRender,
  });

  const shouldShowOnboarding = useCallback(() => {
    if (
      !shouldRender ||
      !isHydrated ||
      isLoading ||
      !isAuthenticated ||
      !user
    ) {
      return false;
    }

    if (user.onboardingCompleted) {
      return false;
    }

    if (isOnboardingOpen) {
      return false;
    }

    return true;
  }, [
    shouldRender,
    isHydrated,
    isLoading,
    isAuthenticated,
    user,
    isOnboardingOpen,
  ]);

  useEffect(() => {
    if (!shouldRender) return;

    const checkAndOpenOnboarding = () => {
      if (hasProgress) {
        if (!isPromptModalOpen && !isLoading) {
          openPromptModal();
        }
      }
      setHasCheckedProgress(true);
    };

    const timer = setTimeout(checkAndOpenOnboarding, 100);
    return () => clearTimeout(timer);
  }, [
    shouldRender,
    shouldShowOnboarding,
    hasProgress,
    openOnboarding,
    user?.id,
    hasCheckedProgress,
  ]);

  useEffect(() => {
    if (shouldRender) {
      setHasCheckedProgress(false);
    }
  }, [user?.id, shouldRender]);

  return null;
};

// Inicializador dos stores OTIMIZADO
const StoreManager: React.FC = () => {
  const setUserStoreHydrated = useUserStore((state) => state.setHydrated);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;

    const initializeStores = async () => {
      try {
        setUserStoreHydrated(true);
        await new Promise((resolve) => setTimeout(resolve, 50));
        setIsInitialized(true);
      } catch (error) {
        console.error('Erro na hidratação dos stores:', error);
      }
    };

    initializeStores();
  }, [setUserStoreHydrated, isInitialized]);

  return null;
};

// Componente para lidar com casos de erro de persistência
const PersistenceErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      if (
        error.message.includes('localStorage') ||
        error.message.includes('sessionStorage') ||
        error.message.includes('quota')
      ) {
        console.warn('Erro de storage detectado, usando fallback em memória');
        setHasError(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-accent-amber bg-opacity-20 border border-accent-amber rounded-lg p-3 max-w-sm">
        <p className="text-sm text-accent-amber">
          ⚠️ Armazenamento limitado. Dados serão salvos temporariamente.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

// ================================
// COMPONENTE PRINCIPAL OTIMIZADO
// ================================

// Conteúdo que depende de hidratação OTIMIZADO
const HydratedContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { isHydrated } = useHydration();

  // 🚀 OTIMIZAÇÃO: Determinar quais modais renderizar baseado no estado
  const shouldRenderAuthModals = !isAuthenticated;
  const shouldRenderOnboardingModals =
    isAuthenticated && !user?.onboardingCompleted;
  const shouldRenderGoogleHandler = true; // Sempre necessário para detectar retornos

  console.log('🎯 AuthProvider - Renderização condicional:', {
    isAuthenticated,
    onboardingCompleted: user?.onboardingCompleted,
    shouldRenderAuthModals,
    shouldRenderOnboardingModals,
    isHydrated,
  });

  if (!isHydrated) {
    // Renderizar apenas estrutura básica durante hidratação
    return (
      <PersistenceErrorBoundary>
        <StoreManager />
        {children}
      </PersistenceErrorBoundary>
    );
  }

  return (
    <PersistenceErrorBoundary>
      {/* Gerenciadores sempre necessários */}
      <StoreManager />

      {/* 🚀 OTIMIZAÇÃO: Modais de autenticação só se não logado */}
      {shouldRenderAuthModals && (
        <>
          <LoginModal />
          <RegisterModal />
        </>
      )}

      {/* 🚀 OTIMIZAÇÃO: Modais de onboarding só se logado e sem onboarding */}
      {shouldRenderOnboardingModals && (
        <>
          <OnboardingModal />
          <OnboardingPrompt />
          <OnboardingManager shouldRender={true} />
        </>
      )}

      {/* GoogleRegistrationHandler sempre presente para detectar retornos */}
      {shouldRenderGoogleHandler && (
        <Suspense fallback={null}>
          <GoogleRegistrationHandler />
        </Suspense>
      )}

      {/* Conteúdo da aplicação */}
      {children}
    </PersistenceErrorBoundary>
  );
};

// Provider principal OTIMIZADO
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <SessionProvider
      refetchWhenOffline={false}
      // refetchInterval={10 * 60} // 10 minutos ao invés de 5
    >
      <HydratedContent>{children}</HydratedContent>
    </SessionProvider>
  );
};

export default AuthProvider;
