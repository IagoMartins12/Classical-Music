// app/sitemap.ts — o sitemap, montado a partir da API
//
// **O que mudou.** As URLs dinâmicas vinham de `libs/sitemap-data.ts`, que lia
// o MongoDB direto do servidor do Next. Agora vêm de `GET /seo/sitemap`, que a
// API já servia e ninguém consumia. Era a última leitura de banco do front
// fora de `src/app/api` (Etapa 7 do ROADMAP).
//
// **Dois defeitos corrigidos de passagem.** As obras saíam como `/work/<id>`,
// endereço que não existe — a rota é `/works/<id>`; eram ~207 mil URLs mortas
// no sitemap. E artigos e professores públicos, que a API já devolve, não
// entravam.
import { MetadataRoute } from 'next';
import { apiFetch } from './libs/api/client';
import type { ApiSchema } from './libs/api/types';
import { isLocalizedRoute, localizeHref } from './utils/localizedRoutes';

type SitemapEntries = ApiSchema<'SitemapEntriesDto'>;

/** Uma hora — o mesmo teto do cache da API para esta resposta. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://opusatlas.com.br';

  console.log('🚀 Generating sitemap...');

  // URLs estáticas principais (sempre incluídas)
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/works`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/composers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/instruments`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/genres`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/music-history`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/category`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/calendar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
  let dynamicUrls: MetadataRoute.Sitemap = [];
  let semIngles = new Set<string>();

  try {
    // Sem o diretório de professores (`/teachers`): fora de uso por ora
    // (28/09/2026) — não se indexa página que não vai ser usada.
    const {
      composers,
      works,
      articles,
      blogCategories,
      blogTags,
      blogAuthors,
    } = await apiFetch<SitemapEntries>('/seo/sitemap', {
      next: { revalidate, tags: ['composers', 'works', 'blog:articles'] },
    });

    dynamicUrls = [
      ...composers.map((composer) => ({
        url: `${baseUrl}/composer/${composer.id}`,
        lastModified: new Date(composer.lastModified),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
      ...works.map((work) => ({
        url: `${baseUrl}/works/${work.id}`,
        lastModified: new Date(work.lastModified),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
      // O artigo só existe em português (o texto não tem tradução): entra
      // sem versão em inglês — ver `semIngles` abaixo.
      ...articles.map((article) => ({
        url: `${baseUrl}/blog/${article.slug}`,
        lastModified: new Date(article.lastModified),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...(blogCategories ?? []).map((categoria) => ({
        url: `${baseUrl}/blog/category/${categoria.slug}`,
        lastModified: new Date(categoria.lastModified),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      })),
      ...(blogTags ?? []).map((tag) => ({
        url: `${baseUrl}/blog/tag/${tag.slug}`,
        lastModified: new Date(tag.lastModified),
        changeFrequency: 'weekly' as const,
        priority: 0.3,
      })),
      ...(blogAuthors ?? []).map((autor) => ({
        url: `${baseUrl}/blog/autor/${encodeURIComponent(autor.id)}`,
        lastModified: new Date(autor.lastModified),
        changeFrequency: 'monthly' as const,
        priority: 0.4,
      })),
    ];
    semIngles = new Set(articles.map((a) => `/blog/${a.slug}`));
  } catch (error) {
    // O sitemap sem as URLs dinâmicas ainda é um sitemap válido, e melhor que
    // um 500: o buscador reencontra o resto pelos links das páginas.
    console.error(
      'Sitemap: falha ao ler a API, seguindo só com as estáticas',
      error
    );
  }

  return comIdiomas([...staticUrls, ...dynamicUrls], baseUrl, semIngles);
}

/**
 * Declara a versão em inglês de cada endereço que tem uma.
 *
 * Sem isto, o inglês existiria (em `/en/...`) e o buscador não teria como
 * saber: ele indexaria as duas versões como páginas independentes, competindo
 * uma com a outra pelo mesmo assunto. Com `xhtml:link`, elas são a mesma
 * página em dois idiomas.
 *
 * Endereço que não vive sob `app/[lang]/` passa intocado; o artigo do blog
 * também (o texto só existe em português e o `canonical` dele aponta para
 * o português nos dois idiomas).
 */
function comIdiomas(
  entradas: MetadataRoute.Sitemap,
  baseUrl: string,
  semIngles: Set<string> = new Set()
): MetadataRoute.Sitemap {
  return entradas.map((entrada) => {
    const caminho = entrada.url.slice(baseUrl.length) || '/';

    if (!isLocalizedRoute(caminho) || semIngles.has(caminho)) return entrada;

    return {
      ...entrada,
      alternates: {
        languages: {
          'pt-BR': entrada.url,
          'en-US': `${baseUrl}${localizeHref(caminho, 'en')}`,
        },
      },
    };
  });
}
