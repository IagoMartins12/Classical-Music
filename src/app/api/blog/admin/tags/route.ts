import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import prisma from '@/app/libs/prismadb';
import { authOptions } from '@/app/libs/auth';

const tagSchema = z.object({
  name: z.string().min(1).max(30),
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(150).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

// GET
export async function GET() {
  try {
    const tags = await prisma.blogTag.findMany({
      include: {
        _count: { select: { articles: true } },
      },
      orderBy: { articleCount: 'desc' },
    });

    return NextResponse.json({ success: true, tags });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar tags' },
      { status: 500 }
    );
  }
}

// POST
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      (session.user.role !== 1 && session.user.role !== 2)
    ) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const data = tagSchema.parse(body);

    // Check slug
    const existing = await prisma.blogTag.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json({ error: 'Slug já existe' }, { status: 400 });
    }

    const tag = await prisma.blogTag.create({ data });

    return NextResponse.json({ success: true, tag });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Erro ao criar tag' }, { status: 500 });
  }
}
