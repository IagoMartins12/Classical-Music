import { afterEach, describe, expect, it, vi } from 'vitest';

async function gerar() {
  vi.resetModules();
  const { default: robots } = await import('./robots');
  return robots();
}

type Regra = {
  userAgent?: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
};

const regras = (r: Awaited<ReturnType<typeof gerar>>): Regra[] =>
  Array.isArray(r.rules) ? r.rules : [r.rules];

const lista = (v?: string | string[]) => (v === undefined ? [] : [v].flat());

describe('robots', () => {
  afterEach(() => vi.unstubAllEnvs());

  describe('produção', () => {
    it('aponta para o sitemap que existe', async () => {
      vi.stubEnv('SITE_NOINDEX', '');
      expect((await gerar()).sitemap).toBe(
        'https://opusatlas.com.br/sitemap.xml'
      );
    });

    it('não bloqueia o CSS e o JS de que o Google precisa para renderizar', async () => {
      vi.stubEnv('SITE_NOINDEX', '');
      const bloqueios = regras(await gerar()).flatMap((r) => lista(r.disallow));
      expect(bloqueios.some((d) => d.startsWith('/_next'))).toBe(false);
    });

    /**
     * Robô nomeado num grupo deixa de ler o grupo `*`. Todo grupo que libera
     * o site tem de repetir os bloqueios da área privada.
     */
    it('toda regra que libera o site também bloqueia a área privada', async () => {
      vi.stubEnv('SITE_NOINDEX', '');
      for (const regra of regras(await gerar())) {
        if (lista(regra.allow).includes('/')) {
          expect(lista(regra.disallow)).toEqual(
            expect.arrayContaining(['/admin/', '/api/'])
          );
        }
      }
    });

    it('não dá grupo próprio ao Googlebot', async () => {
      vi.stubEnv('SITE_NOINDEX', '');
      const nomeados = regras(await gerar()).flatMap((r) => lista(r.userAgent));
      expect(nomeados).not.toContain('Googlebot');
    });

    it('mantém o bloqueio dos robôs de IA', async () => {
      vi.stubEnv('SITE_NOINDEX', '');
      const ia = regras(await gerar()).find((r) =>
        lista(r.userAgent).includes('GPTBot')
      );
      expect(ia?.disallow).toBe('/');
    });
  });

  describe('homologação', () => {
    it('bloqueia tudo e não anuncia sitemap', async () => {
      vi.stubEnv('SITE_NOINDEX', 'true');
      const r = await gerar();
      expect(r.rules).toEqual({ userAgent: '*', disallow: '/' });
      expect(r.sitemap).toBeUndefined();
    });
  });
});
