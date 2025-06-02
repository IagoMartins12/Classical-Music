// scripts/imslp-work-scraper.ts

import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

interface Work {
  id: string;
  name: string;
  permlink: string;
  type: string;
  parent: string;
  intvals: {
    composer: string;
    worktitle: string;
    pageid: string;
  };
}

interface WorkData {
  title: string;
  composerId: string;
  genreId: string;
  instrumentId: string;
  epochId: string;
  categoriesId: string;
  imslpPermlink: string;
  imslpId: string;
  videoUrl: string | null;
  opOrCatalog: string | null;
  compositionYear: string | null;
  firstPublishDate: string | null;
  tone: string | null;
  mediaDuration: string | null;
  workStyle: string | null;
  moviment: string | null;
  dedicateTo: string | null;
  difficulty: string | null;
  instrumentation: string | null;
  genres: string | null;
}

interface ScraperState {
  currentStart: number;
  totalProcessed: number;
  totalAdded: number;
  totalSkipped: number;
  totalErrors: number;
  lastUpdate: string;
  isRunning: boolean;
  lastSuccessfulBatch: number;
}

interface TimerState {
  startTime: number | null;
  totalElapsedTime: number;
  lastPauseTime: number | null;
}

interface InstrumentGenreCache {
  instruments: Map<string, any>;
  genres: Map<string, any>;
}

// Mapeamentos de tradução aprimorados
const INSTRUMENT_MAPPING: Record<string, string> = {
  // Instrumentos de cordas
  piano: 'Piano',
  violin: 'Violino',
  cello: 'Violoncelo',
  viola: 'Viola',
  harp: 'Harpa',
  guitar: 'Violão',

  // Voz
  voice: 'Voz',
  soprano: 'Soprano',
  alto: 'Alto',
  tenor: 'Tenor',
  bass: 'Baixo',

  // Órgão
  organ: 'Órgão',

  // Conjuntos
  orchestra: 'Orquestra',
  'string quartet': 'Quarteto de Cordas',
  'piano trio': 'Trio de Piano',
  'wind quintet': 'Quinteto de Sopros',
  'brass quintet': 'Quinteto de Metais',
  'string orchestra': 'Orquestra de Cordas',
  'chamber orchestra': 'Orquestra de Câmara',
  'symphony orchestra': 'Orquestra Sinfônica',
};

const GENRE_MAPPING: Record<string, string> = {
  // Formas musicais
  sonata: 'Sonata',
  sonatas: 'Sonatas',
  concerto: 'Concerto',
  concertos: 'Concertos',
  symphony: 'Sinfonia',
  symphonies: 'Sinfonias',

  // Danças
  waltz: 'Valsa',
  waltzes: 'Valsas',
  mazurka: 'Mazurca',
  mazurkas: 'Mazurcas',
  polonaise: 'Polonesa',
  polonaises: 'Polonesas',

  // Peças características
  nocturne: 'Noturno',
  nocturnes: 'Noturnos',
  etude: 'Estudo',
  etudes: 'Estudos',
  prelude: 'Prelúdio',
  preludes: 'Prelúdios',
  ballade: 'Balada',
  ballades: 'Baladas',
  scherzo: 'Scherzo',
  scherzos: 'Scherzos',
  fantasy: 'Fantasia',
  fantasies: 'Fantasias',

  // Variações e formas
  variations: 'Variações',
  rondo: 'Rondó',
  rondos: 'Rondós',
  fugue: 'Fuga',
  fugues: 'Fugas',

  // Danças e marchas
  dance: 'Dança',
  dances: 'Danças',
  march: 'Marcha',
  marches: 'Marchas',

  // Vocal
  song: 'Canção',
  songs: 'Canções',

  // Música de câmara
  solo: 'Solo',
  duet: 'Dueto',
  trio: 'Trio',
  quartet: 'Quarteto',
  quintet: 'Quinteto',

  // Ópera e teatro
  opera: 'Ópera',

  // Orquestral
  'orchestral works': 'Obras Orquestrais',
};

