import type { CSSProperties } from 'react';

/**
 * Movimento entre estados com a View Transitions API — sem biblioteca.
 *
 * Duas situações usam isto: o **card virando a página** (o card da obra se
 * transforma no cabeçalho da página dela) e a **lista reordenando** (ao
 * filtrar, cada card desliza até o novo lugar em vez de a grade piscar).
 *
 * Sem a API (Firefox antigo) ou com `prefers-reduced-motion`, a atualização
 * acontece direto, sem transição.
 */

type Documento = Document & {
  startViewTransition?: (atualizar: () => void | Promise<void>) => unknown;
};

function podeTransitar(): boolean {
  if (typeof document === 'undefined') return false;
  if (!(document as Documento).startViewTransition) return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Faz a atualização de estado dentro de uma transição. */
export function comTransicao(atualizar: () => void | Promise<void>) {
  if (!podeTransitar()) {
    void atualizar();
    return;
  }
  (document as Documento).startViewTransition!(atualizar);
}

/**
 * Navega e só dá a transição por encerrada quando a URL já é a da página
 * nova — é o que permite ao card se transformar no cabeçalho dela. Se a
 * página demorar mais de 0,8s, a transição termina assim mesmo (e o
 * esqueleto de carregamento entra no lugar).
 */
export function navegarComTransicao(
  empurrar: (href: string) => void,
  href: string
) {
  comTransicao(
    () =>
      new Promise<void>((resolver) => {
        const antes = window.location.pathname;
        const inicio = performance.now();
        empurrar(href);
        // `setTimeout`, e não `requestAnimationFrame`: durante a transição o
        // navegador suspende a pintura, e o rAF parava — a tela ficava
        // congelada na foto antiga até a página chegar (4,6s no dev).
        const esperar = () => {
          if (window.location.pathname !== antes) {
            setTimeout(resolver, 0);
          } else if (performance.now() - inicio > 800) {
            resolver();
          } else {
            setTimeout(esperar, 16);
          }
        };
        setTimeout(esperar, 16);
      })
  );
}

/**
 * O nome que liga o card à página (e cada card a si mesmo na reordenação).
 * `classe` escolhe o tempo no CSS: `cartao` (320ms) ou `item-lista` (280ms).
 */
export function nomeDeTransicao(
  nome: string,
  classe: 'cartao' | 'item-lista' | 'cartao item-lista' = 'cartao item-lista'
): CSSProperties {
  return {
    viewTransitionName: nome,
    viewTransitionClass: classe,
  } as CSSProperties;
}

/** Clique simples, sem tecla nem botão do meio: dá para interceptar. */
export function cliqueSimples(e: {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
