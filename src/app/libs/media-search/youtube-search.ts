// app/libs/media-search/simplified-youtube-search.ts

import {
  generateSimpleQuery,
  isValidClassicalResult,
} from './simplified-media-search';

interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    channelId: string;
    publishedAt: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
  };
}

interface YouTubeSearchResponse {
  items: YouTubeVideo[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

/**
 * Busca ULTRA SIMPLIFICADA no YouTube
 * Sempre pega o PRIMEIRO resultado válido
 */
export async function searchYouTubeFirst(
  work: any
): Promise<YouTubeVideo | null> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.error('❌ [YOUTUBE] API Key não configurada');
      return null;
    }

    // Query ultra simples: "título - compositor"
    const searchQuery = generateSimpleQuery(work);
    console.log(`📺 [YOUTUBE] Buscando: "${searchQuery}"`);

    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('q', searchQuery);
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('maxResults', '20');
    searchUrl.searchParams.set('order', 'relevance');
    searchUrl.searchParams.set('key', apiKey);

    const response = await fetch(searchUrl.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [YOUTUBE] Erro na API: ${response.status}`, errorText);
      return null;
    }

    const data: YouTubeSearchResponse = await response.json();

    if (!data.items.length) {
      console.log(
        `ℹ️ [YOUTUBE] Nenhum resultado encontrado para: "${searchQuery}"`
      );
      return null;
    }

    // Encontra o PRIMEIRO resultado válido
    for (const video of data.items) {
      // Verifica se não é tutorial, lição, etc.
      if (!isValidMusicVideo(video)) {
        continue;
      }

      // Verifica se é música clássica válida
      if (
        isValidClassicalResult(video.snippet.title, video.snippet.channelTitle)
      ) {
        // Verifica se tem pelo menos o nome do compositor
        const composerName = work.composer.fullName.toLowerCase();
        const videoData =
          `${video.snippet.title} ${video.snippet.channelTitle}`.toLowerCase();

        if (
          videoData.includes(composerName) ||
          composerName.split(' ').some((name: any) => videoData.includes(name))
        ) {
          console.log(
            `✅ [YOUTUBE] PRIMEIRO resultado válido: "${video.snippet.title}" por ${video.snippet.channelTitle}`
          );
          return video;
        }
      }
    }

    console.log(`ℹ️ [YOUTUBE] Nenhum vídeo clássico válido encontrado`);
    return null;
  } catch (error) {
    console.error('❌ [YOUTUBE] Erro na busca:', error);
    return null;
  }
}

/**
 * Verifica se o vídeo é válido (não é tutorial, lição, etc.)
 */
function isValidMusicVideo(video: YouTubeVideo): boolean {
  const title = video.snippet.title.toLowerCase();

  // Palavras que indicam que NÃO é performance musical
  const excludeKeywords = [
    'tutorial',
    'lesson',
    'how to',
    'how-to',
    'analysis',
    'review',
    'reaction',
    'interview',
    'documentary',
    'behind the scenes',
    'making of',
    'masterclass',
    'course',
    'lecture',
    'talk',
    'discussion',
    'podcast',
    'vlog',
    'unboxing',
    'gear review',
  ];

  // Se contém palavras excluídas, não é válido
  return !excludeKeywords.some((keyword) => title.includes(keyword));
}

export type { YouTubeVideo, YouTubeSearchResponse };
