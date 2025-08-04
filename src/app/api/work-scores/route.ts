// app/api/work-scores/route.ts - API CORRIGIDA COM LIMITE POR TIPO
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

// ✅ FUNÇÃO AUXILIAR PARA CLASSIFICAR TIPO
function classifyScoreType(workScore: any): string {
  if (workScore.source === 'UPLOAD' || workScore.source === 'CUSTOM') {
    return 'uploads';
  }

  const type = workScore.type?.toLowerCase() || '';

  if (type.includes('score')) return 'scores';
  if (type.includes('part')) return 'parts';
  if (type.includes('arrangement')) return 'arrangements';
  if (type.includes('libretto')) return 'librettos';

  return 'others';
}

// ✅ ENDPOINT PARA BUSCAR WORKSCORES COM LIMITE POR TIPO CORRIGIDO
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('workId');
    const sourceId = searchParams.get('sourceId');
    const source = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '50');
    const limitPerType = parseInt(searchParams.get('limitPerType') || '0');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!workId) {
      return NextResponse.json(
        { error: 'workId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`🔍 [WORKSCORE-API] Parâmetros:`, {
      workId,
      limitPerType,
      limit,
      offset,
      sourceId,
      source,
    });

    // 🔍 Busca por sourceId + source
    if (sourceId && source) {
      const workScore = await prisma.workScore.findFirst({
        where: {
          workId,
          sourceId,
          source: source as any,
          isActive: true,
        },
        orderBy: [{ accessCount: 'desc' }, { createdAt: 'desc' }],
      });

      if (workScore) {
        await prisma.workScore.update({
          where: { id: workScore.id },
          data: {
            lastAccessed: new Date(),
            accessCount: { increment: 1 },
          },
        });

        return NextResponse.json({
          success: true,
          workScore,
          found: true,
        });
      }

      return NextResponse.json({
        success: true,
        workScore: null,
        found: false,
        message: 'WorkScore não encontrado',
      });
    }

    // 🔄 LÓGICA CORRIGIDA: limitPerType = 20 por requisição por tipo
    if (limitPerType > 0) {
      console.log(
        `📊 [WORKSCORE-API] Usando limitPerType: ${limitPerType}, offset: ${offset}`
      );

      const baseWhere: any = {
        workId,
        isActive: true,
      };

      if (source) {
        baseWhere.source = source;
      }

      // ✅ PRIMEIRO: Buscar TODOS os WorkScores para classificar por tipo
      const allWorkScores = await prisma.workScore.findMany({
        where: baseWhere,
        orderBy: [{ accessCount: 'desc' }, { createdAt: 'desc' }],
      });

      console.log(
        `📋 [WORKSCORE-API] Total de WorkScores encontrados: ${allWorkScores.length}`
      );

      // ✅ SEGUNDO: Classificar TODOS por tipo
      const allScoresByType: Record<string, any[]> = {
        scores: [],
        parts: [],
        arrangements: [],
        uploads: [],
        librettos: [],
        others: [],
      };

      allWorkScores.forEach((workScore) => {
        const type = classifyScoreType(workScore);
        allScoresByType[type].push(workScore);
      });

      // ✅ TERCEIRO: Para cada tipo, aplicar paginação individual
      const selectedScores: any[] = [];
      const totalByType: Record<string, number> = {};
      const loadedByType: Record<string, number> = {};

      // ✅ NOVO: Calcular quantos "rounds" de carregamento já foram feitos
      const round = Math.floor(offset / limitPerType);
      const currentOffsetPerType = round * limitPerType;

      Object.entries(allScoresByType).forEach(([type, allScoresOfType]) => {
        totalByType[type] = allScoresOfType.length;

        if (allScoresOfType.length > 0) {
          // ✅ APLICAR PAGINAÇÃO POR TIPO: pegar próximos limitPerType a partir do offset
          const startIndex = currentOffsetPerType;
          const endIndex = startIndex + limitPerType;
          const selectedOfType = allScoresOfType.slice(startIndex, endIndex);

          selectedScores.push(...selectedOfType);

          // ✅ IMPORTANTE: loadedByType = total carregado até agora para este tipo
          const totalLoadedForType = Math.min(
            startIndex + selectedOfType.length,
            allScoresOfType.length
          );
          loadedByType[type] = totalLoadedForType;

          console.log(
            `📊 [WORKSCORE-API] Tipo ${type}: ${selectedOfType.length} novas (${startIndex}-${endIndex}), total carregado: ${totalLoadedForType}/${allScoresOfType.length}`
          );
        } else {
          loadedByType[type] = 0;
        }
      });

      // ✅ QUARTO: Calcular hasMore - se algum tipo ainda tem partituras para carregar
      let globalHasMore = false;
      Object.entries(totalByType).forEach(([type, total]) => {
        const loaded = loadedByType[type] || 0;
        if (loaded < total) {
          globalHasMore = true;
        }
      });

      const totalCount = Object.values(totalByType).reduce(
        (sum, count) => sum + count,
        0
      );
      const globalLoadedCount = Object.values(loadedByType).reduce(
        (sum, count) => sum + count,
        0
      );

      console.log(`✅ [WORKSCORE-API] Resultado paginado:`, {
        selectedInThisRequest: selectedScores.length,
        globalLoadedCount,
        totalCount,
        globalHasMore,
        totalByType,
        loadedByType,
        round,
        currentOffsetPerType,
      });

      return NextResponse.json({
        success: true,
        workScores: selectedScores,
        count: selectedScores.length,
        total: totalCount,
        hasMore: globalHasMore,
        totalByType,
        loadedByType,
        pagination: {
          limitPerType,
          offset,
          hasNext: globalHasMore,
          hasPrev: offset > 0,
          totalByType,
          loadedByType,
        },
      });
    }

    // 📋 Fallback: busca geral (mantida igual)
    const whereClause: any = {
      workId,
      isActive: true,
    };

    if (source) {
      whereClause.source = source;
    }

    const [workScores, totalCount] = await Promise.all([
      prisma.workScore.findMany({
        where: whereClause,
        orderBy: [{ accessCount: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.workScore.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      workScores,
      count: workScores.length,
      total: totalCount,
      hasMore: offset + workScores.length < totalCount,
      pagination: {
        limit,
        offset,
        hasNext: offset + workScores.length < totalCount,
        hasPrev: offset > 0,
      },
    });
  } catch (error) {
    console.error('❌ [WORKSCORE-API] Erro ao buscar WorkScores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ✅ MANTER ENDPOINT POST EXISTENTE (para criar quando necessário)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      workId,
      sourceId,
      source = 'IMSLP',
      title,
      downloadUrl,
      thumbnailUrl,
      fileSize,
      pageCount,
      fileFormat = 'PDF',
      type = 'SCORES',
      editor,
      publisher,
      copyright,
      uploadDate,
      uploader,
      notes,
    } = body;

    if (!workId || !sourceId || !title) {
      return NextResponse.json(
        { error: 'workId, sourceId e title são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a obra existe
    const workExists = await prisma.work.findUnique({
      where: { id: workId },
      select: { id: true },
    });

    if (!workExists) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // ✅ BUSCAR WorkScore EXISTENTE
    const workScore = await prisma.workScore.findFirst({
      where: {
        workId: workId,
        sourceId: sourceId,
        source: source,
      },
    });

    if (workScore) {
      console.log(
        `📋 [WORKSCORE-API] WorkScore existente encontrado: ${workScore.id}`
      );

      // ✅ ATUALIZAR DADOS SE NECESSÁRIO (dados do IMSLP podem ter mudado)
      const updatedWorkScore = await prisma.workScore.update({
        where: { id: workScore.id },
        data: {
          title: title,
          downloadUrl: downloadUrl,
          thumbnailUrl: thumbnailUrl,
          fileSize: fileSize,
          pageCount: pageCount,
          fileFormat: fileFormat,
          type: type,
          editor: editor,
          publisher: publisher,
          copyright: copyright,
          uploadDate: uploadDate,
          uploader: uploader,
          notes: notes,
          lastAccessed: new Date(),
          accessCount: { increment: 1 },
        },
      });

      return NextResponse.json({
        success: true,
        workScore: updatedWorkScore,
        created: false,
      });
    }

    // ✅ CRIAR NOVO WorkScore (apenas se não existir)
    console.log(`🆕 [WORKSCORE-API] Criando novo WorkScore para: ${title}`);

    const newWorkScore = await prisma.workScore.create({
      data: {
        workId: workId,
        sourceId: sourceId,
        source: source,
        title: title,
        downloadUrl: downloadUrl,
        thumbnailUrl: thumbnailUrl,
        fileSize: fileSize,
        pageCount: pageCount,
        fileFormat: fileFormat,
        type: type,
        editor: editor,
        publisher: publisher,
        copyright: copyright,
        uploadDate: uploadDate,
        uploader: uploader,
        notes: notes,
        // Campos de controle
        isActive: true,
        accessCount: 1,
        lastAccessed: new Date(),
        processingStatus: 'COMPLETED',
        cacheVersion: '1.0',
        // Campos de qualidade
      },
    });

    console.log(
      `✅ [WORKSCORE-API] WorkScore criado com sucesso: ${newWorkScore.id}`
    );

    return NextResponse.json({
      success: true,
      workScore: newWorkScore,
      created: true,
    });
  } catch (error) {
    console.error('❌ [WORKSCORE-API] Erro ao buscar/criar WorkScore:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ✅ ENDPOINT PARA ATUALIZAR WORKSCORE (PATCH)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { workScoreId, ...updateData } = body;

    if (!workScoreId) {
      return NextResponse.json(
        { error: 'workScoreId é obrigatório' },
        { status: 400 }
      );
    }

    const updatedWorkScore = await prisma.workScore.update({
      where: { id: workScoreId },
      data: {
        ...updateData,
        lastAccessed: new Date(),
        accessCount: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      workScore: updatedWorkScore,
    });
  } catch (error) {
    console.error('❌ [WORKSCORE-API] Erro ao atualizar WorkScore:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
