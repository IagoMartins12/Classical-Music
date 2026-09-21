/**
 * Partituras do IMSLP de uma obra, no formato do hook incremental
 * (`scoresByType`, `loadedCounts`, `totalCounts`).
 *
 * O legado raspava o IMSLP em lotes pela rota `imslp-scores`, com cache em
 * segundo plano. A API lê o IMSLP de uma vez na primeira consulta
 * (`GET /works/:id/scores`) e guarda: aqui vem tudo numa chamada, agrupado por
 * tipo e por grupo. Não há mais "carregar mais" nem progresso de cache.
 */
import { apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';
import type {
  IMSLPScore,
  IMSLPScoreGroup,
  IMSLPWorkScoresIncremental,
} from '@/app/libs/imslp-score-scraper-incremental';

type ScoreItem = ApiSchema<'WorkScoreItemDto'>;

const TAB_TYPES = [
  'scores',
  'parts',
  'arrangements',
  'librettos',
  'others',
  'sources',
] as const;

type TabType = (typeof TAB_TYPES)[number];

function tabOf(type: string): TabType {
  const tab = type.toLowerCase() as TabType;

  return TAB_TYPES.includes(tab) ? tab : 'others';
}

function toImslpScore(score: ScoreItem): IMSLPScore {
  return {
    // A tela identifica a partitura pelo id do IMSLP (favoritos e "mais
    // favoritada" são por ele); o registro é achado por ele quando preciso.
    id: score.sourceId,
    title: score.title,
    downloadUrl: score.downloadUrl ?? '',
    fileSize: score.fileSize ?? '',
    pageCount: score.pageCount ?? '',
    fileFormat: score.fileFormat,
    editor: score.editor ?? undefined,
    publisher: score.publisher ?? undefined,
    thumbnailUrl: score.thumbnailUrl ?? undefined,
    type: tabOf(score.type),
    groupIndex: score.groupIndex ?? undefined,
  };
}

export async function fetchImslpScores(workId: string) {
  const data = await apiFetch<ApiSchema<'WorkScoresResponseDto'>>(
    `/works/${workId}/scores`,
    { query: { source: 'IMSLP', limit: 1000 } }
  );

  const scoresByType = Object.fromEntries(
    TAB_TYPES.map((tab) => [tab, [] as IMSLPScoreGroup[]])
  ) as unknown as IMSLPWorkScoresIncremental['scoresByType'];
  const counts = Object.fromEntries(
    TAB_TYPES.map((tab) => [tab, 0])
  ) as unknown as IMSLPWorkScoresIncremental['loadedCounts'];

  for (const item of data.scores) {
    const score = toImslpScore(item);
    const groups = scoresByType[score.type];
    const groupIndex = item.groupIndex ?? 0;
    let group = groups.find((existing) => existing.groupIndex === groupIndex);

    if (!group) {
      group = {
        groupIndex,
        groupTitle: item.groupTitle ?? undefined,
        scores: [],
      };
      groups.push(group);
    }

    group.scores.push(score);
    counts[score.type] += 1;
  }

  for (const tab of TAB_TYPES) {
    scoresByType[tab].sort((a, b) => a.groupIndex - b.groupIndex);
  }

  const result: IMSLPWorkScoresIncremental = {
    workTitle: '',
    scoresByType,
    totalCounts: { ...counts },
    loadedCounts: { ...counts },
    hasMore: false,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: data.scores.length,
    },
  };

  return {
    ...result,
    // Tudo veio de uma vez: para o hook, é o caso "tudo do cache".
    fromCache: true,
    backgroundCachingStarted: false,
    _metadata: { strategy: 'show-all-cached' },
  };
}
