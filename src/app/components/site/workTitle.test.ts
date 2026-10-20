import { describe, expect, it } from 'vitest';
import { workTitle } from './workTitle';

describe('workTitle', () => {
  it('appends the catalog number when missing', () => {
    expect(workTitle('Ballade No.1', 'Op.23')).toBe('Ballade No.1, Op.23');
  });
  it('does not repeat a number the title already has', () => {
    expect(workTitle('Ballade No.1, Op.23', 'Op.23')).toBe(
      'Ballade No.1, Op.23'
    );
    expect(workTitle('Nocturnes, Op. 9', 'Op.9')).toBe('Nocturnes, Op. 9');
  });
  it('keeps the title alone without a number', () => {
    expect(workTitle('Berceuse', null)).toBe('Berceuse');
  });
});

describe('workTitle punctuation', () => {
  it('ignores spaces, dots and commas when comparing', () => {
    expect(workTitle('Prelude op 28 no 4', 'Op.28, no. 4')).toBe(
      'Prelude op 28 no 4'
    );
  });
});
