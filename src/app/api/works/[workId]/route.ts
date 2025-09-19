// api/works/[workId]/route.ts - ATUALIZADO COM CAMPOS COMPLETOS
import prisma from '@/app/libs/prismadb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workId: string }> }
) {
  try {
    const { workId } = await params;
    let workIdVariable: string | null = workId;

    if (!workIdVariable) {
      const { searchParams } = new URL(request.url);
      workIdVariable = searchParams.get('workId');
    }

    console.log('🔍 [API-WORKS] workId recebido:', workIdVariable);

    if (!workIdVariable) {
      console.log('❌ [API-WORKS] workId não fornecido');
      return NextResponse.json(
        { error: 'ID da obra é obrigatório.' },
        { status: 400 }
      );
    }

    // 🆕 BUSCAR DADOS COMPLETOS DA OBRA PARA CÓPIA
    const work = await prisma.work.findFirst({
      where: {
        id: workIdVariable,
      },
      select: {
        id: true,
        title: true,
        subtitle: true,

        // Dados catálogo que podem ser copiados
        opOrCatalog: true,
        compositionYear: true,
        firstPublishDate: true,
        tone: true,
        mediaDuration: true,

        // Dados musicais
        workStyle: true,
        moviment: true,
        categoryNames: true,
        workGenresArr: true,
        dedicateTo: true,
        instrumentation: true,
        workType: true,
        difficultyLevel: true,

        // Dados IMSLP
        imslpPermlink: true,
        imslpId: true,
        imslpTags: true,

        // Dados do compositor
        composer: {
          select: {
            id: true,
            name: true,
            fullName: true,
          },
        },

        // Dados da época e instrumento
        epochId: true,
        epoch: {
          select: {
            id: true,
            name: true,
          },
        },
        instrumentId: true,
        instrument: {
          select: {
            id: true,
            name: true,
          },
        },

        // Metadados
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!work) {
      console.log('❌ [API-WORKS] Obra não encontrada:', workIdVariable);
      return NextResponse.json(
        { error: 'Obra não encontrada.' },
        { status: 404 }
      );
    }

    console.log('✅ [API-WORKS] Obra encontrada:', work.title);

    // 🆕 ESTRUTURAR RESPOSTA COM DADOS PARA CÓPIA
    return NextResponse.json({
      success: true,
      id: work.id,
      title: work.title,
      subtitle: work.subtitle,

      // Dados do compositor
      composer: work.composer,

      // Dados catálogo
      opOrCatalog: work.opOrCatalog,
      compositionYear: work.compositionYear,
      firstPublishDate: work.firstPublishDate,
      tone: work.tone,
      mediaDuration: work.mediaDuration,

      // Dados musicais
      workStyle: work.workStyle,
      moviment: work.moviment,
      categoryNames: work.categoryNames,
      workGenresArr: work.workGenresArr,
      dedicateTo: work.dedicateTo,
      instrumentation: work.instrumentation,
      workType: work.workType,
      difficultyLevel: work.difficultyLevel,

      // Dados IMSLP
      imslpPermlink: work.imslpPermlink,
      imslpId: work.imslpId,
      imslpTags: work.imslpTags,

      // Relações
      epochId: work.epochId,
      epoch: work.epoch,
      instrumentId: work.instrumentId,
      instrument: work.instrument,

      // Metadados
      createdAt: work.createdAt,
      updatedAt: work.updatedAt,
    });
  } catch (error) {
    console.error('❌ [API-WORKS] Erro ao buscar obra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
