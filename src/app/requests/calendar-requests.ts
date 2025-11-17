// app/requests/calendar-requests.ts

import prisma from '@/app/libs/prismadb';

export interface CalendarEventData {
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
  externalUrl: string;
  description?: string;
  ticketUrl?: string;
  isFree: boolean;
}

export async function getCalendarEventsForPageServer(
  startDate: Date,
  endDate: Date,
  filters?: {
    city?: string;
    state?: string;
    venueId?: string;
    type?: string;
  }
) {
  try {
    const whereClause: any = {
      startDate: { gte: startDate, lte: endDate },
    };

    if (filters?.venueId) whereClause.venueId = filters.venueId;
    if (filters?.type) whereClause.type = filters.type;

    const venueFilters: any = {};
    if (filters?.city) venueFilters.city = filters.city;
    if (filters?.state) venueFilters.state = filters.state;

    if (Object.keys(venueFilters).length > 0) {
      whereClause.venue = venueFilters;
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        venue: {
          select: { id: true, name: true, city: true, state: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    const eventsWithComposers = await Promise.all(
      events.map(async (event) => {
        let composers: any[] = [];

        if (event.composerIds && event.composerIds.length > 0) {
          composers = await prisma.composer.findMany({
            where: { id: { in: event.composerIds } },
            select: { id: true, name: true, portraitUrl: true },
            take: 5,
          });
        }

        const startTime = new Date(event.startDate);
        if (event.startTime) {
          const [hours, minutes] = event.startTime.split(':');
          startTime.setHours(parseInt(hours), parseInt(minutes));
        }

        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 2);

        return {
          id: event.id,
          title: event.title,
          start: startTime,
          end: endTime,
          type: event.type,
          externalUrl: event.externalUrl,
          venue: {
            id: event.venue.id,
            name: event.venue.name,
            city: event.venue.city || 'N/A',
            state: event.venue.state || 'N/A',
          },
          composers: composers.map((c) => ({
            id: c.id,
            name: c.name,
            portraitUrl: c.portraitUrl || undefined,
          })),
          imageUrl: event.imageUrl || undefined,
          description: event.description || undefined,
          ticketUrl: event.ticketUrl || undefined,
          isFree: event.isFree,
        };
      })
    );

    return eventsWithComposers;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

export async function getCalendarFilters() {
  try {
    const venues = await prisma.venue.findMany({
      where: { scrapingEnabled: true },
      select: { id: true, name: true, city: true, state: true },
      orderBy: { name: 'asc' },
    });

    const cities = [
      ...new Set(venues.map((v) => v.city).filter(Boolean)),
    ].sort();
    const states = [
      ...new Set(venues.map((v) => v.state).filter(Boolean)),
    ].sort();

    return { venues, cities, states };
  } catch (error) {
    console.error('Error fetching calendar filters:', error);
    return { venues: [], cities: [], states: [] };
  }
}
