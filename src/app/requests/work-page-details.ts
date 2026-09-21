// app/requests/work-page-details.ts — página da obra, pela API (Etapa 3)
import { ApiError, apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';

/** O mesmo formato do `JsonValue` do Prisma, sem depender dele. */
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

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
  instrumentation?: string;
  workType: string;
  movementNumber?: number;
  createdAt: Date;
  isVerified: boolean;
  createdBy?: string | null;
  parentWorkId?: string | null;

  parentWork?: {
    id: string;
    title: string;
    composer: {
      id: string;
      name: string;
      fullName: string;
    };
  } | null;

  childWorks?: Array<{
    id: string;
    title: string;
    subtitle?: string | null;
  }>;

  spotifyTrackId?: string | null;
  spotifyTrackUrl?: string | null;
  spotifyDisplayTitle?: string | null; // "Composer - Interpreter"
  spotifyDuration?: number | null; // em ms
  spotifyArtists?: JsonValue | null;
  spotifyThumbnail?: string | null;

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
  customAudioSource?: string | null;

  mediaSource?: string | null; // "auto", "manual", "none"
  lastMediaSearch?: Date | null;
  mediaSearchError?: string | null;

  difficultyLevel?: string | null;

  composer: {
    id: string;
    name: string;
    fullName: string;
    epochName: string | null;
    portraitUrl?: string | null;
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

type WorkDetailDto = ApiSchema<'WorkDetailDto'>;

/**
 * Cache do `fetch` do Next: a página da obra é a mesma para todos (anotações e
 * favoritos vêm à parte, no navegador). A API avisa pela tag `works` quando a
 * obra muda — edição, mídia nova, partitura.
 */
const WORK_CACHE = { revalidate: 7200, tags: ['works'] };

/** A obra, ou `null` se ela não existe (a página responde "não encontrada"). */
export async function getWorkById(workId: string): Promise<WorkDetails | null> {
  try {
    const work = await apiFetch<WorkDetailDto>(
      `/works/${encodeURIComponent(workId)}`,
      { next: WORK_CACHE }
    );
    return toWorkDetails(work);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 400)
    ) {
      return null;
    }
    throw error;
  }
}

/**
 * Resumo de mídia da obra. Sai do mesmo detalhe de `getWorkById` — o `fetch`
 * do Next deduplica a chamada na mesma renderização.
 */
export async function getWorkMediaStats(workId: string) {
  const work = await getWorkById(workId);

  if (!work) return null;

  return {
    hasSpotify: !!work.spotifyTrackId,
    hasYoutube: !!work.youtubeVideoId,
    hasCustomAudio: !!(work.customAudioFile || work.customAudioUrl),
    hasThumbnail: !!work.spotifyThumbnail,
    audioSource: work.customAudioSource,
    mediaSource: work.mediaSource,
    lastSearched: work.lastMediaSearch,
    completeness: calculateMediaCompleteness(work),
  };
}

/** Limpa o cache das páginas de obra (usado por rota de envio do legado). */
export async function revalidateWorkCache(workId?: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('works');
  if (workId) {
    revalidateTag(`work-${workId}`);
  }
}

function toWorkDetails(work: WorkDetailDto): WorkDetails {
  return {
    id: work.id,
    title: work.title,
    subtitle: work.subtitle,
    opOrCatalog: work.opOrCatalog || undefined,
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
    instrumentation: work.instrumentation || undefined,
    workType: work.workType,
    movementNumber: work.movementNumber || undefined,
    createdAt: new Date(work.createdAt),
    isVerified: work.isVerified,
    createdBy: work.createdBy,
    parentWorkId: work.parentWorkId,
    parentWork: work.parentWork ?? null,
    childWorks: work.childWorks,

    spotifyTrackId: work.spotifyTrackId,
    spotifyTrackUrl: work.spotifyTrackUrl,
    spotifyDisplayTitle: work.spotifyDisplayTitle,
    spotifyDuration: work.spotifyDuration,
    spotifyArtists: (work.spotifyArtists ?? null) as JsonValue | null,
    spotifyThumbnail: work.spotifyThumbnail,

    youtubeVideoId: work.youtubeVideoId,
    youtubeVideoUrl: work.youtubeVideoUrl,
    youtubeTitle: work.youtubeTitle,

    videoAulaUrl: work.videoAulaUrl,
    videoAulaFile: work.videoAulaFile,
    videoAulaMetadata: (work.videoAulaMetadata ?? null) as JsonValue | null,
    videoAulaSource: work.videoAulaSource,
    videoAulaTitle: work.videoAulaTitle,
    videoAulaType: work.videoAulaType,
    videoAulaAddedAt: toDate(work.videoAulaAddedAt),
    videoAulaAddedBy: work.videoAulaAddedBy,

    customAudioUrl: work.customAudioUrl,
    customAudioFile: work.customAudioFile,
    customAudioMetadata: (work.customAudioMetadata ?? null) as JsonValue | null,
    customAudioSource: work.customAudioSource,

    mediaSource: work.mediaSource,
    lastMediaSearch: toDate(work.lastMediaSearch),
    mediaSearchError: work.mediaSearchError,
    difficultyLevel: work.difficultyLevel,

    composer: {
      id: work.composer.id,
      name: work.composer.name,
      fullName: work.composer.fullName,
      epochName: work.composer.epochName ?? null,
      portraitUrl: work.composer.portraitUrl,
    },
    instrument: work.instrument ?? null,
    epoch: work.epoch ?? null,
    categoryNames: work.categoryNames,
    workGenresArr: work.workGenresArr,
  };
}

function toDate(value?: string | null): Date | null {
  return value ? new Date(value) : null;
}

function calculateMediaCompleteness(work: WorkDetails): number {
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
