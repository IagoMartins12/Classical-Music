// app/libs/media-search/simplified-spotify-search.ts

import {
  generateSimpleQuery,
  isValidClassicalResult,
} from './simplified-media-search';

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
 * Busca ULTRA SIMPLIFICADA no Spotify
 * Sempre pega o PRIMEIRO resultado válido
 */
export async function searchSpotifyFirst(
  work: any
): Promise<SpotifyTrack | null> {
  try {
    const accessToken = await getSpotifyAccessToken();
    if (!accessToken) {
      console.error('❌ [SPOTIFY] Não foi possível obter token de acesso');
      return null;
    }

    // Query ultra simples: "título - compositor"
    const searchQuery = generateSimpleQuery(work);
    console.log(`🎵 [SPOTIFY] Buscando: "${searchQuery}"`);

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        searchQuery
      )}&type=track&limit=20&market=BR`,
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

    // Encontra o PRIMEIRO resultado válido
    for (const track of data.tracks.items) {
      const artistNames = track.artists.map((a) => a.name).join(', ');

      // Verifica se é música clássica válida
      if (isValidClassicalResult(track.name, artistNames)) {
        // Verifica se tem pelo menos o nome do compositor
        const composerName = work.composer.fullName.toLowerCase();
        const trackData = `${track.name} ${artistNames}`.toLowerCase();

        if (
          trackData.includes(composerName) ||
          composerName.split(' ').some((name: any) => trackData.includes(name))
        ) {
          console.log(
            `✅ [SPOTIFY] PRIMEIRO resultado válido: "${track.name}" por ${artistNames}`
          );
          return track;
        }
      }
    }

    console.log(`ℹ️ [SPOTIFY] Nenhum resultado clássico válido encontrado`);
    return null;
  } catch (error) {
    console.error('❌ [SPOTIFY] Erro na busca:', error);
    return null;
  }
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
