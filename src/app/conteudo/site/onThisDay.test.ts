import { describe, expect, it } from 'vitest';
import { daySlug, formatDay, parseDaySlug, shiftDay, today } from './onThisDay';

describe('on this day calendar', () => {
  it('reads and writes the URL slug', () => {
    expect(daySlug({ month: 3, day: 1 })).toBe('03-01');
    expect(parseDaySlug('02-29')).toEqual({ month: 2, day: 29 });
    expect(parseDaySlug('02-30')).toBeNull();
    expect(parseDaySlug('13-01')).toBeNull();
    expect(parseDaySlug('1-1')).toBeNull();
  });

  it('moves across months and the year end', () => {
    expect(shiftDay({ month: 12, day: 31 }, 1)).toEqual({ month: 1, day: 1 });
    expect(shiftDay({ month: 1, day: 1 }, -1)).toEqual({ month: 12, day: 31 });
    expect(shiftDay({ month: 2, day: 28 }, 1)).toEqual({ month: 2, day: 29 });
    expect(shiftDay({ month: 3, day: 1 }, -1)).toEqual({ month: 2, day: 29 });
  });

  it('formats in each language', () => {
    expect(formatDay({ month: 10, day: 8 }, 'pt')).toBe('8 de outubro');
    expect(formatDay({ month: 10, day: 8 }, 'en')).toBe('October 8');
  });

  it('takes today in Brazilian time', () => {
    // 02:00 UTC on 9 Oct is still 8 Oct in São Paulo.
    expect(today(new Date('2026-10-09T02:00:00Z'))).toEqual({
      month: 10,
      day: 8,
    });
  });
});
