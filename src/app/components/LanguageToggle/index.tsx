'use client';

import { useEffect, useState } from 'react';
import { PiSpinnerGap } from 'react-icons/pi';
import { cx } from '@/app/components/ui/cx';
import {
  useLanguageStore,
  useLanguageWithRefresh,
} from '@/app/stores/useLanguageStore';

interface LanguageToggleProps {
  className?: string;
  /**
   * Troca de idioma por rota (o blog vai de `/blog` a `/en/blog`). Sem ela,
   * a troca grava o cookie e recarrega a página no mesmo endereço.
   */
  aoTrocar?: (idioma: 'pt' | 'en') => void;
  /** O idioma da página, quando ele vem do endereço (ver `aoTrocar`). */
  idioma?: 'pt' | 'en';
}

/** How long the button keeps loading if the route never answers. */
const ESPERA_MAXIMA_MS = 5000;

/**
 * The language button of the header: the flag of the language you are in,
 * one tap for the other. While the page changes, the button itself loads —
 * no veil over the page.
 */
export function LanguageToggle({
  className,
  aoTrocar,
  idioma: idiomaDaRota,
}: LanguageToggleProps) {
  const {
    language: idiomaDoStore,
    toggleLanguage,
    pending,
  } = useLanguageWithRefresh();
  const setStoreLanguage = useLanguageStore((s) => s.setLanguage);
  const [trocando, setTrocando] = useState(false);
  // With a route change, the address decides: `/en/blog` is English even if
  // the cookie says otherwise.
  const language = idiomaDaRota ?? idiomaDoStore;
  const ocupado = pending || trocando;

  // The route answered (the page language changed): the button is free again.
  useEffect(() => setTrocando(false), [language]);
  useEffect(() => {
    if (!trocando) return;
    const id = setTimeout(() => setTrocando(false), ESPERA_MAXIMA_MS);
    return () => clearTimeout(id);
  }, [trocando]);

  const trocar = () => {
    if (!aoTrocar) return toggleLanguage();
    const novo = language === 'pt' ? 'en' : 'pt';
    setTrocando(true);
    setStoreLanguage(novo, true);
    aoTrocar(novo);
  };

  const rotulo =
    language === 'pt' ? 'Mudar para inglês' : 'Switch to Portuguese';
  return (
    <button
      type="button"
      onClick={trocar}
      disabled={ocupado}
      aria-busy={ocupado || undefined}
      aria-label={rotulo}
      title={language === 'pt' ? 'English' : 'Português'}
      className={cx(
        'relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--linha-forte)] bg-sup-2 transition-colors duration-[var(--t-toque)] hover:bg-[var(--interactive-hover)] disabled:cursor-wait',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          'text-[0.9375rem] leading-none transition-opacity duration-[var(--t-resposta)]',
          ocupado && 'opacity-0'
        )}
      >
        {language === 'pt' ? '🇧🇷' : '🇺🇸'}
      </span>
      {ocupado && (
        <PiSpinnerGap
          aria-hidden="true"
          className="absolute h-5 w-5 animate-spin text-ouro-texto motion-reduce:animate-none"
        />
      )}
    </button>
  );
}
