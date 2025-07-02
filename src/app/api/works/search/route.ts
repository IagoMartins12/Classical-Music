// app/api/works/search/route.ts - API PARA BUSCA DE OBRAS
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

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

    console.log('🔍 Buscando obras:', { query, limit });

    // Buscar obras que correspondem ao termo
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
          {
            opOrCatalog: {
              contains: query,
              mode: 'insensitive',
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
            name: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            workAnnotations: true,
          },
        },
      },
      orderBy: [
        // Priorizar obras com mais anotações
        {
          workAnnotations: {
            _count: 'desc',
          },
        },
        // Depois por título
        {
          title: 'asc',
        },
      ],
      take: limit,
    });

    console.log('✅ Obras encontradas:', works.length);

    return NextResponse.json({
      works: works.map((work) => ({
        id: work.id,
        title: work.title,
        opOrCatalog: work.opOrCatalog,
        composer: work.composer,
        annotationsCount: work._count.workAnnotations,
      })),
      total: works.length,
    });
  } catch (error) {
    console.error('Erro ao buscar obras:', error);
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
