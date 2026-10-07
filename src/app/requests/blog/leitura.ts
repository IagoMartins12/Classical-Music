// app/requests/blog/leitura.ts — o que as páginas públicas do blog leem
//
// O formato das telas novas: datas como texto ISO (passam para componente de
// cliente sem conversão), uma categoria principal já escolhida, e os textos
// já no idioma pedido (`idioma` nas opções): quando o artigo, a categoria ou
// a tag têm tradução para ele, ela entra no lugar do original; quando não
// têm, fica o original e `idiomaDoTexto` diz qual é. `articles.ts` continua
// servindo o painel.
import { ApiError, apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';
import type { Idioma } from '@/app/conteudo/blog';
import {
  BLOG_TAGS,
  blogRead,
  type BlogReadOptions as OpcoesDaApi,
} from './articles';

/** As opções da leitura, mais o idioma em que os textos devem vir. */
export type BlogReadOptions = OpcoesDaApi & { idioma?: Idioma };

// ---------------------------------------------------------------------------
// Formatos
// ---------------------------------------------------------------------------

export interface AutorRef {
  id: string;
  nome: string;
  usuario: string;
  imagem: string | null;
  bio: string | null;
}

export interface CategoriaRef {
  id: string;
  nome: string;
  slug: string;
  /** Fica no menu "Categorias" do cabeçalho (o chevron, ou a sublista no telefone). */
  noMenu?: boolean;
}

export interface TagRef {
  id: string;
  nome: string;
  slug: string;
}

export interface ResumoDeArtigo {
  id: string;
  slug: string;
  titulo: string;
  resumo: string | null;
  capa: string | null;
  capaAlt: string | null;
  publicadoEm: string | null;
  atualizadoEm: string;
  minutos: number;
  visitas: number;
  autor: AutorRef;
  categoria: CategoriaRef | null;
  categorias: CategoriaRef[];
  tags: TagRef[];
  curtidas: number;
  comentarios: number;
  destaque: boolean;
  ordemNoDestaque: number | null;
  /** O idioma em que o artigo foi escrito. */
  idiomaOriginal: Idioma;
  /** O idioma do texto que veio: o pedido, se há tradução; senão, o original. */
  idiomaDoTexto: Idioma;
  /** Existe nos dois idiomas. */
  temTraducao: boolean;
}

export interface CompositorCitado {
  id: string;
  nome: string;
  retrato: string | null;
  epoca: string | null;
  nascimento: string | null;
  morte: string | null;
}

export interface ObraCitada {
  id: string;
  titulo: string;
  catalogo: string | null;
  compositor: { id: string; nome: string };
  instrumento: string | null;
}

export interface PartituraCitada {
  id: string;
  titulo: string;
  arquivo: string | null;
  miniatura: string | null;
  obra: { id: string; titulo: string; compositor: string };
}

export interface MusicaDeFundo {
  url: string;
  titulo: string | null;
  /** 0 a 1. */
  volume: number;
  repetir: boolean;
  tipo: 'youtube' | 'arquivo';
}

export interface ArtigoCompleto extends ResumoDeArtigo {
  conteudo: unknown;
  status: string;
  creditoDaCapa: string | null;
  metaTitulo: string | null;
  metaDescricao: string | null;
  palavrasChave: string[];
  tipos: string[];
  narracao: string | null;
  musica: MusicaDeFundo | null;
  compositores: CompositorCitado[];
  obras: ObraCitada[];
  partituras: PartituraCitada[];
  relacionados: Array<{
    id: string;
    slug: string;
    titulo: string;
    resumo: string | null;
    capa: string | null;
    publicadoEm: string | null;
    minutos: number;
  }>;
}

export interface Paginacao {
  pagina: number;
  porPagina: number;
  total: number;
  paginas: number;
}

// ---------------------------------------------------------------------------
// Conversão do que a API manda
// ---------------------------------------------------------------------------

/** O campo traduzido, quando o pedido é o outro idioma e a tradução o tem. */
type Traducao = Record<string, unknown> | null | undefined;
const precisaTraduzir = (original: Idioma, idioma?: Idioma) =>
  Boolean(idioma && idioma !== original);
function traduzido<T>(tr: Traducao, campo: string, valor: T, usar: boolean): T {
  if (!usar || !tr) return valor;
  const t = tr[campo];
  return typeof t === 'string' && t.trim() ? (t as T) : valor;
}
const idiomaDe = (valor: unknown): Idioma => (valor === 'en' ? 'en' : 'pt');

const nomeDe = (a: any) =>
  [a?.firstName, a?.lastName].filter(Boolean).join(' ').trim() ||
  a?.username ||
  'Opus Atlas';

export function autorRef(a: any): AutorRef {
  return {
    id: a?.id ?? '',
    nome: nomeDe(a),
    usuario: a?.username || a?.id || '',
    imagem: a?.image ?? null,
    bio: a?.bio ?? null,
  };
}

// Categoria e tag são escritas em português; a tradução é para o inglês.
const categoriaRef = (c: any, idioma?: Idioma): CategoriaRef => {
  const cat = c?.category ?? c;
  return {
    id: cat.id,
    nome: traduzido(cat.translation, 'name', cat.name, idioma === 'en'),
    slug: cat.slug,
    noMenu: !!cat.inMoreMenu,
  };
};

const tagRef = (t: any, idioma?: Idioma): TagRef => {
  const tag = t?.tag ?? t;
  return {
    id: tag.id,
    nome: traduzido(tag.translation, 'name', tag.name, idioma === 'en'),
    slug: tag.slug,
  };
};

const minutosDe = (a: any) =>
  Math.max(1, Number(a.readTime || a.estimatedReadTime || 1));

const iso = (valor: unknown) =>
  valor ? new Date(valor as string).toISOString() : null;

export function resumoDeArtigo(a: any, idioma?: Idioma): ResumoDeArtigo {
  const categorias = (a.categories ?? []).map((c: any) =>
    categoriaRef(c, idioma)
  );
  const original = idiomaDe(a.language);
  const tr: Traducao = a.translation;
  const usar = precisaTraduzir(original, idioma) && Boolean(tr?.title);
  return {
    id: a.id,
    slug: a.slug,
    titulo: traduzido(tr, 'title', a.title, usar),
    resumo: traduzido(tr, 'description', a.description || null, usar),
    capa: a.coverImage || null,
    capaAlt: traduzido(tr, 'coverImageAlt', a.coverImageAlt || null, usar),
    publicadoEm: iso(a.publishedAt),
    atualizadoEm: iso(a.updatedAt) ?? new Date(0).toISOString(),
    minutos: minutosDe(a),
    visitas: a.viewCount ?? 0,
    autor: autorRef(a.author),
    categoria: categorias[0] ?? null,
    categorias,
    tags: (a.tags ?? []).map((t: any) => tagRef(t, idioma)),
    curtidas: a._count?.likes ?? a.stats?.likes ?? 0,
    comentarios: a._count?.comments ?? a.stats?.comments ?? 0,
    destaque: !!a.isFeatured,
    ordemNoDestaque: a.featuredOrder ?? null,
    idiomaOriginal: original,
    idiomaDoTexto: usar ? (idioma as Idioma) : original,
    temTraducao: Boolean(tr?.title),
  };
}

const ehYoutube = (url: string) => /youtube\.com|youtu\.be/.test(url);

function artigoCompleto(a: any, idioma?: Idioma): ArtigoCompleto {
  const musicaUrl: string =
    a.backgroundMusic?.url ?? a.backgroundMusicUrl ?? '';
  const resumo = resumoDeArtigo(a, idioma);
  const tr: Traducao = a.translation;
  const usar = resumo.idiomaDoTexto !== resumo.idiomaOriginal;
  return {
    ...resumo,
    conteudo: usar && tr?.content ? tr.content : a.content,
    status: a.status,
    creditoDaCapa: a.coverImageCredit || null,
    metaTitulo: traduzido(tr, 'metaTitle', a.metaTitle || null, usar),
    metaDescricao: traduzido(
      tr,
      'metaDescription',
      a.metaDescription || null,
      usar
    ),
    palavrasChave: a.keywords ?? [],
    tipos: a.types ?? [],
    narracao: a.ttsAudioUrl || null,
    musica: musicaUrl.trim()
      ? {
          url: musicaUrl.trim(),
          titulo: a.backgroundMusic?.title ?? a.backgroundMusicTitle ?? null,
          volume: Number(
            a.backgroundMusic?.volume ?? a.backgroundMusicVolume ?? 0.3
          ),
          repetir: a.backgroundMusic?.loop ?? a.backgroundMusicLoop ?? true,
          tipo: ehYoutube(musicaUrl) ? 'youtube' : 'arquivo',
        }
      : null,
    compositores: (a.composers ?? []).map((c: any) => ({
      id: c.id,
      nome: c.fullName || c.name,
      retrato: c.portraitUrl || null,
      epoca: c.epochName || null,
      nascimento: c.birthDate || null,
      morte: c.deathDate || null,
    })),
    obras: (a.works ?? []).map((w: any) => ({
      id: w.id,
      titulo: w.title,
      catalogo: w.opOrCatalog || null,
      compositor: { id: w.composer?.id ?? '', nome: w.composer?.name ?? '' },
      instrumento: w.instrument?.name ?? null,
    })),
    partituras: (a.scores ?? []).map((s: any) => ({
      id: s.sourceId || s.id,
      titulo: s.title,
      arquivo: s.downloadUrl || null,
      miniatura: s.thumbnailUrl || null,
      obra: {
        id: s.work?.id ?? '',
        titulo: s.work?.title ?? '',
        compositor: s.work?.composer?.name ?? '',
      },
    })),
    relacionados: (a.relatedArticles ?? []).map((r: any) => ({
      id: r.id,
      slug: r.slug,
      titulo: r.title,
      resumo: r.description || null,
      capa: r.coverImage || null,
      publicadoEm: iso(r.publishedAt),
      minutos: Math.max(1, Number(r.estimatedReadTime || 1)),
    })),
  };
}

const paginacao = (p: any): Paginacao => ({
  pagina: p?.page ?? 1,
  porPagina: p?.limit ?? 12,
  total: p?.total ?? 0,
  paginas: Math.max(1, p?.totalPages ?? 1),
});

// ---------------------------------------------------------------------------
// Leituras
// ---------------------------------------------------------------------------

export interface ConsultaDeArtigos {
  pagina?: number;
  porPagina?: number;
  categoria?: string;
  tag?: string;
  autorId?: string;
  destaque?: boolean;
  ordem?: 'newest' | 'popular' | 'mostRead';
}

export async function listarArtigos(
  consulta: ConsultaDeArtigos = {},
  opcoes: BlogReadOptions = {}
): Promise<{ artigos: ResumoDeArtigo[]; paginacao: Paginacao }> {
  const data = await blogRead<{ articles: unknown[]; pagination: unknown }>(
    '/blog/articles',
    {
      page: consulta.pagina,
      limit: consulta.porPagina ?? 12,
      categories: consulta.categoria,
      tags: consulta.tag,
      authorId: consulta.autorId,
      featured: consulta.destaque,
      sortBy: consulta.ordem ?? 'newest',
    },
    opcoes
  );

  return {
    artigos: data.articles.map((a) => resumoDeArtigo(a, opcoes.idioma)),
    paginacao: paginacao(data.pagination),
  };
}

/** Os destaques, na ordem escolhida no painel. */
export async function listarDestaques(
  limite = 3,
  opcoes: BlogReadOptions = {}
) {
  const { artigos } = await listarArtigos(
    { destaque: true, porPagina: 20 },
    opcoes
  );
  return artigos
    .sort((a, b) => (a.ordemNoDestaque ?? 99) - (b.ordemNoDestaque ?? 99))
    .slice(0, limite);
}

export async function listarMaisLidos(
  limite = 5,
  opcoes: BlogReadOptions = {}
) {
  const { artigos } = await listarArtigos(
    { ordem: 'popular', porPagina: limite },
    opcoes
  );
  return artigos;
}

/**
 * O artigo pelo slug (ou id). `null` quando não existe ou não está à vista
 * de quem pede — a página responde 404.
 */
export async function lerArtigo(
  slugOuId: string,
  opcoes: BlogReadOptions = {}
): Promise<ArtigoCompleto | null> {
  try {
    const data = await blogRead<{ article: unknown }>(
      `/blog/articles/${encodeURIComponent(slugOuId)}`,
      undefined,
      opcoes
    );
    return artigoCompleto(data.article, opcoes.idioma);
  } catch (error) {
    if (error instanceof ApiError && [400, 403, 404].includes(error.status)) {
      return null;
    }
    throw error;
  }
}

/**
 * A busca. Com termo, a busca textual da API (por relevância); sem termo, a
 * lista com os mesmos filtros. Sem cache: a busca é por pedido.
 */
export async function buscarArtigos(consulta: {
  q?: string;
  categoria?: string;
  ordem?: 'relevance' | 'newest' | 'popular';
  pagina?: number;
  idioma?: Idioma;
}): Promise<{ artigos: ResumoDeArtigo[]; paginacao: Paginacao }> {
  const q = consulta.q?.trim() ?? '';
  if (q.length >= 2) {
    const data = await blogRead<{ results: unknown[]; pagination: unknown }>(
      '/blog/search',
      {
        q,
        categories: consulta.categoria,
        sortBy: consulta.ordem ?? 'relevance',
        page: consulta.pagina,
        limit: 12,
      },
      { fresh: true }
    );
    return {
      artigos: data.results.map((a) => resumoDeArtigo(a, consulta.idioma)),
      paginacao: paginacao(data.pagination),
    };
  }
  return listarArtigos(
    {
      categoria: consulta.categoria,
      pagina: consulta.pagina,
      ordem: consulta.ordem === 'popular' ? 'popular' : 'newest',
    },
    { fresh: true, idioma: consulta.idioma }
  );
}

// ---------------------------------------------------------------------------
// Autor, categoria, tag
// ---------------------------------------------------------------------------

type PerfilApi = ApiSchema<'AuthorProfileResponseDto'>;

export interface PerfilDeAutor {
  autor: AutorRef;
  artigos: number;
  visitas: number;
  desde: string | null;
  ultimo: string | null;
  categorias: Array<CategoriaRef & { artigos: number }>;
}

export async function lerAutor(
  usuario: string,
  opcoes: BlogReadOptions = {}
): Promise<PerfilDeAutor | null> {
  try {
    const data = await blogRead<PerfilApi>(
      `/blog/authors/${encodeURIComponent(usuario)}`,
      undefined,
      opcoes
    );
    return {
      autor: autorRef(data.author),
      artigos: data.stats.articles,
      visitas: data.stats.views,
      desde: iso(data.stats.firstPublishedAt),
      ultimo: iso(data.stats.lastPublishedAt),
      categorias: data.categories.map((c) => ({
        ...categoriaRef(c, opcoes.idioma),
        artigos: c.articles,
      })),
    };
  } catch (error) {
    if (error instanceof ApiError && [400, 404].includes(error.status)) {
      return null;
    }
    throw error;
  }
}

export interface CategoriaDoBlog extends CategoriaRef {
  /** Tem seção própria no início do blog, com os últimos artigos. */
  noInicio: boolean;
  /** A posição da seção no início (painel → Início do blog). */
  ordemNoInicio: number | null;
  descricao: string | null;
  imagem: string | null;
  metaTitulo: string | null;
  metaDescricao: string | null;
  atualizadaEm: string;
}

const categoriaDoBlog = (c: any, idioma?: Idioma): CategoriaDoBlog => {
  const en = idioma === 'en';
  return {
    ...categoriaRef(c, idioma),
    noInicio: !!c.showOnHome,
    ordemNoInicio: typeof c.homeOrder === 'number' ? c.homeOrder : null,
    descricao: traduzido(
      c.translation,
      'description',
      c.description || null,
      en
    ),
    imagem: c.coverImage || c.image || null,
    metaTitulo: traduzido(c.translation, 'metaTitle', c.metaTitle || null, en),
    metaDescricao: traduzido(
      c.translation,
      'metaDescription',
      c.metaDescription || null,
      en
    ),
    atualizadaEm: iso(c.updatedAt) ?? new Date(0).toISOString(),
  };
};

/**
 * As categorias ativas, na ordem do painel. A rota pública devolve também as
 * desativadas: quem mostra filtra.
 */
export async function listarCategorias(
  opcoes: BlogReadOptions = {}
): Promise<CategoriaDoBlog[]> {
  const data = await blogRead<{
    categories: Array<{ isActive: boolean; order: number }>;
  }>('/blog/categories', undefined, opcoes, [BLOG_TAGS.categories]);

  return data.categories
    .filter((c) => c.isActive)
    .sort((a, b) => a.order - b.order)
    .map((c) => categoriaDoBlog(c, opcoes.idioma));
}

export async function lerCategoria(
  slug: string,
  opcoes: BlogReadOptions = {}
): Promise<CategoriaDoBlog | null> {
  try {
    const data = await blogRead<{ category: { isActive: boolean } }>(
      `/blog/categories/${encodeURIComponent(slug)}`,
      undefined,
      opcoes,
      [BLOG_TAGS.categories]
    );
    return data.category.isActive
      ? categoriaDoBlog(data.category, opcoes.idioma)
      : null;
  } catch (error) {
    if (error instanceof ApiError && [400, 404].includes(error.status)) {
      return null;
    }
    throw error;
  }
}

export interface TagDoBlog extends TagRef {
  descricao: string | null;
  artigos: number;
}

export async function lerTag(
  slug: string,
  opcoes: BlogReadOptions = {}
): Promise<TagDoBlog | null> {
  try {
    const data = await blogRead<{
      tag: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        articleCount: number;
        translation?: Traducao;
      };
    }>(`/blog/tags/${encodeURIComponent(slug)}`, undefined, opcoes, [
      BLOG_TAGS.tags,
    ]);
    const en = opcoes.idioma === 'en';
    return {
      ...tagRef(data.tag, opcoes.idioma),
      descricao: traduzido(
        data.tag.translation,
        'description',
        data.tag.description,
        en
      ),
      artigos: data.tag.articleCount,
    };
  } catch (error) {
    if (error instanceof ApiError && [400, 404].includes(error.status)) {
      return null;
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// No navegador
// ---------------------------------------------------------------------------

/** A visita conta no navegador: a página do artigo é estática. */
export const registrarVisita = (id: string) =>
  apiFetch(`/blog/articles/${id}/view`, { method: 'POST' }).catch(
    () => undefined
  );

/**
 * A leitura completa: quem chegou ao fim do texto, com o tempo que levou
 * (a API usa para o tempo médio de leitura; aceita de 1 s a 4 h).
 */
export const registrarLeitura = (id: string, segundos: number) =>
  apiFetch(`/blog/articles/${id}/read`, {
    method: 'POST',
    body: { readTime: Math.min(14_400, Math.max(1, Math.round(segundos))) },
  }).catch(() => undefined);
