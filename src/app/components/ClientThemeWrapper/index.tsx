// app/components/ClientThemeWrapper.tsx
'use client';

import { useThemeStore } from '@/app/stores/themeStore';
import dynamic from 'next/dynamic';
import { RetratosQueFalham } from '../site/RetratosQueFalham';
import React, { useEffect, useState } from 'react';
import { IconContext } from 'react-icons';
import type { IconContext as IconContextValue } from 'react-icons';

// Mounted after hydration anyway: their code loads off the critical path.
const TranslationLoadingGate = dynamic(
  () =>
    import('../TranslationLoadingGate').then((m) => m.TranslationLoadingGate),
  { ssr: false }
);
const InstallInvite = dynamic(
  () => import('../site/pwa/InstallInvite').then((m) => m.InstallInvite),
  { ssr: false }
);
const OfflineBar = dynamic(
  () => import('../site/pwa/OfflineBar').then((m) => m.OfflineBar),
  { ssr: false }
);

/**
 * Todo ícone do react-icons nasce decorativo (`aria-hidden`).
 *
 * O nome acessível mora no botão ou link que contém o ícone, nunca no desenho.
 * Sem isto, os ícones da família Simple Icons (`react-icons/si`) chegavam com
 * `role="img"` e sem texto, e o leitor de tela anunciava "imagem" solta; os
 * das outras nove famílias eram lidos como nada, ou como gráfico sem nome.
 * É o mesmo padrão do primitivo `ui/Icon`.
 */
const ICONES: IconContextValue = {
  attr: { 'aria-hidden': true, focusable: false },
};

interface ClientThemeWrapperProps {
  children: React.ReactNode;
}

export const ClientThemeWrapper: React.FC<ClientThemeWrapperProps> = ({
  children,
}) => {
  const { applyTheme } = useThemeStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Evita hydration mismatch
  useEffect(() => {
    if (!isHydrated) setIsHydrated(true);
  }, []);
  // // Aplica o tema quando o componente monta ou o tema muda
  // useEffect(() => {
  //   if (isHydrated) {
  //     applyTheme(mode);
  //   }
  // }, [mode, applyTheme, isHydrated]);

  // Detecta preferência do sistema
  useEffect(() => {
    if (!isHydrated) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Só segue a preferência do sistema se não houver preferência manual
      const hasUserPreference = localStorage.getItem('classical-music-theme');
      if (!hasUserPreference) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme, isHydrated]);

  // Sem `opacity-0` até hidratar. A trava existia contra o flash de tema, mas
  // desde a Etapa 7.8 o tema é só CSS (`data-theme`), aplicado pelo script do
  // `layout.tsx` antes da primeira pintura. Mantida, ela escondia o HTML que o
  // servidor já mandou pronto: a maior imagem da tela esperava o JavaScript
  // (LCP), e sem JavaScript a página ficava em branco.
  return (
    <IconContext.Provider value={ICONES}>
      <div className="classical-theme">
        {children}
        {isHydrated && <TranslationLoadingGate />}
        {/* The app (PWA): the install invite on phones and the offline
            notice, once for the whole site, blog and portal. */}
        {isHydrated && <InstallInvite />}
        {isHydrated && <OfflineBar />}
        <RetratosQueFalham />
      </div>
    </IconContext.Provider>
  );
};

// Hook adicional para verificar se está hidratado
export const useIsHydrated = (): boolean => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
};
