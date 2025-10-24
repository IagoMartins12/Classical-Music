// app/api/blog/media/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==================== PUT - Atualizar Metadados da Mídia ====================
export async function PUT(
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

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const media = await prisma.blogMedia.findUnique({
      where: { id },
      select: { id: true, articleId: true },
    });

    if (!media) {
      return NextResponse.json(
        { error: 'Mídia não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar mídia
    const updatedMedia = await prisma.blogMedia.update({
      where: { id },
      data: body,
    });

    revalidateTag(`blog-article-${media.articleId}`);

    return NextResponse.json({
      success: true,
      media: updatedMedia,
      message: 'Mídia atualizada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar mídia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ==================== DELETE - Deletar Mídia ====================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const media = await prisma.blogMedia.findUnique({
      where: { id },
      select: { id: true, articleId: true, url: true },
    });

    if (!media) {
      return NextResponse.json(
        { error: 'Mídia não encontrada' },
        { status: 404 }
      );
    }

    // Se for do Cloudinary, tentar deletar de lá também
    if (media.url.includes('cloudinary.com')) {
      try {
        // Extrair public_id do URL
        const urlParts = media.url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = filename.split('.')[0];
        const folder = urlParts[urlParts.length - 2];
        const fullPublicId = `opus-atlas/${folder}/${publicId}`;

        await cloudinary.uploader.destroy(fullPublicId);
      } catch (cloudinaryError) {
        console.error('Erro ao deletar do Cloudinary:', cloudinaryError);
        // Continua mesmo se falhar no Cloudinary
      }
    }

    // Deletar do banco
    await prisma.blogMedia.delete({
      where: { id },
    });

    revalidateTag(`blog-article-${media.articleId}`);

    return NextResponse.json({
      success: true,
      message: 'Mídia deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar mídia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
