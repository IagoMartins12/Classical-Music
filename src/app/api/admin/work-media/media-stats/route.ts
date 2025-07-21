// app/api/admin/media-stats/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { isValidForAutoSearch } from '@/app/libs/media-search/simplified-media-search';

export async function GET() {
  try {
    console.log('📊 [STATS] Calculando estatísticas de mídia...');

    // Buscar todas as obras com dados relacionados
    const allWorks = await prisma.work.findMany({
      include: {
        composer: true,
        instrument: true,
      },
    });

    // Estatísticas básicas
    const total = allWorks.length;
    const withSpotify = allWorks.filter((work) => work.spotifyTrackId).length;
    const withYoutube = allWorks.filter((work) => work.youtubeVideoId).length;
    const withBoth = allWorks.filter(
      (work) => work.spotifyTrackId && work.youtubeVideoId
    ).length;
    const withNone = allWorks.filter(
      (work) => !work.spotifyTrackId && !work.youtubeVideoId
    ).length;

    // Calcular elegibilidade para busca automática
    let validForAutoSearch = 0;
    let invalidForAutoSearch = 0;

    allWorks.forEach((work) => {
      if (isValidForAutoSearch(work)) {
        validForAutoSearch++;
      } else {
        invalidForAutoSearch++;
      }
    });

    // Estatísticas de busca
    const pending = allWorks.filter(
      (work) => work.mediaSearchStatus === 'searching'
    ).length;
    const errors = allWorks.filter(
      (work) => work.mediaSearchStatus === 'error'
    ).length;

    // Estatísticas por estratégia
    const ultraSimpleResults = allWorks.filter(
      (work) =>
        work.mediaSearchStrategy === 'ultra-simple' ||
        work.mediaSearchStrategy === 'ultra-simple-batch'
    ).length;

    // Estatísticas de qualidade (apenas para obras com mídia)
    const worksWithMedia = allWorks.filter(
      (work) => work.spotifyTrackId || work.youtubeVideoId
    );
    const worksWithPreview = allWorks.filter(
      (work) => work.spotifyPreviewUrl
    ).length;

    // Taxa de sucesso por período
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const searchesLast24h = allWorks.filter(
      (work) => work.lastMediaSearch && work.lastMediaSearch > last24h
    ).length;

    const successLast24h = allWorks.filter(
      (work) =>
        work.lastMediaSearch &&
        work.lastMediaSearch > last24h &&
        (work.spotifyTrackId || work.youtubeVideoId)
    ).length;

    const searchesLast7d = allWorks.filter(
      (work) => work.lastMediaSearch && work.lastMediaSearch > last7d
    ).length;

    const successLast7d = allWorks.filter(
      (work) =>
        work.lastMediaSearch &&
        work.lastMediaSearch > last7d &&
        (work.spotifyTrackId || work.youtubeVideoId)
    ).length;

    // Estatísticas por tipo de obra
    const individualWorks = allWorks.filter(
      (work) => work.workType === 'INDIVIDUAL'
    );
    const collectedWorks = allWorks.filter(
      (work) => work.workType === 'COLLECTED_WORKS'
    );

    const individualWithMedia = individualWorks.filter(
      (work) => work.spotifyTrackId || work.youtubeVideoId
    ).length;
    const collectedWithMedia = collectedWorks.filter(
      (work) => work.spotifyTrackId || work.youtubeVideoId
    ).length;

    // Top compositores com mais mídia
    const composerStats = allWorks.reduce((acc: any, work) => {
      const composerName = work.composer.fullName;
      if (!acc[composerName]) {
        acc[composerName] = {
          total: 0,
          withMedia: 0,
          withSpotify: 0,
          withYoutube: 0,
        };
      }
      acc[composerName].total++;
      if (work.spotifyTrackId || work.youtubeVideoId) {
        acc[composerName].withMedia++;
      }
      if (work.spotifyTrackId) {
        acc[composerName].withSpotify++;
      }
      if (work.youtubeVideoId) {
        acc[composerName].withYoutube++;
      }
      return acc;
    }, {});

    const topComposers = Object.entries(composerStats)
      .map(([name, stats]: [string, any]) => ({
        name,
        ...stats,
        coverage: (stats.withMedia / stats.total) * 100,
      }))
      .sort((a, b) => b.withMedia - a.withMedia)
      .slice(0, 10);

    const stats = {
      // Estatísticas básicas
      total,
      withSpotify,
      withYoutube,
      withBoth,
      withNone,

      // Elegibilidade para busca automática
      validForAutoSearch,
      invalidForAutoSearch,
      eligibilityRate: (validForAutoSearch / total) * 100,

      // Status de busca
      pending,
      errors,

      // Qualidade dos resultados
      worksWithPreview,
      previewRate: withSpotify > 0 ? (worksWithPreview / withSpotify) * 100 : 0,

      // Performance recente
      searchesLast24h,
      successLast24h,
      successRateLast24h:
        searchesLast24h > 0 ? (successLast24h / searchesLast24h) * 100 : 0,

      searchesLast7d,
      successLast7d,
      successRateLast7d:
        searchesLast7d > 0 ? (successLast7d / searchesLast7d) * 100 : 0,

      // Por tipo de obra
      individualWorks: {
        total: individualWorks.length,
        withMedia: individualWithMedia,
        coverage: (individualWithMedia / individualWorks.length) * 100,
      },
      collectedWorks: {
        total: collectedWorks.length,
        withMedia: collectedWithMedia,
        coverage:
          collectedWorks.length > 0
            ? (collectedWithMedia / collectedWorks.length) * 100
            : 0,
      },

      // Estratégias utilizadas
      ultraSimpleResults,
      ultraSimpleRate: total > 0 ? (ultraSimpleResults / total) * 100 : 0,

      // Top compositores
      topComposers,

      // Metadados
      lastUpdated: new Date().toISOString(),
    };

    console.log('✅ [STATS] Estatísticas calculadas com sucesso');
    console.log(
      `📊 [STATS] Total: ${total}, Spotify: ${withSpotify}, YouTube: ${withYoutube}, Válidas: ${validForAutoSearch}`
    );

    return NextResponse.json({
      success: true,
      stats,
      // Incluir job atual se existir (importado do batch)
      batchJob: null, // Será preenchido pelo endpoint de batch
    });
  } catch (error) {
    console.error('❌ [STATS] Erro ao calcular estatísticas:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao calcular estatísticas',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
