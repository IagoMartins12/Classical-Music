// app/work/[workId]/WorkDetailsServer.tsx - ATUALIZADO COM DADOS DE ÁUDIO PROCESSADOS
import { notFound } from 'next/navigation';
import {
  getWorkById,
  getWorkMediaStats,
} from '@/app/requests/work-page-details';
import WorkDetailsClient from '@/app/[lang]/(main)/works/[workId]/pageClient';
import {
  loadPageTranslationsWithCommon,
  type Language,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';

interface WorkDetailsServerProps {
  /** Vem do segmento `[lang]` — ver `routeLanguage`. */
  language: Language;
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
  language,
}: WorkDetailsServerProps) {
  /**
   * **Sem `catch` que vira `notFound()`, de propósito.**
   *
   * "Não existe" já é tratado: `getWorkById` devolvem `null`
   * quando a API responde 404, e o `if` abaixo transforma isso no 404 correto
   * — que o Next pode guardar, porque é verdade.
   *
   * O que havia aqui transformava **qualquer** falha em 404: API fora do ar,
   * tempo esgotado, erro de rede. E 404 o Next guarda. Uma instabilidade de
   * trinta segundos durante uma varredura do Google faria a página de uma
   * obra ser indexada como inexistente. Deixando o erro subir, o Next
   * devolve 500 e não guarda nada.
   */
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

  // A sessão não é lida aqui de propósito: quem pode editar se decide no
  // navegador (`useSession` no componente cliente). Ler sessão no servidor
  // tornaria esta página dinâmica e desligaria o cache — ver o comentário em
  // `pageClient.tsx`.

  // 🆕 PROCESSAR DADOS DE ÁUDIO DE FORMA ESTRUTURADA
  const audioData: ProcessedAudioData = processAudioData(work, mediaStats);

  // Carregar traduções
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/workId',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <WorkDetailsClient
        work={work}
        audioData={audioData} // 🆕 Dados de áudio processados
        learningData={{ wantToLearn: [], learned: [] }}
      />
    </TranslationProvider>
  );
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
