import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

const categoryUpdateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(200).optional().nullable(),
  icon: z.string().max(2).optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  image: z.string().optional().nullable().or(z.literal('')),
  isActive: z.boolean().optional(),
});

// PUT - Update category
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
    const data = categoryUpdateSchema.parse(body);

    const { id } = await params;
    // Check if slug exists (excluding current category)
    if (data.slug) {
      const existing = await prisma.blogCategory.findFirst({
        where: {
          slug: data.slug,
          id: { not: id },
        },
      });

      if (existing) {
        return NextResponse.json({ error: 'Slug já existe' }, { status: 400 });
      }
    }

    const category = await prisma.blogCategory.update({
      where: { id: id },
      data,
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error updating category:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar categoria' },
      { status: 500 }
    );
  }
}

// PATCH - Partial update
export async function PATCH(
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

    const category = await prisma.blogCategory.update({
      where: { id: id },
      data: body,
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error patching category:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar categoria' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
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

    // Check if category has articles
    const category = await prisma.blogCategory.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    if (category._count.articles > 0) {
      return NextResponse.json(
        {
          error: `Não é possível deletar. Esta categoria possui ${category._count.articles} artigo(s).`,
        },
        { status: 400 }
      );
    }

    await prisma.blogCategory.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar categoria' },
      { status: 500 }
    );
  }
}
