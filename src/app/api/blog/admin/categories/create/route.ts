import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import prisma from '@/app/libs/prismadb';
import { authOptions } from '@/app/libs/auth';

const categorySchema = z.object({
  name: z.string().min(1).max(50),
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(200).optional(),
  icon: z.string().max(2).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  image: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

// GET - List all categories
export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar categorias' },
      { status: 500 }
    );
  }
}

// POST - Create category
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
    console.log('data', body);

    const data = categorySchema.parse(body);

    // Check if slug already exists
    const existing = await prisma.blogCategory.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json({ error: 'Slug já existe' }, { status: 400 });
    }

    // Get highest order
    const lastCategory = await prisma.blogCategory.findFirst({
      orderBy: { order: 'desc' },
    });

    const order = (lastCategory?.order ?? -1) + 1;

    // Create category
    const category = await prisma.blogCategory.create({
      data: {
        ...data,
        order,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error creating category:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar categoria' },
      { status: 500 }
    );
  }
}
