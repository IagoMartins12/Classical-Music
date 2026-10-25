import { flushSync } from 'react-dom';
import { nomeDeArtigo, ROTAS_DO_BLOG } from './nomeDeArtigo';

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

const ROTA =
  /^(?:\/(?:pt|en))?\/(composer|works|instruments|music-history)\/([^/]+)\/?$/;
const BLOG = /^(?:\/(?:pt|en))?\/blog\/([^/]+)\/?$/;
/** The transition name's prefix for each kind of page. */
const PREFIXO: Record<string, string> = {
  composer: 'compositor',
  works: 'obra',
  instruments: 'instrumento',
  'music-history': 'epoca',
};

/**
 * O nome de transição da página de destino (`compositor-{id}`,
 * `obra-{id}`, `artigo-{slug}`…), ou `null` se o caminho não é a página de
 * um compositor, obra, instrumento, época ou artigo.
 */
export function nomeDoDestino(caminho: string): string | null {
  const artigo = caminho.match(BLOG);
  if (artigo)
    return ROTAS_DO_BLOG.has(artigo[1]) ? null : nomeDeArtigo(artigo[1]);
  const casou = caminho.match(ROTA);
  if (!casou || casou[2] === 'filtered') return null;
  return `${PREFIXO[casou[1]]}-${casou[2]}`;
}

/** Um pedido por página na sessão: a segunda vez não espera nada. */
const prontas = new Map<string, Promise<unknown>>();

/**
 * Pede a página ao servidor, o que a gera e a põe no cache se ninguém a
 * abriu ainda, e depois a pré-carrega no navegador (`preCarregar`, o
 * `router.prefetch`). Resolve quando a página está pronta para abrir na hora.
 */
export function prepararPagina(
  href: string,
  preCarregar?: (href: string) => void
): Promise<unknown> {
  let pronta = prontas.get(href);
  if (!pronta) {
    pronta = fetch(href, { credentials: 'same-origin' })
      .then((r) => r.text())
      .finally(() => preCarregar?.(href));
    // Se falhar, quem espera segue sem esperar, e o próximo tenta de novo.
    pronta.catch(() => prontas.delete(href));
    prontas.set(href, pronta);
  }
  return pronta;
}

/**
 * Abre a página de um compositor, obra, instrumento, época ou artigo: o
 * caminho único de todo link, card, resultado de busca ou notificação que
 * leva a uma delas (`CartoesQueViram`, `HeaderSearch`, as notificações).
 *
 * **Primeiro a página fica pronta, depois abre.** Uma página que ninguém
 * abriu ainda é gerada no servidor nesse primeiro pedido, e leva segundos:
 * dentro da transição, a espera estourava e o card não virava. Enquanto
 * espera, `origem` (o que foi clicado) mostra que está abrindo
 * (`[data-abrindo]`, em `globals.css`): um card escurece com um anel no
 * centro; um link ou uma linha ganha um anel pequeno no fim. Na segunda vez
 * a página já está pronta e o sinal nem aparece.
 *
 * **O card vira a página** quando há `cartao`: ele recebe, só agora, o nome
 * que o cabeçalho da página de destino já tem, e a navegação acontece dentro
 * da transição. O nome é dado no clique, e não fixo no card, porque o mesmo
 * compositor pode aparecer duas vezes na tela (na home, em "Últimas adições"
 * e no carrossel). Dois elementos com o mesmo nome anulam a transição.
 *
 * Outro destino (a busca completa, um aviso que leva ao perfil) navega na
 * hora, sem nada disso.
 */
export function abrirPagina(
  href: string,
  empurrar: (href: string) => void,
  {
    origem,
    cartao = false,
    preCarregar,
  }: {
    origem?: HTMLElement | null;
    /** `origem` é o card que vira a página. */
    cartao?: boolean;
    preCarregar?: (href: string) => void;
  } = {}
) {
  const url = new URL(href, window.location.href);
  const nome =
    url.origin === window.location.origin ? nomeDoDestino(url.pathname) : null;
  if (!nome) {
    empurrar(href);
    return;
  }
  const vez = ++abrindo;
  const antes = window.location.pathname;
  const posicao = origem?.style.position ?? '';
  // O sinal só aparece se a espera for perceptível: abaixo de 150ms, piscaria.
  // No card, ele é desenhado por pseudoelementos posicionados pelo card.
  const sinal = setTimeout(() => {
    if (vez !== abrindo || !origem) return;
    if (cartao && getComputedStyle(origem).position === 'static')
      origem.style.position = 'relative';
    origem.dataset.abrindo = cartao ? 'cartao' : 'linha';
  }, 150);
  const limite = new Promise((resolver) => setTimeout(resolver, 8000));
  const pronta = prepararPagina(href, preCarregar).catch(() => undefined);
  void Promise.race([pronta, limite]).then(() => {
    clearTimeout(sinal);
    if (origem && 'abrindo' in origem.dataset) {
      delete origem.dataset.abrindo;
      origem.style.position = posicao;
    }
    // Outro clique veio depois, ou a pessoa já saiu daqui: este desiste.
    if (vez !== abrindo || window.location.pathname !== antes) return;
    if (cartao && origem) {
      nomear(origem, nome);
      navegarComTransicao(empurrar, href);
    } else {
      empurrar(href);
    }
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
