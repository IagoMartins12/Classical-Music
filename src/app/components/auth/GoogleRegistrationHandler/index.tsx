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
 * boas-vindas abrem na hora; sem ela, o primeiro login de quem ainda não
 * terminou o perfil também as abre, e os seguintes mostram o convite curto
 * (`PromptModal`).
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
      try {
        localStorage.setItem(`boas-vindas-abertas-${userId}`, '1');
      } catch {
        // Sem armazenamento: abre assim mesmo.
      }
      openOnboardingModal();
      return;
    }

    if (!session.user.onboardingCompleted) {
      tratado.current = userId;
      // O primeiro login de quem ainda não respondeu (cadastro pelo site,
      // depois de confirmar o e-mail, ou pelo Google) abre as boas-vindas
      // inteiras, uma vez por navegador. Depois disso, quem pulou vê só o
      // convite curto, uma vez por sessão: nada persegue a pessoa.
      try {
        const vistas = `boas-vindas-abertas-${userId}`;
        if (!localStorage.getItem(vistas)) {
          localStorage.setItem(vistas, '1');
          openOnboardingModal();
          return;
        }
        const chave = `convite-perfil-${userId}`;
        if (sessionStorage.getItem(chave)) return;
        sessionStorage.setItem(chave, '1');
      } catch {
        // Sem armazenamento (modo privado): o convite curto, sem lembrar.
      }
      openPromptModal();
    }
  }, [session, status, searchParams, openOnboardingModal, openPromptModal]);

  return null;
};

export default GoogleRegistrationHandler;
