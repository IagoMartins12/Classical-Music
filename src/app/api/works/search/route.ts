// app/api/works/search/route.ts - VERSÃO CORRIGIDA PARA OBJECTID
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

// Cache para termos de busca comuns (5 minutos)
const getCachedWorksSearch = unstable_cache(
  async (query: string, limit: number) => {
    console.log('🔍 Executando busca não-cacheada:', { query, limit });

    // Para queries curtas, usar busca direta
    if (query.length < 3) {
      return {
        works: [],
        total: 0,
      };
    }

    try {
      // 🆕 OTIMIZAÇÃO 1: Query mais eficiente usando regex string para MongoDB
      const searchPattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // 🆕 OTIMIZAÇÃO 2: Pipeline de agregação otimizado com conversão correta de ObjectId
      const result = await prisma.work.aggregateRaw({
        pipeline: [
          // Match stage - mais eficiente que where do Prisma
          {
            $match: {
              $or: [
                { title: { $regex: searchPattern, $options: 'i' } },
                { opOrCatalog: { $regex: searchPattern, $options: 'i' } },
              ],
            },
          },
          // Lookup para compositor (mais eficiente que join do Prisma)
          {
            $lookup: {
              from: 'Composer',
              localField: 'composerId',
              foreignField: '_id',
              as: 'composer',
              pipeline: [
                {
                  $project: {
                    _id: { $toString: '$_id' }, // 🔧 CONVERSÃO CORRETA DO OBJECTID
                    name: 1,
                    fullName: 1,
                  },
                },
              ],
            },
          },
          // Unwind para simplificar o composer
          {
            $unwind: '$composer',
          },
          // Match adicional para buscar no nome do compositor
          {
            $match: {
              $or: [
                { title: { $regex: searchPattern, $options: 'i' } },
                { opOrCatalog: { $regex: searchPattern, $options: 'i' } },
                { 'composer.name': { $regex: searchPattern, $options: 'i' } },
                {
                  'composer.fullName': { $regex: searchPattern, $options: 'i' },
                },
              ],
            },
          },
          // Project para selecionar campos e converter ObjectIds
          {
            $project: {
              _id: { $toString: '$_id' }, // 🔧 CONVERSÃO CORRETA DO OBJECTID DA WORK
              title: 1,
              opOrCatalog: 1,
              composer: {
                id: '$composer._id', // Já convertido acima
                name: '$composer.name',
                fullName: '$composer.fullName',
              },
              createdAt: 1,
            },
          },
          // Sort - mais simples, apenas por título
          {
            $sort: {
              title: 1,
            },
          },
          // Limit
          {
            $limit: limit,
          },
        ],
      });

      // Converter resultado com cast correto
      const works = Array.isArray(result) ? result : [];

      // 🔧 FORMATAÇÃO CORRIGIDA - ObjectId já convertido no pipeline
      const formattedWorks = works.map((work: any) => ({
        id: work._id, // Já é string graças ao $toString no pipeline
        title: work.title,
        opOrCatalog: work.opOrCatalog || null,
        composer: work.composer, // Já tem a estrutura correta
        annotationsCount: 0, // Removido para performance - pode ser adicionado depois se necessário
      }));

      console.log('✅ Obras encontradas (otimizado):', formattedWorks.length);

      return {
        works: formattedWorks,
        total: formattedWorks.length,
      };
    } catch (error) {
      console.error(
        '❌ Erro na busca agregada, fallback para busca simples:',
        error
      );

      // 🆕 FALLBACK: Busca simples se a agregação falhar (Prisma já trata ObjectIds corretamente)
      const works = await prisma.work.findMany({
        where: {
          OR: [
            {
              title: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              opOrCatalog: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              composer: {
                OR: [
                  {
                    name: {
                      contains: query,
                      mode: 'insensitive',
                    },
                  },
                  {
                    fullName: {
                      contains: query,
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
          opOrCatalog: true,
          composer: {
            select: {
              id: true, // 🔧 USAR id EM VEZ DE _id NO PRISMA
              name: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          title: 'asc', // Ordenação mais simples
        },
        take: limit,
      });

      return {
        works: works.map((work) => ({
          id: work.id,
          title: work.title,
          opOrCatalog: work.opOrCatalog,
          composer: {
            id: work.composer.id, // 🔧 ESTRUTURA CONSISTENTE
            name: work.composer.name,
            fullName: work.composer.fullName,
          },
          annotationsCount: 0,
        })),
        total: works.length,
      };
    }
  },
  ['works-search'],
  {
    revalidate: 300, // 5 minutos
    tags: ['works-search'],
  }
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    if (!query || query.length < 2) {
      return NextResponse.json({
        works: [],
        total: 0,
      });
    }

    // 🆕 CACHE INTELIGENTE: Para queries comuns, usar cache
    const result = await getCachedWorksSearch(query, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Erro geral na API de busca:', error);
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
