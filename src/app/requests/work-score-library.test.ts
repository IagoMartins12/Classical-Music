import { describe, expect, it } from 'vitest';
import { organizeScores, type ScoreFile } from './work-score-library';

const file = (over: Partial<ScoreFile>): ScoreFile => ({
  id: Math.random().toString(36).slice(2),
  source: 'IMSLP',
  sourceId: 'x',
  title: 'Partitura Completa',
  fileFormat: 'pdf',
  type: 'SCORES',
  ...over,
});

describe('organizeScores', () => {
  it('groups by kind, section (group title) and edition (group index)', () => {
    const library = organizeScores({
      total: 4,
      hasMore: false,
      imslp: { status: 'stored' },
      scores: [
        file({ groupIndex: 2, groupTitle: 'Completa' }),
        file({ groupIndex: 1, groupTitle: 'Completa', publisher: 'Breitkopf' }),
        file({ groupIndex: 1, groupTitle: 'Completa', title: 'Parte' }),
        file({
          type: 'ARRANGEMENTS',
          groupIndex: 5,
          groupTitle: 'Para violão',
        }),
      ],
    });
    expect(library.shelves.map((s) => s.kind)).toEqual([
      'scores',
      'arrangements',
    ]);
    const [complete] = library.shelves[0].sections;
    expect(complete.editions.map((e) => e.files.length)).toEqual([2, 1]);
    expect(complete.editions[0].publisher).toBe('Breitkopf');
    expect(library.shelves[0].editions).toBe(2);
  });

  it('puts community uploads first, one edition each', () => {
    const library = organizeScores({
      total: 3,
      hasMore: false,
      scores: [
        file({ groupIndex: 1, groupTitle: 'Completa' }),
        file({ source: 'UPLOAD', groupIndex: null }),
        file({ source: 'UPLOAD', groupIndex: null }),
      ],
    });
    const [first, second] = library.shelves[0].sections;
    expect(first.community).toBe(true);
    expect(first.editions).toHaveLength(2);
    expect(second.title).toBe('Completa');
    expect(library.status).toBe('stored');
  });

  it('reports "none" when there is nothing and no IMSLP status', () => {
    expect(organizeScores({ total: 0, hasMore: false, scores: [] })).toEqual({
      status: 'none',
      shelves: [],
    });
  });
});
