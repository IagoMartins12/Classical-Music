// app/api/admin/ads/media/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

// Função para gerar ID único sem UUID
function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = randomBytes(8).toString('hex');
  return `${timestamp}-${randomPart}`;
}

// POST - Upload de mídia para publicidade
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const adId = formData.get('adId') as string;
    const isMain = formData.get('isMain') === 'true';
    const altText = formData.get('altText') as string;
    const caption = formData.get('caption') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo é obrigatório' },
        { status: 400 }
      );
    }

    if (!adId) {
      return NextResponse.json(
        { error: 'ID da publicidade é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a publicidade existe
    const ad = await prisma.advertisement.findUnique({
      where: { id: adId },
    });

    if (!ad) {
      return NextResponse.json(
        { error: 'Publicidade não encontrada' },
        { status: 404 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado' },
        { status: 400 }
      );
    }

    // Validar tamanho (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 50MB' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo usando crypto nativo
    const fileExtension = path.extname(file.name);
    const uniqueId = generateUniqueId();
    const fileName = `${uniqueId}${fileExtension}`;

    // Determinar tipo de mídia
    const mediaType = file.type.startsWith('image/')
      ? 'IMAGE'
      : file.type.startsWith('video/')
      ? 'VIDEO'
      : 'DOCUMENT';

    // Definir diretório de upload
    const uploadDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'ads',
      adId
    );

    // Criar diretório se não existir
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Salvar arquivo
    const filePath = path.join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Gerar URLs
    const url = `/uploads/ads/${adId}/${fileName}`;

    // Se for video, gerar thumbnail (implementar conforme necessário)
    let thumbnailUrl = null;
    if (mediaType === 'VIDEO') {
      // Aqui você pode implementar geração de thumbnail com ffmpeg ou similar
      const thumbnailName = `thumb_${uniqueId}.jpg`;
      thumbnailUrl = `/uploads/ads/${adId}/${thumbnailName}`;
    }

    // Se é main e já existe uma mídia principal, remover a flag das outras
    if (isMain) {
      await prisma.adMedia.updateMany({
        where: {
          advertisementId: adId,
          isMain: true,
        },
        data: {
          isMain: false,
        },
      });
    }

    // Salvar no banco de dados
    const media = await prisma.adMedia.create({
      data: {
        advertisementId: adId,
        fileName,
        originalName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        url,
        thumbnailUrl,
        type: mediaType,
        isMain,
        altText: altText || null,
        caption: caption || null,
        uploadedBy: session.user.id,
        storageProvider: 'local',
        storagePath: filePath,
      },
    });

    return NextResponse.json({
      success: true,
      media,
      message: 'Mídia enviada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao fazer upload de mídia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Listar mídia de uma publicidade
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const adId = searchParams.get('adId');

    if (!adId) {
      return NextResponse.json(
        { error: 'ID da publicidade é obrigatório' },
        { status: 400 }
      );
    }

    const mediaFiles = await prisma.adMedia.findMany({
      where: { advertisementId: adId },
      include: {
        uploader: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [{ isMain: 'desc' }, { uploadedAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      mediaFiles,
    });
  } catch (error) {
    console.error('Erro ao buscar mídia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar mídia (para definir como principal, alterar alt text, etc.)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mediaId, isMain, altText, caption } = body;

    if (!mediaId) {
      return NextResponse.json(
        { error: 'ID da mídia é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar mídia
    const media = await prisma.adMedia.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      return NextResponse.json(
        { error: 'Mídia não encontrada' },
        { status: 404 }
      );
    }

    // Se está definindo como principal, remover flag das outras
    if (isMain === true) {
      await prisma.adMedia.updateMany({
        where: {
          advertisementId: media.advertisementId,
          isMain: true,
          id: { not: mediaId },
        },
        data: {
          isMain: false,
        },
      });
    }

    // Atualizar mídia
    const updatedMedia = await prisma.adMedia.update({
      where: { id: mediaId },
      data: {
        ...(isMain !== undefined && { isMain }),
        ...(altText !== undefined && { altText }),
        ...(caption !== undefined && { caption }),
      },
      include: {
        uploader: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

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

// DELETE - Deletar mídia
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('mediaId');

    if (!mediaId) {
      return NextResponse.json(
        { error: 'ID da mídia é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar mídia
    const media = await prisma.adMedia.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      return NextResponse.json(
        { error: 'Mídia não encontrada' },
        { status: 404 }
      );
    }

    // Deletar arquivo físico
    try {
      const fs = require('fs').promises;
      if (existsSync(media.storagePath)) {
        await fs.unlink(media.storagePath);
      }

      // Se tiver thumbnail, deletar também
      if (media.thumbnailUrl) {
        const thumbnailPath = path.join(
          process.cwd(),
          'public',
          media.thumbnailUrl
        );
        if (existsSync(thumbnailPath)) {
          await fs.unlink(thumbnailPath);
        }
      }
    } catch (fileError) {
      console.warn('Erro ao deletar arquivo físico:', fileError);
      // Continuar mesmo se não conseguir deletar o arquivo
    }

    // Deletar do banco
    await prisma.adMedia.delete({
      where: { id: mediaId },
    });

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

// Função utilitária para validar se um arquivo é uma imagem
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

// Função utilitária para validar se um arquivo é um vídeo
export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

// Função utilitária para obter extensão de arquivo válida
export function getValidExtension(
  originalName: string,
  mimeType: string
): string {
  const originalExt = path.extname(originalName).toLowerCase();

  // Mapeamento de MIME types para extensões
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/ogg': '.ogg',
  };

  // Se o MIME type tem uma extensão mapeada, usar ela
  if (mimeToExt[mimeType]) {
    return mimeToExt[mimeType];
  }

  // Senão, usar a extensão original ou .bin como fallback
  return originalExt || '.bin';
}

// Função utilitária para formatar tamanho de arquivo
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
