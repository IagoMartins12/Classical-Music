// app/api/imslp-scores/route.ts - Versão Ultra-Otimizada com IA e Analytics
import { NextRequest, NextResponse } from 'next/server';
import { IMSLPScraper } from '@/app/libs/imslp-score-scraper';
import { IMSLPAdvancedLogger } from '@/app/libs/imslp-advanced-logger';
import { IMSLPDirectUrlResolverOptimized } from '@/app/libs/imslp-url-resolver';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { imslpUrl } = await request.json();

    if (!imslpUrl) {
      return NextResponse.json(
        { error: 'URL do IMSLP é obrigatória' },
        { status: 400 }
      );
    }

    console.log(`\n🚀 [API] === SCRAPING ULTRA-OTIMIZADO ===`);
    console.log(`🌐 URL: ${imslpUrl}`);
    console.log(`🕐 Timestamp: ${new Date().toISOString()}`);
    console.log(`🧠 IA Ativada: Predição inteligente de subdomínios\n`);

    // 🚀 Usar o scraper ultra-otimizado
    const scoresData = await IMSLPScraper.fetchAndExtractScores(imslpUrl);

    const processingTime = Date.now() - startTime;

    console.log(`\n✅ [API] === SCRAPING CONCLUÍDO ===`);
    console.log(`⏱️ Tempo total: ${processingTime}ms`);
    console.log(`📊 Partituras encontradas:`, scoresData.totalCounts);

    // 📊 Estatísticas avançadas
    const cacheStats = IMSLPDirectUrlResolverOptimized.getCacheStats();
    const urlLogStats = IMSLPDirectUrlResolverOptimized.getUrlLogStats();
    const predictionModel =
      IMSLPDirectUrlResolverOptimized.getPredictionModel();

    console.log(
      `💾 Cache: ${cacheStats.totalEntries} entradas, conf. média: ${(
        cacheStats.avgConfidence * 100
      ).toFixed(1)}%`
    );
    console.log(
      `📝 Logs: ${
        urlLogStats.totalEntries
      } entradas, ${urlLogStats.cacheHitRate.toFixed(1)}% cache hit`
    );
    console.log(
      `🧠 Padrões IA: ${predictionModel.patterns.size} padrões aprendidos`
    );
    console.log(`${'='.repeat(60)}\n`);

    // 💾 Auto-save inteligente
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

    // Response com métricas avançadas
    const responseData = {
      ...scoresData,
      _metadata: {
        processingTime,
        performance: {
          cache: {
            entries: cacheStats.totalEntries,
            avgConfidence: cacheStats.avgConfidence,
            avgResponseTime: cacheStats.avgResponseTime,
          },
          logs: {
            totalEntries: urlLogStats.totalEntries,
            cacheHitRate: urlLogStats.cacheHitRate,
            successRate: urlLogStats.successRate,
            avgProcessingTime: urlLogStats.averageTime,
          },
          ai: {
            learnedPatterns: predictionModel.patterns.size,
            globalSuccessRate:
              (predictionModel.globalStats.successfulRequests /
                Math.max(predictionModel.globalStats.totalRequests, 1)) *
              100,
            mostReliableSubdomain:
              predictionModel.globalStats.mostReliableSubdomain,
          },
        },
        version: '2.0-AI',
        optimized: true,
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

// 🆕 Endpoint DELETE aprimorado
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'clear-cache':
        IMSLPDirectUrlResolverOptimized.clearCache();
        return NextResponse.json({
          success: true,
          message: 'Cache limpo com sucesso',
        });

      case 'clear-logs':
        IMSLPDirectUrlResolverOptimized.clearUrlLogs();
        return NextResponse.json({
          success: true,
          message: 'Logs limpos com sucesso',
        });

      case 'clear-patterns':
        // Limpar padrões da IA (requer restart para recarregar)
        const predictionModel =
          IMSLPDirectUrlResolverOptimized.getPredictionModel();
        predictionModel.patterns.clear();
        return NextResponse.json({
          success: true,
          message: 'Padrões de IA limpos com sucesso',
        });

      case 'clear-all':
        IMSLPDirectUrlResolverOptimized.clearCache();
        IMSLPDirectUrlResolverOptimized.clearUrlLogs();
        return NextResponse.json({
          success: true,
          message: 'Cache, logs e padrões limpos com sucesso',
        });

      default:
        return NextResponse.json(
          {
            error:
              'Ação não reconhecida. Use: clear-cache, clear-logs, clear-patterns, ou clear-all',
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

// 🆕 Endpoint GET super aprimorado com análise inteligente
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stats';

    switch (type) {
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
        // 🧠 Análise inteligente completa
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

      case 'export-patterns':
        // 🆕 Export de padrões para análise externa
        const modelData = IMSLPDirectUrlResolverOptimized.getPredictionModel();
        const exportPatterns = {
          patterns: Object.fromEntries(modelData.patterns),
          globalStats: modelData.globalStats,
          exportedAt: new Date().toISOString(),
          version: '2.0-AI',
        };

        return new NextResponse(JSON.stringify(exportPatterns, null, 2), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="imslp-patterns-${
              new Date().toISOString().split('T')[0]
            }.json"`,
          },
        });

      case 'save':
        try {
          const filePath =
            await IMSLPDirectUrlResolverOptimized.saveLogsToFile();
          return NextResponse.json({
            success: true,
            message: 'Logs e análise salvos com sucesso',
            filePath: filePath,
          });
        } catch (error) {
          return NextResponse.json(
            { error: `Erro ao salvar logs ${error}` },
            { status: 500 }
          );
        }

      case 'health':
        // 🆕 Health check com métricas detalhadas
        const healthStats = IMSLPDirectUrlResolverOptimized.getUrlLogStats();
        const cacheHealth = IMSLPDirectUrlResolverOptimized.getCacheStats();

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

      case 'insights':
        // 🆕 Insights automáticos baseados em IA
        const insightStats = IMSLPDirectUrlResolverOptimized.getUrlLogStats();
        const insights = [];

        if (insightStats.totalEntries > 100) {
          insights.push(
            `${
              insightStats.totalEntries
            } requisições processadas com ${insightStats.cacheHitRate.toFixed(
              1
            )}% de cache hit rate`
          );
        }

        if (insightStats.cacheHitRate > 80) {
          insights.push(
            'Excelente performance de cache - sistema bem otimizado'
          );
        } else if (insightStats.cacheHitRate < 50) {
          insights.push(
            'Cache hit rate baixo - considere ajustar TTL ou implementar pré-cache'
          );
        }

        if (insightStats.successRate < 80) {
          insights.push(
            'Taxa de sucesso baixa - alguns subdomínios podem estar instáveis'
          );
        }

        const topSubdomains = insightStats.topSubdomains.slice(0, 3);
        if (topSubdomains.length > 0) {
          insights.push(
            `Subdomínios mais utilizados: ${topSubdomains
              .map((s) => s.subdomain)
              .join(', ')}`
          );
        }

        return NextResponse.json({
          insights,
          recommendations: [
            insightStats.cacheHitRate < 60
              ? 'Implementar pré-cache para padrões frequentes'
              : null,
            insightStats.averageTime > 3000
              ? 'Reduzir timeout ou paralelização mais agressiva'
              : null,
            insightStats.totalEntries > 1000
              ? 'Considerar implementar limpeza automática de logs antigos'
              : null,
          ].filter(Boolean),
          actionItems: [
            'Monitorar tendências de performance',
            'Analisar padrões de falha',
            'Otimizar ordem de subdomínios baseado em dados',
          ],
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            error:
              'Tipo não reconhecido. Use: stats, logs, patterns, analysis, export, export-patterns, save, health, insights',
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
