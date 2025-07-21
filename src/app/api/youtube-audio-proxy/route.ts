// app/api/youtube-audio-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { isEligibleForAudioExtraction } from '@/app/libs/media-search/youtube-audio-extractor';

// IMPORTANTE: Esta API deve ser usada apenas para música clássica em domínio público
// Para produção, considere usar serviços como:
// - yt-dlp server
// - youtube-dl API
// - Serviços de streaming legais

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`🎵 [YOUTUBE-AUDIO] Tentando extrair áudio para: ${videoId}`);

    // 1. Primeiro, verificar se o vídeo é elegível
    const videoInfo = await getVideoInfo(videoId);
    if (!videoInfo) {
      return NextResponse.json(
        { error: 'Vídeo não encontrado' },
        { status: 404 }
      );
    }

    // 2. Verificar elegibilidade (apenas domínio público)
    const isEligible = isEligibleForAudioExtraction(
      videoInfo.title,
      videoInfo.channelTitle,
      videoInfo.description
    );

    if (!isEligible) {
      console.log(
        `⚠️ [YOUTUBE-AUDIO] Vídeo não elegível para extração: ${videoInfo.title}`
      );
      return NextResponse.json(
        {
          error:
            'Este vídeo não é elegível para extração de áudio (direitos autorais)',
          reason: 'copyright_protected',
        },
        { status: 403 }
      );
    }

    // 3. Para desenvolvimento, retornar URL simulada
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        audioInfo: {
          audioUrl: generateDevelopmentAudioUrl(videoId),
          duration: 300000, // 5 minutos
          quality: '128kbps',
          title: videoInfo.title,
          isSimulated: true,
        },
      });
    }

    // 4. Para produção, usar serviço real de extração
    const audioInfo = await extractAudioProduction(videoId);

    if (!audioInfo) {
      return NextResponse.json(
        {
          error: 'Não foi possível extrair áudio deste vídeo',
        },
        { status: 500 }
      );
    }

    console.log(
      `✅ [YOUTUBE-AUDIO] Áudio extraído com sucesso: ${audioInfo.quality}`
    );

    return NextResponse.json({
      success: true,
      audioInfo,
    });
  } catch (error) {
    console.error('❌ [YOUTUBE-AUDIO] Erro:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

/**
 * Obter informações básicas do vídeo
 */
async function getVideoInfo(videoId: string) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return null;

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`
    );

    const data = await response.json();

    if (data.items?.length > 0) {
      const video = data.items[0];
      return {
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        description: video.snippet.description,
        publishedAt: video.snippet.publishedAt,
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao obter info do vídeo:', error);
    return null;
  }
}

/**
 * Gerar URL de áudio simulada para desenvolvimento
 */
function generateDevelopmentAudioUrl(videoId: string): string {
  // Em desenvolvimento, usar áudios de exemplo ou retornar URL do YouTube embed
  // NUNCA usar isto em produção
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0&controls=1&modestbranding=1&rel=0`;
}

/**
 * Extrair áudio em produção usando serviço externo
 */
async function extractAudioProduction(videoId: string) {
  try {
    // Opção 1: Usar yt-dlp via spawn process (se instalado no servidor)
    const ytdlpResult = await extractWithYtDlp(videoId);
    if (ytdlpResult) return ytdlpResult;

    // Opção 2: Usar serviço externo como rapidapi
    const rapidApiResult = await extractWithRapidApi(videoId);
    if (rapidApiResult) return rapidApiResult;

    // Opção 3: Usar serviço próprio de extração
    return await extractWithCustomService(videoId);
  } catch (error) {
    console.error('Erro na extração de produção:', error);
    return null;
  }
}

/**
 * Extrair usando yt-dlp (se disponível no servidor)
 */
async function extractWithYtDlp(videoId: string) {
  try {
    const { spawn } = require('child_process');

    return new Promise((resolve, reject) => {
      const ytdlp = spawn('yt-dlp', [
        '--extract-flat',
        '--get-url',
        '--format',
        'bestaudio[ext=m4a]/bestaudio',
        `https://www.youtube.com/watch?v=${videoId}`,
      ]);

      let output = '';

      ytdlp.stdout.on('data', (data: Buffer) => {
        output += data.toString();
      });

      ytdlp.on('close', (code: number) => {
        if (code === 0 && output.trim()) {
          resolve({
            audioUrl: output.trim(),
            duration: 0, // Será detectado pelo player
            quality: 'best',
            title: 'Extracted audio',
          });
        } else {
          resolve(null);
        }
      });

      ytdlp.on('error', () => resolve(null));
    });
  } catch (error) {
    return null;
  }
}

/**
 * Extrair usando RapidAPI ou similar
 */
async function extractWithRapidApi(videoId: string) {
  try {
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    if (!rapidApiKey) return null;

    const response = await fetch(
      'https://youtube-media-downloader.p.rapidapi.com/v2/video/details',
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'youtube-media-downloader.p.rapidapi.com',
        },
        // params: { videoId }
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    // Processar resposta da API e extrair URL de áudio
    if (data.audioStreams?.length > 0) {
      const audioStream = data.audioStreams[0];
      return {
        audioUrl: audioStream.url,
        duration: data.duration * 1000,
        quality: audioStream.quality,
        title: data.title,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Usar serviço personalizado de extração
 */
async function extractWithCustomService(videoId: string) {
  try {
    // Implementar sua própria lógica de extração
    // ou usar um microserviço dedicado

    const customServiceUrl = process.env.CUSTOM_AUDIO_EXTRACTOR_URL;
    if (!customServiceUrl) return null;

    const response = await fetch(`${customServiceUrl}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId }),
    });

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    return null;
  }
}

// Endpoint para verificar se um vídeo é elegível
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const videoId = url.searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId é obrigatório' },
        { status: 400 }
      );
    }

    const videoInfo = await getVideoInfo(videoId);
    if (!videoInfo) {
      return NextResponse.json(
        { error: 'Vídeo não encontrado' },
        { status: 404 }
      );
    }

    const isEligible = isEligibleForAudioExtraction(
      videoInfo.title,
      videoInfo.channelTitle,
      videoInfo.description
    );

    return NextResponse.json({
      eligible: isEligible,
      videoInfo: {
        title: videoInfo.title,
        channel: videoInfo.channelTitle,
      },
      reason: isEligible ? 'public_domain_classical' : 'copyright_protected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erro ao verificar elegibilidade',
      },
      { status: 500 }
    );
  }
}
