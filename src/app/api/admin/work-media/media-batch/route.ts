// app/api/admin/media-batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { isValidForAutoSearch } from '@/app/libs/media-search/simplified-media-search';
import { searchSpotifyFirst } from '@/app/libs/media-search/spotify-search';
import { searchYouTubeFirst } from '@/app/libs/media-search/youtube-search';

// Controle global do batch job
let currentBatchJob: any = null;
let shouldStop = false;

export async function POST(request: NextRequest) {
  try {
    const { action, strategy = 'ultra-simple' } = await request.json();

    switch (action) {
      case 'start':
        return await startBatchJob(strategy);
      case 'pause':
        return await pauseBatchJob();
      case 'resume':
        return await resumeBatchJob();
      case 'stop':
        return await stopBatchJob();
      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ [BATCH] Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    batchJob: currentBatchJob,
  });
}

async function startBatchJob(strategy: string) {
  if (currentBatchJob?.status === 'running') {
    return NextResponse.json(
      { error: 'Job já está em execução' },
      { status: 400 }
    );
  }

  console.log('🚀 [BATCH] Iniciando busca em lote ultra-simples');

  // Buscar obras elegíveis (sem mídia e válidas para busca automática)
  const eligibleWorks = await prisma.work.findMany({
    where: {
      AND: [
        { spotifyTrackId: null },
        { youtubeVideoId: null },
        // Adicionar filtro básico aqui se necessário
      ],
    },
    include: {
      composer: true,
      instrument: true,
    },
    orderBy: { createdAt: 'desc' }, // Obras mais recentes primeiro
  });

  // Filtrar obras válidas usando a nova função
  const validWorks = eligibleWorks.filter((work) => isValidForAutoSearch(work));

  console.log(
    `📊 [BATCH] ${validWorks.length} obras válidas de ${eligibleWorks.length} totais`
  );

  if (validWorks.length === 0) {
    return NextResponse.json(
      {
        error: 'Nenhuma obra válida encontrada para busca automática',
      },
      { status: 400 }
    );
  }

  // Criar novo job
  currentBatchJob = {
    id: `batch_${Date.now()}`,
    status: 'running',
    strategy: 'ultra-simple',
    total: validWorks.length,
    processed: 0,
    found: 0,
    errors: 0,
    progress: 0,
    startedAt: new Date().toISOString(),
    estimatedCompletion: null,
  };

  shouldStop = false;

  // Executar processamento em background
  processBatchInBackground(validWorks);

  return NextResponse.json({
    success: true,
    batchJob: currentBatchJob,
  });
}

