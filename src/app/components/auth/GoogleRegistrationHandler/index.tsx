// components/auth/GoogleRegistrationHandler.tsx - VERSÃO CORRIGIDA
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
 * CORRIGIDO: Só processa como sucesso se realmente houve sucesso
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

    // 🔧 VERIFICAÇÃO DE ERRO PRIMEIRO - Se há erro na URL, não processar como sucesso
    const urlError = searchParams.get('error');
    if (urlError) {
      console.log(
        '❌ Erro detectado na URL, limpando flags de sucesso:',
        urlError
      );

      // Limpar todas as flags de registro Google em caso de erro
      sessionStorage.removeItem('google-register-pending');
      sessionStorage.removeItem('google-register-timestamp');
      sessionStorage.removeItem('google-register-email');
      sessionStorage.removeItem('google-register-name');

      // Não processar como sucesso
      return;
    }

    // Verificar parâmetros da URL para sucesso
    const isGoogleRegister = searchParams.get('google-register') === 'true';

    // Verificar flags no sessionStorage
    const googleRegisterFlag = sessionStorage.getItem(
      'google-register-pending'
    );
    const googleRegisterTimestamp = sessionStorage.getItem(
      'google-register-timestamp'
    );

    // 🔧 LÓGICA CORRIGIDA: Só processar como sucesso se:
    // 1. Há indicação de registro Google E
    // 2. Há uma sessão válida E
    // 3. NÃO há erro na URL
    if (
      (isGoogleRegister || googleRegisterFlag === 'true') &&
      session?.user &&
      !urlError
    ) {
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
        console.log('✅ Registro Google bem-sucedido detectado');

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
        // Timestamp muito antigo - limpar flags
        console.log('🧹 Limpando flags antigas de registro Google');
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
    } else if (
      !session?.user &&
      (googleRegisterFlag === 'true' || isGoogleRegister)
    ) {
      // 🆕 NOVO: Se há flags de registro mas não há sessão, significa que houve erro
      console.log(
        '❌ Flags de registro detectadas mas sem sessão - houve erro'
      );

      // Limpar flags pois não houve sucesso
      sessionStorage.removeItem('google-register-pending');
      sessionStorage.removeItem('google-register-timestamp');
      sessionStorage.removeItem('google-register-email');
      sessionStorage.removeItem('google-register-name');
    }
  }, [
    session,
    status,
    searchParams,
    openRegisterModal,
    openOnboardingModal,
    openPromptModal,
  ]);

  // 🆕 NOVO: Listener para detectar mudanças na URL (erros que podem vir depois)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUrlChange = () => {
      const url = new URL(window.location.href);
      const error = url.searchParams.get('error');

      if (error) {
        console.log('❌ Erro detectado via mudança de URL:', error);

        // Limpar flags de registro em caso de erro
        sessionStorage.removeItem('google-register-pending');
        sessionStorage.removeItem('google-register-timestamp');
        sessionStorage.removeItem('google-register-email');
        sessionStorage.removeItem('google-register-name');
      }
    };

    // Escutar mudanças na URL (popstate)
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Componente não renderiza nada visualmente
  return null;
};

export default GoogleRegistrationHandler;
