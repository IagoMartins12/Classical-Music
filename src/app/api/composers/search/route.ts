// app/api/composers/search/route.ts
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    console.log('TESTE', request);
    const searchTerm = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    let composers;

    if (!searchTerm.trim()) {
      // Se não há busca, retorna compositores populares
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

    const formattedComposers = composers.map((composer) => ({
      id: composer.id,
      name: composer.name,
      fullName: composer.fullName || undefined,
      worksCount: composer._count.works,
    }));

    return NextResponse.json(formattedComposers);
  } catch (error) {
    console.error('Erro ao buscar compositores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
