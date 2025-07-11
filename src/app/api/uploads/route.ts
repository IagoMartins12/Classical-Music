// app/api/uploads/route.ts - API ATUALIZADA COM NOVOS FILTROS
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { getUserUploads, getAllUploads } from '@/app/requests/upload';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parâmetros existentes
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'all';
    const epochId = searchParams.get('epoch') || '';

    // 🆕 Novos parâmetros de filtro
    const composerId = searchParams.get('composer') || '';
    const workId = searchParams.get('work') || '';
    const limitPerType = searchParams.get('limitPerType') === 'true';

    // Verificar se é admin para decidir qual função usar
    const isAdmin = session.user.role === 2;

    let uploadsData;

    if (isAdmin && searchParams.get('scope') === 'all') {
      // Admin visualizando todos os uploads
      uploadsData = await getAllUploads({
        page,
        limit,
        search,
        type,
        epochId,
      });
    } else {
      // Usuário comum ou admin visualizando próprios uploads
      uploadsData = await getUserUploads({
        userId: session.user.id,
        page,
        limit,
        search,
        type,
        epochId,
        composerId, // 🆕
        workId, // 🆕
        limitPerType, // 🆕
      });
    }

    // Calcular totalPages baseado no tipo
    let totalPages = 1;
    if (type === 'all') {
      totalPages = Math.ceil(uploadsData.totalCount / limit);
    } else if (type === 'composer') {
      totalPages = Math.ceil(uploadsData.composerCount / limit);
    } else if (type === 'work') {
      totalPages = Math.ceil(uploadsData.workCount / limit);
    } else if (type === 'score') {
      totalPages = Math.ceil(uploadsData.scoreCount / limit);
    }

    return NextResponse.json({
      uploads: uploadsData.items,
      composers: uploadsData.composers,
      works: uploadsData.works,
      scores: uploadsData.scores,
      totalCount: uploadsData.totalCount,
      composerCount: uploadsData.composerCount || 0,
      workCount: uploadsData.workCount || 0,
      scoreCount: uploadsData.scoreCount || 0,
      hasMoreComposers: uploadsData.hasMoreComposers || false,
      hasMoreWorks: uploadsData.hasMoreWorks || false,
      hasMoreScores: uploadsData.hasMoreScores || false,
      currentPage: page,
      totalPages,
      filters: {
        search,
        type,
        epochId,
        composerId, // 🆕
        workId, // 🆕
      },
    });
  } catch (error) {
    console.error('Erro na API de uploads:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
