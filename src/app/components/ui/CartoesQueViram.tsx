'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cliqueSimples, virarCartao } from '@/app/components/ui/transicao';
import { nomeDeArtigo, ROTAS_DO_BLOG } from '@/app/components/ui/nomeDeArtigo';

/**
 * Todo card de compositor, de obra ou de artigo do blog vira a página dele — na listagem, na
 * home, nos favoritos, no carrossel — sem que cada card precise cuidar disso.
 *
 * **Qual é o card.** No clique simples num link para `/composer/{id}` ou
 * `/works/{id}`, procura-se, nesta ordem:
 * 1. o elemento marcado `data-vira="compositor-{id}"` (ou `obra-{id}`) em
 *    volta do link;
 * 2. o marcado dentro do link — quando o link envolve o card inteiro;
 * 3. sem marca: o card em volta (`.classical-card*`, `article`), desde que
 *    todos os links de compositor ou obra dele levem ao mesmo destino — o
 *    link do compositor dentro do card de uma obra não transforma o card da
 *    obra;
 * 4. o próprio link, se ele é um bloco grande (a linha inteira da lista).
 *
 * **O card inteiro é clicável** quando marcado com `data-vira`: o clique fora
 * de link, botão e campo leva à página dele. Os de dentro (favoritar, o
 * gênero, a Wikipedia) continuam fazendo o que fazem, e só isso.
 *
 * Com tecla ou botão do meio, o link abre como sempre (nova aba, etc.). Ao
 * passar o ponteiro, a página de destino é pré-carregada: quanto antes ela
 * chega, mais inteira a transição.
 */
const ROTA =
  /^(?:\/(?:pt|en))?\/(composer|works|instruments|music-history)\/([^/]+)\/?$/;
/** The transition name's prefix for each kind of page. */
const PREFIXO: Record<string, string> = {
  composer: 'compositor',
  works: 'obra',
  instruments: 'instrumento',
  'music-history': 'epoca',
};
const CAMINHO: Record<string, string> = {
  compositor: '/composer',
  obra: '/works',
  instrumento: '/instruments',
  epoca: '/music-history',
};
const BLOG = /^\/blog\/([^/]+)\/?$/;
const CARTAO =
  '.classical-card, .classical-card-simple, .classical-card-2, .sup-1, .sup-2, article';
const INTERATIVO =
  'a, button, input, select, textarea, label, summary, [role="button"], [role="tab"], [role="menuitem"], [contenteditable="true"]';

function nomeDoDestino(url: URL) {
  const artigo = url.pathname.match(BLOG);
  if (artigo)
    return ROTAS_DO_BLOG.has(artigo[1]) ? null : nomeDeArtigo(artigo[1]);
  const casou = url.pathname.match(ROTA);
  if (!casou || casou[2] === 'filtered') return null;
  return `${PREFIXO[casou[1]]}-${casou[2]}`;
}

function urlDe(link: HTMLAnchorElement) {
  const url = new URL(link.href, window.location.href);
  return url.origin === window.location.origin ? url : null;
}

/** Todos os links de compositor/obra de dentro de `el` levam a `nome`? */
function soLevaA(el: Element, nome: string) {
  for (const a of el.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    const u = urlDe(a);
    const n = u && nomeDoDestino(u);
    if (n && n !== nome) return false;
  }
  return true;
}

function acharCartao(
  link: HTMLAnchorElement,
  nome: string
): HTMLElement | null {
  const sel = `[data-vira="${CSS.escape(nome)}"]`;
  const acima = link.closest<HTMLElement>(sel);
  if (acima) return acima;
  const dentro = link.querySelector<HTMLElement>(sel);
  if (dentro) return dentro;
  const cartao =
    link.closest<HTMLElement>(CARTAO) ??
    link.querySelector<HTMLElement>(CARTAO);
  if (cartao && soLevaA(cartao, nome)) return cartao;
  const r = link.getBoundingClientRect();
  if (r.height >= 72 && r.width >= 160) return link;
  return null;
}

function destinoDoLink(alvo: EventTarget | null) {
  const link = (alvo as Element | null)?.closest?.('a[href]');
  if (!(link instanceof HTMLAnchorElement)) return null;
  if ((link.target && link.target !== '_self') || link.hasAttribute('download'))
    return null;
  const url = urlDe(link);
  const nome = url && nomeDoDestino(url);
  if (!url || !nome) return null;
  const cartao = acharCartao(link, nome);
  if (!cartao) return null;
  return { cartao, nome, href: url.pathname + url.search + url.hash };
}

/** O card marcado em volta de um clique fora de link/botão, e o link principal dele. */
function destinoDoCartao(alvo: EventTarget | null) {
  const el = alvo as Element | null;
  if (!el?.closest || el.closest(INTERATIVO)) return null;
  const cartao = el.closest<HTMLElement>('[data-vira]');
  if (!cartao) return null;
  const nome = cartao.dataset.vira!;
  const [tipo, id] = [
    nome.slice(0, nome.indexOf('-')),
    nome.slice(nome.indexOf('-') + 1),
  ];
  const caminho = `${CAMINHO[tipo] ?? '/composer'}/${id}`;
  // O link do próprio card, se houver (já vem com o idioma certo).
  const link = [...cartao.querySelectorAll<HTMLAnchorElement>('a[href]')].find(
    (a) => {
      const u = urlDe(a);
      return u && nomeDoDestino(u) === nome;
    }
  );
  // Artigo: o nome não guarda o slug original, só o link sabe o caminho.
  if (!link && tipo === 'artigo') return null;
  const idioma = window.location.pathname.match(/^\/(en)(\/|$)/)?.[1];
  const href = link
    ? new URL(link.href).pathname
    : `${idioma ? `/${idioma}` : ''}${caminho}`;
  return { cartao, nome, href };
}

export function CartoesQueViram() {
  const router = useRouter();

  useEffect(() => {
    const previstos = new Set<string>();
    const prever = (href: string) => {
      if (previstos.has(href)) return;
      previstos.add(href);
      router.prefetch(href);
    };

    // Captura no `document`: roda antes do `onClick` do `next/link`, que
    // desiste da própria navegação ao ver `defaultPrevented`.
    const aoClicar = (e: MouseEvent) => {
      if (e.defaultPrevented || !cliqueSimples(e)) return;
      const destino = destinoDoLink(e.target) ?? destinoDoCartao(e.target);
      if (!destino || destino.href === window.location.pathname) return;
      e.preventDefault();
      virarCartao(destino.cartao, destino.nome, router.push, destino.href);
    };

    const aoPassar = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const destino = destinoDoLink(e.target) ?? destinoDoCartao(e.target);
      if (destino) prever(destino.href);
    };

    document.addEventListener('click', aoClicar, true);
    document.addEventListener('pointerover', aoPassar, true);
    return () => {
      document.removeEventListener('click', aoClicar, true);
      document.removeEventListener('pointerover', aoPassar, true);
    };
  }, [router]);

  return null;
}
