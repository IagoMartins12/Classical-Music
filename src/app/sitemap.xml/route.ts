import { apiFetch } from '../libs/api/client';
import type { ApiSchema } from '../libs/api/types';
import { MAX_COMPOSER_FILES, MAX_WORK_FILES } from '../sitemaps/sitemap';
import { SITE_URL } from '../utils/seoAlternates';

type CatalogIndex = ApiSchema<'SitemapCatalogIndexDto'>;

export const revalidate = 86400;

/**
 * O índice do sitemap (`/sitemap.xml`, o que o `robots.txt` aponta): um
 * `<sitemap>` por arquivo de `app/sitemaps/sitemap.ts` que existe — as
 * páginas do site, depois os compositores e as obras em arquivos de 40 mil.
 * Sem a API, lista o teto de arquivos: um arquivo além do fim sai vazio, e
 * vazio é um sitemap válido.
 */
export async function GET() {
  const indice = await apiFetch<CatalogIndex>('/seo/sitemap/catalog', {
    next: { revalidate, tags: ['composers', 'works'] },
  }).catch(() => ({ composers: MAX_COMPOSER_FILES, works: MAX_WORK_FILES }));

  const ids = [
    'site',
    ...Array.from(
      { length: Math.min(indice.composers, MAX_COMPOSER_FILES) },
      (_, n) => `composers-${n}`
    ),
    ...Array.from(
      { length: Math.min(indice.works, MAX_WORK_FILES) },
      (_, n) => `works-${n}`
    ),
  ];
  const agora = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ids
  .map(
    (id) =>
      `  <sitemap><loc>${SITE_URL}/sitemaps/sitemap/${id}.xml</loc><lastmod>${agora}</lastmod></sitemap>`
  )
  .join('\n')}
</sitemapindex>
`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
