// scripts/scrapers/theatro-municipal-scraper.ts

import * as cheerio from 'cheerio';
import puppeteer, { Browser } from 'puppeteer-core';
import { extractComposerNames } from '../utils/text-cleaner';
import { createSlug } from '../utils/date-parser';
import * as fs from 'fs';

export interface ScrapedEvent {
  title: string;
  slug: string;
  description: string;
  type: string;
  startDate: Date;
  startTime: string | null;
  endDate: Date | null;
  endTime: string | null;
  venueDetails: string | null;
  ticketUrl: string;
  externalUrl: string;
  ticketInfo: string | null;
  externalId: string;
  imageUrl: string | null;
  composerNames: string[];
  performers: string[];
  program: string | null;
}

export interface TheatroMunicipalScraperOptions {
  headless?: boolean;
  timeout?: number;
  maxRetries?: number;
  startDate?: Date;
  endDate?: Date;
}

export class TheatroMunicipalScraper {
  private browser: Browser | null = null;
  private options: Required<TheatroMunicipalScraperOptions>;

  constructor(options: TheatroMunicipalScraperOptions = {}) {
    this.options = {
      headless: options.headless ?? true,
      timeout: options.timeout ?? 60000,
      maxRetries: options.maxRetries ?? 3,
      startDate: options.startDate ?? new Date(),
      endDate:
        options.endDate ??
        new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    };
  }

  // ==================== INICIALIZAR BROWSER ====================
  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      console.log('🚀 Iniciando Puppeteer...');

      const executablePath = await this.findChrome();

