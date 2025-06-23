// lib/imslp-scraper.ts - Versão Ultra-Otimizada com Novo Sistema
import * as cheerio from 'cheerio';
import { AnyNode, Element } from 'domhandler';
import { IMSLPBatchProcessorOptimized } from './imslp-batch-processor-optimized';
import { IMSLPDirectUrlResolverOptimized } from './imslp-url-resolver';

export interface IMSLPWorkScores {
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

export class IMSLPScraper {
  private static readonly TAB_TYPE_MAP = {
    tabScore1: 'scores' as const,
    tabScore3: 'parts' as const,
    tabArrTrans: 'arrangements' as const,
    tabScore4: 'librettos' as const,
    tabScore5: 'others' as const,
    tabScore6: 'sources' as const,
  };

  /**
   * Extrai informações das partituras de uma página IMSLP
   */
  static async extractScores(html: string): Promise<IMSLPWorkScores> {
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

    // Inicializar estrutura de dados
    const scoresByType: IMSLPScoresByType = {
      scores: [],
      parts: [],
      arrangements: [],
      librettos: [],
      others: [],
      sources: [],
    };

    const totalCounts = {
      scores: 0,
      parts: 0,
      arrangements: 0,
      librettos: 0,
      others: 0,
      sources: 0,
    };

    // Extrair contadores das abas
    Object.entries(this.TAB_TYPE_MAP).forEach(([tabId, type]) => {
      const countText = $(`#${tabId}_ct`).text();
      totalCounts[type] = countText ? parseInt(countText) : 0;
    });

    // Processar cada tipo de aba
    for (const [tabId, type] of Object.entries(this.TAB_TYPE_MAP)) {
      const tabContentId = tabId.replace('_tab', '');
      const $tabContent = $(`#${tabContentId}`);

      if ($tabContent.length > 0) {
        const scoresInTab = await this.extractScoresFromTabOptimized(
          $,
          $tabContent,
          type
        );

        scoresByType[type] = scoresInTab;
      }
    }

    // Extrair título da obra
    const workTitle =
      $('h1').first().text().trim() ||
      $('#firstHeading').text().trim() ||
      'Obra Desconhecida';

    return {
      workTitle,
      scoresByType,
      totalCounts,
    };
  }

