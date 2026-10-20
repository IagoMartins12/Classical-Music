import { describe, expect, it } from 'vitest';
import { ageAt, formatDateParts, levelLabel, COMPOSER } from './composer';

describe('formatDateParts', () => {
  it('writes as much of the date as the record has', () => {
    expect(formatDateParts({ year: 1810, month: 3, day: 1 }, 'pt')).toBe(
      '1 de março de 1810'
    );
    expect(formatDateParts({ year: 1810, month: 3, day: null }, 'en')).toBe(
      'March 1810'
    );
    expect(formatDateParts({ year: 1810, month: null, day: null }, 'pt')).toBe(
      '1810'
    );
    expect(
      formatDateParts({ year: null, month: null, day: null }, 'pt')
    ).toBeNull();
  });
});

describe('ageAt', () => {
  it('counts whole years, minus one before the birthday', () => {
    expect(
      ageAt(
        { year: 1810, month: 3, day: 1 },
        { year: 1849, month: 10, day: 17 }
      )
    ).toBe(39);
    expect(
      ageAt(
        { year: 1771, month: 10, day: 1 },
        { year: 1842, month: 9, day: 15 }
      )
    ).toBe(70);
  });
  it('falls back to the year difference, and refuses nonsense', () => {
    expect(
      ageAt(
        { year: 1810, month: null, day: null },
        { year: 1849, month: null, day: null }
      )
    ).toBe(39);
    expect(
      ageAt(
        { year: 1900, month: null, day: null },
        { year: 1800, month: null, day: null }
      )
    ).toBeNull();
  });
});

describe('levelLabel', () => {
  it('maps IMSLP difficulty to three levels', () => {
    const copy = COMPOSER.pt;
    expect([2, 6, 11, null].map((d) => levelLabel(d, copy))).toEqual([
      'Iniciante',
      'Intermediário',
      'Avançado',
      null,
    ]);
  });
});
