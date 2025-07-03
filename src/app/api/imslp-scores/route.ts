// app/api/imslp-scores/route.ts - API com Carregamento por Tab Específica
import { NextRequest, NextResponse } from 'next/server';
import {
  IMSLPScraperIncremental,
  PaginationOptions,
} from '@/app/libs/imslp-score-scraper-incremental';
import { IMSLPDirectUrlResolverOptimized } from '@/app/libs/imslp-url-resolver';
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
    targetTabType?: string; // 🆕 Tipo específico de tab para carregar
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
      targetTabType, // 🆕 Tab específica para carregamento
    } = pagination;

    console.log(`\n🚀 [API-TAB-SPECIFIC] === BUSCA INCREMENTAL POR TAB ===`);
    console.log(`🌐 URL: ${imslpUrl}`);
    console.log(`🎼 WorkID: ${workId || 'não informado'}`);
    console.log(
      `📄 Paginação: limit=${limit}, offset=${offset}, loadMore=${loadMore}`
    );
    console.log(`🎯 Tab alvo: ${targetTabType || 'todas'}`);
    console.log(`⭐ Partitura prioritária: ${priorityScoreId || 'nenhuma'}`);
    console.log(`🔄 Force refresh: ${forceRefresh}`);
    console.log(`🕐 Timestamp: ${new Date().toISOString()}\n`);

    let scoresData: any = null;
    let fromCache = false;
    let cacheStats = null;
    let backgroundCachingStarted = false;

    // 1️⃣ PRIMEIRA FASE: Verificar cache (sempre, exceto se forceRefresh)
    if (workId && !forceRefresh) {
      console.log(`💾 [API-TAB] Verificando cache para workId: ${workId}`);

      const cacheResult =
        await ScoresCacheServiceIncremental.getWorkScoresIncremental(workId, {
          priorityScore: priorityScoreId,
          specificTypes: targetTabType ? [targetTabType] : specificTypes,
        });

      // 🆕 LÓGICA CORRIGIDA: Sempre usar cache se houver partituras salvas
      if (cacheResult.scores) {
        console.log(
          `✅ [API-TAB] Cache HIT! Usando ${cacheResult.loadedCount} partituras do cache`
        );
        console.log(
          `📊 [API-TAB] Totais: ${cacheResult.loadedCount} cached / ${cacheResult.totalAvailable} disponíveis`
        );

        scoresData = cacheResult.scores;
        fromCache = true;
        cacheStats = cacheResult.cacheStats;

        // 🆕 Se é loadMore e não temos partituras suficientes no cache, fazer scraping adicional
        if (loadMore && cacheResult.totalAvailable > cacheResult.loadedCount) {
          console.log(
            `🔄 [API-TAB] LoadMore solicitado - fazendo scraping adicional para tab: ${
              targetTabType || 'geral'
            }`
          );

          // Fazer scraping só das partituras que faltam
          const additionalScores = await scrapeAdditionalScoresForTab(
            imslpUrl,
            workId,
            cacheResult,
            limit,
            targetTabType, // 🆕 Passar a tab específica
            priorityScoreId
          );

          if (additionalScores) {
            // Combinar dados do cache com novos dados
            scoresData = combineScoresData(scoresData, additionalScores);
            fromCache = false; // Mudou para false porque fez scraping adicional
          }
        }

        // 🆕 Iniciar cache em background se ainda há partituras não carregadas
        if (!loadMore && cacheResult.totalAvailable > cacheResult.loadedCount) {
          console.log(
            `🔄 [API-TAB] Iniciando cache em background das restantes`
          );
          backgroundCachingStarted = true;
          startBackgroundCaching(imslpUrl, workId, priorityScoreId).catch(
            (error) => {
              console.error(`❌ [API-TAB] Erro no cache background:`, error);
            }
          );
        }
      } else {
        console.log(`❌ [API-TAB] Cache MISS - será necessário fazer scraping`);
      }
    }

    // 2️⃣ SEGUNDA FASE: Scraping IMSLP (se não temos cache ou é força refresh)
    if (!scoresData) {
      console.log(`🕷️ [API-TAB] Iniciando scraping incremental...`);

      const paginationOptions: PaginationOptions = {
        limit,
        offset,
        loadInBackground: !loadMore, // Cache em background apenas se não é "carregar mais"
        specificTypes: targetTabType ? [targetTabType] : specificTypes, // 🆕 Usar tab específica
      };

      // Usar o scraper incremental
      scoresData =
        await IMSLPScraperIncremental.fetchAndExtractScoresIncremental(
          imslpUrl,
          paginationOptions
        );

      fromCache = false;

      console.log(`✅ [API-TAB] Scraping incremental concluído:`, {
        loadedScores: Object.values(scoresData.loadedCounts).reduce(
          (sum: number, count: number) => sum + count,
          0
        ),
        totalScores: Object.values(scoresData.totalCounts).reduce(
          (sum: number, count: number) => sum + count,
          0
        ),
        hasMore: scoresData.hasMore,
        targetTab: targetTabType || 'todas',
      });

      // 3️⃣ TERCEIRA FASE: Salvar no cache (se workId foi fornecido)
      if (workId) {
        console.log(`💾 [API-TAB] Salvando partituras no cache...`);

        // Salvar partituras carregadas imediatamente
        ScoresCacheServiceIncremental.cacheScoresFromIMSLPIncremental(
          workId,
          scoresData,
          priorityScoreId,
          { immediate: true }
        )
          .then(() => {
            console.log(
              `✅ [API-TAB] Cache imediato salvo para workId: ${workId}`
            );
          })
          .catch((error) => {
            console.error(`❌ [API-TAB] Erro ao salvar cache imediato:`, error);
          });

        // 4️⃣ QUARTA FASE: Cache em background (se é carregamento inicial)
        if (!loadMore && offset === 0) {
          console.log(`🔄 [API-TAB] Iniciando cache em background...`);
          backgroundCachingStarted = true;
          startBackgroundCaching(imslpUrl, workId, priorityScoreId).catch(
            (error) => {
              console.error(`❌ [API-TAB] Erro no cache background:`, error);
            }
          );
        }
      }
    }

    const processingTime = Date.now() - startTime;

    console.log(`\n✅ [API-TAB] === BUSCA CONCLUÍDA ===`);
    console.log(`⏱️ Tempo total: ${processingTime}ms`);
    console.log(`📊 Fonte: ${fromCache ? 'CACHE' : 'SCRAPING'}`);
    console.log(`📈 Partituras carregadas:`, scoresData.loadedCounts);
    console.log(`🎯 Tab alvo: ${targetTabType || 'todas'}`);
    console.log(
      `🔄 Cache em background: ${backgroundCachingStarted ? 'INICIADO' : 'NÃO'}`
    );
    console.log(`${'='.repeat(60)}\n`);

    // Preparar resposta com metadados incrementais
    const responseData = {
      ...scoresData,
      fromCache,
      cacheStats,
      backgroundCachingStarted,
      _metadata: {
        processingTime,
        source: fromCache ? 'cache' : 'scraping',
        workId,
        priorityScoreId,
        targetTabType, // 🆕 Incluir tab alvo na resposta
        pagination: {
          limit,
          offset,
          loadMore,
          currentPage: Math.floor(offset / limit) + 1,
          hasMore: scoresData.hasMore,
        },
        performance: !fromCache
          ? {
              cache: {
                entries:
                  IMSLPDirectUrlResolverOptimized.getCacheStats().totalEntries,
                avgConfidence:
                  IMSLPDirectUrlResolverOptimized.getCacheStats().avgConfidence,
              },
              ai: {
                learnedPatterns:
                  IMSLPDirectUrlResolverOptimized.getPredictionModel().patterns
                    .size,
              },
            }
          : undefined,
        version: '4.1-TAB-SPECIFIC',
        optimized: true,
        cached: fromCache,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    const processingTime = Date.now() - startTime;

    console.error(`\n❌ [API-TAB] === ERRO APÓS ${processingTime}ms ===`);
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
   * 🆕 Fazer scraping adicional para loadMore específico de tab
   */
  async function scrapeAdditionalScoresForTab(
    imslpUrl: string,
    workId: string,
    cacheResult: any,
    limit: number,
    targetTabType?: string,
    priorityScoreId?: string
  ) {
    try {
      console.log(
        `🔄 [API-TAB] Fazendo scraping adicional para tab: ${
          targetTabType || 'geral'
        }`
      );

      // 🆕 Calcular quantas partituras já temos para a tab específica ou geral
      let currentLoaded: number;
      let totalAvailable: number;

      if (targetTabType) {
        // Para tab específica
        currentLoaded = cacheResult.scores?.loadedCounts[targetTabType] || 0;
        totalAvailable = cacheResult.scores?.totalCounts[targetTabType] || 0;
      } else {
        // Para carregamento geral
        currentLoaded = cacheResult.loadedCount;
        totalAvailable = cacheResult.totalAvailable;
      }

      const toFetch = Math.min(limit, totalAvailable - currentLoaded);

      if (toFetch <= 0) {
        console.log(
          `⚠️ [API-TAB] Nenhuma partitura adicional para buscar na tab: ${
            targetTabType || 'geral'
          }`
        );
        return null;
      }

      console.log(
        `📈 [API-TAB] Buscando ${toFetch} partituras adicionais para tab "${
          targetTabType || 'geral'
        }" (offset: ${currentLoaded})`
      );

      // Fazer scraping com offset baseado no que já temos
      const additionalData =
        await IMSLPScraperIncremental.fetchAndExtractScoresIncremental(
          imslpUrl,
          {
            limit: toFetch,
            offset: currentLoaded,
            loadInBackground: false,
            specificTypes: targetTabType ? [targetTabType] : undefined, // 🆕 Filtrar por tab específica
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
      console.error(`❌ [API-TAB] Erro no scraping adicional:`, error);
      return null;
    }
  }

  /**
   * 🚀 Cache em background - executa de forma assíncrona
   */
  async function startBackgroundCaching(
    imslpUrl: string,
    workId: string,
    priorityScoreId?: string
  ): Promise<void> {
    console.log(`🔄 [BACKGROUND] Iniciando cache completo para ${workId}`);

    try {
      // Aguardar um pouco para não impactar a resposta principal
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Fazer scraping completo
      const completeData =
        await IMSLPScraperIncremental.extractAllScoresForCache(
          await fetch(imslpUrl).then((res) => res.text())
        );

      // Salvar no cache
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
   * 🆕 Combinar dados do cache com novos dados de scraping
   */
  function combineScoresData(cacheData: any, newData: any) {
    const combined = { ...cacheData };

    // Combinar scoresByType
    Object.keys(newData.scoresByType).forEach((type) => {
      const existingGroups = combined.scoresByType[type] || [];
      const newGroups = newData.scoresByType[type] || [];

      // Adicionar novos grupos aos existentes
      combined.scoresByType[type] = [...existingGroups, ...newGroups];
    });

    // Atualizar contadores carregados
    Object.keys(newData.loadedCounts).forEach((type) => {
      combined.loadedCounts[type] =
        (combined.loadedCounts[type] || 0) + (newData.loadedCounts[type] || 0);
    });

    // Manter totais do cache (que são os reais)
    // combined.totalCounts já está correto do cache

    // Atualizar hasMore
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
      `🔄 [API-TAB] Dados combinados: ${totalLoaded}/${totalAvailable} partituras`
    );

    return combined;
  }
}

// 🆕 Endpoint GET atualizado
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stats';
    const workId = searchParams.get('workId');
    const limit = parseInt(searchParams.get('limit') || '5');
    const offset = parseInt(searchParams.get('offset') || '0');
    const tabType = searchParams.get('tabType'); // 🆕 Suporte para verificar tab específica

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
            specificTypes: tabType ? [tabType] : undefined, // 🆕 Filtrar por tab
          });

        return NextResponse.json({
          cached: !!cacheResult.scores,
          hasEnoughData: cacheResult.hasEnoughData,
          fromCache: cacheResult.fromCache,
          loadedCount: cacheResult.loadedCount,
          totalAvailable: cacheResult.totalAvailable,
          totalCached: cacheResult.totalCached,
          tabType, // 🆕 Incluir tab na resposta
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

      case 'tab-stats': // 🆕 Endpoint para estatísticas de tab específica
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
          { error: 'Tipo não suportado na versão incremental' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [API-TAB] Erro ao obter dados:', error);
    return NextResponse.json({ error: 'Erro ao obter dados' }, { status: 500 });
  }
}
