// app/services/scraper-api/scraper-api.client.ts
import {
  ScraperResponse,
  ScrapedEvent,
  ImportResult,
  JobResponse,
  JobStatusResponse,
  ScraperJob,
  JobStatus,
  ScraperInfo,
} from './scraper-api.types';

const getScraperApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SCRAPER_API_URL) {
    return process.env.NEXT_PUBLIC_SCRAPER_API_URL;
  }
  const isDevelopment = process.env.NODE_ENV === 'development';
  return isDevelopment
    ? 'http://localhost:4000/api'
    : 'https://api.opusatlas.com.br/api';
};

const SCRAPER_API_URL = getScraperApiUrl();
const API_KEY = process.env.NEXT_PUBLIC_SCRAPER_API_KEY;

export class ScraperApiClient {
  private static headers = {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'x-api-key': API_KEY }),
  };

  /**
   * ✅ NOVO: Listar todos os scrapers disponíveis
   */
  static async listScrapers(): Promise<ScraperInfo[]> {
    const url = `${SCRAPER_API_URL}/scrapers/list`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Erro ao listar scrapers');
    }

    const data = await response.json();
    return data.scrapers;
  }

  /**
   * ✅ ATUALIZADO: Iniciar scraper assíncrono (API unificada)
   */
  static async scrapeAsync(scraperId: string): Promise<string> {
    const url = `${SCRAPER_API_URL}/scrapers/${scraperId}/scrape`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao iniciar scraper');
    }

    const data: JobResponse = await response.json();
    return data.jobId;
  }

  /**
   * ✅ ATUALIZADO: Verificar status do job (API unificada)
   */
  static async getJobStatus(jobId: string): Promise<ScraperJob> {
    const url = `${SCRAPER_API_URL}/scrapers/status/${jobId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Erro ao verificar status do job');
    }

    const data: JobStatusResponse = await response.json();

    if (!data.success) {
      throw new Error('Job não encontrado');
    }

    return data.job;
  }

  /**
   * ✅ NOVO: Executar todos os scrapers de uma vez
   */
  static async scrapeAll(): Promise<
    Array<{ scraperId: string; jobId: string }>
  > {
    const url = `${SCRAPER_API_URL}/scrapers/scrape-all`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao iniciar scrapers');
    }

    const data = await response.json();
    return data.jobs;
  }

  /**
   * ✅ NOVO: Listar todos os jobs
   */
  static async getAllJobs(): Promise<ScraperJob[]> {
    const url = `${SCRAPER_API_URL}/scrapers/jobs`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Erro ao listar jobs');
    }

    const data = await response.json();
    return data.jobs;
  }

  /**
   * Polling do status até completar
   */
  static async waitForCompletion(
    jobId: string,
    onProgress?: (job: ScraperJob) => void
  ): Promise<ScraperResponse> {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const job = await this.getJobStatus(jobId);

          if (onProgress) {
            onProgress(job);
          }

          if (job.status === JobStatus.COMPLETED) {
            clearInterval(interval);
            resolve(job.result!);
          } else if (job.status === JobStatus.FAILED) {
            clearInterval(interval);
            reject(new Error(job.error || 'Scraper failed'));
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 2000); // Verificar a cada 2 segundos

      // Timeout de 10 minutos
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error('Timeout: Scraper demorou mais de 10 minutos'));
      }, 600000);
    });
  }

  /**
   * Importar eventos
   */
  static async importEvents(
    scraperId: string,
    events: ScrapedEvent[]
  ): Promise<ImportResult> {
    const url = `${SCRAPER_API_URL}/scrapers/${scraperId}/import`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ events }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao importar eventos');
    }

    return response.json();
  }
}
