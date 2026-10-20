'use client';

import {
  useLayoutEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from './cx';

/**
 * Abas: a faixa que troca o que a página mostra (Todos, Compositores,
 * Obras…).
 *
 * Favoritos, envios, anotações e estudos escreviam cada aba à mão — o mesmo
 * `px-4 py-2 rounded-lg` com o ternário de ativa, copiado dezesseis vezes — e
 * nenhuma dizia ao leitor de tela que era aba, nem qual estava escolhida.
 * Aqui a faixa é `tablist`, cada aba é `tab` com `aria-selected`, e a ativa
 * ganha a superfície de cima: tom, não cor.
 *
 * A superfície da ativa é uma pílula só, que desliza até a aba escolhida
 * (`--aba-x`, `--aba-w`, medidos aqui). Sem JavaScript, ou antes de medir,
 * a própria aba ativa pinta o fundo.
 */
export function Abas({
  rotulo,
  className,
  children,
}: {
  /** Nome da faixa para o leitor de tela ("Filtrar favoritos"). */
  rotulo: string;
  className?: string;
  children: ReactNode;
}) {
  const faixa = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = faixa.current;
    if (!el) return;
    const medir = () => {
      const ativa = el.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!ativa) return el.removeAttribute('data-pilula');
      el.style.setProperty('--aba-x', `${ativa.offsetLeft}px`);
      el.style.setProperty('--aba-w', `${ativa.offsetWidth}px`);
      // The first measure places the pill without sliding it in.
      if (!el.hasAttribute('data-pilula'))
        requestAnimationFrame(() => el.setAttribute('data-pilula', 'pronta'));
      else el.setAttribute('data-pilula', 'pronta');
    };
    medir();
    const mudou = new MutationObserver(medir);
    mudou.observe(el, {
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-selected'],
      childList: true,
      characterData: true,
    });
    const redimensionou = new ResizeObserver(medir);
    redimensionou.observe(el);
    return () => {
      mudou.disconnect();
      redimensionou.disconnect();
    };
  }, []);

  return (
    <div
      ref={faixa}
      role="tablist"
      aria-label={rotulo}
      className={cx(
        'abas classical-scrollbar-mini relative isolate flex gap-1 overflow-x-auto rounded-xl bg-theme-secondary p-1',
        className
      )}
    >
      {children}
    </div>
  );
}

export function Aba({
  ativa,
  className,
  children,
  ...resto
}: ButtonHTMLAttributes<HTMLButtonElement> & { ativa: boolean }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativa}
      className={cx(
        'aba min-h-9 shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium',
        'transition-colors duration-[var(--t-toque)] ease-saida',
        ativa
          ? 'bg-theme-tertiary text-texto shadow-md'
          : 'text-texto-fraco hover:text-texto',
        className
      )}
      {...resto}
    >
      {children}
    </button>
  );
}
