// app/api/media-search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import {
  generateSimpleSearchQueries,
  calculateSimpleQualityScore,
  isWorkTooComplexForAutoSearch,
} from '@/app/libs/media-search/simplified-media-search';
import { searchSpotifyTrack } from '@/app/libs/media-search/spotify-search';
import { searchYouTubeVideo } from '@/app/libs/media-search/youtube-search';

export async function POST(request: NextRequest) {
  try {
    const { workId, forceRefresh = false } = await request.json();

    if (!workId) {
      return NextResponse.json(
        { error: 'workId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar dados da obra
    const work = await prisma.work.findUnique({
      where: { id: workId },
      include: {
        composer: true,
        instrument: true,
      },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se já tem mídia e não é refresh forçado
    if (!forceRefresh && (work.spotifyTrackId || work.youtubeVideoId)) {
      return NextResponse.json({
        success: true,
        message: 'Mídia já existe',
        spotify: work.spotifyTrackId
          ? {
              trackId: work.spotifyTrackId,
              trackUrl: work.spotifyTrackUrl,
              previewUrl: work.spotifyPreviewUrl,
              albumArt: work.spotifyAlbumArt,
              artists: work.spotifyArtists,
              albumName: work.spotifyAlbumName,
              duration: work.spotifyDuration,
              popularity: work.spotifyPopularity,
            }
          : null,
        youtube: work.youtubeVideoId
          ? {
              videoId: work.youtubeVideoId,
              videoUrl: work.youtubeVideoUrl,
              thumbnail: work.youtubeThumbnail,
              title: work.youtubeTitle,
              channel: work.youtubeChannel,
              publishedAt: work.youtubePublishedAt,
            }
          : null,
      });
    }

    // Verificar rate limiting (máximo 1 busca por obra a cada 30 minutos)
    if (!forceRefresh && work.lastMediaSearch) {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      if (work.lastMediaSearch > thirtyMinutesAgo) {
        return NextResponse.json(
          { error: 'Busca já realizada recentemente. Aguarde 30 minutos.' },
          { status: 429 }
        );
      }
    }

    // Verificar se a obra é muito complexa para busca automática
    if (isWorkTooComplexForAutoSearch(work)) {
      console.log(
        `⚠️ [MEDIA-SEARCH] Obra muito complexa para busca automática: ${work.title}`
      );

      await prisma.work.update({
        where: { id: workId },
        data: {
          mediaSearchStatus: 'not_found',
          lastMediaSearch: new Date(),
          mediaSearchError: 'Obra muito complexa para busca automática',
        },
      });

      return NextResponse.json({
        success: false,
        error:
          'Esta obra é muito complexa para busca automática. Adicione mídia manualmente.',
      });
    }

    console.log(
      `🎵 [MEDIA-SEARCH] Iniciando busca SIMPLIFICADA para: ${work.title} - ${work.composer.fullName}`
    );

    // Atualizar status para "searching"
    await prisma.work.update({
      where: { id: workId },
      data: {
        mediaSearchStatus: 'searching',
        lastMediaSearch: new Date(),
        mediaSearchAttempts: work.mediaSearchAttempts + 1,
      },
    });

    const startTime = Date.now();

    // Gerar queries simples (máximo 3)
    const searchQueries = generateSimpleSearchQueries(work);
    console.log(
      `🔍 [MEDIA-SEARCH] Queries geradas (${searchQueries.length}):`,
      searchQueries
    );

    let spotifyResult = null;
    let youtubeResult = null;
    let bestStrategy = '';
    let apiCalls = 0;

    // Buscar em paralelo com queries simples
    for (const query of searchQueries) {
      console.log(
        `🎼 [MEDIA-SEARCH] Testando: "${query.query}" (${query.strategy})`
      );

      // Se já encontrou ambos, parar
      if (spotifyResult && youtubeResult) {
        break;
      }

      try {
        const [spotify, youtube] = await Promise.all([
          !spotifyResult
            ? searchSpotifyTrack(query.query, work.composer.fullName)
            : null,
          !youtubeResult
            ? searchYouTubeVideo(query.query, work.composer.fullName)
            : null,
        ]);

        apiCalls += 2;

        // Avaliar qualidade dos resultados
        if (spotify && !spotifyResult) {
          const score = calculateSimpleQualityScore(
            work.title,
            work.composer.fullName,
            spotify.name,
            spotify.artists.map((a) => a.name).join(' ')
          );

          console.log(`🎯 [SPOTIFY] Score: ${score}% para "${spotify.name}"`);

          if (score >= 60) {
            // Mínimo 60% de relevância
            spotifyResult = spotify;
            bestStrategy += `${query.strategy} (Spotify), `;
          }
        }

        if (youtube && !youtubeResult) {
          const score = calculateSimpleQualityScore(
            work.title,
            work.composer.fullName,
            youtube.snippet.title,
            youtube.snippet.channelTitle
          );

          console.log(
            `🎯 [YOUTUBE] Score: ${score}% para "${youtube.snippet.title}"`
          );

          if (score >= 60) {
            // Mínimo 60% de relevância
            youtubeResult = youtube;
            bestStrategy += `${query.strategy} (YouTube), `;
          }
        }
      } catch (error) {
        console.error(
          `❌ [MEDIA-SEARCH] Erro na query "${query.query}":`,
          error
        );
      }
    }

    const processingTime = Date.now() - startTime;

    // Preparar dados para salvar
    let updateData: any = {
      mediaSearchStatus: spotifyResult || youtubeResult ? 'found' : 'not_found',
      lastMediaSearch: new Date(),
      mediaSearchError: null,
    };

    let responseSpotify = null;
    let responseYoutube = null;

    // Salvar resultados do Spotify
    if (spotifyResult) {
      responseSpotify = {
        trackId: spotifyResult.id,
        trackUrl: spotifyResult.external_urls.spotify,
        previewUrl: spotifyResult.preview_url,
        albumArt: spotifyResult.album.images[0]?.url,
        artists: spotifyResult.artists.map((a) => a.name),
        albumName: spotifyResult.album.name,
        duration: spotifyResult.duration_ms,
        popularity: spotifyResult.popularity,
      };

      updateData = {
        ...updateData,
        spotifyTrackId: spotifyResult.id,
        spotifyTrackUrl: spotifyResult.external_urls.spotify,
        spotifyPreviewUrl: spotifyResult.preview_url,
        spotifyAlbumArt: spotifyResult.album.images[0]?.url,
        spotifyArtists: spotifyResult.artists.map((a) => a.name),
        spotifyAlbumName: spotifyResult.album.name,
        spotifyDuration: spotifyResult.duration_ms,
        spotifyPopularity: spotifyResult.popularity,
      };
    }

    // Salvar resultados do YouTube
    if (youtubeResult) {
      responseYoutube = {
        videoId: youtubeResult.id.videoId,
        videoUrl: `https://www.youtube.com/watch?v=${youtubeResult.id.videoId}`,
        thumbnail: youtubeResult.snippet.thumbnails.medium?.url,
        title: youtubeResult.snippet.title,
        channel: youtubeResult.snippet.channelTitle,
        publishedAt: youtubeResult.snippet.publishedAt,
      };

      updateData = {
        ...updateData,
        youtubeVideoId: youtubeResult.id.videoId,
        youtubeVideoUrl: `https://www.youtube.com/watch?v=${youtubeResult.id.videoId}`,
        youtubeThumbnail: youtubeResult.snippet.thumbnails.medium?.url,
        youtubeTitle: youtubeResult.snippet.title,
        youtubeChannel: youtubeResult.snippet.channelTitle,
        youtubePublishedAt: new Date(youtubeResult.snippet.publishedAt),
      };
    }

    updateData.mediaSearchStrategy = bestStrategy.replace(/, $/, '') || 'none';

    // Salvar na base de dados
    await prisma.work.update({
      where: { id: workId },
      data: updateData,
    });

    // Salvar log da busca
    await prisma.mediaSearchLog.create({
      data: {
        workId,
        searchType: 'both',
        searchQuery: searchQueries[0].query,
        searchResults: {
          queriesUsed: searchQueries.length,
          apiCalls,
          processingTime,
        },
        success: !!(spotifyResult || youtubeResult),
        foundSpotify: !!spotifyResult,
        foundYoutube: !!youtubeResult,
        strategy: bestStrategy,
        apiCalls,
        processingTime,
      },
    });

    console.log(`✅ [MEDIA-SEARCH] Busca concluída em ${processingTime}ms`);
    console.log(
      `📊 [MEDIA-SEARCH] Spotify: ${spotifyResult ? '✅' : '❌'}, YouTube: ${
        youtubeResult ? '✅' : '❌'
      }`
    );

    return NextResponse.json({
      success: true,
      spotify: responseSpotify,
      youtube: responseYoutube,
      metadata: {
        processingTime,
        apiCalls,
        queriesUsed: searchQueries.length,
        strategy: bestStrategy,
      },
    });
  } catch (error) {
    console.error('❌ [MEDIA-SEARCH] Erro:', error);

    // Salvar erro na base de dados
    try {
      const body = await request.json().catch(() => ({}));
      await prisma.work.update({
        where: { id: body.workId },
        data: {
          mediaSearchStatus: 'error',
          mediaSearchError:
            error instanceof Error ? error.message : 'Erro desconhecido',
          lastMediaSearch: new Date(),
        },
      });
    } catch (dbError) {
      console.error('❌ [MEDIA-SEARCH] Erro ao salvar erro na DB:', dbError);
    }

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
