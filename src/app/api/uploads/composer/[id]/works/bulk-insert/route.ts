// app/api/uploads/composer/[id]/works/bulk-insert/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';
import { logWorkCreate } from '@/app/utils/historyUtils';

interface WorkToInsert {
  id: string;
  title: string;
  imslpId: string;
  imslpUrl: string;
  opOrCatalog?: string;
  instrument?: string;
}

interface ProcessResult {
  workId: string;
  tempId: string;
  title: string;
  status: 'success' | 'error' | 'duplicate' | 'skipped';
  message: string;
  details?: any;
  createdWorkId?: string;
}

interface Params {
  id: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id: composerId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { works }: { works: WorkToInsert[] } = body;

    if (!works || works.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma obra foi selecionada' },
        { status: 400 }
      );
    }

    // Verificar se compositor existe
    const composer = await prisma.composer.findUnique({
      where: { id: composerId },
      select: {
        id: true,
        name: true,
        fullName: true,
        dataSource: true,
        epochId: true,
      },
    });

    if (!composer) {
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 404 }
      );
    }

    if (composer.dataSource !== 'imslp') {
      return NextResponse.json(
        { error: 'Este compositor não foi importado do IMSLP' },
        { status: 400 }
      );
    }

    console.log(
      `🚀 Iniciando bulk insert de ${works.length} obras para ${composer.fullName}`
    );

    const results: ProcessResult[] = [];
    const BATCH_SIZE = 3; // Processar em lotes para não sobrecarregar

    // Buscar instrumento padrão "Piano" para fallback
    const defaultInstrument = await prisma.instrument.findFirst({
      where: { name: { contains: 'Piano', mode: 'insensitive' } },
    });

    if (!defaultInstrument) {
      return NextResponse.json(
        { error: 'Instrumento padrão não encontrado' },
        { status: 500 }
      );
    }

    // Processar obras em lotes
    for (let i = 0; i < works.length; i += BATCH_SIZE) {
      const batch = works.slice(i, i + BATCH_SIZE);
      console.log(
        `📦 Processando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
          works.length / BATCH_SIZE
        )}`
      );

      const batchPromises = batch.map((work) =>
        processIndividualWork(work, composer, userId, defaultInstrument.id)
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        const work = batch[index];
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            workId: work.imslpId,
            tempId: work.id,
            title: work.title,
            status: 'error',
            message: result.reason?.message || 'Erro desconhecido',
            details: result.reason,
          });
        }
      });

      // Pequena pausa entre lotes para não sobrecarregar
      if (i + BATCH_SIZE < works.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Invalidar cache
    await revalidateUploadsCache(userId);

    // Calcular estatísticas
    const stats = {
      total: results.length,
      success: results.filter((r) => r.status === 'success').length,
      errors: results.filter((r) => r.status === 'error').length,
      duplicates: results.filter((r) => r.status === 'duplicate').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
    };

    console.log(`✅ Bulk insert concluído:`, stats);

    return NextResponse.json({
      success: true,
      results,
      stats,
      composer: {
        id: composer.id,
        name: composer.fullName,
      },
    });
  } catch (error) {
    console.error('❌ Erro no bulk insert:', error);
    return NextResponse.json(
      {
        error: 'Erro interno no processamento em lote',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

async function processIndividualWork(
  work: WorkToInsert,
  composer: any,
  userId: string,
  defaultInstrumentId: string
): Promise<ProcessResult> {
  try {
    console.log(`🔍 Processando obra: ${work.title}`);

    // Verificar se já existe
    const existingWork = await prisma.work.findFirst({
      where: {
        OR: [
          { imslpId: work.imslpId },
          {
            composerId: composer.id,
            title: {
              contains: work.title.substring(0, 20),
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    if (existingWork) {
      console.log(`⚠️ Obra já existe: ${work.title}`);
      return {
        workId: work.imslpId,
        tempId: work.id,
        title: work.title,
        status: 'duplicate',
        message: 'Esta obra já existe no banco de dados',
        createdWorkId: existingWork.id,
      };
    }

    // Fazer scraping completo da obra
    console.log(`🌐 Fazendo scraping completo: ${work.imslpUrl}`);

    // Usar o scraper existente do work/scraper
    const scrapingResponse = await fetch(
      `${process.env.NEXTAUTH_URL}/api/uploads/work/scraper`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: work.imslpUrl }),
      }
    );

    if (!scrapingResponse.ok) {
      throw new Error(`Erro no scraping: ${scrapingResponse.statusText}`);
    }

    const scrapingData = await scrapingResponse.json();

    if (!scrapingData.success) {
      throw new Error(scrapingData.error || 'Erro no scraping');
    }

    const workData = scrapingData.data;

    // Determinar instrumento
    let instrumentId = defaultInstrumentId;
    if (workData.primaryInstrument) {
      const instrument = await prisma.instrument.findFirst({
        where: {
          name: { contains: workData.primaryInstrument, mode: 'insensitive' },
        },
      });
      if (instrument) {
        instrumentId = instrument.id;
      }
    } else if (work.instrument) {
      const instrument = await prisma.instrument.findFirst({
        where: {
          name: { contains: work.instrument, mode: 'insensitive' },
        },
      });
      if (instrument) {
        instrumentId = instrument.id;
      }
    }

    // Preparar dados para criação
    const createData = {
      title: workData.title || work.title,
      subtitle: workData.subtitle,
      composerId: composer.id,
      instrumentId,
      epochId: composer.epochId,

      // Dados do IMSLP
      imslpId: workData.imslpId || work.imslpId,
      imslpPermlink: workData.imslpPermlink || work.imslpUrl,

      // Dados extraídos
      opOrCatalog: workData.opOrCatalog || work.opOrCatalog,
      compositionYear: workData.compositionYear,
      firstPublishDate: workData.firstPublishDate,
      tone: workData.tone,
      tempoMarking: workData.tempoMarking,
      mediaDuration: workData.mediaDuration,
      workStyle: workData.workStyle,
      moviment: workData.moviment,
      instrumentation: workData.instrumentation,
      dedicateTo: workData.dedicateTo,

      // Arrays
      categoryNames: workData.categoryNames || [],
      workGenresArr: workData.workGenresArr || [],
      imslpTags: workData.imslpTags || [],

      // Metadados
      workType: workData.workType || 'INDIVIDUAL',
      movementNumber: workData.movementNumber,
      difficultyLevel: workData.difficultyLevel,

      // Controle
      createdBy: userId,
      isCustom: false, // Vem do IMSLP
    };

    // Criar obra no banco
    const createdWork = await prisma.work.create({
      data: createData,
      include: {
        composer: { select: { name: true, fullName: true } },
        epoch: { select: { name: true } },
        instrument: { select: { name: true } },
      },
    });

    // Registrar no histórico
    await logWorkCreate(userId, createdWork.id, {
      title: createdWork.title,
      subtitle: createdWork.subtitle,
      composerName: createdWork.composer.fullName || createdWork.composer.name,
      epochName: createdWork.epoch.name,
      instrumentName: createdWork.instrument.name,
      opOrCatalog: createdWork.opOrCatalog,
      compositionYear: createdWork.compositionYear,
      workType: createdWork.workType,
      isIMSLP: true,
      dataSource: 'bulk_import_imslp',
    });

    console.log(`✅ Obra criada com sucesso: ${createdWork.title}`);

    return {
      workId: work.imslpId,
      tempId: work.id,
      title: work.title,
      status: 'success',
      message: 'Obra importada com sucesso',
      createdWorkId: createdWork.id,
      details: {
        finalTitle: createdWork.title,
        opOrCatalog: createdWork.opOrCatalog,
        instrument: createdWork.instrument.name,
        dataCompleteness: workData.dataCompleteness,
      },
    };
  } catch (error) {
    console.error(`❌ Erro ao processar obra ${work.title}:`, error);

    return {
      workId: work.imslpId,
      tempId: work.id,
      title: work.title,
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      details: error,
    };
  }
}
