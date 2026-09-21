import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

/**
 * As regras de idioma do middleware, que antes só existiam como uma
 * verificação manual contra o servidor.
 *
 * **Por que estas sete.** Elas decidem duas coisas que não falham de forma
 * visível: qual endereço o buscador indexa em cada idioma, e se a troca de
 * idioma recarrega a página. Uma inversão aqui não quebra tela nenhuma — só
 * apaga o inglês da busca, ou faz o site piscar a cada troca.
 */

const COOKIE = 'opus-atlas-language';

function cookieDeIdioma(language: 'pt' | 'en', escolhaDoUsuario = true) {
  const valor = encodeURIComponent(
    JSON.stringify({
      state: { language, hasUserPreference: escolhaDoUsuario },
      version: 0,
    })
  );

  return `${COOKIE}=${valor}`;
}

/** Uma visita de documento: é o que o navegador manda ao abrir um endereço. */
function documento(caminho: string, cookie?: string) {
  return new NextRequest(`https://opusatlas.com.br${caminho}`, {
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'sec-fetch-dest': 'document',
      ...(cookie ? { cookie } : {}),
    },
  });
}

/** O pedido que o roteador do cliente faz — é ele que a troca de idioma usa. */
function doRoteador(caminho: string, cookie?: string) {
  return new NextRequest(`https://opusatlas.com.br${caminho}`, {
    headers: {
      accept: '*/*',
      'sec-fetch-dest': 'empty',
      RSC: '1',
      ...(cookie ? { cookie } : {}),
    },
  });
}

function destino(resposta: Response) {
  return resposta.headers.get('location');
}

/** Para onde o Next foi mandado renderizar, sem mudar a URL de quem pediu. */
function reescritaPara(resposta: Response) {
  const url = resposta.headers.get('x-middleware-rewrite');
  return url ? new URL(url).pathname : null;
}

describe('idioma nas visitas de documento', () => {
  it('sem cookie, o caminho limpo serve português', () => {
    const r = middleware(documento('/composers')) as Response;

    expect(r.status).not.toBe(307);
    expect(reescritaPara(r)).toBe('/pt/composers');
  });

  it('com preferência por inglês, o caminho limpo redireciona para /en', () => {
    const r = middleware(
      documento('/composers', cookieDeIdioma('en'))
    ) as Response;

    expect(r.status).toBe(307);
    expect(destino(r)).toContain('/en/composers');
  });

  it('/en é servido como ele mesmo', () => {
    const r = middleware(documento('/en/composers')) as Response;

    expect(r.status).not.toBe(307);
    expect(destino(r)).toBeNull();
  });

  it('com preferência por português, /en volta ao caminho limpo', () => {
    const r = middleware(
      documento('/en/composers', cookieDeIdioma('pt'))
    ) as Response;

    expect(r.status).toBe(307);
    expect(destino(r)).toContain('/composers');
    expect(destino(r)).not.toContain('/en/');
  });

  // Duas URLs servindo a mesma página em português seriam conteúdo duplicado.
  it('/pt nunca é público', () => {
    const r = middleware(documento('/pt/composers')) as Response;

    expect(r.status).toBe(308);
    expect(destino(r)).toContain('/composers');
  });

  // `/en/profile` não existe: a área por pessoa não vive sob `[lang]`.
  it('/en em rota não traduzida volta para a rota sem prefixo', () => {
    const r = middleware(documento('/en/profile')) as Response;

    expect(r.status).toBe(308);
    expect(destino(r)).toContain('/profile');
  });

  it('o sufixo interno /filtered não é endereço público', () => {
    const r = middleware(documento('/works/filtered')) as Response;

    expect(r.status).toBe(308);
    expect(destino(r)).toMatch(/\/works$/);
  });

  // O robô do Google não manda cookie: ele precisa receber cada idioma no seu
  // endereço, sem nunca ser redirecionado.
  it('o redirecionamento por preferência não é cacheável', () => {
    const r = middleware(
      documento('/composers', cookieDeIdioma('en'))
    ) as Response;

    expect(r.headers.get('cache-control')).toContain('no-store');
  });
});

describe('troca de idioma sem sair da URL', () => {
  it('no caminho limpo, o pedido do roteador serve inglês sem redirecionar', () => {
    const r = middleware(
      doRoteador('/composers', cookieDeIdioma('en'))
    ) as Response;

    expect(r.status).not.toBe(307);
    expect(reescritaPara(r)).toBe('/en/composers');
  });

  it('em /en, o pedido do roteador serve português sem redirecionar', () => {
    const r = middleware(
      doRoteador('/en/composers', cookieDeIdioma('pt'))
    ) as Response;

    expect(r.status).not.toBe(307);
    expect(reescritaPara(r)).toBe('/pt/composers');
  });
});

describe('rota com filtro', () => {
  it('com query, a variante dinâmica é usada por baixo', () => {
    const r = middleware(documento('/works?epoch=barroco')) as Response;

    expect(reescritaPara(r)).toBe('/pt/works/filtered');
  });
});
