// app/api/uploads/composer/[id]/works/discover/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface DiscoveredWork {
  id: string; // Temporary ID for UI purposes
  title: string;
  imslpId: string;
  imslpUrl: string;
  opOrCatalog?: string;
  instrument?: string;
  selected: boolean;
  alreadyExists?: boolean;
  existingWorkId?: string;
}

interface Params {
  id: string;
}

/**
 * Escapa caracteres especiais que podem ser interpretados como regex pelo MongoDB
 */
function escapeRegexChars(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Limpa e normaliza título para comparação
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove caracteres especiais
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
}

/**
 * Limpa e valida título extraído do IMSLP
 */
function cleanAndValidateTitle(title: string): string | null {
  if (!title) return null;

  // Remover espaços extras e caracteres de controle
  let cleaned = title.trim().replace(/\s+/g, ' ');

  // Remover informações do compositor do título (entre parênteses no final)
  cleaned = cleaned.replace(/\s*\([^)]*\)\s*$/, '').trim();

  // Decodificar entidades HTML básicas
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Verificar se o título é válido
  if (cleaned.length < 2) return null;
  if (cleaned.length > 200) return null; // Títulos muito longos provavelmente são inválidos

  // Verificar se não é uma categoria ou página especial
  const invalidPatterns = [
    /^category:/i,
    /^special:/i,
    /^help:/i,
    /^template:/i,
    /^user:/i,
    /\bcollection\b/i,
    /\bcategory\b/i,
    /\bdedicatee\b/i,
  ];

  for (const pattern of invalidPatterns) {
    if (pattern.test(cleaned)) {
      return null;
    }
  }

  return cleaned;
}

/**
 * Limpa e valida IMSLP ID
 */
