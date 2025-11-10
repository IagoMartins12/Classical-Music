// scripts/imslp-scraper.ts

import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

interface Composer {
  id: string;
  name: string;
  permlink: string;
  type: string;
  parent: string;
  intvals: any[];
}

// 🆕 Interface atualizada para ComposerData
interface ComposerData {
  imslpId: string;
  name: string;
  permLinkImslp: string;
  imageUrl: string;
  fullName: string;

  // Datas melhoradas
  birthDate: string | null;
  deathDate: string | null;

  // Dados existentes
  wikipediaLink: string | null;
  primaryRole: string | null;
  roles: string | null;

  // 🆕 Nomes alternativos
  otherName: string | null; // Nome alternativo (contentSub)
  alternativeNames: string | null; // 🆕 Nomes alternativos/Transliterações
  pseudonyms: string | null; // 🆕 Pseudônimos

  // 🆕 Informações detalhadas
  diverseInfo: string | null; // 🆕 Informação diversa
  externalLinks: string | null; // 🆕 Links externos

  // Dados mantidos
  nationality: string | null;
  instruments: string | null;
  imslpCategories: string | null; // 🔄 VOLTOU - Categorias IMSLP
  lastModifiedImslp: string | null;
  pageStatus: string | null;
  pageQuality: string | null;
  dataCompleteness: number;
  hasValidImage: boolean;
}

interface EpochInfo {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
}

interface RoleInfo {
  id: string;
  name: string;
}

interface ScraperState {
  currentStart: number;
  totalProcessed: number;
  totalAdded: number;
  lastUpdate: string;
  isRunning: boolean;
  lastSuccessfulBatch: number;
}

// Definição das épocas musicais
const ROLES: RoleInfo[] = [
  {
    id: '685d591c1e3db0c5aaa893e4',
    name: 'Compositor',
  },
  {
    id: '685d59241e3db0c5aaa893e8',
    name: 'Cantor',
  },
  {
    id: '685d594a1e3db0c5aaa893f2',
    name: 'Libretista',
  },
  {
    id: '685d59571e3db0c5aaa893fa',
    name: 'Arranjador',
  },
  {
    id: '685d596b1e3db0c5aaa89404',
    name: 'Editor',
  },
  {
    id: '685d59731e3db0c5aaa89408',
    name: 'Escritor',
  },
  {
    id: '685d597b1e3db0c5aaa8940c',
    name: 'Tradutor',
  },
  {
    id: '685d59841e3db0c5aaa89410',
    name: 'Desconhecido',
  },
];

// Definição das épocas musicais
const EPOCHS: EpochInfo[] = [
  {
    id: '685d59bc1e3db0c5aaa8941b',
    name: 'Medieval',
    startYear: 476,
    endYear: 1399,
  },
  {
    id: '685d59d81e3db0c5aaa89425',
    name: 'Renascentista',
    startYear: 1400,
    endYear: 1599,
  },
  {
    id: '685d59e11e3db0c5aaa8942d',
    name: 'Barroco',
    startYear: 1600,
    endYear: 1749,
  },
  {
    id: '685d59eb1e3db0c5aaa89435',
    name: 'Clássico',
    startYear: 1750,
    endYear: 1819,
  },
  {
    id: '685d59f31e3db0c5aaa89439',
    name: 'Romântico',
    startYear: 1820,
    endYear: 1910,
  },
  {
    id: '685d59ff1e3db0c5aaa8943f',
    name: 'Modernismo',
    startYear: 1911,
    endYear: 1949,
  },
  {
    id: '685d5a061e3db0c5aaa89443',
    name: 'Contemporâneo', // Renomeado de "Moderno"
    startYear: 1950,
    endYear: 2024,
  },
];

// Interface para controle de tempo
interface TimerState {
  startTime: number | null;
  totalElapsedTime: number; // tempo total acumulado em ms
  lastPauseTime: number | null;
}

const STATE_FILE = path.join(process.cwd(), 'scraper-state.json');
const STATE_COMPOSERS_FILE = path.join(
  process.cwd(),
  'scraper-composers-state.log'
);

const BATCH_SIZE = 1000;

const DELAY_BETWEEN_REQUESTS = 2000; // 2 segundos entre requisições
const DELAY_BETWEEN_BATCHES = 5000; // 5 segundos entre lotes

// Instância global do scraper para handlers de sinal
let globalScraperInstance: IMSLPScraper | null = null;

class IMSLPScraper {
  private state: ScraperState;
  private shouldStop: boolean = false;
  private timer: TimerState;

  constructor() {
    this.state = {
      currentStart: 0,
      totalProcessed: 0,
      totalAdded: 0,
      lastUpdate: new Date().toISOString(),
      isRunning: false,
      lastSuccessfulBatch: 0,
    };

    this.timer = {
      startTime: null,
      totalElapsedTime: 0,
      lastPauseTime: null,
    };

    // Definir instância global
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    globalScraperInstance = this;
  }

  // Carregar estado salvo (incluindo timer)
  async loadState(): Promise<void> {
    try {
      const stateData = await fs.readFile(STATE_FILE, 'utf-8');
      const savedState = JSON.parse(stateData);

      this.state = { ...this.state, ...savedState };

      // Carregar estado do timer se existir
      if (savedState.timer) {
        this.timer = { ...this.timer, ...savedState.timer };
      }

      console.log('✓ Estado carregado:', this.state);
      console.log(
        `⏱ Tempo total acumulado: ${this.formatElapsedTime(
          this.timer.totalElapsedTime
        )}`
      );
    } catch {
      console.log('⚠ Nenhum estado anterior encontrado, iniciando do zero');
    }
  }

  // Salvar estado atual (incluindo timer)
  async saveState(): Promise<void> {
    try {
      this.state.lastUpdate = new Date().toISOString();

      const stateToSave = {
        ...this.state,
        timer: this.timer,
      };

      await fs.writeFile(STATE_FILE, JSON.stringify(stateToSave, null, 2));
      console.log(
        `💾 Estado salvo - Requisição atual: ${this.state.currentStart}, Processados: ${this.state.totalProcessed}, Adicionados: ${this.state.totalAdded} \n`
      );
    } catch (error) {
      console.error('❌ Erro ao salvar estado:', error);
    }
  }

  // Iniciar timer
  startTimer(): void {
    if (!this.timer.startTime) {
      this.timer.startTime = Date.now();
      console.log(`⏱ Timer iniciado: ${new Date().toLocaleTimeString()}`);
    }
  }

