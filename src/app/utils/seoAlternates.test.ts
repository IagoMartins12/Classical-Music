import { describe, expect, it } from 'vitest';
import { SITE_URL, alternatesFor } from './seoAlternates';

/**
 * O `hreflang` já esteve errado uma vez — apontava o inglês para
 * `opusatlas.com`, domínio que não existe — e ninguém percebeu, porque nada
 * no site quebra por causa disso: só o buscador, que nunca indexou o inglês.
 */
describe('alternatesFor', () => {
  it('em português, canônico é o caminho limpo', () => {
    const a = alternatesFor('/composers', 'pt');

    expect(a?.canonical).toBe(`${SITE_URL}/composers`);
    expect(a?.languages).toEqual({
      'pt-BR': `${SITE_URL}/composers`,
      'en-US': `${SITE_URL}/en/composers`,
      'x-default': `${SITE_URL}/composers`,
    });
  });

  it('em inglês, canônico é o próprio endereço em inglês', () => {
    expect(alternatesFor('/composers', 'en')?.canonical).toBe(
      `${SITE_URL}/en/composers`
    );
  });

  it('a home não vira barra dupla', () => {
    const a = alternatesFor('/', 'pt');

    expect(a?.canonical).toBe(SITE_URL);
    expect(a?.languages?.['en-US']).toBe(`${SITE_URL}/en`);
  });

  it('funciona com caminho de detalhe', () => {
    expect(alternatesFor('/works/abc123', 'en')?.canonical).toBe(
      `${SITE_URL}/en/works/abc123`
    );
  });
});
