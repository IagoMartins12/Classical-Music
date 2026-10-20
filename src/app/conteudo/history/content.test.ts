import { describe, expect, it } from 'vitest';
import { ERAS } from '../site/eras';
import { INSTRUMENTS_EN } from '../instruments/instruments.en';
import { INSTRUMENTS_PT } from '../instruments/instruments.pt';
import { INSTRUMENTS } from '../instruments/meta';
import { ERAS_EN } from './eras.en';
import { ERAS_PT } from './eras.pt';

/** Every string inside a chapter, however deep. */
const strings = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value]
    : Array.isArray(value)
      ? value.flatMap(strings)
      : value && typeof value === 'object'
        ? Object.values(value).flatMap(strings)
        : [];

describe.each([
  ['history', ERAS.map((e) => e.key), ERAS_PT, ERAS_EN],
  [
    'instruments',
    INSTRUMENTS.map((i) => i.key),
    INSTRUMENTS_PT,
    INSTRUMENTS_EN,
  ],
] as const)('%s content', (_name, keys, pt, en) => {
  it('has every chapter in both languages, in the same order', () => {
    expect(pt.map((c) => c.key)).toEqual(keys);
    expect(en.map((c) => c.key)).toEqual(keys);
  });

  it('keeps the same shape in both languages', () => {
    pt.forEach((chapter, i) => {
      const other = en[i] as typeof chapter;
      for (const field of Object.keys(chapter) as (keyof typeof chapter)[]) {
        const a = chapter[field];
        const b = other[field];
        if (Array.isArray(a))
          expect(
            (b as unknown[]).length,
            `${chapter.key}.${String(field)}`
          ).toBe(a.length);
      }
    });
  });

  it('has no empty text and no dashes used as punctuation', () => {
    for (const text of [...pt, ...en].flatMap(strings)) {
      expect(text.trim().length).toBeGreaterThan(0);
      expect(text).not.toMatch(/ — | – |--/);
    }
  });
});

describe('where to start listening', () => {
  it('points both languages to the same works and composers', () => {
    const links = (chapters: typeof ERAS_PT) =>
      chapters.flatMap((c) =>
        c.listenFirst.map((item) => item.workId ?? item.composerId ?? null)
      );
    expect(links(ERAS_EN)).toEqual(links(ERAS_PT));
  });
});
