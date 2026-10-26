// app/sitemaps/sitemap.ts — os arquivos do sitemap; o índice é `/sitemap.xml`
//
// **Por que em vários arquivos (27/10).** O sitemap era um arquivo só, com os
// 500 compositores e as 2 mil obras "relevantes" que a API escolhia: o
// buscador não sabia que existiam os outros ~10 mil compositores e ~200 mil
// obras do acervo. Agora vai o acervo inteiro (compositores com obra e obras
// principais), em arquivos de 40 mil URLs (o teto do protocolo é 50 mil), e
// `app/sitemap.xml/route.ts` lista os arquivos que existem.
//
// Os ids: `site` (páginas fixas, épocas, instrumentos, dias do ano e blog),
// `composers-<n>` e `works-<n>`. A lista abaixo é um teto fixo de arquivos;
// o índice só aponta os que a API diz existir, e um arquivo além do fim sai
// vazio.
import type { MetadataRoute } from 'next';
import { ERAS } from '../conteudo/site/eras';
import { INSTRUMENTS } from '../conteudo/instruments/meta';
import { apiFetch } from '../libs/api/client';
import type { ApiSchema } from '../libs/api/types';
import { daySlug, daysInMonth } from '../conteudo/site/onThisDay';
import { isLocalizedRoute, localizeHref } from '../utils/localizedRoutes';
import { SITE_URL } from '../utils/seoAlternates';

type SitemapEntries = ApiSchema<'SitemapEntriesDto'>;
type CatalogEntry = ApiSchema<'SitemapCatalogEntryDto'>;

/** Um dia: o acervo muda devagar, e a API guarda as páginas pelo mesmo tempo. */
export const revalidate = 86400;

/** Tetos de arquivos por tipo (40 mil URLs cada): folga para o acervo crescer. */
export const MAX_COMPOSER_FILES = 2;
export const MAX_WORK_FILES = 10;

export async function generateSitemaps() {
  return [
    { id: 'site' },
    ...Array.from({ length: MAX_COMPOSER_FILES }, (_, n) => ({
      id: `composers-${n}`,
    })),
    ...Array.from({ length: MAX_WORK_FILES }, (_, n) => ({
      id: `works-${n}`,
    })),
  ];
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const catalogo = /^(composers|works)-(\d+)$/.exec(id);
  if (catalogo) {
    const [, kind, page] = catalogo;
    const rota = kind === 'composers' ? '/composer' : '/works';
    const entradas = await apiFetch<CatalogEntry[]>(
      `/seo/sitemap/catalog/${kind}/${page}`,
      {
        next: {
          revalidate,
          tags: [kind === 'composers' ? 'composers' : 'works'],
        },
      }
    ).catch((error) => {
      // Sem a API, o arquivo sai vazio (válido) em vez de um 500: o
      // buscador volta no dia seguinte.
      console.error(`Sitemap ${id}: falha ao ler a API`, error);
      return [] as CatalogEntry[];
    });
    return comIdiomas(
      entradas.map((e) => ({
        url: `${SITE_URL}${rota}/${e.id}`,
        lastModified: new Date(e.lastModified),
        changeFrequency: 'monthly' as const,
        priority: kind === 'composers' ? 0.8 : 0.7,
      }))
    );
  }
  return id === 'site' ? paginasDoSite() : [];
}

/** As páginas fixas, as épocas, os instrumentos, os dias do ano e o blog. */
async function paginasDoSite(): Promise<MetadataRoute.Sitemap> {
  const agora = new Date();
  const fixa = (
    caminho: string,
    priority: number,
    changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ) => ({
    url: `${SITE_URL}${caminho === '/' ? '' : caminho}`,
    lastModified: agora,
    changeFrequency,
    priority,
  });

  const fixas: MetadataRoute.Sitemap = [
    fixa('/', 1, 'daily'),
    fixa('/composers', 0.9),
    fixa('/works', 0.9, 'daily'),
    fixa('/music-history', 0.8, 'monthly'),
    ...ERAS.map((era) => fixa(`/music-history/${era.key}`, 0.8, 'monthly')),
    fixa('/instruments', 0.8, 'monthly'),
    ...INSTRUMENTS.map((i) => fixa(`/instruments/${i.key}`, 0.8, 'monthly')),
    fixa('/on-this-day', 0.7, 'daily'),
    // Os 366 dias: "compositores que nasceram em 17 de dezembro".
    ...Array.from({ length: 12 }, (_, m) =>
      Array.from({ length: daysInMonth(m + 1) }, (_, d) =>
        fixa(
          `/on-this-day/${daySlug({ month: m + 1, day: d + 1 })}`,
          0.5,
          'monthly'
        )
      )
    ).flat(),
    fixa('/collections', 0.6, 'daily'),
    fixa('/for-teachers', 0.7, 'monthly'),
    fixa('/pricing', 0.6, 'monthly'),
    fixa('/about-us', 0.5, 'monthly'),
    fixa('/faq', 0.5, 'monthly'),
    fixa('/help', 0.4, 'monthly'),
    fixa('/contact', 0.4, 'monthly'),
    fixa('/blog', 0.8, 'daily'),
    fixa('/blog/articles', 0.6, 'daily'),
    fixa('/blog/category', 0.5),
    fixa('/blog/calendar', 0.6, 'daily'),
  ];

  let blog: MetadataRoute.Sitemap = [];
  let semIngles = new Set<string>();
  try {
    const { articles, blogCategories, blogTags, blogAuthors } =
      await apiFetch<SitemapEntries>('/seo/sitemap', {
        next: { revalidate: 3600, tags: ['blog:articles'] },
      });
    blog = [
      ...articles.map((a) => ({
        url: `${SITE_URL}/blog/${a.slug}`,
        lastModified: new Date(a.lastModified),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...(blogCategories ?? []).map((c) => ({
        url: `${SITE_URL}/blog/category/${c.slug}`,
        lastModified: new Date(c.lastModified),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      })),
      ...(blogTags ?? []).map((t) => ({
        url: `${SITE_URL}/blog/tag/${t.slug}`,
        lastModified: new Date(t.lastModified),
        changeFrequency: 'weekly' as const,
        priority: 0.3,
      })),
      ...(blogAuthors ?? []).map((a) => ({
        url: `${SITE_URL}/blog/autor/${encodeURIComponent(a.id)}`,
        lastModified: new Date(a.lastModified),
        changeFrequency: 'monthly' as const,
        priority: 0.4,
      })),
    ];
    // O artigo só existe em português (o texto não tem tradução).
    semIngles = new Set(articles.map((a) => `/blog/${a.slug}`));
  } catch (error) {
    console.error('Sitemap site: falha ao ler o blog na API', error);
  }

  return comIdiomas([...fixas, ...blog], semIngles);
}

/**
 * Declara a versão em inglês de cada endereço que tem uma: sem isto o
 * buscador indexaria as duas como páginas independentes, competindo pelo
 * mesmo assunto. Endereço fora de `app/[lang]/` passa intocado; o artigo do
 * blog também.
 */
function comIdiomas(
  entradas: MetadataRoute.Sitemap,
  semIngles: Set<string> = new Set()
): MetadataRoute.Sitemap {
  return entradas.map((entrada) => {
    const caminho = entrada.url.slice(SITE_URL.length) || '/';
    if (!isLocalizedRoute(caminho) || semIngles.has(caminho)) return entrada;
    return {
      ...entrada,
      alternates: {
        languages: {
          'pt-BR': entrada.url,
          'en-US': `${SITE_URL}${localizeHref(caminho, 'en')}`,
        },
      },
    };
  });
}
