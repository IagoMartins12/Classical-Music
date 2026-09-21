import { describe, expect, it } from 'vitest';
import { OPTIMIZED_IMAGE_HOSTS, isOptimizableImageSrc } from './imageHosts';

/**
 * Esta lista tem duas faces, e as duas custam se alguém as trocar sem
 * perceber: host a mais abre o `/_next/image` para redimensionar imagem de
 * qualquer lugar da internet às nossas custas; host a menos faz a imagem
 * passar crua, sem otimização, o que só aparece na conta de banda.
 */
describe('isOptimizableImageSrc', () => {
  it('otimiza os hosts conhecidos', () => {
    expect(isOptimizableImageSrc('https://imslp.org/a.jpg')).toBe(true);
    expect(isOptimizableImageSrc('https://cdn.imslp.org/a.jpg')).toBe(true);
    expect(isOptimizableImageSrc('https://res.cloudinary.com/x/a.png')).toBe(
      true
    );
    expect(isOptimizableImageSrc('https://i.scdn.co/image/abc')).toBe(true);
  });

  it('aceita subdomínio de host conhecido', () => {
    expect(isOptimizableImageSrc('https://algo.imslp.org/a.jpg')).toBe(true);
  });

  // O caso que motivou o escape: capa de matéria colada de um site qualquer.
  it('deixa passar sem otimizar o host desconhecido', () => {
    expect(
      isOptimizableImageSrc('https://blog.fritzdobbert.com.br/a.png')
    ).toBe(false);
    expect(isOptimizableImageSrc('https://exemplo-invasor.com/a.jpg')).toBe(
      false
    );
  });

  it('otimiza caminho local e recusa dado embutido', () => {
    expect(isOptimizableImageSrc('/logo.png')).toBe(true);
    expect(isOptimizableImageSrc('data:image/png;base64,AAA')).toBe(false);
    expect(isOptimizableImageSrc('blob:https://site/abc')).toBe(false);
  });

  it('import estático (não string) é otimizável', () => {
    expect(isOptimizableImageSrc({ src: '/x.png' })).toBe(true);
  });

  // Um host que não seja `https` não deveria estar na lista: o
  // `remotePatterns` do `next.config.ts` só declara `https`.
  it('a lista não tem protocolo nem barra', () => {
    for (const host of OPTIMIZED_IMAGE_HOSTS) {
      expect(host).not.toContain('/');
      expect(host).not.toContain(':');
    }
  });
});
