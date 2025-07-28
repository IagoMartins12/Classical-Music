// app/api/works/[workId]/media/route.ts - ATUALIZADA PARA ÁUDIO ALTERNATIVO
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

interface Params {
  workId: string;
}

// PUT - Atualizar mídia da obra
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { workId } = await params;
    const updateData = await request.json();

    console.log('🎵 [MEDIA-API] Atualizando mídia:', {
      workId,
      updateData: Object.keys(updateData),
      user: session.user.email,
    });

    // Verificar se a obra existe e permissões
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        title: true,
        createdBy: true,
        customAudioFile: true, // 🆕 Para verificar uploads existentes
        customAudioSource: true, // 🆕 Para verificar tipo de fonte
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

    // Preparar dados para atualização
    const dataToUpdate: any = {};

    // Spotify
    if (updateData.spotifyTrackId) {
      dataToUpdate.spotifyTrackId = updateData.spotifyTrackId;
      dataToUpdate.spotifyTrackUrl = updateData.spotifyTrackUrl;
      dataToUpdate.spotifyDisplayTitle = updateData.spotifyDisplayTitle || null;
      dataToUpdate.spotifyDuration = updateData.spotifyDuration || null;
      dataToUpdate.spotifyArtists = updateData.spotifyArtists || null;
      dataToUpdate.spotifyThumbnail = updateData.spotifyThumbnail || null; // 🆕 Thumbnail
    }

    // YouTube
    if (updateData.youtubeVideoId) {
      dataToUpdate.youtubeVideoId = updateData.youtubeVideoId;
      dataToUpdate.youtubeVideoUrl = updateData.youtubeVideoUrl;
      dataToUpdate.youtubeTitle = updateData.youtubeTitle;
    }

    // 🆕 Áudio customizado (upload do usuário)
    if (updateData.customAudioFile) {
      dataToUpdate.customAudioFile = updateData.customAudioFile;
      dataToUpdate.customAudioUrl = updateData.customAudioFile; // URL é o mesmo que file para uploads
      dataToUpdate.customAudioSource = updateData.customAudioSource || 'upload'; // 🆕 Marcar como upload
      dataToUpdate.customAudioMetadata = updateData.customAudioMetadata || null; // 🆕 Metadados
    }

    // 🆕 Áudio alternativo (fonte externa salva automaticamente)
    if (updateData.customAudioUrl && !updateData.customAudioFile) {
      // Caso seja uma fonte alternativa (não upload)
      dataToUpdate.customAudioUrl = updateData.customAudioUrl;
      dataToUpdate.customAudioSource =
        updateData.customAudioSource || 'alternative'; // 🆕 Fonte alternativa
      dataToUpdate.customAudioMetadata = updateData.customAudioMetadata || null; // 🆕 Metadados

      // Não definir customAudioFile para fontes externas
      if (!work.customAudioFile || work.customAudioSource !== 'upload') {
        dataToUpdate.customAudioFile = null;
      }
    }

    // 🆕 Remover áudio customizado (limpar todos os campos relacionados)
    if (updateData.removeCustomAudio) {
      console.log('🗑️ [MEDIA-API] Removendo áudio customizado:', {
        currentSource: work.customAudioSource,
        currentFile: work.customAudioFile,
      });

      dataToUpdate.customAudioFile = null;
      dataToUpdate.customAudioUrl = null;
      dataToUpdate.customAudioSource = null; // 🆕 Limpar fonte
      dataToUpdate.customAudioMetadata = null; // 🆕 Limpar metadados
    }

    // Vídeo aula
    if (updateData.videoAulaFile) {
      dataToUpdate.videoAulaFile = updateData.videoAulaFile;
      dataToUpdate.videoAulaUrl = updateData.videoAulaFile;
      dataToUpdate.videoAulaTitle = updateData.videoAulaTitle || work.title;
      dataToUpdate.videoAulaType = updateData.videoAulaType || 'video';
      dataToUpdate.videoAulaSource = 'local';
      dataToUpdate.videoAulaAddedBy = session.user.id;
      dataToUpdate.videoAulaAddedAt = new Date();
    }

    // Marcar fonte da mídia
    if (updateData.mediaSource) {
      dataToUpdate.mediaSource = updateData.mediaSource;
    }

    // 🆕 Se não tem campos para atualizar, retornar erro
    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      );
    }

    // Atualizar na base de dados
    const updatedWork = await prisma.work.update({
      where: { id: workId },
      data: dataToUpdate,
    });

    console.log('✅ [MEDIA-API] Mídia atualizada:', {
      workId,
      fieldsUpdated: Object.keys(dataToUpdate),
      audioSource: updatedWork.customAudioSource, // 🆕 Log da fonte de áudio
    });

    // Revalidar cache
    revalidateTag('work-basic-data');
    revalidateTag(`work-${workId}`);

    return NextResponse.json({
      success: true,
      message: 'Mídia atualizada com sucesso',
      updatedFields: Object.keys(dataToUpdate),
      // 🆕 Retornar informações do áudio atualizado
      audioInfo: {
        hasCustomAudio: !!(
          updatedWork.customAudioUrl || updatedWork.customAudioFile
        ),
        audioSource: updatedWork.customAudioSource,
        audioUrl: updatedWork.customAudioUrl,
        audioFile: updatedWork.customAudioFile,
      },
    });
  } catch (error) {
    console.error('❌ [MEDIA-API] Erro ao atualizar mídia:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// GET - Obter mídia da obra
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { workId } = await params;

    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        title: true,
        // Spotify
        spotifyTrackId: true,
        spotifyTrackUrl: true,
        spotifyDisplayTitle: true,
        spotifyDuration: true,
        spotifyArtists: true,
        spotifyThumbnail: true, // 🆕 Thumbnail

        // YouTube
        youtubeVideoId: true,
        youtubeVideoUrl: true,
        youtubeTitle: true,

        // 🆕 Áudio customizado expandido
        customAudioUrl: true,
        customAudioFile: true,
        customAudioSource: true, // 🆕 Fonte do áudio
        customAudioMetadata: true, // 🆕 Metadados

        // Vídeo aula
        videoAulaUrl: true,
        videoAulaFile: true,
        videoAulaTitle: true,
        videoAulaType: true,
        videoAulaSource: true,

        // Metadata
        mediaSource: true,
        lastMediaSearch: true,
        mediaSearchError: true,

        composer: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // 🆕 Processar dados de áudio customizado
    const audioInfo = {
      hasCustomAudio: !!(work.customAudioUrl || work.customAudioFile),
      isUpload: work.customAudioSource === 'upload',
      isAlternativeSource:
        work.customAudioSource && work.customAudioSource !== 'upload',
      source: work.customAudioSource,
      url: work.customAudioUrl,
      file: work.customAudioFile,
      metadata: work.customAudioMetadata,
    };

    return NextResponse.json({
      success: true,
      media: work,
      audioInfo, // 🆕 Informações processadas do áudio
    });
  } catch (error) {
    console.error('❌ [MEDIA-API] Erro ao obter mídia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remover mídia específica
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
    const mediaType = searchParams.get('type'); // 'spotify', 'youtube', 'custom-audio', 'video-aula'

    if (!mediaType) {
      return NextResponse.json(
        { error: 'Tipo de mídia é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar permissões
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: {
        createdBy: true,
        customAudioSource: true, // 🆕 Para log
        customAudioFile: true, // 🆕 Para log
      },
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

    // Preparar dados para limpeza
    const dataToUpdate: any = {};

    switch (mediaType) {
      case 'spotify':
        dataToUpdate.spotifyTrackId = null;
        dataToUpdate.spotifyTrackUrl = null;
        dataToUpdate.spotifyDisplayTitle = null;
        dataToUpdate.spotifyDuration = null;
        dataToUpdate.spotifyArtists = null;
        dataToUpdate.spotifyThumbnail = null;
        break;

      case 'youtube':
        dataToUpdate.youtubeVideoId = null;
        dataToUpdate.youtubeVideoUrl = null;
        dataToUpdate.youtubeTitle = null;
        break;

      case 'custom-audio':
        // 🆕 Limpar todos os campos de áudio customizado
        dataToUpdate.customAudioUrl = null;
        dataToUpdate.customAudioFile = null;
        dataToUpdate.customAudioSource = null; // 🆕 Limpar fonte
        dataToUpdate.customAudioMetadata = null; // 🆕 Limpar metadados
        break;

      case 'video-aula':
        dataToUpdate.videoAulaUrl = null;
        dataToUpdate.videoAulaFile = null;
        dataToUpdate.videoAulaTitle = null;
        dataToUpdate.videoAulaType = null;
        dataToUpdate.videoAulaSource = null;
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo de mídia inválido' },
          { status: 400 }
        );
    }

    // Atualizar na base de dados
    await prisma.work.update({
      where: { id: workId },
      data: dataToUpdate,
    });

    console.log('🗑️ [MEDIA-API] Mídia removida:', {
      workId,
      mediaType,
      fieldsCleared: Object.keys(dataToUpdate),
      previousAudioSource: work.customAudioSource, // 🆕 Log da fonte anterior
    });

    // Revalidar cache
    revalidateTag('work-basic-data');
    revalidateTag(`work-${workId}`);

    return NextResponse.json({
      success: true,
      message: `${mediaType} removido com sucesso`,
      clearedFields: Object.keys(dataToUpdate), // 🆕 Campos que foram limpos
    });
  } catch (error) {
    console.error('❌ [MEDIA-API] Erro ao remover mídia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
