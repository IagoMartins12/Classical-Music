// app/api/uploads/composer/[id]/works/process-single/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';
import { logWorkCreate } from '@/app/utils/historyUtils';
import axios from 'axios';
import * as cheerio from 'cheerio';

import {
  filterValidCategories,
  mapStyleToEpoch,
  VALID_CATEGORIES,
} from '@/app/utils/valid-categories-and-genres';
import {
  INSTRUMENT_MAPPING,
  MODE_TRANSLATIONS,
  NOTE_TRANSLATIONS,
  VALID_WORKGENRES,
  WORK_GENRE_TRANSLATIONS,
} from '../../../../../../../../scripts/imslp-works-scraper-util';

interface WorkToProcess {
  id: string;
  title: string;
  imslpId: string;
  imslpUrl: string;
  opOrCatalog?: string;
  instrument?: string;
}

interface Params {
  id: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id: composerId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { work }: { work: WorkToProcess } = body;

    if (!work) {
      return NextResponse.json(
        { error: 'Dados da obra não fornecidos' },
        { status: 400 }
      );
    }

    console.log(`🔍 Processando obra individual: ${work.title}`);

    // Verificar se compositor existe
    const composer = await prisma.composer.findUnique({
      where: { id: composerId },
      select: {
        id: true,
        name: true,
        fullName: true,
        dataSource: true,
        epochId: true,
      },
    });

