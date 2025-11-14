import {
  ScraperResponse,
  ImportResult,
  ScrapedEvent,
} from './scraper-api.types';

const SCRAPER_API_URL =
  process.env.NEXT_PUBLIC_SCRAPER_API_URL || 'https://api.opusatlas.com.br/api';
const API_KEY = process.env.NEXT_PUBLIC_SCRAPER_API_KEY || '';

export class ScraperApiClient {
  private static headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };

  /**
   * 🎯 Executar scraper e retornar eventos
   */
  static async scrape(
    scraperId: string,
    options?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ScraperResponse> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    const url = `${SCRAPER_API_URL}/scrapers/${scraperId}/scrape${
      params.toString() ? '?' + params.toString() : ''
    }`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erro ao executar scraper ${scraperId}`);
    }

    return response.json();
  }

  /**
   * 📊 Verificar status do scraper
   */
  static async getStatus(scraperId: string): Promise<any> {
    const url = `${SCRAPER_API_URL}/scrapers/${scraperId}/status`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Erro ao verificar status do scraper ${scraperId}`);
    }

    return response.json();
  }

  /**
   * 💾 Importar eventos para o banco de dados (via Next.js API)
   */
  static async importEvents(
    scraperId: string,
    events: ScrapedEvent[]
  ): Promise<ImportResult> {
    const response = await fetch('/api/admin/scrapers/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scraperId,
        events,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao importar eventos');
    }

    return response.json();
  }

  /**
   * 🔍 Verificar duplicatas (via Next.js API)
   */
  static async checkDuplicates(
    events: ScrapedEvent[]
  ): Promise<ScrapedEvent[]> {
    const response = await fetch('/api/admin/scrapers/check-duplicates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    });

    if (!response.ok) {
      throw new Error('Erro ao verificar duplicatas');
    }

    const data = await response.json();
    return data.events;
  }
}
