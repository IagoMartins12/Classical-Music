// app/requests/work-page-details.ts - CORRIGIDO O TYPO NO CAMPO customAudioSource
import prisma from '@/app/libs/prismadb';
import { JsonValue } from '@prisma/client/runtime/library';
import { unstable_cache } from 'next/cache';

export interface WorkDetails {
  id: string;
  title: string;
  subtitle?: string | null;
  opOrCatalog?: string;
  compositionYear?: string;
  firstPublishDate?: string;
  tone?: string;
  mediaDuration?: string;
  imslpPermlink: string;
  imslpId: string;
  videoUrl?: string;
  workStyle?: string;
  moviment?: string;
  dedicateTo?: string;
  dedicationComposerLink?: string;
  instrumentation?: string;
  workType: string;
  parentWorkId?: string;
  movementNumber?: number;
  createdAt: Date;
  isVerified: boolean;
  createdBy?: string | null;

  // 🆕 Campos de mídia expandidos com thumbnail
  spotifyTrackId?: string | null;
  spotifyTrackUrl?: string | null;
  spotifyDisplayTitle?: string | null; // 🆕 "Composer - Interpreter"
  spotifyDuration?: number | null; // 🆕 Duração em ms
  spotifyArtists?: JsonValue | null; // 🆕 JSON com array de artistas
  spotifyThumbnail?: string | null; // 🆕 URL da thumbnail do Spotify

  youtubeVideoId?: string | null;
  youtubeVideoUrl?: string | null;
  youtubeTitle?: string | null;

  videoAulaUrl?: string | null;
  videoAulaFile?: string | null;
  videoAulaMetadata?: JsonValue | null;
  videoAulaSource?: string | null;
  videoAulaTitle?: string | null;
  videoAulaType?: string | null;
  videoAulaAddedAt?: Date | null;
  videoAulaAddedBy?: string | null;

  customAudioUrl?: string | null;
  customAudioFile?: string | null;
  customAudioMetadata?: JsonValue | null;
  customAudioSource?: string | null; // 🔧 CORRIGIDO: era customAudioMSource

  mediaSource?: string | null; // "auto", "manual", "none"
  lastMediaSearch?: Date | null;
  mediaSearchError?: string | null;

  difficultyLevel?: string | null;

  composer: {
    id: string;
    name: string;
    fullName: string;
    epochName: string | null;
  };

  instrument: {
    id: string;
    name: string;
  } | null;

  epoch: {
    id: string;
    name: string;
  } | null;

  categoryNames: string[];
  workGenresArr: string[];
}

export interface WorkListItem {
  id: string;
  title: string;
  subtitle?: string | null;
  opOrCatalog?: string;
  compositionYear?: string;
  tone?: string;
  mediaDuration?: string;
  workType: string;
  composer: {
    id: string;
    name: string;
    epochName: string | null;
  };

  instrument: {
    name: string;
  } | null;
}

export interface WorksListResponse {
  works: WorkListItem[];
  totalCount: number;
  hasMore: boolean;
}

// Cache dos dados da obra (sem anotações/favoritos) por 2 horas
const getCachedWorkData = unstable_cache(
  async (workId: string) => {
    try {
      const work = await prisma.work.findUnique({
        where: {
          id: workId,
        },
        select: {
          id: true,
          title: true,
          opOrCatalog: true,
          subtitle: true,
          compositionYear: true,
          firstPublishDate: true,
          tone: true,
          mediaDuration: true,
          imslpPermlink: true,
          imslpId: true,
          videoUrl: true,
          workStyle: true,
          moviment: true,
          dedicateTo: true,
          dedicationComposerLink: true,
          instrumentation: true,
          workType: true,
          movementNumber: true,
          createdAt: true,
          instrumentId: true,
          epochId: true,
          categoryNames: true,
          workGenresArr: true,
          isVerified: true,
          createdBy: true,

          // 🆕 Campos de mídia expandidos com thumbnail
          spotifyTrackId: true,
          spotifyTrackUrl: true,
          spotifyDisplayTitle: true, // 🆕
          spotifyDuration: true, // 🆕
          spotifyArtists: true, // 🆕
          spotifyThumbnail: true, // 🆕 Thumbnail do Spotify

          youtubeVideoId: true,
          youtubeVideoUrl: true,
          youtubeTitle: true,

          videoAulaUrl: true,
          videoAulaFile: true,
          videoAulaMetadata: true,
          videoAulaSource: true,
          videoAulaTitle: true,
          videoAulaType: true,
          videoAulaAddedAt: true,
          videoAulaAddedBy: true,

          customAudioUrl: true,
          customAudioFile: true,
          customAudioMetadata: true,
          customAudioSource: true, // 🔧 CORRIGIDO: era customAudioMSource

          mediaSource: true, // "auto", "manual", "none"
          lastMediaSearch: true,
          mediaSearchError: true,
          difficultyLevel: true,

          composer: {
            select: {
              id: true,
              name: true,
              fullName: true,
              epochName: true,
            },
          },
        },
      });

      if (!work) return null;

      // Buscar instrument e epoch
      const [instrument, epoch] = await Promise.all([
        work.instrumentId
          ? prisma.instrument.findUnique({
              where: { id: work.instrumentId },
              select: { id: true, name: true },
            })
          : null,
        work.epochId
          ? prisma.epoch.findUnique({
              where: { id: work.epochId },
              select: { id: true, name: true },
            })
          : null,
      ]);

      return {
        ...work,
        instrument,
        epoch,
      };
    } catch (error) {
      console.error('Erro ao buscar dados da obra:', error);
      return null;
    }
  },
  ['work-basic-data'],
  {
    revalidate: 7200, // 2 horas
    tags: ['work-basic-data'],
  }
);

