// app/api/blog/calendar/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
  status: string;
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
  program?: string | number | boolean;
  ticketUrl?: string;
  isFree: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

interface CalendarResponse {
  success: boolean;
  events: CalendarEvent[];
  period: {
    start: Date;
    end: Date;
    view: string;
  };
  metadata: {
    totalEvents: number;
    byType: Record<string, number>;
    byVenue: Record<string, number>;
    byCity: Record<string, number>;
  };
  filters: {
    cities: string[];
    states: string[];
    venues: Array<{ id: string; name: string; city: string }>;
    types: string[];
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parâmetros de data
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const view = searchParams.get('view') || 'month';

    // Filtros
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const venueId = searchParams.get('venueId');
    const eventType = searchParams.get('type');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Parâmetros start e end são obrigatórios' },
        { status: 400 }
      );
    }

    console.log(`📅 [CALENDAR-API] Loading events: ${startDate} to ${endDate}`);

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Construir filtros dinâmicos
    const whereClause: any = {
      startDate: {
        gte: start,
        lte: end,
      },
    };

    // Filtro por venue
    if (venueId) {
      whereClause.venueId = venueId;
    }

    // Filtro por tipo
    if (eventType) {
      whereClause.type = eventType;
    }

    // Filtro por cidade/estado (via venue)
    const venueFilters: any = {};
    if (city) venueFilters.city = city;
    if (state) venueFilters.state = state;

    if (Object.keys(venueFilters).length > 0) {
      whereClause.venue = venueFilters;
    }

    // Buscar eventos
    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    console.log(`📊 [CALENDAR-API] Found ${events.length} events`);

    // Buscar compositores para cada evento
    const eventsWithComposers = await Promise.all(
      events.map(async (event) => {
        let composers: any[] = [];

        if (event.composerIds && event.composerIds.length > 0) {
          composers = await prisma.composer.findMany({
            where: {
              id: { in: event.composerIds },
            },
            select: {
              id: true,
              name: true,
              portraitUrl: true,
            },
            take: 5, // Limita a 5 compositores por evento
          });
        }

        // Calcular horários
        const startTime = new Date(event.startDate);
        if (event.startTime) {
          const [hours, minutes] = event.startTime.split(':');
          startTime.setHours(parseInt(hours), parseInt(minutes));
        }

        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 2); // Duração padrão: 2h

        // Cores baseadas no tipo de evento
        let backgroundColor = '#3B82F6'; // Azul padrão
        let borderColor = '#1D4ED8';
        let textColor = '#FFFFFF';

        switch (event.type) {
          case 'OPERA':
            backgroundColor = '#8B5CF6'; // Roxo
            borderColor = '#7C3AED';
            break;
          case 'RECITAL':
            backgroundColor = '#EC4899'; // Rosa
            borderColor = '#DB2777';
            break;
          case 'CHAMBER_MUSIC':
            backgroundColor = '#10B981'; // Verde
            borderColor = '#059669';
            break;
          // case 'CHOIR':
          //   backgroundColor = '#F59E0B'; // Amarelo
          //   borderColor = '#D97706';
          //   textColor = '#000000';
          //   break;
          case 'OPEN_REHEARSAL':
            backgroundColor = '#6B7280'; // Cinza
            borderColor = '#4B5563';
            break;
        }

        // Eventos gratuitos em verde claro
        if (event.isFree) {
          backgroundColor = '#34D399';
          borderColor = '#10B981';
          textColor = '#000000';
        }

        return {
          id: event.id,
          title: event.title,
          start: startTime,
          end: endTime,
          type: event.type,
          status: event.status,
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
          program:
            typeof event.program === 'object'
              ? JSON.stringify(event.program)
              : event.program,
          ticketUrl: event.ticketUrl || undefined,
          isFree: event.isFree,
          backgroundColor,
          borderColor,
          textColor,
        };
      })
    );

    // Buscar dados para filtros
    const allVenues = await prisma.venue.findMany({
      where: { scrapingEnabled: true },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
      },
      orderBy: { name: 'asc' },
    });

    const cities = [
      ...new Set(allVenues.map((v) => v.city).filter(Boolean)),
    ].sort();
    const states = [
      ...new Set(allVenues.map((v) => v.state).filter(Boolean)),
    ].sort();

    // Metadados
    const metadata = {
      totalEvents: eventsWithComposers.length,
      byType: eventsWithComposers.reduce(
        (acc, e) => {
          acc[e.type] = (acc[e.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byVenue: eventsWithComposers.reduce(
        (acc, e) => {
          acc[e.venue.name] = (acc[e.venue.name] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byCity: eventsWithComposers.reduce(
        (acc, e) => {
          acc[e.venue.city] = (acc[e.venue.city] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    const response: CalendarResponse = {
      success: true,
      events: eventsWithComposers,
      period: { start, end, view },
      metadata,
      filters: {
        cities,
        states,
        venues: allVenues.map((v) => ({
          id: v.id,
          name: v.name,
          city: v.city || 'N/A',
        })),
        types: [
          'CONCERT',
          'RECITAL',
          'OPERA',
          'CHAMBER_MUSIC',
          'CHOIR',
          'OPEN_REHEARSAL',
        ],
      },
    };

    console.log(`✅ [CALENDAR-API] Calendar loaded successfully`);

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ [CALENDAR-API] Error loading calendar:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
