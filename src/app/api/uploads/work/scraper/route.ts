// app/api/uploads/work/scraper/route.ts - ATUALIZADO COM CAPTURA DE COMPOSITOR POR permLinkImslp
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
  filterValidCategories,
  mapStyleToEpoch,
  VALID_CATEGORIES,
} from '@/app/utils/valid-categories-and-genres';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

interface ScrapedWorkData {
  title: string;
  subtitle: string | null;
  composerName: string | null;
  composerId: string | null;
  composerPermLink: string | null;
  imslpPermlink: string;
  imslpId: string;
  opOrCatalog: string | null;
  compositionYear: string | null;
  firstPublishDate: string | null;
  tone: string | null;
  tempoMarking: string | null;
  mediaDuration: string | null;
  workStyle: string | null;
  moviment: string | null;
  instrumentation: string | null;
  dedicateTo: string | null;
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
    const language = await getServerLanguageStatic();
    if (!url) {
      const message =
        language === 'pt' ? 'URL é obrigatório' : 'URL is required';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // Verificar se é uma URL válida do IMSLP
    if (!url.includes('imslp.org')) {
      const message =
        language === 'pt'
          ? 'Por favor, insira um link válido do IMSLP'
          : 'Please enter a valid IMSLP link';

      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.log('🌐 Iniciando scraping da URL:', url);
    const scrapedData = await scrapeIMSLPWork(url);

    return NextResponse.json({
      success: true,
      data: scrapedData,
      source: 'IMSLP',
    });
  } catch (error) {
    console.error('❌ Erro no scraping:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer scraping da página' },
      { status: 500 }
    );
  }
}

// 🆕 FUNÇÃO PARA LIMPAR URL DO IMSLP
function cleanImslpUrl(url: string): string {
  try {
    // Decodificar caracteres URL (ex: %C3%A9 -> é)
    const decodedUrl = decodeURIComponent(url);

    // Remover fragmentos e parâmetros de query
    const cleanedUrl = decodedUrl.split('#')[0].split('?')[0];

    console.log(`🧹 URL limpa: ${url} -> ${cleanedUrl}`);
    return cleanedUrl;
  } catch (error) {
    console.error('❌ Erro ao limpar URL:', error);
    return url;
  }
}

