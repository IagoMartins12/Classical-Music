'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cx } from '@/app/components/ui/cx';
import { useArrastarParaRolar } from './useArrastarParaRolar';

/**
 * Uma faixa de uma linha que rola de lado: as fichas de categoria da lista
 * de artigos (01/10: "um carrosselzinho" no lugar das várias linhas).
 *
 * O dedo rola sozinho; o mouse arrasta (`useArrastarParaRolar`, o mesmo do
 * carrossel dos últimos artigos). As pontas esmaecem só do lado em que há
 * mais para ver, e a ficha ativa entra à vista ao abrir a página.
 */
export function FaixaQueRola({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const faixa = useRef<HTMLUListElement>(null);
  const [inicio, setInicio] = useState(true);
  const [fim, setFim] = useState(true);
  useArrastarParaRolar(faixa);

  const medir = useCallback(() => {
    const el = faixa.current;
    if (!el) return;
    setInicio(el.scrollLeft <= 4);
    setFim(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = faixa.current;
    if (!el) return;
    el.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
    });
    medir();
    el.addEventListener('scroll', medir, { passive: true });
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => {
      el.removeEventListener('scroll', medir);
      observador.disconnect();
    };
  }, [medir]);

  const mascara =
    inicio && fim
      ? undefined
      : `linear-gradient(to right, ${inicio ? '#000' : 'transparent'}, #000 2.5rem, #000 calc(100% - 2.5rem), ${fim ? '#000' : 'transparent'})`;

  return (
    <ul
      ref={faixa}
      style={{ maskImage: mascara, WebkitMaskImage: mascara }}
      className={cx(
        'flex cursor-grab gap-2 overflow-x-auto overscroll-x-contain py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>li]:shrink-0',
        className
      )}
    >
      {children}
    </ul>
  );
}