function cleanAndValidateImslpId(href: string): string | null {
  if (!href) return null;

  try {
    // Extrair ID da URL
    let id = href.replace('/wiki/', '').replace(/^\//, '');

    // Decodificar URL
    id = decodeURIComponent(id);

    // Validações básicas
    if (id.length < 3) return null;
    if (id.length > 500) return null;

    // Verificar se não é uma página especial
    if (id.includes('Category:') && !id.includes(',')) {
      return null; // Categorias sem vírgula provavelmente não são obras
    }

    return id;
  } catch (error) {
    console.error('❌ Erro ao limpar IMSLP ID:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id: composerId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar compositor no banco
    const composer = await prisma.composer.findUnique({
      where: { id: composerId },
      select: {
        id: true,
        name: true,
        fullName: true,
        imslpId: true,
        permLinkImslp: true,
        dataSource: true,
      },
    });

    if (!composer) {
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se é compositor do IMSLP
    if (composer.dataSource !== 'imslp' || !composer.imslpId) {
      return NextResponse.json(
        { error: 'Este compositor não foi importado do IMSLP' },
        { status: 400 }
      );
    }

    console.log(`🔍 Descobrindo obras do compositor: ${composer.fullName}`);
    console.log(`📋 IMSLP ID: ${composer.imslpId}`);

    // Construir URL da página do compositor
    const composerUrl = `https://imslp.org/wiki/${composer.imslpId}`;

    // Fazer scraping das obras
    const discoveredWorks = await scrapeComposerWorks(composerUrl, composer);

    // Verificar quais obras já existem no banco
    const enrichedWorks = await checkExistingWorks(discoveredWorks, composerId);

    console.log(
      `✅ Encontradas ${enrichedWorks.length} obras para ${composer.fullName}`
    );
    console.log(
      `📊 Já existem: ${enrichedWorks.filter((w) => w.alreadyExists).length}`
    );
    console.log(
      `📊 Novas: ${enrichedWorks.filter((w) => !w.alreadyExists).length}`
    );

    return NextResponse.json({
      success: true,
      composer: {
        id: composer.id,
        name: composer.fullName,
        imslpId: composer.imslpId,
      },
      works: enrichedWorks,
      summary: {
        total: enrichedWorks.length,
        existing: enrichedWorks.filter((w) => w.alreadyExists).length,
        new: enrichedWorks.filter((w) => !w.alreadyExists).length,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao descobrir obras:', error);
    return NextResponse.json(
      {
        error: 'Erro ao buscar obras do compositor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

async function scrapeComposerWorks(
  composerUrl: string,
  composer: any
): Promise<DiscoveredWork[]> {
  try {
    console.log(`🌐 Fazendo scraping: ${composerUrl}`);

    const response = await axios.get(composerUrl, {
      timeout: 20000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    console.log('🔍 Procurando seção de composições...');

    // Buscar especificamente a aba "Compositions" que contém as obras do compositor
    let compositionsSection = null;

    // Método 1: Buscar pela aba ativa de "Compositions"
    const activeTab = $('.ui-tabs-panel:not(.ui-tabs-hide)');
    if (
      activeTab.length > 0 &&
      activeTab.find('h2:contains("Compositions by:")').length > 0
    ) {
      compositionsSection = activeTab;
      console.log('✅ Encontrou seção ativa de composições');
    }

    // Método 2: Buscar diretamente por ID ou estrutura específica
    if (!compositionsSection) {
      compositionsSection = $('#mw-pages').first();
      if (compositionsSection.length > 0) {
        console.log('✅ Encontrou seção mw-pages');
      }
    }

    // Método 3: Buscar em qualquer div que contenha "Compositions by:"
    if (!compositionsSection) {
      compositionsSection = $('h2:contains("Compositions by:")').parent();
      if (compositionsSection.length > 0) {
        console.log('✅ Encontrou seção por título "Compositions by:"');
      }
    }

    if (!compositionsSection || compositionsSection.length === 0) {
      console.log('⚠️ Seção de composições não encontrada');
      return [];
    }

    console.log('📋 Extraindo obras da seção encontrada...');

    const validWorks: DiscoveredWork[] = [];
    let totalLinks = 0;
    let validLinks = 0;

    // Buscar especificamente links de obras dentro da seção de composições
    compositionsSection
      .find('a.categorypagelink, a[href*="/wiki/"]')
      .each((index, element) => {
        totalLinks++;

        const $link = $(element);
        const href = $link.attr('href');
        const rawTitle = $link.text().trim();

        // Validações iniciais
        if (!href || !rawTitle) return;

        // Limpar e validar título
        const cleanTitle = cleanAndValidateTitle(rawTitle);
        if (!cleanTitle) {
          return;
        }

        // Limpar e validar IMSLP ID
        const imslpId = cleanAndValidateImslpId(href);
        if (!imslpId) {
          return;
        }

        // Verificar se é uma obra do compositor correto
        const composerName = composer.name || composer.fullName || '';
        const composerNameParts = composerName.split(' ');
        const lastName = composerNameParts[composerNameParts.length - 1];

        // Verificações de compositor no ID
        const composerChecks = [
          imslpId.includes(`(${lastName},`),
          imslpId.includes(`(${composerName.split(' ')[0]},`),
          imslpId.includes(`(${composerName.replace(' ', '%20')}`),
          // Para casos específicos como Satie
          imslpId.includes('(Satie,_Erik)'),
        ];

        if (!composerChecks.some((check) => check)) {
          return;
        }

        // Construir URL completa
        const workUrl = href.startsWith('http')
          ? href
          : `https://imslp.org${href}`;

        // Tentar extrair informações básicas do título
        const { opOrCatalog, instrument } = parseWorkTitle(cleanTitle);

        const work: DiscoveredWork = {
          id: `temp_${validLinks}_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`, // ID único
          title: cleanTitle,
          imslpId,
          imslpUrl: workUrl,
          opOrCatalog,
          instrument,
          selected: true, // Por padrão, todas começam selecionadas
          alreadyExists: false,
        };

        validWorks.push(work);
        validLinks++;
      });

    // Remover duplicatas baseadas no imslpId
    const uniqueWorks = validWorks.filter(
      (work, index, self) =>
        index === self.findIndex((w) => w.imslpId === work.imslpId)
    );

    console.log(`📝 Links encontrados: ${totalLinks}`);
    console.log(`📝 Links válidos: ${validLinks}`);
    console.log(`📝 Obras únicas finais: ${uniqueWorks.length}`);

    // Log de algumas obras para debug
    if (uniqueWorks.length > 0) {
      console.log('📋 Primeiras 5 obras encontradas:');
      uniqueWorks.slice(0, 5).forEach((work, i) => {
        console.log(`  ${i + 1}. ${work.title} (${work.imslpId})`);
      });
    }

    return uniqueWorks;
  } catch (error) {
    console.error('❌ Erro no scraping:', error);
    throw new Error(`Erro ao fazer scraping da página do compositor: ${error}`);
  }
}

function parseWorkTitle(title: string): {
  opOrCatalog?: string;
  instrument?: string;
} {
  let opOrCatalog: string | undefined;
  let instrument: string | undefined;

  // Extrair Opus ou número de catálogo - padrões mais abrangentes
  const opusPatterns = [
    /(Op\.\s*\d+(?:\s*No\.\s*\d+)?)/i,
    /(BWV\s*\d+)/i,
    /(K\.\s*\d+)/i,
    /(D\.\s*\d+)/i,
    /(Hob\.\s*[IVX]+:\d+)/i,
    /(WoO\.\s*\d+)/i,
    /(S\.\s*\d+)/i, // Liszt
    /(FP\s*\d+)/i, // Poulenc
    /(IES\s*\d+)/i, // Satie
    /(L\.\s*\d+)/i, // Scarlatti
    /(\d+\s*Pr(?:é|e)ludes?)/i,
    /(\d+\s*(?:Gymnop(?:é|e)dies?|Gnossiennes?))/i,
    /(No\.\s*\d+)/i,
  ];

  for (const pattern of opusPatterns) {
    const match = title.match(pattern);
    if (match) {
      opOrCatalog = match[1];
      break;
    }
  }

  // Tentar extrair instrumento - padrões mais específicos
  const instrumentPatterns = [
    // Padrões em inglês
    /for\s+(piano|violin|viola|cello|orchestra|organ|guitar|voice|choir|harp|flute|oboe|clarinet|trumpet|horn)/i,
    /\((piano|violin|viola|cello|orchestra|organ|guitar|voice|choir|harp|flute|oboe|clarinet|trumpet|horn)\)/i,
    /(piano|violin|viola|cello|orchestra|organ|guitar|voice|choir|harp|flute|oboe|clarinet|trumpet|horn)\s+(solo|sonata|concerto|piece|work)/i,

    // Padrões em francês (especialmente para Satie)
    /pour\s+(piano|violon|violoncelle|orchestre|orgue|guitare|voix|chœur|harpe|flûte|hautbois|clarinette|trompette|cor)/i,
    /\((piano|violon|violoncelle|orchestre|orgue|guitare|voix|chœur|harpe|flûte|hautbois|clarinette|trompette|cor)\)/i,

    // Padrões específicos para piano
    /(gymnop[ée]dies?|gnossiennes?|nocturnes?|preludes?|sarabandes?)/i,
  ];

  for (const pattern of instrumentPatterns) {
    const match = title.match(pattern);
    if (match) {
      const foundInstrument = match[1].toLowerCase();

      // Normalizar nomes de instrumentos para português
      const instrumentTranslations: Record<string, string> = {
        piano: 'Piano',
        violin: 'Violino',
        violon: 'Violino',
        viola: 'Viola',
        cello: 'Violoncelo',
        violoncelle: 'Violoncelo',
        orchestra: 'Orquestra',
        orchestre: 'Orquestra',
        organ: 'Órgão',
        orgue: 'Órgão',
        guitar: 'Violão',
        guitare: 'Violão',
        voice: 'Voz',
        voix: 'Voz',
        choir: 'Coro',
        chœur: 'Coro',
        harp: 'Harpa',
        harpe: 'Harpa',
        flute: 'Flauta',
        flûte: 'Flauta',
        oboe: 'Oboé',
        hautbois: 'Oboé',
        clarinet: 'Clarinete',
        clarinette: 'Clarinete',
        trumpet: 'Trompete',
        trompette: 'Trompete',
        horn: 'Trompa',
        cor: 'Trompa',
      };

      instrument = instrumentTranslations[foundInstrument] || foundInstrument;
      break;
    }
  }

  // Para obras pianísticas características (especialmente Satie)
  if (!instrument) {
    const pianoIndicators = [
      /gymnop[ée]dies?/i,
      /gnossiennes?/i,
      /nocturnes?/i,
      /pr[ée]ludes?/i,
      /sarabandes?/i,
      /valses?/i,
      /pi[èe]ces?\s+froides?/i,
      /morceaux/i,
    ];

    for (const pattern of pianoIndicators) {
      if (pattern.test(title)) {
        instrument = 'Piano';
        break;
      }
    }
  }

  return {
    opOrCatalog,
    instrument,
  };
}

async function checkExistingWorks(
  works: DiscoveredWork[],
  composerId: string
): Promise<DiscoveredWork[]> {
  if (works.length === 0) return works;

  console.log(`🔍 Verificando obras existentes para ${works.length} obras`);

  try {
    // 🔧 CORREÇÃO: Buscar por imslpId primeiro (busca exata, mais rápida)
    const imslpIds = works.map((work) => work.imslpId).filter(Boolean);

    const existingWorks: any[] = [];

    if (imslpIds.length > 0) {
      const existingByImslpId = await prisma.work.findMany({
        where: {
          composerId,
          imslpId: {
            in: imslpIds,
          },
        },
        select: {
          id: true,
          title: true,
          imslpId: true,
          imslpPermlink: true,
        },
      });

      existingWorks.push(...existingByImslpId);
      console.log(
        `📊 Encontradas ${existingByImslpId.length} obras por imslpId`
      );
    }

    // 🔧 CORREÇÃO: Buscar por título de forma mais segura (apenas para obras não encontradas por imslpId)
    const worksWithoutImslpMatch = works.filter(
      (work) =>
        !existingWorks.some((existing) => existing.imslpId === work.imslpId)
    );

    if (worksWithoutImslpMatch.length > 0) {
      console.log(
        `🔍 Buscando ${worksWithoutImslpMatch.length} obras por título...`
      );

      // Processar em lotes menores para evitar queries muito grandes
      const BATCH_SIZE = 10;
      for (let i = 0; i < worksWithoutImslpMatch.length; i += BATCH_SIZE) {
        const batch = worksWithoutImslpMatch.slice(i, i + BATCH_SIZE);

        // 🔧 CORREÇÃO: Usar títulos escapados e normalizados
        const titleQueries = batch
          .map((work) => {
            // Normalizar e escapar o título
            const normalizedTitle = normalizeTitle(work.title);
            const escapedTitle = escapeRegexChars(normalizedTitle);

            // Usar apenas primeiros 15 caracteres para evitar problemas
            const searchTerm = escapedTitle.substring(0, 15);

            if (searchTerm.length < 3) {
              return null; // Ignorar títulos muito curtos
            }

            return {
              title: {
                contains: searchTerm,
                mode: 'insensitive' as const,
              },
            };
          })
          .filter(Boolean); // Remove queries nulas

        if (titleQueries.length > 0) {
          try {
            const existingByTitle = await prisma.work.findMany({
              where: {
                composerId,
                OR: titleQueries,
              },
              select: {
                id: true,
                title: true,
                imslpId: true,
                imslpPermlink: true,
              },
            });

            existingWorks.push(...existingByTitle);
            console.log(
              `📊 Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${
                existingByTitle.length
              } obras encontradas por título`
            );
          } catch (batchError) {
            console.error(
              `❌ Erro no lote ${Math.floor(i / BATCH_SIZE) + 1}:`,
              batchError
            );
            // Continuar com o próximo lote em caso de erro
          }
        }
      }
    }

    console.log(
      `📊 Total de obras existentes encontradas: ${existingWorks.length}`
    );

    // Marcar obras que já existem
    return works.map((work) => {
      const existing = existingWorks.find((existingWork) => {
        // Primeira verificação: imslpId exato
        if (existingWork.imslpId === work.imslpId) {
          return true;
        }

        // Segunda verificação: permlink similar
        if (existingWork.imslpPermlink?.includes(work.imslpId)) {
          return true;
        }

        // Terceira verificação: título similar (mais conservadora)
        const existingTitle = normalizeTitle(existingWork.title);
        const workTitle = normalizeTitle(work.title);

        // Comparar apenas se ambos os títulos têm pelo menos 5 caracteres
        if (existingTitle.length >= 5 && workTitle.length >= 5) {
          // Verificar se um título contém o outro (com pelo menos 80% de match)
          const minLength = Math.min(existingTitle.length, workTitle.length);
          const maxLength = Math.max(existingTitle.length, workTitle.length);

          if (minLength / maxLength >= 0.6) {
            // Pelo menos 60% de match em tamanho
            return (
              existingTitle.includes(
                workTitle.substring(0, Math.min(10, workTitle.length))
              ) ||
              workTitle.includes(
                existingTitle.substring(0, Math.min(10, existingTitle.length))
              )
            );
          }
        }

        return false;
      });

      if (existing) {
        console.log(
          `✅ Obra já existe: "${work.title}" -> "${existing.title}"`
        );
        return {
          ...work,
          alreadyExists: true,
          existingWorkId: existing.id,
          selected: false, // Desmarcar obras que já existem por padrão
        };
      }

      return work;
    });
  } catch (error) {
    console.error('❌ Erro ao verificar obras existentes:', error);

    // Em caso de erro, retornar as obras sem marcação (mais seguro)
    return works.map((work) => ({
      ...work,
      alreadyExists: false,
      selected: true,
    }));
  }
}
