import type { NextConfig } from 'next';
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
  // REMOVER completamente a seção rewrites
  async headers() {
    return [
      // Homologação: nada é indexável. Ver `utils/indexing.ts`.
      ...(SITE_NOINDEX
        ? [
            {
              source: '/:path*',
              headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
            },
          ]
        : []),
      {
        source: '/api/auth/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
});

export default nextConfig;
