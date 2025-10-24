// app/api/blog/media/articles/[id]/media/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { MediaType } from '@prisma/client';

// ==================== POST - Adicionar Mídia ao Artigo ====================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      type,
      url,
      title,
      caption,
      credit,
      alt,
      thumbnailUrl,
      duration,
      width,
      height,
      fileSize,
      order = 0,
      isInline = false,
      inGallery = true,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do artigo é obrigatório' },
        { status: 400 }
      );
    }

    if (!type || !url) {
      return NextResponse.json(
        { error: 'Tipo e URL são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar tipo
    if (!['IMAGE', 'VIDEO', 'AUDIO'].includes(type)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }

    // Verificar se artigo existe
    const article = await prisma.blogArticle.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      );
    }

    // Criar mídia
    const media = await prisma.blogMedia.create({
      data: {
        articleId: id,
        type: type as MediaType,
        url: url.trim(),
        title: title?.trim() || null,
        caption: caption?.trim() || null,
        credit: credit?.trim() || null,
        alt: alt?.trim() || null,
        thumbnailUrl: thumbnailUrl?.trim() || null,
        duration,
        width,
        height,
        fileSize,
        order,
        isInline,
        inGallery,
      },
    });

    revalidateTag(`blog-article-${id}`);

    return NextResponse.json({
      success: true,
      media,
      message: 'Mídia adicionada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao adicionar mídia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== GET - Listar Mídia do Artigo ====================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as MediaType | undefined;
    const inGallery = searchParams.get('inGallery') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const where: any = { articleId: id };

    if (type) {
      where.type = type;
    }

    if (inGallery !== undefined) {
      where.inGallery = inGallery;
    }

    const media = await prisma.blogMedia.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      media,
      total: media.length,
    });
  } catch (error) {
    console.error('Erro ao listar mídia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
