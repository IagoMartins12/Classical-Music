import { describe, expect, it } from 'vitest';
import type { CalendarEventData } from '@/app/requests/calendar-requests';
import { homeConcerts } from './homeConcerts';

const event = (id: string, start: string, showOnMainHome = false) =>
  ({
    id,
    start: new Date(start),
    end: new Date(new Date(start).getTime() + 2 * 3_600_000),
    timeZone: 'America/Sao_Paulo',
    showOnMainHome,
  }) as CalendarEventData;

const NOW = new Date('2026-10-08T15:00:00Z');

describe('homeConcerts', () => {
  it('puts this month picks first, then the rest by date', () => {
    const list = homeConcerts(
      [
        event('a', '2026-10-10T22:00:00Z'),
        event('b', '2026-10-28T22:00:00Z', true),
        event('c', '2026-10-09T22:00:00Z'),
      ],
      NOW,
      4
    );
    expect(list.map((e) => e.id)).toEqual(['b', 'c', 'a']);
  });

  it('ignores picks from another month and past events', () => {
    const list = homeConcerts(
      [
        event('past', '2026-10-01T22:00:00Z', true),
        event('nov', '2026-11-05T22:00:00Z', true),
        event('oct', '2026-10-20T22:00:00Z'),
      ],
      NOW,
      4
    );
    expect(list.map((e) => e.id)).toEqual(['oct', 'nov']);
  });

  it('leaves out what started long ago, even if it is still running', () => {
    const running = {
      ...event('expo', '2026-03-08T13:00:00Z'),
      end: new Date('2026-12-31T20:00:00Z'),
    };
    const list = homeConcerts(
      [running, event('next', '2026-10-12T22:00:00Z')],
      NOW,
      4
    );
    expect(list.map((e) => e.id)).toEqual(['next']);
  });

  it('keeps to the limit', () => {
    const list = homeConcerts(
      ['11', '12', '13'].map((d) => event(d, `2026-10-${d}T22:00:00Z`)),
      NOW,
      2
    );
    expect(list).toHaveLength(2);
  });
});
