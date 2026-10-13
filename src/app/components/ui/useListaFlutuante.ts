'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type RefObject,
} from 'react';

const MARGEM = 6;
const ALTURA_MAX = 288;

type ComPopover = HTMLElement & {
  showPopover?: () => void;
  hidePopover?: () => void;
};

/**
 * The floating list of `Selecao` and `SelecaoComBusca`, in the browser's top
 * layer (Popover API): no card `overflow` cuts it and no dialog covers it.
 *
 * Positions the list under the anchor (above when it does not fit), at least
 * as wide as the anchor and never past the screen edge; follows the anchor
 * on scroll and resize; a pointer down outside both closes it. Returns
 * whether it opened upwards, for the entry animation.
 */
export function useListaFlutuante({
  ancora,
  lista,
  aberta,
  aoClicarFora,
  conteudo,
}: {
  ancora: RefObject<HTMLElement | null>;
  lista: RefObject<HTMLElement | null>;
  aberta: boolean;
  aoClicarFora: () => void;
  /** Anything that changes the list's height (filtered options). */
  conteudo?: unknown;
}) {
  const [acima, setAcima] = useState(false);

  const posicionar = useCallback(() => {
    const a = ancora.current;
    const l = lista.current;
    if (!a || !l) return;
    const r = a.getBoundingClientRect();
    const altura = Math.min(l.scrollHeight, ALTURA_MAX);
    const abaixo = window.innerHeight - r.bottom - MARGEM;
    const paraCima = abaixo < altura && r.top > abaixo;
    setAcima(paraCima);
    // At least as wide as the anchor, wider when an option needs it (a
    // short label like "A–Z" must not cut "Chegaram agora"), and never past
    // the edge of the screen.
    l.style.width = 'max-content';
    l.style.minWidth = `${Math.round(r.width)}px`;
    l.style.maxWidth = `${window.innerWidth - MARGEM * 2}px`;
    const largura = l.offsetWidth;
    l.style.left = `${Math.round(
      Math.max(MARGEM, Math.min(r.left, window.innerWidth - largura - MARGEM))
    )}px`;
    l.style.top = paraCima
      ? `${Math.round(r.top - Math.min(altura, r.top - MARGEM) - MARGEM)}px`
      : `${Math.round(r.bottom + MARGEM)}px`;
    l.style.maxHeight = `${Math.round(
      Math.min(ALTURA_MAX, paraCima ? r.top - MARGEM * 2 : abaixo - MARGEM)
    )}px`;
  }, [ancora, lista]);

  useLayoutEffect(() => {
    const l = lista.current as ComPopover | null;
    if (!l) return;
    if (aberta) {
      if (l.showPopover && !l.matches(':popover-open')) l.showPopover();
      posicionar();
    } else if (l.hidePopover && l.matches(':popover-open')) {
      l.hidePopover();
    }
  }, [aberta, posicionar, lista, conteudo]);

  useEffect(() => {
    if (!aberta) return;
    const aoRolar = () => posicionar();
    const aoClicar = (e: PointerEvent) => {
      const alvo = e.target as Node;
      if (!ancora.current?.contains(alvo) && !lista.current?.contains(alvo))
        aoClicarFora();
    };
    window.addEventListener('scroll', aoRolar, true);
    window.addEventListener('resize', aoRolar);
    document.addEventListener('pointerdown', aoClicar);
    return () => {
      window.removeEventListener('scroll', aoRolar, true);
      window.removeEventListener('resize', aoRolar);
      document.removeEventListener('pointerdown', aoClicar);
    };
  }, [aberta, posicionar, aoClicarFora, ancora, lista]);

  return { acima };
}
