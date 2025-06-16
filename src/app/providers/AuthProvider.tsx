// providers/AuthProvider.tsx (versão final otimizada)
'use client';

import React, { useEffect, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

// Import modals
import LoginModal from '@/app/components/auth/LoginModal';
import RegisterModal from '@/app/components/auth/RegisterModal';
import OnboardingModal from '@/app/components/auth/OnboardingModal';

// Import hooks and stores
import { useAuth } from '@/app/hooks/useAuth';
import { useOnboardingModal } from '../stores/authStore';
import { useHydration } from '../hooks/useHydration';
import { useUserStore } from '../hooks/userStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

// ================================
// COMPONENTES INTERNOS
// ================================

// Gerenciador de onboarding
const OnboardingManager: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { open: openOnboarding, isOpen: isOnboardingOpen } =
    useOnboardingModal();
  const { isHydrated } = useHydration();

  useEffect(() => {
    if (
      isHydrated &&
      !isLoading &&
      isAuthenticated &&
      user &&
      !user.onboardingCompleted &&
      !isOnboardingOpen
    ) {
      console.log('🚀 Iniciando onboarding para usuário:', user.id);
    }
  }, [
    isHydrated,
    isLoading,
    isAuthenticated,
    user,
    openOnboarding,
    isOnboardingOpen,
  ]);

  return null;
};

// Inicializador dos stores
const StoreManager: React.FC = () => {
  const setUserStoreHydrated = useUserStore((state) => state.setHydrated);

  useEffect(() => {
    // Hidratação dos stores
    setUserStoreHydrated(true);

    if (process.env.NODE_ENV === 'development') {
      console.log('💧 UserStore hidratado com sucesso');
    }
  }, [setUserStoreHydrated]);

  return null;
};

// Monitor de sincronização (apenas em desenvolvimento)
const AuthMonitor: React.FC = () => {
  const { user: sessionUser } = useAuth();
  const { user: storeUser } = useUserStore();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && sessionUser && storeUser) {
      const syncData = {
        session: {
          id: sessionUser.id,
          image: sessionUser.image,
          name: `${sessionUser.firstName} ${sessionUser.lastName}`.trim(),
        },
        store: {
          id: storeUser.id,
          image: storeUser.image,
          name: `${storeUser.firstName} ${storeUser.lastName}`.trim(),
        },
        synced: {
          id: sessionUser.id === storeUser.id,
          image: sessionUser.image === storeUser.image,
        },
      };

      console.log('🔄 Auth Sync Monitor:', syncData);
    }
  }, [sessionUser, storeUser]);

  return null;
};

// ================================
// COMPONENTE PRINCIPAL
// ================================

// Conteúdo que depende de hidratação
const HydratedContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mounted, setMounted] = useState(false);
  const { isHydrated, isClientSide } = useHydration();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Gerenciadores */}
      <StoreManager />
      {process.env.NODE_ENV === 'development' && <AuthMonitor />}

      {/* Modais de autenticação */}
      <LoginModal />
      <RegisterModal />
      <OnboardingModal />

      {/* Lógica de onboarding */}
      <OnboardingManager />

      {/* Conteúdo da aplicação */}
      {children}
    </>
  );
};

// Provider principal
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // 5 minutos
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      {/* Notificações toast */}
      <Toaster
        position="top-right"
        containerClassName="toast-container"
        toastOptions={{
          duration: 4000,
          className: 'toast-item',
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            backdropFilter: 'blur(8px)',
            maxWidth: '400px',
          },

          success: {
            iconTheme: {
              primary: 'var(--accent-green)',
              secondary: 'white',
            },
            style: {
              border: '1px solid var(--accent-green)',
              background:
                'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(34, 197, 94, 0.05) 100%)',
            },
          },

          error: {
            iconTheme: {
              primary: 'var(--accent-red)',
              secondary: 'white',
            },
            style: {
              border: '1px solid var(--accent-red)',
              background:
                'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(239, 68, 68, 0.05) 100%)',
            },
          },

          loading: {
            iconTheme: {
              primary: 'var(--brand-primary)',
              secondary: 'white',
            },
            style: {
              border: '1px solid var(--brand-primary)',
              background:
                'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(99, 102, 241, 0.05) 100%)',
            },
          },
        }}
      />

      <HydratedContent>{children}</HydratedContent>
    </SessionProvider>
  );
};

export default AuthProvider;
