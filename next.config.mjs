import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL
        ? [{
          protocol: 'https',
          hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
        }]
        : []),
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  poweredByHeader: false,
  async rewrites() {
    return [
      { source: '/catalog.json', destination: '/api/catalog' },
      { source: '/api/catalog.json', destination: '/api/catalog' },
      { source: '/c/catalog.json', destination: '/api/catalog' },
      { source: '/catalog-chatfuel.json', destination: '/catalog-chatfuel.json' },
      { source: '/api/catalog-chatfuel.json', destination: '/api/catalog-chatfuel.json' },
      { source: '/c/catalog-chatfuel.json', destination: '/c/catalog-chatfuel.json' },
    ];
  },
};

export default withNextIntl(nextConfig);
