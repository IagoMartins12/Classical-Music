import { describe, expect, it } from 'vitest';
import { anosDeVida, dataIso, resumo, urlDe } from './seo';

describe('seo', () => {
  it('resumo corta numa frase ou numa palavra, nunca no meio', () => {
    expect(resumo('Curto.')).toBe('Curto.');
    const longo = `${'Primeira frase com bastante coisa dentro dela, '.repeat(2)}fim. ${'outra '.repeat(30)}`;
    expect(resumo(longo).endsWith('fim.')).toBe(true);
    const semPonto = 'palavra '.repeat(40);
    const r = resumo(semPonto);
    expect(r.length).toBeLessThanOrEqual(158);
    expect(r.endsWith('palavra…')).toBe(true);
  });

  it('datas em ISO 8601, com o que houver', () => {
    expect(dataIso({ year: 1770, month: 12, day: 16 })).toBe('1770-12-16');
    expect(dataIso({ year: 1770, month: 12 })).toBe('1770-12');
    expect(dataIso({ year: 1770 })).toBe('1770');
    expect(dataIso(null)).toBeUndefined();
  });

  it('anos de vida e endereço no idioma', () => {
    expect(anosDeVida(1770, 1827, 'pt')).toBe('1770–1827');
    expect(anosDeVida(1950, null, 'en')).toBe('b. 1950');
    expect(urlDe('/', 'pt')).toBe('https://opusatlas.com.br');
    expect(urlDe('/composer/x', 'en')).toBe(
      'https://opusatlas.com.br/en/composer/x'
    );
  });
});