      this.browser = await puppeteer.launch({
        executablePath,
        headless: this.options.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-blink-features=AutomationControlled',
        ],
      });

      console.log('✅ Browser iniciado');
    }
  }

  // ==================== ENCONTRAR CHROME ====================
  private async findChrome(): Promise<string> {
    // ✅ Removido chrome-launcher (não está instalado)
    const possiblePaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/snap/bin/chromium',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ];

    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        console.log(`✅ Chrome encontrado em: ${path}`);
        return path;
      }
    }

    throw new Error(
      'Chrome não encontrado. Por favor, instale o Google Chrome ou execute: npx puppeteer browsers install chrome'
    );
  }

  // ==================== CLEANUP ====================
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('✅ Browser fechado');
    }
  }

  // ==================== SCRAPE MAIN ====================
  async scrapeEvents(): Promise<ScrapedEvent[]> {
    try {
      await this.initBrowser();

      const startDateStr = this.formatDate(this.options.startDate);
      const endDateStr = this.formatDate(this.options.endDate);

      const baseUrl = `https://theatromunicipal.org.br/programacao/?jsf=jet-engine:q1&meta=data_inicial_timestamp!date:${startDateStr}-${endDateStr}`;

      console.log(`🎭 Buscando eventos do Theatro Municipal...`);
      console.log(`📅 Período: ${startDateStr} a ${endDateStr}`);

      const page = await this.browser!.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      await page.goto(baseUrl, {
        waitUntil: 'networkidle2',
        timeout: this.options.timeout,
      });

      // Aguardar carregamento dos cards
      await page.waitForSelector('.jet-listing-grid__items', {
        timeout: 10000,
      });

      // ✅ Substituir waitForTimeout por delay
      await this.delay(3000);

      let allEventUrls: string[] = [];
      let currentPage = 1;
      let hasNextPage = true;

      // ==================== COLETAR URLS DE TODOS OS EVENTOS (COM PAGINAÇÃO) ====================
      while (hasNextPage) {
        console.log(`📄 Coletando URLs da página ${currentPage}...`);

        // Buscar links corretos
        const eventUrls = await page.evaluate(() => {
          const urls: string[] = [];

          // Procurar por todos os links dentro dos items
          const items = document.querySelectorAll('.jet-listing-grid__item');

          items.forEach((item) => {
            // Buscar link do título (h3 > a)
            const titleLink = item.querySelector(
              'h3.elementor-heading-title a'
            ) as HTMLAnchorElement;

            if (
              titleLink &&
              titleLink.href &&
              titleLink.href.includes('/eventos/')
            ) {
              urls.push(titleLink.href);
            }
          });

          return urls;
        });

        console.log(`  ✅ ${eventUrls.length} eventos encontrados`);
        allEventUrls = [...allEventUrls, ...eventUrls];

        // Verificar se existe botão "Ver mais eventos"
        const loadMoreButton = await page.$('#ver-mais-eventos');

        if (loadMoreButton) {
          try {
            console.log(`  ➡️ Clicando em "Ver mais eventos"...`);

            await loadMoreButton.click();

            // ✅ Substituir waitForTimeout
            await this.delay(3000);

            // Verificar se novos eventos foram carregados
            const newCount = await page.evaluate(() => {
              return document.querySelectorAll('.jet-listing-grid__item')
                .length;
            });

            console.log(`  📊 Total de ${newCount} eventos carregados`);

            currentPage++;
          } catch (_error) {
            // ✅ Variável com _ para ignorar erro do ESLint
            console.log(`  ⚠️ Erro ao clicar em "Ver mais"`);
            hasNextPage = false;
          }
        } else {
          hasNextPage = false;
          console.log(`  ✅ Todos os eventos carregados`);
        }

        // Limite de segurança
        if (currentPage > 10) {
          console.log(`  ⚠️ Limite de páginas atingido`);
          break;
        }
      }

      await page.close();

      // Remover duplicatas
      allEventUrls = [...new Set(allEventUrls)];
      console.log(
        `📊 Total de ${allEventUrls.length} eventos únicos encontrados`
      );

      // ==================== SCRAPE DETALHES DE CADA EVENTO ====================
      const events: ScrapedEvent[] = [];

      for (let i = 0; i < allEventUrls.length; i++) {
        const url = allEventUrls[i];
        console.log(`\n[${i + 1}/${allEventUrls.length}] Processando: ${url}`);

        try {
          const event = await this.scrapeEventDetails(url);
          if (event) {
            events.push(event);
            console.log(`  ✅ ${event.title}`);
          } else {
            console.log(`  ⚠️ Evento pulado (dados incompletos)`);
          }
        } catch (error) {
          console.error(`  ❌ Erro ao processar evento:`, error);
        }

        // Delay entre requests
        await this.delay(1500);
      }

      console.log(
        `\n✅ Scraping concluído: ${events.length} eventos processados`
      );
      return events;
    } catch (error) {
      console.error('❌ Erro no scraping:', error);
      throw error;
    }
  }

  // ==================== SCRAPE DETALHES DO EVENTO ====================
  private async scrapeEventDetails(url: string): Promise<ScrapedEvent | null> {
    const page = await this.browser!.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );

    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.options.timeout,
      });

      // ✅ Substituir waitForTimeout
      await this.delay(2000);

      const html = await page.content();
      const $ = cheerio.load(html);

      // ==================== EXTRAIR INFORMAÇÕES ====================

      // Título
      const title =
        $('h1.elementor-heading-title').first().text().trim() ||
        $('.entry-title').text().trim() ||
        $('h1').first().text().trim();

      if (!title) {
        console.warn('  ⚠️ Título não encontrado');
        return null;
      }

      // Descrição
      let description = '';
      $('.elementor-widget-text-editor, .elementor-text-editor').each(
        (_, elem) => {
          const text = $(elem).text().trim();
          if (text.length > 100 && text.length > description.length) {
            description = text;
          }
        }
      );

      // Data e horário
      let startDate: Date | null = null;
      let startTime: string | null = null;

      // Buscar data e horário em todo o HTML
      const dateRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
      const timeRegex = /(\d{1,2})[h:](\d{2})/i;

      const fullText = $('body').text();
      const dateMatch = fullText.match(dateRegex);
      if (dateMatch) {
        const [, day, month, year] = dateMatch;
        startDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );
      }

      const timeMatch = fullText.match(timeRegex);
      if (timeMatch) {
        const [, hour, minute] = timeMatch;
        startTime = `${hour.padStart(2, '0')}:${minute}`;
      }

      if (!startDate) {
        console.warn('  ⚠️ Data não encontrada');
        return null;
      }

      // Tipo de evento
      let eventType = 'CONCERT';
      const textLower = `${title} ${description}`.toLowerCase();

      if (textLower.includes('ópera') || textLower.includes('opera')) {
        eventType = 'OPERA';
      } else if (textLower.includes('balé') || textLower.includes('dança')) {
        eventType = 'BALLET';
      } else if (
        textLower.includes('câmara') ||
        textLower.includes('chamber')
      ) {
        eventType = 'CHAMBER_MUSIC';
      } else if (textLower.includes('coral') || textLower.includes('coro')) {
        eventType = 'CHORAL';
      } else if (textLower.includes('recital')) {
        eventType = 'RECITAL';
      } else if (textLower.includes('festival')) {
        eventType = 'FESTIVAL';
      } else if (
        textLower.includes('workshop') ||
        textLower.includes('oficina')
      ) {
        eventType = 'WORKSHOP';
      } else if (
        textLower.includes('master class') ||
        textLower.includes('masterclass')
      ) {
        eventType = 'MASTERCLASS';
      }

      // Local
      let venueDetails = 'Theatro Municipal de São Paulo';
      const venueMatch = fullText.match(
        /(Praça das Artes|Central Técnica|Theatro Municipal)/i
      );
      if (venueMatch) {
        venueDetails = venueMatch[1];
      }

      // Imagem
      let imageUrl: string | null = null;
      const ogImage = $('meta[property="og:image"]').attr('content');
      const featuredImage = $(
        '.wp-post-image, .featured-image img, .elementor-post__thumbnail img'
      )
        .first()
        .attr('src');
      imageUrl = ogImage || featuredImage || null;

      // Informações de ingresso
      let ticketInfo: string | null = null;
      let ticketUrl = url; // ✅ Padrão: página do evento

      // Verificar se é gratuito
      if (
        fullText.includes('Gratuito') ||
        fullText.includes('gratuito') ||
        fullText.includes('Grátis')
      ) {
        ticketInfo = 'Entrada gratuita';
      } else if (fullText.includes('Evento Pago')) {
        ticketInfo = 'Evento pago';
      }

      // ✅ BUSCAR URL DE COMPRA DE INGRESSOS (Inti/Sympla/etc)
      const ticketButton = $(
        'a[href*="inti.com"], a[href*="sympla.com"], a[href*="ingresso"], a[href*="ticket"]'
      )
        .first()
        .attr('href');

      if (ticketButton && ticketButton !== url) {
        ticketUrl = ticketButton;
        console.log(`    🎫 Ticket URL: ${ticketUrl}`);
      }

      // Programa
      let program: string | null = null;
      const programSection = $('.programa, .repertorio, .program')
        .text()
        .trim();
      if (programSection && programSection.length > 50) {
        program = programSection;
      }

      // Detectar compositores
      const textForComposers = `${title} ${description} ${program || ''}`;
      const composerNames = extractComposerNames(textForComposers);

      // External ID
      const externalId = `theatro-municipal-${createSlug(title)}-${startDate.getTime()}`;

      return {
        title,
        slug: createSlug(title),
        description: description || title,
        type: eventType,
        startDate,
        startTime,
        endDate: null,
        endTime: null,
        venueDetails,
        ticketUrl,
        externalUrl: url,
        ticketInfo,
        externalId,
        imageUrl,
        composerNames,
        performers: [],
        program,
      };
    } catch (error) {
      console.error(`  ❌ Erro ao processar ${url}:`, error);
      return null;
    } finally {
      await page.close();
    }
  }

  // ==================== HELPERS ====================
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ==================== SCRIPT STANDALONE ====================
async function main() {
  const scraper = new TheatroMunicipalScraper({
    headless: true,
    startDate: new Date('2025-11-12'),
    endDate: new Date('2026-12-31'),
  });

  try {
    const events = await scraper.scrapeEvents();

    console.log('\n========================================');
    console.log('📊 RESUMO');
    console.log('========================================');
    console.log(`Total de eventos: ${events.length}`);

    if (events.length > 0) {
      console.log('\nTipos de eventos:');
      const typeCount: Record<string, number> = {};
      events.forEach((event) => {
        typeCount[event.type] = (typeCount[event.type] || 0) + 1;
      });

      Object.entries(typeCount).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });

      console.log('\nCompositores encontrados:');
      const allComposers = new Set<string>();
      events.forEach((event) => {
        event.composerNames.forEach((c) => allComposers.add(c));
      });
      console.log(`  Total: ${allComposers.size}`);
      if (allComposers.size > 0) {
        console.log(
          `  Nomes: ${Array.from(allComposers).slice(0, 10).join(', ')}${allComposers.size > 10 ? '...' : ''}`
        );
      }
    }

    console.log('\n========================================');
    console.log('✅ Scraping concluído com sucesso!');
    console.log('========================================');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await scraper.cleanup();
  }
}

if (require.main === module) {
  main();
}
