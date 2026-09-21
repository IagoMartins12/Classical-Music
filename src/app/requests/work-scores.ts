/**
 * Partituras de uma obra (`GET /works/:id/scores`) no formato da rota
 * `work-scores` do legado: a lista (`workScores`, com a paginação por tipo) ou
 * uma só por `sourceId` (`found` e `workScore`; a API conta o acesso).
 */
import { apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';

type WorkScores = ApiSchema<'WorkScoresResponseDto'>;

function bucketOf(score: { source: string; type: string }) {
  if (score.source === 'UPLOAD' || score.source === 'CUSTOM') {
    return 'uploads';
  }

  const type = score.type.toLowerCase();
  if (type.includes('score')) return 'scores';
  if (type.includes('part')) return 'parts';
  if (type.includes('arrangement')) return 'arrangements';
  if (type.includes('libretto')) return 'librettos';
  return 'others';
}

// As telas leem a resposta como o `json()` do legado, sem tipo.

export async function workScoresRequest(params: URLSearchParams): Promise<any> {
  const { workId, ...query } = Object.fromEntries(params);
  const data = await apiFetch<WorkScores>(`/works/${workId}/scores`, {
    query,
  });

  // Mesmos baldes de `totalByType` (a API classifica assim; `UPLOAD` e
  // `CUSTOM` vão para "uploads", seja qual for o tipo).
  const loadedByType: Record<string, number> = {};
  for (const score of data.scores) {
    const bucket = bucketOf(score);
    loadedByType[bucket] = (loadedByType[bucket] ?? 0) + 1;
  }

  return {
    success: true,
    found: data.scores.length > 0,
    workScore: data.scores[0] ?? null,
    workScores: data.scores,
    total: data.total,
    hasMore: data.hasMore,
    totalByType: data.totalByType ?? {},
    pagination: {
      offset: Number(query.offset ?? 0),
      totalByType: data.totalByType ?? {},
      loadedByType,
    },
  };
}
