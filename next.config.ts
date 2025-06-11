import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL('https://imslp.org/images/**'),
      new URL('https://**.imslp.org/images/**'),
    ],
  },
};

export default nextConfig;
