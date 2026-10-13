import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';
import { OPTIMIZED_IMAGE_HOSTS } from './src/app/utils/imageHosts';
import { SITE_NOINDEX } from './src/app/utils/indexing';
import {
  AUTH_COOKIE_PREFIX,
  AUTH_COOKIE_PREFIX_PATTERN,
} from './src/app/utils/authCookies';

// Prefixo inválido gravaria cookies com nomes que a API não lê: login que
// "funciona" e volta deslogado. Melhor não buildar. Ver `utils/authCookies.ts`.
if (!AUTH_COOKIE_PREFIX_PATTERN.test(AUTH_COOKIE_PREFIX)) {
  throw new Error(
    `NEXT_PUBLIC_AUTH_COOKIE_PREFIX inválido: "${AUTH_COOKIE_PREFIX}". ` +
      'Use letras minúsculas, dígitos e _ (ex.: opus_hml).'
  );
}

/**
 * Na Vercel o cache de ISR é da plataforma, compartilhado entre as funções —
 * o problema que o handler do Redis resolve não existe lá. Ligado, ele cairia
 * no fallback em memória de cada função, que é pior que o da Vercel. Então só
 * vale fora dela (o VPS). Consequência: homologação **não** exercita o cache
 * no Redis; isso só se valida em produção.
 */
const onVercel = process.env.VERCEL === '1';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = withBundleAnalyzer({
  output: 'standalone',
  trailingSlash: false,
  compress: true,

  experimental: {
    // Serwist adds a custom `webpack` function, and with one Next turns the
    // build worker off: server, client and edge then compile in one process
    // and the heap passed 3 GB. On again, each compiles in its own worker.
    webpackBuildWorker: true,
  },

  /**
   * Cache de ISR e de `fetch` no Redis, compartilhado pelas réplicas.
   *
   * Sem isto o Next guarda tudo no disco de cada instância: N réplicas
   * significam N caches independentes, a mesma página renderizada N vezes e —
   * o que é pior — um `revalidateTag` que só alcança a réplica que recebeu o
   * aviso da API. As demais servem dado velho até o TTL. Ver `cache-handler.js`.
   */
  cacheHandler: onVercel ? undefined : require.resolve('./cache-handler.js'),

  /**
   * Zero desliga a camada em memória que o Next mantém **na frente** do
   * handler. Ela é por instância e não sabe de revalidação vinda de outra
   * réplica — mantê-la ligada devolveria o problema que o handler resolve.
   */
  cacheMaxMemorySize: onVercel ? undefined : 0,

  /**
   * Metadados sempre no `<head>`, nunca em streaming.
   *
   * No Next 15.5, a página de ISR **regenerada** (revalidação por tag ou por
   * prazo) sai com `<title>`, description e Open Graph no fim do `<body>` — o
   * próprio código do Next marca isso como bug conhecido
   * (`build/templates/app-page.js`, "shouldServeStreamingMetadata always being
   * true for a revalidate"). O HTML do build sai certo; o problema começa na
   * primeira revalidação e é servido do cache a todo mundo, inclusive aos
   * robôs de pré-visualização (WhatsApp, Facebook, X), que não executam
   * JavaScript e só leem o `<head>`. O Lighthouse acusava "sem meta
   * description" em todas as páginas por isso.
   *
   * `/.*\/` trata todo visitante como robô limitado, o que desliga o streaming.
   * O custo é o metadado bloquear o começo da resposta, e ele é pequeno aqui:
   * o `generateMetadata` lê o mesmo dado que a página, já em cache.
   */
  htmlLimitedBots: /.*/,
  /**
   * Otimização de imagem ligada — em produção ela estava **desligada**, e cada
   * visita baixava o arquivo original (retratos do IMSLP de 1 a 3 MB entre
   * eles).
   *
   * O `remotePatterns` fechou junto, e por um motivo que só aparece agora:
   * com a otimização ligada e `hostname: '**'`, `/_next/image` vira um
   * redimensionador público, e qualquer pessoa pode mandar o servidor baixar
   * imagem de qualquer lugar da internet às nossas custas.
   *
   * Host de fora da lista não quebra: o `SmartImage` marca a imagem como não
   * otimizada e o navegador a busca direto. Ver `utils/imageHosts.ts`.
   */
  images: {
    formats: ['image/avif', 'image/webp'],
    // O retrato de um compositor morto há 200 anos não muda amanhã.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: OPTIMIZED_IMAGE_HOSTS.map((hostname) => ({
      protocol: 'https' as const,
      hostname,
    })),
  },
  async redirects() {
    return [
      // The genre index was retired: the works list filters by genre.
      { source: '/genres', destination: '/works', permanent: true },
      { source: '/en/genres', destination: '/en/works', permanent: true },
      // The public teacher directory is gone; teaching lives on /for-teachers.
      {
        source: '/teachers/:path*',
        destination: '/for-teachers',
        permanent: true,
      },
      {
        source: '/en/teachers/:path*',
        destination: '/en/for-teachers',
        permanent: true,
      },
      // The old moderation page; the queue lives in the admin now.
      {
        source: '/moderation',
        destination: '/admin/moderation',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      // Baseline hardening for every page (the API has its own Helmet).
      // No CSP yet: analytics, YouTube and the score hosts need an audited
      // allow-list first.
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
        ],
      },
      // Homologação: nada é indexável. Ver `utils/indexing.ts`.
      ...(SITE_NOINDEX
        ? [
            {
              source: '/:path*',
              headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
            },
          ]
        : []),
    ];
  },
});

/**
 * The PWA's service worker (Serwist), built from `src/app/sw.ts` into
 * `public/sw.js`. Off in development: with Turbopack there is no webpack
 * build to inject the precache list into, and a worker caching the dev
 * server only gets in the way.
 */
const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  // Only what the app shell needs offline. By default every file in
  // `public/` went into the precache: installing the app downloaded the era
  // pictures and sketch assets, megabytes nobody asked for. Pictures are
  // cached when a page shows them.
  globPublicPatterns: ['icons/**/*'],
  // The offline page is ready before the first time it is needed.
  additionalPrecacheEntries: [
    { url: '/offline', revision: process.env.VERCEL_GIT_COMMIT_SHA ?? null },
  ],
});

export default withSerwist(nextConfig);
