// app/api/work-scores/route.ts - API MELHORADA COM LIMITE POR TIPO
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

// ✅ ENDPOINT PARA BUSCAR WORKSCORES COM LIMITE POR TIPO
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

    // 🔍 Busca por sourceId + source
    if (sourceId && source) {
      const workScore = await prisma.workScore.findFirst({
        where: {
          workId,
          sourceId,
          source: source as any,
          isActive: true,
        },
        orderBy: [
          { priority: 'desc' },
          { accessCount: 'desc' },
          { createdAt: 'desc' },
        ],
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

    // 🔄 Busca por tipo com limites por tipo
    if (limitPerType > 0) {
      const baseWhere: any = {
        workId,
        isActive: true,
      };

      if (source) {
        baseWhere.source = source;
      }

      const scoreTypes = [
        { type: 'scores' },
        { type: 'parts' },
        { type: 'arrangements' },
        { type: 'uploads' },
        { type: 'others' },
      ];

      const allWorkScores: any[] = [];
      const totalByType: Record<string, number> = {};
      const loadedByType: Record<string, number> = {};
      let globalHasMore = false;

      for (const scoreType of scoreTypes) {
        const typeWhereClause: any = { ...baseWhere };

        if (scoreType.type === 'uploads') {
          typeWhereClause.source = { in: ['UPLOAD', 'CUSTOM'] };
        } else if (scoreType.type === 'scores') {
          typeWhereClause.type = { equals: 'SCORES' };
        } else if (scoreType.type === 'parts') {
          typeWhereClause.type = { equals: 'PARTS' };
        } else if (scoreType.type === 'arrangements') {
          typeWhereClause.type = { equals: 'ARRANGEMENTS' };
        } else if (scoreType.type === 'others') {
          typeWhereClause.type = { notIn: ['SCORES', 'PARTS', 'ARRANGEMENTS'] };
          if (!source) {
            typeWhereClause.source = { notIn: ['UPLOAD', 'CUSTOM'] };
          }
        }

        const typeTotal = await prisma.workScore.count({
          where: typeWhereClause,
        });
        totalByType[scoreType.type] = typeTotal;

        if (typeTotal > 0) {
          const typeScores = await prisma.workScore.findMany({
            where: typeWhereClause,
            orderBy: [
              { priority: 'desc' },
              { accessCount: 'desc' },
              { createdAt: 'desc' },
            ],
            take: limitPerType,
            skip: Math.floor((offset * limitPerType) / scoreTypes.length),
          });

          loadedByType[scoreType.type] = typeScores.length;
          allWorkScores.push(...typeScores);

          if (typeScores.length < typeTotal) {
            globalHasMore = true;
          }
        } else {
          loadedByType[scoreType.type] = 0;
        }
      }

      const totalCount = Object.values(totalByType).reduce(
        (sum, count) => sum + count,
        0
      );
      const loadedCount = allWorkScores.length;

      return NextResponse.json({
        success: true,
        workScores: allWorkScores,
        count: loadedCount,
        total: totalCount,
        hasMore: globalHasMore,
        totalByType,
        loadedByType,
        pagination: {
          limitPerType,
          offset,
          hasNext: globalHasMore,
          hasPrev: offset > 0,
        },
      });
    }

    // 📋 Fallback: busca geral
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
        orderBy: [
          { priority: 'desc' },
          { accessCount: 'desc' },
          { createdAt: 'desc' },
        ],
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
        priority: 0,
        accessCount: 1,
        lastAccessed: new Date(),
        processingStatus: 'COMPLETED',
        cacheVersion: '1.0',
        // Campos de qualidade
        dataQuality: 'high',
        verificationStatus: 'pending',
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
