import { describe, expect, it } from 'vitest';
import { listaDeNomes, nomePopularCurto, popularNames } from './workTitle';

const luar = {
  popularName: 'Sonata ao Luar',
  popularNameEn: 'Moonlight Sonata',
  famousParts: [],
  famousPartsEn: [],
};
const estudos = {
  popularName: null,
  popularNameEn: null,
  famousParts: ['Estudo Revolucionário (nº 12)', 'Tristesse (nº 3)'],
  famousPartsEn: ['Revolutionary Étude (No.12)', 'Tristesse (No.3)'],
};

describe('nomes populares', () => {
  it('cada idioma mostra os seus nomes', () => {
    expect(popularNames(luar, 'pt').name).toBe('Sonata ao Luar');
    expect(popularNames(luar, 'en').name).toBe('Moonlight Sonata');
    // Sem nome em inglês, a página em inglês não mostra o português.
    expect(popularNames({ popularName: 'Para Elisa' }, 'en').name).toBeNull();
  });

  it('na lista: o nome popular, ou a primeira parte famosa', () => {
    expect(nomePopularCurto(luar, 'pt')).toBe('Sonata ao Luar');
    expect(nomePopularCurto(estudos, 'pt')).toBe(
      'Inclui Estudo Revolucionário…'
    );
    expect(nomePopularCurto(estudos, 'en')).toBe(
      'Includes Revolutionary Étude…'
    );
    expect(nomePopularCurto({}, 'pt')).toBeNull();
  });

  it('junta os nomes como se fala', () => {
    expect(listaDeNomes(['A', 'B', 'C'], 'pt')).toBe('A, B e C');
    expect(listaDeNomes(['A', 'B'], 'en')).toBe('A and B');
  });
});
