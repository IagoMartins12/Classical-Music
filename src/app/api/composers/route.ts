// app/api/composers/route.ts - VERSÃO MELHORADA COM BUSCA POR permLinkImslp
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
    const permLinkImslp = searchParams.get('imslpId') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('GET - Parâmetros recebidos:', {
      searchTerm,
      composerId,
      imslpId: permLinkImslp,
      limit,
    });

    // Se tem imslpId, busca compositor por imslpId
    if (permLinkImslp) {
      const composer = await getComposerByImslpId(permLinkImslp);
      return NextResponse.json(composer);
    }

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
    const {
      q: searchTerm = '',
      id: composerId = '',
      permLinkImslp = '',
      limit = 20,
    } = body;

    console.log('POST - Parâmetros recebidos:', {
      searchTerm,
      composerId,
      permLinkImslp,
      limit,
    });

    // 🆕 NOVO: Se tem permLinkImslp, busca compositor por imslpId
    if (permLinkImslp) {
      const composer = await getComposerByImslpId(permLinkImslp);
      console.log('✅ Busca por imslpId concluída:', composer?.name || 'null');
      return NextResponse.json(composer);
    }

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

// 🆕 NOVA: Função para buscar compositor por imslpId
async function getComposerByImslpId(imslpId: string) {
  try {
    // Limpar e normalizar o imslpId antes de buscar
    const cleanedImslpId = cleanImslpId(imslpId);
    console.log('🔍 Buscando compositor por imslpId:', cleanedImslpId);

    const composer = await prisma.composer.findFirst({
      where: {
        imslpId: cleanedImslpId,
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        alternativeNames: true,
        imslpId: true,
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
      console.log('⚠️ Compositor não encontrado para imslpId:', cleanedImslpId);
      return null;
    }

    console.log('✅ Compositor encontrado por imslpId:', composer.name);
    return {
      id: composer.id,
      name: composer.name,
      fullName: composer.fullName || undefined,
      alternativeNames: composer.alternativeNames || undefined,
      imslpId: composer.imslpId || undefined,
      worksCount: composer._count.works,
      epoch: composer.epoch || undefined,
    };
  } catch (error) {
    console.error('❌ Erro ao buscar compositor por imslpId:', error);
    return null;
  }
}

/**
 * Limpa e normaliza o imslpId antes de buscar no banco
 * @param imslpId - ID do IMSLP a ser limpo
 * @returns ID limpo e normalizado
 */
function cleanImslpId(imslpId: string): string {
  if (!imslpId) return '';

  try {
    // Decodificar caracteres URL (ex: %C3%A9 -> é)
    let cleaned = decodeURIComponent(imslpId);

    // Remover espaços extras
    cleaned = cleaned.trim();

    // Garantir que tenha o formato correto
    if (!cleaned.startsWith('Category:')) {
      cleaned = `Category:${cleaned}`;
    }

    console.log(`🧹 ImslpId limpo: ${imslpId} -> ${cleaned}`);
    return cleaned;
  } catch (error) {
    console.error('❌ Erro ao limpar imslpId:', error);
    // Se der erro na decodificação, tentar uma limpeza básica
    let cleaned = imslpId.trim();
    if (!cleaned.startsWith('Category:')) {
      cleaned = `Category:${cleaned}`;
    }
    return cleaned;
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
        imslpId: true,
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
      select: {
        id: true,
        name: true,
        fullName: true,
        imslpId: true,
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
    imslpId: composer.imslpId || undefined,
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
        imslpId: true,
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
      imslpId: composer.imslpId || undefined,
      worksCount: composer._count.works,
      epoch: composer.epoch || undefined,
    };
  } catch (error) {
    console.error('❌ Erro ao buscar compositor por ID:', error);
    return null;
  }
}
