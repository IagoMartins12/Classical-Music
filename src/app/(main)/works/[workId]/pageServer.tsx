// app/work/[workId]/WorkDetailsServer.tsx - ATUALIZADO COM DADOS DE ÁUDIO PROCESSADOS
import { notFound } from 'next/navigation';
import {
  getWorkById,
  getWorkMediaStats,
} from '@/app/requests/work-page-details';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import WorkDetailsClient from '@/app/(main)/works/[workId]/pageClient';

interface WorkDetailsServerProps {
  workId: string;
}

// 🆕 Interface para dados de áudio processados
interface ProcessedAudioData {
  hasAnyAudio: boolean;
  customAudio: {
    url: string;
    file: string;
    source: string;
    metadata: any;
    isUpload: boolean;
    isAlternativeSource: boolean;
    isPersistent: boolean;
    title: string;
  } | null;
  spotify: {
    trackId: string;
    trackUrl: string;
    displayTitle?: string;
    duration?: number;
    artists: string[];
    thumbnail?: string;
    previewUrl?: string | null;
    albumArt?: string | null;
    albumName?: string;
    popularity?: number;
  } | null;
  youtube: {
    videoId: string;
    videoUrl: string;
    title: string;
  } | null;
  mediaSource: string | null;
  lastMediaSearch: Date | null;
  mediaSearchError: string | null;
  completeness: number;
}

export default async function WorkDetailsServer({
  workId,
}: WorkDetailsServerProps) {
  const session = await getServerSession(authOptions);

  try {
    console.log(`🎼 [SERVER] Carregando dados da obra ${workId}`);
    const startTime = Date.now();

    // Carregar dados da obra, obras relacionadas e estatísticas de mídia em paralelo
    const [work, mediaStats] = await Promise.all([
      getWorkById(workId),
      getWorkMediaStats(workId), // 🆕 Estatísticas de mídia
    ]);

    if (!work) {
      console.log(`❌ [SERVER] Obra ${workId} não encontrada`);
      notFound();
    }

    const loadTime = Date.now() - startTime;
    console.log(`✅ [SERVER] Dados da obra carregados em ${loadTime}ms`);

    // 🆕 VERIFICAR PERMISSÕES COMPLETAS
    const isAdmin = session?.user?.role === 2;
    const isOwner = work.createdBy === session?.user?.id;
    console.log('isOWNER', {
      isOwner,
      work: work.createdBy,
      session: session?.user.id,
    });
    const canEditMedia = isAdmin || isOwner;

    // const canEditVideoAula =
    //   isAdmin || isOwner ? true : session?.user.role === 1 ? true : false;

    // 🆕 PROCESSAR DADOS DE ÁUDIO DE FORMA ESTRUTURADA
    const audioData: ProcessedAudioData = processAudioData(work, mediaStats);

    return (
      <WorkDetailsClient
        work={work}
        audioData={audioData} // 🆕 Dados de áudio processados
        isAdmin={isAdmin}
        canEditMedia={canEditMedia}
        learningData={{ wantToLearn: [], learned: [] }}
      />
    );
  } catch (error) {
    console.error(`❌ [SERVER] Erro ao carregar obra ${workId}:`, error);

    if (error instanceof Error) {
      console.error(`- Mensagem: ${error.message}`);
      console.error(`- Stack: ${error.stack}`);
    }

    notFound();
  }
}

// 🆕 Função para processar dados de áudio
function processAudioData(
  work: any,
  mediaStats: any | null
): ProcessedAudioData {
  // 🎯 PROCESSAR ÁUDIO CUSTOMIZADO (UPLOAD OU FONTE ALTERNATIVA)
  const customAudio =
    work.customAudioUrl || work.customAudioFile
      ? {
          url: work.customAudioUrl || work.customAudioFile,
          file: work.customAudioFile || work.customAudioUrl,
          source: work.customAudioSource || 'unknown',
          metadata: work.customAudioMetadata,
          isUpload: work.customAudioSource === 'upload',
          isAlternativeSource:
            work.customAudioSource && work.customAudioSource !== 'upload',
          isPersistent: true,
          title:
            work.customAudioSource === 'upload'
              ? `${work.title} - Áudio Personalizado`
              : work.customAudioSource
              ? `${work.title} - ${work.customAudioSource}`
              : `${work.title} - Áudio Customizado`,
        }
      : null;

  // 🎯 PROCESSAR SPOTIFY COM DADOS EXPANDIDOS
  const spotify = work.spotifyTrackId
    ? {
        trackId: work.spotifyTrackId,
        trackUrl: work.spotifyTrackUrl,
        displayTitle: work.spotifyDisplayTitle,
        duration: work.spotifyDuration,
        artists: work.spotifyArtists
          ? parseSpotifyArtists(work.spotifyArtists)
          : [],
        thumbnail: work.spotifyThumbnail,
        previewUrl: null, // Será preenchido pelo client se necessário
        albumArt: work.spotifyThumbnail,
        albumName: work.title, // Fallback
        popularity: 0, // Será preenchido pelo client se necessário
      }
    : null;

  // 🎯 PROCESSAR YOUTUBE
  const youtube = work.youtubeVideoId
    ? {
        videoId: work.youtubeVideoId,
        videoUrl: work.youtubeVideoUrl,
        title: work.youtubeTitle,
      }
    : null;

  // 🎯 VERIFICAR SE TEM ALGUMA MÍDIA
  const hasAnyAudio = !!(customAudio || spotify || youtube);

  return {
    hasAnyAudio,
    customAudio,
    spotify,
    youtube,
    mediaSource: work.mediaSource,
    lastMediaSearch: work.lastMediaSearch,
    mediaSearchError: work.mediaSearchError,
    completeness: mediaStats?.completeness || 0,
  };
}

// 🆕 Função para parsear artistas do Spotify
function parseSpotifyArtists(artistsData: any): string[] {
  if (!artistsData) return [];

  try {
    if (Array.isArray(artistsData)) {
      return artistsData.map((artist) =>
        typeof artist === 'string' ? artist : artist.name || artist
      );
    }

    if (typeof artistsData === 'string') {
      const parsed = JSON.parse(artistsData);
      if (Array.isArray(parsed)) {
        return parsed.map((artist) =>
          typeof artist === 'string' ? artist : artist.name || artist
        );
      }
    }

    return [];
  } catch (error) {
    console.error('Erro ao parsear artistas do Spotify:', error);
    return [];
  }
}
