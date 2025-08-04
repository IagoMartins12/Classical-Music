// scripts/difficulty-scraper-fixed.ts - Versão Corrigida do Scraper IMSLP

import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

interface DifficultyEntry {
  workTitle: string;
  composerName: string;
  workLink: string;
  permlink: string;
  sourceId: string;
  difficultyLevel: string;
  difficultySystem: string;
  difficultyRating: string;
  votes?: number;
  fileTitle?: string;
  period?: string;
  rawData?: any; // Dados brutos para debug
}

interface ScraperState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalProcessed: number;
  totalMatched: number;
  totalUpdated: number;
  lastUpdate: string;
  isRunning: boolean;
}

const STATE_FILE = path.join(process.cwd(), 'difficulty-scraper-state.json');
const RESULTS_FILE = path.join(
  process.cwd(),
  'difficulty-analysis-results.json'
);
const BASE_URL = 'https://imslp.org/wiki/Special:DiffPage/DiffMain';
const DELAY_BETWEEN_REQUESTS = 2000;
const DELAY_BETWEEN_PAGES = 3000;

class IMSLPDifficultyScraperFixed {
  private state: ScraperState;
  private shouldStop: boolean = false;
  private dryRun: boolean = true;
  private foundEntries: DifficultyEntry[] = [];
  private matchedWorks: Array<{
    entry: DifficultyEntry;
    workId: string;
    workTitle: string;
    currentDifficulty?: string;
    hasWorkScore: boolean;
  }> = [];

  constructor(dryRun: boolean = true) {
    this.dryRun = dryRun;
    this.state = {
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 100,
      totalProcessed: 0,
      totalMatched: 0,
      totalUpdated: 0,
      lastUpdate: new Date().toISOString(),
      isRunning: false,
    };
  }

  // 🔄 CARREGAR ESTADO SALVO
  async loadState(): Promise<void> {
    try {
      const stateData = await fs.readFile(STATE_FILE, 'utf-8');
      const savedState = JSON.parse(stateData);
      this.state = { ...this.state, ...savedState };
      console.log('✅ Estado carregado:', this.state);
    } catch (error) {
      console.log('⚠️ Nenhum estado anterior encontrado, iniciando do zero');
    }
  }

  // 💾 SALVAR ESTADO
  async saveState(): Promise<void> {
    try {
      this.state.lastUpdate = new Date().toISOString();
      await fs.writeFile(STATE_FILE, JSON.stringify(this.state, null, 2));
      console.log(
        `💾 Estado salvo - Página: ${this.state.currentPage}/${this.state.totalPages}`
      );
    } catch (error) {
      console.error('❌ Erro ao salvar estado:', error);
    }
  }

  // 🌐 BUSCAR PÁGINA DE DIFICULDADE
  async fetchDifficultyPage(page: number): Promise<DifficultyEntry[]> {
    try {
      // Construir URL com parâmetros para máximo de itens por página
      const url = `${BASE_URL}/${page}?limit=100`;
      console.log(`📡 Buscando página ${page}: ${url}`);

      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          DNT: '1',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });

