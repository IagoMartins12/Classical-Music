// app/api/imslp-scores/route.ts - API com Carregamento Incremental
import { NextRequest, NextResponse } from 'next/server';
import {
  IMSLPScraperIncremental,
  PaginationOptions,
} from '@/app/libs/imslp-score-scraper-incremental';
import { ScoresCacheService } from '@/app/libs/scores-cache-service';
import { IMSLPDirectUrlResolverOptimized } from '@/app/libs/imslp-url-resolver';
import { ScoresCacheServiceIncremental } from '@/app/libs/scores-cache-service-incremental';

interface RequestBody {
  imslpUrl: string;
  workId?: string;
  priorityScoreId?: string;
  forceRefresh?: boolean;
  // 🆕 Parâmetros de paginação
  pagination?: {
    limit?: number;
    offset?: number;
    loadMore?: boolean; // Se é carregamento de "mais" partituras
    specificTypes?: string[]; // Tipos específicos para carregar
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
    } = pagination;

    console.log(`\n🚀 [API-INC] === BUSCA INCREMENTAL ===`);
    console.log(`🌐 URL: ${imslpUrl}`);
    console.log(`🎼 WorkID: ${workId || 'não informado'}`);
    console.log(
      `📄 Paginação: limit=${limit}, offset=${offset}, loadMore=${loadMore}`
    );
    console.log(`⭐ Partitura prioritária: ${priorityScoreId || 'nenhuma'}`);
    console.log(`🔄 Force refresh: ${forceRefresh}`);
    console.log(`🕐 Timestamp: ${new Date().toISOString()}\n`);

    let scoresData: any = null;
    let fromCache = false;
    let cacheStats = null;
    let backgroundCachingStarted = false;

    // 1️⃣ PRIMEIRA FASE: Verificar cache (apenas se não for forceRefresh)
    if (workId && !forceRefresh) {
      console.log(`💾 [API-INC] Verificando cache para workId: ${workId}`);

      const cacheResult =
        await ScoresCacheServiceIncremental.getWorkScoresIncremental(workId, {
          limit,
          offset,
          priorityScore: priorityScoreId,
          specificTypes,
        });

      if (cacheResult.scores && cacheResult.hasEnoughData) {
        console.log(
          `✅ [API-INC] Cache HIT! Retornando ${cacheResult.loadedCount} partituras do cache`
        );

        scoresData = cacheResult.scores;
        fromCache = true;
        cacheStats = cacheResult.cacheStats;
      } else if (cacheResult.scores && offset > 0) {
        // Cache parcial para carregamento incremental
        console.log(
          `🔄 [API-INC] Cache parcial encontrado para offset ${offset}`
        );
        scoresData = cacheResult.scores;
        fromCache = true;
        cacheStats = cacheResult.cacheStats;
      } else {
        console.log(`❌ [API-INC] Cache MISS - será necessário fazer scraping`);
      }
    }

    // 2️⃣ SEGUNDA FASE: Scraping IMSLP (se não temos cache suficiente)
    if (!scoresData) {
      console.log(`🕷️ [API-INC] Iniciando scraping incremental...`);

      const paginationOptions: PaginationOptions = {
        limit,
        offset,
        loadInBackground: !loadMore, // Se não é "carregar mais", fazer cache em background
        specificTypes,
      };

      // Usar o scraper incremental
      scoresData =
        await IMSLPScraperIncremental.fetchAndExtractScoresIncremental(
          imslpUrl,
          paginationOptions
        );

      fromCache = false;

      console.log(`✅ [API-INC] Scraping incremental concluído:`, {
        loadedScores: Object.values(scoresData.loadedCounts).reduce(
          (sum: number, count: number) => sum + count,
          0
        ),
        totalScores: Object.values(scoresData.totalCounts).reduce(
          (sum: number, count: number) => sum + count,
          0
        ),
        hasMore: scoresData.hasMore,
      });

      // 3️⃣ TERCEIRA FASE: Salvar no cache (se workId foi fornecido)
      if (workId) {
        console.log(`💾 [API-INC] Salvando partituras no cache...`);

        // Salvar partituras carregadas imediatamente
        ScoresCacheServiceIncremental.cacheScoresFromIMSLPIncremental(
          workId,
          scoresData,
          priorityScoreId,
          { immediate: true }
        )
          .then(() => {
            console.log(
              `✅ [API-INC] Cache imediato salvo para workId: ${workId}`
            );
          })
          .catch((error) => {
            console.error(`❌ [API-INC] Erro ao salvar cache imediato:`, error);
          });

        // 4️⃣ QUARTA FASE: Cache em background (se é carregamento inicial)
        if (!loadMore && offset === 0) {
          console.log(`🔄 [API-INC] Iniciando cache em background...`);

          backgroundCachingStarted = true;

          // Cache completo em background (não bloqueia resposta)
          startBackgroundCaching(imslpUrl, workId, priorityScoreId).catch(
            (error) => {
              console.error(`❌ [API-INC] Erro no cache background:`, error);
            }
          );
        }
      }
    }

    const processingTime = Date.now() - startTime;

    console.log(`\n✅ [API-INC] === BUSCA CONCLUÍDA ===`);
    console.log(`⏱️ Tempo total: ${processingTime}ms`);
    console.log(`📊 Fonte: ${fromCache ? 'CACHE' : 'SCRAPING'}`);
    console.log(`📈 Partituras carregadas:`, scoresData.loadedCounts);
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
        version: '4.0-INCREMENTAL',
        optimized: true,
        cached: fromCache,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    const processingTime = Date.now() - startTime;

    console.error(`\n❌ [API-INC] === ERRO APÓS ${processingTime}ms ===`);
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
}

// 🆕 Endpoint GET atualizado com suporte a verificação de cache incremental
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stats';
    const workId = searchParams.get('workId');
    const limit = parseInt(searchParams.get('limit') || '5');
    const offset = parseInt(searchParams.get('offset') || '0');

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
          });

        return NextResponse.json({
          cached: !!cacheResult.scores,
          hasEnoughData: cacheResult.hasEnoughData,
          fromCache: cacheResult.fromCache,
          loadedCount: cacheResult.loadedCount,
          totalAvailable: cacheResult.totalAvailable,
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

      default:
        // Fallback para endpoints existentes
        return NextResponse.json(
          { error: 'Tipo não suportado na versão incremental' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [API-INC] Erro ao obter dados:', error);
    return NextResponse.json({ error: 'Erro ao obter dados' }, { status: 500 });
  }
}
