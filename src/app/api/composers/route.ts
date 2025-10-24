// app/api/composers/route.ts - CORRIGIDO COM CAMPOS DO SCHEMA
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

// ✅ Define quais campos retornar baseado em fullData
function getComposerSelect(fullData: boolean = false) {
  if (fullData) {
    // Retorna TODOS os campos disponíveis no schema
    return {
      id: true,
      name: true,
      fullName: true,
      alternativeNames: true,
      imslpId: true,
      portraitUrl: true,
      epochName: true,
      birthDate: true,
      deathDate: true,
      nationality: true,
      instruments: true,
      bio: true,
      permLinkImslp: true,
      wikipediaLink: true,
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
    };
  } else {
    // Retorna apenas campos básicos (modo leve)
    return {
      id: true,
      name: true,
      fullName: true,
      imslpId: true,
      portraitUrl: true,
      epochName: true,
      _count: {
        select: {
          works: true,
        },
      },
    };
  }
}

// ✅ Formata a resposta baseado em fullData
function formatComposerResponse(composer: any, fullData: boolean = false) {
  const baseResponse = {
    id: composer.id,
    name: composer.name,
    fullName: composer.fullName || undefined,
    imslpId: composer.imslpId || undefined,
    worksCount: composer._count?.works || 0,
    portraitUrl: composer.portraitUrl || undefined,
    epochName: composer.epochName || undefined,
  };

  if (!fullData) {
    return baseResponse;
  }

  // Adiciona todos os campos extras quando fullData = true
  return {
    ...baseResponse,
    alternativeNames: composer.alternativeNames || undefined,
    epoch: composer.epoch || undefined,
    birthDate: composer.birthDate || undefined,
    deathDate: composer.deathDate || undefined,
    nationality: composer.nationality || undefined,
    instruments: composer.instruments || undefined,
    bio: composer.bio || undefined,
    permLinkImslp: composer.permLinkImslp || undefined,
    wikipediaLink: composer.wikipediaLink || undefined,
  };
}

// Método GET
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q') || '';
    const composerId = searchParams.get('id') || '';
    const permLinkImslp = searchParams.get('imslpId') || '';
    const workId = searchParams.get('workId') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const fullData = searchParams.get('fullData') === 'true';

    console.log('📡 GET /api/composers - fullData:', fullData);

    if (permLinkImslp) {
      const composer = await getComposerByImslpId(permLinkImslp, fullData);
      return NextResponse.json(composer);
    }

    if (composerId) {
      const composer = await getComposerById(composerId, fullData);
      return NextResponse.json(composer);
    }

    if (workId) {
      const composer = await getComposerByWorkId(workId, fullData);
      return NextResponse.json(composer);
    }

    const composers = await searchComposers(searchTerm, limit, fullData);
    return NextResponse.json(composers);
  } catch (error) {
    console.error('❌ Erro ao buscar compositores (GET):', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Método POST
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      q: searchTerm = '',
      id: composerId = '',
      workId: workId = '',
      permLinkImslp = '',
      limit = 20,
      fullData = false,
    } = body;

    console.log('📡 POST /api/composers - fullData:', fullData);

    if (permLinkImslp) {
      const composer = await getComposerByImslpId(permLinkImslp, fullData);
      return NextResponse.json(composer);
    }

    if (composerId) {
      const composer = await getComposerById(composerId, fullData);
      return NextResponse.json(composer);
    }

    if (workId) {
      const composer = await getComposerByWorkId(workId, fullData);
      return NextResponse.json(composer);
    }

    const composers = await searchComposers(searchTerm, limit, fullData);
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

async function getComposerByImslpId(
  imslpId: string,
  fullData: boolean = false
) {
  try {
    const cleanedImslpId = cleanImslpId(imslpId);
    console.log('🔍 Buscando compositor por imslpId:', cleanedImslpId);

    const composer = await prisma.composer.findFirst({
      where: {
        imslpId: cleanedImslpId,
      },
      select: getComposerSelect(fullData),
    });

    if (!composer) {
      console.log('⚠️ Compositor não encontrado para imslpId:', cleanedImslpId);
      return null;
    }

    console.log('✅ Compositor encontrado por imslpId:', composer.name);
    if (fullData) {
      console.log('📊 Retornando dados completos');
    }

    return formatComposerResponse(composer, fullData);
  } catch (error) {
    console.error('❌ Erro ao buscar compositor por imslpId:', error);
    return null;
  }
}

function cleanImslpId(imslpId: string): string {
  if (!imslpId) return '';

  try {
    let cleaned = decodeURIComponent(imslpId);
    cleaned = cleaned.trim();

    if (!cleaned.startsWith('Category:')) {
      cleaned = `Category:${cleaned}`;
    }

    console.log(`🧹 ImslpId limpo: ${imslpId} -> ${cleaned}`);
    return cleaned;
  } catch (error) {
    console.error('❌ Erro ao limpar imslpId:', error);
    let cleaned = imslpId.trim();
    if (!cleaned.startsWith('Category:')) {
      cleaned = `Category:${cleaned}`;
    }
    return cleaned;
  }
}

async function searchComposers(
  searchTerm: string,
  limit: number,
  fullData: boolean = false
) {
  let composers;

  if (!searchTerm.trim()) {
    // Compositores populares
    composers = await prisma.composer.findMany({
      where: {
        OR: FAMOUS_COMPOSERS.map((name) => ({
          OR: [
            { name: { contains: name, mode: 'insensitive' } },
            { fullName: { contains: name, mode: 'insensitive' } },
          ],
        })),
      },
      select: getComposerSelect(fullData),
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
    const terms = searchTerm.trim().split(/\s+/);

    composers = await prisma.composer.findMany({
      where: {
        OR: [
          {
            AND: terms.map((term) => ({
              name: {
                contains: term,
                mode: 'insensitive',
              },
            })),
          },
          {
            AND: terms.map((term) => ({
              fullName: {
                contains: term,
                mode: 'insensitive',
              },
            })),
          },
          {
            AND: terms.map((term) => ({
              alternativeNames: {
                contains: term,
                mode: 'insensitive',
              },
            })),
          },
          {
            imslpId: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: getComposerSelect(fullData),
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

  return composers.map((composer) =>
    formatComposerResponse(composer, fullData)
  );
}

async function getComposerById(composerId: string, fullData: boolean = false) {
  try {
    const composer = await prisma.composer.findUnique({
      where: {
        id: composerId,
      },
      select: getComposerSelect(fullData),
    });

    if (!composer) {
      console.log('⚠️ Compositor não encontrado para ID:', composerId);
      return null;
    }

    console.log('✅ Compositor encontrado:', composer.name);
    if (fullData) {
      console.log('📊 Retornando dados completos:', Object.keys(composer));
    }

    return formatComposerResponse(composer, fullData);
  } catch (error) {
    console.error('❌ Erro ao buscar compositor por ID:', error);
    return null;
  }
}

async function getComposerByWorkId(workId: string, fullData: boolean = false) {
  try {
    const work = await prisma.work.findUnique({
      where: {
        id: workId,
      },
      select: {
        composer: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!work) return null;

    const composer = await prisma.composer.findUnique({
      where: {
        id: work.composer.id,
      },
      select: getComposerSelect(fullData),
    });

    if (!composer) {
      return null;
    }

    if (fullData) {
      console.log('📊 Retornando dados completos para compositor da obra');
    }

    return formatComposerResponse(composer, fullData);
  } catch (error) {
    console.error('❌ Erro ao buscar compositor por workId:', error);
    return null;
  }
}
