// app/blog/calendar/pageServer.tsx — calendário de eventos, pela API

import {
  loadCalendar,
  type CalendarEventData,
  type CalendarFilterOptions,
} from '@/app/requests/calendar-requests';
import CalendarPageClient from './pageClient';

export interface CalendarPageData {
  events: CalendarEventData[];
  filters: CalendarFilterOptions;
}

async function fetchCalendarData(): Promise<CalendarPageData> {
  try {
    const now = new Date();

    // ✅ Buscar 3 meses (passado, atual e próximo)
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    return await loadCalendar(startDate, endDate);
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return { events: [], filters: { venues: [], cities: [], states: [] } };
  }
}

export default async function CalendarPageServer() {
  const calendarData = await fetchCalendarData();

  return <CalendarPageClient initialData={calendarData} />;
}
