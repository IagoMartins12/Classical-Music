// app/api/media-search/route.ts - ATUALIZADA PARA SALVAR ÁUDIO ALTERNATIVO
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
      // 🆕 Sempre buscar fontes alternativas, mesmo se já tem mídia básica
      const alternativeAudioResult = await searchAlternativeAudioSources(work);

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
              thumbnail: work.spotifyThumbnail, // 🆕 Thumbnail
            }
          : null,
        youtube: work.youtubeVideoId
          ? {
              videoId: work.youtubeVideoId,
              videoUrl: work.youtubeVideoUrl,
              title: work.youtubeTitle,
            }
          : null,
        alternativeAudio: alternativeAudioResult, // 🆕 Sempre retornar fontes alternativas
        metadata: {
          audioSourceSaved: false, // Mídia já existia
          alternativeSourcesFound: alternativeAudioResult.length,
        },
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
    let audioSourceSaved = false;
    let savedAudioUrl = null;
    let savedAudioSource = null;

    // 🆕 Salvar resultados do Spotify (COM INTÉRPRETE, DURAÇÃO E THUMBNAIL)
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

      // 🆕 Obter melhor thumbnail (maior resolução disponível)
      const thumbnail =
        spotifyResult.album.images.length > 0
          ? spotifyResult.album.images.sort(
              (a, b) => (b.height || 0) - (a.height || 0)
            )[0].url
          : null;

      responseSpotify = {
        trackId: spotifyResult.id,
        trackUrl: spotifyResult.external_urls.spotify,
        displayTitle, // 🆕 Título com intérprete
        previewUrl: spotifyResult.preview_url,
        albumArt: thumbnail, // 🆕 Usar thumbnail como albumArt
        thumbnail, // 🆕 Campo dedicado para thumbnail
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
        spotifyThumbnail: thumbnail, // 🆕 Salvar thumbnail
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

    // 🆕 SALVAR PRIMEIRA FONTE ALTERNATIVA VÁLIDA NO BANCO
    if (alternativeAudioResult.length > 0 && !work.customAudioUrl) {
      // Apenas salvar se não existir nenhuma fonte customizada ainda
      const firstValidSource = await validateFirstAudioSource(
        alternativeAudioResult
      );

      if (firstValidSource) {
        console.log(
          '💾 [MEDIA-SEARCH] Salvando primeira fonte alternativa válida:',
          {
            source: firstValidSource.source,
            url: firstValidSource.audioUrl,
            quality: firstValidSource.quality,
          }
        );

        updateData = {
          ...updateData,
          customAudioUrl: firstValidSource.audioUrl,
          customAudioSource: firstValidSource.source, // 🆕 Nome da fonte
          customAudioMetadata: {
            title: firstValidSource.title,
            source: firstValidSource.source,
            quality: firstValidSource.quality,
            license: firstValidSource.license,
            duration: firstValidSource.duration,
            format: firstValidSource.format,
            autoSavedAt: new Date().toISOString(),
          },
        };

        audioSourceSaved = true;
        savedAudioUrl = firstValidSource.audioUrl;
        savedAudioSource = firstValidSource.source;
      }
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
      }, Audio Alternativo: ${
        alternativeAudioResult.length > 0 ? '✅' : '❌'
      }, Audio Salvo: ${audioSourceSaved ? '✅' : '❌'}`
    );

    return NextResponse.json({
      success: true,
      spotify: responseSpotify,
      youtube: responseYoutube,
      alternativeAudio: alternativeAudioResult, // 🆕 Retornar fontes alternativas
      metadata: {
        processingTime,
        alternativeSourcesFound: alternativeAudioResult.length,
        spotifyThumbnailSaved: !!updateData.spotifyThumbnail, // 🆕 Confirmar se thumbnail foi salvo
        audioSourceSaved, // 🆕 Se uma fonte alternativa foi salva
        savedAudioUrl, // 🆕 URL da fonte salva
        savedAudioSource, // 🆕 Nome da fonte salva
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
    console.log('🔍 [MEDIA-SEARCH] Buscando fontes alternativas de áudio...');

    const response = await fetch(
      `${
        process.env.NEXTAUTH_URL || 'http://localhost:3000'
      }/api/alternative-audio-sources`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: work.title,
          composer: work.composer.fullName,
        }),
      }
    );

    if (!response.ok) {
      console.error(
        '❌ [MEDIA-SEARCH] Erro ao buscar fontes alternativas:',
        response.status
      );
      return [];
    }

    const data = await response.json();
    console.log(
      '✅ [MEDIA-SEARCH] Fontes alternativas encontradas:',
      data.sources?.length || 0
    );

    return data.sources || [];
  } catch (error) {
    console.error(
      '❌ [MEDIA-SEARCH] Erro ao buscar fontes alternativas:',
      error
    );
    return [];
  }
}

// 🆕 Função para validar a primeira fonte de áudio
async function validateFirstAudioSource(sources: any[]): Promise<any | null> {
  console.log('🔍 [MEDIA-SEARCH] Validando primeira fonte de áudio...');

  // Priorizar fontes por qualidade/confiabilidade
  const priorityOrder = [
    'Wikimedia Commons',
    'Internet Archive',
    'MusOpen',
    'IMSLP Recordings',
    'Classical Music Archive',
    'Freesound',
  ];

  // Ordenar por prioridade
  const sortedSources = sources.sort((a, b) => {
    const priorityA = priorityOrder.indexOf(a.source);
    const priorityB = priorityOrder.indexOf(b.source);

    // Se não estão na lista de prioridade, colocar no final
    const scoreA = priorityA === -1 ? 999 : priorityA;
    const scoreB = priorityB === -1 ? 999 : priorityB;

    return scoreA - scoreB;
  });

  // Tentar validar as primeiras 3 fontes
  for (const source of sortedSources.slice(0, 3)) {
    try {
      console.log(
        `🔍 [MEDIA-SEARCH] Validando fonte: ${source.source} - ${source.audioUrl}`
      );

      // Fazer uma requisição HEAD para verificar se o arquivo existe
      const headResponse = await fetch(source.audioUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000), // 5 segundos timeout
        headers: {
          'User-Agent': 'OpusAtlas/1.0 (Classical Music Encyclopedia)',
        },
      });

      if (headResponse.ok) {
        const contentType = headResponse.headers.get('content-type');
        const contentLength = headResponse.headers.get('content-length');

        // Verificar se é realmente um arquivo de áudio
        if (contentType && contentType.startsWith('audio/')) {
          console.log(
            `✅ [MEDIA-SEARCH] Fonte válida encontrada: ${source.source}`
          );

          return {
            ...source,
            validatedAt: new Date().toISOString(),
            contentType,
            contentLength,
          };
        } else {
          console.log(
            `⚠️ [MEDIA-SEARCH] Fonte não é áudio: ${source.source} (${contentType})`
          );
        }
      } else {
        console.log(
          `❌ [MEDIA-SEARCH] Fonte não acessível: ${source.source} (${headResponse.status})`
        );
      }
    } catch (error) {
      console.log(
        `❌ [MEDIA-SEARCH] Erro ao validar fonte: ${source.source}:`,
        error
      );
      continue;
    }
  }

  console.log('❌ [MEDIA-SEARCH] Nenhuma fonte alternativa válida encontrada');
  return null;
}
