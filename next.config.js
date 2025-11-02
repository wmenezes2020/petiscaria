/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.petiscariadathay.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: false,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  },
  experimental: {
    isrMemoryCacheSize: 0,
  },
  // CRITICAL: Garantir comportamento consistente entre desenvolvimento e produção
  reactStrictMode: false,
  poweredByHeader: false,
  compress: false,
  swcMinify: true,
  generateEtags: false,
  productionBrowserSourceMaps: false,
  // CRITICAL: Desabilitar otimizações agressivas que podem causar hydration mismatch
  compiler: {
    removeConsole: false, // Manter console.log para debug
  },
  // CRITICAL: Garantir que o HTML seja sempre consistente
  trailingSlash: true,
  skipTrailingSlashRedirect: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // CRITICAL: Cache control para evitar servir HTML antigo
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