// Função principal para buscar obra por ID
export const getWorkById = async (
  workId: string
): Promise<WorkDetails | null> => {
  try {
    const work = await getCachedWorkData(workId);

    if (!work) {
      return null;
    }

    return {
      id: work.id,
      title: work.title,
      opOrCatalog: work.opOrCatalog || undefined,
      subtitle: work.subtitle,
      compositionYear: work.compositionYear || undefined,
      firstPublishDate: work.firstPublishDate || undefined,
      tone: work.tone || undefined,
      mediaDuration: work.mediaDuration || undefined,
      imslpPermlink: work.imslpPermlink,
      imslpId: work.imslpId,
      videoUrl: work.videoUrl || undefined,
      workStyle: work.workStyle || undefined,
      moviment: work.moviment || undefined,
      dedicateTo: work.dedicateTo || undefined,
      dedicationComposerLink: work.dedicationComposerLink || undefined,
      instrumentation: work.instrumentation || undefined,
      workType: work.workType,
      movementNumber: work.movementNumber || undefined,
      createdAt: work.createdAt,
      composer: work.composer,
      instrument: work.instrument,
      epoch: work.epoch,
      categoryNames: work.categoryNames,
      workGenresArr: work.workGenresArr,
      isVerified: work.isVerified,
      createdBy: work.createdBy,

      // 🆕 Campos de mídia expandidos com thumbnail
      spotifyTrackId: work.spotifyTrackId,
      spotifyTrackUrl: work.spotifyTrackUrl,
      spotifyDisplayTitle: work.spotifyDisplayTitle, // 🆕
      spotifyDuration: work.spotifyDuration, // 🆕
      spotifyArtists: work.spotifyArtists, // 🆕
      spotifyThumbnail: work.spotifyThumbnail, // 🆕 Thumbnail do Spotify

      youtubeVideoId: work.youtubeVideoId,
      youtubeVideoUrl: work.youtubeVideoUrl,
      youtubeTitle: work.youtubeTitle,

      videoAulaUrl: work.videoAulaUrl,
      videoAulaFile: work.videoAulaFile,
      videoAulaMetadata: work.videoAulaMetadata,
      videoAulaSource: work.videoAulaSource,
      videoAulaTitle: work.videoAulaTitle,
      videoAulaType: work.videoAulaType,
      videoAulaAddedAt: work.videoAulaAddedAt,

      videoAulaAddedBy: work.videoAulaAddedBy,
      customAudioUrl: work.customAudioUrl,
      customAudioFile: work.customAudioFile,
      customAudioMetadata: work.customAudioMetadata,
      customAudioSource: work.customAudioSource, // 🔧 CORRIGIDO

      mediaSource: work.mediaSource, // "auto", "manual", "none"
      lastMediaSearch: work.lastMediaSearch,
      difficultyLevel: work.difficultyLevel,
      mediaSearchError: work.mediaSearchError,
    };
  } catch (error) {
    console.error('Erro ao buscar obra:', error);
    return null;
  }
};

