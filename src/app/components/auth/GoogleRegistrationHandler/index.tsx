// components/auth/GoogleRegistrationHandler.tsx
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import {
  useRegisterModal,
  useOnboardingModal,
  usePromptModal,
} from '@/app/stores/authStore';

/**
 * Componente para detectar e processar retorno de registro Google
 * Deve ser usado na página principal (layout ou página inicial)
 */
const GoogleRegistrationHandler: React.FC = () => {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const { open: openRegisterModal } = useRegisterModal();
  const { open: openOnboardingModal } = useOnboardingModal();
  const { open: openPromptModal } = usePromptModal();

  useEffect(() => {
    // Só executar no cliente
    if (typeof window === 'undefined') return;

    // Aguardar a sessão carregar
    if (status === 'loading') return;

    // Verificar parâmetros da URL
    const isGoogleRegister = searchParams.get('google-register') === 'true';

    // Verificar flags no sessionStorage
    const googleRegisterFlag = sessionStorage.getItem(
      'google-register-pending'
    );
    const googleRegisterTimestamp = sessionStorage.getItem(
      'google-register-timestamp'
    );

    if ((isGoogleRegister || googleRegisterFlag === 'true') && session?.user) {
      // Verificar se é realmente um registro novo baseado no timestamp
      const now = Date.now();
      const timestamp = googleRegisterTimestamp
        ? parseInt(googleRegisterTimestamp)
        : 0;
      const timeDiff = now - timestamp;

      // Considerar como registro se:
      // 1. Tem timestamp e foi nos últimos 10 minutos
      // 2. OU se veio da URL com parâmetro google-register=true
      const isRecentRegistration = timestamp > 0 && timeDiff < 10 * 60 * 1000; // 10 minutos

      if (isRecentRegistration || isGoogleRegister) {
        // Salvar dados para o modal (se não existirem)
        const existingEmail = sessionStorage.getItem('google-register-email');
        const existingName = sessionStorage.getItem('google-register-name');

        if (!existingEmail) {
          sessionStorage.setItem(
            'google-register-email',
            session.user.email || ''
          );
        }
        if (!existingName) {
          sessionStorage.setItem(
            'google-register-name',
            session.user.firstName ||
              session.user.name?.split(' ')[0] ||
              'Usuário'
          );
        }

        // Limpar parâmetro da URL se necessário
        if (isGoogleRegister) {
          const url = new URL(window.location.href);
          url.searchParams.delete('google-register');
          window.history.replaceState({}, '', url.toString());
        }

        // Abrir modal de registro com delay para garantir que tudo carregou
        setTimeout(() => {
          openRegisterModal();
        }, 800);
      } else {
        // Não é um registro novo - limpar flags antigas
        sessionStorage.removeItem('google-register-pending');
        sessionStorage.removeItem('google-register-timestamp');
        sessionStorage.removeItem('google-register-email');
        sessionStorage.removeItem('google-register-name');

        // Se o usuário não completou onboarding, mostrar modal de onboarding
        if (session.user && !session.user.onboardingCompleted) {
          setTimeout(() => {
            openOnboardingModal();
          }, 500);
        }
      }
    } else if (session?.user && !session.user.onboardingCompleted) {
      // Usuário logado normalmente mas sem onboarding completo
      setTimeout(() => {
        openPromptModal();
      }, 500);
    }
  }, [session, status, searchParams, openRegisterModal, openOnboardingModal]);

  // Componente não renderiza nada visualmente
  return null;
};

export default GoogleRegistrationHandler;
