// app/api/uploads/work/scraper/route.ts - ATUALIZADO COM CATEGORIAS E GÊNEROS VÁLIDOS
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import axios from 'axios';
import * as cheerio from 'cheerio';
import prisma from '@/app/libs/prismadb';
import {
  INSTRUMENT_MAPPING,
  MODE_TRANSLATIONS,
  NOTE_TRANSLATIONS,
  VALID_WORKGENRES,
  WORK_GENRE_TRANSLATIONS,
} from '../../../../../../scripts/imslp-works-scraper-util';
import {
  extractComposerFromIMSLPId,
  filterValidCategories,
  mapStyleToEpoch,
  VALID_CATEGORIES,
} from '@/app/utils/valid-categories-and-genres';

interface ScrapedWorkData {
  title: string;
  subtitle: string | null;
  composerName: string | null;
  composerId: string | null;
  imslpPermlink: string;
  imslpId: string;
  opOrCatalog: string | null;
  compositionYear: string | null;
  firstPublishDate: string | null;
  tone: string | null;
  timeSignature: string | null;
  tempoMarking: string | null;
  mediaDuration: string | null;
  workStyle: string | null;
  moviment: string | null;
  instrumentation: string | null;
  dedicateTo: string | null;
  dedicationComposerLink: string | null;
  categoryNames: string[];
  workGenresArr: string[];
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
  movementNumber: number | null;
  epochName: string | null;
  primaryInstrument: string | null;
  dataCompleteness: number;
  pageQuality: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL é obrigatório' }, { status: 400 });
    }

    // Verificar se é uma URL válida do IMSLP
    if (!url.includes('imslp.org')) {
      return NextResponse.json(
        { error: 'Por favor, insira um link válido do IMSLP' },
        { status: 400 }
      );
    }

    const scrapedData = await scrapeIMSLPWork(url);

    return NextResponse.json({
      success: true,
      data: scrapedData,
      source: 'IMSLP',
    });
  } catch (error) {
    console.error('Erro no scraping:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer scraping da página' },
      { status: 500 }
    );
  }
}

async function scrapeIMSLPWork(url: string): Promise<ScrapedWorkData> {
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    // Extrair ID do IMSLP da URL
    const urlParts = url.split('/wiki/');
    const imslpId = urlParts.length > 1 ? urlParts[1] : '';

    // Extrair título da página
    const pageTitle = $('#firstHeading').text().trim();
    const title = cleanTitle(pageTitle);

    // Extrair informações do compositor do imslpId
    const composerInfo = extractComposerFromIMSLPId(imslpId);
    let composerName = '';
    let composerId: string | null = null;

    if (composerInfo) {
      composerName = composerInfo.fullName;

      // Buscar compositor no banco de dados
      const composer = await findComposerByName(
        composerInfo.fullName,
        composerInfo.lastName
      );
      if (composer) {
        composerId = composer.id;
        console.log(
          `✅ Compositor encontrado no banco: ${
            composer.fullName || composer.name
          }`
        );
      } else {
        console.log(`⚠️ Compositor não encontrado no banco: ${composerName}`);
      }
    }

    // Extrair informações da tabela de detalhes
    const workDetails = extractWorkDetails($);

    // Extrair subtítulo
    const subtitle = extractSubtitle(title, $);

    // Extrair categorias válidas
    const rawCategories = extractCategories($);
    const validCategories = filterValidCategories(rawCategories);

    // Extrair gêneros válidos
    const rawWorkGenres = extractWorkGenres($);
    const validWorkGenres = filterValidWorkGenres(rawWorkGenres);

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

    // Se não conseguiu mapear pelo estilo, tentar pelo compositor
    if (!epochName && composerId) {
      try {
        const composerWithEpoch = await prisma.composer.findUnique({
          where: { id: composerId },
          include: { epoch: true },
        });
        if (composerWithEpoch?.epoch) {
          epochName = composerWithEpoch.epoch.name;
        }
      } catch (error) {
        console.log('⚠️ Erro ao buscar época do compositor:', error);
      }
    }

    // Calcular completude dos dados
    const dataCompleteness = calculateDataCompleteness([
      title,
      composerId,
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
      composerName,
      composerId,
      imslpPermlink: url,
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
  } catch (error) {
    console.error('Erro ao fazer scraping do IMSLP:', error);
    throw error;
  }
}

function cleanTitle(title: string): string {
  // Remove informações do compositor do título
  return title.replace(/\([^)]*\)$/, '').trim();
}

