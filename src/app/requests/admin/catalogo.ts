/**
 * Catálogo no painel redesenhado: obras, compositores e partituras, no
 * formato em que a API responde (`/admin/works`, `/admin/composers`,
 * `/admin/scores`).
 *
 * O `catalog.ts` ao lado traduzia para as telas antigas e perdia campos no
 * caminho — a lista de obras chegava sem `isVerified`, que a API sempre
 * mandou, e a tela não tinha como mostrar nem filtrar o que é verificado.
 */
import { apiFetch } from '@/app/libs/api/client';

const noStore = { cache: 'no-store' as const };

interface Paginacao {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Obras
// ---------------------------------------------------------------------------

export interface Obra {
  id: string;
  title: string;
  subtitle: string | null;
  opOrCatalog: string | null;
  workType: string;
  difficultyLevel: string | null;
  instrumentation: string | null;
  videoUrl: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  annotationsCount: number;
  isCustom?: boolean;
  createdAt: string;
  composer: { id: string; name: string } | null;
  epoch: { id: string; name: string } | null;
  instrument: { id: string; name: string } | null;
  counts?: {
    favorites: number;
    learned: number;
    wantToLearn: number;
    scores: number;
  };
}

export interface FiltrosObras {
  search?: string;
  isVerified?: boolean;
  epochId?: string;
  workType?: string;
  composerId?: string;
  instrumentId?: string;
  minScores?: number;
  minFavorites?: number;
  maxFavorites?: number;
  minWantToLearn?: number;
  maxWantToLearn?: number;
  minLearned?: number;
  maxLearned?: number;
  hasScore?: boolean;
  hasVideo?: boolean;
  isCustom?: boolean;
  hasTone?: boolean;
  hasYear?: boolean;
  hasInstrumentation?: boolean;
  hasMedia?: boolean;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: 'title' | 'createdAt';
}

export const getObras = (f: FiltrosObras, page: number) =>
  apiFetch<{
    works: Obra[];
    pagination: Paginacao;
    coverage?: { countFilterCapped: boolean };
  }>('/admin/works', {
    ...noStore,
    query: {
      page,
      limit: 25,
      search: f.search?.trim() || undefined,
      isVerified: f.isVerified,
      epochId: f.epochId || undefined,
      workType: f.workType || undefined,
      composerId: f.composerId || undefined,
      instrumentId: f.instrumentId || undefined,
      // A API aceita mínimo a partir de 1; zero é o mesmo que sem mínimo.
      minScores: f.minScores || undefined,
      minFavorites: f.minFavorites || undefined,
      maxFavorites: f.maxFavorites,
      minWantToLearn: f.minWantToLearn || undefined,
      maxWantToLearn: f.maxWantToLearn,
      minLearned: f.minLearned || undefined,
      maxLearned: f.maxLearned,
      hasScore: f.hasScore,
      hasVideo: f.hasVideo,
      isCustom: f.isCustom,
      hasTone: f.hasTone,
      hasYear: f.hasYear,
      hasInstrumentation: f.hasInstrumentation,
      hasMedia: f.hasMedia,
      createdFrom: f.createdFrom,
      createdTo: f.createdTo,
      sortBy: f.sortBy,
      sortOrder: f.sortBy === 'title' ? 'asc' : 'desc',
    },
  });

export interface ContagemPorEpoca {
  id: string;
  nome: string;
  n: number;
}

/** `mes` é AAAA-MM, no fuso de São Paulo; meses vazios vêm com zero. */
export interface ContagemPorMes {
  mes: string;
  n: number;
}

export interface ResumoObras {
  total: number;
  verificadas: number;
  comunidade: number;
  novas30: number;
  comVideo: number;
  comPartitura: number;
  semPartitura: number;
  porTipo: Record<string, number>;
  maisFavoritadas: RankingObra[];
  maisQueridas: RankingObra[];
  maisAprendidas: RankingObra[];
  /** Vêm vazios de API antiga. */
  porEpoca?: ContagemPorEpoca[];
  novasPorMes?: ContagemPorMes[];
}

export interface RankingObra {
  id: string;
  title: string;
  composer: string | null;
  n: number;
}

export const getResumoObras = () =>
  apiFetch<ResumoObras>('/admin/works/overview', noStore);

export interface DetalheObra {
  id: string;
  imslpPermlink: string | null;
  youtubeVideoUrl: string | null;
  instrumentation: string | null;
  compositionYear: string | null;
  createdBy: { id: string; name: string } | null;
  counts: {
    favorites: number;
    learned: number;
    wantToLearn: number;
    scores: number;
    annotations: number;
  };
  scores: {
    id: string;
    title: string;
    type: string;
    isActive: boolean;
    downloadUrl: string | null;
  }[];
}

export const getDetalheObra = (id: string) =>
  apiFetch<DetalheObra>(`/admin/works/${id}/summary`, noStore);

export interface EdicaoObra {
  title?: string;
  difficultyLevel?: string | null;
  workType?: string;
  videoUrl?: string | null;
  instrumentation?: string;
  isVerified?: boolean;
}

export const atualizarObra = (id: string, dados: EdicaoObra) =>
  apiFetch<Obra>(`/admin/works/${id}`, { method: 'PATCH', body: dados });

export const apagarObra = (id: string) =>
  apiFetch(`/admin/works/${id}`, { method: 'DELETE' });

export const verificarObras = (ids: string[], isVerified: boolean) =>
  apiFetch<{ updated: number; notFound: string[] }>(
    '/admin/works/verify-bulk',
    {
      method: 'POST',
      body: { workIds: ids, isVerified },
    }
  );

// ---------------------------------------------------------------------------
// Compositores
// ---------------------------------------------------------------------------

export interface Compositor {
  id: string;
  name: string;
  fullName: string | null;
  portraitUrl: string | null;
  epochName: string | null;
  epochId: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  verificationNotes: string | null;
  dataQuality: 'high' | 'medium' | 'low' | null;
  nationality?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  isCustom?: boolean;
  worksCount?: number;
  createdAt: string;
}

export interface FiltrosCompositores {
  search?: string;
  isVerified?: boolean;
  dataQuality?: string;
  epochId?: string;
  minWorks?: number;
  maxWorks?: number;
  hasBio?: boolean;
  hasBioEn?: boolean;
  hasPortrait?: boolean;
  hasDates?: boolean;
  isCustom?: boolean;
  nationality?: string;
  hasNationality?: boolean;
  hasBirthYear?: boolean;
  epochMismatch?: boolean;
  suspect?: boolean;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: 'name' | 'createdAt' | 'birthYear';
}

export const getCompositores = (f: FiltrosCompositores, page: number) =>
  apiFetch<{ composers: Compositor[]; pagination: Paginacao }>(
    '/admin/composers',
    {
      ...noStore,
      query: {
        page,
        limit: 25,
        search: f.search?.trim() || undefined,
        isVerified: f.isVerified,
        dataQuality: f.dataQuality || undefined,
        epochId: f.epochId || undefined,
        minWorks: f.minWorks,
        maxWorks: f.maxWorks,
        hasBio: f.hasBio,
        hasBioEn: f.hasBioEn,
        hasPortrait: f.hasPortrait,
        hasDates: f.hasDates,
        isCustom: f.isCustom,
        nationality: f.nationality?.trim() || undefined,
        hasNationality: f.hasNationality,
        hasBirthYear: f.hasBirthYear,
        epochMismatch: f.epochMismatch,
        suspect: f.suspect,
        createdFrom: f.createdFrom,
        createdTo: f.createdTo,
        sortBy: f.sortBy,
        sortOrder: f.sortBy === 'name' ? 'asc' : 'desc',
      },
    }
  );

export interface ResumoCompositores {
  total: number;
  verificados: number;
  comBio: number;
  comBioEn: number;
  comRetrato: number;
  comDatas: number;
  comunidade: number;
  novos30: number;
  semObras: number;
  porQualidade: Record<string, number>;
  maisObras: { id: string; name: string; works: number }[];
  porEpoca?: ContagemPorEpoca[];
  porNacionalidade?: { nome: string; n: number }[];
  novosPorMes?: ContagemPorMes[];
}

export const getResumoCompositores = () =>
  apiFetch<ResumoCompositores>('/admin/composers/overview', noStore);

export interface DetalheCompositor {
  id: string;
  bio: string | null;
  bioEn: string | null;
  bioLength: number;
  bioEnLength: number;
  /** Lista, texto ou nulo, conforme a origem do cadastro. */
  alternativeNames: string[] | string | null;
  wikipediaLink: string | null;
  permLinkImslp: string | null;
  dataSource: string | null;
  dataCompleteness: number | null;
  createdBy: { id: string; name: string } | null;
  counts: {
    works: number;
    verifiedWorks: number;
    scores: number;
    favoritos: number;
    aprendidas: number;
    querem: number;
  };
  topWorks: {
    id: string;
    title: string;
    isVerified: boolean;
    favorites: number;
    scores: number;
  }[];
  /** "Por onde começar" escolhido pela equipe, em ordem. */
  startingWorks: ObraEscolhida[];
}

export interface ObraEscolhida {
  id: string;
  title: string;
  opOrCatalog: string | null;
}

/** Até três obras do compositor; lista vazia volta tudo ao automático. */
export const definirPorOndeComecar = (id: string, workIds: string[]) =>
  apiFetch<ObraEscolhida[]>(`/admin/composers/${id}/starting-works`, {
    method: 'PUT',
    body: { workIds },
  });

export const getDetalheCompositor = (id: string) =>
  apiFetch<DetalheCompositor>(`/admin/composers/${id}/summary`, noStore);

export const atualizarCompositor = (
  id: string,
  dados: {
    isVerified?: boolean;
    verificationNotes?: string;
    dataQuality?: string;
  }
) =>
  apiFetch<Compositor>(`/admin/composers/${id}`, {
    method: 'PATCH',
    body: dados,
  });

export const apagarCompositor = (id: string) =>
  apiFetch(`/admin/composers/${id}`, { method: 'DELETE' });

export const verificarCompositores = (
  ids: string[],
  isVerified: boolean,
  notes?: string
) =>
  apiFetch<{ updated: number; notFound: string[] }>(
    '/admin/composers/verify-bulk',
    {
      method: 'POST',
      body: { composerIds: ids, isVerified, notes: notes?.trim() || undefined },
    }
  );

// ---------------------------------------------------------------------------
// Partituras
// ---------------------------------------------------------------------------

export interface Partitura {
  id: string;
  title: string;
  type: string;
  source: 'IMSLP' | 'CUSTOM' | 'UPLOAD';
  isActive: boolean;
  downloadUrl: string | null;
  createdAt: string;
  /** Downloads feitos pelo botão do site. */
  siteDownloads?: number;
  lastDownloadedAt?: string | null;
  work: {
    id: string;
    title: string;
    composer: { id: string; name: string } | null;
  } | null;
}

export interface FiltrosPartituras {
  sortBy?: 'createdAt' | 'siteDownloads';
  downloaded?: boolean;
  search?: string;
  isActive?: boolean;
  workId?: string;
  composerId?: string;
  type?: string;
  source?: string;
  hasFile?: boolean;
  createdFrom?: string;
  createdTo?: string;
}

export const getPartituras = (f: FiltrosPartituras, page: number) =>
  apiFetch<{ scores: Partitura[]; pagination: Paginacao }>('/admin/scores', {
    ...noStore,
    query: {
      page,
      limit: 25,
      search: f.search?.trim() || undefined,
      isActive: f.isActive,
      workId: f.workId || undefined,
      composerId: f.composerId || undefined,
      type: f.type || undefined,
      source: f.source || undefined,
      hasFile: f.hasFile,
      downloaded: f.downloaded,
      sortBy: f.sortBy,
      createdFrom: f.createdFrom,
      createdTo: f.createdTo,
    },
  });

export interface ResumoPartituras {
  total: number;
  ativas: number;
  inativas: number;
  novas30: number;
  obrasComPartitura: number;
  favoritadas: number;
  /** As dez partituras com mais favoritos (vem vazia de API antiga). */
  novasPorMes?: ContagemPorMes[];
  maisFavoritadas?: {
    id: string;
    titulo: string;
    obra: string | null;
    compositor: string | null;
    favoritos: number;
  }[];
  porTipo: Record<string, number>;
  porOrigem: Record<string, number>;
}

export const getResumoPartituras = () =>
  apiFetch<ResumoPartituras>('/admin/scores/overview', noStore);

/**
 * Remove a partitura. Pela rota de envios: ela apaga o arquivo no
 * armazenamento, registra no histórico de envios e, sendo o admin, na
 * auditoria.
 */
export const apagarPartitura = (id: string) =>
  apiFetch(`/uploads/score/${id}`, { method: 'DELETE' });

export const atualizarPartitura = (
  id: string,
  dados: { title?: string; isActive?: boolean }
) =>
  apiFetch<Partitura>(`/admin/scores/${id}`, { method: 'PATCH', body: dados });

// ---------------------------------------------------------------------------
// Apoio
// ---------------------------------------------------------------------------

export const getEpocas = () =>
  apiFetch<{ id: string; name: string }[]>('/epochs', {
    next: { revalidate: 3600 },
  });

/** Épocas, instrumentos e papéis — as listas dos formulários de cadastro. */
export const getListasDeCadastro = () =>
  apiFetch<{
    epochs: { id: string; name: string }[];
    instruments: { id: string; name: string }[];
    roles: { id: string; name: string }[];
  }>('/uploads/form-data', { next: { revalidate: 3600 } });

export const TIPOS_DE_OBRA: Record<string, string> = {
  INDIVIDUAL: 'Obra individual',
  COMPLETE_WORK: 'Obra completa',
  ARRANGEMENT: 'Arranjo',
  COLLECTION: 'Coleção',
  COLLABORATION: 'Colaboração',
  COMPOSITION: 'Composição',
  COLLECTED_WORKS: 'Obras reunidas',
  COLLECTIONS_WITH: 'Coletânea',
};

export const TIPOS_DE_PARTITURA: Record<string, string> = {
  SCORES: 'Partitura',
  PARTS: 'Partes',
  ARRANGEMENTS: 'Arranjo',
  LIBRETTOS: 'Libreto',
  OTHERS: 'Outro',
  SOURCES: 'Fonte',
};

export const ORIGENS: Record<string, string> = {
  IMSLP: 'IMSLP',
  CUSTOM: 'Link externo',
  UPLOAD: 'Envio',
};

export const QUALIDADES: Record<string, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

// ---------------------------------------------------------------------------
// Envios da comunidade
// ---------------------------------------------------------------------------

export interface Envio {
  id: string;
  entityType: 'composer' | 'work' | 'score';
  entityId: string;
  action: 'create' | 'update' | 'delete' | string;
  reason: string | null;
  changes: unknown;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
  } | null;
  entity: Record<string, unknown> | null;
  entityExists: boolean;
}

