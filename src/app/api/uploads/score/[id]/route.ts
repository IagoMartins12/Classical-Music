// app/api/uploads/score/[id]/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar partitura existente
    const existingScore = await prisma.workScore.findUnique({
      where: { id: params.id },
    });

    if (!existingScore) {
      return NextResponse.json(
        { error: 'Partitura não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = existingScore.uploadedBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Deletar partitura
    await prisma.workScore.delete({
      where: { id: params.id },
    });

    await revalidateUploadsCache(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Partitura excluída com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir partitura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// app/api/uploads/external-sources/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidateUploadsCache } from '@/app/requests/upload';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type'); // 'composer' | 'work' | 'score'

    if (!query) {
      return NextResponse.json(
        { error: 'Query é obrigatório' },
        { status: 400 }
      );
    }

    const sources = [];

    // IMSLP API (se disponível)
    if (type === 'composer' || type === 'work') {
      try {
        // Simular busca no IMSLP (implementar integração real conforme necessário)
        const imslpResults = await searchIMSLP(query, type);
        sources.push({
          name: 'IMSLP',
          results: imslpResults,
        });
      } catch (error) {
        console.error('Erro ao buscar no IMSLP:', error);
      }
    }

    // Musicbrainz API (para compositores)
    if (type === 'composer') {
      try {
        const mbResults = await searchMusicBrainz(query);
        sources.push({
          name: 'MusicBrainz',
          results: mbResults,
        });
      } catch (error) {
        console.error('Erro ao buscar no MusicBrainz:', error);
      }
    }

    // Wikipedia API (para informações gerais)
    try {
      const wikiResults = await searchWikipedia(query);
      sources.push({
        name: 'Wikipedia',
        results: wikiResults,
      });
    } catch (error) {
      console.error('Erro ao buscar na Wikipedia:', error);
    }

    return NextResponse.json({ sources });
  } catch (error) {
    console.error('Erro ao buscar fontes externas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Funções auxiliares para busca em APIs externas
async function searchIMSLP(query: string, type: string) {
  // Implementar integração com IMSLP API
  // Por enquanto, retornar dados simulados
  return [
    {
      id: `imslp-${Date.now()}`,
      title: `${query} (IMSLP)`,
      url: `https://imslp.org/wiki/${encodeURIComponent(query)}`,
      description: 'Encontrado no IMSLP',
    },
  ];
}

async function searchMusicBrainz(query: string) {
  try {
    const response = await fetch(
      `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(
        query
      )}&limit=5&fmt=json`
    );

    if (!response.ok) {
      throw new Error('Erro na busca MusicBrainz');
    }

    const data = await response.json();

    return (
      data.artists?.map((artist: any) => ({
        id: artist.id,
        title: artist.name,
        url: `https://musicbrainz.org/artist/${artist.id}`,
        description: `${artist.type || 'Artista'} - ${
          artist['life-span']?.begin || 'Data desconhecida'
        }`,
        additionalInfo: {
          type: artist.type,
          country: artist.country,
          lifeSpan: artist['life-span'],
          aliases: artist.aliases?.slice(0, 3),
        },
      })) || []
    );
  } catch (error) {
    console.error('Erro na busca MusicBrainz:', error);
    return [];
  }
}

async function searchWikipedia(query: string) {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        query
      )}`
    );

    if (!response.ok) {
      throw new Error('Erro na busca Wikipedia');
    }

    const data = await response.json();

    return [
      {
        id: `wiki-${data.pageid}`,
        title: data.title,
        url: data.content_urls?.desktop?.page,
        description: data.extract,
        thumbnail: data.thumbnail?.source,
      },
    ];
  } catch (error) {
    console.error('Erro na busca Wikipedia:', error);
    return [];
  }
}
