// components/auth/GoogleRegistrationHandler — abre as boas-vindas de quem acabou
// de criar a conta pelo Google
'use client';

import { useEffect, useRef } from 'react';
import { useSession } from '@/app/libs/session';
import { useSearchParams } from 'next/navigation';
import { useOnboardingModal, usePromptModal } from '@/app/stores/authStore';

/**
 * A API marca a volta de uma conta criada agora com `?new-user=true` — venha a
 * pessoa do "Criar conta" ou do "Entrar com Google" (antes só o cadastro
 * marcava, por `?google-register=true`, que continua aceito). Com a marca, as
 * boas-vindas abrem na hora; sem ela, quem ainda não terminou o perfil vê o
 * convite curto (`PromptModal`).
 */
const GoogleRegistrationHandler: React.FC = () => {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const { open: openOnboardingModal } = useOnboardingModal();
  const { open: openPromptModal } = usePromptModal();
  const tratado = useRef<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    const userId = session?.user?.id;
    if (!userId || tratado.current === userId) return;

    const contaNova =
      searchParams.get('new-user') === 'true' ||
      searchParams.get('google-register') === 'true';

    if (contaNova) {
      tratado.current = userId;
      const url = new URL(window.location.href);
      url.searchParams.delete('new-user');
      url.searchParams.delete('google-register');
      window.history.replaceState({}, '', url.toString());
      openOnboardingModal();
      return;
    }

    if (!session.user.onboardingCompleted) {
      tratado.current = userId;
      // Uma vez por sessão do navegador: o convite não persegue a pessoa a
      // cada página.
      const chave = `convite-perfil-${userId}`;
      if (sessionStorage.getItem(chave)) return;
      sessionStorage.setItem(chave, '1');
      openPromptModal();
    }
  }, [session, status, searchParams, openOnboardingModal, openPromptModal]);

  return null;
};

export default GoogleRegistrationHandler;
