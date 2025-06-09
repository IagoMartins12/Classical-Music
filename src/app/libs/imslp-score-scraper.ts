// lib/imslp-scraper.ts
import * as cheerio from 'cheerio';
import { AnyNode, Element } from 'domhandler';

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
  groupIndex?: number; // Novo campo para identificar o grupo
}

export interface IMSLPScoreGroup {
  groupIndex: number;
  scores: IMSLPScore[];
  groupTitle?: string; // Título do grupo se disponível
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
  /**
   * Mapeia os IDs das abas para os tipos de partituras
   */
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
   * @param html HTML da página IMSLP
   * @returns Objeto com informações das partituras organizadas por tipo
   */
  static async extractScores(html: string): Promise<IMSLPWorkScores> {
    const $ = cheerio.load(html);

    // Verificar se a página foi carregada corretamente
    const pageTitle = $('title').text();

    // Verificar se há algum indicador de bloqueio
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
        const scoresInTab = await this.extractScoresFromTab(
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
   * Extrai partituras de uma aba específica
   * @param $ Instância do Cheerio
   * @param $tabContent Elemento da aba
   * @param type Tipo da partitura
   * @returns Array de partituras
   */
  private static async extractScoresFromTab(
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

    // Processar cada grupo sequencialmente
    for (const { element: $groupElement, index: groupIndex } of groups) {
      const groupScores: IMSLPScore[] = [];
      let groupTitle: string | undefined;

      // Coletar todos os elementos de score primeiro
      const scoreElements: {
        element: cheerio.Cheerio<AnyNode>;
        index: number;
      }[] = [];
      $groupElement.find('[id^="IMSLP"]').each((scoreIndex, scoreElement) => {
        scoreElements.push({ element: $(scoreElement), index: scoreIndex });
      });

      // Processar cada score sequencialmente
      for (const { element: $element, index: scoreIndex } of scoreElements) {
        const scoreId =
          $element.attr('id')?.replace('IMSLP', '') ||
          `${type}_${groupIndex}_${scoreIndex}`;

        // Extrair informações básicas do download
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

        // Se é o primeiro item do grupo, usar seu título como título do grupo
        if (scoreIndex === 0 && !groupTitle) {
          groupTitle = title;
        }

        // Extrair informações do arquivo
        const fileInfo = $downloadSection.find('.we_file_info2').text();
        const hiddenLink = $downloadSection
          .find('.we_file_info2 .hidden a')
          .attr('href');

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

        // Extrair informações detalhadas da tabela de edição (buscar no grupo inteiro)
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
        const uploaderMatch = uploaderInfo.match(/digitalizado por ([^\n]+)\n/);
        const uploader = uploaderMatch ? uploaderMatch[1].trim() : undefined;

        const uploadDateMatch = uploaderInfo.match(/\(([^)]+)\)$/);
        const uploadDate = uploadDateMatch ? uploadDateMatch[1] : undefined;

        const fileName = hiddenLink?.split('/').pop() ?? '';
        let intermediateUrl = `https://imslp.org/${hiddenLink}`;
        let downloadUrl = intermediateUrl;

        if (hiddenLink) {
          try {
            downloadUrl = await this.extractRealDownloadUrl(intermediateUrl);
          } catch (error) {
            downloadUrl = intermediateUrl;
          }
        }

        const score: IMSLPScore = {
          id: scoreId,
          title: title,
          downloadUrl: downloadUrl ?? '',
          fileSize: fileSizeMatch
            ? `${fileSizeMatch[1]}${fileSizeMatch[2]}`
            : '',
          pageCount: pageCountMatch ? pageCountMatch[1] : '',
          rating: rating,
          ratingsCount: ratingsCount,
          downloadCount: downloadCountMatch
            ? parseInt(downloadCountMatch[1])
            : undefined,
          fileFormat: 'PDF',
          editor: editor,
          publisher: publisher,
          copyright: copyright,
          thumbnailUrl: thumbnailUrl,
          uploadDate: uploadDate,
          uploader: uploader,
          notes: notes,
          type: type,
          groupIndex: groupIndex, // Adicionar índice do grupo
        };

        groupScores.push(score);
      }

      // Adicionar o grupo às coleções se tiver partituras
      if (groupScores.length > 0) {
        const scoreGroup: IMSLPScoreGroup = {
          groupIndex: groupIndex,
          scores: groupScores,
          groupTitle: groupTitle,
        };

        scoreGroups.push(scoreGroup);
      }
    }

    console.log(
      `🎼 Total de grupos extraídos para "${type}": ${scoreGroups.length}`
    );
    return scoreGroups;
  }

  private static async extractRealDownloadUrl(
    intermediateUrl: string
  ): Promise<string> {
    try {
      const response = await fetch(intermediateUrl, {
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
        console.warn(`⚠️ Erro ao buscar URL real: ${response.status}`);
        return intermediateUrl; // Retorna a URL original como fallback
      }

      const html = await response.text();

      const $ = cheerio.load(html);

      // ✅ CORREÇÃO: Buscar o elemento span correto com id="sm_dl_wait"
      const $downloadWait = $('#sm_dl_wait');

      if ($downloadWait.length > 0) {
        const realDownloadUrl = $downloadWait.attr('data-id');

        if (realDownloadUrl) {
          console.log('✅ URL real encontrada:', realDownloadUrl);
          return realDownloadUrl;
        } else {
          console.warn(
            '⚠️ Atributo data-id não encontrado no elemento sm_dl_wait'
          );
        }
      } else {
        $('[id*="dl"], [id*="wait"], [data-id]').each((i, el) => {
          const $el = $(el);
          console.log(
            `   - ID: ${$el.attr('id')}, data-id: ${$el.attr('data-id')}`
          );
        });
      }

      console.warn('⚠️ URL real não encontrada, usando URL intermediária');
      return intermediateUrl;
    } catch (error) {
      console.error('❌ Erro ao extrair URL real:', error);
      return intermediateUrl; // Retorna a URL original como fallback
    }
  }

  // Função corrigida para extrair thumbnail
  private static extractThumbnailUrl(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<AnyNode>
  ): string | undefined {
    // Array com diferentes estratégias para encontrar a thumbnail
    const strategies = [
      // Estratégia 4: Buscar no elemento pai e irmãos
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

    // Executar estratégias uma por vez até encontrar resultado
    for (let i = 0; i < strategies.length; i++) {
      const result = strategies[i]();
      if (result) {
        // Normalizar URL se necessário
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
        return false; // Break the loop
      }
    });

    return result;
  }

  /**
   * Busca e extrai partituras de uma URL IMSLP
   * @param imslpUrl URL da página IMSLP
   * @returns Promise com informações das partituras organizadas por tipo
   */
  static async fetchAndExtractScores(
    imslpUrl: string
  ): Promise<IMSLPWorkScores> {
    try {
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

      // Verificar se realmente é HTML válido
      if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
        throw new Error('Resposta não é um documento HTML válido');
      }

      return await this.extractScores(html);
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
