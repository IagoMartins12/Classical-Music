// app/api/uploads/work/route.ts - ATUALIZADO COM SISTEMA DE MÍDIA
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';
import { logWorkCreate } from '@/app/utils/historyUtils';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

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

    // Verificar se compositor, instrumento e época existem
    const [composer, instrument, epoch] = await Promise.all([
      prisma.composer.findUnique({
        where: { id: body.composerId },
        select: { id: true, name: true, fullName: true },
      }),
      prisma.instrument.findUnique({
        where: { id: body.instrumentId },
        select: { id: true, name: true },
      }),
      prisma.epoch.findUnique({
        where: { id: body.epochId },
        select: { id: true, name: true },
      }),
    ]);

    if (!composer) {
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 400 }
      );
    }

    if (!instrument) {
      return NextResponse.json(
        { error: 'Instrumento não encontrado' },
        { status: 400 }
      );
    }

    if (!epoch) {
      return NextResponse.json(
        { error: 'Época não encontrada' },
        { status: 400 }
      );
    }

    // 🆕 Preparar dados de mídia se fornecidos
    const mediaData: any = {};

    if (body.spotifyTrackId || body.spotifyTrackUrl) {
      mediaData.spotifyTrackId = body.spotifyTrackId || null;
      mediaData.spotifyTrackUrl = body.spotifyTrackUrl || null;
    }

    if (body.youtubeVideoId || body.youtubeVideoUrl) {
      mediaData.youtubeVideoId = body.youtubeVideoId || null;
      mediaData.youtubeVideoUrl = body.youtubeVideoUrl || null;
      mediaData.youtubeTitle = body.youtubeTitle || null;
    }

    if (body.customAudioUrl || body.customAudioFile) {
      mediaData.customAudioUrl = body.customAudioUrl || null;
      mediaData.customAudioFile = body.customAudioFile || null;
    }

    if (body.videoAulaUrl || body.videoAulaFile) {
      mediaData.videoAulaUrl = body.videoAulaUrl || null;
      mediaData.videoAulaFile = body.videoAulaFile || null;
      mediaData.videoAulaTitle = body.videoAulaTitle || null;
      mediaData.videoAulaType = body.videoAulaType || 'video';
      mediaData.videoAulaSource = body.videoAulaSource || 'youtube';
      mediaData.videoAulaAddedBy = userId;
      mediaData.videoAulaAddedAt = new Date();
      mediaData.videoAulaMetadata = body.videoAulaMetadata || null;
    }

    // Determinar fonte da mídia
    if (Object.keys(mediaData).length > 0) {
      mediaData.mediaSource = body.mediaSource || 'manual';
    } else {
      mediaData.mediaSource = 'none';
    }

    // Criar obra
    const work = await prisma.work.create({
      data: {
        ...body,
        ...mediaData, // 🆕 Incluir dados de mídia
        createdBy: userId,
        isCustom: true,
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
        movementsDetailed: body.movementsDetailed
          ? typeof body.movementsDetailed === 'string'
            ? JSON.parse(body.movementsDetailed)
            : body.movementsDetailed
          : null,
      },
      include: {
        composer: { select: { name: true, fullName: true } },
        epoch: { select: { name: true } },
        instrument: { select: { name: true } },
      },
    });

    // 🆕 Registrar no histórico (incluindo dados de mídia)
    await logWorkCreate(
      userId,
      work.id,
      {
        title: work.title,
        subtitle: work.subtitle,
        composerName: work.composer.fullName || work.composer.name,
        epochName: work.epoch.name,
        instrumentName: work.instrument.name,
        opOrCatalog: work.opOrCatalog,
        compositionYear: work.compositionYear,
        firstPublishDate: work.firstPublishDate,
        tone: work.tone,
        workStyle: work.workStyle,
        workType: work.workType,
        categoryNames: work.categoryNames,
        workGenresArr: work.workGenresArr,
        difficultyLevel: work.difficultyLevel,
        isIMSLP: !!work.imslpId,
        dataSource: body.dataSource || 'manual',
        // 🆕 Incluir informações de mídia no histórico
        hasMedia: Object.keys(mediaData).length > 1, // > 1 porque sempre tem mediaSource
        mediaSource: mediaData.mediaSource,
        hasSpotify: !!work.spotifyTrackId,
        hasYoutube: !!work.youtubeVideoId,
        hasCustomAudio: !!(work.customAudioUrl || work.customAudioFile),
        hasVideoAula: !!(work.videoAulaUrl || work.videoAulaFile),
        videoAulaType: work.videoAulaType,
        videoAulaSource: work.videoAulaSource,
      },
      request
    );

    // Invalidar cache
    await revalidateUploadsCache(userId);

    console.log(
      `✅ [WORK-CREATE] Obra "${work.title}" criada com mídia por ${session.user.email}`
    );

    return NextResponse.json({
      message: 'Obra criada com sucesso!',
      work,
    });
  } catch (error) {
    console.error('Erro ao criar obra:', error);

    // Tratamento de erros específicos
    if (error instanceof Error) {
      if (error.message.includes('Duplicate')) {
        return NextResponse.json(
          { error: 'Já existe uma obra com estes dados' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