// Buscar obras relacionadas (mesmo compositor, mesmo gênero, etc.)
export const getRelatedWorks = unstable_cache(
  async (workId: string, limit: number = 6): Promise<WorkListItem[]> => {
    try {
      const work = await prisma.work.findUnique({
        where: { id: workId },
        select: {
          composerId: true,
          instrumentId: true,
        },
      });

      if (!work) return [];

      const relatedWorks = await prisma.work.findMany({
        where: {
          AND: [
            { id: { not: workId } },
            {
              OR: [
                { composerId: work.composerId },
                ...(work.instrumentId
                  ? [{ instrumentId: work.instrumentId }]
                  : []),
              ],
            },
          ],
        },
        select: {
          id: true,
          title: true,
          opOrCatalog: true,
          subtitle: true,
          compositionYear: true,
          tone: true,
          mediaDuration: true,
          workType: true,
          instrumentId: true,
          composer: {
            select: {
              id: true,
              name: true,
              epochName: true,
            },
          },
        },
        orderBy: {
          title: 'asc',
        },
        take: limit,
      });

      const instrumentIds = [
        ...new Set(relatedWorks.map((w) => w.instrumentId).filter(Boolean)),
      ];
      const [instruments] = await Promise.all([
        instrumentIds.length > 0
          ? prisma.instrument.findMany({
              where: { id: { in: instrumentIds } },
              select: { id: true, name: true },
            })
          : [],
      ]);

      // Criar mapas para lookup rápido
      const instrumentMap = new Map(instruments.map((i) => [i.id, i]));

      return relatedWorks.map((work) => ({
        id: work.id,
        title: work.title,
        opOrCatalog: work.opOrCatalog || undefined,
        compositionYear: work.compositionYear || undefined,
        tone: work.tone || undefined,
        mediaDuration: work.mediaDuration || undefined,
        workType: work.workType,
        composer: work.composer,
        instrument: work.instrumentId
          ? instrumentMap.get(work.instrumentId) || null
          : null,
      }));
    } catch (error) {
      console.error('Erro ao buscar obras relacionadas:', error);
      return [];
    }
  },
  ['related-works'],
  {
    revalidate: 3600,
    tags: ['related-works'],
  }
);

// 🆕 Função para buscar estatísticas de mídia da obra
export const getWorkMediaStats = unstable_cache(
  async (workId: string) => {
    try {
      const work = await prisma.work.findUnique({
        where: { id: workId },
        select: {
          spotifyTrackId: true,
          spotifyDuration: true,
          spotifyThumbnail: true,
          youtubeVideoId: true,
          customAudioFile: true,
          customAudioUrl: true, // 🆕 Incluir URL customizada
          customAudioSource: true, // 🆕 Incluir fonte
          mediaSource: true,
          lastMediaSearch: true,
        },
      });

      if (!work) return null;

      return {
        hasSpotify: !!work.spotifyTrackId,
        hasYoutube: !!work.youtubeVideoId,
        hasCustomAudio: !!(work.customAudioFile || work.customAudioUrl),
        hasThumbnail: !!work.spotifyThumbnail,
        audioSource: work.customAudioSource, // 🆕 Incluir fonte do áudio
        mediaSource: work.mediaSource,
        lastSearched: work.lastMediaSearch,
        completeness: calculateMediaCompleteness(work),
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de mídia:', error);
      return null;
    }
  },
  ['work-media-stats'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['work-media-stats'],
  }
);

// 🆕 Função para calcular completude da mídia
function calculateMediaCompleteness(work: any): number {
  let score = 0;
  let maxScore = 0;

  // Spotify (40 pontos máximo)
  maxScore += 40;
  if (work.spotifyTrackId) {
    score += 20; // Track ID
    if (work.spotifyDuration) score += 5; // Duração
    if (work.spotifyThumbnail) score += 10; // Thumbnail
    if (work.spotifyDisplayTitle) score += 5; // Display title
  }

  // YouTube (30 pontos máximo)
  maxScore += 30;
  if (work.youtubeVideoId) {
    score += 30;
  }

  // Áudio customizado (30 pontos máximo)
  maxScore += 30;
  if (work.customAudioFile || work.customAudioUrl) {
    score += 30;
  }

  return Math.round((score / maxScore) * 100);
}

// Função para invalidar cache
export async function revalidateWorkCache(workId?: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('works-list');
  revalidateTag('work-basic-data');
  revalidateTag('related-works');
  revalidateTag('work-media-stats'); // 🆕
  revalidateTag('instruments-list');
  if (workId) {
    revalidateTag(`work-${workId}`);
  }
}
