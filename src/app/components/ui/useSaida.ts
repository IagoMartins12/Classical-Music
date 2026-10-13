'use client';

import { useCallback, useRef } from 'react';

/** Whether the person asked the system for less motion. */
export const movimentoReduzido = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The exit: the item slides aside and fades, then the space it held closes,
 * so the list below rises instead of jumping. Web Animations, not a class:
 * the height is measured at the moment, and `cancel()` restores the item.
 */
function animarSaida(el: HTMLElement): Animation | null {
  if (movimentoReduzido()) return null;
  const { height } = el.getBoundingClientRect();
  el.style.overflow = 'hidden';
  const fora = { opacity: 0, transform: 'translateX(2.5rem) scale(0.96)' };
  const altura = `${height}px`;
  // Three beats, each with its own curve: a pause where the heart lets go,
  // the card sliding off, then the gap closing.
  return el.animate(
    [
      { opacity: 1, transform: 'none', height: altura },
      {
        opacity: 1,
        transform: 'none',
        height: altura,
        offset: 0.18,
        easing: 'cubic-bezier(0.4, 0, 1, 1)',
      },
      {
        ...fora,
        height: altura,
        offset: 0.55,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      {
        ...fora,
        height: '0px',
        paddingTop: '0px',
        paddingBottom: '0px',
        marginTop: '0px',
        marginBottom: '0px',
        borderTopWidth: '0px',
        borderBottomWidth: '0px',
      },
    ],
    { duration: 700, fill: 'forwards' }
  );
}

function desfazer(
  el: HTMLElement | null | undefined,
  a: Animation | null | undefined
) {
  a?.cancel();
  if (el) el.style.overflow = '';
}

/**
 * One item leaving its list before it is taken out: `sair()` resolves when
 * the exit ends — then remove it; `voltar()` undoes it when removal fails.
 */
export function useSaida<T extends HTMLElement = HTMLLIElement>() {
  const ref = useRef<T>(null);
  const animacao = useRef<Animation | null>(null);

  const sair = useCallback(async () => {
    if (!ref.current) return;
    animacao.current = animarSaida(ref.current);
    await animacao.current?.finished.catch(() => undefined);
  }, []);

  const voltar = useCallback(() => {
    desfazer(ref.current, animacao.current);
    animacao.current = null;
  }, []);

  return { ref, sair, voltar };
}

/**
 * The same exit for lists whose removal is decided by the parent (a
 * confirmation first): `refDe(id)` on each item, then `sair(id)` and, on
 * failure, `voltar(id)`.
 */
export function useSaidas() {
  const itens = useRef(new Map<string, HTMLElement>());
  const animacoes = useRef(new Map<string, Animation | null>());

  const refDe = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) itens.current.set(id, el);
      else itens.current.delete(id);
    },
    []
  );

  const sair = useCallback(async (id: string) => {
    const el = itens.current.get(id);
    if (!el) return;
    const a = animarSaida(el);
    animacoes.current.set(id, a);
    await a?.finished.catch(() => undefined);
  }, []);

  const voltar = useCallback((id: string) => {
    desfazer(itens.current.get(id), animacoes.current.get(id));
    animacoes.current.delete(id);
  }, []);

  return { refDe, sair, voltar };
}
