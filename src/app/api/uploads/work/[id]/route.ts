import { cleanupWorkMediaServer } from '@/app/hooks/useWorkCleanup';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';
import { revalidateWorkCache } from '@/app/requests/work-page-details';
import { logWorkUpdate } from '@/app/utils/historyUtils';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  id: string;
}
// app/api/uploads/work/[id]/route.ts - PUT ATUALIZADO COM MÍDIA
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Buscar obra atual
    const currentWork = await prisma.work.findUnique({
      where: { id },
      include: {
        composer: { select: { name: true, fullName: true } },
        epoch: { select: { name: true } },
        instrument: { select: { name: true } },
      },
    });

    if (!currentWork) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = currentWork.createdBy === userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Validações básicas
    if (
      !body.title ||
      !body.composerId ||
      !body.instrumentId ||
      !body.epochId
    ) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }
    if (body.parentWorkId === '') {
      body.parentWorkId = null;
    }
    // Verificar se já existe obra com mesmo imslpId (exceto a atual)
    if (body.imslpId && body.imslpId !== currentWork.imslpId) {
      const existingWork = await prisma.work.findFirst({
        where: {
          imslpId: body.imslpId,
          id: { not: id },
        },
      });

      if (existingWork) {
        return NextResponse.json(
          {
            error: 'Já existe uma obra com este ID do IMSLP',
            existingWork: {
              id: existingWork.id,
              title: existingWork.title,
            },
          },
          { status: 400 }
        );
      }
    }

    // 🆕 Salvar dados antigos para comparação (incluindo mídia)
    const oldData = {
      title: currentWork.title,
      subtitle: currentWork.subtitle,
      composerId: currentWork.composerId,
      instrumentId: currentWork.instrumentId,
      epochId: currentWork.epochId,
      videoUrl: currentWork.videoUrl,
      imslpId: currentWork.imslpId,
      imslpPermlink: currentWork.imslpPermlink,
      opOrCatalog: currentWork.opOrCatalog,
      compositionYear: currentWork.compositionYear,
      firstPublishDate: currentWork.firstPublishDate,
      tone: currentWork.tone,
      mediaDuration: currentWork.mediaDuration,
      workStyle: currentWork.workStyle,
      moviment: currentWork.moviment,
      categoryNames: currentWork.categoryNames,
      workGenresArr: currentWork.workGenresArr,
      dedicateTo: currentWork.dedicateTo,
      instrumentation: currentWork.instrumentation,
      workType: currentWork.workType,
      movementNumber: currentWork.movementNumber,
      imslpTags: currentWork.imslpTags,
      difficultyLevel: currentWork.difficultyLevel,
      // 🆕 Dados de mídia antigos
      spotifyTrackId: currentWork.spotifyTrackId,
      spotifyTrackUrl: currentWork.spotifyTrackUrl,
      youtubeVideoId: currentWork.youtubeVideoId,
      youtubeVideoUrl: currentWork.youtubeVideoUrl,
      youtubeTitle: currentWork.youtubeTitle,
      customAudioUrl: currentWork.customAudioUrl,
      customAudioFile: currentWork.customAudioFile,
      videoAulaUrl: currentWork.videoAulaUrl,
      videoAulaFile: currentWork.videoAulaFile,
      videoAulaTitle: currentWork.videoAulaTitle,
      videoAulaType: currentWork.videoAulaType,
      videoAulaSource: currentWork.videoAulaSource,
      mediaSource: currentWork.mediaSource,
    };

    // 🆕 Preparar dados de mídia se fornecidos
    const mediaData: any = {};

    // Spotify
    if (
      body.hasOwnProperty('spotifyTrackId') ||
      body.hasOwnProperty('spotifyTrackUrl')
    ) {
      mediaData.spotifyTrackId = body.spotifyTrackId || null;
      mediaData.spotifyTrackUrl = body.spotifyTrackUrl || null;
    }

    // YouTube
    if (
      body.hasOwnProperty('youtubeVideoId') ||
      body.hasOwnProperty('youtubeVideoUrl')
    ) {
      mediaData.youtubeVideoId = body.youtubeVideoId || null;
      mediaData.youtubeVideoUrl = body.youtubeVideoUrl || null;
      mediaData.youtubeTitle = body.youtubeTitle || null;
    }

    // Áudio customizado
    if (
      body.hasOwnProperty('customAudioUrl') ||
      body.hasOwnProperty('customAudioFile')
    ) {
      mediaData.customAudioUrl = body.customAudioUrl || null;
      mediaData.customAudioFile = body.customAudioFile || null;
    }

    // Video Aula
    if (
      body.hasOwnProperty('videoAulaUrl') ||
      body.hasOwnProperty('videoAulaFile')
    ) {
      mediaData.videoAulaUrl = body.videoAulaUrl || null;
      mediaData.videoAulaFile = body.videoAulaFile || null;
      mediaData.videoAulaTitle = body.videoAulaTitle || null;
      mediaData.videoAulaType = body.videoAulaType || 'video';
      mediaData.videoAulaSource = body.videoAulaSource || 'youtube';

      // Se está adicionando/alterando video aula, atualizar metadados
      if (body.videoAulaUrl || body.videoAulaFile) {
        mediaData.videoAulaAddedBy = userId;
        mediaData.videoAulaAddedAt = new Date();
      }

      if (body.videoAulaMetadata) {
        mediaData.videoAulaMetadata = body.videoAulaMetadata;
      }
    }

    // Determinar fonte da mídia
    if (body.hasOwnProperty('mediaSource')) {
      mediaData.mediaSource = body.mediaSource;
    } else if (Object.keys(mediaData).length > 0) {
      // Se está alterando mídia mas não especificou source, marcar como manual
      mediaData.mediaSource = 'manual';
    }

    // Atualizar obra
    const updatedWork = await prisma.work.update({
      where: { id },
      data: {
        ...body,
        ...mediaData, // 🆕 Incluir dados de mídia
        lastEditedBy: userId,
        lastEditedAt: new Date(),
        // Converter arrays de string para formato correto
        categoryNames: Array.isArray(body.categoryNames)
          ? body.categoryNames
          : [],
        workGenresArr: Array.isArray(body.workGenresArr)
          ? body.workGenresArr
          : [],
        imslpTags: Array.isArray(body.imslpTags) ? body.imslpTags : [],
        // Converter números
        movementNumber: body.movementNumber
          ? parseInt(body.movementNumber)
          : null,
        // Converter JSON
      },
      include: {
        composer: { select: { name: true, fullName: true } },
        epoch: { select: { name: true } },
        instrument: { select: { name: true } },
      },
    });

    // 🆕 Detectar mudanças na mídia para histórico
    const mediaChanges = {
      spotifyChanged: oldData.spotifyTrackId !== updatedWork.spotifyTrackId,
      youtubeChanged: oldData.youtubeVideoId !== updatedWork.youtubeVideoId,
      customAudioChanged:
        oldData.customAudioFile !== updatedWork.customAudioFile,
      videoAulaChanged:
        oldData.videoAulaUrl !== updatedWork.videoAulaUrl ||
        oldData.videoAulaFile !== updatedWork.videoAulaFile,
      mediaSourceChanged: oldData.mediaSource !== updatedWork.mediaSource,
    };

    const hasMediaChanges = Object.values(mediaChanges).some(Boolean);

    // 🆕 Registrar alterações no histórico (incluindo mídia)
    await logWorkUpdate(
      userId,
      id,
      oldData,
      {
        title: updatedWork.title,
        subtitle: updatedWork.subtitle,
        composerId: updatedWork.composerId,
        instrumentId: updatedWork.instrumentId,
        epochId: updatedWork.epochId,
        videoUrl: updatedWork.videoUrl,
        imslpId: updatedWork.imslpId,
        imslpPermlink: updatedWork.imslpPermlink,
        opOrCatalog: updatedWork.opOrCatalog,
        compositionYear: updatedWork.compositionYear,
        firstPublishDate: updatedWork.firstPublishDate,
        tone: updatedWork.tone,
        mediaDuration: updatedWork.mediaDuration,
        workStyle: updatedWork.workStyle,
        moviment: updatedWork.moviment,
        categoryNames: updatedWork.categoryNames,
        workGenresArr: updatedWork.workGenresArr,
        dedicateTo: updatedWork.dedicateTo,
        instrumentation: updatedWork.instrumentation,
        workType: updatedWork.workType,
        movementNumber: updatedWork.movementNumber,
        imslpTags: updatedWork.imslpTags,
        difficultyLevel: updatedWork.difficultyLevel,
        // 🆕 Dados de mídia novos
        spotifyTrackId: updatedWork.spotifyTrackId,
        spotifyTrackUrl: updatedWork.spotifyTrackUrl,
        youtubeVideoId: updatedWork.youtubeVideoId,
        youtubeVideoUrl: updatedWork.youtubeVideoUrl,
        youtubeTitle: updatedWork.youtubeTitle,
        customAudioUrl: updatedWork.customAudioUrl,
        customAudioFile: updatedWork.customAudioFile,
        videoAulaUrl: updatedWork.videoAulaUrl,
        videoAulaFile: updatedWork.videoAulaFile,
        videoAulaTitle: updatedWork.videoAulaTitle,
        videoAulaType: updatedWork.videoAulaType,
        videoAulaSource: updatedWork.videoAulaSource,
        mediaSource: updatedWork.mediaSource,
        // 🆕 Metadados das mudanças de mídia
        mediaChanges,
        hasMediaChanges,
      },
      hasMediaChanges
        ? 'Obra e mídia atualizadas via formulário'
        : 'Obra atualizada via formulário',
      request
    );

    // Invalidar cache
    await revalidateUploadsCache(userId);
    await revalidateWorkCache(updatedWork.id);
    console.log(
      `✅ [WORK-UPDATE] Obra "${updatedWork.title}" atualizada${
        hasMediaChanges ? ' (incluindo mídia)' : ''
      } por ${session.user.email}`
    );

    return NextResponse.json({
      message: hasMediaChanges
        ? 'Obra e mídia atualizadas com sucesso!'
        : 'Obra atualizada com sucesso!',
      work: updatedWork,
    });
  } catch (error) {
    console.error('Erro ao atualizar obra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar obra COM limpeza automática de mídia
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    console.log('ID', id);
    // Verificar se obra existe e permissões
    const work = await prisma.work.findUnique({
      where: { id: id },
      select: {
        id: true,
        title: true,
        createdBy: true,
        // Verificar se tem mídia para log
        spotifyTrackId: true,
        youtubeVideoId: true,
        customAudioFile: true,
        videoAulaUrl: true,
        videoAulaFile: true,
      },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role >= 2; // Apenas super admin pode deletar
    const isOwner = work.createdBy === session.user.id;
    console.log('{ID}', { work, isAdmin, isOwner });

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    console.log(
      `🗑️ [WORK-DELETE] Iniciando exclusão da obra "${work.title}" por ${session.user.email}`
    );

    // Verificar se tem mídia associada
    const hasMedia = !!(
      work.spotifyTrackId ||
      work.youtubeVideoId ||
      work.customAudioFile ||
      work.videoAulaUrl ||
      work.videoAulaFile
    );

    if (hasMedia) {
      console.log(
        `📁 [WORK-DELETE] Obra tem mídia associada, iniciando limpeza...`
      );
    }

    // 1. Primeiro, remover da base de dados (cascade vai cuidar das relações)
    await prisma.work.delete({
      where: { id: id },
    });

    console.log(`✅ [WORK-DELETE] Obra removida da base de dados`);

    // 2. Depois, limpar arquivos de mídia do sistema de arquivos
    if (hasMedia) {
      const cleanupSuccess = await cleanupWorkMediaServer(id);

      if (cleanupSuccess) {
        console.log(`🧹 [WORK-DELETE] Arquivos de mídia removidos com sucesso`);
      } else {
        console.warn(
          `⚠️ [WORK-DELETE] Alguns arquivos de mídia podem não ter sido removidos`
        );
      }
    }

    // 3. Log de auditoria
    console.log(
      `🎉 [WORK-DELETE] Exclusão completa da obra "${work.title}" finalizada`
    );

    return NextResponse.json({
      success: true,
      message: `Obra "${work.title}" e todos os arquivos associados foram removidos com sucesso`,
      hadMedia: hasMedia,
    });
  } catch (error) {
    console.error('❌ [WORK-DELETE] Erro ao deletar obra:', error);

    // Se erro for de constraint/relação, dar mensagem mais específica
    if (error instanceof Error && error.message.includes('constraint')) {
      return NextResponse.json(
        {
          error:
            'Não é possível deletar esta obra pois ela tem dados relacionados (favoritos, anotações, etc.). Entre em contato com o administrador.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// GET - Buscar obra (código existente mantido se houver)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;

    const work = await prisma.work.findUnique({
      where: { id: id },
      include: {
        composer: {
          select: {
            id: true,
            name: true,
            fullName: true,
            epochName: true,
          },
        },
        instrument: {
          select: {
            id: true,
            name: true,
          },
        },
        epoch: {
          select: {
            id: true,
            name: true,
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

    return NextResponse.json({
      success: true,
      work,
    });
  } catch (error) {
    console.error('❌ [WORK-GET] Erro ao buscar obra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// 🆕 PATCH - Atualizar apenas mídia da obra
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verificar se obra existe e permissões
    const work = await prisma.work.findUnique({
      where: { id: id },
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

    // Atualizar apenas campos de mídia
    const mediaFields = {
      spotifyTrackId: body.spotifyTrackId || null,
      spotifyTrackUrl: body.spotifyTrackUrl || null,
      youtubeVideoId: body.youtubeVideoId || null,
      youtubeVideoUrl: body.youtubeVideoUrl || null,
      youtubeTitle: body.youtubeTitle || null,
      customAudioUrl: body.customAudioUrl || null,
      customAudioFile: body.customAudioFile || null,
      videoAulaUrl: body.videoAulaUrl || null,
      videoAulaFile: body.videoAulaFile || null,
      videoAulaTitle: body.videoAulaTitle || null,
      videoAulaType: body.videoAulaType || null,
      videoAulaSource: body.videoAulaSource || null,
      videoAulaAddedBy: session.user.id,
      videoAulaAddedAt: new Date(),
      mediaSource: body.mediaSource || 'manual',
      lastEditedBy: session.user.id,
      lastEditedAt: new Date(),
    };

    const updatedWork = await prisma.work.update({
      where: { id: id },
      data: mediaFields,
    });

    console.log(
      `🎵 [MEDIA-UPDATE] Mídia da obra "${work.title}" atualizada por ${session.user.email}`
    );

    return NextResponse.json({
      success: true,
      message: 'Mídia atualizada com sucesso!',
      work: updatedWork,
    });
  } catch (error) {
    console.error('❌ [MEDIA-UPDATE] Erro ao atualizar mídia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
