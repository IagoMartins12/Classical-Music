// app/api/user/selected-scores/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// GET - Buscar partituras selecionadas do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('workId');
    const scoreId = searchParams.get('scoreId');

    const where: any = { userId: session.user.id };
    if (workId) where.workId = workId;
    if (scoreId) where.imslpScoreId = scoreId;

    const selectedScores = await prisma.userSelectedScore.findMany({
      where,
      include: {
        work: {
          select: {
            id: true,
            title: true,
            composer: { select: { name: true, fullName: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      selectedScores: selectedScores.map((score) => ({
        id: score.imslpScoreId,
        title: score.title,
        downloadUrl: score.downloadUrl,
        fileSize: score.fileSize,
        pageCount: score.pageCount,
        fileFormat: score.fileFormat,
        editor: score.editor,
        publisher: score.publisher,
        copyright: score.copyright,
        thumbnailUrl: score.thumbnailUrl,
        uploadDate: score.uploadDate,
        uploader: score.uploader,
        notes: score.notes,
        type: score.type.toLowerCase(),
        groupIndex: score.groupIndex,
        groupTitle: score.groupTitle,
        rating: score.rating,
        ratingsCount: score.ratingsCount,
        downloadCount: score.downloadCount,
        work: score.work,
        lastVerified: score.lastVerified.toISOString(),
        createdAt: score.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar partituras selecionadas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Salvar partitura selecionada
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { workId, score } = body;

    if (!workId || !score) {
      return NextResponse.json(
        { error: 'workId e score são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a obra existe
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: { id: true, title: true },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Upsert da partitura selecionada
    const selectedScore = await prisma.userSelectedScore.upsert({
      where: {
        userId_workId_imslpScoreId: {
          userId: session.user.id,
          workId,
          imslpScoreId: score.id,
        },
      },
      update: {
        title: score.title,
        downloadUrl: score.downloadUrl,
        fileSize: score.fileSize,
        pageCount: score.pageCount,
        fileFormat: score.fileFormat || 'PDF',
        editor: score.editor,
        publisher: score.publisher,
        copyright: score.copyright,
        thumbnailUrl: score.thumbnailUrl,
        uploadDate: score.uploadDate,
        uploader: score.uploader,
        notes: score.notes,
        type: score.type?.toUpperCase() || 'SCORES',
        groupIndex: score.groupIndex,
        groupTitle: score.groupTitle,
        rating: score.rating,
        ratingsCount: score.ratingsCount,
        downloadCount: score.downloadCount,
        lastVerified: new Date(),
        isActive: true,
      },
      create: {
        userId: session.user.id,
        workId,
        imslpScoreId: score.id,
        title: score.title,
        downloadUrl: score.downloadUrl,
        fileSize: score.fileSize,
        pageCount: score.pageCount,
        fileFormat: score.fileFormat || 'PDF',
        editor: score.editor,
        publisher: score.publisher,
        copyright: score.copyright,
        thumbnailUrl: score.thumbnailUrl,
        uploadDate: score.uploadDate,
        uploader: score.uploader,
        notes: score.notes,
        type: score.type?.toUpperCase() || 'SCORES',
        groupIndex: score.groupIndex,
        groupTitle: score.groupTitle,
        rating: score.rating,
        ratingsCount: score.ratingsCount,
        downloadCount: score.downloadCount,
        lastVerified: new Date(),
        isActive: true,
      },
    });

    // Invalidar caches
    revalidateTag(`user-selected-scores-${session.user.id}`);
    revalidateTag(`work-selected-scores-${workId}`);

    return NextResponse.json({
      success: true,
      message: 'Partitura salva com sucesso',
      selectedScore: {
        id: selectedScore.imslpScoreId,
        title: selectedScore.title,
        downloadUrl: selectedScore.downloadUrl,
        createdAt: selectedScore.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro ao salvar partitura selecionada:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remover partitura selecionada
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('workId');
    const scoreId = searchParams.get('scoreId');

    if (!workId || !scoreId) {
      return NextResponse.json(
        { error: 'workId e scoreId são obrigatórios' },
        { status: 400 }
      );
    }

    await prisma.userSelectedScore.delete({
      where: {
        userId_workId_imslpScoreId: {
          userId: session.user.id,
          workId,
          imslpScoreId: scoreId,
        },
      },
    });

    // Invalidar caches
    revalidateTag(`user-selected-scores-${session.user.id}`);
    revalidateTag(`work-selected-scores-${workId}`);

    return NextResponse.json({
      success: true,
      message: 'Partitura removida com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover partitura selecionada:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
