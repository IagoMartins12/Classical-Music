// scripts/imslp-work-scraper.ts

import axios from 'axios';
import * as cheerio from 'cheerio';
import { Composer, Epoch, PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import {
  VALID_PORTUGUESE_WORKGENRES,
  VALID_WORKGENRES,
  WORK_GENRE_TRANSLATIONS,
  INSTRUMENT_MAPPING,
  NORMALIZED_CATEGORIES,
  WORK_TYPE_KEYWORDS,
  NOTE_TRANSLATIONS,
  MODE_TRANSLATIONS,
} from './imslp-works-scraper-util';

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

interface MovementDetail {
  number: number;
  title: string;
  tempo: string;
  key?: string;
}

interface WorkData {
  title: string;
  subtitle: string | null;
  composerId: string;
  workGenreId: string;
  instrumentId: string;
  epochId: string;
  imslpPermlink: string;
  imslpId: string;
  videoUrl: string | null;
  opOrCatalog?: string | null;
  compositionYear: string | null;
  firstPublishDate: string | null;
  tone: string | null;
  timeSignature: string | null;
  tempoMarking: string | null;
  mediaDuration: string | null;
  workStyle: string | null;
  moviment: string | null;
  movementsDetailed: MovementDetail[];
  dedicateTo: string | null;
  dedicationComposerLink: string | null;
  instrumentation: string | null;
  imslpTags: string[];
  difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
  workType:
    | 'INDIVIDUAL'
    | 'COMPLETE_WORK'
    | 'ARRANGEMENT'
    | 'COLLECTION'
    | 'COLLABORATION'
    | 'COMPOSITION'
    | 'COLLECTED_WORKS'
    | 'COLLECTIONS_WITH';
  isPartOfCollection: boolean;
  parentWorkId: string | null;
  movementNumber: number | null;
  categories: string[];
  categoryNames?: string[];
  workGenresArr?: string[];
  workGenres: string[];
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
interface WorkGenreData {
  id: string;
  name: string;
}

interface InstrumentGenreCache {
  instruments: Map<string, any>;
  workGenres: Map<string, any>;
}

const DEFAULT_INSTRUMENT_ID = '68404f3b22f9d2cd16052284';
const DEFAULT_WORK_GENRE_ID = '68404f6422f9d2cd16052285';

const STATE_FILE = path.join(process.cwd(), 'work-scraper-state.json');
const STATE_WORKS_FILE = path.join(process.cwd(), 'scraper-works-state.log');

const BATCH_SIZE = 1000;
const DELAY_BETWEEN_REQUESTS = 3000;
const DELAY_BETWEEN_BATCHES = 10000;
const MAX_RETRIES = 1;

let globalWorkScraperInstance: WorkScraper | null = null;

class WorkScraper {
  private state: ScraperState;
  private shouldStop: boolean = false;
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

    this.cache = {
      instruments: new Map(),
      workGenres: new Map(),
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

      // Carregar workGenres
      const workGenres = await prisma.workGenre.findMany();
      workGenres.forEach((workGenre) => {
        this.cache.workGenres.set(workGenre.name.toLowerCase(), workGenre);
      });

      console.log(`📚 Cache inicializado: ${instruments.length} instrumentos`);
    } catch (error) {
      console.error('❌ Erro ao inicializar cache:', error);
    }
  }

  translateWorkGenre(englishGenre: string): string {
    const normalizedGenre = englishGenre.toLowerCase().trim();
    return WORK_GENRE_TRANSLATIONS[normalizedGenre] || normalizedGenre;
  }

  isValidPortugueseGenre(portugueseGenre: string): boolean {
    return VALID_PORTUGUESE_WORKGENRES.has(
      portugueseGenre.toLowerCase().trim()
    );
  }

  translateMusicKey(englishKey: string): string {
    if (!englishKey || englishKey.trim() === '' || englishKey === '-') {
      return englishKey;
    }

    const trimmedKey = englishKey.trim();

    // Regex para capturar a nota e o modo
    // Captura: nota (C, C#, Db, etc.) + espaço opcional + modo (major, minor, etc.)
    const keyRegex =
      /^([A-G][#b]?)\s*(major|minor|maj|min|M|m|Major|Minor|MAJOR|MINOR)?$/i;
    const match = trimmedKey.match(keyRegex);

    if (!match) {
      // Se não conseguir fazer o parse, retorna o original
      console.log(`⚠️ Não foi possível traduzir a tonalidade: ${englishKey}`);
      return englishKey;
    }

    const [, note, mode] = match;

    // Traduzir a nota
    const translatedNote = NOTE_TRANSLATIONS[note] || note;

    // Traduzir o modo (se existir)
    let translatedMode = '';
    if (mode) {
      translatedMode =
        MODE_TRANSLATIONS[mode.toLowerCase()] || mode.toLowerCase();
    }

    // Construir a tonalidade em português
    if (translatedMode) {
      return `${translatedNote} ${translatedMode}`;
    } else {
      // Se não tem modo especificado, assume maior por padrão ou retorna só a nota
      return translatedNote;
    }
  }

  translateInstrumentation(instrumentation: string): string {
    if (!instrumentation || typeof instrumentation !== 'string') {
      return '';
    }

    // Limpar e normalizar a string
    let translated = instrumentation.toLowerCase().trim();

    // CORREÇÃO DO BUG: Remover padrões como "1 piano", "2 violins", "3 flutes" etc.
    // Manter apenas o nome do instrumento
    translated = translated.replace(/\b\d+\s+/g, '');

    // Substituir vírgulas seguidas por espaços para padronizar separadores
    translated = translated.replace(/,\s*/g, ', ');

    // Substituir "and" por vírgula para facilitar o processamento
    translated = translated.replace(/\s+and\s+/g, ', ');

    // Substituir parênteses e outros caracteres especiais
    translated = translated.replace(/[()]/g, '');

    // Aplicar traduções - primeiro termos compostos (mais específicos)
    const sortedKeys = Object.keys(INSTRUMENT_MAPPING).sort(
      (a, b) => b.length - a.length
    );

    for (const englishTerm of sortedKeys) {
      const portugueseTerm = INSTRUMENT_MAPPING[englishTerm];

      // Criar regex para match de palavra completa, considerando espaços e vírgulas
      const regex = new RegExp(
        `\\b${englishTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
        'gi'
      );
      translated = translated.replace(regex, portugueseTerm);
    }

    // Capitalizar primeira letra de cada instrumento
    translated = translated
      .split(', ')
      .map((instrument) => {
        return (
          instrument.trim().charAt(0).toUpperCase() + instrument.trim().slice(1)
        );
      })
      .join(', ');

    // Limpar espaços extras
    translated = translated.replace(/\s+/g, ' ').trim();

    // Remover vírgulas duplicadas
    translated = translated.replace(/,\s*,/g, ',');

    // Garantir que não termine com vírgula
    translated = translated.replace(/,\s*$/, '');

    return translated;
  }

  // Carregar estado salvo
  async loadState(): Promise<void> {
    try {
      const stateData = await fs.readFile(STATE_FILE, 'utf-8');
      const savedState = JSON.parse(stateData);

      this.state = { ...this.state, ...savedState };

      console.log('✓ Estado carregado:', this.state);
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
      };

      await fs.writeFile(STATE_FILE, JSON.stringify(stateToSave, null, 2));
      console.log(
        `💾 Estado salvo - Start: ${this.state.currentStart} | Processados: ${this.state.totalProcessed} | Adicionados: ${this.state.totalAdded} | Pulados: ${this.state.totalSkipped} | Erros: ${this.state.totalErrors} \n`
      );
    } catch (error) {
      console.error('❌ Erro ao salvar estado:', error);
    }
  }

  // Método para parar graciosamente
  async gracefulStop(): Promise<void> {
    console.log('\n🛑 Parando scraper de obras graciosamente...');

    this.shouldStop = true;
    this.state.isRunning = false;
    await this.saveState();

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
        `❌ ERRO ao buscar obras (start=${start}, tentativa ${retries + 1}):`
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
          imslpId: imslpId,
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
        console.log('TRANSLATEDNAMEEE', translatedName);
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
  async findOrCreateWorkGenre(
    workTypeName: string
  ): Promise<WorkGenreData | null> {
    try {
      const normalizedName = workTypeName.toLowerCase().trim();

      // Verificar se o gênero em português é válido
      if (!this.isValidPortugueseGenre(normalizedName)) {
        return null;
      }

      // Verificar cache primeiro (com nome em português)
      if (this.cache.workGenres?.has(normalizedName)) {
        return this.cache.workGenres.get(normalizedName);
      }

      // Buscar no banco (por nome em português)
      let workGenre = await prisma.workGenre.findFirst({
        where: {
          name: { equals: normalizedName, mode: 'insensitive' },
        },
      });

      if (workGenre) {
        console.log(`🏷️ workGenre já existe: ${workGenre.name}`);
      } else {
        // Se não encontrou, criar novo com nome em português
        workGenre = await prisma.workGenre.create({
          data: {
            name: normalizedName,
            createdAt: new Date(),
          },
        });

        console.log(`🏷️ Novo workGenre criado: ${normalizedName}`);
      }

      // Adicionar ao cache (usando nome em português)
      if (!this.cache.workGenres) {
        this.cache.workGenres = new Map();
      }
      this.cache.workGenres.set(normalizedName, workGenre);

      return workGenre;
    } catch (error) {
      console.error(`❌ Erro ao buscar/criar WorkType ${workTypeName}:`, error);
      return null;
    }
  }

  // Buscar compositor no banco de dados
  async findComposerInDatabase(composerName: string): Promise<Composer | null> {
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

      if (composer) {
        console.error(`✅ Compositor encontrado: ${composer.fullName}`);
      }

      if (!composer) {
        return null;
      }
      return composer;
    } catch (error) {
      console.error(`❌ Erro ao buscar compositor ${composerName}:`, error);
      return null;
    }
  }

  // Determinar tipo de trabalho baseado no título
  determineWorkType(
    title: string,
    $?: cheerio.CheerioAPI
  ):
    | 'INDIVIDUAL'
    | 'COMPLETE_WORK'
    | 'ARRANGEMENT'
    | 'COLLECTION'
    | 'COLLABORATION'
    | 'COMPOSITION'
    | 'COLLECTED_WORKS'
    | 'COLLECTIONS_WITH' {
    const titleLower = title.toLowerCase();

    // Palavras-chave para identificar cada tipo
    const WORK_TYPE_KEYWORDS = {
      COLLABORATION: [
        'feat.',
        'featuring',
        'collaboration',
        'collaborative',
        'joint',
        'together',
        'co-composed',
      ],
      COLLECTED_WORKS: [
        'complete works',
        'complete pieces',
        'complete',
        'collected works',
        'collected pieces',
        'collected',
        'opere complete',
        'œuvres complètes',
        'sämtliche werke',
        'todo',
        'todas as',
        'all',
        'entire',
      ],
      COLLECTIONS_WITH: [
        'masterpieces',
        'collection',
        'selection',
        'treasury',
        'best of',
        'favorites',
        'favourites',
        'compilation',
        'various',
        'mehrere',
        'vários',
        'diversos',
      ],
      ARRANGEMENT: [
        'arr.',
        'arranged',
        'arrangement',
        'transcription',
        'adaptation',
        'version',
        'transcribed',
        'adapted',
      ],
      COLLECTION: [
        'set',
        'book',
        'volume',
        'cahier',
        'heft',
        'collection',
        'suite',
        'cycle',
      ],
      INDIVIDUAL: ['no.', 'number', 'nr.', '#', 'piece', 'movement'],
    };

    // 1. Verificar se é uma COLLABORATION
    for (const keyword of WORK_TYPE_KEYWORDS.COLLABORATION) {
      if (titleLower.includes(keyword)) {
        if (titleLower.match(/\b(with|and|&|feat\.)\s+[a-z]/i)) {
          return 'COLLABORATION';
        }
      }
    }

    // 2. Verificar se é COLLECTED WORKS
    for (const keyword of WORK_TYPE_KEYWORDS.COLLECTED_WORKS) {
      if (titleLower.includes(keyword)) {
        return 'COLLECTED_WORKS';
      }
    }

    // 3. Verificar se é COLLECTIONS WITH
    for (const keyword of WORK_TYPE_KEYWORDS.COLLECTIONS_WITH) {
      if (titleLower.includes(keyword)) {
        return 'COLLECTIONS_WITH';
      }
    }

    // 4. Verificar se é arranjo
    for (const keyword of WORK_TYPE_KEYWORDS.ARRANGEMENT) {
      if (titleLower.includes(keyword)) {
        return 'ARRANGEMENT';
      }
    }

    // 5. Verificar se é coleção completa
    for (const keyword of WORK_TYPE_KEYWORDS.COLLECTION) {
      if (titleLower.includes(keyword)) {
        return 'COMPLETE_WORK';
      }
    }

    // 6. Verificar se é peça individual (tem numeração)
    for (const keyword of WORK_TYPE_KEYWORDS.INDIVIDUAL) {
      if (titleLower.includes(keyword)) {
        return 'INDIVIDUAL';
      }
    }

    // Análise adicional usando o conteúdo da página (se disponível)
    if ($) {
      const pageText = $('body').text().toLowerCase();

      // Verificar se a página menciona múltiplos compositores
      const composerMentions = pageText.match(/composer[s]?:/gi);
      if (composerMentions && composerMentions.length > 1) {
        return 'COLLECTIONS_WITH';
      }

      // Verificar se há seções dedicadas a obras completas
      if (
        pageText.includes('complete works') ||
        pageText.includes('collected works')
      ) {
        return 'COLLECTED_WORKS';
      }

      // Verificar indicadores de colaboração na página
      if (
        pageText.includes('collaboration') ||
        pageText.includes('joint work')
      ) {
        return 'COLLABORATION';
      }
    }

    // Default: assumir que é uma composição individual
    return 'INDIVIDUAL';
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

    $('.wp_header table tr').each((index, element) => {
      const $row = $(element);
      const header = $row.find('th').first().text().trim().toLowerCase();

      if (
        header.includes('genre categories') ||
        header.includes('categorias')
      ) {
        $row.find('td a').each((i, link) => {
          const categoryName = $(link).text().trim();

          // Tenta obter o nome em português
          const portugueseName = this.getCategoryNameInPortuguese(categoryName);

          if (portugueseName) {
            categories.add(portugueseName);
            console.log('CATEGORIA ADICIONADA EM PORTUGUÊS:', portugueseName);
          } else {
            console.log('CATEGORIA IGNORADA (não encontrada):', categoryName);
          }
        });
      }
    });

    return Array.from(categories);
  }

  async extractWorkGenres($: cheerio.CheerioAPI): Promise<string[]> {
    const workGenres: Set<string> = new Set();

    // Buscar em diferentes locais da página
    $('.wp_header table tr').each((index, element) => {
      const $row = $(element);
      const header = $row.find('th').first().text().trim().toLowerCase();

      if (
        header.includes('genre categories') ||
        header.includes('categorias')
      ) {
        $row.find('td a').each((i, link) => {
          const workGenreName = $(link).text().trim();

          if (workGenreName && workGenreName.length > 0) {
            // Converte para lowercase para comparação case-insensitive
            const workGenreNameLower = workGenreName.toLowerCase();

            // Verifica se existe no SET (que já deve estar em lowercase)
            const checkIfGenreIsValid =
              VALID_WORKGENRES.has(workGenreNameLower);

            if (checkIfGenreIsValid) {
              // Traduz para português antes de adicionar
              const portugueseGenre =
                this.translateWorkGenre(workGenreNameLower);
              workGenres.add(portugueseGenre);
            }
          }
        });
      }
    });

    if (workGenres.size === 0) {
      workGenres.add('não definido');
    }

    return Array.from(workGenres);
  }

  private getCategoryNameInPortuguese(categoryName: string): string | null {
    const normalizedCategory = categoryName.toLowerCase().trim();
    return NORMALIZED_CATEGORIES[normalizedCategory] || null;
  }

  // Extrair subtítulo/apelido da obra
  extractSubtitle(title: string, $: cheerio.CheerioAPI): string | null {
    // Procurar por "Alternative Title" na página
    let subtitle: string | null = null;

    $('.wp_header table tr').each((index, element) => {
      const $row = $(element);
      const header = $row.find('th').first().text().trim().toLowerCase();
      const value = $row.find('td').text().trim();

      if (header.includes('alternative') && header.includes('title')) {
        subtitle = value;
        return false; // break
      }
    });

    // Se não encontrou, tentar extrair do título entre parênteses ou aspas
    if (!subtitle) {
      // Procurar por texto entre parênteses ou aspas no título
      const parenthesesMatch = title.match(/\((.*?)\)/);
      const quotesMatch = title.match(/"(.*?)"/);

      if (parenthesesMatch && parenthesesMatch[1]) {
        subtitle = parenthesesMatch[1];
      } else if (quotesMatch && quotesMatch[1]) {
        subtitle = quotesMatch[1];
      }
    }

    // Procurar por nomes famosos na página
    if (!subtitle) {
      const pageText = $('body').text().toLowerCase();
      const famousNicknames = [
        'moonlight',
        'pathétique',
        'pastoral',
        'emperor',
        'heroic',
        'jupiter',
        'prague',
        'linz',
        'great',
        'little',
        'spring',
        'kreutzer',
        'appassionata',
        'waldstein',
        'hammerklavier',
        'tempest',
        'hunt',
        'clock',
        'surprise',
        'military',
        'london',
      ];

      for (const nickname of famousNicknames) {
        if (
          pageText.includes(nickname) &&
          !title.toLowerCase().includes(nickname)
        ) {
          subtitle = nickname.charAt(0).toUpperCase() + nickname.slice(1);
          break;
        }
      }
    }

    return subtitle && subtitle.length > 0 ? subtitle : null;
  }

  // Extrair detalhes dos movimentos
  extractMovementsDetailed($: cheerio.CheerioAPI): MovementDetail[] {
    const movements: MovementDetail[] = [];

    // Procurar pela seção de movimentos/conteúdo
    $('.wp_header table tr').each((index, element) => {
      const $row = $(element);
      const header = $row.find('th').first().text().trim().toLowerCase();

      if (header.includes('movements') || header.includes('contents')) {
        const movementText = $row.find('td').text().trim();

        // Parse dos movimentos
        const movementLines = movementText
          .split('\n')
          .filter((line) => line.trim());

        movementLines.forEach((line, index) => {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            // Extrair andamento (palavras em itálico ou maiúscula)
            const tempoMatch = trimmedLine.match(
              /(Adagio|Allegro|Andante|Presto|Largo|Moderato|Vivace|Lento)[^,]*/i
            );
            const tempo = tempoMatch ? tempoMatch[0] : '';

            movements.push({
              number: index + 1,
              title: trimmedLine,
              tempo: tempo,
            });
          }
        });
      }
    });

    // Se não encontrou movimentos na tabela, procurar em outras seções
    if (movements.length === 0) {
      // Procurar links ou texto que indique movimentos
      $('a').each((index, element) => {
        const text = $(element).text().trim();
        const movementMatch = text.match(/(\d+)\.\s*(.*?)(?:\(|$)/);

        if (movementMatch) {
          const number = parseInt(movementMatch[1]);
          const title = movementMatch[2].trim();
          const tempoMatch = title.match(
            /(Adagio|Allegro|Andante|Presto|Largo|Moderato|Vivace|Lento)[^,]*/i
          );

          movements.push({
            number: number,
            title: title,
            tempo: tempoMatch ? tempoMatch[0] : '',
          });
        }
      });
    }

    return movements;
  }

  // Extrair compasso
  extractTimeSignature($: cheerio.CheerioAPI): string | null {
    let timeSignature: string | null = null;

    $('.wp_header table tr').each((index, element) => {
      const $row = $(element);
      const header = $row.find('th').first().text().trim().toLowerCase();
      const value = $row.find('td').text().trim();

      if (header.includes('time signature') || header.includes('meter')) {
        timeSignature = value;
        return false;
      }
    });

    // Se não encontrou, procurar por padrões comuns
    if (!timeSignature) {
      const pageText = $('body').text();
      const timeSignatureMatch = pageText.match(/\b(\d+\/\d+)\b/);
      if (timeSignatureMatch) {
        timeSignature = timeSignatureMatch[1];
      }
    }

    return timeSignature && timeSignature !== '-' ? timeSignature : null;
  }

  // Extrair andamento
  extractTempoMarking($: cheerio.CheerioAPI): string | null {
    let tempoMarking: string | null = null;

    $('.wp_header table tr').each((index, element) => {
      const $row = $(element);
      const header = $row.find('th').first().text().trim().toLowerCase();
      const value = $row.find('td').text().trim();

      if (header.includes('tempo') || header.includes('andamento')) {
        tempoMarking = value;
        return false;
      }
    });

    // Se não encontrou, procurar por indicações de andamento no texto
    if (!tempoMarking) {
      const pageText = $('body').text();
      const tempoTerms = [
        'Allegro',
        'Adagio',
        'Andante',
        'Presto',
        'Largo',
        'Moderato',
        'Vivace',
        'Lento',
      ];

      for (const term of tempoTerms) {
        const regex = new RegExp(`\\b${term}[^,]*`, 'i');
        const match = pageText.match(regex);
        if (match) {
          tempoMarking = match[0];
          break;
        }
      }
    }

    return tempoMarking && tempoMarking !== '-' ? tempoMarking : null;
  }

  // Extrair tags do IMSLP
  extractIMSLPTags($: cheerio.CheerioAPI): string[] {
    const tags: Set<string> = new Set();

    // Procurar por categorias na página
    $('a[href*="Category:"]').each((index, element) => {
      const href = $(element).attr('href');
      if (href) {
        const categoryMatch = href.match(/Category:(.+)/);
        if (categoryMatch) {
          const tag = decodeURIComponent(categoryMatch[1]).replace(/_/g, ' ');
          tags.add(tag);
        }
      }
    });

    return Array.from(tags);
  }

  // Determinar nível de dificuldade
  determineDifficultyLevel(
    title: string,
    opOrCatalog: string | null | undefined,
    workGenres: string[]
  ): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null {
    const titleLower = title.toLowerCase();

    // Indicadores de nível iniciante
    const beginnerIndicators = [
      'easy',
      'simple',
      'first',
      'elementary',
      'children',
      'student',
      'lesson',
      'exercise',
      'étude facile',
      'fácil',
      'iniciante',
      'beginner',
      'albumblätter',
      'lyric pieces',
    ];

    // Indicadores de nível avançado
    const advancedIndicators = [
      'concert',
      'concerto',
      'virtuoso',
      'transcendental',
      'paganini',
      'liszt',
      'chopin etude',
      'ballad',
      'scherzo',
      'sonata',
      'rhapsody',
      'fantasy',
      'variations',
      'toccata',
    ];

    // Verificar indicadores no título
    for (const indicator of beginnerIndicators) {
      if (titleLower.includes(indicator)) {
        return 'BEGINNER';
      }
    }

    for (const indicator of advancedIndicators) {
      if (titleLower.includes(indicator)) {
        return 'ADVANCED';
      }
    }

    // Verificar por opus numbers (geralmente números baixos são mais fáceis)
    if (opOrCatalog) {
      const opusMatch = opOrCatalog.match(/op\.?\s*(\d+)/i);
      if (opusMatch) {
        const opusNumber = parseInt(opusMatch[1]);
        if (opusNumber <= 10) {
          return 'BEGINNER';
        } else if (opusNumber >= 50) {
          return 'ADVANCED';
        }
      }
    }

    // Verificar gêneros
    const beginnerGenres = [
      'estudos',
      'exercícios',
      'minuetos',
      'danças simples',
    ];
    const advancedGenres = [
      'concertos',
      'sonatas',
      'rapsódias',
      'fantasias',
      'baladas',
    ];

    for (const genre of workGenres) {
      const genreLower = genre.toLowerCase();
      if (beginnerGenres.some((bg) => genreLower.includes(bg))) {
        return 'BEGINNER';
      }
      if (advancedGenres.some((ag) => genreLower.includes(ag))) {
        return 'ADVANCED';
      }
    }

    // Default para intermediário se não conseguir determinar
    return 'INTERMEDIATE';
  }

  // Extrair dados detalhados da obra com retry
  async extractWorkDetails(
    work: Work,
    retries: number = 0
  ): Promise<WorkData | null> {
    try {
      const { intvals, permlink, id } = work;
      const { composer, worktitle, pageid } = intvals;

      // Buscar compositor no banco de dados
      const composerData = await this.findComposerInDatabase(composer);
      if (!composerData) {
        console.log(`❌ Compositor não encontrado: ${composer} \n`);
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

      // Extrair subtítulo
      workDetails.subtitle = this.extractSubtitle(worktitle, $);

      // IDs básicos
      workDetails.composerId = composerData.id;
      workDetails.imslpPermlink = permlink;
      workDetails.imslpId = pageid || id;

      // Determinar tipo de trabalho
      workDetails.workType = this.determineWorkType(worktitle, $);

      // Extrair movimentos detalhados
      workDetails.movementsDetailed = this.extractMovementsDetailed($);

      // Extrair compasso e andamento
      workDetails.timeSignature = this.extractTimeSignature($);
      workDetails.tempoMarking = this.extractTempoMarking($);

      // Extrair tags do IMSLP
      workDetails.imslpTags = this.extractIMSLPTags($);

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
              workDetails.tone = this.translateMusicKey(value);
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
          case header.includes('style') ||
            header.includes('period') ||
            header.includes('estilo'):
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
              workDetails.instrumentation =
                this.translateInstrumentation(value);
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
        }
      });

      // Extrair múltiplas categorias
      const categories = await this.extractWorkCategories($);
      workDetails.categoryNames = categories;

      // Extrair múltiplas workGenres
      const workGenres = await this.extractWorkGenres($);
      workDetails.workGenres = workGenres;
      workDetails.workGenresArr = workGenres;

      // Determinar nível de dificuldade
      workDetails.difficultyLevel = this.determineDifficultyLevel(
        workDetails.title,
        workDetails.opOrCatalog,
        workGenres
      );

      // Determinar se é parte de uma coleção
      workDetails.isPartOfCollection =
        workDetails.workType === 'INDIVIDUAL' &&
        (workDetails.opOrCatalog?.includes('No.') ||
          workDetails.title.includes('No.'));

      // Buscar trabalho pai se for parte de uma coleção
      if (workDetails.isPartOfCollection) {
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
      const titleLower = workDetails.title.toLowerCase();

      let primaryWorkGenre = null;
      for (const [key, value] of Object.entries(NORMALIZED_CATEGORIES)) {
        if (titleLower.includes(key)) {
          primaryWorkGenre = await this.findOrCreateWorkGenre(key);
          break;
        }
      }

      // Se não encontrou gênero específico, usar gênero baseado no estilo ou período
      if (!primaryWorkGenre && workDetails.workStyle) {
        primaryWorkGenre = await this.findOrCreateWorkGenre(
          workDetails.workStyle.toLowerCase()
        );
      }

      // Gênero padrão
      if (!primaryWorkGenre) {
        primaryWorkGenre = await this.findOrCreateWorkGenre('Pieces');
      }

      workDetails.workGenreId = primaryWorkGenre?.id || DEFAULT_WORK_GENRE_ID;

      let epoch = workDetails.workStyle;
      let epochData: null | Epoch = null;

      let epochObject: { [key: string]: string } = {
        medieval: 'Medieval',
        renaissance: 'Renascentista',
        baroque: 'Barroco',
        classical: 'Clássico',
        romantic: 'Rômantico',
        'early 20th century': 'Modernismo',
        modern: 'Contemporâneo',
      };

      // Normalizar a chave para busca case-insensitive
      const normalizedEpoch = epoch?.toLowerCase();

      if (normalizedEpoch && epochObject[normalizedEpoch]) {
        epochData = await prisma.epoch.findFirst({
          where: {
            name: {
              contains: epochObject[normalizedEpoch],
              mode: 'insensitive',
            },
          },
        });
      }

      // Tratamento especial para épocas modernas
      if (
        normalizedEpoch === 'early 20th century' ||
        normalizedEpoch === 'modern'
      ) {
        epochData = await prisma.epoch.findFirst({
          where: {
            name: {
              contains: 'modernismo',
              mode: 'insensitive',
            },
          },
        });
      }

      // Se não conseguiu determinar pela época da obra, usar época do compositor
      if (!epochData && composerData.epochName) {
        epochData = await prisma.epoch.findFirst({
          where: {
            name: {
              contains: composerData.epochName,
              mode: 'insensitive',
            },
          },
        });
      }

      // Verificar se já existe uma época "Desconhecido" antes de criar
      if (!epochData) {
        epochData = await prisma.epoch.findFirst({
          where: {
            name: {
              equals: 'Desconhecido',
              mode: 'insensitive',
            },
          },
        });

        // Só criar se realmente não existir
        if (!epochData) {
          epochData = await prisma.epoch.create({
            data: { name: 'Desconhecido' },
          });
          console.log(
            `🏛️ Nova época criada: ${
              epoch || composerData.epochName || 'Desconhecido'
            }`
          );
        }
      }
      workDetails.epochId = epochData.id;

      // Compilar dados finais
      const finalWorkData: WorkData = {
        title: workDetails.title.replace(/"/g, '') || worktitle,
        subtitle: workDetails.subtitle,
        composerId: workDetails.composerId ?? '',
        workGenreId: workDetails.workGenreId ?? DEFAULT_WORK_GENRE_ID,
        instrumentId: workDetails.instrumentId ?? DEFAULT_INSTRUMENT_ID,
        epochId: workDetails.epochId,
        imslpPermlink: workDetails.imslpPermlink,
        imslpId: workDetails.imslpId,
        videoUrl: workDetails.videoUrl || null,
        opOrCatalog: workDetails.opOrCatalog || null,
        compositionYear: workDetails.compositionYear || null,
        firstPublishDate: workDetails.firstPublishDate || null,
        tone: workDetails.tone || null,
        timeSignature: workDetails.timeSignature || null,
        tempoMarking: workDetails.tempoMarking || null,
        mediaDuration: workDetails.mediaDuration || null,
        workStyle: workDetails.workStyle || null,
        moviment: workDetails.moviment || null,
        movementsDetailed: workDetails.movementsDetailed || [],
        dedicateTo: workDetails.dedicateTo || null,
        dedicationComposerLink: workDetails.dedicationComposerLink || null,
        instrumentation: workDetails.instrumentation || null,
        imslpTags: workDetails.imslpTags || [],
        difficultyLevel: workDetails.difficultyLevel,
        workType: workDetails.workType,
        isPartOfCollection: workDetails.isPartOfCollection || false,
        parentWorkId: workDetails.parentWorkId || null,
        movementNumber: workDetails.movementNumber || null,
        categories: workDetails.categories || [],
        workGenres: workDetails.workGenres || [],
        categoryNames: workDetails.categoryNames || [],
        workGenresArr: workDetails.workGenresArr || [],
      };

      console.log(
        `✅ Dados extraídos para: ${finalWorkData.title.replace(/"/g, '')}`
      );
      console.log(`   📛 Subtítulo: ${finalWorkData.subtitle || 'N/A'}`);
      console.log(`   🎼 Instrumento: ${primaryInstrument?.name || 'N/A'}`);
      console.log(`   📋 Tonalidade: ${finalWorkData.tone}`);
      console.log(`   🎵 Compasso: ${finalWorkData.timeSignature || 'N/A'}`);
      console.log(`   ⏱️ Andamento: ${finalWorkData.tempoMarking || 'N/A'}`);
      console.log(`   🎯 Dificuldade: ${finalWorkData.difficultyLevel}`);
      console.log(`   🏛️ Época: ${epoch}`);
      console.log(`   📋 Categorias: ${finalWorkData.categoryNames}`);
      console.log(`   📋 Work genres: ${finalWorkData.workGenres.length}`);
      console.log(`   🏷️ IMSLP Tags: ${finalWorkData.imslpTags.length}`);
      console.log(`   🎯 Tipo: ${finalWorkData.workType}`);
      console.log(
        `   🎼 Movimentos: ${finalWorkData.movementsDetailed.length}`
      );

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
      const exists = await this.workExists(
        workData.imslpId,
        workData.title.replace(/"/g, '')
      );
      if (exists) {
        console.log(`⚠️ Obra já existe: ${workData.title.replace(/"/g, '')}`);
        return false;
      }

      const workGenresId: string[] = [];

      for (const workGenreName of workData.workGenres) {
        try {
          const workGenre = await this.findOrCreateWorkGenre(workGenreName);

          if (workGenre && workGenre.id) {
            workGenresId.push(workGenre.id);
          }
        } catch (error) {
          console.error(
            `❌ Erro ao processar workGenre ${workGenreName}:`,
            error
          );
        }
      }

      // Usar transação para garantir consistência dos dados
      const result = await prisma.$transaction(async (tx) => {
        // Criar a obra no banco
        const savedWork = await tx.work.create({
          data: {
            title: workData.title.replace(/"/g, ''),
            subtitle: workData.subtitle,
            composerId: workData.composerId,
            instrumentId: workData.instrumentId,
            epochId: workData.epochId,
            imslpPermlink: workData.imslpPermlink,
            imslpId: workData.imslpId,
            videoUrl: workData.videoUrl,
            opOrCatalog: workData.opOrCatalog,
            compositionYear: workData.compositionYear,
            firstPublishDate: workData.firstPublishDate,
            tone: workData.tone,
            timeSignature: workData.timeSignature,
            tempoMarking: workData.tempoMarking,
            mediaDuration: workData.mediaDuration,
            workStyle: workData.workStyle,
            moviment: workData.moviment,
            movementsDetailed: workData.movementsDetailed,
            dedicateTo: workData.dedicateTo,
            dedicationComposerLink: workData.dedicationComposerLink,
            instrumentation: workData.instrumentation,
            imslpTags: workData.imslpTags,
            difficultyLevel: workData.difficultyLevel,
            workType: workData.workType,
            isPartOfCollection: workData.isPartOfCollection,
            parentWorkId: workData.parentWorkId,
            movementNumber: workData.movementNumber,
            categoryNames: workData.categoryNames,
            workGenresArr: workData.workGenresArr,
            createdAt: new Date(),
          },
        });

        return savedWork;
      });

      console.log(
        `💾 Obra salva com sucesso: ${workData.title.replace(/"/g, '')}\n`
      );

      await fs.appendFile(
        STATE_WORKS_FILE,
        `✅ ${workData.imslpId} / ${workData.title.replace(/"/g, '')} / ${
          workData.workType
        } / Categorias: ${workData.categories.length} / \n`
      );

      return true;
    } catch (error) {
      console.error(
        `❌ Erro ao salvar obra ${workData.title.replace(/"/g, '')}:`,
        error
      );
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
    }

    this.state.isRunning = true;
    this.shouldStop = false;
    await this.saveState();

    try {
      let hasMoreWorks = true;

      while (hasMoreWorks && !this.shouldStop) {
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

        console.log(
          `📊 Lote concluído - Processados: ${result.processed}, Adicionados: ${result.added}`
        );
        console.log(
          `📈 Total - Processados: ${this.state.totalProcessed}, Adicionados: ${this.state.totalAdded}`
        );

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
        console.log(`\n🎉 Work Scraper concluído!`);
        console.log(`📊 Estatísticas finais:`);
        console.log(`   - Total processados: ${this.state.totalProcessed}`);
        console.log(`   - Total adicionados: ${this.state.totalAdded}`);
      }
    } catch (error) {
      console.error('❌ Erro fatal no scraper:', error);
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
    this.state.isRunning = false;
    await this.saveState();

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

    await this.saveState();
    console.log('✅ Estado resetado. Próxima execução começará do início.');
  }

  async status(): Promise<void> {
    await this.loadState();

    console.log('📊 Status do Scraper:');
    console.log(`   - Posição atual: ${this.state.currentStart}`);
    console.log(
      `   - Último lote bem-sucedido: ${this.state.lastSuccessfulBatch}`
    );
    console.log(`   - Total processados: ${this.state.totalProcessed}`);
    console.log(`   - Total adicionados: ${this.state.totalAdded}`);
    console.log(`   - Rodando: ${this.state.isRunning ? 'Sim' : 'Não'}`);
    console.log(`   - Última atualização: ${this.state.lastUpdate}`);

    if (this.state.totalProcessed > 0) {
      const successRate = (
        (this.state.totalAdded / this.state.totalProcessed) *
        100
      ).toFixed(2);
      console.log(`   - Taxa de sucesso: ${successRate}%`);
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