  // Pausar timer (acumular tempo decorrido)
  pauseTimer(): void {
    if (this.timer.startTime) {
      const currentTime = Date.now();
      this.timer.totalElapsedTime += currentTime - this.timer.startTime;
      this.timer.lastPauseTime = currentTime;
      this.timer.startTime = null;
    }
  }

  // Retomar timer
  resumeTimer(): void {
    if (!this.timer.startTime && this.timer.lastPauseTime) {
      this.timer.startTime = Date.now();
      console.log(`⏱ Timer retomado: ${new Date().toLocaleTimeString()}`);
    }
  }

  // Obter tempo total decorrido (incluindo sessão atual se estiver rodando)
  getTotalElapsedTime(): number {
    let totalTime = this.timer.totalElapsedTime;

    if (this.timer.startTime) {
      // Adicionar tempo da sessão atual
      totalTime += Date.now() - this.timer.startTime;
    }

    return totalTime;
  }

  // Formatar tempo em formato legível
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
    console.log('\n🛑 Parando scraper graciosamente...');

    // Pausar timer
    this.pauseTimer();

    this.shouldStop = true;
    this.state.isRunning = false;
    await this.saveState();

    const totalTime = this.getTotalElapsedTime();
    console.log(
      `⏱ Tempo total de execução: ${this.formatElapsedTime(totalTime)}`
    );
    console.log(
      '✅ Estado salvo com sucesso. Você pode continuar depois com "npm run scraper start"'
    );
  }

  // Buscar compositores da API IMSLP
  async fetchComposers(start: number): Promise<Composer[]> {
    const apiUrl = `https://imslp.org/imslpscripts/API.ISCR.php?account=worklist/disclaimer=accepted/sort=id/type=1/start=${start}/retformat=json`;

    console.log(`📡 Buscando compositores - Start: ${start}`);

    try {
      const response = await axios.get(apiUrl, {
        timeout: 30000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      let composers: Composer[] = [];
      if (Array.isArray(response.data)) {
        composers = response.data;
      } else if (response.data && typeof response.data === 'object') {
        composers = Object.values(response.data) as Composer[];
      }

      console.log(`📊 Encontrados ${composers.length} compositores`);
      return composers;
    } catch (error) {
      console.error(`❌ Erro ao buscar compositores (start=${start}):`, error);
      return [];
    }
  }

  // Verificar se compositor já existe no banco
  async composerExists(imslpId: string): Promise<boolean> {
    try {
      const existing = await prisma.composer.findFirst({
        where: { imslpId: imslpId },
      });
      return !!existing;
    } catch (error) {
      console.error('❌ Erro ao verificar compositor existente:', error);
      return false;
    }
  }

  // Extrair link da Wikipedia
  extractWikipediaLink($: cheerio.Root): string | null {
    try {
      const linksDiv = $('.cp_links');
      if (linksDiv.length === 0) {
        return null;
      }

      // Procurar por links que contenham "wikipedia"
      const wikipediaLinks = linksDiv.find('a').filter((_index, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().toLowerCase();
        return !!(
          href &&
          (href.includes('wikipedia.org') ||
            href.includes('wiki/') ||
            text.includes('wikipedia'))
        );
      });

      if (wikipediaLinks.length === 0) {
        return null;
      }

      // Pegar o primeiro link encontrado
      const firstLink = wikipediaLinks.first();
      let wikipediaUrl = firstLink.attr('href');

      if (!wikipediaUrl) {
        return null;
      }

      // Normalizar o URL da Wikipedia
      if (wikipediaUrl.startsWith('http://')) {
        wikipediaUrl = wikipediaUrl.replace('http://', 'https://');
      }

      // Se for um link relativo ou malformado, tentar construir um URL válido
      if (wikipediaUrl.includes('wiki/')) {
        const wikiPart = wikipediaUrl.substring(wikipediaUrl.indexOf('wiki/'));

        // Verificar se tem indicação de idioma
        if (
          wikipediaUrl.includes('/pt:') ||
          wikipediaUrl.includes('pt.wikipedia')
        ) {
          wikipediaUrl = `https://pt.wikipedia.org/${wikiPart.replace(
            'pt:',
            ''
          )}`;
        } else if (
          wikipediaUrl.includes('/de:') ||
          wikipediaUrl.includes('de.wikipedia')
        ) {
          wikipediaUrl = `https://de.wikipedia.org/${wikiPart.replace(
            'de:',
            ''
          )}`;
        } else if (
          wikipediaUrl.includes('/fr:') ||
          wikipediaUrl.includes('fr.wikipedia')
        ) {
          wikipediaUrl = `https://fr.wikipedia.org/${wikiPart.replace(
            'fr:',
            ''
          )}`;
        } else if (
          wikipediaUrl.includes('/es:') ||
          wikipediaUrl.includes('es.wikipedia')
        ) {
          wikipediaUrl = `https://es.wikipedia.org/${wikiPart.replace(
            'es:',
            ''
          )}`;
        } else {
          // Default para inglês
          wikipediaUrl = `https://en.wikipedia.org/${wikiPart}`;
        }
      }

      // Limpar caracteres especiais e codificação
      wikipediaUrl = wikipediaUrl.replace(/['"]/g, '');

      console.log(`🔗 Link Wikipedia encontrado: ${wikipediaUrl}`);
      return wikipediaUrl;
    } catch (error) {
      console.error('❌ Erro ao extrair link da Wikipedia:', error);
      return null;
    }
  }

  // Determinar o papel baseado no texto encontrado na div mw-pages
  determineRole($: cheerio.Root): {
    primaryRole: string | null;
    roles: string | null;
  } {
    try {
      const mwPagesDiv = $('#mw-pages');
      if (mwPagesDiv.length === 0) {
        console.log('⚠️ Div #mw-pages not found');
        return { primaryRole: null, roles: null };
      }

      const validRolesMap: Record<string, string> = {
        'performances by': 'Cantor',
        'compositions by': 'Compositor',
        'works with text by': 'Libretista',
        'arrangements by': 'Arranjador',
        'works edited by': 'Editor',
        'books by': 'Escritor',
        'works translated by': 'Tradutor',
      };

      const foundRoles: string[] = [];

      // Loop through all h2 elements inside #mw-pages
      mwPagesDiv.find('h2').each((_, element) => {
        const text = $(element).text().trim().toLowerCase(); // converte o texto para minúsculas
        const matchingKey = Object.keys(validRolesMap).find((key) =>
          text.includes(key)
        );

        if (matchingKey) {
          const role = validRolesMap[matchingKey];
          console.log(`✅ Cargo detectado: ${role} (${text})`);
          foundRoles.push(role);
        } else {
          console.log(`❌ Cargo invalido: "${text}"`);
        }
      });

      const primaryRole = foundRoles.length > 0 ? foundRoles[0] : null;
      const additionalRolesArray = foundRoles.slice(1);
      const additionalRoles =
        additionalRolesArray.length > 0
          ? additionalRolesArray.join(', ')
          : null;

      if (additionalRoles) {
        console.log(`✅ Cargos adicionais: ${additionalRoles}`);
      }
      return {
        primaryRole,
        roles: additionalRoles,
      };
    } catch (error) {
      console.error('❌ Error ao extrair cargo:', error);
      return { primaryRole: null, roles: null };
    }
  }

  mapRolesToIds(rolesString: string | null): string | null {
    if (!rolesString) return null;

    // separa a string por vírgula, remove espaços extras e mapeia para ids
    const roleNames = rolesString.split(',').map((r) => r.trim());

    const roleIds = roleNames
      .map(
        (name) =>
          ROLES.find((r) => r.name.toLowerCase() === name.toLowerCase())?.id
      )
      .filter((id): id is string => !!id); // filtra undefined

    return roleIds.length > 0 ? roleIds.join(', ') : null;
  }

  // 🆕 Método para extrair nomes alternativos da div cp_mainlinks
  extractAlternativeNames($: cheerio.Root): {
    alternativeNames: string | null;
    pseudonyms: string | null;
  } {
    try {
      const mainLinksDiv = $('.cp_mainlinks');
      let alternativeNames: string | null = null;
      let pseudonyms: string | null = null;

      console.log('MAIN LINK DIVS', mainLinksDiv.length);
      if (mainLinksDiv.length === 0) {
        return { alternativeNames, pseudonyms };
      }

      // Buscar por spans com diferentes tipos de nomes
      mainLinksDiv
        .find('span[style="font-weight:normal"]')
        .each((_, element) => {
          const spanText = $(element).text().trim();
          console.log('span', spanText);

          const alternativeNamesLabels = [
            'Nomes alternativos/Transliterações:',
            'Alternative Names/Transliterations:',
          ];

          const pseudonymsLabels = ['Pseudônimos:', 'Pseudonyms:'];

          if (
            alternativeNamesLabels.some((label) => spanText.includes(label))
          ) {
            alternativeNames = spanText;
            alternativeNamesLabels.forEach((label) => {
              alternativeNames = (alternativeNames || '').replace(label, '');
            });
            alternativeNames = alternativeNames.trim();
            console.log(
              `📝 Nomes alternativos encontrados: "${alternativeNames}"`
            );
          }

          if (pseudonymsLabels.some((label) => spanText.includes(label))) {
            pseudonyms = spanText;
            pseudonymsLabels.forEach((label) => {
              pseudonyms = (pseudonyms || '').replace(label, '');
            });
            pseudonyms = pseudonyms.trim();
            console.log(`🎭 Pseudônimos encontrados: "${pseudonyms}"`);
          }
        });
      return {
        alternativeNames,
        pseudonyms,
      };
    } catch (error) {
      console.error('❌ Erro ao extrair nomes alternativos:', error);
      return {
        alternativeNames: null,
        pseudonyms: null,
      };
    }
  }

  // 🆕 Método para extrair informação diversa
  extractDiverseInfo($: cheerio.Root): string | null {
    try {
      // Buscar pela seção "Informação diversa"
      const diverseHeader = $('h2')
        .find('span[id*="Informa"], span[id*="diversa"]')
        .first();

      if (diverseHeader.length === 0) {
        return null;
      }

      // Encontrar a div cp_links que vem depois do header
      const diverseSection = diverseHeader.closest('h2').next('.cp_links');

      if (diverseSection.length === 0) {
        return null;
      }

      // Extrair o texto da lista
      const diverseText = diverseSection
        .find('li')
        .map((_, el) => $(el).text().trim())
        .get()
        .join(' ');

      if (diverseText && diverseText.length > 10) {
        console.log(
          `📚 Informação diversa encontrada: "${diverseText.substring(
            0,
            100
          )}..."`
        );
        return diverseText;
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair informação diversa:', error);
      return null;
    }
  }

  // 🆕 Método para extrair links externos
  extractExternalLinks($: cheerio.Root): string | null {
    try {
      // Buscar pela seção "Links externos"
      const linksHeader = $('h2').find('span[id*="Links_externos"]').first();

      if (linksHeader.length === 0) {
        return null;
      }

      // Encontrar a div cp_links que vem depois do header
      const linksSection = linksHeader.closest('h2').next('.cp_links');

      if (linksSection.length === 0) {
        return null;
      }

      // Extrair links e suas descrições
      const links: string[] = [];
      linksSection.find('li').each((_, el) => {
        const linkElement = $(el);
        const linkText = linkElement.text().trim();
        const linkUrl = linkElement.find('a').attr('href');

        if (linkText && linkUrl) {
          links.push(`${linkText} (${linkUrl})`);
        } else if (linkText) {
          links.push(linkText);
        }
      });

      const externalLinks = links.join('; ');

      if (externalLinks && externalLinks.length > 5) {
        console.log(
          `🔗 Links externos encontrados: "${externalLinks.substring(
            0,
            100
          )}..."`
        );
        return externalLinks;
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair links externos:', error);
      return null;
    }
  }

  // 🆕 Método para extrair datas melhoradas (atualizado - removido birthPlace e deathPlace)
  extractImprovedDates($: cheerio.Root): {
    birthDate: string | null;
    deathDate: string | null;
  } {
    try {
      const firsthDiv = $('.cp_firsth');
      let birthDate: string | null = null;
      let deathDate: string | null = null;

      if (firsthDiv.length > 0) {
        const fullText = firsthDiv.text();
        console.log(`🔍 Texto completo das datas: "${fullText}"`);

        // Padrões mais complexos para datas
        const patterns = [
          // Padrão: (31 January 1797 – 28 November 1828)
          /\(([^)]+)\s*[–—-]\s*([^)]+)\)/,
          // Padrão: (born 1797, died 1828)
          /\(.*?born.*?(\d{4}).*?died.*?(\d{4})\)/i,
          // Padrão: (1797-1828)
          /\((\d{4})\s*[–—-]\s*(\d{4})\)/,
          // Padrão com locais: (Berlin, 31 January 1797 – Vienna, 28 November 1828)
          /\(([^,]*,?\s*[^)]*?)\s*[–—-]\s*([^)]*)\)/,
        ];

        for (const pattern of patterns) {
          const match = fullText.match(pattern);
          if (match) {
            let birth = match[1]?.trim();
            let death = match[2]?.trim();

            if (birth && death) {
              // Remover locais se existirem (não salvamos mais)
              birth = birth.replace(/^[^,]+,\s*/, '');
              death = death.replace(/^[^,]+,\s*/, '');

              birthDate = birth;
              deathDate = death;
              break;
            }
          }
        }

        // Se não encontrou com padrões complexos, tentar padrões simples
        if (!birthDate) {
          const simpleYearMatch = fullText.match(/\(.*?(\d{4})/);
          if (simpleYearMatch) {
            birthDate = simpleYearMatch[1];
          }
        }
      }

      console.log(
        `📅 Datas extraídas - Nascimento: ${birthDate}, Morte: ${deathDate}`
      );

      return {
        birthDate,
        deathDate,
      };
    } catch (error) {
      console.error('❌ Erro ao extrair datas:', error);
      return {
        birthDate: null,
        deathDate: null,
      };
    }
  }

  // 🆕 Método para extrair nacionalidade
  extractNationality($: cheerio.Root): string | null {
    try {
      // Buscar na div cp_firsth por indicações de nacionalidade
      const firsthDiv = $('.cp_firsth');
      if (firsthDiv.length === 0) return null;

      const text = firsthDiv.text().toLowerCase();

      // Padrões comuns de nacionalidade
      const nationalityPatterns: Record<string, string[]> = {
        German: ['german', 'deutschland', 'germany', 'german composer'],
        Austrian: ['austrian', 'österreich', 'austria', 'austrian composer'],
        French: ['french', 'france', 'français', 'french composer'],
        Italian: ['italian', 'italy', 'italia', 'italian composer'],
        Russian: ['russian', 'russia', 'русский', 'russian composer'],
        English: ['english', 'england', 'british', 'english composer'],
        American: ['american', 'usa', 'united states', 'american composer'],
        Polish: ['polish', 'poland', 'polska', 'polish composer'],
        Spanish: ['spanish', 'spain', 'españa', 'spanish composer'],
        Czech: ['czech', 'bohemian', 'czechoslovak', 'czech composer'],
        Hungarian: ['hungarian', 'hungary', 'magyar', 'hungarian composer'],
        Dutch: ['dutch', 'netherlands', 'nederland', 'dutch composer'],
        Belgian: ['belgian', 'belgium', 'belgique', 'belgian composer'],
        Swiss: ['swiss', 'switzerland', 'schweiz', 'swiss composer'],
        Brazilian: ['brazilian', 'brazil', 'brasil', 'brazilian composer'],
        Finnish: ['finnish', 'finland', 'suomi', 'finnish composer'],
        Norwegian: ['norwegian', 'norway', 'norge', 'norwegian composer'],
        Swedish: ['swedish', 'sweden', 'sverige', 'swedish composer'],
        Danish: ['danish', 'denmark', 'danmark', 'danish composer'],
      };

      // Procurar por padrões de nacionalidade
      for (const [nationality, patterns] of Object.entries(
        nationalityPatterns
      )) {
        for (const pattern of patterns) {
          if (text.includes(pattern)) {
            console.log(
              `🌍 Nacionalidade encontrada: ${nationality} (padrão: "${pattern}")`
            );
            return nationality;
          }
        }
      }

      // Tentar extrair de categorias se não encontrou no texto principal
      const categoriesText = this.extractCategories($)?.toLowerCase();
      for (const [nationality, patterns] of Object.entries(
        nationalityPatterns
      )) {
        for (const pattern of patterns) {
          if (categoriesText?.includes(pattern)) {
            console.log(
              `🌍 Nacionalidade encontrada nas categorias: ${nationality}`
            );
            return nationality;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair nacionalidade:', error);
      return null;
    }
  }

  // 🆕 Método para avaliar qualidade da página (atualizado - sem compositionsCount)
  evaluatePageQuality($: cheerio.Root): {
    pageStatus: string;
    pageQuality: string;
    dataCompleteness: number;
  } {
    try {
      let completenessScore = 0;
      const maxScore = 8; // Reduzido de 10 para 8 (removido compositionsCount)

      // Verificar elementos presentes
      if ($('.cp_firsth h2').length > 0) completenessScore += 1; // Tem nome
      if (
        $('.cp_firsth').text().includes('(') &&
        $('.cp_firsth').text().includes(')')
      )
        completenessScore += 1; // Tem datas
      if (
        $('.cp_img img').length > 0 &&
        !$('.cp_img img').attr('src')?.includes('Nocomposerphotoavailable')
      )
        completenessScore += 1; // Tem imagem
      if ($('.cp_links a').length > 0) completenessScore += 1; // Tem links externos
      if ($('#mw-pages').length > 0) completenessScore += 1; // Tem seções organizadas
      if ($('.cp_firsth').text().length > 100) completenessScore += 1; // Tem descrição substancial
      if ($('a[href*="wikipedia"]').length > 0) completenessScore += 1; // Tem link Wikipedia
      if ($('.cp_mainlinks').length > 0) completenessScore += 1; // Tem informações adicionais

      const completenessPercentage = (completenessScore / maxScore) * 100;

      // Determinar status da página
      let pageStatus = 'needs_work';
      if (completenessScore >= 7) pageStatus = 'complete';
      else if (completenessScore >= 5) pageStatus = 'good';
      else if (completenessScore >= 3) pageStatus = 'stub';

      // Determinar qualidade
      let pageQuality = 'low';
      if (completenessPercentage >= 80) pageQuality = 'high';
      else if (completenessPercentage >= 60) pageQuality = 'medium';

      console.log(
        `📊 Qualidade da página - Status: ${pageStatus}, Qualidade: ${pageQuality}, Completude: ${completenessPercentage.toFixed(
          1
        )}%`
      );

      return {
        pageStatus,
        pageQuality,
        dataCompleteness: Math.round(completenessPercentage),
      };
    } catch (error) {
      console.error('❌ Erro ao avaliar qualidade da página:', error);
      return {
        pageStatus: 'unknown',
        pageQuality: 'low',
        dataCompleteness: 0,
      };
    }
  }

  // 🆕 Método para extrair instrumentos (mantido)
  extractInstruments($: cheerio.Root): string | null {
    try {
      const instruments: string[] = [];

      // Lista de instrumentos comuns
      const commonInstruments = [
        'Piano',
        'Violin',
        'Viola',
        'Cello',
        'Double bass',
        'Contrabass',
        'Flute',
        'Oboe',
        'Clarinet',
        'Bassoon',
        'Horn',
        'Trumpet',
        'Trombone',
        'Tuba',
        'Harp',
        'Guitar',
        'Organ',
        'Harpsichord',
        'Voice',
        'Soprano',
        'Alto',
        'Tenor',
        'Bass',
        'Choir',
        'Orchestra',
        'String quartet',
        'Wind quintet',
        'Brass',
        'Percussion',
        'Timpani',
      ];

      // Buscar instrumentos nas categorias e texto da página
      const pageText = $('body').text().toLowerCase();

      for (const instrument of commonInstruments) {
        const instrumentLower = instrument.toLowerCase();
        if (
          pageText.includes(instrumentLower + ' works') ||
          pageText.includes('for ' + instrumentLower) ||
          pageText.includes(instrumentLower + ' compositions') ||
          pageText.includes(instrumentLower + ' pieces')
        ) {
          instruments.push(instrument);
        }
      }

      // Buscar também na div mw-pages por menções específicas
      const mwPagesDiv = $('#mw-pages');
      if (mwPagesDiv.length > 0) {
        const mwText = mwPagesDiv.text().toLowerCase();
        for (const instrument of commonInstruments) {
          const instrumentLower = instrument.toLowerCase();
          if (mwText.includes(instrumentLower)) {
            instruments.push(instrument);
          }
        }
      }

      const instrumentsString = [...new Set(instruments)]
        .slice(0, 10)
        .join(', ');
      if (instrumentsString) {
        console.log(`🎼 Instrumentos encontrados: ${instrumentsString}`);
      }

      return instrumentsString || null;
    } catch (error) {
      console.error('❌ Erro ao extrair instrumentos:', error);
      return null;
    }
  }

  // 🔄 Método para extrair categorias IMSLP (VOLTOU)
  extractCategories($: cheerio.Root): string | null {
    try {
      const categories: string[] = [];

      // Buscar no rodapé da página por categorias
      const categoryLinks = $('a[href*="Category:"]');

      categoryLinks.each((_, element) => {
        const categoryText = $(element).text().trim();
        if (
          categoryText &&
          !categoryText.includes('IMSLP') &&
          categoryText.length > 2
        ) {
          categories.push(categoryText);
        }
      });

      // Buscar em divs específicas que podem conter categorias
      const potentialCategoryDivs = $(
        '.catlinks, .mw-normal-catlinks, #catlinks'
      );
      potentialCategoryDivs.each((_, element) => {
        const text = $(element).text();
        if (text.includes('Categories:') || text.includes('Category:')) {
          const categoryMatches = text.match(
            /([A-Z][a-z\s]+(?:composers?|musicians?|pianists?|violinists?|singers?))/g
          );
          if (categoryMatches) {
            categories.push(...categoryMatches);
          }
        }
      });

      const categoriesString = [...new Set(categories)].join(', ');
      if (categoriesString) {
        return categoriesString;
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair categorias:', error);
      return null;
    }
  }

  // 🆕 Método para extrair data de última modificação
  extractLastModified($: cheerio.Root): string | null {
    try {
      // Buscar por indicações de última modificação
      const footerText = $('#footer, .printfooter, #mw-page-base').text();

      const datePatterns = [
        /last\s+modified\s+on\s+([^.]+)/i,
        /last\s+edited\s+on\s+([^.]+)/i,
        /modified\s+([^.]+)/i,
        /updated\s+([^.]+)/i,
      ];

      for (const pattern of datePatterns) {
        const match = footerText.match(pattern);
        if (match) {
          const dateStr = match[1].trim();
          console.log(`📅 Data de modificação encontrada: ${dateStr}`);
          return dateStr;
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair data de modificação:', error);
      return null;
    }
  }

  // 🆕 Método para obter contagem de composições (melhorado)
  getCompositionsCount($: cheerio.Root): number {
    try {
      // Método 1: Aba de composições
      const compositionsTab = $('.ui-tabs-nav li a, .ui-tabs-nav a').filter(
        (_, el) => {
          return $(el).text().includes('Compositions');
        }
      );

      if (compositionsTab.length > 0) {
        const compositionsText = compositionsTab.text();
        const compositionsMatch = compositionsText.match(
          /Compositions \((\d+)\)/
        );
        if (compositionsMatch) {
          return parseInt(compositionsMatch[1]);
        }
      }

      // Método 2: Span com ID
      const countSpan = $('#catnummsgp1');
      if (countSpan.length > 0) {
        const spanText = countSpan.text();
        const count = parseInt(spanText) || 0;
        if (count > 0) return count;
      }

      // Método 3: Contar links na div mw-pages
      const mwPagesDiv = $('#mw-pages');
      if (mwPagesDiv.length > 0) {
        const compositionLinks = mwPagesDiv.find('a').filter((_, el) => {
          const href = $(el).attr('href');
          if (!href) return false;
          return !href.includes('Category:') && !href.includes('Template:');
        });

        if (compositionLinks.length > 0) {
          return compositionLinks.length;
        }
      }
      // const mwPagesDiv = $('#mw-pages');
      // if (mwPagesDiv.length > 0) {
      //   const compositionLinks = mwPagesDiv.find('a').filter((_, el) => {
      //     const href = $(el).attr('href');
      //     return (
      //       href && !href.includes('Category:') && !href.includes('Template:')
      //     );
      //   });
      //   if (compositionLinks.length > 0) {
      //     return compositionLinks.length;
      //   }
      // }

      return 0;
    } catch (error) {
      console.error('❌ Erro ao obter contagem de composições:', error);
      return 0;
    }
  }

  // 🆕 Método auxiliar para parsing flexível de datas
  parseFlexibleDate(dateString: string | null): string | null {
    if (!dateString) return null;

    try {
      // Se tem apenas o ano, retornar como YYYY-01-01
      const yearOnlyMatch = dateString.match(/^(\d{4})$/);
      if (yearOnlyMatch) {
        return `${yearOnlyMatch[1]}-01-01`;
      }

      // Tentar parsear datas mais complexas
      const yearMatch = dateString.match(/(\d{4})/);
      if (yearMatch) {
        const year = yearMatch[1];

        // Buscar mês (em inglês ou números)
        const monthPatterns = {
          january: '01',
          february: '02',
          march: '03',
          april: '04',
          may: '05',
          june: '06',
          july: '07',
          august: '08',
          september: '09',
          october: '10',
          november: '11',
          december: '12',
          jan: '01',
          feb: '02',
          mar: '03',
          apr: '04',
          jun: '06',
          jul: '07',
          aug: '08',
          sep: '09',
          oct: '10',
          nov: '11',
          dec: '12',
        };

        let month = '01';
        let day = '01';

        // Buscar nome do mês
        for (const [monthName, monthNum] of Object.entries(monthPatterns)) {
          if (dateString.toLowerCase().includes(monthName)) {
            month = monthNum;
            break;
          }
        }

        // Buscar dia (1-31)
        const dayMatch = dateString.match(/\b(\d{1,2})\b/);
        if (dayMatch) {
          const dayNum = parseInt(dayMatch[1]);
          if (dayNum >= 1 && dayNum <= 31) {
            day = dayNum.toString().padStart(2, '0');
          }
        }

        return `${year}-${month}-${day}`;
      }

      return null;
    } catch (error) {
      console.error(`❌ Erro ao converter data "${dateString}":`, error);
      return null;
    }
  }

  // 🆕 Método auxiliar para determinar época por data
  determineEpochByDate(birthDate: string | null): EpochInfo {
    if (!birthDate) {
      // Se não tem data, usar época padrão (Contemporâneo)
      return EPOCHS[EPOCHS.length - 1];
    }

    // Extrair ano da string de data
    const yearMatch = birthDate.match(/(\d{4})/);
    if (!yearMatch) {
      return EPOCHS[EPOCHS.length - 1];
    }

    const year = parseInt(yearMatch[1]);

    // Encontrar a época correspondente
    for (const epoch of EPOCHS) {
      if (year >= epoch.startYear && year <= epoch.endYear) {
        return epoch;
      }
    }

    // Para casos especiais
    if (year < EPOCHS[0].startYear) {
      return EPOCHS[0]; // Medieval
    } else {
      return EPOCHS[EPOCHS.length - 1]; // Contemporâneo
    }
  }

  // Método extractComposerDetails ATUALIZADO com os novos dados
  async extractComposerDetails(
    composer: Composer
  ): Promise<ComposerData | null> {
    try {
      console.log(`🔍 Processando: ${composer.id}`);

      const pageResponse = await axios.get(composer.permlink, {
        timeout: 15000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(pageResponse.data);
      const compositionsCount = this.getCompositionsCount($);
      console.log(`🎼 Composições encontradas: ${compositionsCount}`);

      // Verificar imagem
      const imageElement = $('.cp_img img');
      let hasValidImage = false;
      let imageUrl = '';

      if (imageElement.length > 0) {
        const imgSrc = imageElement.attr('src');
        if (imgSrc && !imgSrc.includes('Nocomposerphotoavailable')) {
          hasValidImage = true;
          imageUrl = imgSrc;
        }
      }

      // 🔄 Lógica simplificada: aceitar todos os compositores (removida verificação de composições)
      if (!hasValidImage) {
        console.log(
          `⚠ Compositor sem imagem: ${composer.id}, verificando composições...`
        );

        if (compositionsCount < 5) {
          console.log(
            `❌ Compositor sem imagem e com menos de 5 composições (${compositionsCount}): ${composer.id} \n`
          );
          await fs.appendFile(
            STATE_COMPOSERS_FILE,
            ` ❌ ${composer.id} / Compositor sem imagem e com menos de 5 composições (${compositionsCount})` +
              '\n'
          );
          return null;
        } else {
          console.log(
            `✅ Compositor sem imagem mas com ${compositionsCount} composições (≥5), continuando...`
          );
          imageUrl =
            'https://imslp.org/images/thumb/a/ad/Nocomposerphotoavailable.jpg/180px-Nocomposerphotoavailable.jpg';
        }
      }

      // 🆕 Extrair nome alternativo (contentSub)
      const otherName = this.extractOtherName($);

      // 🆕 Extrair nomes alternativos da página
      const alternativeNamesInfo = this.extractAlternativeNames($);

      // 🆕 Extrair informação diversa
      const diverseInfo = this.extractDiverseInfo($);

      // 🆕 Extrair links externos
      const externalLinks = this.extractExternalLinks($);

      // 🆕 Extrair datas melhoradas
      const dateInfo = this.extractImprovedDates($);

      // 🆕 Extrair nacionalidade
      const nationality = this.extractNationality($);

      // 🆕 Extrair instrumentos (mantido)
      const instruments = this.extractInstruments($);

      // 🔄 Extrair categorias IMSLP (VOLTOU)
      const imslpCategories = this.extractCategories($);

      // 🆕 Extrair data de última modificação
      const lastModifiedImslp = this.extractLastModified($);

      // 🆕 Avaliar qualidade da página
      const qualityInfo = this.evaluatePageQuality($);

      // Extrair link da Wikipedia (mantendo método existente)
      const wikipediaLink = this.extractWikipediaLink($) || null;

      // Determinar o papel (role) baseado na div mw-pages (mantendo método existente)
      const role = this.determineRole($);
      const roleInfo =
        ROLES.find((r) => r.name === role.primaryRole) ??
        ROLES.find((r) => r.name === 'Desconhecido');
      const roleId = roleInfo?.id ?? '6839e617eba93979e36ad892';
      const additionalRolesIds = this.mapRolesToIds(role.roles);

      // Extrair dados da div cp_firsth (melhorado)
      const firsthDiv = $('.cp_firsth');
      let fullName = '';

      if (firsthDiv.length > 0) {
        // Nome completo
        const h2Element = firsthDiv.find('h2 .mw-headline');
        if (h2Element.length > 0) {
          fullName = h2Element.text().trim();
        }
      }

      // Nome (primeiro nome) - mantendo lógica existente
      let firstName = '';
      if (composer.id) {
        const idWithoutCategory = composer.id.replace('Category:', '');
        const parts = idWithoutCategory.split(',');
        if (parts.length >= 2) {
          firstName = parts[1].trim();
        } else {
          firstName = parts[0].trim();
        }
      }

      // Fallback para fullName
      if (!fullName) {
        fullName =
          composer.id?.replace('Category:', '').replace(',', ', ') ||
          'Nome não disponível';
      }

      // 🆕 Log de todos os dados extraídos
      console.log(`📊 DADOS EXTRAÍDOS PARA ${firstName}:`);
      console.log(`   - Nome alternativo: ${otherName || 'Não encontrado'}`);
      console.log(
        `   - Nomes alternativos: ${
          alternativeNamesInfo.alternativeNames || 'Não encontrados'
        }`
      );

      console.log(
        `   - Pseudônimos: ${
          alternativeNamesInfo.pseudonyms || 'Não encontrados'
        }`
      );
      console.log(
        `   - Info diversa: ${diverseInfo ? 'Encontrada' : 'Não encontrada'}`
      );
      console.log(
        `   - Links externos: ${
          externalLinks ? 'Encontrados' : 'Não encontrados'
        }`
      );
      console.log(`   - Nacionalidade: ${nationality || 'Não encontrada'}`);
      console.log(`   - Nascimento: ${dateInfo.birthDate}`);
      console.log(`   - Morte: ${dateInfo.deathDate}`);
      console.log(`   - Instrumentos: ${instruments || 'Não encontrados'}`);
      console.log(`   - Categorias: ${imslpCategories || 'Não encontradas'}`);
      console.log(
        `   - Qualidade: ${qualityInfo.pageQuality} (${qualityInfo.dataCompleteness}%)`
      );

      return {
        imslpId: composer.id,
        name: firstName,
        permLinkImslp: composer.permlink,
        fullName: fullName,

        // Datas melhoradas
        birthDate: dateInfo.birthDate,
        deathDate: dateInfo.deathDate,

        // Dados existentes
        wikipediaLink: wikipediaLink,
        primaryRole: roleId,
        roles: additionalRolesIds,
        imageUrl: imageUrl.startsWith('/')
          ? `https://imslp.org${imageUrl}`
          : imageUrl,

        // 🆕 Nomes alternativos
        otherName: otherName,
        alternativeNames: alternativeNamesInfo.alternativeNames,
        pseudonyms: alternativeNamesInfo.pseudonyms,

        // 🆕 Informações detalhadas
        diverseInfo: diverseInfo,
        externalLinks: externalLinks,

        // Dados mantidos
        nationality: nationality,
        instruments: instruments,
        imslpCategories: imslpCategories, // 🔄 VOLTOU
        lastModifiedImslp: lastModifiedImslp,
        pageStatus: qualityInfo.pageStatus,
        pageQuality: qualityInfo.pageQuality,
        dataCompleteness: qualityInfo.dataCompleteness,
        hasValidImage: hasValidImage,
      };
    } catch {
      console.error(`❌ Erro ao extrair dados de ${composer.id}\n`);
      await fs.appendFile(
        STATE_COMPOSERS_FILE,
        ` ❌ ${composer.id} / Erro ao extrair dados` + '\n'
      );
      return null;
    }
  }

  // 🆕 Método para extrair nome alternativo (contentSub)
  extractOtherName($: cheerio.Root): string | null {
    try {
      const contentSubDiv = $('#contentSub');
      if (contentSubDiv.length === 0) {
        return null;
      }

      const otherName = contentSubDiv.text().trim();

      // Verificar se não é vazio e não é igual ao nome principal
      if (otherName && otherName.length > 0) {
        console.log(`👤 Nome alternativo encontrado: "${otherName}"`);
        return otherName;
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair nome alternativo:', error);
      return null;
    }
  }

  // Determinar época baseada na data de nascimento
  determineEpoch(birthDate: string | null): EpochInfo {
    if (!birthDate) {
      // Se não tem data de nascimento, usar época padrão (Moderno)
      return EPOCHS[EPOCHS.length - 1];
    }

    // Extrair ano da data de nascimento
    let birthYear: number;
    const yearMatch = birthDate.match(/(\d{4})/);

    if (yearMatch) {
      birthYear = parseInt(yearMatch[1]);
    } else {
      // Se não conseguir extrair o ano, usar época padrão
      return EPOCHS[EPOCHS.length - 1];
    }

    // Encontrar a época correspondente
    for (const epoch of EPOCHS) {
      if (birthYear >= epoch.startYear && birthYear < epoch.endYear) {
        console.log(
          `📅 Época determinada: ${epoch.name} (${epoch.startYear}-${epoch.endYear})`
        );
        return epoch;
      }
    }

    // Para casos especiais (anos muito antigos ou muito futuros)
    if (birthYear < EPOCHS[0].startYear) {
      console.log(
        `📅 Ano muito antigo (${birthYear}), usando: ${EPOCHS[0].name}`
      );
      return EPOCHS[0]; // Medieval
    } else {
      console.log(
        `📅 Ano recente (${birthYear}), usando: ${
          EPOCHS[EPOCHS.length - 1].name
        }`
      );
      return EPOCHS[EPOCHS.length - 1]; // Moderno
    }
  }

  // Converter string de data para formato de data simples (apenas ano)
  parseDate(dateString: string | null): string | null {
    if (!dateString) return null;

    try {
      // Extrair apenas o ano da string de data
      const yearMatch = dateString.match(/(\d{4})/);

      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        // Retornar apenas a data no formato YYYY-01-01 (string)
        return `${year}-01-01`;
      }

      return null;
    } catch (error) {
      console.error(`❌ Erro ao converter data "${dateString}":`, error);
      return null;
    }
  }

  // Método saveComposer ATUALIZADO para os novos campos
  async saveComposer(composerData: ComposerData): Promise<boolean> {
    try {
      // Verificar se já existe
      if (await this.composerExists(composerData.imslpId)) {
        console.log(`⚠ Compositor já existe: ${composerData.fullName}`);
        return false;
      }

      // Determinar época baseada na data de nascimento
      const epoch = this.determineEpochByDate(composerData.birthDate);

      // Extrair ano para log
      const birthYear = composerData.birthDate?.match(/(\d{4})/)?.[1];
      console.log(
        `🎼 ${composerData.fullName} -> Época: ${epoch.name} (baseado em ${
          birthYear || 'data padrão'
        })`
      );

      await prisma.composer.create({
        data: {
          // CAMPOS OBRIGATÓRIOS
          name: composerData.name,
          fullName: composerData.fullName,
          portraitUrl: composerData.imageUrl,
          epochId: epoch.id,
          permLinkImslp: composerData.permLinkImslp,
          imslpId: composerData.imslpId,

          // 🆕 NOMES ALTERNATIVOS
          alternativeNames: composerData.alternativeNames,

          // 🆕 DATAS MELHORADAS
          birthDate: composerData.birthDate,
          deathDate: composerData.deathDate,

          // 🆕 DADOS GEOGRÁFICOS E TÉCNICOS (mantidos)
          nationality: composerData.nationality,
          instruments: composerData.instruments,

          // 🔄 CATEGORIAS E CLASSIFICAÇÕES IMSLP (VOLTOU)
          imslpCategories: composerData.imslpCategories,

          // 🆕 METADADOS DA PÁGINA
          pageQuality: composerData.pageQuality,
          dataCompleteness: composerData.dataCompleteness,
          hasValidImage: composerData.hasValidImage,
          lastVerified: new Date(),

          // CAMPOS EXISTENTES
          wikipediaLink: composerData.wikipediaLink,
          epochName: epoch.name,
          bio: null,
          primaryRoleId: composerData.primaryRole ?? '6839e617eba93979e36ad892',
          roles: composerData.roles,
        },
      });

      // 🆕 Log mais informativo
      const logParts = [
        `✅ ${composerData.fullName}`,
        `(${epoch.name})`,
        composerData.nationality ? `${composerData.nationality}` : '',
        birthYear ? `${birthYear}` : '',
        composerData.wikipediaLink ? '🔗 Wiki' : '',
        composerData.diverseInfo ? '📚 Info' : '',
        composerData.externalLinks ? '🔗 Links' : '',
        `${composerData.dataCompleteness}% completo`,
      ]
        .filter(Boolean)
        .join(' ');

      console.log(`${logParts}\n`);

      await fs.appendFile(
        STATE_COMPOSERS_FILE,
        ` ✅ ${composerData.imslpId} / ${composerData.fullName}${
          composerData.otherName ? ` (${composerData.otherName})` : ''
        } / ${composerData.nationality || 'sem nacionalidade'} / ${
          composerData.dataCompleteness
        }% completo` + '\n'
      );

      return true;
    } catch (error) {
      console.error(
        `❌ Erro ao salvar compositor ${composerData.fullName}:`,
        error
      );
      return false;
    }
  }

  // Processar um lote de compositores
  async processBatch(
    composers: Composer[]
  ): Promise<{ processed: number; added: number }> {
    let processedCount = 0;
    let addedCount = 0;

    // Filtrar compositores válidos
    const validComposers = composers.filter(
      (composer) =>
        composer.id &&
        composer.id.includes(',') &&
        !composer.id.includes('"') &&
        composer.id.length > 20 &&
        composer.permlink
    );

    console.log(
      `📋 Processando ${validComposers.length} compositores válidos de ${composers.length} total \n`
    );

    for (const composer of validComposers) {
      // Verificar se deve parar
      if (this.shouldStop) {
        console.log('🛑 Interrupção detectada, parando processamento...');
        break;
      }

      try {
        processedCount++;

        // Atualizar contador total de processados em tempo real
        this.state.totalProcessed++;

        // Verificar se já existe antes de processar
        if (await this.composerExists(composer.id)) {
          console.log(`⏭ Pulando (já existe): ${composer.id} \n`);
          continue;
        }

        const composerData = await this.extractComposerDetails(composer);

        if (composerData) {
          const saved = await this.saveComposer(composerData);
          if (saved) {
            addedCount++;
            // Atualizar contador total de adicionados em tempo real
            this.state.totalAdded++;
          }
        }

        // Salvar estado a cada 5 compositores processados para melhor segurança
        if (processedCount % 5 === 0) {
          await this.saveState();
        }

        // Delay entre compositores
        await new Promise((resolve) =>
          setTimeout(resolve, DELAY_BETWEEN_REQUESTS)
        );
      } catch (error) {
        console.error(`❌ Erro ao processar ${composer.id}:`, error);
        continue;
      }
    }

    return { processed: processedCount, added: addedCount };
  }

  // Executar scraper principal
  async run(): Promise<void> {
    console.log('🚀 Iniciando IMSLP Scraper...');

    await this.loadState();

    if (this.state.isRunning) {
      console.log(
        '⚠ Scraper já está rodando. Pare o processo anterior primeiro.'
      );
      return;
    }

    // Verificar se está continuando de onde parou
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
      let hasMoreComposers = true;

      while (hasMoreComposers && !this.shouldStop) {
        const currentElapsed = this.getTotalElapsedTime();
        console.log(
          `\n🔄 Iniciando lote - Start: ${
            this.state.currentStart
          } | Tempo: ${this.formatElapsedTime(currentElapsed)}`
        );

        // Buscar compositores
        const composers = await this.fetchComposers(this.state.currentStart);

        if (composers.length === 0) {
          console.log('🏁 Não há mais compositores para processar!');
          hasMoreComposers = false;
          break;
        }

        // Processar lote
        const result = await this.processBatch(composers);

        // Atualizar posição atual e marcar lote como bem-sucedido
        this.state.currentStart += BATCH_SIZE;
        this.state.lastSuccessfulBatch = this.state.currentStart;

        // Salvar estado após cada lote
        await this.saveState();

        const totalElapsed = this.getTotalElapsedTime();
        console.log(
          `📊 Lote concluído - Processados: ${result.processed}, Adicionados: ${result.added}`
        );
        console.log(
          `📈 Total - Processados: ${this.state.totalProcessed}, Adicionados: ${this.state.totalAdded}`
        );
        console.log(`⏱ Tempo total: ${this.formatElapsedTime(totalElapsed)}`);

        // Verificar se foi interrompido
        if (this.shouldStop) {
          console.log('🛑 Scraper interrompido pelo usuário');
          break;
        }

        // Delay entre lotes
        if (hasMoreComposers) {
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
        console.log(`\n🎉 Scraper concluído!`);
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
        '💾 Estado foi salvo. Você pode continuar com "npm run scraper start"'
      );
    } finally {
      this.state.isRunning = false;
      await this.saveState();
      await prisma.$disconnect();
    }
  }

  // Método para parar o scraper graciosamente
  async stop(): Promise<void> {
    console.log('🛑 Parando scraper...');

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

  // Método para resetar o estado
  async reset(): Promise<void> {
    console.log('🔄 Resetando estado do scraper...');
    this.state = {
      currentStart: 0,
      totalProcessed: 0,
      totalAdded: 0,
      lastUpdate: new Date().toISOString(),
      isRunning: false,
      lastSuccessfulBatch: 0,
    };

    // Resetar timer também
    this.timer = {
      startTime: null,
      totalElapsedTime: 0,
      lastPauseTime: null,
    };

    await this.saveState();
    console.log('✅ Estado resetado. Próxima execução começará do início.');
  }

  // 🆕 Método de status aprimorado com estatísticas dos novos dados
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

// Função principal para executar o scraper
async function main() {
  const scraper = new IMSLPScraper();

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

  if (globalScraperInstance) {
    await globalScraperInstance.gracefulStop();
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

  if (globalScraperInstance) {
    await globalScraperInstance.gracefulStop();
  }

  process.exit(1);
});

if (require.main === module) {
  main().catch(console.error);
}

export default IMSLPScraper;
