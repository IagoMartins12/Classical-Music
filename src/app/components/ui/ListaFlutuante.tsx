'use client';

import { useCallback, useRef, type ReactNode, type RefObject } from 'react';
import { cx } from './cx';
import { useListaFlutuante } from './useListaFlutuante';

/**
 * A field's floating list (search results, suggestions) in the browser's top
 * layer, the way `Selecao` opens its own: no `overflow` cuts it and no sheet
 * covers it. Under the anchor, exactly its width; above it when there is no
 * room below.
 *
 * **Why it exists (04/11).** The older search fields (work, composer, the
 * panel's pickers) opened an `absolute top-full` list. Inside a sheet, the
 * scrolling area clipped it: the "Seleção de Obra" of the score upload
 * showed nothing. The list keeps its look; only its place changes.
 *
 * `aberta` must be exactly the condition that shows the list: the element is
 * always in the page, hidden by the popover when closed. The list stays a
 * DOM child of its field, so "click outside" checks keep working.
 */
export function ListaFlutuante({
  ancora,
  aberta,
  aoFechar,
  conteudo,
  listaRef,
  className,
  children,
}: {
  ancora: RefObject<HTMLElement | null>;
  aberta: boolean;
  /** A pointer down outside the field and the list. */
  aoFechar: () => void;
  /** Anything that changes the list's height (the results). */
  conteudo?: unknown;
  /** The caller's own ref to the list, when it needs one. */
  listaRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  children: ReactNode;
}) {
  const lista = useRef<HTMLDivElement>(null);
  const ref = useCallback(
    (el: HTMLDivElement | null) => {
      lista.current = el;
      if (listaRef) listaRef.current = el;
    },
    [listaRef]
  );
  useListaFlutuante({
    ancora,
    lista,
    aberta,
    aoClicarFora: aoFechar,
    conteudo,
    larguraDaAncora: true,
  });

  return (
    <div
      ref={ref}
      popover="manual"
      className={cx('lista-flutuante', className)}
    >
      {aberta && children}
    </div>
  );
}
