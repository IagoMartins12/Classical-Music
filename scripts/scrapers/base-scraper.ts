// scripts/scrapers/base-scraper.ts

import {
  PrismaClient,
  EventType,
  EventStatus,
  EventSource,
} from '@prisma/client';
import axios, { AxiosInstance } from 'axios';

export interface ScraperConfig {
  venueName: string;
  venueSlug: string;
  baseUrl: string;
  userAgent?: string;
  delayBetweenRequests?: number;
}

export interface ScrapedEvent {
  title: string;
  slug: string;
  description: string;
  type: string; // ✅ Vai ser convertido para EventType depois
  startDate: Date;
  startTime: string | null;
  endDate: Date | null;
  endTime: string | null;
  venueDetails: string | null;
  ticketUrl: string | null;
  ticketInfo: string | null;
  externalId: string;
  imageUrl: string | null;
  composerNames: string[];
  performers: string[];
  program: string | null;
}

export interface ScraperState {
  eventsFound: number;
  eventsScraped: number;
  errors: string[];
  startTime: number;
}
export interface DeduplicationStrategy {
  updateExisting?: boolean; // Atualiza eventos existentes?
  mergeComposers?: boolean; // Faz merge de compositores?
  skipDuplicates?: boolean; // Pula ou loga erro?
}

export abstract class BaseScraper {
  protected prisma: PrismaClient;
  protected config: ScraperConfig;
  protected httpClient: AxiosInstance;
  protected state: ScraperState;
  protected deduplicationStrategy: DeduplicationStrategy;

