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

type ImslpStatus = 'stored' | 'pending' | 'none' | 'unavailable';
type ScoresResponse = ApiSchema<'WorkScoresResponseDto'> & {
  imslp?: { status: ImslpStatus };
};

/** De quanto em quanto tempo perguntar, e até quando esperar a fila. */
const INTERVALO_MS = 2_500;
const ESPERA_MAX_MS = 60_000;

const esperar = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(id);
      reject(new DOMException('Cancelado', 'AbortError'));
    });
  });

function listar(workId: string) {
  return apiFetch<ScoresResponse>(`/works/${workId}/scores`, {
    query: { source: 'IMSLP', limit: 1000 },
  });
}

/**
 * Obra cujas partituras ainda não foram lidas do IMSLP: a API enfileira a
 * leitura e responde `imslp.status = pending` na hora (ver
 * `ImslpScoresService` na API). Aqui se pergunta pela situação — rota barata —
 * até a fila terminar, e só então se lista de novo. `aoBuscar` avisa a tela,
 * que troca "carregando" por "buscando no IMSLP".
 */
async function listarEsperandoAFila(
  workId: string,
  opcoes: { aoBuscar?: () => void; signal?: AbortSignal }
): Promise<ScoresResponse> {
  const primeira = await listar(workId);
  if (primeira.imslp?.status !== 'pending') return primeira;

  opcoes.aoBuscar?.();
  const limite = Date.now() + ESPERA_MAX_MS;

  while (Date.now() < limite) {
    await esperar(INTERVALO_MS, opcoes.signal);
    const { status } = await apiFetch<{ status: ImslpStatus }>(
      `/works/${workId}/scores/imslp-status`
    );
    if (status !== 'pending') {
      return status === 'stored' ? listar(workId) : primeira;
    }
  }

  return primeira;
}

export async function fetchImslpScores(
  workId: string,
  opcoes: { aoBuscar?: () => void; signal?: AbortSignal } = {}
) {
  const data = await listarEsperandoAFila(workId, opcoes);

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
