// app/api/works/search/route.ts - VERSÃO HÍBRIDA ULTRA OTIMIZADA
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

// 🚀 CACHE ULTRA AGRESSIVO - Diferentes TTLs por tipo de busca
const CACHE_CONFIG = {
  RANDOM_WORKS: 900, // 15 min - obras aleatórias mudam pouco
  COMPOSER_WORKS: 1800, // 30 min - obras de compositor são estáveis
  SEARCH_FILTERED: 300, // 5 min - busca com filtro (mais dinâmica)
  SEARCH_GENERAL: 600, // 10 min - busca geral
};

// Lista de compositores famosos para obras aleatórias
const FAMOUS_COMPOSERS = [
  'Ludwig van Beethoven',
  'Wolfgang Amadeus Mozart',
  'Johann Sebastian Bach',
  'Frédéric Chopin',
  'Franz Liszt',
  'Pyotr Ilyich Tchaikovsky',
  'Claude Debussy',
  'Johannes Brahms',
  'Antonio Vivaldi',
  'Franz Schubert',
];

// 🚀 CACHE PARA OBRAS ALEATÓRIAS (mantido da versão 1)
const getCachedRandomWorks = unstable_cache(
  async (limit: number) => {
    console.log('🎲 Executando busca de obras aleatórias (cache miss)');

    try {
      const works = await prisma.work.findMany({
        where: {
          composer: {
            OR: FAMOUS_COMPOSERS.map((name) => ({
              OR: [
                { name: { contains: name, mode: 'insensitive' } },
                { fullName: { contains: name, mode: 'insensitive' } },
              ],
            })),
          },
        },
        select: {
          id: true,
          title: true,
          opOrCatalog: true,
          composer: {
            select: {
              id: true,
              name: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit * 2,
      });

      const shuffledWorks = works
        .sort(() => 0.5 - Math.random())
        .slice(0, limit);

      return {
        works: shuffledWorks.map((work) => ({
          id: work.id,
          title: work.title,
          opOrCatalog: work.opOrCatalog,
          composer: work.composer,
          annotationsCount: 0,
        })),
        total: shuffledWorks.length,
      };
    } catch (error) {
      console.error('❌ Erro na busca aleatória:', error);
      return { works: [], total: 0 };
    }
  },
  ['random-famous-works-v2'],
  {
    revalidate: CACHE_CONFIG.RANDOM_WORKS,
    tags: ['random-works'],
  }
);

// 🚀 ESTRATÉGIA HÍBRIDA: Busca COM filtro de compositor (versão 2 otimizada)
const getCachedWorksWithComposerFilter = unstable_cache(
  async (query: string, composerId: string, limit: number) => {
    console.log('🎼 Busca COM filtro de compositor (estratégia híbrida)');

    try {
      const startTime = Date.now();
      const searchTerm = query.trim();

      // 🔥 ESTRATÉGIA DA VERSÃO 2: MongoDB Aggregation (mais eficiente COM filtro)
      if (searchTerm.length >= 2) {
        try {
          // Usar aggregation quando há termo de busca E filtro de compositor
          const searchPattern = searchTerm.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
          );

          const result = await prisma.work.aggregateRaw({
            pipeline: [
              // Match por compositor primeiro (mais eficiente)
              {
                $match: {
                  composerId: { $oid: composerId },
                },
              },
              // Match adicional por texto
              {
                $match: {
                  $or: [
                    { title: { $regex: searchPattern, $options: 'i' } },
                    { opOrCatalog: { $regex: searchPattern, $options: 'i' } },
                  ],
                },
              },
              // Lookup para compositor
              {
                $lookup: {
                  from: 'Composer',
                  localField: 'composerId',
                  foreignField: '_id',
                  as: 'composer',
                  pipeline: [
                    {
                      $project: {
                        _id: { $toString: '$_id' },
                        name: 1,
                        fullName: 1,
                      },
                    },
                  ],
                },
              },
              { $unwind: '$composer' },
              // Project
              {
                $project: {
                  _id: { $toString: '$_id' },
                  title: 1,
                  opOrCatalog: 1,
                  composer: {
                    id: '$composer._id',
                    name: '$composer.name',
                    fullName: '$composer.fullName',
                  },
                },
              },
              { $sort: { title: 1 } },
              { $limit: limit },
            ],
          });

          const works = Array.isArray(result) ? result : [];
          const formattedWorks = works.map((work: any) => ({
            id: work._id,
            title: work.title,
            opOrCatalog: work.opOrCatalog || null,
            composer: work.composer,
            annotationsCount: 0,
          }));

          const endTime = Date.now();
          console.log(
            `⚡ Busca filtrada (aggregation): ${endTime - startTime}ms`
          );

          return {
            works: formattedWorks,
            total: formattedWorks.length,
          };
        } catch (aggregationError) {
          console.warn(
            '⚠️ Agregação falhou, usando fallback Prisma:',
            aggregationError
          );
        }
      }

      // 🔥 FALLBACK DA VERSÃO 1: Query direta Prisma (sem agregação)
      const whereClause: any = {
        composerId: composerId,
      };

      if (searchTerm.length >= 2) {
        if (searchTerm.length <= 4) {
          whereClause.OR = [
            { title: { startsWith: searchTerm, mode: 'insensitive' } },
            { opOrCatalog: { startsWith: searchTerm, mode: 'insensitive' } },
          ];
        } else {
          whereClause.OR = [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { opOrCatalog: { contains: searchTerm, mode: 'insensitive' } },
          ];
        }
      }

      const works = await prisma.work.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          opOrCatalog: true,
        },
        orderBy: [{ title: 'asc' }],
        take: limit,
      });

      // Buscar compositor separadamente
      const composer = await prisma.composer.findUnique({
        where: { id: composerId },
        select: {
          id: true,
          name: true,
          fullName: true,
        },
      });

      const endTime = Date.now();
      console.log(`⚡ Busca filtrada (fallback): ${endTime - startTime}ms`);

      return {
        works: works.map((work) => ({
          id: work.id,
          title: work.title,
          opOrCatalog: work.opOrCatalog,
          composer: composer || { id: '', name: 'Desconhecido', fullName: '' },
          annotationsCount: 0,
        })),
        total: works.length,
      };
    } catch (error) {
      console.error('❌ Erro na busca filtrada híbrida:', error);
      return { works: [], total: 0 };
    }
  },
  ['works-composer-filtered-hybrid'],
  {
    revalidate: CACHE_CONFIG.SEARCH_FILTERED,
    tags: ['works-search'],
  }
);

