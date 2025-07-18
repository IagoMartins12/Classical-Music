// app/libs/media-search/spotify-search.ts

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
  };
}

/**
 * Busca SIMPLIFICADA no Spotify
 * Foca em encontrar o resultado mais relevante rapidamente
 */
export async function searchSpotifyTrack(
  query: string,
  composerName: string
): Promise<SpotifyTrack | null> {
  try {
    const accessToken = await getSpotifyAccessToken();
    if (!accessToken) {
      console.error('❌ [SPOTIFY] Não foi possível obter token de acesso');
      return null;
    }

    // Query simplificada sem filtros problemáticos
    const searchQuery = buildSimpleSpotifyQuery(query);
    console.log(`🎵 [SPOTIFY] Buscando: "${searchQuery}"`);

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        searchQuery
      )}&type=track&limit=50&market=BR`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(
        `❌ [SPOTIFY] Erro na API: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data: SpotifySearchResponse = await response.json();

    if (!data.tracks.items.length) {
      console.log(
        `ℹ️ [SPOTIFY] Nenhum resultado encontrado para: "${searchQuery}"`
      );
      return null;
    }

    // Filtrar e encontrar o melhor resultado
    const bestTrack = findBestSpotifyMatch(
      data.tracks.items,
      query,
      composerName
    );

    if (!bestTrack) {
      console.log(`ℹ️ [SPOTIFY] Nenhum resultado relevante encontrado`);
      return null;
    }

    const artistNames = bestTrack.artists.map((a) => a.name).join(', ');
    console.log(
      `✅ [SPOTIFY] Encontrado: "${bestTrack.name}" por ${artistNames}`
    );

    return bestTrack;
  } catch (error) {
    console.error('❌ [SPOTIFY] Erro na busca:', error);
    return null;
  }
}

/**
 * Constrói query simples e eficaz para Spotify
 * Remove filtros que estavam causando problemas
 */
function buildSimpleSpotifyQuery(query: string): string {
  // Apenas a query básica, sem filtros complexos
  return query
    .replace(/[""'']/g, '') // Remove aspas especiais
    .replace(/[,;:]/g, ' ') // Substitui pontuação por espaço
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Encontra o melhor match usando o score de qualidade simplificado
 */
function findBestSpotifyMatch(
  tracks: SpotifyTrack[],
  originalQuery: string,
  composerName: string
): SpotifyTrack | null {
  let bestTrack: SpotifyTrack | null = null;
  let bestScore = 0;

  for (const track of tracks) {
    // Pular tracks sem preview (preferir com preview)
    const artistNames = track.artists.map((a) => a.name).join(' ');

    // Calcular score básico
    let score = calculateSpotifyRelevanceScore(
      track,
      originalQuery,
      composerName
    );

    // Bonus por ter preview
    if (track.preview_url) {
      score += 15;
    }

    // Bonus por popularidade moderada (não muito comercial, não muito obscuro)
    if (track.popularity >= 30 && track.popularity <= 80) {
      score += 10;
    }

    // Verificar se é música clássica
    if (!isClassicalMusic(track.name, artistNames)) {
      score = 0; // Zerar score se não for clássica
    }

    if (score > bestScore && score >= 60) {
      // Mínimo de 60% de relevância
      bestScore = score;
      bestTrack = track;
    }
  }

  console.log(`🎯 [SPOTIFY] Melhor score: ${bestScore}%`);
  return bestTrack;
}

/**
 * Calcula score de relevância simplificado
 */
function calculateSpotifyRelevanceScore(
  track: SpotifyTrack,
  originalQuery: string,
  composerName: string
): number {
  const trackName = track.name.toLowerCase();
  const artistNames = track.artists
    .map((a) => a.name)
    .join(' ')
    .toLowerCase();
  const queryLower = originalQuery.toLowerCase();
  const composerLower = composerName.toLowerCase();

  let score = 0;

  // 40 pontos: Compositor deve estar nos artistas ou no nome da track
  if (
    artistNames.includes(composerLower) ||
    trackName.includes(composerLower)
  ) {
    score += 40;
  } else {
    return 0; // Se não tem o compositor, não é relevante
  }

  // 30 pontos: Palavras do título original devem estar presentes
  const queryWords = queryLower.split(' ').filter((word) => word.length > 2);
  const matchedWords = queryWords.filter(
    (word) => trackName.includes(word) || artistNames.includes(word)
  );
  score += (matchedWords.length / queryWords.length) * 30;

  // 20 pontos: Album com palavras clássicas
  const albumName = track.album.name.toLowerCase();
  const classicalAlbumKeywords = [
    'complete',
    'works',
    'collection',
    'essential',
    'sonatas',
    'concertos',
    'symphonies',
    'classical',
    'piano',
    'violin',
    'chamber',
  ];
  if (classicalAlbumKeywords.some((keyword) => albumName.includes(keyword))) {
    score += 20;
  }

  // 10 pontos: Duração apropriada (1-20 minutos)
  const durationMinutes = track.duration_ms / (1000 * 60);
  if (durationMinutes >= 1 && durationMinutes <= 20) {
    score += 10;
  }

  return score;
}

/**
 * Verifica se é música clássica (simplificado)
 */
function isClassicalMusic(trackName: string, artistNames: string): boolean {
  const combined = `${trackName} ${artistNames}`.toLowerCase();

  // Palavras que indicam música clássica
  const classicalKeywords = [
    'piano',
    'violin',
    'orchestra',
    'symphony',
    'philharmonic',
    'chamber',
    'quartet',
    'sonata',
    'concerto',
    'classical',
    'opus',
    'op.',
    'bwv',
  ];

  // Palavras que indicam NÃO ser música clássica
  const nonClassicalKeywords = [
    'remix',
    'electronic',
    'jazz',
    'rock',
    'pop',
    'hip hop',
    'rap',
    'disco',
    'funk',
    'metal',
    'cover version',
    'karaoke',
  ];

  // Se contém palavras não-clássicas, rejeitar
  if (nonClassicalKeywords.some((keyword) => combined.includes(keyword))) {
    return false;
  }

  // Se contém palavras clássicas, aceitar
  return classicalKeywords.some((keyword) => combined.includes(keyword));
}

/**
 * Obtém token de acesso do Spotify
 */
async function getSpotifyAccessToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('❌ [SPOTIFY] Credenciais não configuradas');
    return null;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      console.error(`❌ [SPOTIFY] Erro ao obter token: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('❌ [SPOTIFY] Erro ao obter token:', error);
    return null;
  }
}

export type { SpotifyTrack, SpotifySearchResponse };
