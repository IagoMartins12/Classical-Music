// app/api/works/route.ts - API para busca de obras (GET e POST)
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const id = searchParams.get('id');

    // Se tem ID específico, buscar por ID
    if (id) {
      const work = await prisma.work.findUnique({
        where: { id },
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
          instrument: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              workAnnotations: true,
            },
          },
        },
      });

      if (work) {
        return NextResponse.json([
          {
            id: work.id,
            title: work.title,
            opOrCatalog: work.opOrCatalog,
            composer: work.composer,
            instrumentName: work.instrument.name,
            annotationsCount: work._count.workAnnotations,
          },
        ]);
      } else {
        return NextResponse.json([]);
      }
    }

    // Busca normal por query
    if (!query || query.length < 2) {
      // Retornar obras populares se não há query
      const works = await prisma.work.findMany({
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
          instrument: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              workAnnotations: true,
            },
          },
        },
        orderBy: [
          {
            workAnnotations: {
              _count: 'desc',
            },
          },
          {
            title: 'asc',
          },
        ],
        take: limit,
      });

      return NextResponse.json(
        works.map((work) => ({
          id: work.id,
          title: work.title,
          opOrCatalog: work.opOrCatalog,
          composer: work.composer,
          instrumentName: work.instrument.name,
          annotationsCount: work._count.workAnnotations,
        }))
      );
    }

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
        instrument: {
          select: {
            name: true,
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

    return NextResponse.json(
      works.map((work) => ({
        id: work.id,
        title: work.title,
        opOrCatalog: work.opOrCatalog,
        composer: work.composer,
        instrumentName: work.instrument.name,
        annotationsCount: work._count.workAnnotations,
      }))
    );
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { q: query = '', limit: requestLimit = 10, id } = body;
    const limit = Math.min(parseInt(requestLimit.toString()), 50);

    // Se tem ID específico, buscar por ID
    if (id) {
      const work = await prisma.work.findUnique({
        where: { id },
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
          instrument: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              workAnnotations: true,
            },
          },
        },
      });

      if (work) {
        return NextResponse.json([
          {
            id: work.id,
            title: work.title,
            opOrCatalog: work.opOrCatalog,
            composer: work.composer,
            instrumentName: work.instrument.name,
            annotationsCount: work._count.workAnnotations,
          },
        ]);
      } else {
        return NextResponse.json([]);
      }
    }

    // Busca normal por query
    if (!query || query.length < 2) {
      // Retornar obras populares se não há query
      const works = await prisma.work.findMany({
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
          instrument: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              workAnnotations: true,
            },
          },
        },
        orderBy: [
          {
            workAnnotations: {
              _count: 'desc',
            },
          },
          {
            title: 'asc',
          },
        ],
        take: limit,
      });

      return NextResponse.json(
        works.map((work) => ({
          id: work.id,
          title: work.title,
          opOrCatalog: work.opOrCatalog,
          composer: work.composer,
          instrumentName: work.instrument.name,
          annotationsCount: work._count.workAnnotations,
        }))
      );
    }

    console.log('🔍 Buscando obras via POST:', { query, limit });

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
        instrument: {
          select: {
            name: true,
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

    console.log('✅ Obras encontradas via POST:', works.length);

    return NextResponse.json(
      works.map((work) => ({
        id: work.id,
        title: work.title,
        opOrCatalog: work.opOrCatalog,
        composer: work.composer,
        instrumentName: work.instrument.name,
        annotationsCount: work._count.workAnnotations,
      }))
    );
  } catch (error) {
    console.error('Erro ao buscar obras via POST:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}
