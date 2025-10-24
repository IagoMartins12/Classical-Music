import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/libs/prismadb';
import { authOptions } from '@/app/libs/auth';

// PUT
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      (session.user.role !== 1 && session.user.role !== 2)
    ) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = await params;

    // Check slug
    if (body.slug) {
      const existing = await prisma.blogTag.findFirst({
        where: { slug: body.slug, id: { not: id } },
      });

      if (existing) {
        return NextResponse.json({ error: 'Slug já existe' }, { status: 400 });
      }
    }

    const tag = await prisma.blogTag.update({
      where: { id: id },
      data: body,
    });

    return NextResponse.json({ success: true, tag });
  } catch {
    return NextResponse.json(
      { error: 'Erro ao atualizar tag' },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      (session.user.role !== 1 && session.user.role !== 2)
    ) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const tag = await prisma.blogTag.findUnique({
      where: { id: id },
      include: { _count: { select: { articles: true } } },
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag não encontrada' },
        { status: 404 }
      );
    }

    if (tag._count.articles > 0) {
      return NextResponse.json(
        { error: `Esta tag possui ${tag._count.articles} artigo(s)` },
        { status: 400 }
      );
    }

    await prisma.blogTag.delete({ where: { id: id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao deletar tag' }, { status: 500 });
  }
}
