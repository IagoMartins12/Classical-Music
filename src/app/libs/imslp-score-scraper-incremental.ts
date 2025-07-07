// app/libs/imslp-score-scraper-incremental.ts - Versão com Carregamento por Tab Específica
import * as cheerio from 'cheerio';
import { AnyNode } from 'domhandler';
import { IMSLPBatchProcessorOptimized } from './imslp-batch-processor-optimized';

export interface IMSLPWorkScoresIncremental {
  workTitle: string;
  scoresByType: IMSLPScoresByType;
  totalCounts: {
    scores: number;
    parts: number;
    arrangements: number;
    librettos: number;
    others: number;
    sources: number;
  };
  loadedCounts: {
    scores: number;
    parts: number;
    arrangements: number;
    librettos: number;
    others: number;
    sources: number;
  };
  hasMore: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
  };
}

export interface IMSLPScore {
  id: string;
  title: string;
  downloadUrl: string;
  fileSize: string;
  pageCount: string;
  rating?: number;
  ratingsCount?: number;
  downloadCount?: number;
  fileFormat: string;
  editor?: string;
  publisher?: string;
  publisherInfo?: string;
  copyright?: string;
  thumbnailUrl?: string;
  uploadDate?: string;
  uploader?: string;
  notes?: string;
  type:
    | 'scores'
    | 'parts'
    | 'arrangements'
    | 'librettos'
    | 'others'
    | 'sources';
  groupIndex?: number;
}

export interface IMSLPScoreGroup {
  groupIndex: number;
  scores: IMSLPScore[];
  groupTitle?: string;
}

export interface IMSLPScoresByType {
  scores: IMSLPScoreGroup[];
  parts: IMSLPScoreGroup[];
  arrangements: IMSLPScoreGroup[];
  librettos: IMSLPScoreGroup[];
  others: IMSLPScoreGroup[];
  sources: IMSLPScoreGroup[];
}

export interface PaginationOptions {
  limit?: number; // Partituras por tipo (padrão: 5)
  offset?: number; // Offset por tipo (padrão: 0)
  loadInBackground?: boolean; // Se deve cachear o resto (padrão: true)
  specificTypes?: string[]; // Tipos específicos para carregar
  targetTabType?: string; // 🆕 Tab específica para carregar (prioridade sobre specificTypes)
}

export class IMSLPScraperIncremental {
  private static readonly TAB_TYPE_MAP = {
    tabScore1: 'scores' as const,
    tabScore3: 'parts' as const,
    tabArrTrans: 'arrangements' as const,
    tabScore4: 'librettos' as const,
    tabScore5: 'others' as const,
    tabScore6: 'sources' as const,
  };

  private static readonly DEFAULT_INITIAL_LIMIT = 5;
  private static readonly DEFAULT_MORE_LIMIT = 20;

