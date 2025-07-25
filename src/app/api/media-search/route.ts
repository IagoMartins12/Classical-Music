// app/api/media-search/route.ts - ATUALIZADA
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
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
              displayTitle: work.spotifyDisplayTitle, // 🆕 Título com intérprete
              duration: work.spotifyDuration, // 🆕 Duração
              artists: work.spotifyArtists
                ? JSON.parse(work.spotifyArtists)
                : [], // 🆕 Artists
            }
          : null,
        youtube: work.youtubeVideoId
          ? {
              videoId: work.youtubeVideoId,
              videoUrl: work.youtubeVideoUrl,
              title: work.youtubeTitle,
            }
          : null,
        alternativeAudio: await searchAlternativeAudioSources(work), // 🆕 Buscar sempre fontes alternativas
      });
    }

    // Verificar se a obra é válida para busca automática
    if (!isValidForAutoSearch(work)) {
      console.log(
        `⚠️ [MEDIA-SEARCH] Obra não válida para busca automática: ${work.title}`
      );

      await prisma.work.update({
        where: { id: workId },
        data: {
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
      `🎵 [MEDIA-SEARCH] Iniciando busca COMPLETA para: ${work.title} - ${work.composer.fullName}`
    );

    // Atualizar status para "searching"
    await prisma.work.update({
      where: { id: workId },
      data: {
        lastMediaSearch: new Date(),
      },
    });

    const startTime = Date.now();

    // 🆕 Buscar em paralelo - TODAS as 3 fontes
    const [spotifyResult, youtubeResult, alternativeAudioResult] =
      await Promise.all([
        searchSpotifyFirst(work),
        searchYouTubeFirst(work),
        searchAlternativeAudioSources(work), // 🆕 Busca fontes alternativas
      ]);

    const processingTime = Date.now() - startTime;

    // Preparar dados para salvar
    let updateData: any = {
      lastMediaSearch: new Date(),
      mediaSearchError: null,
      mediaSource: 'auto', // Marcar como automático
    };

    let responseSpotify = null;
    let responseYoutube = null;

    // 🆕 Salvar resultados do Spotify (COM INTÉRPRETE E DURAÇÃO)
    if (spotifyResult) {
      // Criar título com compositor + intérprete
      const composer = spotifyResult.artists.find(
        (artist) =>
          work.composer.fullName
            .toLowerCase()
            .includes(artist.name.toLowerCase()) ||
          artist.name
            .toLowerCase()
            .includes(work.composer.fullName.toLowerCase())
      );

      const interpreters = spotifyResult.artists.filter(
        (artist) => artist !== composer
      );
      const displayTitle =
        composer && interpreters.length > 0
          ? `${composer.name} - ${interpreters.map((a) => a.name).join(', ')}`
          : spotifyResult.artists.map((a) => a.name).join(', ');

      responseSpotify = {
        trackId: spotifyResult.id,
        trackUrl: spotifyResult.external_urls.spotify,
        displayTitle, // 🆕 Título com intérprete
        previewUrl: spotifyResult.preview_url,
        albumArt: spotifyResult.album.images[0]?.url,
        artists: spotifyResult.artists.map((a) => a.name), // 🆕 Lista de artistas
        albumName: spotifyResult.album.name,
        duration: spotifyResult.duration_ms, // 🆕 Duração em ms
        popularity: spotifyResult.popularity,
      };

      updateData = {
        ...updateData,
        spotifyTrackId: spotifyResult.id,
        spotifyTrackUrl: spotifyResult.external_urls.spotify,
        spotifyDisplayTitle: displayTitle, // 🆕 Salvar título com intérprete
        spotifyDuration: spotifyResult.duration_ms, // 🆕 Salvar duração
        spotifyArtists: JSON.stringify(spotifyResult.artists), // 🆕 Salvar artists completos
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
        youtubeTitle: youtubeResult.snippet.title,
      };
    }

    // Salvar na base de dados
    await prisma.work.update({
      where: { id: workId },
      data: updateData,
    });

    // 🆕 INVALIDAR CACHE DIRETAMENTE (sem necessidade de estrutura separada)
    revalidateTag('work-basic-data');
    revalidateTag(`work-${workId}`);

    console.log(`✅ [MEDIA-SEARCH] Busca concluída em ${processingTime}ms`);
    console.log(
      `📊 [MEDIA-SEARCH] Spotify: ${spotifyResult ? '✅' : '❌'}, YouTube: ${
        youtubeResult ? '✅' : '❌'
      }, Audio Alternativo: ${alternativeAudioResult.length > 0 ? '✅' : '❌'}`
    );

    return NextResponse.json({
      success: true,
      spotify: responseSpotify,
      youtube: responseYoutube,
      alternativeAudio: alternativeAudioResult, // 🆕 Retornar fontes alternativas
      metadata: {
        processingTime,
        alternativeSourcesFound: alternativeAudioResult.length,
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

// 🆕 Função para buscar fontes alternativas de áudio
async function searchAlternativeAudioSources(work: any) {
  try {
    const response = await fetch('/api/alternative-audio-sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: work.title,
        composer: work.composer.fullName,
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.sources || [];
  } catch (error) {
    console.error('Erro ao buscar fontes alternativas:', error);
    return [];
  }
}
