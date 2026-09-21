import type { MetadataRoute } from 'next';
import { SITE_URL } from './utils/seoAlternates';
import { SITE_NOINDEX } from './utils/indexing';

/**
 * Substitui o antigo `public/robots.txt`, que tinha três defeitos:
 *
 * 1. apontava o sitemap para `/api/sitemap.xml`, rota que não existe mais
 *    (404) — o sitemap real é `/sitemap.xml`, gerado por `app/sitemap.ts`;
 * 2. bloqueava `/_next/static/`, onde estão o CSS e o JS: o Google renderizava
 *    as páginas sem estilo nem script;
 * 3. tinha grupos próprios para `Googlebot` e `Bingbot` só com `Allow: /`. Um
 *    robô obedece **apenas** ao grupo mais específico que o nomeia, então os
 *    dois ignoravam os `Disallow` do grupo `*` — `/admin/` e `/api/auth/`
 *    liberados justamente para os maiores buscadores.
 *
 * Os bloqueios de robôs de IA vêm do "Managed robots.txt" da Cloudflare e
 * foram mantidos: são uma decisão do site, não um defeito.
 */
const ROBOS_DE_IA = [
  'Amazonbot',
  'Applebot-Extended',
  'Bytespider',
  'CCBot',
  'ClaudeBot',
  'Google-Extended',
  'GPTBot',
  'meta-externalagent',
];

const PRIVADO = ['/admin/', '/api/', '/dashboard/'];

export default function robots(): MetadataRoute.Robots {
  if (SITE_NOINDEX) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: [
      { userAgent: ROBOS_DE_IA, disallow: '/' },
      { userAgent: '*', allow: '/', disallow: PRIVADO },
      // O Bing respeita `crawlDelay` (o Google não). O grupo repete os
      // bloqueios porque, nomeado, o Bingbot deixa de ler o grupo `*`.
      { userAgent: 'Bingbot', allow: '/', disallow: PRIVADO, crawlDelay: 2 },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