const STATE_FILE = path.join(process.cwd(), 'work-scraper-state.json');
const STATE_WORKS_FILE = path.join(process.cwd(), 'scraper-works-state.log');

const BATCH_SIZE = 100; // Reduzido para evitar sobrecarga
const DELAY_BETWEEN_REQUESTS = 3000; // Aumentado para ser mais respeitoso
const DELAY_BETWEEN_BATCHES = 10000; // Aumentado
const MAX_RETRIES = 3;

// Instância global do scraper para handlers de sinal
let globalWorkScraperInstance: WorkScraper | null = null;

class WorkScraper {
  private state: ScraperState;
  private shouldStop: boolean = false;
  private timer: TimerState;
  private cache: InstrumentGenreCache;

  constructor() {
    this.state = {
      currentStart: 0,
      totalProcessed: 0,
      totalAdded: 0,
      totalSkipped: 0,
      totalErrors: 0,
      lastUpdate: new Date().toISOString(),
      isRunning: false,
      lastSuccessfulBatch: 0,
    };

    this.timer = {
      startTime: null,
      totalElapsedTime: 0,
      lastPauseTime: null,
    };

    this.cache = {
      instruments: new Map(),
      genres: new Map(),
    };

    globalWorkScraperInstance = this;
  }

  // Inicializar cache de instrumentos e gêneros
  async initializeCache(): Promise<void> {
    try {
      // Carregar instrumentos
      const instruments = await prisma.instrument.findMany();
      instruments.forEach((instrument) => {
        this.cache.instruments.set(instrument.name.toLowerCase(), instrument);
      });

      // Carregar gêneros
      const genres = await prisma.genre.findMany();
      genres.forEach((genre) => {
        this.cache.genres.set(genre.name.toLowerCase(), genre);
      });

      console.log(
        `📚 Cache inicializado: ${instruments.length} instrumentos, ${genres.length} gêneros`
      );
    } catch (error) {
      console.error('❌ Erro ao inicializar cache:', error);
    }
  }

  // Carregar estado salvo
  async loadState(): Promise<void> {
    try {
      const stateData = await fs.readFile(STATE_FILE, 'utf-8');
      const savedState = JSON.parse(stateData);

      this.state = { ...this.state, ...savedState };

      if (savedState.timer) {
        this.timer = { ...this.timer, ...savedState.timer };
      }

      console.log('✓ Estado carregado:', this.state);
      console.log(
        `⏱ Tempo total acumulado: ${this.formatElapsedTime(
          this.timer.totalElapsedTime
        )}`
      );
    } catch (error) {
      console.log('⚠ Nenhum estado anterior encontrado, iniciando do zero');
    }
  }

  // Salvar estado atual
  async saveState(): Promise<void> {
    try {
      this.state.lastUpdate = new Date().toISOString();

      const stateToSave = {
        ...this.state,
        timer: this.timer,
      };

      await fs.writeFile(STATE_FILE, JSON.stringify(stateToSave, null, 2));
      console.log(
        `💾 Estado salvo - Start: ${this.state.currentStart} | Processados: ${this.state.totalProcessed} | Adicionados: ${this.state.totalAdded} | Pulados: ${this.state.totalSkipped} | Erros: ${this.state.totalErrors}`
      );
    } catch (error) {
      console.error('❌ Erro ao salvar estado:', error);
    }
  }

  // Métodos de timer
  startTimer(): void {
    if (!this.timer.startTime) {
      this.timer.startTime = Date.now();
      console.log(`⏱ Timer iniciado: ${new Date().toLocaleTimeString()}`);
    }
  }

  pauseTimer(): void {
    if (this.timer.startTime) {
      const currentTime = Date.now();
      this.timer.totalElapsedTime += currentTime - this.timer.startTime;
      this.timer.lastPauseTime = currentTime;
      this.timer.startTime = null;
    }
  }

