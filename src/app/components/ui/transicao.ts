import { flushSync } from 'react-dom';

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
 * página demorar mais de 1,2s, a transição termina assim mesmo (e o
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
          } else if (performance.now() - inicio > 1200) {
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
 * Troca de vista (cards ↔ lista): cada item visível se transforma no seu
 * par da outra vista, pelo `data-vira` que os dois têm (`obra-{id}`,
 * `compositor-{id}`). O que não tem par aparece ou some cruzando.
 *
 * Os nomes são dados só durante a troca e só aos itens perto da tela — cada
 * nome é uma foto que o navegador tira, e uma grade de 30 cards fora da tela
 * não precisa de foto.
 */
export function trocarVista(atualizar: () => void) {
  if (!podeTransitar()) {
    atualizar();
    return;
  }
  const marcar = () => {
    const vistos = new Set<string>();
    document.querySelectorAll<HTMLElement>('[data-vira]').forEach((el) => {
      const nome = el.dataset.vira!;
      const r = el.getBoundingClientRect();
      if (vistos.has(nome) || vistos.size >= 60) return;
      if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
      vistos.add(nome);
      el.style.viewTransitionName = nome;
      el.style.setProperty('view-transition-class', 'vista');
    });
  };
  const limpar = () =>
    document.querySelectorAll<HTMLElement>('[data-vira]').forEach((el) => {
      el.style.viewTransitionName = '';
      el.style.removeProperty('view-transition-class');
    });
  marcar();
  const t = (document as Documento).startViewTransition!(() => {
    limpar();
    flushSync(atualizar);
    marcar();
  }) as { finished?: Promise<void> } | undefined;
  t?.finished?.finally(limpar);
}

/** O clique mais recente: um card clicado depois cancela o anterior. */
let abrindo = 0;

/**
 * O card vira a página: recebe, só agora, o nome que o cabeçalho da página
 * de destino já tem, e a navegação acontece dentro da transição.
 *
 * O nome é dado no clique, e não fixo no card, porque o mesmo compositor
 * pode aparecer duas vezes na tela (na home, em "Últimas adições" e no
 * carrossel). Dois elementos com o mesmo nome anulam a transição inteira.
 *
 * **Primeiro a página fica pronta, depois o card vira.** Uma página que
 * ninguém abriu ainda é gerada no servidor nesse primeiro pedido, e leva
 * segundos: dentro da transição, a espera estourava e o card não virava.
 * Agora, enquanto `pronta` não resolve, o card mostra que está abrindo
 * (`[data-abrindo]`, em `globals.css`); quando resolve, a página já está no
 * cache e a transição acontece inteira. Na segunda vez, `pronta` resolve na
 * hora e o sinal nem aparece.
 */
export function virarCartao(
  cartao: HTMLElement,
  nome: string,
  empurrar: (href: string) => void,
  href: string,
  pronta: Promise<unknown> = Promise.resolve()
) {
  const vez = ++abrindo;
  const antes = window.location.pathname;
  // O sinal só aparece se a espera for perceptível: abaixo de 150ms, piscaria.
  // O sinal é desenhado por um `::after` posicionado pelo card.
  const posicao = cartao.style.position;
  const sinal = setTimeout(() => {
    if (vez !== abrindo) return;
    if (getComputedStyle(cartao).position === 'static')
      cartao.style.position = 'relative';
    cartao.dataset.abrindo = '';
  }, 150);
  const limite = new Promise((resolver) => setTimeout(resolver, 8000));
  void Promise.race([pronta.catch(() => undefined), limite]).then(() => {
    clearTimeout(sinal);
    if ('abrindo' in cartao.dataset) {
      delete cartao.dataset.abrindo;
      cartao.style.position = posicao;
    }
    // Outro card foi clicado, ou a pessoa já saiu daqui: este desiste.
    if (vez !== abrindo || window.location.pathname !== antes) return;
    nomear(cartao, nome);
    navegarComTransicao(empurrar, href);
  });
}

function nomear(cartao: HTMLElement, nome: string) {
  document
    .querySelectorAll<HTMLElement>('[style*="view-transition-name"]')
    .forEach((el) => {
      if (el !== cartao && el.style.viewTransitionName === nome) {
        el.style.viewTransitionName = 'none';
      }
    });
  cartao.style.viewTransitionName = nome;
  cartao.style.setProperty('view-transition-class', 'cartao');
}

export { nomeDeTransicao } from './nomeDeTransicao';

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
