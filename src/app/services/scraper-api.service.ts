const SCRAPER_API_URL =
  process.env.NEXT_PUBLIC_SCRAPER_API_URL || 'https://api.opusatlas.com.br/api';
const API_KEY = process.env.SCRAPER_API_KEY || 'minha-chave-secreta-123';

interface ScraperResponse {
  success: boolean;
  eventsFound: number;
  eventsScraped: number;
  newEvents: number;
  duplicates: number;
  events: any[];
  errors: string[];
  executionTime: number;
}

export class ScraperApiService {
  private static headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };

  static async scrapeOSESP(): Promise<ScraperResponse> {
    const response = await fetch(`${SCRAPER_API_URL}/scrapers/osesp/scrape`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(
        `Erro ao fazer scraping da OSESP: ${response.statusText}`
      );
    }

    return response.json();
  }

  static async scrapeTheatroMunicipal(): Promise<ScraperResponse> {
    const response = await fetch(
      `${SCRAPER_API_URL}/scrapers/theatro-municipal/scrape`,
      {
        method: 'GET',
        headers: this.headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Erro ao fazer scraping do Theatro Municipal: ${response.statusText}`
      );
    }

    return response.json();
  }
}
