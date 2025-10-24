// app/api/blog/articles/[id]/view/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Incrementar view count
    await prisma.blogArticle.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Visualização registrada',
    });
  } catch (error) {
    console.error('Erro ao registrar visualização:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
