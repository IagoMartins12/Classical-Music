// app/api/admin/works/route.ts - VERSÃO COMPLETAMENTE CORRIGIDA
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { TimePeriod } from '@/app/components/Admin/Common/PeriodSelector';
import { getPeriodDate } from '@/app/utils/adminUtils';

interface WorkFilters {
  search?: string;
  composerId?: string;
  epochId?: string;
  instrumentId?: string;
  workType?: string;
  difficultyLevel?: string;
  minFavorites?: number;
  minWantToLearn?: number;
  minLearned?: number;
  minScores?: number;
  maxScores?: number;
  hasScores?: boolean;
  sortBy?:
    | 'title'
    | 'createdAt'
    | 'favoritesCount'
    | 'annotationsCount'
    | 'wantToLearnCount'
    | 'learnedCount'
    | 'scoresCount';
  sortOrder?: 'asc' | 'desc';
  period?: TimePeriod;
  page?: number;
  limit?: number;
}

interface WorkStats {
  total: number;
  byEpoch: Array<{
    name: string;
    value: number;
  }>;
  byInstrument: Array<{
    name: string;
    value: number;
  }>;
  byDifficulty: Array<{
    difficulty: string;
    count: number;
  }>;
  avgScoresPerWork: number;
  avgFavoritesPerWork: number;
  mostPopular: Array<{
    id: string;
    title: string;
    composer: string;
    favoritesCount: number;
    annotationsCount: number;
  }>;
  mostWantedToLearn: Array<{
    id: string;
    title: string;
    composer: string;
    wantToLearnCount: number;
  }>;
  mostLearned: Array<{
    id: string;
    title: string;
    composer: string;
    learnedCount: number;
  }>;
  recentlyAdded: number;
  withoutScores: number;
  topByScores: Array<{
    id: string;
    title: string;
    composer: string;
    scoresCount: number;
  }>;
}

