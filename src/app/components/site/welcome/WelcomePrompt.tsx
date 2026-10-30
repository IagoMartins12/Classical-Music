'use client';

import { PiSparkle, PiX } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { WELCOME } from '@/app/conteudo/site/welcome';
import { useUser } from '@/app/hooks/userStore';
import { useOverlayLanguage } from '@/app/hooks/useRouteLanguage';
import { useOnboardingModal, usePromptModal } from '@/app/stores/authStore';

/**
 * A reminder in the corner for whoever has not finished the welcome
 * questions. The card opens once a session; closed, it folds into a small
 * pill that stays until the questions are done (owner's decision, 29/10:
 * "always show it while the welcome is missing").
 */
export function WelcomePrompt() {
  const copy = WELCOME[useOverlayLanguage()].prompt;
  const user = useUser();
  const { isOpen, close } = usePromptModal();
  const { open, isOpen: modalOpen } = useOnboardingModal();

  if (!user || user.onboardingCompleted || modalOpen) return null;

  if (!isOpen)
    return (
      <button
        type="button"
        onClick={open}
        className="entra sup-alta fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-aviso flex h-11 items-center gap-2 !rounded-full pl-3.5 pr-4 text-[0.875rem] font-medium text-texto shadow-[var(--sombra-2)] hover:text-ouro-texto sm:bottom-6 sm:left-6"
      >
        <Icon de={PiSparkle} className="text-ouro-texto" />
        {copy.title}
      </button>
    );

  return (
    <aside
      aria-label={copy.title}
      className="entra fixed inset-x-4 bottom-4 z-aviso flex max-w-sm flex-col gap-3 rounded-card sup-alta p-5 shadow-[var(--sombra-2)] sm:left-auto sm:right-6 sm:bottom-6"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-[1.375rem] leading-tight">
          {copy.title}
        </p>
        <button
          type="button"
          onClick={close}
          aria-label={copy.close}
          className="-m-2 grid h-10 w-10 shrink-0 place-items-center rounded-full text-texto-fraco hover:text-texto"
        >
          <Icon de={PiX} />
        </button>
      </div>
      <p className="t-rotulo text-texto-suave">{copy.text}</p>
      <div className="flex gap-2">
        <Button
          variante="primario"
          tamanho="p"
          onClick={() => {
            close();
            open();
          }}
        >
          {copy.start}
        </Button>
        <Button variante="fantasma" tamanho="p" onClick={close}>
          {copy.later}
        </Button>
      </div>
    </aside>
  );
}
