// app/api/composers/route.ts - VERSÃO MELHORADA
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

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
  'Robert Schumann',
  'Sergei Rachmaninoff',
  'Maurice Ravel',
  'Giuseppe Verdi',
  'Richard Wagner',
  'Felix Mendelssohn',
  'Dmitri Shostakovich',
  'Igor Stravinsky',
  'George Frideric Handel',
  'Joseph Haydn',
];

// Método GET (mantido para compatibilidade)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q') || '';
    const composerId = searchParams.get('id') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('GET - Parâmetros recebidos:', {
      searchTerm,
      composerId,
      limit,
    });

    // Se tem ID, busca compositor específico
    if (composerId) {
      const composer = await getComposerById(composerId);
      return NextResponse.json(composer);
    }

    // Senão, faz busca normal
    const composers = await searchComposers(searchTerm, limit);
    return NextResponse.json(composers);
  } catch (error) {
    console.error('Erro ao buscar compositores (GET):', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Método POST (implementação melhorada)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { q: searchTerm = '', id: composerId = '', limit = 20 } = body;

    console.log('POST - Parâmetros recebidos:', {
      searchTerm,
      composerId,
      limit,
    });

    // Se tem ID, busca compositor específico
    if (composerId) {
      const composer = await getComposerById(composerId);
      console.log('✅ Compositor encontrado por ID:', composer?.name || 'null');
      return NextResponse.json(composer);
    }

    // Senão, faz busca normal
    const composers = await searchComposers(searchTerm, limit);
    console.log(
      '📊 Busca concluída:',
      composers.length,
      'compositores encontrados'
    );
    return NextResponse.json(composers);
  } catch (error) {
    console.error('❌ Erro ao buscar compositores (POST):', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função auxiliar para buscar compositores
async function searchComposers(searchTerm: string, limit: number) {
  let composers;

  if (!searchTerm.trim()) {
    // Se não há busca, retorna compositores populares
    console.log('🔍 Buscando compositores populares...');
    composers = await prisma.composer.findMany({
      where: {
        OR: FAMOUS_COMPOSERS.map((name) => ({
          OR: [
            { name: { contains: name, mode: 'insensitive' } },
            { fullName: { contains: name, mode: 'insensitive' } },
          ],
        })),
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        _count: {
          select: {
            works: true,
          },
        },
      },
      orderBy: {
        works: {
          _count: 'desc',
        },
      },
      take: limit,
    });
  } else {
    // Busca por termo específico
    console.log('🔍 Buscando compositores por termo:', searchTerm);
    composers = await prisma.composer.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            fullName: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            alternativeNames: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        _count: {
          select: {
            works: true,
          },
        },
      },
      orderBy: [
        {
          works: {
            _count: 'desc',
          },
        },
        {
          name: 'asc',
        },
      ],
      take: limit,
    });
  }

  return composers.map((composer) => ({
    id: composer.id,
    name: composer.name,
    fullName: composer.fullName || undefined,
    worksCount: composer._count.works,
  }));
}

// Função auxiliar para buscar compositor por ID - MELHORADA
async function getComposerById(composerId: string) {
  try {
    console.log('🔍 Buscando compositor por ID:', composerId);

    const composer = await prisma.composer.findUnique({
      where: {
        id: composerId,
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        alternativeNames: true,
        epoch: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            works: true,
          },
        },
      },
    });

    if (!composer) {
      console.log('⚠️ Compositor não encontrado para ID:', composerId);
      return null;
    }

    console.log('✅ Compositor encontrado:', composer.name);
    return {
      id: composer.id,
      name: composer.name,
      fullName: composer.fullName || undefined,
      alternativeNames: composer.alternativeNames || undefined,
      worksCount: composer._count.works,
      epoch: composer.epoch || undefined,
    };
  } catch (error) {
    console.error('❌ Erro ao buscar compositor por ID:', error);
    return null;
  }
}
