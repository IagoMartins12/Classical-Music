import { describe, expect, it } from 'vitest';
import { INSTRUMENTS_EN } from './instruments.en';
import { INSTRUMENTS_PT } from './instruments.pt';

const OBJECT_ID = /^[a-f\d]{24}$/i;

describe('where to start listening, per instrument', () => {
  it('has four pieces each, in both languages', () => {
    for (const chapter of [...INSTRUMENTS_PT, ...INSTRUMENTS_EN]) {
      expect(chapter.listenFirst, chapter.key).toHaveLength(4);
    }
  });

  // The two files are written by hand, side by side: a link fixed in one and
  // forgotten in the other would send the English page somewhere else.
  it('points both languages to the same works and composers', () => {
    const links = (chapters: typeof INSTRUMENTS_PT) =>
      chapters.map((c) =>
        c.listenFirst.map((item) => item.workId ?? item.composerId ?? null)
      );
    expect(links(INSTRUMENTS_EN)).toEqual(links(INSTRUMENTS_PT));
  });

  it('keeps every id a database id, and never both for one piece', () => {
    for (const chapter of INSTRUMENTS_PT) {
      for (const item of chapter.listenFirst) {
        for (const id of [item.workId, item.composerId]) {
          if (id) expect(id, item.work).toMatch(OBJECT_ID);
        }
        expect(!(item.workId && item.composerId), item.work).toBe(true);
      }
    }
  });

  it('opens almost every piece in the catalog (the rest fall back to the search)', () => {
    const items = INSTRUMENTS_PT.flatMap((c) => c.listenFirst);
    const linked = items.filter((i) => i.workId || i.composerId).length;
    expect(linked).toBeGreaterThanOrEqual(60);
  });
});
