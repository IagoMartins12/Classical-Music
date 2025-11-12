// app/api/calendar/scrapers/run/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OSESPScraper } from '../../../../../../../scripts/scrapers/osesp-scraper';
import { TheatroMunicipalScraper } from '../../../../../../../scripts/scrapers/theatro-municipal-scraper';

export async function POST(request: NextRequest) {
  try {
    const { scraperId } = await request.json();

    if (!scraperId) {
      return NextResponse.json(
        { error: 'Scraper ID é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`🎵 Executando scraper ${scraperId}...`);

    let events: any[] = [];
    let scraper: any;

    // ==================== SELECIONAR SCRAPER ====================
    if (scraperId === 'osesp') {
      scraper = new OSESPScraper({
        includeUpcomingEvents: true,
        includeSeason: true,
      });
      events = await scraper.scrapeEvents();
    } else if (scraperId === 'theatro-municipal') {
      // ✅ NOVO SCRAPER
      scraper = new TheatroMunicipalScraper({
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      });
      events = await scraper.scrapeEvents();
    } else {
      return NextResponse.json(
        { error: 'Scraper não encontrado' },
        { status: 404 }
      );
    }

    await scraper.cleanup();

    console.log(`✅ ${events.length} eventos encontrados`);

    // Transformar para formato do frontend
    const transformedEvents = events.map((event, index) => ({
      id: `temp-${Date.now()}-${index}`,
      title: event.title,
      slug: event.slug,
      description: event.description,
      type: event.type,
      startDate: event.startDate.toISOString(),
      startTime: event.startTime,
      endDate: event.endDate?.toISOString() || null,
      endTime: event.endTime,
      venueDetails: event.venueDetails,
      ticketUrl: event.ticketUrl,
      externalUrl: event.externalUrl,
      ticketInfo: event.ticketInfo,
      externalId: event.externalId,
      imageUrl: event.imageUrl,
      composerNames: event.composerNames,
      performers: event.performers,
      program: event.program,
      selected: true,
    }));

    return NextResponse.json({
      success: true,
      events: transformedEvents,
      count: transformedEvents.length,
    });
  } catch (error: any) {
    console.error('❌ Erro ao executar scraper:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erro ao executar scraper',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