  /**
   * 🚀 Extração INCREMENTAL de partituras com paginação e suporte a tab específica
   */
  static async extractScoresIncremental(
    html: string,
    options: PaginationOptions = {}
  ): Promise<IMSLPWorkScoresIncremental> {
    const {
      limit = this.DEFAULT_INITIAL_LIMIT,
      offset = 0,
      specificTypes,
      targetTabType, // 🆕 Tab específica para priorizar
    } = options;

    const $ = cheerio.load(html);

    // Verificar se a página foi carregada corretamente
    const pageTitle = $('title').text();
    if (
      pageTitle.includes('Access denied') ||
      pageTitle.includes('403') ||
      pageTitle.includes('Forbidden')
    ) {
      throw new Error('Acesso negado pelo IMSLP - possível bloqueio de IP');
    }

    console.log(
      `🎼 [SCRAPER-TAB] Carregamento incremental: limite=${limit}, offset=${offset}, tab=${
        targetTabType || 'todas'
      }`
    );

    // 1️⃣ PRIMEIRA FASE: Extrair contadores totais das abas
    const totalCounts = this.extractTabCounts($);
    console.log(`📊 [SCRAPER-TAB] Contadores totais:`, totalCounts);

    // 2️⃣ SEGUNDA FASE: Preparar estrutura de dados
    const scoresByType: IMSLPScoresByType = {
      scores: [],
      parts: [],
      arrangements: [],
      librettos: [],
      others: [],
      sources: [],
    };

    const loadedCounts = {
      scores: 0,
      parts: 0,
      arrangements: 0,
      librettos: 0,
      others: 0,
      sources: 0,
    };

    // 3️⃣ TERCEIRA FASE: Determinar tipos a processar baseado na estratégia
    let typesToProcess: string[];

    if (targetTabType) {
      // 🆕 MODO TAB ESPECÍFICA: processar apenas a tab solicitada
      typesToProcess = [targetTabType];
      console.log(
        `🎯 [SCRAPER-TAB] Modo tab específica: processando apenas "${targetTabType}"`
      );
    } else if (specificTypes) {
      // MODO TIPOS ESPECÍFICOS: processar apenas os tipos solicitados
      typesToProcess = specificTypes;
      console.log(`🔍 [SCRAPER-TAB] Modo tipos específicos:`, specificTypes);
    } else {
      // MODO PADRÃO: processar todos os tipos disponíveis
      typesToProcess = Object.values(this.TAB_TYPE_MAP);
      console.log(`📂 [SCRAPER-TAB] Modo padrão: processando todos os tipos`);
    }

    // 4️⃣ QUARTA FASE: Processar cada tipo com paginação otimizada
    for (const [tabId, type] of Object.entries(this.TAB_TYPE_MAP)) {
      if (!typesToProcess.includes(type)) continue;

      const tabContentId = tabId.replace('_tab', '');
      const $tabContent = $(`#${tabContentId}`);

      if ($tabContent.length > 0 && totalCounts[type] > 0) {
        console.log(
          `🔄 [SCRAPER-TAB] Processando tipo "${type}" (${totalCounts[type]} total)`
        );

        // 🆕 Ajustar limite dinamicamente para tab específica
        let effectiveLimit = limit;
        let effectiveOffset = offset;

        if (targetTabType === type) {
          // Para tab específica, usar limite completo
          effectiveLimit = limit;
          effectiveOffset = offset;
          console.log(
            `🎯 [SCRAPER-TAB] Tab específica "${type}": limit=${effectiveLimit}, offset=${effectiveOffset}`
          );
        } else if (!targetTabType) {
          // Para modo geral, usar limite distribuído
          effectiveLimit = limit;
          effectiveOffset = offset;
        }

        const scoresInTab = await this.extractScoresFromTabPaginated(
          $,
          $tabContent,
          type,
          { limit: effectiveLimit, offset: effectiveOffset }
        );

        scoresByType[type] = scoresInTab;
        loadedCounts[type] = this.countScoresInGroups(scoresInTab);

        console.log(
          `✅ [SCRAPER-TAB] Tipo "${type}": ${loadedCounts[type]}/${totalCounts[type]} carregadas`
        );
      }
    }

    // 5️⃣ QUINTA FASE: Calcular paginação e estado final
    const totalLoaded = Object.values(loadedCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const totalAvailable = Object.values(totalCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    // 🆕 Calcular hasMore baseado na estratégia
    let hasMore = false;
    if (targetTabType) {
      // Para tab específica, verificar apenas essa tab
      const tabLoaded =
        loadedCounts[targetTabType as keyof typeof loadedCounts] || 0;
      const tabTotal =
        totalCounts[targetTabType as keyof typeof totalCounts] || 0;
      hasMore = tabLoaded < tabTotal;
    } else {
      // Para modo geral, verificar total
      hasMore = totalLoaded < totalAvailable;
    }

    const workTitle = this.extractWorkTitle($);

    const result: IMSLPWorkScoresIncremental = {
      workTitle,
      scoresByType,
      totalCounts,
      loadedCounts,
      hasMore,
      pagination: {
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(Math.max(...Object.values(totalCounts)) / limit),
        itemsPerPage: limit,
      },
    };

    console.log(
      `🎯 [SCRAPER-TAB] Resultado: ${totalLoaded}/${totalAvailable} partituras, hasMore: ${hasMore}, modo: ${
        targetTabType || 'geral'
      }`
    );

    return result;
  }

  /**
   * 🚀 Extração COMPLETA para cache em background
   */
  static async extractAllScoresForCache(
    html: string
  ): Promise<IMSLPWorkScoresIncremental> {
    console.log(`💾 [SCRAPER-CACHE] Iniciando extração completa para cache`);

    // Usar limite alto para pegar tudo de uma vez
    return this.extractScoresIncremental(html, {
      limit: 1000, // Limite alto
      offset: 0,
      loadInBackground: false, // Não precisamos de background no background 😄
    });
  }

  /**
   * 🆕 Extração específica para uma tab com otimizações
   */
  static async extractScoresForSpecificTab(
    html: string,
    tabType: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<IMSLPWorkScoresIncremental> {
    const { limit = this.DEFAULT_MORE_LIMIT, offset = 0 } = options;

    console.log(`🎯 [SCRAPER-TAB] Extração específica para tab "${tabType}"`);

    return this.extractScoresIncremental(html, {
      limit,
      offset,
      targetTabType: tabType,
      loadInBackground: false, // Carregamento específico não precisa de background
    });
  }

  /**
   * 🚀 Extração de partituras de uma aba com paginação otimizada
   */
  private static async extractScoresFromTabPaginated(
    $: cheerio.CheerioAPI,
    $tabContent: cheerio.Cheerio<AnyNode>,
    type: IMSLPScore['type'],
    options: { limit: number; offset: number }
  ): Promise<IMSLPScoreGroup[]> {
    const { limit, offset } = options;
    const scoreGroups: IMSLPScoreGroup[] = [];

    // 🆕 Coletar todos os grupos COM seus títulos de seção
    const groups: {
      element: cheerio.Cheerio<AnyNode>;
      index: number;
      sectionTitle: string | null; // 🆕 Título da seção (h5)
    }[] = [];

    $tabContent.find('.we').each((groupIndex, groupElement) => {
      const $groupElement = $(groupElement);

      // 🆕 Buscar o título da seção (h5) que precede este grupo
      let sectionTitle: string | null = null;

      // Buscar o h5 anterior mais próximo
      let $prev = $groupElement.prev();
      while ($prev.length > 0) {
        if ($prev.is('h5')) {
          // Encontrou o h5, extrair o título
          const titleText = $prev.find('span.mw-headline').text().trim();
          if (titleText) {
            sectionTitle = titleText;
            console.log(
              `🏷️ [SCRAPER-SECTION] Grupo ${groupIndex} - Título: "${titleText}"`
            );
          }
          break;
        }
        $prev = $prev.prev();
      }

      // Se não encontrou h5 anterior, buscar na estrutura pai
      if (!sectionTitle) {
        // Buscar h5 antes deste grupo na mesma estrutura
        const $parent = $groupElement.parent();
        $parent.children().each((childIndex, childElement) => {
          const $child = $(childElement);
          if ($child.is($groupElement)) {
            // Chegou no nosso elemento, parar
            return false;
          }
          if ($child.is('h5')) {
            const titleText = $child.find('span.mw-headline').text().trim();
            if (titleText) {
              sectionTitle = titleText;
            }
          }
        });
      }

      groups.push({
        element: $groupElement,
        index: groupIndex,
        sectionTitle,
      });
    });

    console.log(
      `📦 [SCRAPER-SECTION] Encontrados ${groups.length} grupos para tipo "${type}"`
    );

    // 🚀 ESTRATÉGIA DE PAGINAÇÃO OTIMIZADA: Processar partituras de forma linear
    let scoresProcessed = 0;
    let scoresCollected = 0;
    const scoreMetadataList: Array<{
      scoreId: string;
      hiddenLink: string;
      groupIndex: number;
      scoreIndex: number;
      metadata: any;
      sectionTitle: string | null; // 🆕 Título da seção
    }> = [];

    // Percorrer grupos e partituras em ordem
    for (const {
      element: $groupElement,
      index: groupIndex,
      sectionTitle,
    } of groups) {
      const scoreElements: {
        element: cheerio.Cheerio<AnyNode>;
        index: number;
      }[] = [];
      $groupElement.find('[id^="IMSLP"]').each((scoreIndex, scoreElement) => {
        scoreElements.push({ element: $(scoreElement), index: scoreIndex });
      });

      for (const { element: $element, index: scoreIndex } of scoreElements) {
        // Verificar se devemos pular esta partitura (offset)
        if (scoresProcessed < offset) {
          scoresProcessed++;
          continue;
        }

        // Verificar se já coletamos o limite
        if (scoresCollected >= limit) {
          break;
        }

        // Extrair dados da partitura
        const scoreData = this.extractScoreMetadata(
          $,
          $element,
          type,
          groupIndex,
          scoreIndex
        );
        if (scoreData) {
          // 🆕 Adicionar título da seção aos metadados
          scoreMetadataList.push({
            ...scoreData,
            sectionTitle,
          });
          scoresCollected++;
        }

        scoresProcessed++;
      }

      // Se já atingimos o limite, parar
      if (scoresCollected >= limit) {
        break;
      }
    }

    console.log(
      `📋 [SCRAPER-SECTION] Coletadas ${scoresCollected} partituras para processamento`
    );

    // 🚀 PROCESSAR URLs em lote
    if (scoreMetadataList.length > 0) {
      const urlResults = await this.resolveUrlsBatch(scoreMetadataList);

      // Organizar por grupos
      const scoresByGroup = new Map<
        number,
        {
          scores: IMSLPScore[];
          sectionTitle: string | null;
        }
      >();

      for (let i = 0; i < scoreMetadataList.length; i++) {
        const metadata = scoreMetadataList[i];
        const downloadUrl =
          urlResults[i]?.downloadUrl ||
          `https://imslp.org${metadata.hiddenLink}`;

        const score: IMSLPScore = {
          id: metadata.scoreId,
          title: metadata.metadata.title,
          downloadUrl,
          fileSize: metadata.metadata.fileSize,
          pageCount: metadata.metadata.pageCount,
          rating: metadata.metadata.rating,
          ratingsCount: metadata.metadata.ratingsCount,
          downloadCount: metadata.metadata.downloadCount,
          fileFormat: 'PDF',
          editor: metadata.metadata.editor,
          publisher: metadata.metadata.publisher,
          copyright: metadata.metadata.copyright,
          thumbnailUrl: metadata.metadata.thumbnailUrl,
          uploadDate: metadata.metadata.uploadDate,
          uploader: metadata.metadata.uploader,
          notes: metadata.metadata.notes,
          type: metadata.metadata.type,
          groupIndex: metadata.groupIndex,
        };

        if (!scoresByGroup.has(metadata.groupIndex)) {
          scoresByGroup.set(metadata.groupIndex, {
            scores: [],
            sectionTitle: metadata.sectionTitle,
          });
        }
        scoresByGroup.get(metadata.groupIndex)!.scores.push(score);
      }

      // Construir grupos finais com títulos de seção
      for (const [groupIndex, groupData] of scoresByGroup.entries()) {
        if (groupData.scores.length > 0) {
          // 🆕 Usar o título da seção se disponível, senão usar título da primeira partitura
          const finalTitle =
            groupData.sectionTitle || groupData.scores[0].title;

          console.log(
            `🏷️ [SCRAPER-SECTION] Grupo ${groupIndex}: "${finalTitle}" (${groupData.scores.length} partituras)`
          );

          scoreGroups.push({
            groupIndex,
            scores: groupData.scores,
            groupTitle: finalTitle, // 🆕 Título da seção ou fallback
          });
        }
      }
    }

    return scoreGroups;
  }

  /**
   * 🚀 Busca e extração com carregamento incremental
   */
  static async fetchAndExtractScoresIncremental(
    imslpUrl: string,
    options: PaginationOptions = {}
  ): Promise<IMSLPWorkScoresIncremental> {
    try {
      const { targetTabType } = options;
      console.log(
        `🌐 [SCRAPER-TAB] Buscando página IMSLP: ${imslpUrl} (tab: ${
          targetTabType || 'todas'
        })`
      );
      const startTime = Date.now();

      const response = await fetch(imslpUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const fetchTime = Date.now() - startTime;
      console.log(`✅ [SCRAPER-TAB] Página carregada em ${fetchTime}ms`);

      const result = await this.extractScoresIncremental(html, options);

      const totalTime = Date.now() - startTime;
      console.log(
        `🎯 [SCRAPER-TAB] Processamento completo em ${totalTime}ms (tab: ${
          targetTabType || 'todas'
        })`
      );

      return result;
    } catch (error) {
      console.error(`❌ [SCRAPER-TAB] Erro:`, error);
      throw error;
    }
  }

  /**
   * 🆕 Busca específica para uma tab
   */
  static async fetchScoresForTab(
    imslpUrl: string,
    tabType: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<IMSLPWorkScoresIncremental> {
    console.log(`🎯 [SCRAPER-TAB] Busca específica para tab "${tabType}"`);

    return this.fetchAndExtractScoresIncremental(imslpUrl, {
      ...options,
      targetTabType: tabType,
    });
  }

  // === MÉTODOS AUXILIARES ===

  private static extractTabCounts($: cheerio.CheerioAPI) {
    const totalCounts = {
      scores: 0,
      parts: 0,
      arrangements: 0,
      librettos: 0,
      others: 0,
      sources: 0,
    };

    Object.entries(this.TAB_TYPE_MAP).forEach(([tabId, type]) => {
      const countText = $(`#${tabId}_ct`).text();
      totalCounts[type] = countText ? parseInt(countText) : 0;
    });

    return totalCounts;
  }

  private static extractWorkTitle($: cheerio.CheerioAPI): string {
    return (
      $('h1').first().text().trim() ||
      $('#firstHeading').text().trim() ||
      'Obra Desconhecida'
    );
  }

  private static extractScoreMetadata(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<AnyNode>,
    type: IMSLPScore['type'],
    groupIndex: number,
    scoreIndex: number
  ) {
    const scoreId =
      $element.attr('id')?.replace('IMSLP', '') ||
      `${type}_${groupIndex}_${scoreIndex}`;
    const $downloadSection = $element.find('.we_file_download');

    let title = $downloadSection.find('span[title*="Baixar"]').text().trim();
    if (!title) {
      title = $downloadSection.find('.we_file_download_link').text().trim();
    }
    if (!title) {
      title = this.getDefaultTitleByType(type);
    }

    const hiddenLink = $downloadSection
      .find('.we_file_info2 .hidden a')
      .attr('href');

    if (!hiddenLink) return null;

    // Extrair metadados básicos
    const fileInfo = $downloadSection.find('.we_file_info2').text();
    const fileSizeMatch = fileInfo.match(/(\d+\.?\d*)(MB|KB)/);
    const pageCountMatch = fileInfo.match(/(\d+)\s*pp\./);
    const downloadCountMatch = fileInfo.match(/(\d+)×/);

    return {
      scoreId,
      hiddenLink,
      groupIndex,
      scoreIndex,
      metadata: {
        title,
        fileSize: fileSizeMatch ? `${fileSizeMatch[1]}${fileSizeMatch[2]}` : '',
        pageCount: pageCountMatch ? pageCountMatch[1] : '',
        downloadCount: downloadCountMatch
          ? parseInt(downloadCountMatch[1])
          : undefined,
        type,
      },
    };
  }

  private static async resolveUrlsBatch(scoreMetadataList: any[]) {
    const urlRequests = scoreMetadataList.map((item) => ({
      hiddenLink: item.hiddenLink,
      scoreId: item.scoreId,
    }));

    return await IMSLPBatchProcessorOptimized.processBatchAdaptive(urlRequests);
  }

  private static countScoresInGroups(groups: IMSLPScoreGroup[]): number {
    return groups.reduce((total, group) => total + group.scores.length, 0);
  }

  private static getDefaultTitleByType(type: IMSLPScore['type']): string {
    const titles = {
      scores: 'Partitura Completa',
      parts: 'Parte Individual',
      arrangements: 'Arranjo',
      librettos: 'Libreto',
      others: 'Outro Material',
      sources: 'Arquivo Fonte',
    };
    return titles[type];
  }

  /**
   * 🆕 Obter estatísticas de uma tab específica
   */
  static getTabStatistics(
    html: string,
    tabType: string
  ): { total: number; available: boolean } {
    try {
      const $ = cheerio.load(html);
      const totalCounts = this.extractTabCounts($);

      return {
        total: totalCounts[tabType as keyof typeof totalCounts] || 0,
        available: (totalCounts[tabType as keyof typeof totalCounts] || 0) > 0,
      };
    } catch (error) {
      console.error(
        `❌ [SCRAPER-TAB] Erro ao obter estatísticas da tab "${tabType}":`,
        error
      );
      return { total: 0, available: false };
    }
  }

  /**
   * 🆕 Verificar se uma tab tem mais partituras para carregar
   */
  static hasMoreScoresForTab(
    totalCounts: Record<string, number>,
    loadedCounts: Record<string, number>,
    tabType: string
  ): boolean {
    const total = totalCounts[tabType] || 0;
    const loaded = loadedCounts[tabType] || 0;
    return loaded < total;
  }
}
