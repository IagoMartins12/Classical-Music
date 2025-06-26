// app/api/imslp-scores/route.ts - API Ultra-Otimizada com Carregamento Incremental
import { NextRequest, NextResponse } from 'next/server';
import { IMSLPScraper } from '@/app/libs/imslp-score-scraper';
import { ScoresCacheServiceOptimized } from '@/app/libs/scores-cache-service-optimized';
import { IMSLPAdvancedLogger } from '@/app/libs/imslp-advanced-logger';
import { IMSLPDirectUrlResolverOptimized } from '@/app/libs/imslp-url-resolver';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();

    const {
      imslpUrl,
      workId,
      priorityScoreId,
      forceRefresh = false,
      limit = 5, // 🆕 Limite padrão otimizado
      offset = 0, // 🆕 Offset para paginação
      loadAll = false, // 🆕 Carregar todas as partituras
      saveSelectedScore = false, // 🆕 Se deve salvar partitura selecionada imediatamente
      selectedScoreData = null, // 🆕 Dados da partitura selecionada
    } = body;

    if (!imslpUrl) {
      return NextResponse.json(
        { error: 'URL do IMSLP é obrigatória' },
        { status: 400 }
      );
    }

    console.log(
      `\n🚀 [API-OPT] === BUSCA OTIMIZADA COM CARREGAMENTO INCREMENTAL ===`
    );
    console.log(`🌐 URL: ${imslpUrl}`);
    console.log(`🎼 WorkID: ${workId || 'não informado'}`);
    console.log(`⭐ Partitura prioritária: ${priorityScoreId || 'nenhuma'}`);
    console.log(`🔄 Force refresh: ${forceRefresh}`);
    console.log(`📄 Limit: ${limit}, Offset: ${offset}, LoadAll: ${loadAll}`);
    console.log(`💾 Save selected: ${saveSelectedScore}`);
    console.log(`🕐 Timestamp: ${new Date().toISOString()}\n`);

    let scoresData: any = null;
    let fromCache = false;
    let cacheStats = null;
    let hasMore = false;
    let totalAvailable = 0;

    // 🆕 FASE 0: Salvar partitura selecionada imediatamente se solicitado
    if (saveSelectedScore && selectedScoreData && workId) {
      console.log(
        `⚡ [API-OPT] Salvando partitura selecionada imediatamente...`
      );

      const savedSuccess =
        await ScoresCacheServiceOptimized.saveSelectedScoreImmediately(
          workId,
          selectedScoreData
        );

      if (savedSuccess) {
        console.log(`✅ [API-OPT] Partitura selecionada salva com sucesso`);
      }
    }

    // 1️⃣ PRIMEIRA FASE: Verificar cache com carregamento incremental
    if (workId && !forceRefresh) {
      console.log(
        `💾 [API-OPT] Verificando cache incremental para workId: ${workId}`
      );

      const cacheResult = await ScoresCacheServiceOptimized.getWorkScores(
        workId,
        {
          priorityScore: priorityScoreId,
          limit,
          offset,
          loadAll,
        }
      );

      if (cacheResult.scores) {
        console.log(`✅ [API-OPT] Cache HIT! Retornando partituras do cache`);
        console.log(`📊 Cache stats:`, {
          cached: cacheResult.cacheStats.totalCached,
          returned: Object.values(cacheResult.scores.totalCounts).reduce(
            (a, b) => a + b,
            0
          ),
          hasMore: cacheResult.hasMore,
          totalAvailable: cacheResult.totalAvailable,
        });

        scoresData = cacheResult.scores;
        fromCache = true;
        cacheStats = cacheResult.cacheStats;
        hasMore = cacheResult.hasMore;
        totalAvailable = cacheResult.totalAvailable;
      } else {
        console.log(`❌ [API-OPT] Cache MISS - será necessário fazer scraping`);
      }
    }

    // 2️⃣ SEGUNDA FASE: Scraping IMSLP (se não temos cache)
    if (!scoresData) {
      console.log(`🕷️ [API-OPT] Iniciando scraping IMSLP otimizado...`);

      // Usar o scraper ultra-otimizado
      scoresData = await IMSLPScraper.fetchAndExtractScores(imslpUrl);
      fromCache = false;

      const totalScrapedScores = Object.values(
        scoresData.totalCounts as Record<string, number>
      ).reduce((sum: number, count: number) => sum + count, 0);

      console.log(`✅ [API-OPT] Scraping concluído:`, {
        totalScores: totalScrapedScores,
        scoresByType: scoresData.totalCounts,
      });

      // 3️⃣ TERCEIRA FASE: Salvar no cache otimizado (se workId foi fornecido)
      if (workId) {
        console.log(`💾 [API-OPT] Iniciando cache otimizado em background...`);

        // Salvar de forma otimizada em background (não bloqueia a resposta)
        ScoresCacheServiceOptimized.cacheScoresFromIMSLP(
          workId,
          scoresData,
          priorityScoreId
        )
          .then(() => {
            console.log(
              `✅ [API-OPT] Cache otimizado salvo com sucesso para workId: ${workId}`
            );
          })
          .catch((error) => {
            console.error(
              `❌ [API-OPT] Erro ao salvar cache otimizado:`,
              error
            );
          });

        // Para scraping, simular dados de paginação
        totalAvailable = totalScrapedScores;
        hasMore = !loadAll && totalScrapedScores > limit;

        // Se não está carregando tudo, limitar a resposta
        if (!loadAll && limit < totalScrapedScores) {
          scoresData = limitScoresData(scoresData, limit);
        }
      }
    }

    const processingTime = Date.now() - startTime;

    console.log(`\n✅ [API-OPT] === BUSCA OTIMIZADA CONCLUÍDA ===`);
    console.log(`⏱️ Tempo total: ${processingTime}ms`);
    console.log(`📊 Fonte: ${fromCache ? 'CACHE' : 'SCRAPING'}`);
    console.log(`📈 Partituras retornadas:`, scoresData.totalCounts);
    console.log(`🔄 Tem mais: ${hasMore}, Total disponível: ${totalAvailable}`);

    // 📊 Estatísticas avançadas (só para scraping)
    if (!fromCache) {
      const cacheStatsAdv = IMSLPDirectUrlResolverOptimized.getCacheStats();
      const urlLogStats = IMSLPDirectUrlResolverOptimized.getUrlLogStats();
      const predictionModel =
        IMSLPDirectUrlResolverOptimized.getPredictionModel();

      console.log(
        `💾 Cache interno: ${
          cacheStatsAdv.totalEntries
        } entradas, conf. média: ${(cacheStatsAdv.avgConfidence * 100).toFixed(
          1
        )}%`
      );
      console.log(
        `📝 Logs: ${
          urlLogStats.totalEntries
        } entradas, ${urlLogStats.cacheHitRate.toFixed(1)}% cache hit`
      );
      console.log(
        `🧠 Padrões IA: ${predictionModel.patterns.size} padrões aprendidos`
      );
    }

    console.log(`${'='.repeat(60)}\n`);

    // 💾 Auto-save inteligente (só para scraping)
    if (!fromCache) {
      const urlLogStats = IMSLPDirectUrlResolverOptimized.getUrlLogStats();

      if (urlLogStats.totalEntries > 0 && urlLogStats.totalEntries % 25 === 0) {
        try {
          await IMSLPDirectUrlResolverOptimized.saveLogsToFile();
          console.log(
            `💾 [API-OPT] Auto-save executado aos ${urlLogStats.totalEntries} logs`
          );
        } catch (error) {
          console.error('❌ [API-OPT] Erro no auto-save:', error);
        }
      }
    }

    // Preparar resposta otimizada com metadados
    const responseData = {
      ...scoresData,
      fromCache,
      cacheStats,
      // 🆕 Novos campos para paginação
      hasMore,
      totalAvailable,
      currentLimit: limit,
      currentOffset: offset,
      loadedAll: loadAll,
      _metadata: {
        processingTime,
        source: fromCache ? 'cache' : 'scraping',
        workId,
        priorityScoreId,
        performance: !fromCache
          ? {
              cache: {
                entries:
                  IMSLPDirectUrlResolverOptimized.getCacheStats().totalEntries,
                avgConfidence:
                  IMSLPDirectUrlResolverOptimized.getCacheStats().avgConfidence,
                avgResponseTime:
                  IMSLPDirectUrlResolverOptimized.getCacheStats()
                    .avgResponseTime,
              },
              logs: {
                totalEntries:
                  IMSLPDirectUrlResolverOptimized.getUrlLogStats().totalEntries,
                cacheHitRate:
                  IMSLPDirectUrlResolverOptimized.getUrlLogStats().cacheHitRate,
                successRate:
                  IMSLPDirectUrlResolverOptimized.getUrlLogStats().successRate,
                avgProcessingTime:
                  IMSLPDirectUrlResolverOptimized.getUrlLogStats().averageTime,
              },
              ai: {
                learnedPatterns:
                  IMSLPDirectUrlResolverOptimized.getPredictionModel().patterns
                    .size,
                globalSuccessRate:
                  (IMSLPDirectUrlResolverOptimized.getPredictionModel()
                    .globalStats.successfulRequests /
                    Math.max(
                      IMSLPDirectUrlResolverOptimized.getPredictionModel()
                        .globalStats.totalRequests,
                      1
                    )) *
                  100,
                mostReliableSubdomain:
                  IMSLPDirectUrlResolverOptimized.getPredictionModel()
                    .globalStats.mostReliableSubdomain,
              },
            }
          : undefined,
        version: '4.0-INCREMENTAL',
        optimized: true,
        cached: fromCache,
        incremental: true,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    const processingTime = Date.now() - startTime;

    console.error(`\n❌ [API-OPT] === ERRO APÓS ${processingTime}ms ===`);
    console.error(`🔥 Erro:`, error);

    if (error instanceof Error) {
      console.error('- Mensagem:', error.message);
      console.error('- Stack:', error.stack);
    }
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
}

/**
 * 🆕 Função utilitária para limitar dados de partituras
 */
function limitScoresData(scoresData: any, limit: number): any {
  const limitedData = { ...scoresData };
  let totalReturned = 0;

  // Priorizar tipos de partituras
  const typeOrder = [
    'scores',
    'parts',
    'arrangements',
    'librettos',
    'others',
    'sources',
  ];

  for (const type of typeOrder) {
    if (totalReturned >= limit) {
      limitedData.scoresByType[type] = [];
      limitedData.totalCounts[type] = 0;
      continue;
    }

    const groups = scoresData.scoresByType[type];
    if (!groups || groups.length === 0) continue;

    const limitedGroups = [];
    let typeCount = 0;

    for (const group of groups) {
      if (totalReturned >= limit) break;

      const remainingSlots = limit - totalReturned;
      const limitedScores = group.scores.slice(0, remainingSlots);

      if (limitedScores.length > 0) {
        limitedGroups.push({
          ...group,
          scores: limitedScores,
        });

        typeCount += limitedScores.length;
        totalReturned += limitedScores.length;
      }
    }

    limitedData.scoresByType[type] = limitedGroups;
    limitedData.totalCounts[type] = typeCount;
  }

  return limitedData;
}

// 🆕 Endpoint para carregamento incremental de mais partituras
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'load-more';
    const workId = searchParams.get('workId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    switch (type) {
      case 'load-more':
        if (!workId) {
          return NextResponse.json(
            { error: 'workId é obrigatório' },
            { status: 400 }
          );
        }

        console.log(
          `📄 [API-OPT] Carregando mais partituras para workId: ${workId} (limit: ${limit}, offset: ${offset})`
        );

        const moreScores = await ScoresCacheServiceOptimized.getWorkScores(
          workId,
          {
            limit,
            offset,
            loadAll: false,
          }
        );

        return NextResponse.json({
          success: true,
          ...moreScores,
          timestamp: new Date().toISOString(),
        });

      case 'load-all':
        if (!workId) {
          return NextResponse.json(
            { error: 'workId é obrigatório' },
            { status: 400 }
          );
        }

        console.log(
          `📚 [API-OPT] Carregando todas as partituras para workId: ${workId}`
        );

        const allScores = await ScoresCacheServiceOptimized.getWorkScores(
          workId,
          {
            loadAll: true,
          }
        );

        return NextResponse.json({
          success: true,
          ...allScores,
          timestamp: new Date().toISOString(),
        });

      case 'cache-check':
        if (!workId) {
          return NextResponse.json(
            { error: 'workId é obrigatório' },
            { status: 400 }
          );
        }

        const cacheResult = await ScoresCacheServiceOptimized.getWorkScores(
          workId
        );
        return NextResponse.json({
          cached: !!cacheResult.scores,
          fromCache: cacheResult.fromCache,
          stats: cacheResult.cacheStats,
          hasMore: cacheResult.hasMore,
          totalAvailable: cacheResult.totalAvailable,
          timestamp: new Date().toISOString(),
        });

      case 'cache-stats':
        const stats = await ScoresCacheServiceOptimized.getCacheStatistics();
        return NextResponse.json({
          ...stats,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            error:
              'Tipo não reconhecido. Use: load-more, load-all, cache-check, cache-stats',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [API-OPT] Erro ao processar GET:', error);

    return NextResponse.json(
      {
        error: 'Erro ao processar requisição',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// 🆕 Endpoint para salvar partitura selecionada
export async function PUT(request: NextRequest) {
  try {
    const { workId, scoreData } = await request.json();

    if (!workId || !scoreData) {
      return NextResponse.json(
        { error: 'workId e scoreData são obrigatórios' },
        { status: 400 }
      );
    }

    console.log(
      `💾 [API-OPT] Salvando partitura selecionada para workId: ${workId}`
    );

    const success =
      await ScoresCacheServiceOptimized.saveSelectedScoreImmediately(
        workId,
        scoreData
      );

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Partitura selecionada salva com sucesso',
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { error: 'Erro ao salvar partitura selecionada' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ [API-OPT] Erro ao salvar partitura selecionada:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Endpoint DELETE aprimorado
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const workId = searchParams.get('workId');

    switch (action) {
      case 'clear-cache':
        IMSLPDirectUrlResolverOptimized.clearCache();
        return NextResponse.json({
          success: true,
          message: 'Cache interno limpo com sucesso',
        });

      case 'clear-db-cache':
        if (workId) {
          await ScoresCacheServiceOptimized.cleanExpiredCache(0);
          return NextResponse.json({
            success: true,
            message: `Cache da obra ${workId} limpo com sucesso`,
          });
        } else {
          const cleanedCount =
            await ScoresCacheServiceOptimized.cleanExpiredCache(0);
          return NextResponse.json({
            success: true,
            message: `${cleanedCount} entradas de cache limpas`,
          });
        }

      case 'clear-all':
        IMSLPDirectUrlResolverOptimized.clearCache();
        IMSLPDirectUrlResolverOptimized.clearUrlLogs();
        await ScoresCacheServiceOptimized.cleanExpiredCache(0);
        return NextResponse.json({
          success: true,
          message: 'Todos os caches e logs limpos com sucesso',
        });

      default:
        return NextResponse.json(
          {
            error:
              'Ação não reconhecida. Use: clear-cache, clear-db-cache, clear-all',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [API-OPT] Erro ao limpar dados:', error);

    return NextResponse.json(
      { error: 'Erro ao limpar dados' },
      { status: 500 }
    );
  }
}
