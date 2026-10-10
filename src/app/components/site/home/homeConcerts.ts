import type { CalendarEventData } from '@/app/requests/calendar-requests';

const FALLBACK_ZONE = 'America/Sao_Paulo';
const monthOf = (date: Date, timeZone?: string) =>
  new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    timeZone: timeZone || FALLBACK_ZONE,
  }).format(date);

/** Tonight's concert still counts as upcoming for a few hours after it starts. */
const GRACE_MS = 6 * 3_600_000;

/**
 * The concerts the home shows: those that have not started yet (long
 * exhibitions that opened months ago are not "upcoming"), the ones an admin picked
 * for the home (`showOnMainHome`) first while they fall in the current
 * month, then the rest by date.
 */
export function homeConcerts(
  events: readonly CalendarEventData[],
  now: Date,
  limit: number
): CalendarEventData[] {
  const ahead = events
    .filter((event) => event.start.getTime() >= now.getTime() - GRACE_MS)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  const picked = (event: CalendarEventData) =>
    !!event.showOnMainHome &&
    monthOf(event.start, event.timeZone) === monthOf(now, event.timeZone);
  return [...ahead.filter(picked), ...ahead.filter((e) => !picked(e))].slice(
    0,
    limit
  );
}