async function processBatchInBackground(works: any[]) {
  const startTime = Date.now();

  for (let i = 0; i < works.length && !shouldStop; i++) {
    const work = works[i];

    try {
      console.log(
        `🎵 [BATCH] Processando ${i + 1}/${works.length}: ${work.title}`
      );

      // Atualizar status
      currentBatchJob.processed = i + 1;
      currentBatchJob.progress = ((i + 1) / works.length) * 100;

      // Estimar tempo de conclusão
      const elapsedTime = Date.now() - startTime;
      const avgTimePerWork = elapsedTime / (i + 1);
      const remainingWorks = works.length - (i + 1);
      const estimatedCompletion = new Date(
        Date.now() + remainingWorks * avgTimePerWork
      );
      currentBatchJob.estimatedCompletion = estimatedCompletion.toISOString();

      // Buscar mídia usando o sistema ultra-simples
      const [spotifyResult, youtubeResult] = await Promise.all([
        searchSpotifyFirst(work),
        searchYouTubeFirst(work),
      ]);

      // Preparar dados para atualização
      let updateData: any = {
        mediaSearchStatus:
          spotifyResult || youtubeResult ? 'found' : 'not_found',
        lastMediaSearch: new Date(),
        mediaSearchError: null,
        mediaSearchStrategy: 'ultra-simple-batch',
      };

      // Salvar resultados do Spotify
      if (spotifyResult) {
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
        currentBatchJob.found++;
      }

      // Salvar resultados do YouTube
      if (youtubeResult) {
        updateData = {
          ...updateData,
          youtubeVideoId: youtubeResult.id.videoId,
          youtubeVideoUrl: `https://www.youtube.com/watch?v=${youtubeResult.id.videoId}`,
          youtubeThumbnail: youtubeResult.snippet.thumbnails.medium?.url,
          youtubeTitle: youtubeResult.snippet.title,
          youtubeChannel: youtubeResult.snippet.channelTitle,
          youtubePublishedAt: new Date(youtubeResult.snippet.publishedAt),
        };

        if (!spotifyResult) {
          currentBatchJob.found++;
        }
      }

      // Atualizar obra na base de dados
      await prisma.work.update({
        where: { id: work.id },
        data: updateData,
      });

      // Log de sucesso
      const mediaFound = [];
      if (spotifyResult) mediaFound.push('Spotify');
      if (youtubeResult) mediaFound.push('YouTube');

      if (mediaFound.length > 0) {
        console.log(`✅ [BATCH] Encontrado: ${mediaFound.join(' + ')}`);
      } else {
        console.log(`❌ [BATCH] Nenhuma mídia encontrada`);
      }
    } catch (error) {
      console.error(`❌ [BATCH] Erro ao processar obra ${work.id}:`, error);
      currentBatchJob.errors++;

      // Salvar erro na obra
      await prisma.work
        .update({
          where: { id: work.id },
          data: {
            mediaSearchStatus: 'error',
            mediaSearchError:
              error instanceof Error ? error.message : 'Erro desconhecido',
            lastMediaSearch: new Date(),
          },
        })
        .catch(console.error);
    }

    // Delay para respeitar rate limits (1 segundo entre requests)
    if (i < works.length - 1 && !shouldStop) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Finalizar job
  if (currentBatchJob) {
    currentBatchJob.status = shouldStop ? 'paused' : 'completed';
    currentBatchJob.progress = shouldStop ? currentBatchJob.progress : 100;

    console.log(
      `🏁 [BATCH] Job ${currentBatchJob.status}. Processadas: ${currentBatchJob.processed}, Encontradas: ${currentBatchJob.found}, Erros: ${currentBatchJob.errors}`
    );
  }
}

async function pauseBatchJob() {
  if (!currentBatchJob || currentBatchJob.status !== 'running') {
    return NextResponse.json(
      { error: 'Nenhum job em execução' },
      { status: 400 }
    );
  }

  shouldStop = true;
  currentBatchJob.status = 'paused';

  console.log('⏸️ [BATCH] Job pausado');

  return NextResponse.json({ success: true });
}

async function resumeBatchJob() {
  if (!currentBatchJob || currentBatchJob.status !== 'paused') {
    return NextResponse.json(
      { error: 'Nenhum job pausado para retomar' },
      { status: 400 }
    );
  }

  // Buscar obras restantes
  const remainingWorks = await prisma.work.findMany({
    where: {
      AND: [
        { spotifyTrackId: null },
        { youtubeVideoId: null },
        {
          OR: [
            { mediaSearchStatus: null },
            { mediaSearchStatus: 'not_found' },
            { mediaSearchStatus: 'error' },
          ],
        },
      ],
    },
    include: {
      composer: true,
      instrument: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const validWorks = remainingWorks.filter((work) =>
    isValidForAutoSearch(work)
  );

  if (validWorks.length === 0) {
    currentBatchJob.status = 'completed';
    currentBatchJob.progress = 100;
    return NextResponse.json({
      success: true,
      message: 'Nenhuma obra restante para processar',
    });
  }

  // Atualizar totais
  currentBatchJob.total = currentBatchJob.processed + validWorks.length;
  currentBatchJob.status = 'running';
  shouldStop = false;

  // Continuar processamento
  processBatchInBackground(validWorks);

  console.log(
    `▶️ [BATCH] Job retomado com ${validWorks.length} obras restantes`
  );

  return NextResponse.json({ success: true });
}

async function stopBatchJob() {
  shouldStop = true;
  currentBatchJob = null;

  console.log('🛑 [BATCH] Job interrompido');

  return NextResponse.json({ success: true });
}
