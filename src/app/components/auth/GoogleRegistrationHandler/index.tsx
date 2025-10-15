// components/auth/GoogleRegistrationHandler.tsx - VERSÃO CORRIGIDA sem erros
'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useOnboardingModal, usePromptModal } from '@/app/stores/authStore';
import { toast } from 'react-hot-toast';

/**
 * Componente para detectar novos usuários Google e abrir onboarding
 * CORRIGIDO: Sem erros TypeScript, evita toasts duplicados
 */
const GoogleRegistrationHandler: React.FC = () => {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const { open: openOnboardingModal } = useOnboardingModal();
  const { open: openPromptModal } = usePromptModal();

  // Refs para persistir estado entre renders
  const processedUserIds = useRef(new Set<string>());
  const hasProcessedNewUser = useRef(false);

  useEffect(() => {
    // Só executar no cliente
    if (typeof window === 'undefined') return;

    // Aguardar a sessão carregar
    if (status === 'loading') return;

    // Verificação de erro primeiro
    const urlError = searchParams.get('error');
    if (urlError) {
      console.log('Erro detectado na URL:', urlError);
      // Limpar URL de erro
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      url.searchParams.delete('error_description');
      window.history.replaceState({}, '', url.toString());
      return;
    }

    // Verificar se já processamos este usuário específico
    const userId = session?.user?.id;
    if (!userId) return;

    // Se já processamos este usuário específico, não fazer nada
    if (processedUserIds.current.has(userId)) {
      console.log('Usuário já foi processado:', userId);
      return;
    }

    // Verificar no sessionStorage também (backup)
    const sessionKey = `google-welcome-shown-${userId}`;
    if (sessionStorage.getItem(sessionKey) === 'true') {
      console.log('Welcome já foi mostrado para este usuário (sessionStorage)');
      processedUserIds.current.add(userId);
      return;
    }

    // Detectar através da flag isNewGoogleUser na sessão
    const isNewGoogleUser = (session?.user as any)?.isNewGoogleUser;

    // OU através dos parâmetros da URL (backup)
    const urlNewUser = searchParams.get('new-user') === 'true';
    const urlGoogleRegister = searchParams.get('google-register') === 'true';

    if (session?.user && (isNewGoogleUser || urlNewUser || urlGoogleRegister)) {
      console.log('Novo usuário Google detectado!', {
        userId,
        isNewGoogleUser,
        urlNewUser,
        urlGoogleRegister,
        userName: session.user.firstName || session.user.name,
      });

      // Marcar como processado ANTES de fazer ações
      processedUserIds.current.add(userId);
      sessionStorage.setItem(sessionKey, 'true');
      hasProcessedNewUser.current = true;

      // Limpar parâmetros da URL
      const url = new URL(window.location.href);
      url.searchParams.delete('google-register');
      url.searchParams.delete('new-user');
      window.history.replaceState({}, '', url.toString());

      // Mostrar boas-vindas (apenas uma vez)
      const userName =
        session.user.firstName || session.user.name?.split(' ')[0] || 'Usuário';

      // Toast com ID único para evitar duplicação
      toast.success(
        `Bem-vindo(a), ${userName}! Sua conta foi criada com sucesso.`,
        {
          id: `welcome-${userId}`, // ID único para evitar duplicação
          duration: 4000,
          icon: '🎉',
        }
      );

      // Abrir modal de onboarding
      setTimeout(() => {
        console.log('Abrindo modal de onboarding para novo usuário Google');
        openOnboardingModal();
      }, 1500); // Delay para mostrar o toast
    } else if (
      session?.user &&
      !session.user.onboardingCompleted &&
      !hasProcessedNewUser.current
    ) {
      // Usuário existente sem onboarding completo
      console.log('Usuário existente sem onboarding:', userId);
      setTimeout(() => {
        openPromptModal();
      }, 500);
    }
  }, [session, status, searchParams, openOnboardingModal, openPromptModal]);

  // Reset apenas quando o usuário realmente muda (não a cada render)
  useEffect(() => {
    const currentUserId = session?.user?.id;
    if (currentUserId && !processedUserIds.current.has(currentUserId)) {
      hasProcessedNewUser.current = false;
    }
  }, [session?.user?.id]); // Apenas quando o ID do usuário muda

  // Listener para mudanças na URL (cleanup)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUrlChange = () => {
      const url = new URL(window.location.href);
      const error = url.searchParams.get('error');

      if (error) {
        console.log('Erro detectado via mudança de URL:', error);
        // Limpar parâmetros de erro
        url.searchParams.delete('error');
        url.searchParams.delete('error_description');
        window.history.replaceState({}, '', url.toString());
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Componente não renderiza nada visualmente
  return null;
};

export default GoogleRegistrationHandler;