  constructor(config: ScraperConfig) {
    this.prisma = new PrismaClient();
    this.config = config;

    this.httpClient = axios.create({
      headers: {
        'User-Agent':
          config.userAgent ||
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 30000,
    });

    this.state = {
      eventsFound: 0,
      eventsScraped: 0,
      errors: [],
      startTime: Date.now(),
    };

    this.deduplicationStrategy = {
      updateExisting: false, // Não atualiza por padrão
      mergeComposers: true, // Faz merge de compositores
      skipDuplicates: true, // Pula duplicatas silenciosamente
    };
  }

  abstract scrapeEvents(): Promise<ScrapedEvent[]>;

  protected async delay(ms?: number): Promise<void> {
    const delayTime = ms || this.config.delayBetweenRequests || 2000;
    return new Promise((resolve) => setTimeout(resolve, delayTime));
  }

  protected async fetchWithRetry(url: string, retries = 3): Promise<string> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await this.httpClient.get(url);
        return response.data;
      } catch (error: any) {
        console.error(
          `❌ Error fetching ${url} (attempt ${i + 1}/${retries}):`,
          error.message
        );

        if (i < retries - 1) {
          await this.delay(3000 * (i + 1));
        } else {
          throw error;
        }
      }
    }

    throw new Error('Max retries exceeded');
  }

  protected async getOrCreateVenue(): Promise<string> {
    let venue = await this.prisma.venue.findUnique({
      where: { slug: this.config.venueSlug },
    });

    if (!venue) {
      console.log(`🏛️ Creating venue: ${this.config.venueName}`);
      venue = await this.prisma.venue.create({
        data: {
          name: this.config.venueName,
          slug: this.config.venueSlug,
          // ✅ REMOVIDO: type não existe no modelo Venue
          city: 'São Paulo',
          state: 'SP',
          country: 'Brasil',
          scrapingEnabled: true,
        },
      });
    }

    return venue.id;
  }

  protected async saveEvent(
    event: ScrapedEvent,
    venueId: string,
    composerIds: string[]
  ): Promise<void> {
    try {
      // 1. Busca eventos duplicados/similares
      const existing = await this.findExistingEvent(event, venueId);

      if (existing) {
        return this.handleDuplicateEvent(existing, event, composerIds);
      }

      // 2. Converte tipo para enum
      const eventType = event.type as EventType;

      // 3. Cria novo evento
      await this.prisma.event.create({
        data: {
          title: event.title,
          slug: event.slug,
          description: event.description,
          type: eventType,
          status: 'PENDING' as EventStatus,
          source: 'SCRAPER' as EventSource,

          startDate: event.startDate,
          startTime: event.startTime || '',
          endDate: event.endDate,
          endTime: event.endTime,

          venueId,
          venueDetails: event.venueDetails,

          ticketUrl: event.ticketUrl,
          ticketInfo: event.ticketInfo,

          externalId: event.externalId,
          imageUrl: event.imageUrl,

          composerIds: composerIds,
          workIds: [],
          instrumentIds: [],
          epochIds: [],

          performers: event.performers,
          program: event.program,

          qualityScore: 70,
          completeness: 60,
        },
      });

      console.log(`✅ Saved event: ${event.title}`);
      this.state.eventsScraped++;
    } catch (error: any) {
      console.error(`❌ Error saving event: ${event.title}`, error.message);
      this.state.errors.push(
        `Failed to save "${event.title}": ${error.message}`
      );
    }
  }

  protected async saveScrapingLog(
    venueId: string,
    eventsAdded: number
  ): Promise<void> {
    const executionTime = Date.now() - this.state.startTime;

    await this.prisma.scrapingLog.create({
      data: {
        venueId,
        status: this.state.errors.length > 0 ? 'ERROR' : 'SUCCESS',
        eventsFound: this.state.eventsFound,
        // ✅ CORRIGIDO: campo correto é 'newEvents'
        newEvents: eventsAdded,
        eventsUpdated: 0,
        source: venueId,
      },
    });

    console.log(
      `\n📊 Scraping completed in ${(executionTime / 1000).toFixed(1)}s`
    );
    console.log(`   Events found: ${this.state.eventsFound}`);
    console.log(`   Events added: ${eventsAdded}`);
    console.log(`   Errors: ${this.state.errors.length}`);
  }

  /**
   * ✅ NOVO: Busca eventos existentes com múltiplas estratégias
   */
  private async findExistingEvent(
    event: ScrapedEvent,
    venueId: string
  ): Promise<any | null> {
    // Estratégia 1: externalId exato (mais confiável)
    if (event.externalId) {
      const byExternalId = await this.prisma.event.findFirst({
        where: { externalId: event.externalId },
      });
      if (byExternalId) return byExternalId;
    }

    // Estratégia 2: venue + data + título exato
    const byVenueDateTitle = await this.prisma.event.findFirst({
      where: {
        venueId,
        startDate: event.startDate,
        title: event.title,
      },
    });
    if (byVenueDateTitle) return byVenueDateTitle;

    // Estratégia 3: venue + data + slug similar (detecta variações de título)
    const bySimilarSlug = await this.prisma.event.findFirst({
      where: {
        venueId,
        startDate: event.startDate,
        slug: event.slug,
      },
    });
    if (bySimilarSlug) return bySimilarSlug;

    // Estratégia 4: URL de ingresso igual (mesmo evento, dados diferentes)
    if (event.ticketUrl) {
      const byTicketUrl = await this.prisma.event.findFirst({
        where: {
          ticketUrl: event.ticketUrl,
          startDate: event.startDate,
        },
      });
      if (byTicketUrl) return byTicketUrl;
    }

    return null;
  }

  /**
   * ✅ NOVO: Lida com eventos duplicados
   */
  private async handleDuplicateEvent(
    existing: any,
    newEvent: ScrapedEvent,
    newComposerIds: string[]
  ): Promise<void> {
    const strategy = this.deduplicationStrategy;

    if (strategy.skipDuplicates) {
      console.log(
        `⏭️  Skipping duplicate: ${newEvent.title} (ID: ${existing.id})`
      );
      return;
    }

    if (strategy.updateExisting) {
      console.log(`🔄 Updating existing event: ${newEvent.title}`);
      await this.updateExistingEvent(existing, newEvent, newComposerIds);
      return;
    }

    console.log(
      `⚠️  Duplicate found but not configured to handle: ${newEvent.title}`
    );
  }

  /**
   * ✅ NOVO: Atualiza evento existente
   */
  private async updateExistingEvent(
    existing: any,
    newEvent: ScrapedEvent,
    newComposerIds: string[]
  ): Promise<void> {
    const strategy = this.deduplicationStrategy;

    // Merge de compositores (adiciona novos, mantém existentes)
    let finalComposerIds = existing.composerIds || [];
    if (strategy.mergeComposers && newComposerIds.length > 0) {
      const uniqueComposers = [
        ...new Set([...finalComposerIds, ...newComposerIds]),
      ];
      finalComposerIds = uniqueComposers;
    } else if (newComposerIds.length > 0) {
      finalComposerIds = newComposerIds; // Sobrescreve
    }

    try {
      await this.prisma.event.update({
        where: { id: existing.id },
        data: {
          // Atualiza dados que podem ter mudado
          description: newEvent.description || existing.description,
          startTime: newEvent.startTime || existing.startTime,
          ticketUrl: newEvent.ticketUrl || existing.ticketUrl,
          imageUrl: newEvent.imageUrl || existing.imageUrl,
          program: newEvent.program || existing.program,
          composerIds: finalComposerIds,

          // Atualiza completeness se melhorou
          completeness: Math.max(
            existing.completeness || 0,
            newEvent.program ? 80 : 60
          ),
        },
      });

      console.log(`✅ Updated event: ${newEvent.title}`);
    } catch (error: any) {
      console.error(
        `❌ Error updating event: ${newEvent.title}`,
        error.message
      );
    }
  }

  async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
