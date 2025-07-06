// app/api/uploads/work/route.ts - VERSÃO MELHORADA
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      composerId,
      instrumentId,
      epochId,
      videoUrl,
      imslpId,
      opOrCatalog,
      compositionYear,
      firstPublishDate,
      tone,
      mediaDuration,
      workStyle,
      moviment,
      categoryNames,
      workGenresArr,
      dedicateTo,
      dedicationComposerLink,
      instrumentation,
      workType,
      isPartOfCollection,
      movementNumber,
      subtitle,
      timeSignature,
      tempoMarking,
      movementsDetailed,
      imslpTags,
      difficultyLevel,
    } = body;

    console.log('🎼 Criando nova obra:', title);

    // Validação básica
    if (!title || !composerId || !instrumentId || !epochId) {
      return NextResponse.json(
        {
          error: 'Campos obrigatórios: título, compositor, instrumento e época',
        },
        { status: 400 }
      );
    }

    // Verificar se composer, instrument e epoch existem
    const [composer, instrument, epoch] = await Promise.all([
      prisma.composer.findUnique({ where: { id: composerId } }),
      prisma.instrument.findUnique({ where: { id: instrumentId } }),
      prisma.epoch.findUnique({ where: { id: epochId } }),
    ]);

    if (!composer || !instrument || !epoch) {
      console.log('❌ Entidades não encontradas:', {
        composer: !!composer,
        instrument: !!instrument,
        epoch: !!epoch,
      });
      return NextResponse.json(
        {
          error: 'Compositor, instrumento ou época não encontrado',
        },
        { status: 400 }
      );
    }

    // Verificar se já existe uma obra com esse título para este compositor
    const existingWork = await prisma.work.findFirst({
      where: {
        title,
        composerId,
        ...(imslpId ? { imslpId } : {}),
      },
    });

    if (existingWork) {
      console.log('⚠️ Obra duplicada:', existingWork.title);
      return NextResponse.json(
        {
          error: 'Já existe uma obra com esse título para este compositor',
        },
        { status: 409 }
      );
    }

    // Processar arrays de strings
    const processedCategoryNames = Array.isArray(categoryNames)
      ? categoryNames
      : typeof categoryNames === 'string'
      ? categoryNames
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [];

    const processedWorkGenres = Array.isArray(workGenresArr)
      ? workGenresArr
      : typeof workGenresArr === 'string'
      ? workGenresArr
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [];

    const processedImslpTags = Array.isArray(imslpTags)
      ? imslpTags
      : typeof imslpTags === 'string'
      ? imslpTags
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [];

    // Criar a obra
    const work = await prisma.work.create({
      data: {
        title,
        composerId,
        instrumentId,
        epochId,
        videoUrl,
        imslpPermlink: imslpId ? `https://imslp.org/wiki/${imslpId}` : '',
        imslpId: imslpId || '',
        opOrCatalog,
        compositionYear,
        firstPublishDate,
        tone,
        mediaDuration,
        workStyle,
        moviment,
        categoryNames: processedCategoryNames,
        workGenresArr: processedWorkGenres,
        dedicateTo,
        dedicationComposerLink,
        instrumentation,
        workType: workType || 'INDIVIDUAL',
        isPartOfCollection: isPartOfCollection || false,
        movementNumber,
        subtitle,
        timeSignature,
        tempoMarking,
        movementsDetailed,
        imslpTags: processedImslpTags,
        difficultyLevel,
        // Campos para rastreamento
        createdBy: session.user.id,
        isCustom: !imslpId,
      },
      include: {
        composer: { select: { name: true, fullName: true } },
        instrument: { select: { name: true } },
        epoch: { select: { name: true } },
      },
    });

    console.log('✅ Obra criada com sucesso:', work.title);

    await revalidateUploadsCache(session.user.id);

    return NextResponse.json({
      success: true,
      work,
      message: 'Obra criada com sucesso',
    });
  } catch (error) {
    console.error('❌ Erro ao criar obra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
