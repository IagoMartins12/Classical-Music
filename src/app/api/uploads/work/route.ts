// app/api/uploads/work/route.ts
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

    // Verificar se já existe obra com mesmo imslpId
    // if (body.imslpId) {
    //   const existingWork = await prisma.work.findFirst({
    //     where: {
    //       imslpId: body.imslpId,
    //       id: { not: body.excludeId || null }, // Para permitir edição
    //     },
    //   });

    //   if (existingWork) {
    //     return NextResponse.json(
    //       {
    //         error: 'Já existe uma obra com este ID do IMSLP',
    //         existingWork: {
    //           id: existingWork.id,
    //           title: existingWork.title,
    //         },
    //       },
    //       { status: 400 }
    //     );
    //   }
    // }

    // Criar obra
    const work = await prisma.work.create({
      data: {
        ...body,
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

    // 🆕 Registrar no histórico
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
      },
      request
    );

    // Invalidar cache
    await revalidateUploadsCache(userId);

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
