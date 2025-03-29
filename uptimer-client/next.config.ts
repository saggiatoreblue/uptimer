import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: 'build',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
