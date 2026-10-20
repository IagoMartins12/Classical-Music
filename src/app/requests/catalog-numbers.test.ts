import { describe, expect, it } from 'vitest';
import { compacto } from './catalog-numbers';

describe('compacto', () => {
  it('rounds down, so the "+" is true', () => {
    expect(compacto(207_891)).toBe('200k+');
    expect(compacto(19_130)).toBe('19k+');
    expect(compacto(92_278)).toBe('92k+');
    expect(compacto(999)).toBe('999');
  });
});