  resumeTimer(): void {
    if (!this.timer.startTime && this.timer.lastPauseTime) {
      this.timer.startTime = Date.now();
      console.log(`⏱ Timer retomado: ${new Date().toLocaleTimeString()}`);
    }
  }

  getTotalElapsedTime(): number {
    let totalTime = this.timer.totalElapsedTime;

    if (this.timer.startTime) {
      totalTime += Date.now() - this.timer.startTime;
    }

    return totalTime;
  }

  formatElapsedTime(timeInMs: number): string {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Método para parar graciosamente
  async gracefulStop(): Promise<void> {
    console.log('\n🛑 Parando scraper de obras graciosamente...');

    this.pauseTimer();
    this.shouldStop = true;
    this.state.isRunning = false;
    await this.saveState();

    const totalTime = this.getTotalElapsedTime();
    console.log(
      `⏱ Tempo total de execução: ${this.formatElapsedTime(totalTime)}`
    );
    console.log(
      '✅ Estado salvo com sucesso. Você pode continuar depois com "npm run work-scraper start"'
    );
  }

  // Buscar obras da API IMSLP com retry
  async fetchWorks(start: number, retries: number = 0): Promise<Work[]> {
    const apiUrl = `https://imslp.org/imslpscripts/API.ISCR.php?account=worklist/disclaimer=accepted/sort=id/type=2/start=${start}/retformat=json`;

    console.log(
      `📡 Buscando obras - Start: ${start} (tentativa ${retries + 1})`
    );

    try {
      const response = await axios.get(apiUrl, {
        timeout: 30000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      let works: Work[] = [];
      if (Array.isArray(response.data)) {
        works = response.data;
      } else if (response.data && typeof response.data === 'object') {
        works = Object.values(response.data) as Work[];
      }

      // Filtrar apenas obras válidas
      works = works.filter(
        (work) =>
          work.type === '2' &&
          work.intvals &&
          work.intvals.composer &&
          work.intvals.worktitle &&
          work.permlink
      );

      console.log(`📊 Encontradas ${works.length} obras válidas`);
      return works;
    } catch (error) {
      console.error(
        `❌ Erro ao buscar obras (start=${start}, tentativa ${retries + 1}):`,
        error
      );

      if (retries < MAX_RETRIES) {
        const waitTime = (retries + 1) * 5000; // Backoff exponencial
        console.log(
          `⏳ Aguardando ${waitTime / 1000}s antes de tentar novamente...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.fetchWorks(start, retries + 1);
      }

      return [];
    }
  }

  // Verificar se obra já existe no banco
  async workExists(imslpId: string, title: string): Promise<boolean> {
    try {
      const existing = await prisma.work.findFirst({
        where: {
          OR: [
            { imslpId: imslpId },
            {
              title: title,
              imslpId: { not: imslpId }, // Evitar falso positivo
            },
          ],
        },
      });
      return !!existing;
    } catch (error) {
      console.error('❌ Erro ao verificar obra existente:', error);
      return false;
    }
  }

  // Traduzir e buscar/criar instrumento
  async findOrCreateInstrument(instrumentName: string): Promise<any> {
    try {
      const normalizedName = instrumentName.toLowerCase().trim();

      // Verificar cache primeiro
      if (this.cache.instruments.has(normalizedName)) {
        return this.cache.instruments.get(normalizedName);
      }

      // Traduzir nome
      let translatedName = INSTRUMENT_MAPPING[normalizedName] || instrumentName;

      // Buscar por nome traduzido
      const translatedNormalized = translatedName.toLowerCase();
      if (this.cache.instruments.has(translatedNormalized)) {
        return this.cache.instruments.get(translatedNormalized);
      }

      // Buscar no banco por similaridade
      let instrument = await prisma.instrument.findFirst({
        where: {
          OR: [
            { name: { contains: translatedName, mode: 'insensitive' } },
            { name: { contains: instrumentName, mode: 'insensitive' } },
          ],
        },
      });

      // Se não encontrou, criar novo
      if (!instrument) {
        // Capitalizar primeira letra
        translatedName =
          translatedName.charAt(0).toUpperCase() + translatedName.slice(1);

        instrument = await prisma.instrument.create({
          data: {
            name: translatedName,
            createdAt: new Date(),
          },
        });

        console.log(`🎼 Novo instrumento criado: ${translatedName}`);
      }

      // Adicionar ao cache
      this.cache.instruments.set(normalizedName, instrument);
      this.cache.instruments.set(translatedNormalized, instrument);

      return instrument;
    } catch (error) {
      console.error(
        `❌ Erro ao buscar/criar instrumento ${instrumentName}:`,
        error
      );
      // Retornar primeiro instrumento como fallback
      return (await prisma.instrument.findFirst()) || null;
    }
  }

  // Traduzir e buscar/criar gênero
  async findOrCreateGenre(genreName: string): Promise<any> {
    try {
      const normalizedName = genreName.toLowerCase().trim();

      // Verificar cache primeiro
      if (this.cache.genres.has(normalizedName)) {
        return this.cache.genres.get(normalizedName);
      }

      // Traduzir nome
      let translatedName = GENRE_MAPPING[normalizedName] || genreName;

      // Buscar por nome traduzido
      const translatedNormalized = translatedName.toLowerCase();
      if (this.cache.genres.has(translatedNormalized)) {
        return this.cache.genres.get(translatedNormalized);
      }

      // Buscar no banco por similaridade
      let genre = await prisma.genre.findFirst({
        where: {
          OR: [
            { name: { contains: translatedName, mode: 'insensitive' } },
            { name: { contains: genreName, mode: 'insensitive' } },
          ],
        },
      });

      // Se não encontrou, criar novo
      if (!genre) {
        // Capitalizar primeira letra
        translatedName =
          translatedName.charAt(0).toUpperCase() + translatedName.slice(1);

        genre = await prisma.genre.create({
          data: {
            name: translatedName,
            createdAt: new Date(),
          },
        });

        console.log(`🎵 Novo gênero criado: ${translatedName}`);
      }

      // Adicionar ao cache
      this.cache.genres.set(normalizedName, genre);
      this.cache.genres.set(translatedNormalized, genre);

      return genre;
    } catch (error) {
      console.error(`❌ Erro ao buscar/criar gênero ${genreName}:`, error);
      // Retornar primeiro gênero como fallback
      return (await prisma.genre.findFirst()) || null;
    }
  }

  // Buscar compositor no banco de dados
  async findComposerInDatabase(composerName: string): Promise<any> {
    try {
      let composer = await prisma.composer.findFirst({
        where: {
          OR: [
            { name: { contains: composerName, mode: 'insensitive' } },
            { fullName: { contains: composerName, mode: 'insensitive' } },
            { imslpId: `Category:${composerName}` },
          ],
        },
      });

      if (!composer) {
        // Tentar buscar apenas pelo sobrenome
        const nameParts = composerName.split(',');
        if (nameParts.length > 1) {
          const lastName = nameParts[0].trim();
          composer = await prisma.composer.findFirst({
            where: {
              OR: [
                { name: { contains: lastName, mode: 'insensitive' } },
                { fullName: { contains: lastName, mode: 'insensitive' } },
              ],
            },
          });
        }
      }

      //Se mesmo assim nao achar, salvar como 'Anônimo'
      if (!composer) {
        composer = await prisma.composer.findFirst({
          where: {
            OR: [
              { name: { contains: 'Anonymous', mode: 'insensitive' } },
              { fullName: { contains: composerName, mode: 'insensitive' } },
              { imslpId: `Category:${composerName}` },
            ],
          },
        });

        console.error(
          `❌ Erro ao buscar compositor ${composerName}, salvando como 'Anônimo' \n`
        );
      }
      return composer;
    } catch (error) {
      console.error(`❌ Erro ao buscar compositor ${composerName}:`, error);
      return null;
    }
  }

  // Extrair dados detalhados da obra com retry
  async extractWorkDetails(
    work: Work,
    retries: number = 0
  ): Promise<WorkData | null> {
    try {
      const { intvals, permlink, id } = work;
      const { composer, worktitle, pageid } = intvals;

      console.log(`🔍 Processando obra: ${worktitle} por ${composer}`);

      // Buscar compositor no banco de dados
      const composerData = await this.findComposerInDatabase(composer);
      if (!composerData) {
        console.log(`❌ Compositor não encontrado: ${composer}`);
        await fs.appendFile(
          STATE_WORKS_FILE,
          `❌ ${pageid || id} / Compositor não encontrado: ${composer}\n`
        );
        return null;
      }

      // Fazer scraping da página da obra
      const pageResponse = await axios.get(permlink, {
        timeout: 15000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      const $ = cheerio.load(pageResponse.data);

      // Extrair informações detalhadas
      const workDetails: Partial<WorkData> = {};

      // Extrair informações da tabela principal
      $('.wi_body table tr, .wp_header table tr').each((index, element) => {
        const $row = $(element);
        const header = $row.find('th').first().text().trim().toLowerCase();
        const content = $row.find('td').first().text().trim();

        if (header.includes('opus') || header.includes('catalog')) {
          workDetails.opOrCatalog = content || null;
        } else if (header.includes('year') || header.includes('composition')) {
          workDetails.compositionYear = content || null;
        } else if (
          header.includes('first publication') ||
          header.includes('publication')
        ) {
          workDetails.firstPublishDate = content || null;
        } else if (header.includes('key') || header.includes('tom')) {
          workDetails.tone = content || null;
        } else if (header.includes('instrumentation')) {
          workDetails.instrumentation = content || null;
        } else if (
          header.includes('piece style') ||
          header.includes('estilo')
        ) {
          workDetails.workStyle = content || null;
        } else if (
          header.includes('movements') ||
          header.includes('sections')
        ) {
          workDetails.moviment = content || null;
        } else if (header.includes('dedication')) {
          workDetails.dedicateTo = content || null;
        }
      });

      // Extrair gêneros e instrumentos
      const genres: string[] = [];
      const instruments: string[] = [];

      // Buscar em categorias de gênero
      $('.wp_header table tr').each((index, element) => {
        const $row = $(element);
        const header = $row.find('th').first().text().trim().toLowerCase();
        const content = $row.find('td').first();

        if (
          header.includes('genre categories') ||
          header.includes('categorias')
        ) {
          content.find('a').each((i, link) => {
            const genreText = $(link).text().trim();
            if (
              genreText &&
              !genreText.includes('player') &&
              !genreText.includes('featuring')
            ) {
              genres.push(genreText);
            }
          });
        }

        if (
          header.includes('instrumentation') ||
          header.includes('instrumentação')
        ) {
          // Extrair instrumentos do texto de instrumentação
          const instText = content.text().toLowerCase();
          Object.keys(INSTRUMENT_MAPPING).forEach((eng) => {
            if (instText.includes(eng)) {
              instruments.push(eng);
            }
          });
        }
      });

      // Determinar instrumento principal
      let primaryInstrument: any;
      if (instruments.length > 0) {
        primaryInstrument = await this.findOrCreateInstrument(instruments[0]);
      } else if (workDetails.instrumentation) {
        const instrumentName = workDetails.instrumentation.split(',')[0].trim();
        primaryInstrument = await this.findOrCreateInstrument(instrumentName);
      } else {
        // Tentar inferir do título
        const titleLower = worktitle.toLowerCase();
        let detectedInstrument = 'Piano'; // Default

        Object.keys(INSTRUMENT_MAPPING).forEach((eng) => {
          if (titleLower.includes(eng)) {
            detectedInstrument = eng;
          }
        });

        primaryInstrument = await this.findOrCreateInstrument(
          detectedInstrument
        );
      }

      // Determinar gênero principal
      let primaryGenre: any;
      if (genres.length > 0) {
        primaryGenre = await this.findOrCreateGenre(genres[0]);
      } else {
        // Tentar inferir do título
        const titleLower = worktitle.toLowerCase();
        let detectedGenre = 'Solo'; // Default

        Object.keys(GENRE_MAPPING).forEach((eng) => {
          if (titleLower.includes(eng)) {
            detectedGenre = eng;
          }
        });

        primaryGenre = await this.findOrCreateGenre(detectedGenre);
      }

      // Buscar categoria padrão
      const category =
        (await prisma.categorie.findFirst({
          where: { name: { contains: 'Classical', mode: 'insensitive' } },
        })) || (await prisma.categorie.findFirst());

      if (!category) {
        console.log('❌ Nenhuma categoria encontrada no banco');
        return null;
      }

      return {
        title: worktitle,
        composerId: composerData.id,
        genreId: primaryGenre?.id || '',
        instrumentId: primaryInstrument?.id || '',
        epochId: composerData.epochId,
        categoriesId: category.id,
        imslpPermlink: permlink,
        imslpId: pageid || id.replace(/"/g, ''),
        opOrCatalog: workDetails.opOrCatalog ?? null,
        compositionYear: workDetails.compositionYear ?? null,
        firstPublishDate: workDetails.firstPublishDate ?? null,
        tone: workDetails.tone ?? null,
        mediaDuration: workDetails.mediaDuration ?? null,
        workStyle: workDetails.workStyle ?? null,
        moviment: workDetails.moviment ?? null,
        dedicateTo: workDetails.dedicateTo ?? null,
        difficulty: workDetails.difficulty ?? null,
        instrumentation: workDetails.instrumentation ?? null,
        genres: genres.join(', ') || null,
        videoUrl: null,
      };
    } catch (error) {
      console.error(
        `❌ Erro ao extrair dados da obra ${work.intvals?.worktitle}:`,
        error
      );

      if (retries < MAX_RETRIES) {
        const waitTime = (retries + 1) * 2000;
        console.log(`⏳ Tentando novamente em ${waitTime / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.extractWorkDetails(work, retries + 1);
      }

      await fs.appendFile(
        STATE_WORKS_FILE,
        `❌ ${work.intvals?.pageid || work.id} / Erro ao extrair dados\n`
      );
      return null;
    }
  }

  // Salvar obra no banco de dados
  async saveWork(workData: WorkData): Promise<boolean> {
    try {
      // Verificar se já existe
      if (await this.workExists(workData.imslpId, workData.title)) {
        console.log(`⚠ Obra já existe: ${workData.title}`);
        return false;
      }

      await prisma.work.create({
        data: workData,
      });

      console.log(`✅ Obra salva: ${workData.title}`);
      await fs.appendFile(
        STATE_WORKS_FILE,
        `✅ ${workData.imslpId} / Obra salva: ${workData.title}\n`
      );
      return true;
    } catch (error) {
      console.error(`❌ Erro ao salvar obra ${workData.title}:`, error);
      return false;
    }
  }

  // Processar um lote de obras
  async processBatch(
    works: Work[]
  ): Promise<{ processed: number; added: number }> {
    let processedCount = 0;
    let addedCount = 0;

    console.log(`📋 Processando ${works.length} obras \n`);

    for (const work of works) {
      if (this.shouldStop) {
        console.log('🛑 Interrupção detectada, parando processamento...');
        break;
      }

      try {
        processedCount++;
        this.state.totalProcessed++;

        // Verificar se já existe antes de processar
        const imslpId = work.intvals?.pageid || work.id.replace(/"/g, '');
        if (await this.workExists(imslpId, work.intvals?.worktitle || '')) {
          console.log(`⏭ Pulando (já existe): ${work.intvals?.worktitle} \n`);
          continue;
        }

        const workData = await this.extractWorkDetails(work);

        if (workData) {
          const saved = await this.saveWork(workData);
          if (saved) {
            addedCount++;
            this.state.totalAdded++;
          }
        }

        // Salvar estado a cada 5 obras
        if (processedCount % 5 === 0) {
          await this.saveState();
        }

        // Delay entre obras
        await new Promise((resolve) =>
          setTimeout(resolve, DELAY_BETWEEN_REQUESTS)
        );
      } catch (error) {
        console.error(`❌ Erro ao processar obra:`, error);
        continue;
      }
    }

    return { processed: processedCount, added: addedCount };
  }

  // Executar scraper principal
  async run(): Promise<void> {
    console.log('🚀 Iniciando Work Scraper...');

    await this.loadState();

    if (this.state.isRunning) {
      console.log(
        '⚠ Scraper já está rodando. Pare o processo anterior primeiro.'
      );
      return;
    }

    if (this.state.currentStart > 0) {
      console.log(
        `🔄 Continuando scraper da posição ${this.state.currentStart} (já processados: ${this.state.totalProcessed}, já adicionados: ${this.state.totalAdded})`
      );
      this.resumeTimer();
    } else {
      this.startTimer();
    }

    this.state.isRunning = true;
    this.shouldStop = false;
    await this.saveState();

    try {
      let hasMoreWorks = true;

      while (hasMoreWorks && !this.shouldStop) {
        const currentElapsed = this.getTotalElapsedTime();
        console.log(
          `\n🔄 Iniciando lote - Start: ${
            this.state.currentStart
          } | Tempo: ${this.formatElapsedTime(currentElapsed)}`
        );

        const works = await this.fetchWorks(this.state.currentStart);

        if (works.length === 0) {
          console.log('🏁 Não há mais obras para processar!');
          hasMoreWorks = false;
          break;
        }

        const result = await this.processBatch(works);

        this.state.currentStart += BATCH_SIZE;
        this.state.lastSuccessfulBatch = this.state.currentStart;

        await this.saveState();

        const totalElapsed = this.getTotalElapsedTime();
        console.log(
          `📊 Lote concluído - Processados: ${result.processed}, Adicionados: ${result.added}`
        );
        console.log(
          `📈 Total - Processados: ${this.state.totalProcessed}, Adicionados: ${this.state.totalAdded}`
        );
        console.log(`⏱ Tempo total: ${this.formatElapsedTime(totalElapsed)}`);

        if (this.shouldStop) {
          console.log('🛑 Scraper interrompido pelo usuário');
          break;
        }

        if (hasMoreWorks) {
          console.log(
            `⏸ Aguardando ${
              DELAY_BETWEEN_BATCHES / 1000
            }s antes do próximo lote...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, DELAY_BETWEEN_BATCHES)
          );
        }
      }

      if (!this.shouldStop) {
        this.pauseTimer();
        const finalTime = this.getTotalElapsedTime();
        console.log(`\n🎉 Work Scraper concluído!`);
        console.log(`📊 Estatísticas finais:`);
        console.log(`   - Total processados: ${this.state.totalProcessed}`);
        console.log(`   - Total adicionados: ${this.state.totalAdded}`);
        console.log(`   - Tempo total: ${this.formatElapsedTime(finalTime)}`);
      }
    } catch (error) {
      console.error('❌ Erro fatal no scraper:', error);
      this.pauseTimer();
      const errorTime = this.getTotalElapsedTime();
      console.log(`⏱ Tempo até o erro: ${this.formatElapsedTime(errorTime)}`);
      console.log(
        '💾 Estado foi salvo. Você pode continuar com "npm run work-scraper start"'
      );
    } finally {
      this.state.isRunning = false;
      await this.saveState();
      await prisma.$disconnect();
    }
  }

  // Métodos auxiliares (mesmo padrão do scraper de compositores)
  async stop(): Promise<void> {
    console.log('🛑 Parando scraper de obras...');
    this.pauseTimer();
    const totalTime = this.getTotalElapsedTime();
    this.state.isRunning = false;
    await this.saveState();
    console.log(
      `⏱ Tempo total de execução: ${this.formatElapsedTime(totalTime)}`
    );
    console.log(
      '✅ Scraper parado. Estado salvo. Use "start" para continuar de onde parou.'
    );
  }

  async reset(): Promise<void> {
    console.log('🔄 Resetando estado do work scraper...');
    this.state = {
      currentStart: 0,
      totalProcessed: 0,
      totalAdded: 0,
      lastUpdate: new Date().toISOString(),
      isRunning: false,
      lastSuccessfulBatch: 0,
      totalErrors: 0,
      totalSkipped: 0,
    };

    this.timer = {
      startTime: null,
      totalElapsedTime: 0,
      lastPauseTime: null,
    };

    await this.saveState();
    console.log('✅ Estado resetado. Próxima execução começará do início.');
  }

  async status(): Promise<void> {
    await this.loadState();
    const currentTime = this.getTotalElapsedTime();

    console.log('📊 Status do Scraper:');
    console.log(`   - Posição atual: ${this.state.currentStart}`);
    console.log(
      `   - Último lote bem-sucedido: ${this.state.lastSuccessfulBatch}`
    );
    console.log(`   - Total processados: ${this.state.totalProcessed}`);
    console.log(`   - Total adicionados: ${this.state.totalAdded}`);
    console.log(`   - Rodando: ${this.state.isRunning ? 'Sim' : 'Não'}`);
    console.log(`   - Última atualização: ${this.state.lastUpdate}`);
    console.log(`   - Tempo total: ${this.formatElapsedTime(currentTime)}`);

    if (this.state.totalProcessed > 0) {
      const successRate = (
        (this.state.totalAdded / this.state.totalProcessed) *
        100
      ).toFixed(2);
      console.log(`   - Taxa de sucesso: ${successRate}%`);

      // Calcular velocidade média
      if (currentTime > 0) {
        const itemsPerSecond = (
          this.state.totalProcessed /
          (currentTime / 1000)
        ).toFixed(2);
        console.log(`   - Velocidade média: ${itemsPerSecond} items/s`);
      }
    }
  }
  // Método para continuar de onde parou (alias para run)
  async continue(): Promise<void> {
    console.log('🔄 Continuando scraper de onde parou...');
    await this.run();
  }
}

async function main() {
  const scraper = new WorkScraper();

  const command = process.argv[2];

  switch (command) {
    case 'start':
      await scraper.run();
      break;
    case 'continue':
      await scraper.continue();
      break;
    case 'stop':
      await scraper.stop();
      break;
    case 'reset':
      await scraper.reset();
      break;
    case 'status':
      await scraper.status();
      break;
    default:
      console.log('Comandos disponíveis:');
      console.log('  npm run scraper start    - Iniciar/continuar scraper');
      console.log(
        '  npm run scraper continue - Continuar de onde parou (mesmo que start)'
      );
      console.log('  npm run scraper stop     - Parar scraper graciosamente');
      console.log(
        '  npm run scraper reset    - Resetar estado (começar do zero)'
      );
      console.log('  npm run scraper status   - Ver status atual');
  }
}

// Manipular sinais de interrupção de forma mais robusta
async function handleGracefulShutdown(signal: string) {
  console.log(`\n🛑 Sinal ${signal} detectado...`);

  if (globalWorkScraperInstance) {
    await globalWorkScraperInstance.gracefulStop();
  }

  console.log('👋 Scraper finalizado com segurança');
  process.exit(0);
}

// Registrar handlers de sinal
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

// Handler para erros não capturados
process.on('unhandledRejection', async (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);

  if (globalWorkScraperInstance) {
    await globalWorkScraperInstance.gracefulStop();
  }

  process.exit(1);
});

if (require.main === module) {
  main().catch(console.error);
}

export default WorkScraper;