export interface FiltrosEnvios {
  entityType?: string;
  action?: string;
  userId?: string;
  from?: string | null;
  to?: string | null;
}

export const getEnvios = (f: FiltrosEnvios, cursor?: string) =>
  apiFetch<{
    entries: Envio[];
    pagination: { total: number | null; nextCursor: string | null };
  }>('/admin/uploads', {
    ...noStore,
    query: {
      cursor,
      limit: 30,
      entityType: f.entityType || undefined,
      action: f.action || undefined,
      userId: f.userId || undefined,
      from: f.from || undefined,
      to: f.to || undefined,
    },
  });

export interface EstatisticasEnvios {
  janela: { de: string | null; ate: string; passo: 'dia' | 'semana' | 'mes' };
  total: number;
  totalGeral: number;
  byAction: Record<string, number>;
  byEntityType: Record<string, number>;
  contribuintes: number;
  contribuintesNovos: number | null;
  mediaPorContribuinte: number | null;
  topContribuintes: {
    userId: string;
    name: string | null;
    image: string | null;
    contributions: number;
  }[];
  maisEditados: {
    entityType: string;
    entityId: string;
    nome: string | null;
    edicoes: number;
  }[];
  linhaDoTempoCortada: boolean;
  timeline: {
    date: string;
    total: number;
    creates: number;
    updates: number;
    deletes: number;
  }[];
}