// 🚀 ESTRATÉGIA HÍBRIDA: Busca SEM filtro de compositor (OTIMIZADA COM AGGREGATION)
const getCachedWorksGeneral = unstable_cache(
  async (query: string, limit: number) => {
    console.log('🌍 Busca SEM filtro de compositor (aggregation otimizada)');

    try {
      const startTime = Date.now();
      const searchTerm = query.trim();

      // 🔥 NOVA ESTRATÉGIA: MongoDB Aggregation (mais eficiente para grandes volumes)
      if (searchTerm.length >= 2) {
        try {
          const searchPattern = searchTerm.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
          );

          const result = await prisma.work.aggregateRaw({
            pipeline: [
              // 🔥 MATCH OTIMIZADO: Buscar por título, opOrCatalog E nome do compositor
              {
                $match: {
                  $or: [
                    { title: { $regex: searchPattern, $options: 'i' } },
                    { opOrCatalog: { $regex: searchPattern, $options: 'i' } },
                  ],
                },
              },
              // 🔥 LOOKUP OTIMIZADO: Buscar compositor
              {
                $lookup: {
                  from: 'Composer',
                  localField: 'composerId',
                  foreignField: '_id',
                  as: 'composer',
                  pipeline: [
                    {
                      $project: {
                        _id: { $toString: '$_id' },
                        name: 1,
                        fullName: 1,
                      },
                    },
                  ],
                },
              },
              { $unwind: '$composer' },
              // 🔥 MATCH ADICIONAL: Incluir também resultados por nome do compositor
              {
                $match: {
                  $or: [
                    { title: { $regex: searchPattern, $options: 'i' } },
                    { opOrCatalog: { $regex: searchPattern, $options: 'i' } },
                    {
                      'composer.name': { $regex: searchPattern, $options: 'i' },
                    },
                    {
                      'composer.fullName': {
                        $regex: searchPattern,
                        $options: 'i',
                      },
                    },
                  ],
                },
              },
              // Project para formatar saída
              {
                $project: {
                  _id: { $toString: '$_id' },
                  title: 1,
                  opOrCatalog: 1,
                  composer: {
                    id: '$composer._id',
                    name: '$composer.name',
                    fullName: '$composer.fullName',
                  },
                  // 🔥 CAMPO PARA ORDENAÇÃO: Priorizar matches no título
                  sortPriority: {
                    $cond: {
                      if: {
                        $or: [
                          {
                            $regexMatch: {
                              input: '$title',
                              regex: searchPattern,
                              options: 'i',
                            },
                          },
                          {
                            $regexMatch: {
                              input: '$opOrCatalog',
                              regex: searchPattern,
                              options: 'i',
                            },
                          },
                        ],
                      },
                      then: 1, // Prioridade 1 para matches em título/op
                      else: 2, // Prioridade 2 para matches em compositor
                    },
                  },
                },
              },
              // 🔥 SORT OTIMIZADO: Por prioridade e depois por título
              {
                $sort: {
                  sortPriority: 1,
                  title: 1,
                },
              },
              { $limit: limit },
            ],
          });

          const works = Array.isArray(result) ? result : [];
          const formattedWorks = works.map((work: any) => ({
            id: work._id,
            title: work.title,
            opOrCatalog: work.opOrCatalog || null,
            composer: work.composer,
            annotationsCount: 0,
          }));

          const endTime = Date.now();
          console.log(
            `⚡ Busca geral (aggregation): ${endTime - startTime}ms - ${
              formattedWorks.length
            } resultados`
          );

          return {
            works: formattedWorks,
            total: formattedWorks.length,
          };
        } catch (aggregationError) {
          console.warn(
            '⚠️ Agregação geral falhou, usando fallback Prisma:',
            aggregationError
          );
        }
      }

      // 🔥 FALLBACK OTIMIZADO: Query mais simples se agregação falhar
      console.log('🔄 Usando fallback otimizado...');

      const works = await prisma.work.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { opOrCatalog: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          opOrCatalog: true,
          composerId: true,
        },
        orderBy: [{ title: 'asc' }],
        take: limit,
      });

      // Buscar compositores em batch
      const composerIds = [...new Set(works.map((w) => w.composerId))];
      const composers = await prisma.composer.findMany({
        where: { id: { in: composerIds } },
        select: { id: true, name: true, fullName: true },
      });

      const composerMap = new Map(composers.map((c) => [c.id, c]));

      const endTime = Date.now();
      console.log(
        `⚡ Busca geral (fallback): ${endTime - startTime}ms - ${
          works.length
        } resultados`
      );

      return {
        works: works.map((work) => ({
          id: work.id,
          title: work.title,
          opOrCatalog: work.opOrCatalog,
          composer: composerMap.get(work.composerId) || {
            id: '',
            name: 'Desconhecido',
            fullName: '',
          },
          annotationsCount: 0,
        })),
        total: works.length,
      };
    } catch (error) {
      console.error('❌ Erro na busca geral otimizada:', error);

      // 🔥 FALLBACK ULTRA SIMPLES: Apenas título
      try {
        console.log('🚀 Usando fallback ultra simples...');

        const fallbackWorks = await prisma.work.findMany({
          where: {
            title: { contains: query, mode: 'insensitive' },
          },
          select: {
            id: true,
            title: true,
            opOrCatalog: true,
            composerId: true,
          },
          orderBy: [{ title: 'asc' }],
          take: limit,
        });

        const composerIds = [
          ...new Set(fallbackWorks.map((w) => w.composerId)),
        ];
        const composers = await prisma.composer.findMany({
          where: { id: { in: composerIds } },
          select: { id: true, name: true, fullName: true },
        });

        const composerMap = new Map(composers.map((c) => [c.id, c]));

        return {
          works: fallbackWorks.map((work) => ({
            id: work.id,
            title: work.title,
            opOrCatalog: work.opOrCatalog,
            composer: composerMap.get(work.composerId) || {
              id: '',
              name: 'Desconhecido',
              fullName: '',
            },
            annotationsCount: 0,
          })),
          total: fallbackWorks.length,
        };
      } catch (fallbackError) {
        console.error('❌ Todos os fallbacks falharam:', fallbackError);
        return { works: [], total: 0 };
      }
    }
  },
  ['works-general-hybrid-v2'],
  {
    revalidate: CACHE_CONFIG.SEARCH_GENERAL,
    tags: ['works-search'],
  }
);

