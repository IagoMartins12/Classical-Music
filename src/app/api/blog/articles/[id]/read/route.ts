// app/api/blog/articles/[id]/read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { readTime } = body; // Tempo de leitura em segundos

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const article = await prisma.blogArticle.findUnique({
      where: { id },
      select: { readCount: true, avgReadTime: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      );
    }

    // Calcular nova média de tempo de leitura
    const newReadCount = article.readCount + 1;
    const currentAvg = article.avgReadTime || 0;
    const newAvg = Math.round(
      (currentAvg * article.readCount + readTime) / newReadCount
    );

    // Incrementar read count e atualizar média
    await prisma.blogArticle.update({
      where: { id },
      data: {
        readCount: { increment: 1 },
        avgReadTime: newAvg,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Leitura completa registrada',
    });
  } catch (error) {
    console.error('Erro ao registrar leitura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