export const getEstatisticasEnvios = (janela: {
  de: string | null;
  ate: string | null;
}) =>
  apiFetch<EstatisticasEnvios>('/admin/uploads/stats', {
    ...noStore,
    query: { from: janela.de || undefined, to: janela.ate || undefined },
  });

// ---------------------------------------------------------------------------
// Busca para os filtros "por compositor" e "por obra"
// ---------------------------------------------------------------------------

export const buscarCompositores = async (termo: string) => {
  const r = await getCompositores({ search: termo, sortBy: 'name' }, 1);
  return r.composers.map((c) => ({
    id: c.id,
    rotulo: c.name,
    detalhe: [c.fullName !== c.name ? c.fullName : null, c.epochName]
      .filter(Boolean)
      .join(' · '),
  }));
};

export const buscarObras = async (termo: string) => {
  const r = await getObras({ search: termo, sortBy: 'title' }, 1);
  return r.works.map((o) => ({
    id: o.id,
    rotulo: o.title,
    detalhe: [o.composer?.name, o.opOrCatalog].filter(Boolean).join(' · '),
  }));
};

/**
 * O cadastro inteiro, no formato dos formulários de envio (os mesmos da
 * comunidade): o painel reusa os formulários para criar e editar.
 */
export const getCadastro = (tipo: 'composer' | 'work' | 'score', id: string) =>
  apiFetch<Record<string, unknown>>(`/uploads/${tipo}/${id}`, noStore);

