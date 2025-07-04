// app/api/imslp-scores/route.ts - API CORRIGIDA com Lógica de Cache vs Primeira Vez
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

    console.log(`\n🚀 [API-CACHE-LOGIC] === NOVA LÓGICA DE CACHE ===`);
    console.log(`🌐 URL: ${imslpUrl}`);
    console.log(`🎼 WorkID: ${workId || 'não informado'}`);
    console.log(`🎯 Tab alvo: ${targetTabType || 'todas'}`);
    console.log(`🔄 Load more: ${loadMore}`);
    console.log(`⭐ Force refresh: ${forceRefresh}`);

    let scoresData: any = null;
    let fromCache = false;
    let cacheStats = null;
    let backgroundCachingStarted = false;

    // 🆕 1️⃣ FASE DECISIVA: Verificar se temos cache e decidir estratégia
    if (workId && !forceRefresh) {
      console.log(`💾 [API] Verificando cache para workId: ${workId}`);

      const cacheResult =
        await ScoresCacheServiceIncremental.getWorkScoresIncremental(workId, {
          priorityScore: priorityScoreId,
          specificTypes: targetTabType ? [targetTabType] : specificTypes,
        });

      // 🆕 LÓGICA PRINCIPAL: Se temos partituras no cache, SEMPRE usar todas elas
      if (cacheResult.scores && cacheResult.totalCached > 0) {
        console.log(
          `✅ [API] Cache HIT! ${cacheResult.totalCached} partituras em cache`
        );
        console.log(
          `📊 [API] Estratégia: MOSTRAR TODAS AS PARTITURAS DO CACHE`
        );

        scoresData = cacheResult.scores;
        fromCache = true;
        cacheStats = cacheResult.cacheStats;

        // 🆕 Para loadMore quando já temos cache, só fazer scraping se realmente há mais
        if (loadMore && cacheResult.totalAvailable > cacheResult.totalCached) {
          console.log(
            `🔄 [API] LoadMore: fazendo scraping das restantes para tab: ${
              targetTabType || 'geral'
            }`
          );

          // Fazer scraping adicional apenas das que faltam
          const additionalScores = await scrapeAdditionalScoresForTab(
            imslpUrl,
            workId,
            cacheResult,
            targetTabType,
            priorityScoreId
          );

          if (additionalScores) {
            scoresData = combineScoresData(scoresData, additionalScores);
            fromCache = false; // Mudou porque fez scraping adicional
          }
        }

        // Iniciar cache em background se ainda há partituras não carregadas
        if (!loadMore && cacheResult.totalAvailable > cacheResult.totalCached) {
          console.log(`🔄 [API] Iniciando cache em background das restantes`);
          backgroundCachingStarted = true;
          startBackgroundCaching(imslpUrl, workId, priorityScoreId).catch(
            console.error
          );
        }
      } else {
        console.log(
          `❌ [API] Cache MISS - primeira vez, limitando a ${limit} por tipo`
        );
      }
    }

    // 🆕 2️⃣ SCRAPING: Apenas se não temos cache OU é loadMore sem cache suficiente
    if (!scoresData) {
      console.log(
        `🕷️ [API] Fazendo scraping - estratégia: PRIMEIRA VEZ (${limit} por tipo)`
      );

      const paginationOptions: PaginationOptions = {
        limit,
        offset,
        loadInBackground: !loadMore,
        specificTypes: targetTabType ? [targetTabType] : specificTypes,
      };

      scoresData =
        await IMSLPScraperIncremental.fetchAndExtractScoresIncremental(
          imslpUrl,
          paginationOptions
        );

      fromCache = false;

      console.log(`✅ [API] Scraping concluído:`, {
        loadedScores: Object.values(scoresData.loadedCounts).reduce(
          (sum: number, count: number) => sum + count,
          0
        ),
        totalScores: Object.values(scoresData.totalCounts).reduce(
          (sum: number, count: number) => sum + count,
          0
        ),
        hasMore: scoresData.hasMore,
        strategy: 'primeira-vez',
      });

      // 3️⃣ Salvar no cache
      if (workId) {
        console.log(`💾 [API] Salvando partituras no cache...`);

        ScoresCacheServiceIncremental.cacheScoresFromIMSLPIncremental(
          workId,
          scoresData,
          priorityScoreId,
          { immediate: true }
        )
          .then(() => {
            console.log(`✅ [API] Cache salvo para workId: ${workId}`);
          })
          .catch(console.error);

        // Cache em background para carregar o resto
        if (!loadMore && offset === 0) {
          console.log(`🔄 [API] Iniciando cache em background...`);
          backgroundCachingStarted = true;
          startBackgroundCaching(imslpUrl, workId, priorityScoreId).catch(
            console.error
          );
        }
      }
    }

    const processingTime = Date.now() - startTime;

    console.log(`\n✅ [API] === OPERAÇÃO CONCLUÍDA ===`);
    console.log(`⏱️ Tempo: ${processingTime}ms`);
    console.log(
      `📊 Fonte: ${fromCache ? 'CACHE (TODAS)' : 'SCRAPING (LIMITADO)'}`
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
        source: fromCache ? 'cache-all' : 'scraping-limited',
        strategy: fromCache ? 'show-all-cached' : 'first-time-limited',
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
        version: '5.0-CACHE-LOGIC',
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`\n❌ [API] === ERRO APÓS ${processingTime}ms ===`);
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
   * 🆕 Scraping adicional para loadMore específico de tab
   */
  async function scrapeAdditionalScoresForTab(
    imslpUrl: string,
    workId: string,
    cacheResult: any,
    targetTabType?: string,
    priorityScoreId?: string
  ) {
    try {
      console.log(
        `🔄 [API] Fazendo scraping adicional para tab: ${
          targetTabType || 'geral'
        }`
      );

      // Calcular quantas partituras já temos em cache
      let currentCached: number;
      let totalAvailable: number;

      if (targetTabType) {
        currentCached = cacheResult.scores?.loadedCounts[targetTabType] || 0;
        totalAvailable = cacheResult.scores?.totalCounts[targetTabType] || 0;
      } else {
        currentCached = cacheResult.totalCached;
        totalAvailable = cacheResult.totalAvailable;
      }

      const toFetch = totalAvailable - currentCached;
      if (toFetch <= 0) {
        console.log(
          `⚠️ [API] Nada para buscar na tab: ${targetTabType || 'geral'}`
        );
        return null;
      }

      console.log(
        `📈 [API] Buscando ${toFetch} partituras restantes (offset: ${currentCached})`
      );

      const additionalData =
        await IMSLPScraperIncremental.fetchAndExtractScoresIncremental(
          imslpUrl,
          {
            limit: toFetch,
            offset: currentCached,
            loadInBackground: false,
            specificTypes: targetTabType ? [targetTabType] : undefined,
          }
        );

      // Salvar no cache
      if (additionalData) {
        await ScoresCacheServiceIncremental.cacheScoresFromIMSLPIncremental(
          workId,
          additionalData,
          priorityScoreId,
          { immediate: true }
        );
      }

      return additionalData;
    } catch (error) {
      console.error(`❌ [API] Erro no scraping adicional:`, error);
      return null;
    }
  }

  /**
   * 🚀 Cache em background
   */
  async function startBackgroundCaching(
    imslpUrl: string,
    workId: string,
    priorityScoreId?: string
  ): Promise<void> {
    console.log(`🔄 [BACKGROUND] Iniciando cache completo para ${workId}`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const completeData =
        await IMSLPScraperIncremental.extractAllScoresForCache(
          await fetch(imslpUrl).then((res) => res.text())
        );

      await ScoresCacheServiceIncremental.cacheScoresFromIMSLPIncremental(
        workId,
        completeData,
        priorityScoreId,
        { immediate: false, background: true }
      );

      console.log(`✅ [BACKGROUND] Cache completo salvo para ${workId}`);
    } catch (error) {
      console.error(`❌ [BACKGROUND] Erro no cache completo:`, error);
    }
  }

  /**
   * 🆕 Combinar dados do cache com novos dados
   */
  function combineScoresData(cacheData: any, newData: any) {
    const combined = { ...cacheData };

    Object.keys(newData.scoresByType).forEach((type) => {
      const existingGroups = combined.scoresByType[type] || [];
      const newGroups = newData.scoresByType[type] || [];
      combined.scoresByType[type] = [...existingGroups, ...newGroups];
    });

    Object.keys(newData.loadedCounts).forEach((type) => {
      combined.loadedCounts[type] =
        (combined.loadedCounts[type] || 0) + (newData.loadedCounts[type] || 0);
    });

    const totalLoaded = Object.values(combined.loadedCounts).reduce(
      (sum: number, count: number) => sum + count,
      0
    );
    const totalAvailable = Object.values(combined.totalCounts).reduce(
      (sum: number, count: number) => sum + count,
      0
    );

    combined.hasMore = totalLoaded < totalAvailable;

    console.log(
      `🔄 [API] Dados combinados: ${totalLoaded}/${totalAvailable} partituras`
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
