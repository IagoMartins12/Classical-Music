// app/blog/calendar/pageServer.tsx

import {
  getCalendarEventsForPageServer,
  getCalendarFilters,
} from '@/app/requests/calendar-requests';
import CalendarPageClient from './pageClient';

export interface CalendarPageData {
  events: Array<{
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: string;
    venue: {
      id: string;
      name: string;
      city: string;
      state: string;
    };
    composers: Array<{
      id: string;
      name: string;
      portraitUrl?: string;
    }>;
    imageUrl?: string;
    description?: string;
    ticketUrl?: string;
    isFree: boolean;
  }>;
  filters: {
    venues: Array<{ id: string; name: string; city: string }>;
    cities: string[];
    states: string[];
  };
}

async function fetchCalendarData(): Promise<CalendarPageData> {
  try {
    const now = new Date();

    // ✅ Buscar 3 meses (passado, atual e próximo)
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    const [events, filters] = await Promise.all([
      getCalendarEventsForPageServer(startDate, endDate),
      getCalendarFilters(),
    ]);

    return {
      events,
      filters: {
        venues: filters.venues.map((v) => ({
          id: v.id,
          name: v.name,
          city: v.city || 'N/A',
        })),
        cities: filters.cities,
        states: filters.states,
      },
    };
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return { events: [], filters: { venues: [], cities: [], states: [] } };
  }
}

export default async function CalendarPageServer() {
  const calendarData = await fetchCalendarData();

  console.log(
    `✅ [CALENDAR-PAGE-SERVER] Loaded ${calendarData.events.length} events`
  );

  return <CalendarPageClient initialData={calendarData} />;
}