    if (!composer) {
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 404 }
      );
    }

    if (composer.dataSource !== 'imslp') {
      return NextResponse.json(
        { error: 'Este compositor não foi importado do IMSLP' },
        { status: 400 }
      );
    }

    // Verificar se já existe
    const existingWork = await prisma.work.findFirst({
      where: {
        OR: [
          { imslpId: work.imslpId },
          {
            composerId: composer.id,
            title: {
              contains: work.title.substring(0, 20),
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    if (existingWork) {
      return NextResponse.json({
        success: false,
        error: 'Esta obra já existe no banco de dados',
        duplicate: true,
        existingWorkId: existingWork.id,
      });
    }

    // 🆕 FAZER SCRAPING DIRETAMENTE (sem chamada HTTP interna)
    console.log(`🌐 Fazendo scraping direto: ${work.imslpUrl}`);

    let scrapedData;
    try {
      scrapedData = await scrapeIMSLPWorkDirect(work.imslpUrl, composer);
    } catch (scrapingError) {
      console.error('❌ Erro no scraping:', scrapingError);
      return NextResponse.json({
        success: false,
        error: `Erro ao fazer scraping: ${
          scrapingError instanceof Error
            ? scrapingError.message
            : 'Erro desconhecido'
        }`,
        details: {
          scrapingError:
            scrapingError instanceof Error
              ? scrapingError.message
              : 'Erro desconhecido',
        },
      });
    }

    // Buscar instrumento padrão "Piano" para fallback
    const defaultInstrument = await prisma.instrument.findFirst({
      where: { name: { contains: 'Piano', mode: 'insensitive' } },
    });

    if (!defaultInstrument) {
      return NextResponse.json({
        success: false,
        error: 'Instrumento padrão não encontrado',
      });
    }

    // Determinar instrumento
    let instrumentId = defaultInstrument.id;
    if (scrapedData.primaryInstrument) {
      const instrument = await prisma.instrument.findFirst({
        where: {
          name: {
            contains: scrapedData.primaryInstrument,
            mode: 'insensitive',
          },
        },
      });
      if (instrument) {
        instrumentId = instrument.id;
      }
    } else if (work.instrument) {
      const instrument = await prisma.instrument.findFirst({
        where: {
          name: { contains: work.instrument, mode: 'insensitive' },
        },
      });
      if (instrument) {
        instrumentId = instrument.id;
      }
    }

    // Preparar dados para criação
    const createData = {
      title: scrapedData.title || work.title,
      subtitle: scrapedData.subtitle,
      composerId: composer.id,
      instrumentId,
      epochId: composer.epochId,

      // Dados do IMSLP
      imslpId: scrapedData.imslpId || work.imslpId,
      imslpPermlink: scrapedData.imslpPermlink || work.imslpUrl,

      // Dados extraídos
      opOrCatalog: scrapedData.opOrCatalog || work.opOrCatalog,
      compositionYear: scrapedData.compositionYear,
      firstPublishDate: scrapedData.firstPublishDate,
      tone: scrapedData.tone,
      timeSignature: scrapedData.timeSignature,
      tempoMarking: scrapedData.tempoMarking,
      mediaDuration: scrapedData.mediaDuration,
      workStyle: scrapedData.workStyle,
      moviment: scrapedData.moviment,
      instrumentation: scrapedData.instrumentation,
      dedicateTo: scrapedData.dedicateTo,
      dedicationComposerLink: scrapedData.dedicationComposerLink,

      // Arrays
      categoryNames: scrapedData.categoryNames || [],
      workGenresArr: scrapedData.workGenresArr || [],
      imslpTags: scrapedData.imslpTags || [],

      // Metadados
      workType: scrapedData.workType || 'INDIVIDUAL',
      isPartOfCollection: scrapedData.isPartOfCollection || false,
      movementNumber: scrapedData.movementNumber,
      movementsDetailed: scrapedData.movementsDetailed,
      difficultyLevel: scrapedData.difficultyLevel,

      // Controle
      createdBy: userId,
      isCustom: false, // Vem do IMSLP
    };

    // Criar obra no banco
    const createdWork = await prisma.work.create({
      data: createData,
      include: {
        composer: { select: { name: true, fullName: true } },
        epoch: { select: { name: true } },
        instrument: { select: { name: true } },
      },
    });

    // Registrar no histórico
    await logWorkCreate(userId, createdWork.id, {
      title: createdWork.title,
      subtitle: createdWork.subtitle,
      composerName: createdWork.composer.fullName || createdWork.composer.name,
      epochName: createdWork.epoch.name,
      instrumentName: createdWork.instrument.name,
      opOrCatalog: createdWork.opOrCatalog,
      compositionYear: createdWork.compositionYear,
      workType: createdWork.workType,
      isIMSLP: true,
      dataSource: 'bulk_import_imslp',
    });

    console.log(`✅ Obra criada com sucesso: ${createdWork.title}`);

    return NextResponse.json({
      success: true,
      workId: createdWork.id,
      message: 'Obra importada com sucesso',
      details: {
        finalTitle: createdWork.title,
        opOrCatalog: createdWork.opOrCatalog,
        instrument: createdWork.instrument.name,
        dataCompleteness: scrapedData.dataCompleteness,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao processar obra individual:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      details: {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
    });
  }
}

// 🆕 FUNÇÃO DE SCRAPING DIRETO (sem chamada HTTP)
async function scrapeIMSLPWorkDirect(url: string, composer: any) {
  console.log('🌐 Fazendo scraping direto da URL:', url);

  const response = await axios.get(url, {
    timeout: 15000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  const $ = cheerio.load(response.data);

  // Extrair IDs e limpar URL
  const { urlId, pageId, cleanedUrl } = extractImslpWorkId($, url);
  const imslpId = pageId || urlId;

  // Extrair título da página
  const pageTitle = $('#firstHeading').text().trim();
  const title = cleanTitle(pageTitle);

  // Extrair informações da tabela de detalhes
  const workDetails = extractWorkDetails($);

  // Extrair subtítulo
  const subtitle = extractSubtitle(title, $);

  // Extrair categorias válidas
  const rawCategories = extractCategories($);
  const validCategories = filterValidCategories(rawCategories);

  // Extrair gêneros válidos
  const validWorkGenres = extractWorkGenres($);

  // Extrair tags do IMSLP
  const imslpTags = extractIMSLPTags($);

  // Determinar tipo de trabalho
  const workType = determineWorkType(title, $);

  // Determinar instrumento principal
  const primaryInstrument = determinePrimaryInstrument(
    title,
    workDetails.instrumentation,
    validCategories
  );

  // Determinar nível de dificuldade
  const difficultyLevel = determineDifficultyLevel(
    title,
    workDetails.opOrCatalog,
    validWorkGenres
  );

  // Determinar época usando o mapeamento melhorado
  let epochName: string | null = null;
  if (workDetails.workStyle) {
    epochName = mapStyleToEpoch(workDetails.workStyle);
  }

  // Calcular completude dos dados
  const dataCompleteness = calculateDataCompleteness([
    title,
    composer.id,
    workDetails.opOrCatalog,
    workDetails.compositionYear,
    workDetails.tone,
    workDetails.instrumentation,
    subtitle,
    epochName,
    validCategories.length > 0 ? 'has_categories' : null,
    validWorkGenres.length > 0 ? 'has_genres' : null,
  ]);

  return {
    title,
    subtitle,
    composerId: composer.id,
    imslpPermlink: cleanedUrl,
    imslpId,
    opOrCatalog: workDetails.opOrCatalog,
    compositionYear: workDetails.compositionYear,
    firstPublishDate: workDetails.firstPublishDate,
    tone: translateMusicKey(workDetails.tone),
    timeSignature: workDetails.timeSignature,
    tempoMarking: workDetails.tempoMarking,
    mediaDuration: workDetails.mediaDuration,
    workStyle: workDetails.workStyle,
    moviment: workDetails.moviment,
    instrumentation: translateInstrumentation(workDetails.instrumentation),
    dedicateTo: workDetails.dedicateTo,
    dedicationComposerLink: workDetails.dedicationComposerLink,
    categoryNames: validCategories,
    workGenresArr: validWorkGenres,
    imslpTags,
    difficultyLevel,
    workType,
    isPartOfCollection:
      workType === 'INDIVIDUAL' &&
      (workDetails.opOrCatalog?.includes('No.') || title.includes('No.')),
    movementNumber: extractMovementNumber(title, workDetails.opOrCatalog),
    epochName,
    primaryInstrument,
    dataCompleteness,
    pageQuality:
      dataCompleteness >= 80
        ? 'high'
        : dataCompleteness >= 60
        ? 'medium'
        : 'low',
  };
}

// 🔄 FUNÇÕES AUXILIARES (copiadas do scraper original)
function extractImslpWorkId(
  $: cheerio.CheerioAPI,
  url: string
): {
  urlId: string;
  pageId: string | null;
  cleanedUrl: string;
} {
  const urlParts = url.split('/wiki/');
  const urlId = urlParts.length > 1 ? urlParts[1] : '';
  const cleanedUrl = cleanImslpUrl(url);
  let pageId: string | null = null;

  const canonicalLink = $('link[rel="canonical"]').attr('href');
  if (canonicalLink) {
    const canonicalMatch = canonicalLink.match(/curid=(\d+)/);
    if (canonicalMatch) {
      pageId = canonicalMatch[1];
    }
  }

  return { urlId, pageId, cleanedUrl };
}

function cleanImslpUrl(url: string): string {
  try {
    const decodedUrl = decodeURIComponent(url);
    const cleanedUrl = decodedUrl.split('#')[0].split('?')[0];
    return cleanedUrl;
  } catch (error) {
    return url;
  }
}

function cleanTitle(title: string): string {
  return title.replace(/\([^)]*\)$/, '').trim();
}

function extractWorkDetails($: cheerio.CheerioAPI) {
  const details: any = {};

  $('.wi_body table tr, .wp_header table tr').each((index, element) => {
    const $row = $(element);
    const headerCell = $row.find('th, td').first();
    const valueCell = $row.find('td').last();

    if (!headerCell.length || !valueCell.length) return;

    const header = headerCell.text().trim().toLowerCase();
    const value = valueCell.text().trim();

    if (!value || value === '-') return;

    switch (true) {
      case header.includes('opus') || header.includes('catalogue'):
        details.opOrCatalog = value;
        break;
      case header.includes('composition year'):
        details.compositionYear = value;
        break;
      case header.includes('first publication'):
        details.firstPublishDate = value;
        break;
      case header.includes('key'):
        details.tone = value;
        break;
      case header.includes('duration'):
        details.mediaDuration = value;
        break;
      case header.includes('style') || header.includes('period'):
        details.workStyle = value;
        break;
      case header.includes('movements') || header.includes('sections'):
        details.moviment = value;
        break;
      case header.includes('instrumentation') || header.includes('scoring'):
        details.instrumentation = value;
        break;
      case header.includes('dedication'):
        details.dedicateTo = value;
        break;
      case header.includes('time signature') || header.includes('meter'):
        details.timeSignature = value;
        break;
      case header.includes('tempo'):
        details.tempoMarking = value;
        break;
    }
  });

  return details;
}

function extractSubtitle(title: string, $: cheerio.CheerioAPI): string | null {
  let subtitle: string | null = null;

  $('.wp_header table tr').each((index, element) => {
    const $row = $(element);
    const header = $row.find('th').first().text().trim().toLowerCase();
    const value = $row.find('td').text().trim();

    if (header.includes('alternative') && header.includes('title')) {
      subtitle = value;
      return false;
    }
  });

  if (!subtitle) {
    const parenthesesMatch = title.match(/\((.*?)\)/);
    const quotesMatch = title.match(/"(.*?)"/);

    if (parenthesesMatch && parenthesesMatch[1]) {
      subtitle = parenthesesMatch[1];
    } else if (quotesMatch && quotesMatch[1]) {
      subtitle = quotesMatch[1];
    }
  }

  return subtitle && subtitle.length > 0 ? subtitle : null;
}

function extractCategories($: cheerio.CheerioAPI): string[] {
  const categories: Set<string> = new Set();

  $('a[href*="Category:"]').each((index, element) => {
    const href = $(element).attr('href');
    if (href) {
      const categoryMatch = href.match(/Category:(.+)/);
      if (categoryMatch) {
        const category = decodeURIComponent(categoryMatch[1]).replace(
          /_/g,
          ' '
        );
        const categoryLower = category.toLowerCase();

        if (VALID_CATEGORIES[category] || VALID_CATEGORIES[categoryLower]) {
          const translatedCategory =
            VALID_CATEGORIES[category] || VALID_CATEGORIES[categoryLower];
          categories.add(translatedCategory);
        }
      }
    }
  });

  return Array.from(categories);
}

function extractWorkGenres($: cheerio.CheerioAPI): string[] {
  const workGenres = new Set<string>();

  $('.wp_header table tr').each((index, element) => {
    const $row = $(element);
    const header = $row.find('th').first().text().trim().toLowerCase();

    if (header.includes('genre categories') || header.includes('categorias')) {
      $row.find('td a').each((i, link) => {
        const genreName = $(link).text().trim().toLowerCase();

        if (genreName && VALID_WORKGENRES.has(genreName)) {
          const portugueseGenre =
            WORK_GENRE_TRANSLATIONS[genreName] || genreName;
          workGenres.add(portugueseGenre);
        }
      });
    }
  });

  $('a[href*="Category:"]').each((index, element) => {
    const href = $(element).attr('href');
    if (href) {
      const categoryMatch = href.match(/Category:(.+)/);
      if (categoryMatch) {
        const category = decodeURIComponent(categoryMatch[1])
          .replace(/_/g, ' ')
          .replace(/&transclude=.*$/, '')
          .toLowerCase()
          .trim();

        if (VALID_WORKGENRES.has(category)) {
          const portugueseGenre = WORK_GENRE_TRANSLATIONS[category] || category;
          workGenres.add(portugueseGenre);
        }
      }
    }
  });

  if (workGenres.size === 0) {
    const pageTitle = $('#firstHeading').text().toLowerCase();

    for (const [english, portuguese] of Object.entries(
      WORK_GENRE_TRANSLATIONS
    )) {
      if (pageTitle.includes(english)) {
        workGenres.add(portuguese);
      }
    }
  }

  const finalGenres = Array.from(workGenres).filter(
    (genre) => genre && genre.length > 0
  );

  if (finalGenres.length === 0) {
    finalGenres.push('não definido');
  }

  return finalGenres;
}

function extractIMSLPTags($: cheerio.CheerioAPI): string[] {
  const tags: Set<string> = new Set();

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

function determineWorkType(
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

  for (const keyword of WORK_TYPE_KEYWORDS.COLLABORATION) {
    if (titleLower.includes(keyword)) {
      if (titleLower.match(/\b(with|and|&|feat\.)\s+[a-z]/i)) {
        return 'COLLABORATION';
      }
    }
  }

  for (const keyword of WORK_TYPE_KEYWORDS.COLLECTED_WORKS) {
    if (titleLower.includes(keyword)) {
      return 'COLLECTED_WORKS';
    }
  }

  for (const keyword of WORK_TYPE_KEYWORDS.COLLECTIONS_WITH) {
    if (titleLower.includes(keyword)) {
      return 'COLLECTIONS_WITH';
    }
  }

  for (const keyword of WORK_TYPE_KEYWORDS.ARRANGEMENT) {
    if (titleLower.includes(keyword)) {
      return 'ARRANGEMENT';
    }
  }

  for (const keyword of WORK_TYPE_KEYWORDS.COLLECTION) {
    if (titleLower.includes(keyword)) {
      return 'COMPLETE_WORK';
    }
  }

  for (const keyword of WORK_TYPE_KEYWORDS.INDIVIDUAL) {
    if (titleLower.includes(keyword)) {
      return 'INDIVIDUAL';
    }
  }

  return 'INDIVIDUAL';
}

function determinePrimaryInstrument(
  title: string,
  instrumentation?: string,
  categories?: string[]
): string | null {
  const text = (
    title +
    ' ' +
    (instrumentation || '') +
    ' ' +
    (categories?.join(' ') || '')
  ).toLowerCase();

  for (const [english, portuguese] of Object.entries(INSTRUMENT_MAPPING)) {
    if (text.includes(english)) {
      return portuguese;
    }
  }

  return null;
}

function determineDifficultyLevel(
  title: string,
  opOrCatalog: string | null | undefined,
  workGenres: string[]
): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null {
  const titleLower = title.toLowerCase();

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

  return 'INTERMEDIATE';
}

function translateMusicKey(key?: string): string | null {
  if (!key) return null;

  const keyRegex = /^([A-G][#b]?)\s*(major|minor|maj|min|M|m)?$/i;
  const match = key.match(keyRegex);

  if (!match) return key;

  const [, note, mode] = match;
  const translatedNote = NOTE_TRANSLATIONS[note] || note;
  let translatedMode = '';

  if (mode) {
    translatedMode =
      MODE_TRANSLATIONS[mode.toLowerCase()] || mode.toLowerCase();
  }

  return translatedMode
    ? `${translatedNote} ${translatedMode}`
    : translatedNote;
}

function translateInstrumentation(instrumentation?: string): string | null {
  if (!instrumentation) return null;

  let translated = instrumentation.toLowerCase();

  for (const [english, portuguese] of Object.entries(INSTRUMENT_MAPPING)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translated = translated.replace(regex, portuguese);
  }

  return translated.charAt(0).toUpperCase() + translated.slice(1);
}

function extractMovementNumber(
  title: string,
  opOrCatalog?: string
): number | null {
  const noMatch = title.match(/No\.\s*(\d+)/i);
  if (noMatch) {
    return parseInt(noMatch[1]);
  }

  if (opOrCatalog) {
    const opNoMatch = opOrCatalog.match(/No\.\s*(\d+)/i);
    if (opNoMatch) {
      return parseInt(opNoMatch[1]);
    }
  }

  return null;
}

function calculateDataCompleteness(
  fields: (string | null | undefined)[]
): number {
  const filledFields = fields.filter(
    (field) => field && field.toString().trim()
  ).length;
  return Math.round((filledFields / fields.length) * 100);
}