async function findComposerByName(fullName: string, lastName: string) {
  try {
    // Primeiro tenta buscar pelo nome completo
    let composer = await prisma.composer.findFirst({
      where: {
        OR: [
          { name: { contains: fullName, mode: 'insensitive' } },
          { fullName: { contains: fullName, mode: 'insensitive' } },
          { alternativeNames: { contains: fullName, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        fullName: true,
      },
    });

    // Se não encontrou, tenta buscar pelo sobrenome
    if (!composer) {
      composer = await prisma.composer.findFirst({
        where: {
          OR: [
            { name: { contains: lastName, mode: 'insensitive' } },
            { fullName: { contains: lastName, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          fullName: true,
        },
      });
    }

    return composer;
  } catch (error) {
    console.error('Erro ao buscar compositor:', error);
    return null;
  }
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
  // Procurar por título alternativo na página
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

  // Se não encontrou, tentar extrair do título
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

// Função melhorada para extrair apenas categorias válidas
function extractCategories($: cheerio.CheerioAPI): string[] {
  const categories: Set<string> = new Set();

  // Buscar categorias nas páginas IMSLP
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

        // Verificar se é uma categoria válida (em inglês)
        if (VALID_CATEGORIES[category] || VALID_CATEGORIES[categoryLower]) {
          const translatedCategory =
            VALID_CATEGORIES[category] || VALID_CATEGORIES[categoryLower];
          categories.add(translatedCategory);
          console.log(
            `✅ Categoria válida encontrada: ${category} -> ${translatedCategory}`
          );
        } else {
          console.log(`⚠️ Categoria inválida ignorada: ${category}`);
        }
      }
    }
  });

  return Array.from(categories);
}

// Função melhorada para extrair apenas gêneros válidos
function filterValidWorkGenres(rawGenres: string[]): string[] {
  return rawGenres
    .map((genre) => genre.trim().toLowerCase())
    .filter((genre) => VALID_WORKGENRES.has(genre))
    .map((genre) => WORK_GENRE_TRANSLATIONS[genre] || genre)
    .filter((genre) => genre && genre.length > 0);
}

function extractWorkGenres($: cheerio.CheerioAPI): string[] {
  const workGenres: Set<string> = new Set();

  // Buscar gêneros nas categorias da página
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
          console.log(
            `✅ Gênero válido encontrado: ${genreName} -> ${portugueseGenre}`
          );
        } else {
          console.log(`⚠️ Gênero inválido ignorado: ${genreName}`);
        }
      });
    }
  });

  // Buscar também em links de categorias
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

        // Verificar se é um gênero válido
        if (VALID_WORKGENRES.has(categoryLower)) {
          const portugueseGenre =
            WORK_GENRE_TRANSLATIONS[categoryLower] || categoryLower;
          workGenres.add(portugueseGenre);
          console.log(
            `✅ Gênero válido encontrado em categoria: ${category} -> ${portugueseGenre}`
          );
        }
      }
    }
  });

  // Se não encontrou gêneros específicos, tentar extrair do título
  if (workGenres.size === 0) {
    const pageTitle = $('#firstHeading').text().toLowerCase();
    for (const [english, portuguese] of Object.entries(
      WORK_GENRE_TRANSLATIONS
    )) {
      if (pageTitle.includes(english)) {
        workGenres.add(portuguese);
        console.log(
          `✅ Gênero encontrado no título: ${english} -> ${portuguese}`
        );
      }
    }
  }

  // Se ainda não tem gêneros, usar "não definido" como padrão
  if (workGenres.size === 0) {
    workGenres.add('não definido');
  }

  return Array.from(workGenres);
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

function determineWorkType(title: string, $?: cheerio.CheerioAPI): any {
  const titleLower = title.toLowerCase();

  if (titleLower.includes('complete') || titleLower.includes('collected')) {
    return 'COLLECTED_WORKS';
  }
  if (titleLower.includes('arrangement') || titleLower.includes('arr.')) {
    return 'ARRANGEMENT';
  }
  if (titleLower.includes('collection') || titleLower.includes('set')) {
    return 'COLLECTION';
  }
  if (titleLower.includes('no.') || titleLower.includes('number')) {
    return 'INDIVIDUAL';
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
  opOrCatalog?: string,
  workGenres?: string[]
): any {
  const titleLower = title.toLowerCase();

  const beginnerIndicators = [
    'easy',
    'simple',
    'first',
    'elementary',
    'children',
  ];
  const advancedIndicators = [
    'concert',
    'concerto',
    'virtuoso',
    'transcendental',
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