// 🚀 BUSCA DE COMPOSITOR SEM QUERY (da versão 1 - já otimizada)
const getCachedComposerWorks = unstable_cache(
  async (composerId: string, limit: number) => {
    console.log('🎼 Buscando obras do compositor (sem query):', composerId);

    try {
      const startTime = Date.now();

      const works = await prisma.work.findMany({
        where: {
          composerId: composerId,
        },
        select: {
          id: true,
          title: true,
          opOrCatalog: true,
        },
        orderBy: [{ title: 'asc' }],
        take: limit,
      });

      const composer = await prisma.composer.findUnique({
        where: { id: composerId },
        select: {
          id: true,
          name: true,
          fullName: true,
        },
      });

      const endTime = Date.now();
      console.log(`⚡ Query compositor sem busca: ${endTime - startTime}ms`);

      return {
        works: works.map((work) => ({
          id: work.id,
          title: work.title,
          opOrCatalog: work.opOrCatalog,
          composer: composer || { id: '', name: 'Desconhecido', fullName: '' },
          annotationsCount: 0,
        })),
        total: works.length,
      };
    } catch (error) {
      console.error('❌ Erro ao buscar obras do compositor:', error);
      return { works: [], total: 0 };
    }
  },
  ['composer-works-hybrid'],
  {
    revalidate: CACHE_CONFIG.COMPOSER_WORKS,
    tags: ['composer-works'],
  }
);