  /**
   * 🚀 VERSÃO ULTRA-OTIMIZADA: Extrai partituras com processamento em lote inteligente
   */
  private static async extractScoresFromTabOptimized(
    $: cheerio.CheerioAPI,
    $tabContent: cheerio.Cheerio<AnyNode>,
    type: IMSLPScore['type']
  ): Promise<IMSLPScoreGroup[]> {
    const scoreGroups: IMSLPScoreGroup[] = [];

    // Coletar todos os grupos primeiro
    const groups: { element: cheerio.Cheerio<AnyNode>; index: number }[] = [];
    $tabContent.find('.we').each((groupIndex, groupElement) => {
      groups.push({ element: $(groupElement), index: groupIndex });
    });

    console.log(
      `🎼 [SCRAPER] Processando ${groups.length} grupos para tipo "${type}"`
    );

    // 🚀 FASE 1: Extrair metadados sem fazer requisições de URL
    const scoreMetadataList: Array<{
      scoreId: string;
      hiddenLink: string;
      groupIndex: number;
      scoreIndex: number;
      groupElement: cheerio.Cheerio<AnyNode>;
      metadata: any;
    }> = [];

    for (const { element: $groupElement, index: groupIndex } of groups) {
      const scoreElements: {
        element: cheerio.Cheerio<AnyNode>;
        index: number;
      }[] = [];
      $groupElement.find('[id^="IMSLP"]').each((scoreIndex, scoreElement) => {
        scoreElements.push({ element: $(scoreElement), index: scoreIndex });
      });

      for (const { element: $element, index: scoreIndex } of scoreElements) {
        const scoreId =
          $element.attr('id')?.replace('IMSLP', '') ||
          `${type}_${groupIndex}_${scoreIndex}`;

        // Extrair informações básicas
        const $downloadSection = $element.find('.we_file_download');

        let title = $downloadSection
          .find('span[title*="Baixar"]')
          .text()
          .trim();
        if (!title) {
          title = $downloadSection.find('.we_file_download_link').text().trim();
        }
        if (!title) {
          title = this.getDefaultTitleByType(type);
        }

        // Extrair hiddenLink
        const hiddenLink = $downloadSection
          .find('.we_file_info2 .hidden a')
          .attr('href');

        if (hiddenLink) {
          // Extrair todos os outros metadados
          const fileInfo = $downloadSection.find('.we_file_info2').text();
          const fileSizeMatch = fileInfo.match(/(\d+\.?\d*)(MB|KB)/);
          const pageCountMatch = fileInfo.match(/(\d+)\s*pp\./);
          const downloadCountMatch = fileInfo.match(/(\d+)×/);

          // Extrair rating
          const ratingElement = $downloadSection.find('.current-rating');
          const ratingStyle = ratingElement.attr('style') || '';
          const ratingMatch = ratingStyle.match(/width:\s*(\d+\.?\d*)%/);
          const rating = ratingMatch
            ? parseFloat(ratingMatch[1]) / 10
            : undefined;

          const ratingsCountText = $downloadSection
            .find('[id^="num-of-ratings-"]')
            .text();
          const ratingsCount = ratingsCountText
            ? parseInt(ratingsCountText)
            : undefined;

          // Extrair informações detalhadas
          const $editionTable = $groupElement
            .find('.we_edition_info table')
            .first();
          const editor = this.extractTableValue($, $editionTable, 'Editor');
          const publisher = this.extractTableValue(
            $,
            $editionTable,
            'Informação da editora'
          );
          const copyright = this.extractTableValue(
            $,
            $editionTable,
            'Direitos autorais'
          );
          const notes = this.extractTableValue(
            $,
            $editionTable,
            'Notas diversas'
          );

          // Extrair thumbnail
          const thumbnailUrl = this.extractThumbnailUrl($, $element);

          // Extrair informações do uploader
          const $fileInfo = $element.find('.we_file_info');
          const uploaderInfo = $fileInfo.find('.mh555').text();
          const uploaderMatch = uploaderInfo.match(
            /digitalizado por ([^\n]+)\n/
          );
          const uploader = uploaderMatch ? uploaderMatch[1].trim() : undefined;

          const uploadDateMatch = uploaderInfo.match(/\(([^)]+)\)$/);
          const uploadDate = uploadDateMatch ? uploadDateMatch[1] : undefined;

          scoreMetadataList.push({
            scoreId,
            hiddenLink,
            groupIndex,
            scoreIndex,
            groupElement: $groupElement,
            metadata: {
              title,
              fileSize: fileSizeMatch
                ? `${fileSizeMatch[1]}${fileSizeMatch[2]}`
                : '',
              pageCount: pageCountMatch ? pageCountMatch[1] : '',
              rating,
              ratingsCount,
              downloadCount: downloadCountMatch
                ? parseInt(downloadCountMatch[1])
                : undefined,
              editor,
              publisher,
              copyright,
              thumbnailUrl,
              uploadDate,
              uploader,
              notes,
              type,
            },
          });
        }
      }
    }

    // 🚀 FASE 2: Resolver URLs em lote com processamento inteligente
    if (scoreMetadataList.length > 0) {
      const urlRequests = scoreMetadataList.map((item) => ({
        hiddenLink: item.hiddenLink,
        scoreId: item.scoreId,
      }));

      console.log(
        `🔗 [SCRAPER] Resolvendo ${urlRequests.length} URLs em lote...`
      );
      const startTime = Date.now();

      // 🚀 Usar o processador em lote otimizado com estratégia adaptativa
      const urlResults =
        await IMSLPBatchProcessorOptimized.processBatchAdaptive(urlRequests);

      const endTime = Date.now();
      console.log(
        `✅ [SCRAPER] URLs resolvidos em ${endTime - startTime}ms (${Math.round(
          (endTime - startTime) / urlRequests.length
        )}ms por URL)`
      );

      // 📊 Análise de performance do lote
      const performance =
        IMSLPBatchProcessorOptimized.analyzePerformance(urlResults);
      console.log(`📊 [SCRAPER] ${performance.summary}`);

      if (performance.recommendations.length > 0) {
        console.log(`💡 [SCRAPER] Recomendações:`);
        performance.recommendations.forEach((rec) =>
          console.log(`   - ${rec}`)
        );
      }

      // Criar mapa de resultados para lookup rápido
      const urlMap = new Map(
        urlResults.map((result) => [result.scoreId, result.downloadUrl])
      );

      // 🚀 FASE 3: Construir objetos Score finais
      const scoresByGroup = new Map<number, IMSLPScore[]>();

      for (const item of scoreMetadataList) {
        const downloadUrl =
          urlMap.get(item.scoreId) || `https://imslp.org${item.hiddenLink}`;

        const score: IMSLPScore = {
          id: item.scoreId,
          title: item.metadata.title,
          downloadUrl: downloadUrl,
          fileSize: item.metadata.fileSize,
          pageCount: item.metadata.pageCount,
          rating: item.metadata.rating,
          ratingsCount: item.metadata.ratingsCount,
          downloadCount: item.metadata.downloadCount,
          fileFormat: 'PDF',
          editor: item.metadata.editor,
          publisher: item.metadata.publisher,
          copyright: item.metadata.copyright,
          thumbnailUrl: item.metadata.thumbnailUrl,
          uploadDate: item.metadata.uploadDate,
          uploader: item.metadata.uploader,
          notes: item.metadata.notes,
          type: item.metadata.type,
          groupIndex: item.groupIndex,
        };

        // Agrupar por groupIndex
        if (!scoresByGroup.has(item.groupIndex)) {
          scoresByGroup.set(item.groupIndex, []);
        }
        scoresByGroup.get(item.groupIndex)!.push(score);
      }

      // Construir grupos finais
      for (const [groupIndex, scores] of scoresByGroup.entries()) {
        if (scores.length > 0) {
          const groupTitle = scores[0].title; // Usar título da primeira partitura como título do grupo

          const scoreGroup: IMSLPScoreGroup = {
            groupIndex,
            scores,
            groupTitle,
          };

          scoreGroups.push(scoreGroup);
        }
      }
    }