// ---------------------------------------------------------------------------
// Um registro por id (para abrir de qualquer tela) e quem usa uma obra
// ---------------------------------------------------------------------------

export const getCompositor = (id: string) =>
  apiFetch<Compositor>(`/admin/composers/${id}`, noStore);
export const getObra = (id: string) =>
  apiFetch<Obra>(`/admin/works/${id}`, noStore);
export const getPartitura = (id: string) =>
  apiFetch<Partitura>(`/admin/scores/${id}`, noStore);

export type UsoDaObra = 'favoritos' | 'quero-aprender' | 'aprendidas';

export interface PessoaDaObra {
  id: string;
  em: string | null;
  detalhe: string | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

export const getPessoasDaObra = (id: string, kind: UsoDaObra, page = 1) =>
  apiFetch<{
    items: PessoaDaObra[];
    pagination: { page: number; total: number; totalPages: number };
  }>(`/admin/works/${id}/people`, { ...noStore, query: { kind, page } });

/** Partitura completa, no formato da rota de envios (com obra e compositor). */
export interface PartituraCompleta {
  id: string;
  workId: string;
  title: string;
  type?: string;
  source: string;
  downloadUrl: string | null;
  thumbnailUrl: string | null;
  publisher: string | null;
  editor: string | null;
  copyright: string | null;
  pageCount: number | string | null;
  fileSize: number | string | null;
  fileFormat?: string | null;
  notes?: string | null;
  groupTitle: string | null;
  uploadedBy: string | null;
  isActive: boolean;
  createdAt: string;
  work?: {
    id: string;
    title: string;
    composer: { id?: string; name: string; fullName: string | null };
    epoch?: { name: string };
    instrument?: { name: string };
  };
}

export const getPartituraCompleta = (id: string) =>
  apiFetch<PartituraCompleta>(`/uploads/score/${id}`, noStore);

export const salvarPartitura = (id: string, dados: Record<string, unknown>) =>
  apiFetch(`/uploads/score/${id}`, { method: 'PATCH', body: dados });
