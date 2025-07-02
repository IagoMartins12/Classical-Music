// providers/AuthProvider.tsx - Versão com persistência otimizada
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

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

interface AuthProviderProps {
  children: React.ReactNode;
}

// ================================
// COMPONENTES INTERNOS
// ================================

// Gerenciador de onboarding com persistência
const OnboardingManager: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const {
    open: openOnboarding,
    isOpen: isOnboardingOpen,
    hasProgress,
  } = useOnboardingModal();
  const { open: openPromptModal, isOpen: isPromptModalOpen } = usePromptModal();
  const { isHydrated } = useHydration();
  const [hasCheckedProgress, setHasCheckedProgress] = useState(false);

  // Hook de persistência para auto-restore
  useOnboardingPersistence({
    autoSaveDelay: 800, // Save mais rápido para melhor UX
    enableLocalBackup: true,
    showSaveIndicator: true,
  });

  // Função para verificar se deve mostrar onboarding
  const shouldShowOnboarding = useCallback(() => {
    if (!isHydrated || isLoading || !isAuthenticated || !user) {
      return false;
    }

    // Usuário já completou onboarding
    if (user.onboardingCompleted) {
      return false;
    }

    // Modal já está aberto
    if (isOnboardingOpen) {
      return false;
    }

    return true;
  }, [isHydrated, isLoading, isAuthenticated, user, isOnboardingOpen]);

  // Verificar progresso salvo e decidir se abre modal
  useEffect(() => {
    console.log('isloading', isLoading);
    const checkAndOpenOnboarding = () => {
      if (hasProgress) {
        // Tem progresso salvo, perguntar se quer continuar
        console.log('🔄 Progresso do onboarding encontrado, abrindo modal...');
        if (!isPromptModalOpen && !isLoading) {
          openPromptModal();
        }
      } else {
        // Não tem progresso, iniciar novo onboarding
        console.log('🚀 Iniciando novo onboarding para usuário:', user?.id);

        console.log('PROPS', {
          isAuthenticated,
          hasCheckedProgress,
          isLoading,
        });
        if (!isAuthenticated) return;
        // openOnboarding();
      }

      setHasCheckedProgress(true);
    };

    // Pequeno delay para garantir que tudo carregou
    const timer = setTimeout(checkAndOpenOnboarding, 100);
    return () => clearTimeout(timer);
  }, [
    shouldShowOnboarding,
    hasProgress,
    openOnboarding,
    user?.id,
    hasCheckedProgress,
  ]);

  // Reset check quando usuário muda
  useEffect(() => {
    setHasCheckedProgress(false);
  }, [user?.id]);

  return null;
};

// Inicializador dos stores com hidratação otimizada
const StoreManager: React.FC = () => {
  const setUserStoreHydrated = useUserStore((state) => state.setHydrated);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;

    const initializeStores = async () => {
      try {
        // Hidratação sequencial para evitar conflitos
        setUserStoreHydrated(true);

        // Pequeno delay para garantir que stores estejam prontos
        await new Promise((resolve) => setTimeout(resolve, 50));

        setIsInitialized(true);

        if (process.env.NODE_ENV === 'development') {
          console.log('💧 Stores hidratados com sucesso');
        }
      } catch (error) {
        console.error('Erro na hidratação dos stores:', error);
      }
    };

    initializeStores();
  }, [setUserStoreHydrated, isInitialized]);

  return null;
};

// Monitor de sincronização com performance melhorada
const AuthMonitor: React.FC = () => {
  const { user: sessionUser } = useAuth();
  const { user: storeUser } = useUserStore();
  const { hasProgress } = useOnboardingModal();

  const { getProgressSummary } = useOnboardingPersistence();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const logAuthState = () => {
      if (sessionUser && storeUser) {
        const syncData = {
          session: {
            id: sessionUser.id,
            onboardingCompleted: sessionUser.onboardingCompleted,
            userType: sessionUser.userType,
          },
          store: {
            id: storeUser.id,
            onboardingCompleted: storeUser.onboardingCompleted,
            userType: storeUser.userType,
          },
          synced: {
            id: sessionUser.id === storeUser.id,
            onboarding:
              sessionUser.onboardingCompleted === storeUser.onboardingCompleted,
          },
          onboardingProgress: hasProgress
            ? getProgressSummary()
            : 'Nenhum progresso',
        };
      }
    };

    // Debounce para evitar logs excessivos
    const timer = setTimeout(logAuthState, 1000);
    return () => clearTimeout(timer);
  }, [sessionUser, storeUser, hasProgress, getProgressSummary]);

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
// COMPONENTE PRINCIPAL
// ================================

// Conteúdo que depende de hidratação
const HydratedContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <PersistenceErrorBoundary>
      {/* Gerenciadores */}
      <StoreManager />
      {process.env.NODE_ENV === 'development' && <AuthMonitor />}

      {/* Modais de autenticação */}
      <LoginModal />
      <RegisterModal />
      <OnboardingModal />

      {/* Lógica de onboarding com persistência */}
      <OnboardingManager />

      <OnboardingPrompt />
      {/* Conteúdo da aplicação */}
      {children}
    </PersistenceErrorBoundary>
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
      {/* Notificações toast otimizadas */}
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
