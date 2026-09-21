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
});
