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
  dedicationComposerLink: string | null;
  difficulty: string | null;
  difficultyLevel: number | null;
  instrumentation: string | null;
  genres: string | null;
  workType: 'INDIVIDUAL' | 'COMPLETE_WORK' | 'ARRANGEMENT' | 'COLLECTION';
  isPartOfCollection: boolean;
  parentWorkId: string | null;
  movementNumber: number | null;
  categories: string[]; // Array de categorias para relacionamento many-to-many
}

interface CategoryData {
  id: string;
  name: string;
  imslpCategory?: string;
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
  categories: Map<string, any>;
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

const DEFAULT_INSTRUMENT_ID = '683da02226d5c33e70b2dfa9';
const DEFAULT_GENRE_ID = '683da58e7620cf5c202dfeb7';

// Mapeamento para identificar dificuldade RCM (Royal Conservatory of Music)
const DIFFICULTY_KEYWORDS: Record<string, number> = {
  preparatory: 1,
  beginner: 2,
  elementary: 3,
  'grade 1': 1,
  'grade 2': 2,
  'grade 3': 3,
  'grade 4': 4,
  'grade 5': 5,
  'grade 6': 6,
  'grade 7': 7,
  'grade 8': 8,
  'grade 9': 9,
  'grade 10': 10,
  diploma: 11,
  advanced: 9,
  intermediate: 5,
  easy: 2,
  moderate: 4,
  difficult: 7,
  'very difficult': 9,
  virtuoso: 10,
};

// Palavras-chave para identificar tipos de trabalho
const WORK_TYPE_KEYWORDS = {
  COLLECTION: [
    'complete',
    'all',
    'entire',
    'collection',
    'set',
    'book',
    'completo',
    'todos',
    'inteiro',
    'coleção',
    'conjunto',
    'livro',
  ],
  ARRANGEMENT: [
    'arrangement',
    'transcription',
    'adaptation',
    'version',
    'arranjo',
    'transcrição',
    'adaptação',
    'versão',
  ],
  INDIVIDUAL: [
    'no.',
    'nº',
    'op.',
    'piece',
    'movement',
    'mvt.',
    'peça',
    'movimento',
    'mov.',
  ],
};

const STATE_FILE = path.join(process.cwd(), 'work-scraper-state.json');
const STATE_WORKS_FILE = path.join(process.cwd(), 'scraper-works-state.log');

const BATCH_SIZE = 100;
const DELAY_BETWEEN_REQUESTS = 3000;
const DELAY_BETWEEN_BATCHES = 10000;
const MAX_RETRIES = 3;

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
      categories: new Map(),
    };

    globalWorkScraperInstance = this;
  }

  // Inicializar cache de instrumentos, gêneros e categorias
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

      // Carregar categorias
      const categories = await prisma.categorie.findMany();
      categories.forEach((category) => {
        this.cache.categories.set(category.name.toLowerCase(), category);
      });

      console.log(
        `📚 Cache inicializado: ${instruments.length} instrumentos, ${genres.length} gêneros, ${categories.length} categorias`
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
        const waitTime = (retries + 1) * 5000;
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
              imslpId: { not: imslpId },
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

  // Encontrar ou criar categoria
  async findOrCreateCategory(categoryName: string): Promise<CategoryData> {
    try {
      const normalizedName = categoryName.toLowerCase().trim();

      // Verificar cache primeiro
      if (this.cache.categories.has(normalizedName)) {
        return this.cache.categories.get(normalizedName);
      }

      // Buscar no banco
      let category = await prisma.categorie.findFirst({
        where: {
          name: { contains: categoryName, mode: 'insensitive' },
        },
      });

      // Se não encontrou, criar nova
      if (!category) {
        const capitalizedName =
          categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

        category = await prisma.categorie.create({
          data: {
            name: capitalizedName,
            createdAt: new Date(),
          },
        });

        console.log(`🏷️ Nova categoria criada: ${capitalizedName}`);
      }

      // Adicionar ao cache
      this.cache.categories.set(normalizedName, category);

      return category;
    } catch (error) {
      console.error(
        `❌ Erro ao buscar/criar categoria ${categoryName}:`,
        error
      );
      // Retornar categoria padrão como fallback
      return (
        (await prisma.categorie.findFirst()) || { id: '', name: 'Classical' }
      );
    }
  }

  // Traduzir e buscar/criar instrumento
  async findOrCreateInstrument(instrumentName: string): Promise<any> {
    try {
      const normalizedName = instrumentName.toLowerCase().trim();

      if (this.cache.instruments.has(normalizedName)) {
        return this.cache.instruments.get(normalizedName);
      }

      let translatedName = INSTRUMENT_MAPPING[normalizedName] || instrumentName;

      const translatedNormalized = translatedName.toLowerCase();
      if (this.cache.instruments.has(translatedNormalized)) {
        return this.cache.instruments.get(translatedNormalized);
      }

      let instrument = await prisma.instrument.findFirst({
        where: {
          OR: [
            { name: { contains: translatedName, mode: 'insensitive' } },
            { name: { contains: instrumentName, mode: 'insensitive' } },
          ],
        },
      });

      if (!instrument) {
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

      this.cache.instruments.set(normalizedName, instrument);
      this.cache.instruments.set(translatedNormalized, instrument);

      return instrument;
    } catch (error) {
      console.error(
        `❌ Erro ao buscar/criar instrumento ${instrumentName}:`,
        error
      );
      return (await prisma.instrument.findFirst()) || null;
    }
  }

  // Traduzir e buscar/criar gênero
  async findOrCreateGenre(genreName: string): Promise<any> {
    try {
      const normalizedName = genreName.toLowerCase().trim();

      if (this.cache.genres.has(normalizedName)) {
        return this.cache.genres.get(normalizedName);
      }

      let translatedName = GENRE_MAPPING[normalizedName] || genreName;

      const translatedNormalized = translatedName.toLowerCase();
      if (this.cache.genres.has(translatedNormalized)) {
        return this.cache.genres.get(translatedNormalized);
      }

      let genre = await prisma.genre.findFirst({
        where: {
          OR: [
            { name: { contains: translatedName, mode: 'insensitive' } },
            { name: { contains: genreName, mode: 'insensitive' } },
          ],
        },
      });

      if (!genre) {
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

      this.cache.genres.set(normalizedName, genre);
      this.cache.genres.set(translatedNormalized, genre);

      return genre;
    } catch (error) {
      console.error(`❌ Erro ao buscar/criar gênero ${genreName}:`, error);
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

      if (!composer) {
        composer = await prisma.composer.findFirst({
          where: {
            OR: [
              { name: { contains: 'Anonymous', mode: 'insensitive' } },
              { fullName: { contains: 'Anonymous', mode: 'insensitive' } },
            ],
          },
        });

        console.error(
          `❌ Compositor não encontrado: ${composerName}, usando 'Anonymous'`
        );
      }
      return composer;
    } catch (error) {
      console.error(`❌ Erro ao buscar compositor ${composerName}:`, error);
      return null;
    }
  }

  // Determinar tipo de trabalho baseado no título
  determineWorkType(
    title: string
  ): 'INDIVIDUAL' | 'COMPLETE_WORK' | 'ARRANGEMENT' | 'COLLECTION' {
    const titleLower = title.toLowerCase();

    // Verificar se é arranjo
    for (const keyword of WORK_TYPE_KEYWORDS.ARRANGEMENT) {
      if (titleLower.includes(keyword)) {
        return 'ARRANGEMENT';
      }
    }

    // Verificar se é coleção completa
    for (const keyword of WORK_TYPE_KEYWORDS.COLLECTION) {
      if (titleLower.includes(keyword)) {
        return 'COMPLETE_WORK';
      }
    }

    // Verificar se é peça individual (tem numeração)
    for (const keyword of WORK_TYPE_KEYWORDS.INDIVIDUAL) {
      if (titleLower.includes(keyword)) {
        return 'INDIVIDUAL';
      }
    }

    // Default para individual se não conseguir determinar
    return 'INDIVIDUAL';
  }

  // Extrair nível de dificuldade do texto
  extractDifficultyLevel(text: string): number | null {
    const textLower = text.toLowerCase();

    for (const [keyword, level] of Object.entries(DIFFICULTY_KEYWORDS)) {
      if (textLower.includes(keyword)) {
        return level;
      }
    }

    // Tentar encontrar números que podem indicar grade
    const gradeMatch = textLower.match(
      /grade\s*(\d+)|level\s*(\d+)|nível\s*(\d+)/
    );
    if (gradeMatch) {
      const grade = parseInt(gradeMatch[1] || gradeMatch[2] || gradeMatch[3]);
      if (grade >= 1 && grade <= 10) {
        return grade;
      }
    }

    return null;
  }

  // Extrair informações de dedicação
  extractDedicationInfo(
    dedicationText: string,
    $: cheerio.CheerioAPI
  ): { dedicateTo: string | null; dedicationComposerLink: string | null } {
    if (!dedicationText) {
      return { dedicateTo: null, dedicationComposerLink: null };
    }

    // Procurar por links na seção de dedicação
    const dedicationLinks = $(
      'td:contains("Dedication"), td:contains("Dedicado")'
    )
      .next()
      .find('a[href*="Category:"]');

    if (dedicationLinks.length > 0) {
      const firstLink = dedicationLinks.first();
      const composerLink = firstLink.attr('href');
      const composerName = firstLink.text().trim();

      if (composerLink && composerLink.includes('Category:')) {
        // É um compositor, salvar o link completo
        const fullLink = composerLink.startsWith('http')
          ? composerLink
          : `https://imslp.org${composerLink}`;
        return {
          dedicateTo: composerName,
          dedicationComposerLink: fullLink,
        };
      }
    }

    // Se não é compositor, apenas salvar o texto
    return {
      dedicateTo: dedicationText.trim(),
      dedicationComposerLink: null,
    };
  }

  // Extrair múltiplas categorias da obra
  async extractWorkCategories($: cheerio.CheerioAPI): Promise<string[]> {
    const categories: Set<string> = new Set();

    // Buscar em diferentes locais da página
    // 1. Categorias de gênero
    $('.wp_header table tr').each((index, element) => {
      const $row = $(element);
      const header = $row.find('th').first().text().trim().toLowerCase();

      if (
        header.includes('genre categories') ||
        header.includes('categorias')
      ) {
        $row.find('td a').each((i, link) => {
          const categoryName = $(link).text().trim();
          if (categoryName && categoryName.length > 0) {
            categories.add(categoryName);
          }
        });
      }
    });

    // 2. Buscar em outras seções da página
    $('a[href*="Category:"]').each((index, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim();

      if (href && text && text.length > 0) {
        // Filtrar apenas categorias relevantes
        const categoryPattern = /Category:([^\/]+)/;
        const match = href.match(categoryPattern);

        if (match) {
          const categoryName = decodeURIComponent(match[1]).replace(/_/g, ' ');
          // Adicionar apenas se parece ser uma categoria musical válida
          if (this.isValidMusicCategory(categoryName)) {
            categories.add(categoryName);
          }
        }
      }
    });

    // 3. Buscar categorias no footer da página
    $('.catlinks a').each((index, element) => {
      const categoryName = $(element).text().trim();
      if (categoryName && this.isValidMusicCategory(categoryName)) {
        categories.add(categoryName);
      }
    });

    return Array.from(categories);
  }

  // Verificar se é uma categoria musical válida
  private isValidMusicCategory(categoryName: string): boolean {
    const validPatterns = [
      /\d{4}s?/, // Anos (1800s, 1850, etc.)
      /century/i, // Séculos
      /baroque|classical|romantic|modern|contemporary/i, // Períodos
      /piano|violin|orchestra|chamber|vocal|opera/i, // Instrumentos/tipos
      /sonata|concerto|symphony|prelude|etude|waltz/i, // Formas musicais
      /major|minor|flat|sharp/i, // Tonalidades
      /pieces|works|compositions/i, // Tipos de obra
    ];

    // Verificar se a categoria não é muito genérica
    const invalidPatterns = [
      /^[A-Z]$/, // Letras únicas
      /^page$/i, // Palavras genéricas
      /^article$/i,
      /^music$/i,
      /^composer$/i,
    ];

    if (invalidPatterns.some((pattern) => pattern.test(categoryName))) {
      return false;
    }

    return (
      validPatterns.some((pattern) => pattern.test(categoryName)) ||
      categoryName.length > 3
    ); // Aceitar categorias com mais de 3 caracteres
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

      // Título limpo
      workDetails.title = worktitle.trim();

      // IDs básicos
      workDetails.composerId = composerData.id;
      workDetails.imslpPermlink = permlink;
      workDetails.imslpId = pageid || id;

      // Determinar tipo de trabalho
      workDetails.workType = this.determineWorkType(worktitle);

      // Extrair informações da tabela de detalhes
      $('.wi_body table tr, .wp_header table tr').each((index, element) => {
        const $row = $(element);
        const headerCell = $row.find('th, td').first();
        const valueCell = $row.find('td').last();

        if (!headerCell.length || !valueCell.length) return;

        const header = headerCell.text().trim().toLowerCase();
        const value = valueCell.text().trim();

        // Extrair informações baseadas no cabeçalho
        switch (true) {
          // Opus/Catálogo
          case header.includes('opus') || header.includes('catalogue'):
            if (value && value !== '-' && value.length > 0) {
              workDetails.opOrCatalog = value;
            }
            break;

          // Ano de composição
          case header.includes('composition year') ||
            header.includes('year of composition'):
            if (value && value !== '-' && value.match(/\d{4}/)) {
              workDetails.compositionYear = value;
            }
            break;

          // Primeira publicação
          case header.includes('first publication') ||
            header.includes('first published'):
            if (value && value !== '-' && value.match(/\d{4}/)) {
              workDetails.firstPublishDate = value;
            }
            break;

          // Tonalidade
          case header.includes('key') || header.includes('tonalidade'):
            if (value && value !== '-' && value.length > 0) {
              workDetails.tone = value;
            }
            break;

          // Duração
          case header.includes('duration') ||
            header.includes('approximate duration'):
            if (value && value !== '-' && value.length > 0) {
              workDetails.mediaDuration = value;
            }
            break;

          // Estilo
          case header.includes('style') || header.includes('period'):
            if (value && value !== '-' && value.length > 0) {
              workDetails.workStyle = value;
            }
            break;

          // Movimentos
          case header.includes('movements') || header.includes('sections'):
            if (value && value !== '-' && value.length > 0) {
              workDetails.moviment = value;

              // Tentar extrair número de movimentos
              const movementMatch = value.match(/(\d+)/);
              if (movementMatch && workDetails.workType === 'INDIVIDUAL') {
                workDetails.movementNumber = parseInt(movementMatch[1]);
              }
            }
            break;

          // Instrumentação
          case header.includes('instrumentation') || header.includes('scoring'):
            if (value && value !== '-' && value.length > 0) {
              workDetails.instrumentation = value;
            }
            break;

          // Dedicação
          case header.includes('dedication') || header.includes('dedicated'):
            if (value && value !== '-' && value.length > 0) {
              const dedicationInfo = this.extractDedicationInfo(value, $);
              workDetails.dedicateTo = dedicationInfo.dedicateTo;
              workDetails.dedicationComposerLink =
                dedicationInfo.dedicationComposerLink;
            }
            break;

          // Dificuldade
          case header.includes('difficulty') ||
            header.includes('grade') ||
            header.includes('level'):
            if (value && value !== '-' && value.length > 0) {
              workDetails.difficulty = value;
              workDetails.difficultyLevel = this.extractDifficultyLevel(value);
            }
            break;
        }
      });

      // Extrair informações adicionais do conteúdo da página
      const pageText = $('body').text().toLowerCase();

      // Tentar extrair dificuldade do texto geral se não foi encontrada
      if (!workDetails.difficultyLevel) {
        workDetails.difficultyLevel = this.extractDifficultyLevel(pageText);
      }

      // Extrair múltiplas categorias
      const categories = await this.extractWorkCategories($);
      workDetails.categories = categories;

      // Buscar vídeo URL (YouTube, se disponível)
      const videoLinks = $('a[href*="youtube.com"], a[href*="youtu.be"]');
      if (videoLinks.length > 0) {
        workDetails.videoUrl = videoLinks.first().attr('href') || null;
      } else {
        workDetails.videoUrl = null;
      }

      // Determinar se é parte de uma coleção
      workDetails.isPartOfCollection =
        workDetails.workType === 'INDIVIDUAL' &&
        (workDetails.opOrCatalog?.includes('No.') ||
          workDetails.title.includes('No.'));

      // Buscar trabalho pai se for parte de uma coleção
      if (workDetails.isPartOfCollection) {
        // Tentar encontrar o trabalho pai baseado no título
        const baseTitle = workDetails.title
          .replace(/No\.\s*\d+.*$/i, '')
          .trim();
        if (baseTitle !== workDetails.title) {
          try {
            const parentWork = await prisma.work.findFirst({
              where: {
                title: { contains: baseTitle, mode: 'insensitive' },
                composerId: composerData.id,
                workType: 'COMPLETE_WORK',
              },
            });

            if (parentWork) {
              workDetails.parentWorkId = parentWork.id;
            }
          } catch (error) {
            console.log(
              `⚠️ Erro ao buscar trabalho pai para ${workDetails.title}`
            );
          }
        }
      } else {
        workDetails.parentWorkId = null;
      }

      // Tentar identificar instrumento principal
      let primaryInstrument = null;
      if (workDetails.instrumentation) {
        const instrumentText = workDetails.instrumentation.toLowerCase();

        // Buscar instrumentos conhecidos no texto
        for (const [key, value] of Object.entries(INSTRUMENT_MAPPING)) {
          if (instrumentText.includes(key)) {
            primaryInstrument = await this.findOrCreateInstrument(key);
            break;
          }
        }

        // Se não encontrou, tentar extrair do título
        if (!primaryInstrument) {
          const titleLower = workDetails.title.toLowerCase();
          for (const [key, value] of Object.entries(INSTRUMENT_MAPPING)) {
            if (titleLower.includes(key)) {
              primaryInstrument = await this.findOrCreateInstrument(key);
              break;
            }
          }
        }
      }

      // Se ainda não encontrou instrumento, usar piano como padrão para peças solo
      if (
        !primaryInstrument &&
        !workDetails.instrumentation?.toLowerCase().includes('orchestra')
      ) {
        primaryInstrument = await this.findOrCreateInstrument('piano');
      }

      workDetails.instrumentId = primaryInstrument?.id ?? DEFAULT_INSTRUMENT_ID;

      // Tentar identificar gênero principal
      let primaryGenre = null;
      const titleLower = workDetails.title.toLowerCase();

      for (const [key, value] of Object.entries(GENRE_MAPPING)) {
        if (titleLower.includes(key)) {
          primaryGenre = await this.findOrCreateGenre(key);
          break;
        }
      }

      // Se não encontrou gênero específico, usar gênero baseado no estilo ou período
      if (!primaryGenre && workDetails.workStyle) {
        primaryGenre = await this.findOrCreateGenre(
          workDetails.workStyle.toLowerCase()
        );
      }

      // Gênero padrão
      if (!primaryGenre) {
        primaryGenre = await this.findOrCreateGenre('classical');
      }

      workDetails.genreId = primaryGenre?.id || '';

      // Determinar época baseada no compositor ou ano
      let epoch = null;
      if (workDetails.compositionYear) {
        const year = parseInt(
          workDetails.compositionYear.match(/\d{4}/)?.[0] || '0'
        );

        if (year > 0) {
          if (year < 1750) {
            epoch = 'Barroco';
          } else if (year < 1820) {
            epoch = 'Clássico';
          } else if (year < 1900) {
            epoch = 'Romântico';
          } else if (year < 1950) {
            epoch = 'Moderno';
          } else {
            epoch = 'Contemporâneo';
          }
        }
      }

      // Se não conseguiu determinar pela data, usar época do compositor
      if (!epoch && composerData.epoch) {
        epoch = composerData.epoch;
      }

      // Época padrão
      if (!epoch) {
        epoch = 'Clássico';
      }

      // Buscar ou criar época
      let epochData = await prisma.epoch.findFirst({
        where: { name: { contains: epoch, mode: 'insensitive' } },
      });

      if (!epochData) {
        epochData = await prisma.epoch.create({
          data: { name: epoch },
        });
        console.log(`🏛️ Nova época criada: ${epoch}`);
      }

      workDetails.epochId = epochData.id;

      // Compilar dados finais
      const finalWorkData: WorkData = {
        title: workDetails.title || worktitle,
        composerId: workDetails.composerId ?? '',
        genreId: workDetails.genreId ?? DEFAULT_GENRE_ID,
        instrumentId: workDetails.instrumentId ?? DEFAULT_INSTRUMENT_ID,
        epochId: workDetails.epochId,
        imslpPermlink: workDetails.imslpPermlink,
        imslpId: workDetails.imslpId,
        videoUrl: workDetails.videoUrl || null,
        opOrCatalog: workDetails.opOrCatalog || null,
        compositionYear: workDetails.compositionYear || null,
        firstPublishDate: workDetails.firstPublishDate || null,
        tone: workDetails.tone || null,
        mediaDuration: workDetails.mediaDuration || null,
        workStyle: workDetails.workStyle || null,
        moviment: workDetails.moviment || null,
        dedicateTo: workDetails.dedicateTo || null,
        dedicationComposerLink: workDetails.dedicationComposerLink || null,
        difficulty: workDetails.difficulty || null,
        difficultyLevel: workDetails.difficultyLevel || null,
        instrumentation: workDetails.instrumentation || null,
        genres: null, // Será preenchido posteriormente se necessário
        workType: workDetails.workType,
        isPartOfCollection: workDetails.isPartOfCollection || false,
        parentWorkId: workDetails.parentWorkId || null,
        movementNumber: workDetails.movementNumber || null,
        categories: workDetails.categories || [],
      };

      console.log(`✅ Dados extraídos para: ${finalWorkData.title}`);
      console.log(`   🎼 Instrumento: ${primaryInstrument?.name || 'N/A'}`);
      console.log(`   🎵 Gênero: ${primaryGenre?.name || 'N/A'}`);
      console.log(`   🏛️ Época: ${epoch}`);
      console.log(`   📋 Categorias: ${finalWorkData.categories.length}`);
      console.log(`   🎯 Tipo: ${finalWorkData.workType}`);
      if (finalWorkData.difficultyLevel) {
        console.log(
          `   📊 Dificuldade: Nível ${finalWorkData.difficultyLevel}`
        );
      }

      return finalWorkData;
    } catch (error) {
      console.error(
        `❌ Erro ao extrair detalhes da obra (tentativa ${retries + 1}):`,
        error
      );

      if (retries < MAX_RETRIES) {
        const waitTime = (retries + 1) * 3000;
        console.log(
          `⏳ Aguardando ${waitTime / 1000}s antes de tentar novamente...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.extractWorkDetails(work, retries + 1);
      }

      // Log do erro para análise posterior
      await fs.appendFile(
        STATE_WORKS_FILE,
        `❌ ${work.intvals?.pageid || work.id} / Erro na extração: \n`
      );

      return null;
    }
  }

  // Salvar obra no banco de dados
  async saveWork(workData: WorkData): Promise<boolean> {
    try {
      // Verificar se a obra já existe
      const exists = await this.workExists(workData.imslpId, workData.title);
      if (exists) {
        console.log(`⚠️ Obra já existe: ${workData.title}`);
        return false;
      }

      // Processar e criar todas as categorias
      const categoryIds: string[] = [];

      for (const categoryName of workData.categories) {
        try {
          const category = await this.findOrCreateCategory(categoryName);
          if (category && category.id) {
            categoryIds.push(category.id);
          }
        } catch (error) {
          console.error(
            `❌ Erro ao processar categoria ${categoryName}:`,
            error
          );
        }
      }

      // Criar a obra no banco
      const savedWork = await prisma.work.create({
        data: {
          title: workData.title,
          composerId: workData.composerId,
          genreId: workData.genreId,
          instrumentId: workData.instrumentId,
          epochId: workData.epochId,
          imslpPermlink: workData.imslpPermlink,
          imslpId: workData.imslpId,
          videoUrl: workData.videoUrl,
          opOrCatalog: workData.opOrCatalog,
          compositionYear: workData.compositionYear,
          firstPublishDate: workData.firstPublishDate,
          tone: workData.tone,
          mediaDuration: workData.mediaDuration,
          workStyle: workData.workStyle,
          moviment: workData.moviment,
          dedicateTo: workData.dedicateTo,
          dedicationComposerLink: workData.dedicationComposerLink,
          difficulty: workData.difficulty,
          difficultyLevel: workData.difficultyLevel ?? null,
          instrumentation: workData.instrumentation,
          genres: workData.genres,
          workType: workData.workType,
          isPartOfCollection: workData.isPartOfCollection,
          parentWorkId: workData.parentWorkId,
          movementNumber: workData.movementNumber,
          createdAt: new Date(),
        },
      });

      // Criar relacionamentos com categorias (many-to-many)
      if (categoryIds.length > 0) {
        const categoryConnections = categoryIds.map((categoryId) => ({
          workId: savedWork.id,
          categorieId: categoryId,
        }));

        try {
          await prisma.workCategorie.createMany({
            data: categoryConnections,
            skipDuplicates: true,
          });

          console.log(
            `🏷️ Conectadas ${categoryIds.length} categorias à obra: ${workData.title}`
          );
        } catch (error) {
          console.error(
            `❌ Erro ao conectar categorias à obra ${workData.title}:`,
            error
          );
        }
      }

      console.log(`💾 Obra salva com sucesso: ${workData.title}`);
      await fs.appendFile(
        STATE_WORKS_FILE,
        `✅ ${workData.imslpId} / ${workData.title} / ${
          workData.workType
        } / Categorias: ${workData.categories.length} / Dificuldade: ${
          workData.difficultyLevel || 'N/A'
        }\n`
      );

      return true;
    } catch (error) {
      console.error(`❌ Erro ao salvar obra ${workData.title}:`, error);
      await fs.appendFile(
        STATE_WORKS_FILE,
        `❌ ${workData.imslpId} / Erro ao salvar:\n`
      );
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
