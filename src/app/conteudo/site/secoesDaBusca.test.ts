import { describe, expect, it } from 'vitest';
import { findSections } from './secoesDaBusca';

const keys = (term: string, lang: 'pt' | 'en' = 'pt') =>
  findSections(term, lang).map((s) => `${s.kind}:${s.key}`);

describe('instrumentos e épocas na busca', () => {
  it('acha o instrumento nas duas línguas', () => {
    expect(keys('piano')).toEqual(['instruments:piano']);
    expect(keys('violin')).toContain('instruments:violin');
    expect(keys('violino', 'en')).toContain('instruments:violin');
    expect(keys('cello')).toEqual(['instruments:cello']);
    expect(keys('violão')).toEqual(['instruments:guitar']);
    expect(keys('orgao')).toEqual(['instruments:organ']);
  });

  it('acha a época nas duas línguas e pelo nome com sufixo', () => {
    expect(keys('barroco')).toEqual(['eras:baroque']);
    expect(keys('baroque', 'pt')).toEqual(['eras:baroque']);
    expect(keys('romantic')).toEqual(['eras:romantic']);
    expect(keys('romântico')).toEqual(['eras:romantic']);
    expect(keys('renascimento')).toEqual(['eras:renaissance']);
  });

  it('mostra o nome na língua da página', () => {
    expect(findSections('barroco', 'en')[0].name).toBe('Baroque');
    expect(findSections('baroque', 'pt')[0].name).toBe('Barroco');
  });

  it('não inventa: termo curto ou de compositor não casa', () => {
    expect(keys('pi')).toEqual([]);
    expect(keys('bach')).toEqual([]);
    expect(keys('sonata ao luar')).toEqual([]);
  });
});
