'use client';

import { useLayoutEffect, useRef } from 'react';

/**
 * A lista que se reordena ao filtrar (técnica FLIP).
 *
 * Filtrar o catálogo troca os dados, e a grade inteira "piscava" para o novo
 * arranjo. Aqui, cada card que continua na lista desliza da posição antiga
 * até a nova (380ms, a curva do sistema), e os que chegam aparecem. Nada
 * congela esperando os dados: a animação só começa quando eles já estão na
 * tela. Usa a Web Animations API; com movimento reduzido, nada se mexe.
 *
 * Uso: o contêiner recebe o `ref`, e cada item um `data-chave` estável.
 *
 * **Por que as posições moram fora do componente.** Nas listas de obras e de
 * compositores, a lista sem filtro e a filtrada são rotas diferentes
 * (`/works` e `/works/filtered`, para a primeira poder ser estática): o
 * primeiro filtro desmonta a página inteira, e uma posição guardada num
 * `useRef` sumia junto. Guardadas pelo nome da lista, por alguns segundos, a
 * página nova encontra onde cada card estava.
 */
type Posicoes = Map<string, { x: number; y: number }>;
const ultimas = new Map<string, { posicoes: Posicoes; quando: number }>();
// A foto é tirada na saída da grade antiga; a nova costuma chegar em menos de
// um segundo, mas o esqueleto da espera pode segurar alguns.
const VALIDADE_MS = 15000;

/** Posição de cada item na página (não na janela): não se confunde com a rolagem. */
function medir(raiz: HTMLElement): Posicoes {
  const agora: Posicoes = new Map();
  for (const el of raiz.querySelectorAll<HTMLElement>('[data-chave]')) {
    const r = el.getBoundingClientRect();
    agora.set(el.dataset.chave!, {
      x: r.left + window.scrollX,
      y: r.top + window.scrollY,
    });
  }
  return agora;
}

export function useReordenacao<T extends HTMLElement>(
  chaves: string[],
  lista?: string
) {
  const ref = useRef<T>(null);
  const antes = useRef<Posicoes>(new Map());
  const assinatura = chaves.join('|');

  useLayoutEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;
    const agora = medir(raiz);

    // Grade recém-montada (a página do filtro é outra): as posições vêm da
    // foto que a grade anterior tirou ao sair.
    let de = antes.current;
    if (de.size === 0 && lista) {
      const guardada = ultimas.get(lista);
      if (guardada && performance.now() - guardada.quando < VALIDADE_MS) {
        de = guardada.posicoes;
      }
      ultimas.delete(lista);
    }

    const reduzir = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (!reduzir && de.size > 0 && typeof raiz.animate === 'function') {
      const curva = 'cubic-bezier(0.23, 1, 0.32, 1)';
      for (const el of raiz.querySelectorAll<HTMLElement>('[data-chave]')) {
        const origem = de.get(el.dataset.chave!);
        const destino = agora.get(el.dataset.chave!)!;
        if (origem) {
          const dx = origem.x - destino.x;
          const dy = origem.y - destino.y;
          if (dx || dy) {
            el.animate(
              [
                { transform: `translate(${dx}px, ${dy}px)` },
                { transform: 'none' },
              ],
              { duration: 380, easing: curva }
            );
          }
        } else {
          el.animate(
            [
              { opacity: 0, transform: 'scale(0.98)' },
              { opacity: 1, transform: 'none' },
            ],
            { duration: 380, easing: curva }
          );
        }
      }
    }
    antes.current = agora;

    // Na saída — a grade vai dar lugar ao esqueleto ou à página do filtro —,
    // a foto de onde cada card está agora. Tirada aqui, e não ao montar, ela
    // vale mesmo que a pessoa tenha ficado minutos olhando a lista.
    return () => {
      if (lista && raiz.isConnected) {
        ultimas.set(lista, {
          posicoes: medir(raiz),
          quando: performance.now(),
        });
      }
    };
  }, [assinatura]);

  return ref;
}
