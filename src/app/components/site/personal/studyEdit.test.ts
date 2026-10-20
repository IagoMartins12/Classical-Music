import { describe, expect, it } from 'vitest';
import type {
  LearnedItem,
  WantToLearnItem,
} from '@/app/stores/useLearningStore';
import { daysUntil, studyEditParams } from './studyEdit';

const work = {
  id: 'w1',
  title: 'Noturno',
  composer: { name: 'Chopin', fullName: 'Frédéric Chopin' },
  instrument: { name: 'Piano' },
};

describe('studyEditParams', () => {
  it('carries the want-to-learn fields and the chosen score', () => {
    const item = {
      id: '1',
      userId: 'u',
      workId: 'w1',
      priority: 4,
      addedAt: '',
      epochName: 'Romântico',
      targetDate: '2026-12-01T00:00:00.000Z',
      work,
      selectedWorkScore: {
        id: 's1',
        sourceId: 'x',
        source: 'IMSLP',
        title: 'Edição 1',
        fileFormat: 'pdf',
        type: 'SCORES',
      },
    } as WantToLearnItem;
    const params = studyEditParams(item, 'want-to-learn');
    expect(params).toMatchObject({
      workTitle: 'Noturno',
      composerName: 'Frédéric Chopin',
      instrumentName: 'Piano',
      isCurrentlyActive: true,
      initialWantToLearnData: { priority: 4, targetDate: '2026-12-01' },
      initialWorkScore: { title: 'Edição 1' },
    });
  });

  it('defaults "would recommend" to yes for learned works', () => {
    const item = {
      id: '2',
      userId: 'u',
      workId: 'w1',
      learnedAt: '',
      mastery: 3,
      epochName: '',
      work,
    } as LearnedItem;
    expect(studyEditParams(item, 'learned')).toMatchObject({
      initialLearnedData: { mastery: 3, wouldRecommend: true },
      initialWorkScore: null,
    });
  });
});

describe('daysUntil', () => {
  it('counts whole days, negative once passed', () => {
    const now = new Date(2026, 9, 8, 15, 0);
    expect(daysUntil('2026-10-08', now)).toBe(0);
    expect(daysUntil('2026-10-11T00:00:00Z', now)).toBe(3);
    expect(daysUntil('2026-10-01', now)).toBe(-7);
  });
});