const getCachedWorkStats = async (
  period: TimePeriod = '7d'
): Promise<WorkStats> => {
  const periodDate = getPeriodDate(period);
  const whereClause = periodDate ? { createdAt: { gte: periodDate } } : {};
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    // 🚀 QUERIES OTIMIZADAS COM BATCHING
    const [
      total,
      byEpochRaw,
      byInstrumentRaw,
      byDifficultyRaw,
      totalScores,
      totalFavorites,
      mostPopularRaw,
      mostWantedToLearnRaw,
      mostLearnedRaw,
      recentlyAdded,
      withoutScores,
      topByScoresRaw,
    ] = await Promise.all([
      // Total de obras no período
      prisma.work.count({ where: whereClause }),

      // 🔥 CORRIGIDO: Por época com sintaxe correta
      prisma.work.groupBy({
        by: ['epochId'],
        _count: {
          id: true,
        },
        where: whereClause,
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 10,
      }),

      // 🔥 CORRIGIDO: Por instrumento com sintaxe correta
      prisma.work.groupBy({
        by: ['instrumentId'],
        _count: {
          id: true,
        },
        where: whereClause,
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 10,
      }),

      // 🔥 CORRIGIDO: Por dificuldade (garantindo não-nulos)
      prisma.work.groupBy({
        by: ['difficultyLevel'],
        _count: {
          id: true,
        },
        where: {
          ...whereClause,
          difficultyLevel: { not: null },
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      }),

      // 🔥 OTIMIZADO: Total de partituras ativas (usando agregação simples)
      prisma.workScore.count({
        where: {
          isActive: true,
          ...(periodDate
            ? {
                work: { createdAt: { gte: periodDate } },
              }
            : {}),
        },
      }),

      // 🔥 OTIMIZADO: Total de favoritos
      prisma.favoriteWork.count({
        where: periodDate
          ? {
              work: { createdAt: { gte: periodDate } },
            }
          : {},
      }),

      // 🔥 OTIMIZADO: Mais populares por favoritos (usando select otimizado)
      prisma.work.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          composer: { select: { name: true } },
          _count: {
            select: {
              favoriteBy: true,
              workAnnotations: { where: { isPublic: true } },
            },
          },
        },
        orderBy: {
          favoriteBy: { _count: 'desc' },
        },
        take: 10,
      }),

      // 🔥 OTIMIZADO: Mais queridas para aprender
      prisma.work.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          composer: { select: { name: true } },
          _count: {
            select: {
              wantToLearners: true,
            },
          },
        },
        orderBy: {
          wantToLearners: { _count: 'desc' },
        },
        take: 10,
      }),

      // 🔥 OTIMIZADO: Mais aprendidas
      prisma.work.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          composer: { select: { name: true } },
          _count: {
            select: {
              learners: true,
            },
          },
        },
        orderBy: {
          learners: { _count: 'desc' },
        },
        take: 10,
      }),

      // Adicionadas na última semana (sempre)
      prisma.work.count({
        where: { createdAt: { gte: lastWeek } },
      }),

      // 🔥 OTIMIZADO: Obras sem partituras ativas (usando NOT EXISTS)
      prisma.work.count({
        where: {
          ...whereClause,
          cachedScores: { none: { isActive: true } },
        },
      }),

      // 🔥 OTIMIZADO: Top por número de partituras
      prisma.work.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          composer: { select: { name: true } },
          _count: {
            select: {
              cachedScores: { where: { isActive: true } },
            },
          },
        },
        orderBy: {
          cachedScores: { _count: 'desc' },
        },
        take: 10,
      }),
    ]);

    // 🔥 BUSCAR NOMES EM BATCH OTIMIZADO
    const epochIds = [...new Set(byEpochRaw.map((e) => e.epochId))];
    const instrumentIds = [
      ...new Set(byInstrumentRaw.map((i) => i.instrumentId)),
    ];

    const [epochs, instruments] = await Promise.all([
      prisma.epoch.findMany({
        where: { id: { in: epochIds } },
        select: { id: true, name: true },
      }),
      prisma.instrument.findMany({
        where: { id: { in: instrumentIds } },
        select: { id: true, name: true },
      }),
    ]);

    const epochMap = new Map(epochs.map((e) => [e.id, e.name]));
    const instrumentMap = new Map(instruments.map((i) => [i.id, i.name]));

    return {
      total,
      // ✅ CORREÇÃO: Formato correto para gráficos (name/value)
      byEpoch: byEpochRaw.map((item) => ({
        name: epochMap.get(item.epochId) || 'Desconhecido',
        value: item._count.id,
      })),
      byInstrument: byInstrumentRaw.map((item) => ({
        name: instrumentMap.get(item.instrumentId) || 'Desconhecido',
        value: item._count.id,
      })),
      byDifficulty: byDifficultyRaw.map((item) => ({
        difficulty: item.difficultyLevel || 'Não definido',
        count: item._count.id,
      })),
      avgScoresPerWork: total > 0 ? totalScores / total : 0,
      avgFavoritesPerWork: total > 0 ? totalFavorites / total : 0,
      mostPopular: mostPopularRaw.map((work) => ({
        id: work.id,
        title: work.title,
        composer: work.composer.name,
        favoritesCount: work._count.favoriteBy,
        annotationsCount: work._count.workAnnotations,
      })),
      mostWantedToLearn: mostWantedToLearnRaw.map((work) => ({
        id: work.id,
        title: work.title,
        composer: work.composer.name,
        wantToLearnCount: work._count.wantToLearners,
      })),
      mostLearned: mostLearnedRaw.map((work) => ({
        id: work.id,
        title: work.title,
        composer: work.composer.name,
        learnedCount: work._count.learners,
      })),
      recentlyAdded,
      withoutScores,
      topByScores: topByScoresRaw.map((work) => ({
        id: work.id,
        title: work.title,
        composer: work.composer.name,
        scoresCount: work._count.cachedScores,
      })),
    };
  } catch (error) {
    console.error('Erro ao buscar stats de works:', error);
    throw error;
  }
};