// 🚀 FUNÇÃO PRINCIPAL DA API - ESTRATÉGIA HÍBRIDA
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const isRandom = searchParams.get('random') === 'true';
    const isFamous = searchParams.get('famous') === 'true';
    const composerFilter = searchParams.get('composer') || '';

    // 🚀 ROTA 1: Obras aleatórias
    if (isRandom && isFamous) {
      console.log('🎲 Modo: Obras aleatórias');
      const result = await getCachedRandomWorks(limit);
      return NextResponse.json(result);
    }

    // 🚀 ROTA 2: Obras de compositor SEM query
    if (!query && composerFilter && composerFilter.trim() !== '') {
      console.log('🎼 Modo: Obras de compositor (sem query)');
      const result = await getCachedComposerWorks(composerFilter, limit);
      return NextResponse.json(result);
    }

    // 🚀 ROTA 3: Query muito curta
    if (query && query.length < 2) {
      console.log('🔍 Query muito curta, retornando vazio');
      return NextResponse.json({ works: [], total: 0 });
    }

    // 🚀 ROTA 4: ESTRATÉGIA HÍBRIDA - COM filtro de compositor
    if (query && composerFilter && composerFilter.trim() !== '') {
      console.log(
        '🎯 Modo: Busca COM filtro (estratégia híbrida - aggregation)'
      );
      const result = await getCachedWorksWithComposerFilter(
        query,
        composerFilter,
        limit
      );
      return NextResponse.json(result);
    }

    // 🚀 ROTA 5: ESTRATÉGIA HÍBRIDA - SEM filtro de compositor (AGGREGATION OTIMIZADA)
    if (query) {
      console.log('🌍 Modo: Busca SEM filtro (aggregation otimizada)');
      const result = await getCachedWorksGeneral(query, limit);
      return NextResponse.json(result);
    }

    // 🚀 ROTA 6: Sem parâmetros
    console.log('❌ Nenhum parâmetro válido');
    return NextResponse.json({ works: [], total: 0 });
  } catch (error) {
    console.error('❌ Erro geral na API híbrida:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        works: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
