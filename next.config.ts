import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL('https://assets.openopus.org/**'),
      new URL('https://imslp.org/images/**'),
    ],
  },
};

export default nextConfig;