const getWorksList = async (filters: WorkFilters) => {
  const {
    search,
    composerId,
    epochId,
    instrumentId,
    workType,
    difficultyLevel,
    minFavorites,
    minWantToLearn,
    minLearned,
    minScores,
    maxScores,
    hasScores,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    period = '7d',
    page = 1,
    limit = 50,
  } = filters;

  const skip = (page - 1) * limit;
  const whereClause: any = {};

  // Aplicar filtro de período
  const periodDate = getPeriodDate(period);
  if (periodDate) {
    whereClause.createdAt = { gte: periodDate };
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { opOrCatalog: { contains: search, mode: 'insensitive' } },
      { composer: { name: { contains: search, mode: 'insensitive' } } },
      { instrumentation: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (composerId && composerId !== 'all') {
    whereClause.composerId = composerId;
  }

  if (epochId && epochId !== 'all') {
    whereClause.epochId = epochId;
  }

  if (instrumentId && instrumentId !== 'all') {
    whereClause.instrumentId = instrumentId;
  }

  if (workType && workType !== 'all') {
    whereClause.workType = workType;
  }

  if (difficultyLevel && difficultyLevel !== 'all') {
    whereClause.difficultyLevel = difficultyLevel;
  }

  // ✅ CORREÇÃO: Filtros de contagem com tipagem robusta (igual ao composers)
  if (
    minFavorites !== undefined ||
    minWantToLearn !== undefined ||
    minLearned !== undefined ||
    minScores !== undefined ||
    maxScores !== undefined ||
    hasScores !== undefined
  ) {
    const filterResults: string[][] = []; // Array de arrays de IDs

    // Filtro de favoritos
    if (minFavorites !== undefined) {
      console.log('🔍 Buscando obras com mín', minFavorites, 'favoritos');

      const favoritesResult = await prisma.favoriteWork.groupBy({
        by: ['workId'],
        _count: {
          id: true,
        },
      });

      const worksWithFavorites: string[] = favoritesResult
        .filter((f: any) => f._count.id >= minFavorites)
        .map((f: any) => f.workId);

      console.log(
        '❤️ Obras com favoritos suficientes:',
        worksWithFavorites.length
      );
      filterResults.push(worksWithFavorites);
    }

    // Filtro de want to learn
    if (minWantToLearn !== undefined) {
      console.log('🔍 Buscando obras com mín', minWantToLearn, 'want to learn');

      const wantToLearnResult = await prisma.wantToLearn.groupBy({
        by: ['workId'],
        _count: {
          id: true,
        },
      });

      const worksWantedToLearn: string[] = wantToLearnResult
        .filter((w: any) => w._count.id >= minWantToLearn)
        .map((w: any) => w.workId);

      console.log(
        '📚 Obras queridas para aprender:',
        worksWantedToLearn.length
      );
      filterResults.push(worksWantedToLearn);
    }

    // Filtro de learned
    if (minLearned !== undefined) {
      console.log('🔍 Buscando obras com mín', minLearned, 'learned');

      const learnedResult = await prisma.learned.groupBy({
        by: ['workId'],
        _count: {
          id: true,
        },
      });

      const worksLearned: string[] = learnedResult
        .filter((l: any) => l._count.id >= minLearned)
        .map((l: any) => l.workId);

      console.log('🎓 Obras aprendidas:', worksLearned.length);
      filterResults.push(worksLearned);
    }

    // Filtro de scores
    if (minScores !== undefined || maxScores !== undefined) {
      console.log(
        '🔍 Buscando obras com scores entre',
        minScores,
        'e',
        maxScores
      );

      const scoresResult = await prisma.workScore.groupBy({
        by: ['workId'],
        _count: {
          id: true,
        },
        where: {
          isActive: true,
        },
      });

      const worksWithScores: string[] = scoresResult
        .filter((s: any) => {
          const count = s._count.id;
          let isValid = true;

          if (minScores !== undefined && count < minScores) {
            isValid = false;
          }
          if (maxScores !== undefined && count > maxScores) {
            isValid = false;
          }

          return isValid;
        })
        .map((s: any) => s.workId);

      console.log('🎼 Obras com scores no intervalo:', worksWithScores.length);
      filterResults.push(worksWithScores);
    }

    // Filtro de hasScores (boolean)
    if (hasScores !== undefined) {
      if (hasScores) {
        // Tem partituras
        console.log('🔍 Buscando obras COM partituras');

        const worksWithScoresResult = await prisma.workScore.findMany({
          where: { isActive: true },
          select: { workId: true },
          distinct: ['workId'],
        });

        const worksWithActiveScores: string[] = worksWithScoresResult.map(
          (s: any) => s.workId
        );

        console.log(
          '✅ Obras com partituras ativas:',
          worksWithActiveScores.length
        );
        filterResults.push(worksWithActiveScores);
      } else {
        // Não tem partituras - usar whereClause diretamente
        console.log('🔍 Buscando obras SEM partituras');
        whereClause.cachedScores = { none: { isActive: true } };
      }
    }

    // Calcular interseção de todos os filtros
    if (filterResults.length > 0) {
      let finalWorkIds: string[] = filterResults[0];

      for (let i = 1; i < filterResults.length; i++) {
        finalWorkIds = finalWorkIds.filter((id: string) =>
          filterResults[i].includes(id)
        );
        console.log(`🔗 Após interseção ${i}:`, finalWorkIds.length);
      }

      if (finalWorkIds.length === 0) {
        console.log('❌ Nenhuma obra atende aos critérios');
        return {
          works: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
            hasMore: false,
          },
        };
      } else {
        console.log(
          '✅ Aplicando filtro final com',
          finalWorkIds.length,
          'obras'
        );
        whereClause.id = { in: finalWorkIds };
      }
    }
  }

  // ✅ CORREÇÃO: Query otimizada sem uso incorreto de _count no where
  const [works, totalCount] = await Promise.all([
    prisma.work.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        opOrCatalog: true,
        compositionYear: true,
        workType: true,
        difficultyLevel: true,
        createdAt: true,
        composer: { select: { name: true } },
        epoch: { select: { name: true } },
        instrument: { select: { name: true } },
        createdByUser: {
          select: { firstName: true, lastName: true, email: true },
        },
        _count: {
          select: {
            favoriteBy: true,
            workAnnotations: { where: { isPublic: true } },
            cachedScores: { where: { isActive: true } },
            wantToLearners: true,
            learners: true,
          },
        },
      },
      orderBy: {
        [sortBy === 'favoritesCount'
          ? 'favoriteBy'
          : sortBy === 'annotationsCount'
          ? 'workAnnotations'
          : sortBy === 'scoresCount'
          ? 'cachedScores'
          : sortBy === 'wantToLearnCount'
          ? 'wantToLearners'
          : sortBy === 'learnedCount'
          ? 'learners'
          : sortBy]: [
          'favoritesCount',
          'annotationsCount',
          'scoresCount',
          'wantToLearnCount',
          'learnedCount',
        ].includes(sortBy)
          ? { _count: sortOrder }
          : sortOrder,
      },
      skip,
      take: limit,
    }),
    prisma.work.count({ where: whereClause }),
  ]);

  return {
    works: works.map((work) => ({
      id: work.id,
      title: work.title,
      composer: work.composer.name,
      epoch: work.epoch.name,
      instrument: work.instrument.name,
      opOrCatalog: work.opOrCatalog,
      compositionYear: work.compositionYear,
      workType: work.workType,
      difficultyLevel: work.difficultyLevel,
      favoritesCount: work._count.favoriteBy,
      annotationsCount: work._count.workAnnotations,
      scoresCount: work._count.cachedScores,
      wantToLearnCount: work._count.wantToLearners,
      learnedCount: work._count.learners,
      createdAt: work.createdAt,
      uploader: work.createdByUser
        ? `${work.createdByUser.firstName || ''} ${
            work.createdByUser.lastName || ''
          }`.trim() || work.createdByUser.email
        : null,
    })),
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
      hasMore: skip + works.length < totalCount,
    },
  };
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';

    if (action === 'stats') {
      const period = (searchParams.get('period') as TimePeriod) || '7d';
      const stats = await getCachedWorkStats(period);
      return NextResponse.json({
        success: true,
        stats,
        period,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'list') {
      const filters: WorkFilters = {
        search: searchParams.get('search') || undefined,
        composerId: searchParams.get('composerId') || undefined,
        epochId: searchParams.get('epochId') || undefined,
        instrumentId: searchParams.get('instrumentId') || undefined,
        workType: searchParams.get('workType') || undefined,
        difficultyLevel: searchParams.get('difficultyLevel') || undefined,
        minFavorites: searchParams.get('minFavorites')
          ? parseInt(searchParams.get('minFavorites')!)
          : undefined,
        minWantToLearn: searchParams.get('minWantToLearn')
          ? parseInt(searchParams.get('minWantToLearn')!)
          : undefined,
        minLearned: searchParams.get('minLearned')
          ? parseInt(searchParams.get('minLearned')!)
          : undefined,
        minScores: searchParams.get('minScores')
          ? parseInt(searchParams.get('minScores')!)
          : undefined,
        maxScores: searchParams.get('maxScores')
          ? parseInt(searchParams.get('maxScores')!)
          : undefined,
        hasScores:
          searchParams.get('hasScores') === 'true'
            ? true
            : searchParams.get('hasScores') === 'false'
            ? false
            : undefined,
        sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
        sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
        period: (searchParams.get('period') as TimePeriod) || '7d',
        page: parseInt(searchParams.get('page') || '1'),
        limit: Math.min(parseInt(searchParams.get('limit') || '50'), 100),
      };

      const result = await getWorksList(filters);

      return NextResponse.json({
        success: true,
        ...result,
        filters,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API de obras:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Endpoints UPDATE e DELETE para Works
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('id');

    if (!workId) {
      return NextResponse.json({ error: 'Work ID required' }, { status: 400 });
    }

    const body = await request.json();
    const {
      title,
      difficultyLevel,
      workType,
      videoUrl,
      instrumentation,
      dataQuality,
      isVerified,
      verificationNotes,
    } = body;

    const updateData: any = {};

    if (title) updateData.title = title;
    if (difficultyLevel) updateData.difficultyLevel = difficultyLevel;
    if (workType) updateData.workType = workType;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (instrumentation) updateData.instrumentation = instrumentation;
    if (dataQuality) updateData.dataQuality = dataQuality;

    if (isVerified !== undefined) {
      updateData.isVerified = isVerified;
      if (isVerified) {
        updateData.verifiedBy = session.user.id;
        updateData.verifiedAt = new Date();
        updateData.verificationNotes = verificationNotes;
      }
    }

    // Adicionar campos de auditoria
    updateData.lastEditedBy = session.user.id;
    updateData.lastEditedAt = new Date();

    const updatedWork = await prisma.work.update({
      where: { id: workId },
      data: updateData,
      include: {
        composer: { select: { name: true } },
        epoch: { select: { name: true } },
        instrument: { select: { name: true } },
      },
    });

    // Log da ação
    await prisma.uploadHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'work',
        entityId: workId,
        action: 'update',
        changes: updateData,
        reason: 'Admin update',
      },
    });

    return NextResponse.json({
      success: true,
      work: updatedWork,
      message: 'Obra atualizada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar obra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('id');

    if (!workId) {
      return NextResponse.json({ error: 'Work ID required' }, { status: 400 });
    }

    // Verificar se há dados relacionados importantes
    const [favoritesCount, wantToLearnCount, learnedCount, annotationsCount] =
      await Promise.all([
        prisma.favoriteWork.count({ where: { workId } }),
        prisma.wantToLearn.count({ where: { workId } }),
        prisma.learned.count({ where: { workId } }),
        prisma.workAnnotation.count({ where: { workId, isPublic: true } }),
      ]);

    const totalRelated =
      favoritesCount + wantToLearnCount + learnedCount + annotationsCount;

    if (totalRelated > 0) {
      return NextResponse.json(
        {
          error: `Não é possível deletar obra com dados relacionados: ${favoritesCount} favoritos, ${wantToLearnCount} querem aprender, ${learnedCount} aprenderam, ${annotationsCount} anotações públicas`,
        },
        { status: 400 }
      );
    }

    // Buscar nome da obra para o log
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: { title: true, composer: { select: { name: true } } },
    });

    // Deletar a obra (CASCADE vai cuidar das relações)
    await prisma.work.delete({
      where: { id: workId },
    });

    // Log da ação
    await prisma.uploadHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'work',
        entityId: workId,
        action: 'delete',
        reason: 'Admin deletion',
        changes: {
          deletedWork: work
            ? `${work.composer.name} - ${work.title}`
            : `Work ID: ${workId}`,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Obra deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar obra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
