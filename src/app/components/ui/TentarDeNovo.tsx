'use client';

import { useState } from 'react';
import { recarregarTudo } from '@/app/libs/pwa/recarregar';
import { Button, type ButtonProps } from './Button';

/**
 * "Tentar de novo": the button itself loads while everything reloads (fresh
 * caches, the page past the browser cache). No veil over the page — the
 * person sees where they clicked answer.
 */
export function TentarDeNovo(props: Omit<ButtonProps, 'onClick'>) {
  const [carregando, setCarregando] = useState(false);
  return (
    <Button
      {...(props as ButtonProps)}
      carregando={carregando}
      onClick={() => {
        setCarregando(true);
        void recarregarTudo({ veu: false });
      }}
    />
  );
}
