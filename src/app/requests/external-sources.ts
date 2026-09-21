// app/requests/external-sources.ts — fichas do IMSLP e da Wikipedia, pela API
//
// Os modais de envio preenchem compositor e obra pelo link. No legado era uma
// rota só (`/api/uploads/external-sources/scraper`, sem autenticação) e outra
// para obra (`/api/uploads/work/scraper`); na API são rotas por fonte, com
// login — abertas a quem contribui (decisão de 15/09). Descobrir e importar
// obras em lote segue só administrador.
import { apiFetch } from '@/app/libs/api/client';

export type ComposerSource = 'imslp' | 'wikipedia';

interface Candidate {
  id: string;
  name: string;
}

export interface ScrapedComposerPage {
  name: string;
  fullName: string;
  alternativeNames?: string | null;
  birthDate: string | null;
  deathDate: string | null;
  portraitUrl: string | null;
  bio: string | null;
  imslpId?: string;
  wikipediaLink: string | null;
  nationality: string | null;
  instruments?: string | null;
  imslpCategories?: string | null;
  primaryRole?: string | null;
  roles?: string | null;
  epochName: string;
  dataCompleteness: number;
  pageQuality?: string;
  hasValidImage?: boolean;
  composerId: string | null;
  composerCandidates: Candidate[];
}

/** A ficha do compositor no formato que o modal lia do legado. */
export async function scrapeComposerPage(url: string, source: ComposerSource) {
  const page = await apiFetch<ScrapedComposerPage>(
    `/${source}/composers/scrape`,
    { method: 'POST', body: { url } }
  );

  return {
    ...page,
    // O legado devolvia o link do IMSLP que foi lido; a API devolve o id.
    permLinkImslp: source === 'imslp' ? url : undefined,
    imslpId: page.imslpId ?? undefined,
  };
}

export interface ScrapedWorkPage {
  title: string;
  subtitle: string | null;
  imslpPermlink: string;
  imslpId: string;
  composerName: string | null;
  composerPermLink: string | null;
  composerId: string | null;
  composerCandidates: Candidate[];
  opOrCatalog: string | null;
  compositionYear: string | null;
  firstPublishDate: string | null;
  tone: string | null;
  tempoMarking: string | null;
  mediaDuration: string | null;
  workStyle: string | null;
  moviment: string | null;
  instrumentation: string | null;
  dedicateTo: string | null;
  categoryNames: string[];
  workGenresArr: string[];
  workType: string;
  primaryInstrument: string | null;
  movementNumber: number | null;
  imslpTags: string[];
  difficultyLevel: string;
  epochName: string | null;
  dataCompleteness: number;
  pageQuality: string;
}

export function scrapeWorkPage(url: string) {
  return apiFetch<ScrapedWorkPage>('/imslp/works/scrape', {
    method: 'POST',
    body: { url },
  });
}

export interface DiscoveredImslpWork {
  title: string;
  imslpId: string;
  imslpUrl: string;
  alreadyImported: boolean;
}

/** As obras que a página do compositor anuncia no IMSLP (administrador). */
export function discoverComposerWorks(composerId: string) {
  return apiFetch<{
    works: DiscoveredImslpWork[];
    found: number;
    existing: number;
    truncated: boolean;
  }>(`/imslp/composers/${composerId}/works`, { cache: 'no-store' });
}

export interface ImportOutcome {
  imslpUrl: string;
  title: string;
  status: 'imported' | 'duplicate' | 'failed';
  workId?: string;
  reason?: string;
}

/** Importa obras do IMSLP (administrador; até 100 por chamada). */
export function importComposerWorks(composerId: string, urls: string[]) {
  return apiFetch<{
    outcomes: ImportOutcome[];
    imported: number;
    duplicates: number;
    failed: number;
  }>(`/imslp/composers/${composerId}/works/import`, {
    method: 'POST',
    body: { urls },
  });
}
