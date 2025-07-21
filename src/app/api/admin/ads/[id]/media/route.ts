// app/api/admin/ads/[id]/media/route.ts - Upload usando processador servidor
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { revalidateTag } from 'next/cache';

// Importar funções do servidor
import {
  processImage,
  processVideo,
  deleteAllMediaVersions,
  generateVideoThumbnail,
} from '@/app/libs/ads/serverMediaProcessor';

import {
  validateMediaDimensions,
  AD_DIMENSIONS,
} from '@/app/libs/ads/mediaUtils';

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
    const quality = (formData.get('quality') as string) || 'high';

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo é obrigatório' },
        { status: 400 }
      );
    }

    // Validações aprimoradas
    const maxSize = type === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `Arquivo muito grande. Máximo: ${
            type === 'video' ? '100MB' : '10MB'
          }`,
        },
        { status: 400 }
      );
    }

    const allowedTypes =
      type === 'video'
        ? ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
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
      console.log('📁 Diretório já existe');
    }

    // Salvar arquivo temporário
    const tempFilePath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(tempFilePath, buffer);

    console.log(`📁 Arquivo salvo temporariamente: ${tempFilePath}`);

    let processedMedia: any = {};
    let mediaMetadata: any = {
      originalFilename: file.name,
      fileSize: file.size,
      processedAt: new Date().toISOString(),
      placement: ad.placement,
      quality: quality,
    };

    try {
      if (type === 'image') {
        console.log('🖼️ Iniciando processamento de imagem...');

        // Para imagens, podemos validar dimensões no lado cliente também
        // mas vamos processar independentemente
        const imageVersions = await processImage(
          tempFilePath,
          ad.placement as keyof typeof AD_DIMENSIONS,
          adId
        );

        processedMedia.imageVersions = imageVersions;
        processedMedia.imageUrl =
          imageVersions.desktop || imageVersions.original;
        processedMedia.thumbnailUrl = imageVersions.thumbnail;

        console.log('✅ Processamento de imagem concluído');
      } else if (type === 'video') {
        console.log('🎥 Iniciando processamento de vídeo...');

        const videoVersions = await processVideo(
          tempFilePath,
          ad.placement as keyof typeof AD_DIMENSIONS,
          adId
        );

        processedMedia.videoVersions = videoVersions;
        processedMedia.videoUrl =
          videoVersions.desktop || videoVersions.original;
        processedMedia.thumbnailUrl = videoVersions.thumbnail;

        console.log('✅ Processamento de vídeo concluído');
      }
    } catch (processingError) {
      console.error('❌ Erro no processamento:', processingError);

      // Em caso de erro no processamento, usar arquivo original como fallback
      const fallbackUrl = `/uploads/ads/${filename}`;
      if (type === 'image') {
        processedMedia.imageUrl = fallbackUrl;
        processedMedia.imageVersions = { original: fallbackUrl };
      } else {
        processedMedia.videoUrl = fallbackUrl;
        processedMedia.videoVersions = { original: fallbackUrl };

        // Tentar gerar thumbnail simples para vídeo
        try {
          const thumbnailUrl = await generateVideoThumbnail(tempFilePath);
          if (thumbnailUrl) {
            processedMedia.thumbnailUrl = thumbnailUrl;
          }
        } catch (thumbnailError) {
          console.warn('⚠️ Erro ao gerar thumbnail:', thumbnailError);
        }
      }

      mediaMetadata.processingError =
        processingError instanceof Error
          ? processingError.message
          : 'Erro desconhecido';
      mediaMetadata.fallbackUsed = true;
    }

    // Deletar mídia anterior antes de atualizar
    const updateData: any = {};

    if (type === 'image') {
      // Deletar versões anteriores de imagem
      if (ad.imageVersions) {
        try {
          await deleteAllMediaVersions(ad.imageVersions as any);
        } catch (error) {
          console.warn('⚠️ Erro ao deletar versões anteriores:', error);
        }
      }

      updateData.imageUrl = processedMedia.imageUrl;
      updateData.imageVersions = processedMedia.imageVersions;
      updateData.imageQuality = quality;

      if (processedMedia.thumbnailUrl) {
        updateData.thumbnailUrl = processedMedia.thumbnailUrl;
      }
    } else if (type === 'video') {
      // Deletar versões anteriores de vídeo
      if (ad.videoVersions) {
        try {
          await deleteAllMediaVersions(ad.videoVersions as any);
        } catch (error) {
          console.warn('⚠️ Erro ao deletar versões anteriores:', error);
        }
      }

      updateData.videoUrl = processedMedia.videoUrl;
      updateData.videoVersions = processedMedia.videoVersions;
      updateData.videoQuality = quality;

      if (processedMedia.thumbnailUrl) {
        updateData.thumbnailUrl = processedMedia.thumbnailUrl;
      }
    }

    // Adicionar metadados
    updateData.mediaMetadata = mediaMetadata;

    // Atualizar anúncio no banco
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
      message: 'Mídia processada com sucesso! 🚀',
      data: {
        processedMedia,
        mediaMetadata,
        ad: updatedAd,
        versions:
          type === 'image'
            ? processedMedia.imageVersions
            : processedMedia.videoVersions,
        recommendations: {
          placement: ad.placement,
          idealDimensions:
            AD_DIMENSIONS[ad.placement as keyof typeof AD_DIMENSIONS],
          qualityTips: [
            '✨ Imagens foram otimizadas para todos os dispositivos',
            '📱 Versões responsivas criadas automaticamente',
            '🎯 Proporções ajustadas para melhor visualização',
            type === 'video'
              ? '🎬 Vídeo otimizado com preview automático'
              : '🖼️ Formato WebP para carregamento mais rápido',
          ],
        },
      },
    });
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// DELETE - Remover mídia (usando processador servidor)
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
    const type = searchParams.get('type');

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
    const deletedFiles: any[] = [];

    if (type === 'image') {
      // Deletar todas as versões de imagem
      if (ad.imageVersions) {
        try {
          await deleteAllMediaVersions(ad.imageVersions as any);
          deletedFiles.push({
            type: 'image_versions',
            versions: ad.imageVersions,
          });
        } catch (error) {
          console.error('❌ Erro ao deletar versões de imagem:', error);
        }
      }

      updateData.imageUrl = null;
      updateData.imageVersions = null;
      updateData.imageQuality = 'high';

      // Se não há vídeo, remover thumbnail também
      if (!ad.videoUrl) {
        updateData.thumbnailUrl = null;
      }
    } else if (type === 'video') {
      // Deletar todas as versões de vídeo
      if (ad.videoVersions) {
        try {
          await deleteAllMediaVersions(ad.videoVersions as any);
          deletedFiles.push({
            type: 'video_versions',
            versions: ad.videoVersions,
          });
        } catch (error) {
          console.error('❌ Erro ao deletar versões de vídeo:', error);
        }
      }

      updateData.videoUrl = null;
      updateData.videoVersions = null;
      updateData.videoQuality = 'high';

      // Se não há imagem, remover thumbnail também
      if (!ad.imageUrl) {
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
      message: 'Mídia removida com sucesso! 🗑️',
      deletedFiles,
    });
  } catch (error) {
    console.error('❌ Erro ao deletar mídia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
