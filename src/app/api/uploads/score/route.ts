// app/api/uploads/score/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      workId,
      title,
      downloadUrl,
      fileSize,
      pageCount,
      fileFormat,
      editor,
      publisher,
      copyright,
      thumbnailUrl,
      uploadDate,
      uploader,
      notes,
      type,
      groupIndex,
      groupTitle,
      rating,
      ratingsCount,
      downloadCount,
      isCustom,
      customData,
    } = body;

    // Validação básica
    if (!workId || !title) {
      return NextResponse.json(
        {
          error: 'Campos obrigatórios: obra e título',
        },
        { status: 400 }
      );
    }

    // Verificar se a obra existe
    const work = await prisma.work.findUnique({
      where: { id: workId },
    });

    if (!work) {
      return NextResponse.json(
        {
          error: 'Obra não encontrada',
        },
        { status: 400 }
      );
    }

    // Gerar sourceId único
    const sourceId = `custom-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Criar a partitura
    const score = await prisma.workScore.create({
      data: {
        workId,
        sourceId,
        source: isCustom ? 'CUSTOM' : 'UPLOAD',
        title,
        downloadUrl,
        fileSize,
        pageCount,
        fileFormat: fileFormat || 'PDF',
        editor,
        publisher,
        copyright,
        thumbnailUrl,
        uploadDate,
        uploader,
        notes,
        type: type || 'SCORES',
        groupIndex: groupIndex || 0,
        groupTitle,
        rating,
        ratingsCount,
        downloadCount,
        isCustom: isCustom || true,
        uploadedBy: session.user.id,
        customData,
        isActive: true,
        processingStatus: 'COMPLETED',
        cacheVersion: '1.0',
      },
      include: {
        work: {
          select: {
            title: true,
            composer: { select: { name: true, fullName: true } },
          },
        },
      },
    });

    await revalidateUploadsCache(session.user.id);

    return NextResponse.json({
      success: true,
      score,
      message: 'Partitura criada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar partitura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
