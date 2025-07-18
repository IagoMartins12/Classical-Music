// app/libs/media-search/youtube-search.ts

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
 * Busca SIMPLIFICADA no YouTube
 * Corrige o erro 400 Bad Request com queries mais simples
 */
export async function searchYouTubeVideo(
  query: string,
  composerName: string
): Promise<YouTubeVideo | null> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.error('❌ [YOUTUBE] API Key não configurada');
      return null;
    }

    // Query MUITO simples para evitar erro 400
    const searchQuery = buildSimpleYouTubeQuery(query);
    console.log(`📺 [YOUTUBE] Buscando: "${searchQuery}"`);

    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('q', searchQuery);
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('maxResults', '25');
    searchUrl.searchParams.set('order', 'relevance');
    searchUrl.searchParams.set('key', apiKey);
    // Removido videoDuration e videoDefinition que podem causar erro

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

    // Filtrar e encontrar o melhor resultado
    const bestVideo = findBestYouTubeMatch(data.items, query, composerName);

    if (!bestVideo) {
      console.log(`ℹ️ [YOUTUBE] Nenhum vídeo relevante encontrado`);
      return null;
    }

    console.log(
      `✅ [YOUTUBE] Encontrado: "${bestVideo.snippet.title}" por ${bestVideo.snippet.channelTitle}`
    );
    return bestVideo;
  } catch (error) {
    console.error('❌ [YOUTUBE] Erro na busca:', error);
    return null;
  }
}

/**
 * Constrói query SIMPLES para YouTube
 * Remove caracteres e termos que causavam erro 400
 */
function buildSimpleYouTubeQuery(query: string): string {
  return query
    .replace(/[""''""]/g, '') // Remove aspas especiais
    .replace(/[,;:()[\]{}]/g, ' ') // Remove pontuação problemática
    .replace(/[+\-&|!]/g, ' ') // Remove operadores
    .replace(/\s+/g, ' ') // Remove espaços duplos
    .trim()
    .substring(0, 100); // Limita tamanho para evitar queries muito longas
}

/**
 * Encontra o melhor vídeo usando score de relevância
 */
function findBestYouTubeMatch(
  videos: YouTubeVideo[],
  originalQuery: string,
  composerName: string
): YouTubeVideo | null {
  let bestVideo: YouTubeVideo | null = null;
  let bestScore = 0;

  for (const video of videos) {
    // Verificar se é relevante para música clássica
    if (!isVideoRelevantForClassical(video)) {
      continue;
    }

    const score = calculateYouTubeRelevanceScore(
      video,
      originalQuery,
      composerName
    );

    if (score > bestScore && score >= 60) {
      // Mínimo de 60% de relevância
      bestScore = score;
      bestVideo = video;
    }
  }

  console.log(`🎯 [YOUTUBE] Melhor score: ${bestScore}%`);
  return bestVideo;
}

/**
 * Calcula score de relevância para YouTube
 */
function calculateYouTubeRelevanceScore(
  video: YouTubeVideo,
  originalQuery: string,
  composerName: string
): number {
  const title = video.snippet.title.toLowerCase();
  const channel = video.snippet.channelTitle.toLowerCase();
  const description = video.snippet.description.toLowerCase();
  const queryLower = originalQuery.toLowerCase();
  const composerLower = composerName.toLowerCase();

  let score = 0;

  // 40 pontos: Compositor deve estar no título ou canal
  if (title.includes(composerLower) || channel.includes(composerLower)) {
    score += 40;
  } else {
    return 0; // Se não tem o compositor, não é relevante
  }

  // 30 pontos: Palavras da query devem estar no título
  const queryWords = queryLower.split(' ').filter((word) => word.length > 2);
  const matchedWords = queryWords.filter((word) => title.includes(word));
  score += (matchedWords.length / queryWords.length) * 30;

  // 20 pontos: Canal profissional de música clássica
  const professionalChannelKeywords = [
    'philharmonic',
    'symphony',
    'orchestra',
    'conservatory',
    'classical',
    'piano',
    'violin',
    'chamber',
    'ensemble',
    'music',
    'concert',
    'opera',
  ];
  if (
    professionalChannelKeywords.some((keyword) => channel.includes(keyword))
  ) {
    score += 20;
  }

  // 10 pontos: Palavras de qualidade no título
  const qualityKeywords = [
    'live',
    'concert',
    'full',
    'complete',
    'performance',
    'recital',
    'official',
  ];
  if (qualityKeywords.some((keyword) => title.includes(keyword))) {
    score += 10;
  }

  // Penalty para vídeos não musicais
  const excludeKeywords = [
    'tutorial',
    'lesson',
    'how to',
    'reaction',
    'review',
    'analysis',
    'behind the scenes',
    'interview',
    'documentary',
    'talk',
    'lecture',
  ];
  if (excludeKeywords.some((keyword) => title.includes(keyword))) {
    score -= 30;
  }

  return Math.max(0, score);
}

/**
 * Verifica se o vídeo é relevante para música clássica
 */
function isVideoRelevantForClassical(video: YouTubeVideo): boolean {
  const title = video.snippet.title.toLowerCase();
  const channel = video.snippet.channelTitle.toLowerCase();

  // Palavras que indicam música clássica
  const classicalKeywords = [
    'classical',
    'piano',
    'violin',
    'orchestra',
    'symphony',
    'philharmonic',
    'chamber',
    'quartet',
    'sonata',
    'concerto',
    'opera',
    'ensemble',
    'conservatory',
    'recital',
    'performance',
  ];

  // Palavras que indicam conteúdo não musical
  const excludeKeywords = [
    'reaction',
    'tutorial',
    'lesson',
    'how to',
    'remix',
    'electronic',
    'jazz version',
    'rock version',
    'pop version',
    'karaoke',
    'backing track',
    'play along',
    'minus one',
    'review',
    'analysis',
    'documentary',
    'interview',
    'podcast',
    'talk',
    'speech',
    'lecture',
    'behind the scenes',
  ];

  // Se contém palavras excluídas, não é relevante
  if (excludeKeywords.some((keyword) => title.includes(keyword))) {
    return false;
  }

  // Se contém palavras clássicas no título ou canal, é relevante
  return classicalKeywords.some(
    (keyword) => title.includes(keyword) || channel.includes(keyword)
  );
}

export type { YouTubeVideo, YouTubeSearchResponse };
