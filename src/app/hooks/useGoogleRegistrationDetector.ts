// hooks/useGoogleRegistrationDetector.ts
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useRegisterModal } from '@/app/stores/authStore';

/**
 * Hook para detectar quando um usuário volta de um registro Google
 * e automaticamente abrir o modal de confirmação
 */
export const useGoogleRegistrationDetector = () => {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const { open: openRegisterModal } = useRegisterModal();

  useEffect(() => {
    // Só executar no cliente
    if (typeof window === 'undefined') return;

    // Aguardar a sessão carregar
    if (status === 'loading') return;

    // Verificar se há parâmetro na URL indicando registro Google
    const isGoogleRegister = searchParams.get('google-register') === 'true';

    // Verificar se há flag no sessionStorage
    const googleRegisterFlag = sessionStorage.getItem(
      'google-register-pending'
    );

    if ((isGoogleRegister || googleRegisterFlag === 'true') && session?.user) {
      console.log('🔍 Detectando retorno de registro Google...');

      // Verificar se é um usuário realmente novo (conta criada recentemente)
      const timestamp = sessionStorage.getItem('google-register-timestamp');
      const now = Date.now();

      // Se o timestamp existe e foi recente (menos de 5 minutos), considerar como registro
      if (timestamp && now - parseInt(timestamp) < 5 * 60 * 1000) {
        console.log(
          '✅ Confirmado: usuário registrado via Google recentemente'
        );

        // Salvar dados do usuário para o modal
        sessionStorage.setItem(
          'google-register-email',
          session.user.email || ''
        );
        sessionStorage.setItem(
          'google-register-name',
          session.user.firstName || session.user.name || 'Usuário'
        );

        // Limpar URL se necessário
        if (isGoogleRegister) {
          const url = new URL(window.location.href);
          url.searchParams.delete('google-register');
          window.history.replaceState({}, '', url.toString());
        }

        // Abrir modal de registro (que vai detectar as flags e mostrar a confirmação)
        setTimeout(() => {
          openRegisterModal();
        }, 500); // Pequeno delay para garantir que tudo carregou
      } else {
        // Timestamp muito antigo ou não existe - provável login, não registro
        console.log(
          'ℹ️ Timestamp antigo ou inexistente - provavelmente login, não registro'
        );

        // Limpar flags antigas
        sessionStorage.removeItem('google-register-pending');
        sessionStorage.removeItem('google-register-timestamp');
        sessionStorage.removeItem('google-register-email');
        sessionStorage.removeItem('google-register-name');
      }
    }
  }, [session, status, searchParams, openRegisterModal]);

  // Função para marcar que o usuário vai se registrar com Google
  // (será chamada antes do redirect)
  const markGoogleRegistrationStart = (userEmail?: string) => {
    if (typeof window === 'undefined') return;

    sessionStorage.setItem('google-register-pending', 'true');
    sessionStorage.setItem('google-register-timestamp', Date.now().toString());

    if (userEmail) {
      sessionStorage.setItem('google-register-email', userEmail);
    }

    console.log('📝 Marcado início de registro Google');
  };

  // Função para limpar flags (caso necessário)
  const clearGoogleRegistrationFlags = () => {
    if (typeof window === 'undefined') return;

    sessionStorage.removeItem('google-register-pending');
    sessionStorage.removeItem('google-register-timestamp');
    sessionStorage.removeItem('google-register-email');
    sessionStorage.removeItem('google-register-name');

    console.log('🧹 Flags de registro Google limpas');
  };

  return {
    markGoogleRegistrationStart,
    clearGoogleRegistrationFlags,
  };
};
