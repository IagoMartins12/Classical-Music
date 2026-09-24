import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Os nomes precisam bater com os que a API grava. Divergir não dá erro: dá
 * login que parece funcionar e volta deslogado.
 */
async function carregar() {
  vi.resetModules();
  return import('./authCookies');
}

describe('authCookies', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('usa os nomes de produção quando nada é configurado', async () => {
    vi.stubEnv('NEXT_PUBLIC_AUTH_COOKIE_PREFIX', '');
    const cookies = await carregar();

    expect(cookies.ACCESS_TOKEN_COOKIE).toBe('opus_access_token');
    expect(cookies.SESSION_HINT_COOKIE).toBe('opus_session');
  });

  it('isola a homologação com o prefixo próprio', async () => {
    vi.stubEnv('NEXT_PUBLIC_AUTH_COOKIE_PREFIX', 'opus_hml');
    const cookies = await carregar();

    expect(cookies.ACCESS_TOKEN_COOKIE).toBe('opus_hml_access_token');
    expect(cookies.SESSION_HINT_COOKIE).toBe('opus_hml_session');
  });

  it.each(['opus', 'opus_hml', 'a1'])('aceita "%s"', async (prefixo) => {
    const { AUTH_COOKIE_PREFIX_PATTERN } = await carregar();
    expect(AUTH_COOKIE_PREFIX_PATTERN.test(prefixo)).toBe(true);
  });

  it.each(['Opus', 'opus-hml', 'opus hml', '1opus', ''])(
    'recusa "%s"',
    async (prefixo) => {
      const { AUTH_COOKIE_PREFIX_PATTERN } = await carregar();
      expect(AUTH_COOKIE_PREFIX_PATTERN.test(prefixo)).toBe(false);
    }
  );

  it('dá ao marcador de falha o mesmo prefixo dos outros', async () => {
    vi.stubEnv('NEXT_PUBLIC_AUTH_COOKIE_PREFIX', 'opus_hml');
    const cookies = await carregar();

    expect(cookies.REFRESH_FAILED_COOKIE).toBe('opus_hml_refresh_failed');
  });

  it('não repete o nome de nenhum cookie da API', async () => {
    // Dois cookies com o mesmo nome (um host-only, outro de domínio) chegam
    // juntos e a leitura vira sorteio — o defeito que o prefixo evita.
    const cookies = await carregar();
    const nomes = [
      cookies.ACCESS_TOKEN_COOKIE,
      cookies.SESSION_HINT_COOKIE,
      cookies.REFRESH_FAILED_COOKIE,
    ];

    expect(new Set(nomes).size).toBe(nomes.length);
  });
});

/**
 * O cookie a apagar foi gravado pela API, com um `domain` que este lado não
 * conhece. Errar o domínio não dá erro: o cookie fica de pé — e era isso que
 * deixava o laço de redirecionamento em pé junto.
 */
describe('cookieDomains', () => {
  it('cobre o subdomínio e o domínio pai da homologação', async () => {
    const { cookieDomains } = await carregar();

    expect(cookieDomains('hml.opusatlas.com.br')).toEqual([
      undefined,
      '.hml.opusatlas.com.br',
      '.opusatlas.com.br',
    ]);
  });

  it('cobre o www e o domínio nu de produção', async () => {
    const { cookieDomains } = await carregar();

    expect(cookieDomains('www.opusatlas.com.br')).toContain(
      '.opusatlas.com.br'
    );
    expect(cookieDomains('opusatlas.com.br')).toEqual([
      undefined,
      '.opusatlas.com.br',
    ]);
  });

  it('não tenta apagar cookie de sufixo público', async () => {
    // `.com.br` o navegador recusa; subir até lá seria mirar em terceiros.
    const { cookieDomains } = await carregar();

    expect(cookieDomains('hml.opusatlas.com.br')).not.toContain('.com.br');
    expect(cookieDomains('opusatlas.com.br')).not.toContain('.com.br');
  });

  it('em localhost só apaga o host-only', async () => {
    const { cookieDomains } = await carregar();

    expect(cookieDomains('localhost')).toEqual([undefined]);
  });

  it('sempre inclui o host-only primeiro', async () => {
    const { cookieDomains } = await carregar();

    for (const host of ['localhost', 'opusatlas.com.br', 'a.b.c.d.com']) {
      expect(cookieDomains(host)[0]).toBeUndefined();
    }
  });
});
