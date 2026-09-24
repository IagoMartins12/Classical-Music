import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

/**
 * A renovação de sessão antes da página.
 *
 * **Por que tem teste.** Este é o caminho que quase quebrou sem ninguém notar
 * quando o NextAuth saiu: o token de acesso vive 15 minutos e o navegador o
 * descarta ao vencer; o de renovação tem `path=/api/auth` e nunca chega ao
 * servidor do Next. Sem o marcador `opus_session`, o middleware não distingue
 * visitante de sessão vencida, e a pessoa abre a página como deslogada —
 * silenciosamente, e só depois de 15 minutos ociosa.
 */

/** Um JWT que não é conferido aqui: o middleware só lê a validade. */
function tokenQueVence(emSegundos: number) {
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + emSegundos })
  ).toString('base64url');

  return `cabecalho.${payload}.assinatura`;
}

function visita(caminho: string, cookies: Record<string, string>) {
  const cookie = Object.entries(cookies)
    .map(([nome, valor]) => `${nome}=${valor}`)
    .join('; ');

  return new NextRequest(`https://opusatlas.com.br${caminho}`, {
    headers: {
      accept: 'text/html',
      'sec-fetch-dest': 'document',
      ...(cookie ? { cookie } : {}),
    },
  });
}

describe('renovação de sessão', () => {
  it('com marcador e token vencido, passa pela renovação antes da página', () => {
    const r = middleware(
      visita('/favorites', {
        opus_session: '1',
        opus_access_token: tokenQueVence(-60),
      })
    ) as Response;

    const destino = r.headers.get('location') ?? '';

    expect(destino).toContain('/api/auth/session-refresh');
    expect(destino).toContain('next=%2Ffavorites');
  });

  it('com token válido, não renova', () => {
    const r = middleware(
      visita('/favorites', {
        opus_session: '1',
        opus_access_token: tokenQueVence(600),
      })
    ) as Response;

    expect(r.headers.get('location')).toBeNull();
  });

  it('sem marcador, visitante não é mandado renovar', () => {
    const r = middleware(visita('/favorites', {})) as Response;

    expect(r.headers.get('location')).toBeNull();
  });

  // Token que vence em segundos é tratado como vencido: renovar depois de a
  // página já ter começado a renderizar não adianta.
  it('token à beira do vencimento conta como vencido', () => {
    const r = middleware(
      visita('/favorites', {
        opus_session: '1',
        opus_access_token: tokenQueVence(10),
      })
    ) as Response;

    expect(r.headers.get('location')).toContain('/api/auth/session-refresh');
  });

  it('token ilegível não derruba o middleware', () => {
    const r = middleware(
      visita('/favorites', { opus_session: '1', opus_access_token: 'lixo' })
    ) as Response;

    expect(r.headers.get('location')).toContain('/api/auth/session-refresh');
  });

  /**
   * O laço que tirou o site do ar num celular: sessão parada tempo demais, o
   * refresh token vencido junto com o de acesso, e a renovação devolvendo a
   * pessoa a uma página que a mandava renovar de novo — `ERR_TOO_MANY_REDIRECTS`
   * em toda navegação, só no aparelho que tinha o cookie velho.
   */
  it('depois de a renovação falhar, não manda renovar outra vez', () => {
    const r = middleware(
      visita('/favorites', {
        opus_session: '1',
        opus_access_token: tokenQueVence(-60),
        opus_refresh_failed: '1',
      })
    ) as Response;

    expect(r.headers.get('location')).toBeNull();
  });

  it('o marcador de falha não derruba quem tem token válido', () => {
    const r = middleware(
      visita('/favorites', {
        opus_session: '1',
        opus_access_token: tokenQueVence(600),
        opus_refresh_failed: '1',
      })
    ) as Response;

    expect(r.headers.get('location')).toBeNull();
  });

  it('o painel sem sessão nenhuma vai para o login, com o destino guardado', () => {
    const r = middleware(visita('/admin/users', {})) as Response;
    const destino = r.headers.get('location') ?? '';

    expect(destino).toContain('/login');
    expect(destino).toContain('callbackUrl=%2Fadmin%2Fusers');
  });
});
