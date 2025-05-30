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

interface ComposerData {
  imslpId: string;
  name: string;
  permLinkImslp: string;
  imageUrl: string;
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
  wikipediaLink: string | null;
  primaryRole: string | null;
  roles: string | null;
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
    id: '6839e5a5eba93979e36ad88b',
    name: 'Compositor',
  },
  {
    id: '6839e5bbeba93979e36ad88c',
    name: 'Cantor',
  },
  {
    id: '6839e5c4eba93979e36ad88d',
    name: 'Libretista',
  },
  {
    id: '6839e5dbeba93979e36ad88e',
    name: 'Arranjador',
  },
  {
    id: '6839f37b4141cbebd5abf14b',
    name: 'Editor',
  },
  {
    id: '6839e5f5eba93979e36ad88f',
    name: 'Escritor',
  },
  {
    id: '6839e610eba93979e36ad891',
    name: 'Tradutor',
  },
  {
    id: '6839e617eba93979e36ad892',
    name: 'Desconhecido',
  },
];

// Definição das épocas musicais
const EPOCHS: EpochInfo[] = [
  {
    id: '6838837f7e5dd7f7e0ba702c',
    name: 'Medieval',
    startYear: 476,
    endYear: 1399,
  },
  {
    id: '683883bf7e5dd7f7e0ba702d',
    name: 'Renascentista',
    startYear: 1400,
    endYear: 1599,
  },
  {
    id: '683883f37e5dd7f7e0ba7030',
    name: 'Barroco',
    startYear: 1600,
    endYear: 1749,
  },
  {
    id: '683883fc7e5dd7f7e0ba7031',
    name: 'Clássico',
    startYear: 1750,
    endYear: 1819,
  },
  {
    id: '6838846f7e5dd7f7e0ba7033',
    name: 'Romântico',
    startYear: 1820,
    endYear: 1910,
  },
  {
    id: '6838847e7e5dd7f7e0ba7034',
    name: 'Modernismo',
    startYear: 1911, // Corrigido: era 1870, criava gap
    endYear: 1949, // Corrigido: era 1900, muito curto
  },
  {
    id: '683885437e5dd7f7e0ba7037',
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
    } catch (error) {
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
        `💾 Estado salvo - Start: ${this.state.currentStart}, Processados: ${this.state.totalProcessed}, Adicionados: ${this.state.totalAdded}`
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
  extractWikipediaLink($: cheerio.CheerioAPI): string | null {
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
  determineRole($: cheerio.CheerioAPI): {
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

  // Extrair dados detalhados do compositor
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

      // Verificar imagem
      const imageElement = $('.cp_img img');
      if (imageElement.length === 0) {
        console.log(`⚠ Sem imagem: ${composer.id}`);
        return null;
      }

      const imageUrl = imageElement.attr('src');
      if (!imageUrl || imageUrl.includes('Nocomposerphotoavailable')) {
        console.log(`⚠ Compositor sem imagem: ${composer.id} \n`);
        return null;
      }

      // Extrair link da Wikipedia (SEMPRE null se não encontrar)
      const wikipediaLink = this.extractWikipediaLink($) || null;

      // Determinar o papel (role) baseado na div mw-pages
      const role = this.determineRole($);
      const roleInfo =
        ROLES.find((r) => r.name === role.primaryRole) ??
        ROLES.find((r) => r.name === 'Desconhecido');
      const roleId = roleInfo?.id ?? '6839e617eba93979e36ad892';
      const additionalRolesIds = this.mapRolesToIds(role.roles);

      // Extrair dados da div cp_firsth
      const firsthDiv = $('.cp_firsth');
      let fullName = '';
      let birthDate: string | null = null;
      let deathDate: string | null = null;

      if (firsthDiv.length > 0) {
        // Nome completo
        const h2Element = firsthDiv.find('h2 .mw-headline');
        if (h2Element.length > 0) {
          fullName = h2Element.text().trim();
        }

        // Datas (SEMPRE null se não encontrar)
        const dateText = firsthDiv.text();
        const dateRegex = /\(([^)]+)\)/;
        const dateMatch = dateText.match(dateRegex);

        if (dateMatch) {
          const dateString = dateMatch[1];
          if (dateString.includes('—') || dateString.includes('-')) {
            const parts = dateString.split(/[—-]/);
            if (parts.length >= 2) {
              const birth = parts[0].trim();
              const death = parts[1].trim();

              // Só atribuir se não estiver vazio
              birthDate = birth && birth !== '' ? birth : null;
              deathDate = death && death !== '' ? death : null;
            }
          } else if (dateString.includes('nascido')) {
            const birthMatch = dateString.match(/nascido.*?(\d{4})/i);
            if (birthMatch) {
              birthDate = birthMatch[1];
            }
          } else {
            const yearMatch = dateString.match(/(\d{4})/);
            if (yearMatch) {
              birthDate = yearMatch[1];
            }
          }
        }
      }

      // Nome (primeiro nome)
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

      return {
        imslpId: composer.id,
        name: firstName,
        permLinkImslp: composer.permlink,
        fullName: fullName,
        birthDate: birthDate, // Pode ser null
        deathDate: deathDate, // Pode ser null
        wikipediaLink: wikipediaLink, // Pode ser null
        primaryRole: roleId,
        roles: additionalRolesIds,
        imageUrl: imageUrl.startsWith('/')
          ? `https://imslp.org${imageUrl}`
          : imageUrl,
      };
    } catch (error) {
      console.error(`❌ Erro ao extrair dados de ${composer.id}: \n`);
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

    console.log(`🗓 Determinando época para ano ${birthYear}`);

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

  // Salvar compositor no banco de dados
  async saveComposer(composerData: ComposerData): Promise<boolean> {
    try {
      // Verificar se já existe
      if (await this.composerExists(composerData.imslpId)) {
        console.log(`⚠ Compositor já existe: ${composerData.fullName}`);
        return false;
      }

      // Converter datas (podem ser null)
      const birthDate = this.parseDate(composerData.birthDate);
      const deathDate = this.parseDate(composerData.deathDate);

      // Determinar época baseada na data de nascimento
      const epoch = this.determineEpoch(composerData.birthDate);
      console.log(`🎼 ${composerData.fullName} -> Época: ${epoch.name}`);

      await prisma.composer.create({
        data: {
          // CAMPOS OBRIGATÓRIOS
          name: composerData.name,
          fullName: composerData.fullName,
          portraitUrl: composerData.imageUrl,
          epochId: epoch.id,
          permLinkImslp: composerData.permLinkImslp,
          imslpId: composerData.imslpId,

          // CAMPOS OPCIONAIS (podem ser null)
          birthDate: birthDate,
          deathDate: deathDate,
          wikipediaLink: composerData.wikipediaLink,

          // CAMPOS ADICIONAIS
          epochName: epoch.name, // Campo adicional para backup
          bio: null,
          primaryRoleId: composerData.primaryRole ?? '6839e617eba93979e36ad892',
          roles: composerData.roles,
        },
      });

      console.log(
        `✅ Compositor salvo: ${composerData.fullName} (${epoch.name}) ${
          composerData.wikipediaLink ? '🔗 Wiki' : ''
        } \n`
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
      `📋 Processando ${validComposers.length} compositores válidos de ${composers.length} total`
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

  // Método para mostrar status atual
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
