import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/auth/session-refresh/route';

/**
 * A rota que renova a sessão numa navegação de página — e, quando não
 * consegue, **tem de apagar a dica de sessão**.
 *
 * Não é higiene: é o que impede o laço de redirecionamento. O middleware manda
 * para cá quem tem a dica sem token de acesso válido; se ela sobreviver à
 * falha, a próxima navegação vem parar aqui de novo, e a seguinte também.
 */
function pedido(next = '/composers') {
  return new NextRequest(
    `https://hml.opusatlas.com.br/api/auth/session-refresh?next=${encodeURIComponent(next)}`,
    { headers: { cookie: 'opus_session=1' } }
  );
}

function cookiesApagados(response: Response, nome: string): string[] {
  return response.headers
    .getSetCookie()
    .filter((c) => c.startsWith(`${nome}=;`));
}

describe('GET /api/auth/session-refresh', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('com a renovação recusada, apaga a dica em todos os domínios possíveis', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 401 }))
    );

    const response = await GET(pedido());
    const apagados = cookiesApagados(response, 'opus_session');

    // O cookie é da API: o navegador só apaga o que casa nome, domínio e
    // caminho, e daqui não dá para saber qual `domain` ela usou.
    expect(apagados.some((c) => !c.includes('Domain='))).toBe(true);
    expect(
      apagados.some((c) => c.includes('Domain=.hml.opusatlas.com.br'))
    ).toBe(true);
    expect(apagados.some((c) => c.includes('Domain=.opusatlas.com.br'))).toBe(
      true
    );
  });

  it('apaga também o token de acesso', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 401 }))
    );

    const response = await GET(pedido());

    expect(
      cookiesApagados(response, 'opus_access_token').length
    ).toBeGreaterThan(0);
  });

  it('marca a falha, para o middleware não devolver a pessoa para cá', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 401 }))
    );

    const response = await GET(pedido());
    const marcador = response.headers
      .getSetCookie()
      .find((c) => c.startsWith('opus_refresh_failed=1'));

    expect(marcador).toBeDefined();
    expect(marcador).toContain('Max-Age=120');
  });

  it('a API fora do ar é tratada como falha, não derruba a página', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('conexão recusada');
      })
    );

    const response = await GET(pedido());

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/composers');
  });

  it('com a renovação aceita, repassa os cookies novos e não apaga nada', async () => {
    const renovado = new Response('', { status: 200 });
    renovado.headers.append(
      'set-cookie',
      'opus_access_token=novo; Path=/; HttpOnly'
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => renovado)
    );

    const response = await GET(pedido());
    const enviados = response.headers.getSetCookie();

    expect(enviados.some((c) => c.startsWith('opus_access_token=novo'))).toBe(
      true
    );
    expect(cookiesApagados(response, 'opus_session')).toHaveLength(0);
  });

  it('só volta para caminho do próprio site', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 200 }))
    );

    const response = await GET(pedido('//site-falso.com/'));

    expect(response.headers.get('location')).toBe(
      'https://hml.opusatlas.com.br/'
    );
  });
});