    return scoreGroups;
  }

  // Métodos auxiliares permanecem os mesmos
  private static extractThumbnailUrl(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<AnyNode>
  ): string | undefined {
    const strategies = [
      () => {
        const $parent = $element.parent();
        const $thumb = $parent
          .find('.we_thumb, [class*="thumb"], [data-img]')
          .first();

        if ($thumb.length > 0) {
          const dataImg = $thumb.attr('data-img');
          const imgSrc =
            $thumb.find('img').attr('data-src') ||
            $thumb.find('img').attr('src');
          return dataImg || imgSrc;
        }
        return null;
      },
    ];

    for (let i = 0; i < strategies.length; i++) {
      const result = strategies[i]();
      if (result) {
        let finalUrl = result;
        if (finalUrl.startsWith('//')) {
          finalUrl = 'https:' + finalUrl;
        } else if (finalUrl.startsWith('/')) {
          finalUrl = 'https://imslp.org' + finalUrl;
        }
        return finalUrl;
      }
    }

    return undefined;
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

  private static extractTableValue(
    $: cheerio.CheerioAPI,
    $table: cheerio.Cheerio<Element>,
    rowName: string
  ): string | undefined {
    let result: string | undefined;

    $table.find('tr').each((_, row) => {
      const $row = $(row);
      const headerText = $row.find('th').text().trim();

      if (headerText === rowName) {
        result = $row.find('td').text().trim();
        return false;
      }
    });

    return result;
  }

  /**
   * Busca e extrai partituras de uma URL IMSLP
   */
  static async fetchAndExtractScores(
    imslpUrl: string
  ): Promise<IMSLPWorkScores> {
    try {
      console.log(`🌐 [SCRAPER] Buscando página IMSLP: ${imslpUrl}`);
      const startTime = Date.now();

      const response = await fetch(imslpUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('text/html')) {
        throw new Error(`Tipo de conteúdo inesperado: ${contentType}`);
      }

      const html = await response.text();

      if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
        throw new Error('Resposta não é um documento HTML válido');
      }

      const fetchTime = Date.now() - startTime;
      console.log(`✅ [SCRAPER] Página carregada em ${fetchTime}ms`);

      const result = await this.extractScores(html);

      const totalTime = Date.now() - startTime;
      console.log(`🎯 [SCRAPER] Processamento completo em ${totalTime}ms`);

      // Log das estatísticas do cache e sistema IA
      const cacheStats = IMSLPDirectUrlResolverOptimized.getCacheStats();
      const urlLogStats = IMSLPDirectUrlResolverOptimized.getUrlLogStats();

      console.log(
        `📊 [SCRAPER] Cache: ${
          cacheStats.totalEntries
        } entradas (conf. média: ${(cacheStats.avgConfidence * 100).toFixed(
          1
        )}%)`
      );
      console.log(
        `🧠 [SCRAPER] IA: ${
          urlLogStats.patternCount
        } padrões, ${urlLogStats.successRate.toFixed(1)}% taxa de sucesso`
      );

      return result;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          'Erro de conexão com IMSLP. Verifique sua conexão com a internet.'
        );
      }
      throw error;
    }
  }
}
