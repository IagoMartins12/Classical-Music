// app/api/imslp-scores/route.ts - API CORRIGIDA com Scraping Consistente
import { NextRequest, NextResponse } from 'next/server';
import {
  IMSLPScraperIncremental,
  PaginationOptions,
} from '@/app/libs/imslp-score-scraper-incremental';
import { ScoresCacheServiceIncremental } from '@/app/libs/scores-cache-service-incremental';

interface RequestBody {
  imslpUrl: string;
  workId?: string;
  priorityScoreId?: string;
  forceRefresh?: boolean;
  pagination?: {
    limit?: number;
    offset?: number;
    loadMore?: boolean;
    specificTypes?: string[];
    targetTabType?: string;
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: RequestBody = await request.json();
    const {
      imslpUrl,
      workId,
      priorityScoreId,
      forceRefresh = false,
      pagination = {},
    } = body;

    if (!imslpUrl) {
      return NextResponse.json(
        { error: 'URL do IMSLP é obrigatória' },
        { status: 400 }
      );
    }

    const {
      limit = 5,
      offset = 0,
      loadMore = false,
      specificTypes,
      targetTabType,
    } = pagination;

    let scoresData: any = null;
    let fromCache = false;
    let cacheStats = null;
    let backgroundCachingStarted = false;

    // 🆕 1️⃣ FASE DECISIVA: Verificar se temos cache e decidir estratégia
    if (workId && !forceRefresh) {
      console.log(`💾 [API-FIXED] Verificando cache para workId: ${workId}`);

      const cacheResult =
        await ScoresCacheServiceIncremental.getWorkScoresIncremental(workId, {
          priorityScore: priorityScoreId,
          specificTypes: targetTabType ? [targetTabType] : specificTypes,
        });

      // 🆕 LÓGICA PRINCIPAL: Se temos partituras no cache, SEMPRE usar todas elas
      if (cacheResult.scores && cacheResult.totalCached > 0) {
        console.log(
          `✅ [API-FIXED] Cache HIT! ${cacheResult.totalCached} partituras em cache`
        );
        console.log(
          `📊 [API-FIXED] Estratégia: MOSTRAR TODAS AS PARTITURAS DO CACHE`
        );

        scoresData = cacheResult.scores;
        fromCache = true;
        cacheStats = cacheResult.cacheStats;

        // 🆕 Para loadMore quando já temos cache, usar SEMPRE o scraper consistente
        if (loadMore && cacheResult.totalAvailable > cacheResult.totalCached) {
          console.log(
            `🔄 [API-FIXED] LoadMore: fazendo scraping CONSISTENTE das restantes para tab: ${
              targetTabType || 'geral'
            }`
          );

          // 🚀 USAR SEMPRE O MESMO MÉTODO DE SCRAPING (CONSISTENTE)
          const additionalScores = await performConsistentScraping(
            imslpUrl,
            targetTabType,
            limit
          );

          if (additionalScores) {
            scoresData = combineScoresData(scoresData, additionalScores);
            fromCache = false; // Mudou porque fez scraping adicional
          }
        }

        // Iniciar cache em background se ainda há partituras não carregadas
        if (!loadMore && cacheResult.totalAvailable > cacheResult.totalCached) {
          console.log(
            `🔄 [API-FIXED] Iniciando cache CONSISTENTE em background das restantes`
          );
          backgroundCachingStarted = true;
          startBackgroundCachingConsistent(
            imslpUrl,
            workId,
            priorityScoreId
          ).catch(console.error);
        }
      } else {
        console.log(
          `❌ [API-FIXED] Cache MISS - primeira vez, limitando a ${limit} por tipo`
        );
      }
    }

    // 🆕 2️⃣ SCRAPING: Sempre usar método CONSISTENTE
    if (!scoresData) {
      console.log(
        `🕷️ [API-FIXED] Fazendo scraping CONSISTENTE - estratégia: PRIMEIRA VEZ (${limit} por tipo)`
      );

      // 🚀 USAR SEMPRE O MESMO MÉTODO CONSISTENTE
      scoresData = await performConsistentScraping(
        imslpUrl,
        targetTabType,
        limit
      );

      fromCache = false;

      console.log(`✅ [API-FIXED] Scraping consistente concluído:`, {
        loadedScores: (
          Object.values(scoresData.loadedCounts) as number[]
        ).reduce((sum, count) => sum + count, 0),
        totalScores: (Object.values(scoresData.totalCounts) as number[]).reduce(
          (sum, count) => sum + count,
          0
        ),
        hasMore: scoresData.hasMore,
        strategy: 'primeira-vez-consistente',
      });

      // 3️⃣ Salvar no cache usando o MESMO método
      if (workId) {
        console.log(`💾 [API-FIXED] Salvando partituras no cache...`);

        ScoresCacheServiceIncremental.cacheScoresFromIMSLPIncremental(
          workId,
          scoresData,
          priorityScoreId,
          { immediate: true }
        )
          .then(() => {
            console.log(`✅ [API-FIXED] Cache salvo para workId: ${workId}`);
          })
          .catch(console.error);

        // Cache em background para carregar o resto
        if (!loadMore && offset === 0) {
          console.log(
            `🔄 [API-FIXED] Iniciando cache CONSISTENTE em background...`
          );
          backgroundCachingStarted = true;
          startBackgroundCachingConsistent(
            imslpUrl,
            workId,
            priorityScoreId
          ).catch(console.error);
        }
      }
    }

    const processingTime = Date.now() - startTime;

    console.log(`\n✅ [API-FIXED] === OPERAÇÃO CONCLUÍDA ===`);
    console.log(`⏱️ Tempo: ${processingTime}ms`);
    console.log(
      `📊 Fonte: ${fromCache ? 'CACHE (TODAS)' : 'SCRAPING CONSISTENTE'}`
    );
    console.log(`📈 Partituras: ${JSON.stringify(scoresData.loadedCounts)}`);
    console.log(`🎯 Tab alvo: ${targetTabType || 'todas'}`);
    console.log(
      `🔄 Background: ${backgroundCachingStarted ? 'INICIADO' : 'NÃO'}`
    );
    console.log(`${'='.repeat(60)}\n`);

    const responseData = {
      ...scoresData,
      fromCache,
      cacheStats,
      backgroundCachingStarted,
      _metadata: {
        processingTime,
        source: fromCache ? 'cache-all' : 'scraping-consistent',
        strategy: fromCache ? 'show-all-cached' : 'first-time-consistent',
        workId,
        priorityScoreId,
        targetTabType,
        pagination: {
          limit,
          offset,
          loadMore,
          currentPage: Math.floor(offset / limit) + 1,
          hasMore: scoresData.hasMore,
        },
        version: '6.0-CONSISTENT-SCRAPING',
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`\n❌ [API-FIXED] === ERRO APÓS ${processingTime}ms ===`);
    console.error(`🔥 Erro:`, error);
    console.error(`${'='.repeat(60)}\n`);

    return NextResponse.json(
      {
        error: 'Erro ao buscar partituras do IMSLP',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        processingTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  /**
   * 🚀 MÉTODO CONSISTENTE DE SCRAPING - Sempre usa a mesma lógica
   */
  async function performConsistentScraping(
    imslpUrl: string,
    targetTabType?: string,
    limit: number = 1000
  ) {
    console.log(
      `🔧 [API-CONSISTENT] Executando scraping consistente para tab: ${
        targetTabType || 'todas'
      }, limit: ${limit}`
    );

    try {
      // 🚀 SEMPRE usar o mesmo método principal que tem toda a lógica de títulos corrigida
      const paginationOptions: PaginationOptions = {
        limit,
        offset: 0, // Sempre começar do 0 e deixar o scraper gerenciar
        loadInBackground: false,
        specificTypes: targetTabType ? [targetTabType] : undefined,
        targetTabType, // 🆕 Passar a tab específica para o scraper
      };

      console.log(
        `🎯 [API-CONSISTENT] Opções de paginação:`,
        paginationOptions
      );

      const scrapedData =
        await IMSLPScraperIncremental.fetchAndExtractScoresIncremental(
          imslpUrl,
          paginationOptions
        );

      // 🆕 Log detalhado dos títulos para debug
      if (targetTabType === 'arrangements') {
        console.log(`🎵 [API-CONSISTENT] Títulos de arranjos extraídos:`);
        const arrangementsGroups = scrapedData.scoresByType.arrangements || [];
        arrangementsGroups.forEach((group, groupIndex) => {
          console.log(`   Grupo ${groupIndex}: ${group.groupTitle}`);
          group.scores.forEach((score, scoreIndex) => {
            console.log(
              `     ${scoreIndex + 1}. "${score.title}" (ID: ${score.id})`
            );
          });
        });
      }

      return scrapedData;
    } catch (error) {
      console.error(`❌ [API-CONSISTENT] Erro no scraping consistente:`, error);
      throw error;
    }
  }

  /**
   * 🚀 Cache em background CONSISTENTE
   */
  async function startBackgroundCachingConsistent(
    imslpUrl: string,
    workId: string,
    priorityScoreId?: string
  ): Promise<void> {
    console.log(
      `🔄 [BACKGROUND-CONSISTENT] Iniciando cache completo CONSISTENTE para ${workId}`
    );

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 🚀 USAR O MESMO MÉTODO CONSISTENTE para cache em background
      const completeData = await performConsistentScraping(
        imslpUrl,
        undefined, // Todas as tabs
        1000 // Limite alto
      );

      await ScoresCacheServiceIncremental.cacheScoresFromIMSLPIncremental(
        workId,
        completeData,
        priorityScoreId,
        { immediate: false, background: true }
      );

      console.log(
        `✅ [BACKGROUND-CONSISTENT] Cache completo CONSISTENTE salvo para ${workId}`
      );
    } catch (error) {
      console.error(
        `❌ [BACKGROUND-CONSISTENT] Erro no cache completo consistente:`,
        error
      );
    }
  }

  /**
   * 🆕 Combinar dados do cache com novos dados - MELHORADO
   */
  function combineScoresData(cacheData: any, newData: any) {
    console.log(`🔄 [COMBINE] Combinando dados cache + novos dados`);
    console.log(
      `🔄 [COMBINE] Cache possui:`,
      Object.keys(cacheData.scoresByType).reduce((acc, type) => {
        acc[type] = cacheData.scoresByType[type].length;
        return acc;
      }, {} as Record<string, number>)
    );
    console.log(
      `🔄 [COMBINE] Novos dados possuem:`,
      Object.keys(newData.scoresByType).reduce((acc, type) => {
        acc[type] = newData.scoresByType[type].length;
        return acc;
      }, {} as Record<string, number>)
    );

    const combined = { ...cacheData };

    // Combinar scoresByType de forma mais inteligente
    Object.keys(newData.scoresByType).forEach((type) => {
      const existingGroups = combined.scoresByType[type] || [];
      const newGroups = newData.scoresByType[type] || [];

      console.log(
        `🔄 [COMBINE] Tipo ${type}: ${existingGroups.length} grupos existentes + ${newGroups.length} novos grupos`
      );

      // Adicionar novos grupos evitando duplicatas
      const combinedGroups = [...existingGroups];

      for (const newGroup of newGroups) {
        const existingGroup = combinedGroups.find(
          (g) =>
            g.groupIndex === newGroup.groupIndex &&
            g.groupTitle === newGroup.groupTitle
        );

        if (!existingGroup) {
          console.log(
            `🆕 [COMBINE] Adicionando novo grupo: ${newGroup.groupTitle} (${newGroup.scores.length} partituras)`
          );
          combinedGroups.push(newGroup);
        } else {
          // Combinar scores dentro do grupo, evitando duplicatas
          const existingScoreIds = new Set(
            existingGroup.scores.map((s: any) => s.id)
          );
          const newScores = newGroup.scores.filter(
            (s: any) => !existingScoreIds.has(s.id)
          );

          if (newScores.length > 0) {
            console.log(
              `📝 [COMBINE] Adicionando ${newScores.length} partituras ao grupo existente: ${existingGroup.groupTitle}`
            );
            existingGroup.scores.push(...newScores);
          }
        }
      }

      combined.scoresByType[type] = combinedGroups;
    });

    // Atualizar contadores corretamente
    Object.keys(newData.loadedCounts).forEach((type) => {
      const typeGroups = combined.scoresByType[type] || [];
      const realCount = typeGroups.reduce(
        (sum: any, group: any) => sum + group.scores.length,
        0
      );
      combined.loadedCounts[type] = realCount;

      console.log(
        `📊 [COMBINE] Tipo ${type}: ${realCount} partituras no total após combinação`
      );
    });

    const totalLoaded = (
      Object.values(combined.loadedCounts) as number[]
    ).reduce((sum, count) => sum + count, 0);

    const totalAvailable = (
      Object.values(combined.totalCounts) as number[]
    ).reduce((sum, count) => sum + count, 0);

    combined.hasMore = totalLoaded < totalAvailable;

    console.log(
      `✅ [COMBINE] Dados combinados finais: ${totalLoaded}/${totalAvailable} partituras, hasMore: ${combined.hasMore}`
    );

    return combined;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stats';
    const workId = searchParams.get('workId');
    const limit = parseInt(searchParams.get('limit') || '5');
    const offset = parseInt(searchParams.get('offset') || '0');
    const tabType = searchParams.get('tabType');

    switch (type) {
      case 'cache-check-incremental':
        if (!workId) {
          return NextResponse.json(
            { error: 'workId é obrigatório' },
            { status: 400 }
          );
        }

        const cacheResult =
          await ScoresCacheServiceIncremental.getWorkScoresIncremental(workId, {
            limit,
            offset,
            specificTypes: tabType ? [tabType] : undefined,
          });

        return NextResponse.json({
          cached: !!cacheResult.scores,
          hasEnoughData: cacheResult.hasEnoughData,
          fromCache: cacheResult.fromCache,
          loadedCount: cacheResult.loadedCount,
          totalAvailable: cacheResult.totalAvailable,
          totalCached: cacheResult.totalCached,
          tabType,
          stats: cacheResult.cacheStats,
          timestamp: new Date().toISOString(),
        });

      case 'cache-progress':
        if (!workId) {
          return NextResponse.json(
            { error: 'workId é obrigatório' },
            { status: 400 }
          );
        }

        const progressResult =
          await ScoresCacheServiceIncremental.getCacheProgress(workId);
        return NextResponse.json({
          ...progressResult,
          timestamp: new Date().toISOString(),
        });

      case 'tab-stats':
        if (!workId) {
          return NextResponse.json(
            { error: 'workId é obrigatório' },
            { status: 400 }
          );
        }

        const tabStats = tabType
          ? await ScoresCacheServiceIncremental.getTabStatistics(
              workId,
              tabType
            )
          : await ScoresCacheServiceIncremental.getAllTabsStatistics(workId);

        return NextResponse.json({
          tabType,
          stats: tabStats,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { error: 'Tipo não suportado' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [API] Erro ao obter dados:', error);
    return NextResponse.json({ error: 'Erro ao obter dados' }, { status: 500 });
  }
}
