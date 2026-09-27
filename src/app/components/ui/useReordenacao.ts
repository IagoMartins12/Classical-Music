'use client';

import { useLayoutEffect, useRef } from 'react';

/**
 * A lista que se reordena ao filtrar (técnica FLIP).
 *
 * Filtrar o catálogo troca os dados, e a grade inteira "piscava" para o novo
 * arranjo. Aqui, cada card que continua na lista desliza da posição antiga
 * até a nova (280ms, a curva do sistema), e os que chegam aparecem. Nada
 * congela esperando os dados: a animação só começa quando eles já estão na
 * tela. Usa a Web Animations API; com movimento reduzido, nada se mexe.
 *
 * Uso: o contêiner recebe o `ref`, e cada item um `data-chave` estável.
 */
export function useReordenacao<T extends HTMLElement>(chaves: string[]) {
  const ref = useRef<T>(null);
  const antes = useRef(new Map<string, { x: number; y: number }>());
  const assinatura = chaves.join('|');

  useLayoutEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;
    const itens = [...raiz.querySelectorAll<HTMLElement>('[data-chave]')];
    // Posição na página (não na janela): não se confunde com a rolagem.
    const agora = new Map<string, { x: number; y: number }>();
    for (const el of itens) {
      const r = el.getBoundingClientRect();
      agora.set(el.dataset.chave!, {
        x: r.left + window.scrollX,
        y: r.top + window.scrollY,
      });
    }

    const reduzir = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (
      !reduzir &&
      antes.current.size > 0 &&
      typeof raiz.animate === 'function'
    ) {
      const curva = 'cubic-bezier(0.23, 1, 0.32, 1)';
      for (const el of itens) {
        const de = antes.current.get(el.dataset.chave!);
        const para = agora.get(el.dataset.chave!)!;
        if (de) {
          const dx = de.x - para.x;
          const dy = de.y - para.y;
          if (dx || dy) {
            el.animate(
              [
                { transform: `translate(${dx}px, ${dy}px)` },
                { transform: 'none' },
              ],
              { duration: 280, easing: curva }
            );
          }
        } else {
          el.animate(
            [
              { opacity: 0, transform: 'scale(0.98)' },
              { opacity: 1, transform: 'none' },
            ],
            { duration: 280, easing: curva }
          );
        }
      }
    }
    antes.current = agora;
  }, [assinatura]);

  return ref;
}
