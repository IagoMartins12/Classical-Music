/**
 * A work's scores from every source (`GET /works/:id/scores`), organized the
 * way IMSLP presents them:
 *
 * - **Shelf** = the kind (scores, parts, arrangements…), one tab each.
 * - **Section** = the `groupTitle` ("Complete score", "For guitar (Tárrega)").
 *   Community uploads get a section of their own on every shelf.
 * - **Edition** = one `groupIndex`: the files that came out together (the
 *   full score and its parts, or the separate numbers).
 */
import { apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';
import { scoreSource } from '@/app/conteudo/site/scoreSources';

export type ScoreFile = ApiSchema<'WorkScoreItemDto'>;
export type ImslpStatus = ApiSchema<'ImslpScoresStatusDto'>['status'];

export const SCORE_KINDS = [
  'scores',
  'parts',
  'arrangements',
  'librettos',
  'others',
  'sources',
] as const;
export type ScoreKind = (typeof SCORE_KINDS)[number];

export interface ScoreEdition {
  key: string;
  source: string;
  publisher: string | null;
  editor: string | null;
  files: ScoreFile[];
}

export interface ScoreSection {
  /** `null`: the community section, or IMSLP files with no group title. */
  title: string | null;
  community: boolean;
  editions: ScoreEdition[];
}

export interface ScoreShelf {
  kind: ScoreKind;
  sections: ScoreSection[];
  editions: number;
}

/**
 * `none`: the work truly has no score · `unavailable`: the source could not
 * be read now (down, queue full, timed out) · `error`: our own request
 * failed. Each one tells the visitor something different.
 */
export type LibraryStatus = ImslpStatus | 'error';

export interface ScoreLibrary {
  status: LibraryStatus;
  shelves: ScoreShelf[];
}

type ScoresResponse = ApiSchema<'WorkScoresResponseDto'>;

const POLL_MS = 2_500;
const POLL_LIMIT_MS = 60_000;

const kindOf = (type: string): ScoreKind => {
  const kind = type.toLowerCase() as ScoreKind;
  return SCORE_KINDS.includes(kind) ? kind : 'others';
};

/** Pure grouping, shared by the server render and the client refresh. */
export function organizeScores(response: ScoresResponse): ScoreLibrary {
  const shelves = new Map<ScoreKind, Map<string, ScoreSection>>();
  const order = new Map<string, number>();

  for (const file of response.scores) {
    const kind = kindOf(file.type);
    const community = scoreSource(file.source).community;
    const sectionKey = community ? '\u0000community' : (file.groupTitle ?? '');
    const sections = shelves.get(kind) ?? new Map<string, ScoreSection>();
    shelves.set(kind, sections);

    let section = sections.get(sectionKey);
    if (!section) {
      section = {
        title: community ? null : (file.groupTitle ?? null),
        community,
        editions: [],
      };
      sections.set(sectionKey, section);
    }
    const index = file.groupIndex ?? Number.MAX_SAFE_INTEGER;
    const at = `${kind}:${sectionKey}`;
    order.set(at, Math.min(order.get(at) ?? index, community ? -1 : index));

    // Uploads are one edition each; IMSLP files share their group's box.
    const editionKey =
      community || file.groupIndex == null
        ? `${file.source}:${file.id}`
        : `${file.source}:${file.groupIndex}`;
    let edition = section.editions.find((e) => e.key === editionKey);
    if (!edition) {
      edition = {
        key: editionKey,
        source: file.source,
        publisher: file.publisher ?? null,
        editor: file.editor ?? null,
        files: [],
      };
      section.editions.push(edition);
    }
    edition.publisher ??= file.publisher ?? null;
    edition.editor ??= file.editor ?? null;
    edition.files.push(file);
  }

  const groupIndex = (e: ScoreEdition) =>
    e.files[0].groupIndex ?? Number.MAX_SAFE_INTEGER;

  return {
    status:
      response.imslp?.status ?? (response.scores.length ? 'stored' : 'none'),
    shelves: SCORE_KINDS.filter((kind) => shelves.has(kind)).map((kind) => {
      const sections = [...shelves.get(kind)!.entries()]
        .sort(
          ([a], [b]) =>
            (order.get(`${kind}:${a}`) ?? 0) - (order.get(`${kind}:${b}`) ?? 0)
        )
        .map(([, section]) => ({
          ...section,
          editions: section.editions.sort(
            (a, b) => groupIndex(a) - groupIndex(b)
          ),
        }));
      return {
        kind,
        sections,
        editions: sections.reduce((n, s) => n + s.editions.length, 0),
      };
    }),
  };
}

const list = (
  workId: string,
  init: {
    signal?: AbortSignal;
    cache?: RequestCache;
    next?: { revalidate: number; tags: string[] };
  }
) =>
  apiFetch<ScoresResponse>(`/works/${encodeURIComponent(workId)}/scores`, {
    query: { limit: 1000 },
    ...init,
  });

/**
 * For the server render. Short revalidation: a work whose IMSLP read is
 * still queued renders "pending" and the browser takes over from there.
 */
export async function getWorkScoreLibrary(
  workId: string
): Promise<ScoreLibrary> {
  try {
    return organizeScores(
      await list(workId, { next: { revalidate: 300, tags: ['works'] } })
    );
  } catch {
    return { status: 'error', shelves: [] };
  }
}

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(id);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

/**
 * In the browser, while IMSLP is being read: ask for the cheap status until
 * the queue is done, then list again.
 */
export async function awaitWorkScoreLibrary(
  workId: string,
  signal: AbortSignal
): Promise<ScoreLibrary> {
  const deadline = Date.now() + POLL_LIMIT_MS;
  while (Date.now() < deadline) {
    await wait(POLL_MS, signal);
    const { status } = await apiFetch<{ status: ImslpStatus }>(
      `/works/${encodeURIComponent(workId)}/scores/imslp-status`,
      { signal }
    );
    if (status !== 'pending') {
      return organizeScores(await list(workId, { signal, cache: 'no-store' }));
    }
  }
  return { status: 'unavailable', shelves: [] };
}