// 🆕 FUNÇÃO PARA EXTRAIR ID CORRETO DO IMSLP
function extractImslpWorkId(
  $: cheerio.CheerioAPI,
  url: string
): {
  urlId: string;
  pageId: string | null;
  cleanedUrl: string;
} {
  // Extrair ID da URL (nome da página)
  const urlParts = url.split('/wiki/');
  const urlId = urlParts.length > 1 ? urlParts[1] : '';

  // Limpar URL
  const cleanedUrl = cleanImslpUrl(url);

  // Tentar extrair ID numérico da página
  let pageId: string | null = null;

  // Estratégia 1: Procurar por ID na URL canônica
  const canonicalLink = $('link[rel="canonical"]').attr('href');
  if (canonicalLink) {
    const canonicalMatch = canonicalLink.match(/curid=(\d+)/);
    if (canonicalMatch) {
      pageId = canonicalMatch[1];
    }
  }

  // Estratégia 2: Procurar por ID em elementos data-* ou id
  if (!pageId) {
    $('[data-mw-pageid], [data-pageid]').each((_, element) => {
      const id =
        $(element).attr('data-mw-pageid') || $(element).attr('data-pageid');
      if (id && /^\d+$/.test(id)) {
        pageId = id;
        return false; // Sair do loop
      }
    });
  }

  // Estratégia 3: Procurar por ID em scripts ou comentários
  if (!pageId) {
    $('script').each((_, script) => {
      const content = $(script).html();
      if (content) {
        const idMatch =
          content.match(/pageId["\']?\s*:\s*["\']?(\d+)["\']?/i) ||
          content.match(/wgArticleId["\']?\s*:\s*["\']?(\d+)["\']?/i) ||
          content.match(
            /mw\.config\.set\([^}]*["\']wgArticleId["\'][^}]*?(\d+)/i
          );
        if (idMatch) {
          pageId = idMatch[1];
          return false; // Sair do loop
        }
      }
    });
  }

  console.log(`📋 IDs extraídos:`, {
    urlId,
    pageId,
    cleanedUrl,
  });

  return {
    urlId,
    pageId,
    cleanedUrl,
  };
}

/**
 * Limpa o nome do compositor removendo caracteres especiais
 * @param name - Nome do compositor
 * @returns Nome limpo
 */
function cleanComposerName(name: string): string {
  if (!name) return '';

  return name
    .trim()
    .replace(/\s+/g, ' ') // Remover espaços múltiplos
    .replace(/[""]/g, '"') // Normalizar aspas
    .replace(/['']/g, "'") // Normalizar apostrofes
    .replace(/…/g, '...') // Normalizar reticências
    .replace(/–/g, '-') // Normalizar hífens
    .replace(/—/g, '-'); // Normalizar hífens longos
}

/**
 * Gera variações do composerPermLink para busca mais flexível
 * @param permLink - PermLink original
 * @returns Array de variações possíveis
 */
function generatePermLinkVariations(permLink: string): string[] {
  const variations = [permLink];

  // Versão sem acentos (substitui caracteres especiais)
  const withoutAccents = permLink
    .replace(/é/g, 'e')
    .replace(/è/g, 'e')
    .replace(/ê/g, 'e')
    .replace(/ë/g, 'e')
    .replace(/á/g, 'a')
    .replace(/à/g, 'a')
    .replace(/â/g, 'a')
    .replace(/ã/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ó/g, 'o')
    .replace(/ò/g, 'o')
    .replace(/ô/g, 'o')
    .replace(/õ/g, 'o')
    .replace(/ö/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ù/g, 'u')
    .replace(/û/g, 'u')
    .replace(/ü/g, 'u')
    .replace(/í/g, 'i')
    .replace(/ì/g, 'i')
    .replace(/î/g, 'i')
    .replace(/ï/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/ñ/g, 'n');

  if (withoutAccents !== permLink) {
    variations.push(withoutAccents);
  }

  // Versão com underscores em vez de espaços
  const withUnderscores = permLink.replace(/\s+/g, '_');
  if (withUnderscores !== permLink) {
    variations.push(withUnderscores);
  }

  return [...new Set(variations)]; // Remove duplicatas
}

/**
 * Limpa e normaliza o composerPermLink
 * @param permLink - PermLink bruto extraído da URL
 * @returns PermLink limpo e normalizado
 */
function cleanComposerPermLink(permLink: string): string {
  if (!permLink) return '';

  try {
    // Decodificar caracteres URL (ex: %C3%A9 -> é)
    let cleaned = decodeURIComponent(permLink);

    // Remover espaços extras
    cleaned = cleaned.trim();

    // Garantir que tenha o formato correto
    if (!cleaned.startsWith('Category:')) {
      cleaned = `Category:${cleaned}`;
    }

    console.log(`🧹 PermLink limpo: ${permLink} -> ${cleaned}`);
    return cleaned;
  } catch (error) {
    console.error('❌ Erro ao limpar permLink:', error);
    // Se der erro na decodificação, tentar uma limpeza básica
    let cleaned = permLink.trim();
    if (!cleaned.startsWith('Category:')) {
      cleaned = `Category:${cleaned}`;
    }
    return cleaned;
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

    // 🆕 USAR NOVA FUNÇÃO: Extrair IDs e limpar URL
    const { urlId, pageId, cleanedUrl } = extractImslpWorkId($, url);

    // Usar pageId se disponível, senão usar urlId
    const imslpId = pageId || urlId;

    // Extrair título da página
    const pageTitle = $('#firstHeading').text().trim();
    const title = cleanTitle(pageTitle);

    // 🆕 MESMO CÓDIGO: Extrair composerPermLink do compositor da tabela de detalhes
    let composerPermLink: string | null = null;
    let composerName: string | null = null;
    let composerId: string | null = null;

    // Buscar na tabela de detalhes da obra
    $('.wi_body table tr, .wp_header table tr').each((index, element) => {
      const $row = $(element);
      const headerCell = $row.find('th').first();
      const valueCell = $row.find('td').first();

      if (!headerCell.length || !valueCell.length) return;

      const header = headerCell.text().trim().toLowerCase();

      // Verificar se é a linha do compositor
      if (header.includes('compositor') || header.includes('composer')) {
        const composerLink = valueCell
          .find('a[href*="/wiki/Category:"]')
          .first();
        if (composerLink.length) {
          const href = composerLink.attr('href');
          if (href) {
            // Extrair o composerPermLink do href
            const categoryMatch = href.match(/\/wiki\/(Category:[^?#]*)/);
            if (categoryMatch) {
              const rawPermLink = categoryMatch[1];
              composerPermLink = cleanComposerPermLink(rawPermLink); // 🧹 LIMPEZA ADICIONADA
              composerName = cleanComposerName(composerLink.text().trim()); // 🧹 LIMPEZA DO NOME ADICIONADA
              console.log(`🎼 Compositor encontrado: ${composerName}`);
              console.log(`🔗 ComposerPermLink: ${composerPermLink}`);
            }
          }
        }
        return false; // Sair do loop
      }
    });

    // 🆕 MESMO CÓDIGO: Buscar compositor no banco de dados usando imslpId
    if (composerPermLink) {
      try {
        console.log(`🔍 Buscando compositor por imslpId: ${composerPermLink}`);

        // Gerar variações do permLink para busca mais flexível
        const permLinkVariations = generatePermLinkVariations(composerPermLink);
        console.log(`🔄 Variações do permLink:`, permLinkVariations);

        let composer = null;

        // Tentar buscar com cada variação (busca exata)
        for (const variation of permLinkVariations) {
          composer = await prisma.composer.findFirst({
            where: {
              imslpId: variation,
            },
            select: {
              id: true,
              name: true,
              fullName: true,
              imslpId: true,
            },
          });

          if (composer) {
            console.log(`✅ Compositor encontrado com variação: ${variation}`);
            break;
          }
        }

        // Se não encontrou com busca exata, tentar busca parcial
        if (!composer) {
          console.log(`🔍 Tentando busca parcial por imslpId...`);

          // Extrair apenas o nome do compositor do permLink para busca parcial
          const composerPartName = composerPermLink
            .replace('Category:', '')
            .split(',')[0] // Pegar apenas o sobrenome
            .trim();

          if (composerPartName) {
            composer = await prisma.composer.findFirst({
              where: {
                imslpId: {
                  contains: composerPartName,
                  mode: 'insensitive',
                },
              },
              select: {
                id: true,
                name: true,
                fullName: true,
                imslpId: true,
              },
            });

            if (composer) {
              console.log(
                `✅ Compositor encontrado com busca parcial: ${composerPartName}`
              );
            }
          }
        }

        if (composer) {
          composerId = composer.id;
          composerName = composer.fullName || composer.name;
          console.log(
            `✅ Compositor encontrado no banco por imslpId: ${composerName}`
          );
        } else {
          console.log(
            `⚠️ Compositor não encontrado no banco por imslpId: ${composerPermLink}`
          );

          // Fallback: buscar por nome se não encontrou por imslpId
          if (composerName) {
            const composerByName = await findComposerByName(composerName);
            if (composerByName) {
              composerId = composerByName.id;
              composerName = composerByName.fullName || composerByName.name;
              console.log(
                `✅ Compositor encontrado no banco por nome: ${composerName}`
              );
            }
          }
        }
      } catch (error) {
        console.error('❌ Erro ao buscar compositor no banco:', error);
      }
    }

    // Fallback: se não encontrou compositor na tabela, tentar buscar por nome do título
    if (!composerId && !composerName) {
      console.log('⚠️ Compositor não encontrado na tabela');
      // Ainda não há compositor definido, continuará sem
    }

    // Extrair informações da tabela de detalhes
    const workDetails = extractWorkDetails($);

    // Extrair subtítulo
    const subtitle = extractSubtitle(title, $);

    // Extrair categorias válidas
    const rawCategories = extractCategories($);
    const validCategories = filterValidCategories(rawCategories);

    // 🆕 USAR NOVA FUNÇÃO: Extrair gêneros válidos sem duplicatas
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
      composerPermLink,
      workDetails.opOrCatalog,
      workDetails.compositionYear,
      workDetails.tone,
      workDetails.instrumentation,
      subtitle,
      epochName,
      validCategories.length > 0 ? 'has_categories' : null,
      validWorkGenres.length > 0 ? 'has_genres' : null,
    ]);

    console.log('📊 Dados extraídos:');
    console.log(`   - Título: ${title}`);
    console.log(`   - Compositor: ${composerName} (ID: ${composerId})`);
    console.log(`   - ComposerPermLink: ${composerPermLink}`);
    console.log(`   - IMSLP ID: ${imslpId} (URL: ${urlId}, Page: ${pageId})`);
    console.log(`   - URL Limpa: ${cleanedUrl}`);
    console.log(
      `   - Gêneros (${validWorkGenres.length}): ${validWorkGenres.join(', ')}`
    );
    console.log(`   - Completude: ${dataCompleteness}%`);

    // Exemplo de limpeza para debug
    if (composerPermLink) {
      console.log('🧹 Exemplos de limpeza:');
      console.log(
        `   - "Category:Chopin,_Fr%C3%A9d%C3%A9ric" -> "${cleanComposerPermLink(
          'Category:Chopin,_Fr%C3%A9d%C3%A9ric'
        )}"`
      );
      console.log(
        `   - "Category:Satie,_Erik" -> "${cleanComposerPermLink(
          'Category:Satie,_Erik'
        )}"`
      );
      console.log(
        `   - "Category:Bach,_Johann_Sebastian" -> "${cleanComposerPermLink(
          'Category:Bach,_Johann_Sebastian'
        )}"`
      );

      const variations = generatePermLinkVariations(composerPermLink);
      console.log(`   - Variações geradas: ${variations.join(', ')}`);
    }

    return {
      title,
      subtitle,
      composerName,
      composerId,
      composerPermLink,
      imslpPermlink: cleanedUrl, // 🆕 USAR URL LIMPA
      imslpId,
      opOrCatalog: workDetails.opOrCatalog,
      compositionYear: workDetails.compositionYear,
      firstPublishDate: workDetails.firstPublishDate,
      tone: translateMusicKey(workDetails.tone),
      tempoMarking: workDetails.tempoMarking,
      mediaDuration: workDetails.mediaDuration,
      workStyle: workDetails.workStyle,
      moviment: workDetails.moviment,
      instrumentation: translateInstrumentation(workDetails.instrumentation),
      dedicateTo: workDetails.dedicateTo,
      categoryNames: validCategories,
      workGenresArr: validWorkGenres, // 🆕 USAR GÊNEROS SEM DUPLICATAS
      imslpTags,
      difficultyLevel,
      workType,

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

async function findComposerByName(fullName: string, lastName?: string) {
  try {
    // Limpar o nome antes de buscar
    const cleanedFullName = cleanComposerName(fullName);
    const cleanedLastName = lastName ? cleanComposerName(lastName) : undefined;

    console.log(`🔍 Buscando compositor por nome: ${cleanedFullName}`);

    // Primeiro tenta buscar pelo nome completo
    let composer = await prisma.composer.findFirst({
      where: {
        OR: [
          { name: { contains: cleanedFullName, mode: 'insensitive' } },
          { fullName: { contains: cleanedFullName, mode: 'insensitive' } },
          {
            alternativeNames: {
              contains: cleanedFullName,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        imslpId: true,
      },
    });

    // Se não encontrou e tem sobrenome, tenta buscar pelo sobrenome
    if (!composer && cleanedLastName) {
      composer = await prisma.composer.findFirst({
        where: {
          OR: [
            { name: { contains: cleanedLastName, mode: 'insensitive' } },
            { fullName: { contains: cleanedLastName, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          fullName: true,
          imslpId: true,
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

// 🆕 FUNÇÃO MELHORADA PARA EXTRAIR GÊNEROS VÁLIDOS SEM DUPLICATAS
function extractWorkGenres($: cheerio.CheerioAPI): string[] {
  const workGenres = new Set<string>();

  console.log('🔍 Iniciando extração de gêneros...');

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
            `✅ Gênero válido encontrado na tabela: ${genreName} -> ${portugueseGenre}`
          );
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
        const category = decodeURIComponent(categoryMatch[1])
          .replace(/_/g, ' ')
          .replace(/&transclude=.*$/, '') // 🆕 Remover parâmetros de transclusão
          .toLowerCase()
          .trim();

        // Verificar se é um gênero válido
        if (VALID_WORKGENRES.has(category)) {
          const portugueseGenre = WORK_GENRE_TRANSLATIONS[category] || category;
          workGenres.add(portugueseGenre);
          console.log(
            `✅ Gênero válido encontrado em categoria: ${category} -> ${portugueseGenre}`
          );
        } else {
          console.log(`⚠️ Gênero inválido ignorado: ${category}`);
        }
      }
    }
  });

  // Se não encontrou gêneros específicos, tentar extrair do título
  if (workGenres.size === 0) {
    const pageTitle = $('#firstHeading').text().toLowerCase();
    console.log(`🔍 Tentando extrair gêneros do título: ${pageTitle}`);

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

  // Converter Set para Array e remover duplicatas
  const finalGenres = Array.from(workGenres).filter(
    (genre) => genre && genre.length > 0
  );

  // Se ainda não tem gêneros, usar "não definido" como padrão
  if (finalGenres.length === 0) {
    finalGenres.push('não definido');
    console.log('⚠️ Nenhum gênero encontrado, usando "não definido"');
  }

  console.log(`✅ Gêneros finais (${finalGenres.length}):`, finalGenres);
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
    if (pageText.includes('collaboration') || pageText.includes('joint work')) {
      return 'COLLABORATION';
    }
  }

  // Default: assumir que é uma composição individual
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
