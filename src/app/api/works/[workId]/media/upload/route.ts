// app/api/works/[workId]/media/upload/route.ts - ATUALIZADO PARA CLOUDINARY
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import {
  uploadVideoAula,
  uploadCustomAudio,
  deleteFromCloudinary,
} from '@/app/libs/cloudinary';

interface Params {
  workId: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { workId } = await params;

    // Verificar se a obra existe e permissões
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        title: true,
        createdBy: true,
      },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role >= 1;
    const isOwner = work.createdBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mediaType = formData.get('mediaType') as string; // 'audio', 'video', 'videoAula'

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      );
    }

    console.log('📤 [CLOUDINARY] Novo upload de mídia:', {
      workId,
      workTitle: work.title,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      mediaType,
      user: session.user.email,
    });

    // Validação de tipos por categoria
    const allowedTypes = {
      audio: [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/aac',
        'audio/m4a',
        'audio/flac',
      ],
      video: [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/avi',
        'video/mov',
        'video/mkv',
      ],
      videoAula: [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/avi',
        'video/mov',
        'video/mkv',
        'video/quicktime',
      ],
    };

    const validTypes =
      allowedTypes[mediaType as keyof typeof allowedTypes] || [];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Tipo de arquivo não suportado para ${mediaType}: ${file.type}`,
          allowedTypes: validTypes,
        },
        { status: 400 }
      );
    }

    // Validação de tamanho (mais generoso para mídia)
    const maxSizes = {
      audio: 100 * 1024 * 1024, // 100MB
      video: 500 * 1024 * 1024, // 500MB
      videoAula: 500 * 1024 * 1024, // 500MB
    };

    const maxSize =
      maxSizes[mediaType as keyof typeof maxSizes] || 100 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `Arquivo muito grande (máximo ${Math.round(
            maxSize / 1024 / 1024
          )}MB para ${mediaType})`,
        },
        { status: 400 }
      );
    }

    // ✅ UPLOAD PARA CLOUDINARY
    let uploadResult;

    try {
      switch (mediaType) {
        case 'videoAula':
          console.log('🎥 [CLOUDINARY] Fazendo upload de vídeo aula...');
          uploadResult = await uploadVideoAula(file, workId);
          break;

        case 'audio':
          console.log('🎵 [CLOUDINARY] Fazendo upload de áudio...');
          uploadResult = await uploadCustomAudio(file, workId);
          break;

        case 'video':
          console.log('📹 [CLOUDINARY] Fazendo upload de vídeo...');
          // Para vídeos genéricos, usar a função de vídeo aula (mesma lógica)
          uploadResult = await uploadVideoAula(file, workId);
          break;

        default:
          return NextResponse.json(
            { error: `Tipo de mídia não suportado: ${mediaType}` },
            { status: 400 }
          );
      }

      if (!uploadResult.success) {
        console.error('❌ [CLOUDINARY] Upload falhou:', uploadResult.error);
        return NextResponse.json(
          { error: `Erro no upload: ${uploadResult.error}` },
          { status: 500 }
        );
      }

      console.log('✅ [CLOUDINARY] Upload concluído:', uploadResult.secureUrl);
    } catch (uploadError) {
      console.error('❌ [CLOUDINARY] Erro no upload:', uploadError);
      return NextResponse.json(
        {
          error: 'Erro ao fazer upload para o Cloudinary',
          details:
            uploadError instanceof Error
              ? uploadError.message
              : 'Erro desconhecido',
        },
        { status: 500 }
      );
    }

    // ✅ URL PÚBLICA DO CLOUDINARY
    const publicUrl = uploadResult.secureUrl!;

    // Metadados do arquivo (mantendo compatibilidade)
    const fileMetadata = {
      originalName: file.name,
      fileName: file.name,
      size: uploadResult.fileSize || file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      uploadedBy: session.user.id,
      // ✅ DADOS EXTRAS DO CLOUDINARY
      cloudinaryPublicId: uploadResult.publicId,
      cloudinaryUrl: uploadResult.secureUrl,
      format: uploadResult.format,
      duration: uploadResult.duration, // Para vídeos/áudios
      width: uploadResult.width, // Para vídeos
      height: uploadResult.height, // Para vídeos
    };

    const response = {
      success: true,
      url: publicUrl, // ✅ URL do Cloudinary
      metadata: fileMetadata,
      message: `${mediaType} enviado com sucesso para o Cloudinary`,
      cloudinaryInfo: {
        publicId: uploadResult.publicId,
        secureUrl: uploadResult.secureUrl,
        format: uploadResult.format,
        bytes: uploadResult.fileSize,
        duration: uploadResult.duration,
      },
    };

    console.log('✅ [CLOUDINARY] Upload de mídia concluído:', {
      workId,
      mediaType,
      url: publicUrl,
      publicId: uploadResult.publicId,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ [CLOUDINARY] Erro geral no upload:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// ✅ DELETE - Remover arquivo de mídia do CLOUDINARY
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { workId } = await params;
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const mediaType = searchParams.get('mediaType');
    const publicId = searchParams.get('publicId'); // ✅ NOVO: publicId do Cloudinary

    if (!fileName || !mediaType) {
      return NextResponse.json(
        { error: 'fileName e mediaType são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar permissões
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: { createdBy: true },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role >= 1;
    const isOwner = work.createdBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    console.log('🗑️ [CLOUDINARY] Removendo mídia:', {
      workId,
      mediaType,
      fileName,
      publicId,
    });

    // ✅ TENTAR DELETAR DO CLOUDINARY PRIMEIRO
    let deletedFromCloudinary = false;

    if (publicId) {
      // Se tem publicId, deletar direto
      const resourceType = mediaType === 'audio' ? 'video' : 'video'; // Cloudinary trata áudio como 'video'
      deletedFromCloudinary = await deleteFromCloudinary(
        publicId,
        resourceType
      );

      if (deletedFromCloudinary) {
        console.log(
          '✅ [CLOUDINARY] Arquivo deletado do Cloudinary:',
          publicId
        );
      } else {
        console.warn(
          '⚠️ [CLOUDINARY] Falha ao deletar do Cloudinary:',
          publicId
        );
      }
    } else if (fileName) {
      // ✅ TENTAR EXTRAIR PUBLIC_ID DO FILENAME OU URL
      let extractedPublicId: string | undefined;

      // Se fileName é uma URL do Cloudinary, extrair o publicId
      if (fileName.includes('cloudinary.com')) {
        const urlParts = fileName.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        extractedPublicId = publicIdWithExtension.split('.')[0];
      } else {
        // Se é um fileName normal, gerar possível publicId baseado na convenção
        const baseFileName = fileName.replace(/\.[^/.]+$/, ''); // Remove extensão
        extractedPublicId = `${mediaType}_${workId}_${baseFileName}`;
      }

      if (extractedPublicId) {
        const resourceType = mediaType === 'audio' ? 'video' : 'video';
        deletedFromCloudinary = await deleteFromCloudinary(
          extractedPublicId,
          resourceType
        );

        if (deletedFromCloudinary) {
          console.log(
            '✅ [CLOUDINARY] Arquivo deletado (via filename):',
            extractedPublicId
          );
        }
      }
    }

    // ✅ FALLBACK: Tentar deletar arquivo local antigo (se existir)
    if (!deletedFromCloudinary) {
      try {
        const path = await import('path');
        const { unlink } = await import('fs/promises');

        const filePath = path.join(
          process.cwd(),
          'public',
          'uploads',
          workId,
          'media',
          mediaType,
          fileName
        );

        await unlink(filePath);
        console.log('🗑️ [LOCAL] Arquivo local removido:', fileName);
      } catch (localError) {
        console.warn(
          '⚠️ [LOCAL] Arquivo local não encontrado ou erro:',
          localError
        );

        // Se não conseguiu deletar nem do Cloudinary nem local, ainda retornar sucesso
        // pois o arquivo pode já ter sido deletado ou não existir
        console.log(
          'ℹ️ [DELETE] Arquivo pode já ter sido deletado anteriormente'
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Arquivo removido com sucesso',
      deletedFrom: deletedFromCloudinary ? 'cloudinary' : 'local',
    });
  } catch (error) {
    console.error('❌ [CLOUDINARY] Erro ao remover mídia:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
