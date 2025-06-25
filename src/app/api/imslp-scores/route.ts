// app/api/imslp-scores/route.ts - API Ultra-Otimizada com Cache Inteligente
import { NextRequest, NextResponse } from 'next/server';
import { IMSLPScraper } from '@/app/libs/imslp-score-scraper';
import { ScoresCacheService } from '@/app/libs/scores-cache-service';
import { IMSLPAdvancedLogger } from '@/app/libs/imslp-advanced-logger';
import { IMSLPDirectUrlResolverOptimized } from '@/app/libs/imslp-url-resolver';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();

    const { imslpUrl, workId, priorityScoreId, forceRefresh = false } = body;

    if (!imslpUrl) {
      return NextResponse.json(
        { error: 'URL do IMSLP é obrigatória' },
        { status: 400 }
      );
    }

    console.log(`\n🚀 [API] === BUSCA OTIMIZADA COM CACHE ===`);
    console.log(`🌐 URL: ${imslpUrl}`);
    console.log(`🎼 WorkID: ${workId || 'não informado'}`);
    console.log(`⭐ Partitura prioritária: ${priorityScoreId || 'nenhuma'}`);
    console.log(`🔄 Force refresh: ${forceRefresh}`);
    console.log(`🕐 Timestamp: ${new Date().toISOString()}\n`);

    let scoresData: any = null;
    let fromCache = false;
    let cacheStats = null;

    console.log('TESTE', { imslpUrl, workId });
    // 1️⃣ PRIMEIRA FASE: Verificar cache (se workId foi fornecido)
    if (workId && !forceRefresh) {
      console.log(`💾 [API] Verificando cache para workId: ${workId}`);

      const cacheResult = await ScoresCacheService.getWorkScores(workId, {
        priorityScore: priorityScoreId,
      });

      if (cacheResult.scores) {
        console.log(
          `✅ [API] Cache HIT! Retornando ${cacheResult.cacheStats.totalCached} partituras do cache`
        );

        scoresData = cacheResult.scores;
        fromCache = true;
        cacheStats = cacheResult.cacheStats;
      } else {
        console.log(`❌ [API] Cache MISS - será necessário fazer scraping`);
      }
    }

    // 2️⃣ SEGUNDA FASE: Scraping IMSLP (se não temos cache)
    if (!scoresData) {
      console.log(`🕷️ [API] Iniciando scraping IMSLP...`);

      // Usar o scraper ultra-otimizado
      scoresData = await IMSLPScraper.fetchAndExtractScores(imslpUrl);
      fromCache = false;

      console.log(`✅ [API] Scraping concluído:`, {
        totalScores: Object.values(scoresData.totalCounts).reduce(
          (sum: number, count: number) => sum + count,
          0
        ),
        scoresByType: scoresData.totalCounts,
      });

      // 3️⃣ TERCEIRA FASE: Salvar no cache (se workId foi fornecido)
      if (workId) {
        console.log(`💾 [API] Salvando partituras no cache...`);

        // Salvar em background (não bloqueia a resposta)
        ScoresCacheService.cacheScoresFromIMSLP(
          workId,
          scoresData,
          priorityScoreId
        )
          .then(() => {
            console.log(
              `✅ [API] Cache salvo com sucesso para workId: ${workId}`
            );
          })
          .catch((error) => {
            console.error(`❌ [API] Erro ao salvar cache:`, error);
          });
      }
    }

    const processingTime = Date.now() - startTime;

    console.log(`\n✅ [API] === BUSCA CONCLUÍDA ===`);
    console.log(`⏱️ Tempo total: ${processingTime}ms`);
    console.log(`📊 Fonte: ${fromCache ? 'CACHE' : 'SCRAPING'}`);
    console.log(`📈 Partituras encontradas:`, scoresData.totalCounts);

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
            `💾 [API] Auto-save executado aos ${urlLogStats.totalEntries} logs`
          );
        } catch (error) {
          console.error('❌ [API] Erro no auto-save:', error);
        }
      }

      // 🧠 Análise de padrões automática
      const predictionModel =
        IMSLPDirectUrlResolverOptimized.getPredictionModel();
      if (
        predictionModel.patterns.size > 0 &&
        predictionModel.patterns.size % 10 === 0
      ) {
        try {
          await IMSLPAdvancedLogger.generatePatternAnalysis();
          console.log(
            `🧠 [API] Análise de padrões atualizada (${predictionModel.patterns.size} padrões)`
          );
        } catch (error) {
          console.error('❌ [API] Erro na análise de padrões:', error);
        }
      }
    }

    // Preparar resposta com metadados
    const responseData = {
      ...scoresData,
      fromCache,
      cacheStats,
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
        version: '3.0-CACHE',
        optimized: true,
        cached: fromCache,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    const processingTime = Date.now() - startTime;

    console.error(`\n❌ [API] === ERRO APÓS ${processingTime}ms ===`);
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

// 🆕 Endpoint para verificação rápida de cache
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stats';
    const workId = searchParams.get('workId');

    switch (type) {
      case 'cache-check':
        if (!workId) {
          return NextResponse.json(
            { error: 'workId é obrigatório' },
            { status: 400 }
          );
        }

        const cacheResult = await ScoresCacheService.getWorkScores(workId);
        return NextResponse.json({
          cached: !!cacheResult.scores,
          fromCache: cacheResult.fromCache,
          stats: cacheResult.cacheStats,
          timestamp: new Date().toISOString(),
        });

      case 'cache-stats':
        const stats = await ScoresCacheService.getCacheStatistics();
        return NextResponse.json({
          ...stats,
          timestamp: new Date().toISOString(),
        });

      case 'stats':
        const cacheStats = IMSLPDirectUrlResolverOptimized.getCacheStats();
        const urlLogStats = IMSLPDirectUrlResolverOptimized.getUrlLogStats();
        const predictionModel =
          IMSLPDirectUrlResolverOptimized.getPredictionModel();

        return NextResponse.json({
          cache: cacheStats,
          logs: urlLogStats,
          ai: {
            patterns: predictionModel.patterns.size,
            globalStats: predictionModel.globalStats,
          },
          timestamp: new Date().toISOString(),
        });

      case 'logs':
        const logs = IMSLPDirectUrlResolverOptimized.getUrlLogs();
        return NextResponse.json({
          logs,
          count: logs.length,
          timestamp: new Date().toISOString(),
        });

      case 'patterns':
        const model = IMSLPDirectUrlResolverOptimized.getPredictionModel();
        const patternsArray = Array.from(model.patterns.entries()).map(
          ([patterns, data]) => ({
            patterns,
            ...data,
          })
        );

        return NextResponse.json({
          patterns: patternsArray,
          globalStats: model.globalStats,
          count: patternsArray.length,
          timestamp: new Date().toISOString(),
        });

      case 'analysis':
        const analysis =
          await IMSLPDirectUrlResolverOptimized.generateIntelligentReport();
        return NextResponse.json(analysis);

      case 'export':
        const exportData =
          IMSLPDirectUrlResolverOptimized.exportUrlLogsToJSON();

        return new NextResponse(exportData, {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="imslp-logs-${
              new Date().toISOString().split('T')[0]
            }.json"`,
          },
        });

      case 'health':
        const healthStats = IMSLPDirectUrlResolverOptimized.getUrlLogStats();
        const cacheHealth = IMSLPDirectUrlResolverOptimized.getCacheStats();
        const dbCacheStats = await ScoresCacheService.getCacheStatistics();

        const isHealthy =
          healthStats.successRate > 70 &&
          healthStats.averageTime < 5000 &&
          cacheHealth.avgConfidence > 0.5;

        return NextResponse.json({
          status: isHealthy ? 'healthy' : 'degraded',
          metrics: {
            successRate: healthStats.successRate,
            avgResponseTime: healthStats.averageTime,
            cacheConfidence: cacheHealth.avgConfidence,
            totalRequests: healthStats.totalEntries,
            aiPatterns:
              IMSLPDirectUrlResolverOptimized.getPredictionModel().patterns
                .size,
            dbCacheStats: dbCacheStats,
          },
          recommendations: isHealthy
            ? []
            : [
                healthStats.successRate <= 70
                  ? 'Taxa de sucesso baixa - verificar conectividade'
                  : null,
                healthStats.averageTime >= 5000
                  ? 'Tempo de resposta alto - otimizar cache'
                  : null,
                cacheHealth.avgConfidence <= 0.5
                  ? 'Confiança do cache baixa - limpar cache inválido'
                  : null,
              ].filter(Boolean),
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            error:
              'Tipo não reconhecido. Use: cache-check, cache-stats, stats, logs, patterns, analysis, export, health',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [API] Erro ao obter dados:', error);

    return NextResponse.json(
      {
        error: 'Erro ao obter dados',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
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
          // Limpar cache específico de uma obra
          await ScoresCacheService.cleanExpiredCache(0); // Força limpeza
          return NextResponse.json({
            success: true,
            message: `Cache da obra ${workId} limpo com sucesso`,
          });
        } else {
          // Limpar todo o cache do banco
          const cleanedCount = await ScoresCacheService.cleanExpiredCache(0);
          return NextResponse.json({
            success: true,
            message: `${cleanedCount} entradas de cache limpas`,
          });
        }

      case 'clear-logs':
        IMSLPDirectUrlResolverOptimized.clearUrlLogs();
        return NextResponse.json({
          success: true,
          message: 'Logs limpos com sucesso',
        });

      case 'clear-all':
        IMSLPDirectUrlResolverOptimized.clearCache();
        IMSLPDirectUrlResolverOptimized.clearUrlLogs();
        await ScoresCacheService.cleanExpiredCache(0);
        return NextResponse.json({
          success: true,
          message: 'Todos os caches e logs limpos com sucesso',
        });

      default:
        return NextResponse.json(
          {
            error:
              'Ação não reconhecida. Use: clear-cache, clear-db-cache, clear-logs, clear-all',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [API] Erro ao limpar dados:', error);

    return NextResponse.json(
      { error: 'Erro ao limpar dados' },
      { status: 500 }
    );
  }
}

// 🆕 Endpoint específico para verificação de cache
export async function PUT(request: NextRequest) {
  try {
    const { workId } = await request.json();

    if (!workId) {
      return NextResponse.json(
        { error: 'workId é obrigatório' },
        { status: 400 }
      );
    }

    const cacheResult = await ScoresCacheService.getWorkScores(workId);

    return NextResponse.json({
      cached: !!cacheResult.scores,
      needsProcessing: cacheResult.needsProcessing,
      stats: cacheResult.cacheStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [API] Erro ao verificar cache:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar cache' },
      { status: 500 }
    );
  }
}
