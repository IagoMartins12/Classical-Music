// app/api/blog/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// ==================== GET - Listar Categorias ====================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCount = searchParams.get('includeCount') === 'true';
    const parentId = searchParams.get('parentId');

    const where: any = {};

    // Filtrar por categoria pai (ou top-level)
    if (parentId === 'null') {
      where.parentId = null; // Top-level categories
    } else if (parentId) {
      where.parentId = parentId;
    }

    const categories = await prisma.blogCategory.findMany({
      where,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          },
          orderBy: { order: 'asc' },
        },
        ...(includeCount && {
          articles: {
            where: {
              article: {
                status: 'PUBLISHED',
              },
            },
            select: { id: true },
          },
        }),
      },
      orderBy: { order: 'asc' },
    });

    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      articleCount: includeCount ? cat.articles?.length || 0 : undefined,
      articles: undefined, // Remove do response
    }));

    return NextResponse.json({
      success: true,
      categories: categoriesWithCount,
    });
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== POST - Criar Categoria ====================
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      parentId,
      icon,
      color,
      coverImage,
      order = 0,
      metaTitle,
      metaDescription,
    } = body;

    // Validações
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    if (!slug?.trim()) {
      return NextResponse.json(
        { error: 'Slug é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar slug duplicado
    const existingSlug = await prisma.blogCategory.findUnique({
      where: { slug: slug.trim() },
    });

    if (existingSlug) {
      return NextResponse.json({ error: 'Slug já existe' }, { status: 400 });
    }

    const category = await prisma.blogCategory.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        parentId: parentId || null,
        icon: icon?.trim() || null,
        color: color?.trim() || null,
        coverImage: coverImage?.trim() || null,
        order,
        metaTitle: metaTitle?.trim() || null,
        metaDescription: metaDescription?.trim() || null,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    revalidateTag('blog-categories');

    return NextResponse.json({
      success: true,
      category,
      message: 'Categoria criada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== PUT - Atualizar Categoria ====================
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const existingCategory = await prisma.blogCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Verificar slug duplicado (se mudou)
    if (updateData.slug && updateData.slug !== existingCategory.slug) {
      const slugExists = await prisma.blogCategory.findUnique({
        where: { slug: updateData.slug },
      });

      if (slugExists) {
        return NextResponse.json({ error: 'Slug já existe' }, { status: 400 });
      }
    }

    // Não pode ser pai de si mesma
    if (updateData.parentId === id) {
      return NextResponse.json(
        { error: 'Categoria não pode ser pai de si mesma' },
        { status: 400 }
      );
    }

    const updatedCategory = await prisma.blogCategory.update({
      where: { id },
      data: updateData,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    revalidateTag('blog-categories');
    revalidateTag(`blog-category-${id}`);

    return NextResponse.json({
      success: true,
      category: updatedCategory,
      message: 'Categoria atualizada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== DELETE - Deletar Categoria ====================
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

    const category = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        children: true,
        articles: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se tem subcategorias
    if (category.children.length > 0) {
      return NextResponse.json(
        {
          error:
            'Não é possível deletar categoria com subcategorias. Delete as subcategorias primeiro.',
        },
        { status: 400 }
      );
    }

    // Verificar se tem artigos
    if (category.articles.length > 0) {
      return NextResponse.json(
        {
          error: `Não é possível deletar categoria com ${category.articles.length} artigos vinculados. Remova os artigos primeiro.`,
        },
        { status: 400 }
      );
    }

    await prisma.blogCategory.delete({
      where: { id },
    });

    revalidateTag('blog-categories');

    return NextResponse.json({
      success: true,
      message: 'Categoria deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
