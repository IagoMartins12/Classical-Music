// app/api/admin/ads/[id]/media/route.ts - Upload de mídia para anúncios
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { revalidateTag } from 'next/cache';
import { deleteMediaFile, generateVideoThumbnail } from '@/app/libs/mediaUtils'; // 🆕 Importar utilitários

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const adId = params.id;

    // Verificar se o anúncio existe
    const ad = await prisma.advertisement.findUnique({
      where: { id: adId },
    });

    if (!ad) {
      return NextResponse.json(
        { error: 'Anúncio não encontrado' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'image' ou 'video'

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo é obrigatório' },
        { status: 400 }
      );
    }

    // Validações
    const maxSize = type === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB para vídeo, 5MB para imagem
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `Arquivo muito grande. Máximo: ${
            type === 'video' ? '50MB' : '5MB'
          }`,
        },
        { status: 400 }
      );
    }

    const allowedTypes =
      type === 'video'
        ? ['video/mp4', 'video/webm', 'video/ogg']
        : ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Tipo de arquivo não permitido. Permitidos: ${allowedTypes.join(
            ', '
          )}`,
        },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `ad_${adId}_${type}_${timestamp}.${extension}`;

    // Criar diretório se não existir
    const uploadDir = path.join(process.cwd(), 'public/uploads/ads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Diretório já existe
    }

    // Salvar arquivo
    const filePath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // URL pública do arquivo
    const fileUrl = `/uploads/ads/${filename}`;

    // Gerar thumbnail para vídeos (opcional)
    let thumbnailUrl = null;
    if (type === 'video') {
      thumbnailUrl = await generateVideoThumbnail(filePath);
    }

    // 🆕 Deletar mídia anterior antes de atualizar
    const updateData: any = {};
    if (type === 'image') {
      // Deletar imagem anterior se existir
      if (ad.imageUrl) {
        await deleteMediaFile(ad.imageUrl);
      }
      updateData.imageUrl = fileUrl;
    } else if (type === 'video') {
      // Deletar vídeo anterior se existir
      if (ad.videoUrl) {
        await deleteMediaFile(ad.videoUrl);
      }
      // Deletar thumbnail anterior se existir
      if (ad.thumbnailUrl) {
        await deleteMediaFile(ad.thumbnailUrl);
      }
      updateData.videoUrl = fileUrl;
      if (thumbnailUrl) {
        updateData.thumbnailUrl = thumbnailUrl;
      }
    }

    const updatedAd = await prisma.advertisement.update({
      where: { id: adId },
      data: {
        ...updateData,
        lastEditedBy: session.user.id,
        lastEditedAt: new Date(),
      },
    });

    // Invalidar cache
    revalidateTag('public-ads');

    return NextResponse.json({
      success: true,
      message: 'Mídia enviada com sucesso',
      fileUrl,
      thumbnailUrl,
      fileSize: file.size,
      fileName: file.name,
      fileType: file.type,
      ad: updatedAd,
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remover mídia
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const adId = params.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'image' ou 'video'

    if (!type || !['image', 'video'].includes(type)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }

    const ad = await prisma.advertisement.findUnique({
      where: { id: adId },
    });

    if (!ad) {
      return NextResponse.json(
        { error: 'Anúncio não encontrado' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    const deletedFiles = [];

    if (type === 'image' && ad.imageUrl) {
      const deleted = await deleteMediaFile(ad.imageUrl);
      deletedFiles.push({ type: 'image', url: ad.imageUrl, deleted });
      updateData.imageUrl = null;
    } else if (type === 'video') {
      if (ad.videoUrl) {
        const deleted = await deleteMediaFile(ad.videoUrl);
        deletedFiles.push({ type: 'video', url: ad.videoUrl, deleted });
        updateData.videoUrl = null;
      }
      if (ad.thumbnailUrl) {
        const deleted = await deleteMediaFile(ad.thumbnailUrl);
        deletedFiles.push({ type: 'thumbnail', url: ad.thumbnailUrl, deleted });
        updateData.thumbnailUrl = null;
      }
    }

    await prisma.advertisement.update({
      where: { id: adId },
      data: {
        ...updateData,
        lastEditedBy: session.user.id,
        lastEditedAt: new Date(),
      },
    });

    // Invalidar cache
    revalidateTag('public-ads');

    return NextResponse.json({
      success: true,
      message: 'Mídia removida com sucesso',
      deletedFiles,
    });
  } catch (error) {
    console.error('Erro ao deletar mídia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
