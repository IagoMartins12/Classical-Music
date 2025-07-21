// app/api/media-search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { isValidForAutoSearch } from '@/app/libs/media-search/simplified-media-search';
import { searchYouTubeFirst } from '@/app/libs/media-search/youtube-search';
import { searchSpotifyFirst } from '@/app/libs/media-search/spotify-search';

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

    // Verificar se a obra é válida para busca automática
    if (!isValidForAutoSearch(work)) {
      console.log(
        `⚠️ [MEDIA-SEARCH] Obra não válida para busca automática: ${work.title}`
      );

      await prisma.work.update({
        where: { id: workId },
        data: {
          mediaSearchStatus: 'not_found',
          lastMediaSearch: new Date(),
          mediaSearchError:
            'Obra não válida para busca automática (coletânea/livro)',
        },
      });

      return NextResponse.json({
        success: false,
        error:
          'Esta obra não é válida para busca automática (coletânea, livro ou obra muito genérica).',
      });
    }

    console.log(
      `🎵 [MEDIA-SEARCH] Iniciando busca ULTRA SIMPLES para: ${work.title} - ${work.composer.fullName}`
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

    // Buscar em paralelo - sempre pega o PRIMEIRO resultado válido
    const [spotifyResult, youtubeResult] = await Promise.all([
      searchSpotifyFirst(work),
      searchYouTubeFirst(work),
    ]);

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

    updateData.mediaSearchStrategy = 'ultra-simple-first-result';

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
        searchQuery: `${work.title} - ${work.composer.fullName}`,
        searchResults: {
          processingTime,
        },
        success: !!(spotifyResult || youtubeResult),
        foundSpotify: !!spotifyResult,
        foundYoutube: !!youtubeResult,
        strategy: 'ultra-simple-first-result',
        apiCalls: 2, // Spotify + YouTube
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
        strategy: 'ultra-simple-first-result',
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
