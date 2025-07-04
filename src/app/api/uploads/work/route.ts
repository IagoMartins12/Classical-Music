// app/api/uploads/work/route.ts
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
      parentWorkId,
      movementNumber,
      subtitle,
      timeSignature,
      tempoMarking,
      movementsDetailed,
      imslpTags,
      difficultyLevel,
    } = body;

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
      return NextResponse.json(
        {
          error: 'Já existe uma obra com esse título para este compositor',
        },
        { status: 409 }
      );
    }

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
        categoryNames: categoryNames || [],
        workGenresArr: workGenresArr || [],
        dedicateTo,
        dedicationComposerLink,
        instrumentation,
        workType: workType || 'INDIVIDUAL',
        isPartOfCollection: isPartOfCollection || false,
        parentWorkId,
        movementNumber,
        subtitle,
        timeSignature,
        tempoMarking,
        movementsDetailed,
        imslpTags: imslpTags || [],
        difficultyLevel,
        // Campos para rastreamento
        createdBy: session.user.id, // Assumindo que você adicionará este campo
        isCustom: !imslpId, // Assumindo que você adicionará este campo
      },
      include: {
        composer: { select: { name: true, fullName: true } },
        instrument: { select: { name: true } },
        epoch: { select: { name: true } },
      },
    });

    await revalidateUploadsCache(session.user.id);

    return NextResponse.json({
      success: true,
      work,
      message: 'Obra criada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar obra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
