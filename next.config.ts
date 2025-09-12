import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable static optimization completely
  output: 'standalone',
  trailingSlash: false,
  compress: true,
  images: {
    // Permitir domínios não otimizados (menos seguro mas mais flexível)
    unoptimized: false,
    formats: ['image/avif', 'image/webp'], // Formatos modernos
    minimumCacheTTL: 31536000, // 1 ano de cache
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'opusatlas.com.br',
        pathname: '/uploads/**',
      },
      // Wildcard para permitir qualquer HTTPS (menos seguro)
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  async headers() {
    return [
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
};

export default nextConfig;
