// lib/imslp-scraper.ts
import * as cheerio from 'cheerio';
import { AnyNode, Element } from 'domhandler';

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
}

export interface IMSLPScoresByType {
  scores: IMSLPScore[];
  parts: IMSLPScore[];
  arrangements: IMSLPScore[];
  librettos: IMSLPScore[];
  others: IMSLPScore[];
  sources: IMSLPScore[];
}

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
  static extractScores(html: string): IMSLPWorkScores {
    const $ = cheerio.load(html);

    // Verificar se a página foi carregada corretamente
    const pageTitle = $('title').text();
    console.log('📄 Título da página:', pageTitle);

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
    Object.entries(this.TAB_TYPE_MAP).forEach(([tabId, type]) => {
      const tabContentId = tabId.replace('_tab', '');
      const $tabContent = $(`#${tabContentId}`);

      if ($tabContent.length > 0) {
        const scoresInTab = this.extractScoresFromTab($, $tabContent, type);
        scoresByType[type] = scoresInTab;
        console.log(
          `🎼 Extraído: ${scoresInTab.length} itens do tipo "${type}"`
        );
      }
    });

    // Extrair título da obra
    const workTitle =
      $('h1').first().text().trim() ||
      $('#firstHeading').text().trim() ||
      'Obra Desconhecida';

    console.log(
      `📋 Resumo: ${
        Object.values(scoresByType).flat().length
      } itens total para "${workTitle}"`
    );

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
  private static extractScoresFromTab(
    $: cheerio.CheerioAPI,
    $tabContent: cheerio.Cheerio<AnyNode>,
    type: IMSLPScore['type']
  ): IMSLPScore[] {
    const scores: IMSLPScore[] = [];

    // Encontrar todos os blocos de arquivo na aba
    $tabContent.find('.we_file_first').each((index, element) => {
      const $element = $(element);
      const scoreId =
        $element.attr('id')?.replace('IMSLP', '') || `${type}_${index}`;

      // Extrair informações básicas do download
      const $downloadSection = $element.find('.we_file_download');

      let title = $downloadSection.find('span[title*="Baixar"]').text().trim();
      if (!title) {
        title = $downloadSection.find('.we_file_download_link').text().trim();
      }
      if (!title) {
        title = this.getDefaultTitleByType(type);
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
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) / 10 : undefined;

      const ratingsCountText = $downloadSection
        .find('[id^="num-of-ratings-"]')
        .text();
      const ratingsCount = ratingsCountText
        ? parseInt(ratingsCountText)
        : undefined;

      // Extrair informações detalhadas da tabela de edição
      const $editionTable = $element.next('.we_edition_info').find('table');

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
      const notes = this.extractTableValue($, $editionTable, 'Notas diversas');
      const imgUrl = this.extractTableImgUrl($, $editionTable);

      console.log('IMG URL', imgUrl);
      // Extrair informações do uploader
      const $fileInfo = $element.find('.we_file_info');
      const uploaderInfo = $fileInfo.find('.mh555').text();
      const uploaderMatch = uploaderInfo.match(/digitalizado por ([^\n]+)\n/);
      const uploader = uploaderMatch ? uploaderMatch[1].trim() : undefined;

      const uploadDateMatch = uploaderInfo.match(/\(([^)]+)\)$/);
      const uploadDate = uploadDateMatch ? uploadDateMatch[1] : undefined;

      const $thumbContainer = $element.find('.we_thumb.preview.pvld');
      let thumbnailUrl =
        $thumbContainer.attr('data-img') ||
        $thumbContainer.find('img').attr('data-src') ||
        $thumbContainer.find('img').attr('src') ||
        undefined;

      if (thumbnailUrl?.startsWith('//')) {
        thumbnailUrl = 'https:' + thumbnailUrl;
      }

      const fileName = hiddenLink?.split('/').pop() ?? ''; // "SIBLEY1802.17377.4c16-39087013698123score.pdf"

      // Substitui o nome do arquivo no final do path
      //   let downloadUrl = hiddenLink?.replace(
      //     fileName,
      //     `IMSLP${scoreId}-${fileName}`
      //   );

      let downloadUrl = `https://imslp.org/${hiddenLink}`;
      console.log('AAAAAAAAAAAA', downloadUrl);

      const score: IMSLPScore = {
        id: scoreId,
        title: title,
        downloadUrl: downloadUrl ?? '',
        fileSize: fileSizeMatch ? `${fileSizeMatch[1]}${fileSizeMatch[2]}` : '',
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
      };

      scores.push(score);
    });

    return scores;
  }

  /**
   * Retorna título padrão baseado no tipo
   * @param type Tipo da partitura
   * @returns Título padrão
   */
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
   * Extrai valor de uma tabela baseado no nome da linha
   * @param $ Instância do Cheerio
   * @param $table Elemento da tabela jQuery/Cheerio
   * @param rowName Nome da linha a ser extraída
   * @returns Valor da célula ou undefined
   */
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

  private static extractTableImgUrl(
    $: cheerio.CheerioAPI,
    $table: cheerio.Cheerio<Element>
  ): string | undefined {
    // Procurar o elemento de thumbnail dentro da tabela
    const $thumbContainer = $table.find('.we_thumb.preview.pvld');

    // Tentar extrair a URL da imagem a partir dos atributos disponíveis
    let imgUrl =
      $thumbContainer.attr('data-img') ||
      $thumbContainer.find('img').attr('data-src') ||
      $thumbContainer.find('img').attr('src');

    // Adicionar o protocolo 'https:' se a URL começar com '//'
    if (imgUrl && imgUrl.startsWith('//')) {
      imgUrl = 'https:' + imgUrl;
    }

    return imgUrl;
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
      console.log('🌐 Fazendo requisição para:', imslpUrl);

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

      console.log('📡 Status da resposta:', response.status);

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

      return this.extractScores(html);
    } catch (error) {
      console.error('❌ Erro detalhado ao extrair partituras do IMSLP:', error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          'Erro de conexão com IMSLP. Verifique sua conexão com a internet.'
        );
      }

      throw error;
    }
  }
}
