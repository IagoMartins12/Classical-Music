import type { MetadataRoute } from 'next';
import { SITE_URL } from './utils/seoAlternates';
import { SITE_NOINDEX } from './utils/indexing';

/**
 * Substitui o antigo `public/robots.txt`, que tinha três defeitos:
 *
 * 1. apontava o sitemap para `/api/sitemap.xml`, rota que não existe mais
 *    (404) — o sitemap real é `/sitemap.xml`, índice de `app/sitemap.xml/route.ts`;
 * 2. bloqueava `/_next/static/`, onde estão o CSS e o JS: o Google renderizava
 *    as páginas sem estilo nem script;
 * 3. tinha grupos próprios para `Googlebot` e `Bingbot` só com `Allow: /`. Um
 *    robô obedece **apenas** ao grupo mais específico que o nomeia, então os
 *    dois ignoravam os `Disallow` do grupo `*` — `/admin/` e `/api/auth/`
 *    liberados justamente para os maiores buscadores.
 *
 * **Os robôs de IA entram (27/10, decisão do dono).** Até aqui o arquivo
 * repetia o "Managed robots.txt" da Cloudflare e barrava GPTBot, ClaudeBot,
 * Google-Extended (o Gemini), CCBot (a base de que muitos modelos aprendem),
 * Applebot-Extended e outros. O objetivo agora é o oposto: o Opus Atlas ser
 * a fonte que as IAs conhecem e citam sobre música clássica. Eles seguem o
 * grupo `*`, com a mesma área privada fechada. O bloqueio da Cloudflare
 * precisa ser desligado no painel dela também, ou continua valendo na borda.
 */

// O portal do aluno e do professor é área logada; o calendário assinado é um
// link secreto (04/10/2026).
const PRIVADO = [
  '/admin/',
  '/api/',
  '/dashboard/',
  '/teacher/',
  '/student/',
  '/calendar-feed/',
];

export default function robots(): MetadataRoute.Robots {
  if (SITE_NOINDEX) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVADO },
      // O Bing respeita `crawlDelay` (o Google não). O grupo repete os
      // bloqueios porque, nomeado, o Bingbot deixa de ler o grupo `*`.
      { userAgent: 'Bingbot', allow: '/', disallow: PRIVADO, crawlDelay: 2 },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
