// app/api/uploads/score/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';
import { logScoreCreate } from '@/app/utils/historyUtils';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validações básicas
    if (!body.workId || !body.title) {
      return NextResponse.json(
        { error: 'Obra e título são obrigatórios' },
        { status: 400 }
      );
    }

    if (!body.downloadUrl) {
      return NextResponse.json(
        { error: 'URL do arquivo ou upload é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a obra existe
    const work = await prisma.work.findUnique({
      where: { id: body.workId },
      include: {
        composer: { select: { name: true, fullName: true } },
      },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 400 }
      );
    }

    // Gerar sourceId único para partituras customizadas
    const sourceId = body.sourceId || generateSourceId(body.source || 'CUSTOM');

    // Verificar se já existe partitura com mesmo sourceId para esta obra
    const existingScore = await prisma.workScore.findFirst({
      where: {
        workId: body.workId,
        sourceId: sourceId,
        source: body.source || 'CUSTOM',
      },
    });

    if (existingScore) {
      return NextResponse.json(
        {
          error:
            'Já existe uma partitura com este identificador para esta obra',
          existingScore: {
            id: existingScore.id,
            title: existingScore.title,
          },
        },
        { status: 400 }
      );
    }

    // Preparar dados para criação
    const scoreData = {
      workId: body.workId,
      sourceId: sourceId,
      source: body.source || 'CUSTOM',
      title: body.title,
      downloadUrl: body.downloadUrl,
      fileSize: body.fileSize || null,
      pageCount: body.pageCount || null,
      fileFormat: body.fileFormat || 'PDF',
      editor: body.editor || null,
      publisher: body.publisher || null,
      copyright: body.copyright || null,
      thumbnailUrl: body.thumbnailUrl || null,
      notes: body.notes || null,
      type: body.type || 'SCORES',
      groupIndex: body.groupIndex ? parseInt(body.groupIndex) : 0,
      groupTitle: body.groupTitle || null,
      rating: body.rating ? parseFloat(body.rating) : null,
      ratingsCount: body.ratingsCount ? parseInt(body.ratingsCount) : null,
      downloadCount: body.downloadCount ? parseInt(body.downloadCount) : null,
      isCustom: body.isCustom !== false, // Default true para uploads customizados
      uploadedBy: userId,
      customData: body.customData
        ? typeof body.customData === 'string'
          ? JSON.parse(body.customData)
          : body.customData
        : null,
      processingStatus: 'COMPLETED',
      isActive: true,
      isVerified: false,
      lastVerified: new Date(),
      lastAccessed: new Date(),
      accessCount: 0,
      priority: body.priority || 0,
      cacheVersion: '1.0',
    };

    // Criar partitura
    const score = await prisma.workScore.create({
      data: scoreData,
      include: {
        work: {
          select: {
            id: true,
            title: true,
            composer: {
              select: {
                name: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    // 🆕 Registrar no histórico
    await logScoreCreate(
      userId,
      score.id,
      {
        title: score.title,
        workTitle: score.work.title,
        composerName: score.work.composer.fullName || score.work.composer.name,
        fileFormat: score.fileFormat,
        fileSize: score.fileSize,
        pageCount: score.pageCount,
        type: score.type,
        source: score.source,
        groupIndex: score.groupIndex,
        groupTitle: score.groupTitle,
        editor: score.editor,
        publisher: score.publisher,
        isCustom: score.isCustom,
        uploadMethod: body.source === 'UPLOAD' ? 'file_upload' : 'url_link',
      },
      request
    );

    // Invalidar cache
    await revalidateUploadsCache(userId);

    return NextResponse.json({
      message: 'Partitura criada com sucesso!',
      score,
    });
  } catch (error) {
    console.error('Erro ao criar partitura:', error);

    // Tratamento de erros específicos
    if (error instanceof Error) {
      if (error.message.includes('Duplicate')) {
        return NextResponse.json(
          { error: 'Já existe uma partitura com estes dados' },
          { status: 400 }
        );
      }
      if (error.message.includes('JSON')) {
        return NextResponse.json(
          { error: 'Dados customizados devem estar em formato JSON válido' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para gerar sourceId único
function generateSourceId(source: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${source.toLowerCase()}_${timestamp}_${random}`;
}
