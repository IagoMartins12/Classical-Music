// app/api/blog/tags/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// ==================== GET - Listar Tags ====================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'popular'; // popular, alphabetical, recent
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    let orderBy: any = {};
    switch (sortBy) {
      case 'alphabetical':
        orderBy = { name: 'asc' };
        break;
      case 'recent':
        orderBy = { createdAt: 'desc' };
        break;
      case 'popular':
      default:
        orderBy = { articleCount: 'desc' };
        break;
    }

    const tags = await prisma.blogTag.findMany({
      where,
      orderBy,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      tags,
    });
  } catch (error) {
    console.error('Erro ao listar tags:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== POST - Criar Tag ====================
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    // Gerar slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Verificar se já existe
    const existingTag = await prisma.blogTag.findUnique({
      where: { slug },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag já existe', tag: existingTag },
        { status: 400 }
      );
    }

    const tag = await prisma.blogTag.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        color: color?.trim() || null,
      },
    });

    revalidateTag('blog-tags');

    return NextResponse.json({
      success: true,
      tag,
      message: 'Tag criada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar tag:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== DELETE - Deletar Tag ====================
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const tag = await prisma.blogTag.findUnique({
      where: { id },
      include: {
        articles: true,
      },
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se tem artigos
    if (tag.articles.length > 0) {
      return NextResponse.json(
        {
          error: `Não é possível deletar tag com ${tag.articles.length} artigos vinculados`,
        },
        { status: 400 }
      );
    }

    await prisma.blogTag.delete({
      where: { id },
    });

    revalidateTag('blog-tags');

    return NextResponse.json({
      success: true,
      message: 'Tag deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar tag:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
