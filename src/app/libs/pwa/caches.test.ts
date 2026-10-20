import { describe, expect, it } from 'vitest';
import { ehApiFresca, ehApiPessoal } from './caches';

describe('ehApiFresca', () => {
  it.each([
    '/api/works/68600fb6df23f271f94bb803/scores',
    '/api/works/68600fb6df23f271f94bb803/scores/imslp-status',
    '/api/composers/abc/curiosities',
    '/api/contributions',
  ])('pede a rede primeiro em %s', (path) => {
    expect(ehApiFresca(path)).toBe(true);
  });

  it.each(['/api/works/abc', '/api/works/catalog', '/api/composers/abc'])(
    'deixa %s no stale-while-revalidate',
    (path) => {
      expect(ehApiFresca(path)).toBe(false);
    }
  );

  it('conquistas seguem como leitura pessoal', () => {
    expect(ehApiPessoal('/api/achievements/new')).toBe(true);
  });
});