      console.log(
        `📄 Página ${page} carregada com ${response.data.length} caracteres`
      );
      return this.parseDifficultyPage(response.data, page);
    } catch (error) {
      console.error(`❌ Erro ao buscar página ${page}:`, error);
      return [];
    }
  }

  // 🔍 EXTRAIR DADOS DA PÁGINA - VERSÃO CORRIGIDA
  parseDifficultyPage(html: string, pageNumber: number): DifficultyEntry[] {
    const $ = cheerio.load(html);
    const entries: DifficultyEntry[] = [];

    console.log(`🔍 Analisando página ${pageNumber}...`);

    // 📊 MÉTODO 1: EXTRAIR DADOS JAVASCRIPT EMBEBIDOS
    const jsEntries = this.extractJavaScriptData($, html);
    if (jsEntries.length > 0) {
      console.log(`✅ Extraídos ${jsEntries.length} itens via JavaScript`);
      entries.push(...jsEntries);
    }

    // 📊 MÉTODO 2: FALLBACK - SCRAPING HTML TRADICIONAL
    if (entries.length === 0) {
      console.log(
        '⚠️ JavaScript data não encontrado, tentando HTML scraping...'
      );
      const htmlEntries = this.extractHTMLData($);
      if (htmlEntries.length > 0) {
        console.log(
          `✅ Extraídos ${htmlEntries.length} itens via HTML scraping`
        );
        entries.push(...htmlEntries);
      }
    }

    // 📊 ATUALIZAR INFORMAÇÕES DE PAGINAÇÃO
    this.updatePaginationInfo($);

    console.log(
      `📋 Total extraído da página ${pageNumber}: ${entries.length} entradas`
    );
    return entries;
  }

  // 🎯 MÉTODO 1: EXTRAIR DADOS JAVASCRIPT EMBEBIDOS
  extractJavaScriptData(
    $: cheerio.CheerioAPI,
    html: string
  ): DifficultyEntry[] {
    const entries: DifficultyEntry[] = [];

    try {
      // Buscar por padrões de dados JavaScript típicos da página IMSLP
      const jsDataMatches = html.match(/f2t\d+\s*=\s*(\{.*?\});/gs);

      if (jsDataMatches) {
        console.log(
          `🔍 Encontrados ${jsDataMatches.length} blocos de dados JavaScript`
        );

        for (const match of jsDataMatches) {
          try {
            // Extrair o JSON do match
            const jsonMatch = match.match(/=\s*(\{.*\});/s);
            if (jsonMatch) {
              const jsonData = JSON.parse(jsonMatch[1]);
              console.log('📊 Dados JSON encontrados:', Object.keys(jsonData));

              if (jsonData.data && Array.isArray(jsonData.data)) {
                console.log(
                  `📋 Processando ${jsonData.data.length} itens de dados`
                );

                for (const item of jsonData.data) {
                  const entry = this.parseDataItem(item);
                  if (entry) {
                    entries.push(entry);
                    console.log(
                      `✅ Extraído: ${entry.workTitle} (${entry.composerName}) - ${entry.difficultyRating}`
                    );
                  }
                }
              }
            }
          } catch (parseError) {
            console.error('❌ Erro ao parsear dados JavaScript:', parseError);
          }
        }
      }

      // Buscar também por outros padrões de dados JavaScript
      const alternativeMatches = html.match(
        /diffmt_comments\s*=\s*(\{.*?\});/gs
      );
      if (alternativeMatches) {
        console.log('🔍 Encontrados dados alternativos de comentários');
      }
    } catch (error) {
      console.error('❌ Erro na extração de dados JavaScript:', error);
    }

    return entries;
  }

  // 🎯 PARSE INDIVIDUAL DE ITEM DE DADOS
  parseDataItem(item: any): DifficultyEntry | null {
    try {
      if (!Array.isArray(item)) {
        console.log(`⚠️ Item não é array:`, typeof item);
        return null;
      }

      console.log(`\n🔍 === DEBUGANDO ITEM ===`);
      console.log(`Comprimento do item: ${item.length}`);

      // Vamos mapear cada index do item para entender a estrutura
      item.forEach((subItem: any, index: number) => {
        if (Array.isArray(subItem)) {
          console.log(
            `[${index}]: Array com ${subItem.length} elementos:`,
            subItem
          );
        } else {
          console.log(`[${index}]: ${typeof subItem} = "${subItem}"`);
        }
      });

      // A partir da análise do HTML, a estrutura parece ser:
      // Cada entrada tem múltiplos sub-arrays seguidos por strings
      // Vamos buscar pelos padrões conhecidos:

      let difficultyLevel = '';
      let difficultyRating = '';
      let difficultySystem = 'IMSLP';
      let workTitle = '';
      let sourceId = '';
      let composerName = '';
      let workLink = '';

      // 🎯 BUSCAR NÍVEL DE DIFICULDADE
      // Procurar por padrões que contenham números que podem ser níveis
      for (const subItem of item) {
        if (Array.isArray(subItem)) {
          // Procurar padrão [id, false, number, [level_string, count]]
          if (
            subItem.length >= 4 &&
            Array.isArray(subItem[3]) &&
            subItem[3].length >= 1
          ) {
            const levelCandidate = String(subItem[3][0]).trim();
            if (
              /^\d+$/.test(levelCandidate) ||
              levelCandidate.includes('RCM') ||
              levelCandidate.includes('Prep')
            ) {
              difficultyLevel = levelCandidate;
              console.log(`✅ Nível encontrado: "${difficultyLevel}"`);
              break;
            }
          }

          // Outro padrão possível - procurar arrays com strings numéricas
          for (const innerItem of subItem) {
            if (Array.isArray(innerItem) && innerItem.length >= 1) {
              const levelCandidate = String(innerItem[0]).trim();
              if (
                /^\d+$/.test(levelCandidate) ||
                levelCandidate.includes('RCM') ||
                levelCandidate.includes('Prep')
              ) {
                if (!difficultyLevel) {
                  // Só pegar se ainda não achou
                  difficultyLevel = levelCandidate;
                  console.log(
                    `✅ Nível encontrado (padrão 2): "${difficultyLevel}"`
                  );
                  break;
                }
              }
            }
          }
        }
      }

      // 🎯 BUSCAR TÍTULO E SOURCEID
      // Procurar por padrão [true, [title_with_composer, sourceId], display_title, ...]
      for (const subItem of item) {
        if (
          Array.isArray(subItem) &&
          subItem.length >= 3 &&
          subItem[0] === true
        ) {
          if (Array.isArray(subItem[1]) && subItem[1].length >= 2) {
            const titleWithComposer = subItem[1][0];
            sourceId = subItem[1][1];

            // Extrair título (remover compositor entre parênteses no final)
            const titleMatch = titleWithComposer.match(
              /^(.+?)\s*\([^)]+\)\s*$/
            ) || [null, titleWithComposer];
            workTitle = (titleMatch[1] || titleWithComposer).trim();

            console.log(
              `✅ Título/SourceID encontrados: "${workTitle}" / "${sourceId}"`
            );
            break;
          }
        }
      }

      // 🎯 BUSCAR COMPOSITOR
      // O compositor geralmente aparece como string simples no final
      for (let i = item.length - 1; i >= 0; i--) {
        const candidate = item[i];
        if (typeof candidate === 'string' && candidate.length > 3) {
          // Verificar se parece com nome de compositor (contém vírgula ou nome/sobrenome)
          if (candidate.includes(',') || candidate.split(' ').length >= 2) {
            composerName = candidate.trim();
            console.log(`✅ Compositor encontrado: "${composerName}"`);
            break;
          }
        }
      }

      // Construir dados de dificuldade
      if (difficultyLevel) {
        if (
          difficultyLevel.includes('RCM') ||
          difficultyLevel.includes('Prep')
        ) {
          difficultySystem = 'RCM';
          difficultyRating = `RCM ${difficultyLevel}`;
        } else if (difficultyLevel.includes('ABRSM')) {
          difficultySystem = 'ABRSM';
          difficultyRating = `ABRSM ${difficultyLevel}`;
        } else {
          difficultyRating = `Lvl ${difficultyLevel}`;
        }
      }

      // Construir permlink
      if (sourceId) {
        workLink = `https://imslp.org/wiki/Special:ImagefromIndex/${sourceId}`;
      }

      console.log(`\n🎯 RESULTADO FINAL:`, {
        workTitle,
        composerName,
        sourceId,
        difficultyLevel,
        difficultySystem,
        difficultyRating,
      });

      // Validar dados mínimos
      if (!workTitle || !composerName || !sourceId || !difficultyLevel) {
        console.log(
          `❌ Dados incompletos - Título: "${workTitle}", Compositor: "${composerName}", SourceID: "${sourceId}", Nível: "${difficultyLevel}"`
        );
        console.log(
          `❌ Item completo para debug:`,
          JSON.stringify(item, null, 2)
        );
        return null;
      }

      const entry = {
        workTitle: this.cleanText(workTitle),
        composerName: this.cleanText(composerName),
        workLink,
        permlink: workLink,
        sourceId,
        difficultyLevel,
        difficultySystem,
        difficultyRating,
        rawData: item,
      };

      console.log(`🎉 ENTRY CRIADA COM SUCESSO:`, entry);
      return entry;
    } catch (error) {
      console.error('❌ Erro ao parsear item:', error);
      console.log('❌ Item que causou erro:', JSON.stringify(item, null, 2));
      return null;
    }
  }

  // 🎯 MÉTODO 2: FALLBACK HTML SCRAPING
  extractHTMLData($: cheerio.CheerioAPI): DifficultyEntry[] {
    const entries: DifficultyEntry[] = [];

    // Buscar linhas da tabela de dificuldade
    $('tr').each((index, element) => {
      try {
        const row = $(element);

        // Verificar se é uma linha de dados válida
        const levelSpan = row.find('[id^="diffmt_difflevel-"]');
        if (levelSpan.length === 0) return;

        // Extrair nível de dificuldade
        const difficultyLevel = levelSpan.text().trim();
        if (!difficultyLevel) return;

        // Extrair link da obra
        const workLink = row.find('a[href*="IMSLP"]').first();
        if (workLink.length === 0) return;

        const href = workLink.attr('href') || '';
        const workTitle = workLink.text().trim();

        // Extrair sourceId do link
        const sourceIdMatch = href.match(/#IMSLP(\d+)/);
        if (!sourceIdMatch) return;
        const sourceId = sourceIdMatch[1];

        // Extrair compositor
        const composerLink = row.find('a[href*="/wiki/Category:"]');
        const composerName = composerLink.text().trim();

        if (!workTitle || !composerName || !sourceId) return;

        const entry: DifficultyEntry = {
          workTitle: this.cleanText(workTitle),
          composerName: this.cleanText(composerName),
          workLink: href.startsWith('/') ? `https://imslp.org${href}` : href,
          permlink: href.startsWith('/') ? `https://imslp.org${href}` : href,
          sourceId,
          difficultyLevel,
          difficultySystem: 'IMSLP',
          difficultyRating: `Lvl ${difficultyLevel}`,
        };

        entries.push(entry);
        console.log(
          `✅ HTML: ${entry.workTitle} (${entry.composerName}) - ${entry.difficultyRating}`
        );
      } catch (error) {
        console.error('❌ Erro ao processar linha HTML:', error);
      }
    });

    return entries;
  }

  // 🧹 LIMPAR TEXTO
  cleanText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-.,()]/g, ' ')
      .trim();
  }

  // 📊 ATUALIZAR INFO DE PAGINAÇÃO
  updatePaginationInfo($: cheerio.CheerioAPI): void {
    try {
      // Buscar informações de paginação
      const paginationText = $('.fnxtnumpgs').text().trim();
      if (paginationText) {
        const totalPagesMatch = paginationText.match(/(\d+)/);
        if (totalPagesMatch) {
          this.state.totalPages = parseInt(totalPagesMatch[1]) || 1;
        }
      }

      // Página atual
      const currentPageInput = $('.fnxtpgn');
      if (currentPageInput.length > 0) {
        this.state.currentPage =
          parseInt(currentPageInput.attr('value') || '1') || 1;
      }

      // Items por página
      const selectedOption = $('.fnxtnumrows option[selected]');
      if (selectedOption.length > 0) {
        this.state.itemsPerPage = parseInt(selectedOption.text()) || 100;
      }

      console.log(
        `📊 Paginação atualizada: Página ${this.state.currentPage}/${this.state.totalPages} (${this.state.itemsPerPage} por página)`
      );
    } catch (error) {
      console.error('❌ Erro ao atualizar paginação:', error);
    }
  }

  // 🔍 BUSCAR OBRA NO BANCO DE DADOS - VERSÃO MELHORADA
  async findWorkInDatabase(entry: DifficultyEntry): Promise<{
    workId: string;
    workTitle: string;
    currentDifficulty?: string;
    hasWorkScore: boolean;
  } | null> {
    try {
      // 🎯 ESTRATÉGIA 1: Buscar por sourceId no WorkScore
      let workScore = await prisma.workScore.findFirst({
        where: {
          sourceId: entry.sourceId,
        },
        include: {
          work: {
            select: {
              id: true,
              title: true,
              imslpDifficultyRating: true,
              imslpPermlink: true,
            },
          },
        },
      });

      if (workScore?.work) {
        console.log(`🎯 Encontrado por sourceId: ${workScore.work.title}`);
        return {
          workId: workScore.work.id,
          workTitle: workScore.work.title,
          currentDifficulty: workScore.work.imslpDifficultyRating || undefined,
          hasWorkScore: true,
        };
      }

      // 🎯 ESTRATÉGIA 2: Buscar por permlink similar
      const permlink = entry.permlink.replace('https://imslp.org', '');
      let work = await prisma.work.findFirst({
        where: {
          OR: [
            { imslpPermlink: { contains: entry.sourceId } },
            { imslpId: entry.sourceId },
            { imslpPermlink: { contains: permlink } },
          ],
        },
        select: {
          id: true,
          title: true,
          imslpDifficultyRating: true,
        },
      });

      if (work) {
        console.log(`🎯 Encontrado por permlink: ${work.title}`);

        // Verificar se tem WorkScore
        const hasWorkScore = await prisma.workScore.findFirst({
          where: {
            workId: work.id,
            sourceId: entry.sourceId,
          },
        });

        return {
          workId: work.id,
          workTitle: work.title,
          currentDifficulty: work.imslpDifficultyRating || undefined,
          hasWorkScore: !!hasWorkScore,
        };
      }

      // 🎯 ESTRATÉGIA 3: Buscar por título e compositor
      work = await prisma.work.findFirst({
        where: {
          AND: [
            {
              OR: [
                { title: { contains: entry.workTitle, mode: 'insensitive' } },
                {
                  title: {
                    contains: entry.workTitle.split(',')[0],
                    mode: 'insensitive',
                  },
                },
                {
                  title: {
                    contains: entry.workTitle.split('(')[0].trim(),
                    mode: 'insensitive',
                  },
                },
              ],
            },
            {
              composer: {
                OR: [
                  {
                    name: { contains: entry.composerName, mode: 'insensitive' },
                  },
                  {
                    fullName: {
                      contains: entry.composerName,
                      mode: 'insensitive',
                    },
                  },
                  {
                    alternativeNames: {
                      contains: entry.composerName,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          ],
        },
        select: {
          id: true,
          title: true,
          imslpDifficultyRating: true,
        },
      });

      if (work) {
        console.log(`🎯 Encontrado por título/compositor: ${work.title}`);

        const hasWorkScore = await prisma.workScore.findFirst({
          where: {
            workId: work.id,
            sourceId: entry.sourceId,
          },
        });

        return {
          workId: work.id,
          workTitle: work.title,
          currentDifficulty: work.imslpDifficultyRating || undefined,
          hasWorkScore: !!hasWorkScore,
        };
      }

      console.log(
        `❌ Não encontrado: ${entry.workTitle} (${entry.composerName}) - SourceID: ${entry.sourceId}`
      );
      return null;
    } catch (error) {
      console.error(`❌ Erro ao buscar obra "${entry.workTitle}":`, error);
      return null;
    }
  }

  // 📋 ANALISAR DADOS (DRY RUN)
  async analyzeData(): Promise<void> {
    console.log('\n📋 ANÁLISE DOS DADOS ENCONTRADOS:');
    console.log('='.repeat(80));

    const analysis = {
      totalEntries: this.foundEntries.length,
      totalMatched: this.matchedWorks.length,
      byDifficultyLevel: {} as Record<string, number>,
      bySystems: {} as Record<string, number>,
      matchedWithWorkScore: 0,
      matchedWithoutWorkScore: 0,
      alreadyHasDifficulty: 0,
      newDifficulties: 0,
      composers: new Set<string>(),
    };

    // 📊 PROCESSAR ESTATÍSTICAS
    for (const entry of this.foundEntries) {
      analysis.byDifficultyLevel[entry.difficultyLevel] =
        (analysis.byDifficultyLevel[entry.difficultyLevel] || 0) + 1;
      analysis.bySystems[entry.difficultySystem] =
        (analysis.bySystems[entry.difficultySystem] || 0) + 1;
      analysis.composers.add(entry.composerName);
    }

    for (const match of this.matchedWorks) {
      if (match.hasWorkScore) {
        analysis.matchedWithWorkScore++;
      } else {
        analysis.matchedWithoutWorkScore++;
      }

      if (match.currentDifficulty) {
        analysis.alreadyHasDifficulty++;
      } else {
        analysis.newDifficulties++;
      }
    }

    // 📋 RELATÓRIO
    console.log(`📊 ESTATÍSTICAS GERAIS:`);
    console.log(`   Total de entradas encontradas: ${analysis.totalEntries}`);
    console.log(
      `   Total de obras encontradas no banco: ${analysis.totalMatched}`
    );
    console.log(
      `   Taxa de correspondência: ${(
        (analysis.totalMatched / analysis.totalEntries) *
        100
      ).toFixed(1)}%`
    );
    console.log(`   Compositores únicos: ${analysis.composers.size}`);

    console.log(`\n🎯 CORRESPONDÊNCIAS:`);
    console.log(`   Com WorkScore: ${analysis.matchedWithWorkScore}`);
    console.log(`   Sem WorkScore: ${analysis.matchedWithoutWorkScore}`);
    console.log(`   Já têm dificuldade: ${analysis.alreadyHasDifficulty}`);
    console.log(`   Receberão nova dificuldade: ${analysis.newDifficulties}`);

    console.log(`\n📈 POR NÍVEL DE DIFICULDADE:`);
    Object.entries(analysis.byDifficultyLevel)
      .sort(([a], [b]) => {
        const numA = parseInt(a) || 999;
        const numB = parseInt(b) || 999;
        return numA - numB;
      })
      .forEach(([level, count]) => {
        console.log(`   Nível ${level}: ${count} obras`);
      });

    console.log(`\n🏷️ POR SISTEMA:`);
    Object.entries(analysis.bySystems).forEach(([system, count]) => {
      console.log(`   ${system}: ${count} obras`);
    });

    // 💾 SALVAR ANÁLISE DETALHADA
    await fs.writeFile(
      RESULTS_FILE,
      JSON.stringify(
        {
          analysis,
          foundEntries: this.foundEntries,
          matchedWorks: this.matchedWorks,
          generatedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );

    console.log(`\n💾 Análise detalhada salva em: ${RESULTS_FILE}`);
  }

  // ✍️ APLICAR ALTERAÇÕES (MODO REAL)
  async applyChanges(): Promise<void> {
    console.log('\n✍️ APLICANDO ALTERAÇÕES NO BANCO DE DADOS:');
    console.log('='.repeat(80));

    let updateCount = 0;
    let errorCount = 0;

    for (const match of this.matchedWorks) {
      try {
        const { entry, workId, currentDifficulty } = match;

        // Mapear nível IMSLP para enum
        const mappedEnum = this.mapIMSLPToEnum(
          entry.difficultyLevel,
          entry.difficultySystem
        );

        // Só atualizar se não tem dificuldade ou é diferente
        const shouldUpdate =
          !currentDifficulty || currentDifficulty !== entry.difficultyRating;

        if (shouldUpdate) {
          await prisma.work.update({
            where: { id: workId },
            data: {
              // Enum existente
              difficultyLevel: mappedEnum,

              // Dados detalhados IMSLP
              imslpDifficultyLevel: entry.difficultyLevel,
              imslpDifficultySystem: entry.difficultySystem,
              imslpDifficultyRating: entry.difficultyRating,
              imslpSourceId: entry.sourceId,
            },
          });

          updateCount++;
          console.log(
            `✅ Atualizado: ${entry.workTitle} → Enum: ${mappedEnum}, IMSLP: ${entry.difficultyRating}`
          );
        } else {
          console.log(
            `⏭️ Ignorado (já tem): ${entry.workTitle} → ${currentDifficulty}`
          );
        }

        // Delay entre atualizações
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        errorCount++;
        console.error(
          `❌ Erro ao atualizar "${match.entry.workTitle}":`,
          error
        );
      }
    }

    console.log(`\n📊 RESULTADO DAS ATUALIZAÇÕES:`);
    console.log(`   Atualizadas: ${updateCount}`);
    console.log(`   Erros: ${errorCount}`);
    console.log(`   Total processadas: ${this.matchedWorks.length}`);
  }

  // 🎯 MAPEAMENTO IMSLP -> ENUM
  private mapIMSLPToEnum(
    imslpLevel: string,
    system: string = 'IMSLP'
  ): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
    // Para sistema RCM
    if (system === 'RCM') {
      const beginnerRCM = ['Prep A', 'Prep B', '1', '2'];
      const intermediateRCM = ['3', '4', '5', '6', '7'];
      const advancedRCM = ['8', '9', '10'];

      if (beginnerRCM.includes(imslpLevel)) return 'BEGINNER';
      if (intermediateRCM.includes(imslpLevel)) return 'INTERMEDIATE';
      if (advancedRCM.includes(imslpLevel)) return 'ADVANCED';
    }

    // Para sistema IMSLP (padrão)
    const levelNum = parseInt(imslpLevel);
    if (!isNaN(levelNum)) {
      if (levelNum <= 4) return 'BEGINNER';
      if (levelNum <= 8) return 'INTERMEDIATE';
      return 'ADVANCED';
    }

    // Fallback
    return 'BEGINNER';
  }

  // 🚀 EXECUTAR SCRAPER PRINCIPAL
  async run(): Promise<void> {
    console.log(
      `🚀 Iniciando IMSLP Difficulty Scraper CORRIGIDO (${
        this.dryRun ? 'DRY RUN' : 'MODO REAL'
      })`
    );

    await this.loadState();

    if (this.state.isRunning) {
      console.log(
        '⚠️ Scraper já está rodando. Pare o processo anterior primeiro.'
      );
      return;
    }

    this.state.isRunning = true;
    this.shouldStop = false;
    await this.saveState();

    try {
      // 📋 FASE 1: COLETAR DADOS
      console.log('\n📋 FASE 1: Coletando dados do IMSLP...');

      // Começar com apenas algumas páginas para teste
      const maxPagesToTest = this.dryRun ? 3 : this.state.totalPages;

      for (
        let page = this.state.currentPage;
        page <= Math.min(maxPagesToTest, this.state.totalPages) &&
        !this.shouldStop;
        page++
      ) {
        console.log(
          `\n📖 Processando página ${page}/${this.state.totalPages}...`
        );

        const entries = await this.fetchDifficultyPage(page);
        this.foundEntries.push(...entries);
        this.state.totalProcessed += entries.length;

        console.log(
          `📊 Página ${page}: ${entries.length} entradas encontradas`
        );

        // Atualizar estado
        this.state.currentPage = page;
        await this.saveState();

        // Delay entre páginas
        if (page < Math.min(maxPagesToTest, this.state.totalPages)) {
          console.log(
            `⏳ Aguardando ${
              DELAY_BETWEEN_PAGES / 1000
            }s antes da próxima página...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, DELAY_BETWEEN_PAGES)
          );
        }
      }

      // 🔍 FASE 2: CORRESPONDER COM BANCO DE DADOS
      console.log(
        '\n🔍 FASE 2: Buscando correspondências no banco de dados...'
      );

      for (const entry of this.foundEntries) {
        const match = await this.findWorkInDatabase(entry);
        if (match) {
          this.matchedWorks.push({ entry, ...match });
          this.state.totalMatched++;
        }

        // Delay entre buscas
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // 📊 FASE 3: ANÁLISE
      await this.analyzeData();

      // ✍️ FASE 4: APLICAR (só se não for dry run)
      if (!this.dryRun) {
        console.log('\n✍️ FASE 4: Aplicando alterações...');
        await this.applyChanges();
      } else {
        console.log('\n🔍 DRY RUN CONCLUÍDO - Nenhuma alteração foi feita.');
        console.log(
          'Para aplicar as alterações, execute: npm run difficulty-scraper apply'
        );
      }

      console.log('\n🎉 SCRAPER CONCLUÍDO COM SUCESSO!');
    } catch (error) {
      console.error('❌ Erro fatal no scraper:', error);
    } finally {
      this.state.isRunning = false;
      await this.saveState();
      await prisma.$disconnect();
    }
  }

  // 🛑 PARAR GRACIOSAMENTE
  async stop(): Promise<void> {
    console.log('🛑 Parando scraper...');
    this.shouldStop = true;
    this.state.isRunning = false;
    await this.saveState();
    console.log('✅ Scraper parado.');
  }

  // 🔄 RESETAR ESTADO
  async reset(): Promise<void> {
    console.log('🔄 Resetando estado...');
    this.state = {
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 100,
      totalProcessed: 0,
      totalMatched: 0,
      totalUpdated: 0,
      lastUpdate: new Date().toISOString(),
      isRunning: false,
    };
    this.foundEntries = [];
    this.matchedWorks = [];
    await this.saveState();
    console.log('✅ Estado resetado.');
  }

  // 📊 STATUS
  async status(): Promise<void> {
    await this.loadState();
    console.log('📊 Status do Difficulty Scraper:');
    console.log(
      `   Página atual: ${this.state.currentPage}/${this.state.totalPages}`
    );
    console.log(`   Total processado: ${this.state.totalProcessed}`);
    console.log(`   Total correspondências: ${this.state.totalMatched}`);
    console.log(`   Rodando: ${this.state.isRunning ? 'Sim' : 'Não'}`);
    console.log(`   Última atualização: ${this.state.lastUpdate}`);
    console.log(`   Modo: ${this.dryRun ? 'DRY RUN' : 'APLICAÇÃO REAL'}`);
  }
}

// 🎯 FUNÇÃO PRINCIPAL
async function main() {
  const command = process.argv[2];
  const isDryRun = command !== 'apply';

  const scraper = new IMSLPDifficultyScraperFixed(isDryRun);

  switch (command) {
    case 'start':
    case 'analyze':
      console.log('🔍 Iniciando análise (DRY RUN)...');
      await scraper.run();
      break;

    case 'apply':
      console.log('⚠️ ATENÇÃO: Modo de aplicação real!');
      console.log('Pressione Ctrl+C nos próximos 5 segundos para cancelar...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await scraper.run();
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
      console.log('📋 Comandos disponíveis:');
      console.log('  npm run difficulty-scraper start   - Analisar (DRY RUN)');
      console.log(
        '  npm run difficulty-scraper apply   - Aplicar alterações (REAL)'
      );
      console.log('  npm run difficulty-scraper status  - Ver status');
      console.log('  npm run difficulty-scraper reset   - Resetar estado');
      console.log('  npm run difficulty-scraper stop    - Parar execução');
  }
}

// 🎛️ HANDLERS DE SINAL
process.on('SIGINT', async () => {
  console.log('\n🛑 Interrupção detectada...');
  process.exit(0);
});

if (require.main === module) {
  main().catch(console.error);
}

export default IMSLPDifficultyScraperFixed;
