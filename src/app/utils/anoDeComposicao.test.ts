import { describe, expect, it } from 'vitest';
import { escreverAno, lerAno, mostrarAno } from './anoDeComposicao';

describe('ano de composição', () => {
  it('lê as formas do acervo', () => {
    expect(lerAno('1830').ano).toEqual({
      inicio: 1830,
      fim: null,
      aproximado: false,
    });
    expect(lerAno('1830-32').ano).toMatchObject({ inicio: 1830, fim: 1832 });
    expect(lerAno('1829-5').ano).toMatchObject({ fim: 1835 });
    expect(lerAno('1830–1835').ano).toMatchObject({ fim: 1835 });
    expect(lerAno('1845 ca.').ano?.aproximado).toBe(true);
    expect(lerAno('ca.1845').ano?.aproximado).toBe(true);
    expect(lerAno('1835?').ano?.aproximado).toBe(true);
  });

  it('o que o seletor não guarda fica como estava, avisando', () => {
    expect(lerAno('1837, Paris')).toEqual({
      ano: { inicio: 1837, fim: null, aproximado: false },
      inexato: true,
    });
    expect(lerAno('')).toEqual({ ano: null, inexato: false });
  });

  it('escreve na forma do banco e mostra no campo', () => {
    const a = { inicio: 1830, fim: 1835, aproximado: true };
    expect(escreverAno(a)).toBe('1830-1835 ca.');
    expect(mostrarAno(a)).toBe('c. 1830–1835');
    expect(escreverAno({ inicio: 1830, fim: null, aproximado: false })).toBe(
      '1830'
    );
    for (const t of ['1830', '1830-1835', '1845 ca.'])
      expect(escreverAno(lerAno(t).ano!)).toBe(t);
  });
});
