// app/api/uploads/work/route.ts - VERSÃO MELHORADA COM VALIDAÇÃO DE CATEGORIAS E GÊNEROS
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';
import {
  filterValidCategories,
  VALID_PORTUGUESE_WORKGENRES,
} from '@/app/utils/valid-categories-and-genres';

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
    console.log('📋 Categorias recebidas:', categoryNames);
    console.log('🎵 Gêneros recebidos:', workGenresArr);

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

    // Processar e validar categorias
    let processedCategoryNames: string[] = [];
    if (Array.isArray(categoryNames)) {
      processedCategoryNames = filterValidCategories(categoryNames);
    } else if (typeof categoryNames === 'string') {
      const categoryArray = categoryNames
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      processedCategoryNames = filterValidCategories(categoryArray);
    }

    console.log('✅ Categorias válidas processadas:', processedCategoryNames);

    // Processar e validar gêneros
    let processedWorkGenres: string[] = [];
    if (Array.isArray(workGenresArr)) {
      processedWorkGenres = workGenresArr.filter((genre: string) => {
        const isValid = VALID_PORTUGUESE_WORKGENRES.has(
          genre.toLowerCase().trim()
        );
        if (!isValid) {
          console.log(`⚠️ Gênero inválido ignorado: ${genre}`);
        }
        return isValid;
      });
    } else if (typeof workGenresArr === 'string') {
      const genreArray = workGenresArr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      processedWorkGenres = genreArray.filter((genre: string) => {
        const isValid = VALID_PORTUGUESE_WORKGENRES.has(
          genre.toLowerCase().trim()
        );
        if (!isValid) {
          console.log(`⚠️ Gênero inválido ignorado: ${genre}`);
        }
        return isValid;
      });
    }

    // Se não há gêneros válidos, adicionar "não definido"
    if (processedWorkGenres.length === 0) {
      processedWorkGenres = ['não definido'];
    }

    console.log('✅ Gêneros válidos processados:', processedWorkGenres);

    // Processar tags do IMSLP
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
        subtitle,
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
        timeSignature,
        tempoMarking,
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
    console.log('📊 Estatísticas da obra:');
    console.log(`   - Categorias: ${work.categoryNames.length}`);
    console.log(`   - Gêneros: ${work.workGenresArr.length}`);
    console.log(`   - Tags IMSLP: ${work.imslpTags.length}`);

    await revalidateUploadsCache(session.user.id);

    return NextResponse.json({
      success: true,
      work,
      message: 'Obra criada com sucesso',
      stats: {
        categoriesCount: work.categoryNames.length,
        genresCount: work.workGenresArr.length,
        tagsCount: work.imslpTags.length,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao criar obra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
