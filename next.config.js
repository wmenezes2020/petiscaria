/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removido output: 'standalone' para usar npm start (mesmo processo que local)
  images: {
    // Usar remotePatterns ao invés de domains (deprecated)
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
    // Desabilitar otimização de imagens se não houver sharp instalado
    unoptimized: false,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  },
  // Configurações para evitar chamadas de API durante o build
  experimental: {
    // Desabilita SSR para páginas que fazem chamadas de API
    isrMemoryCacheSize: 0,
  },
  // Configura páginas para serem estáticas
  trailingSlash: true,
  // Desabilitar strict mode para evitar problemas de hidratação em produção
  // Strict mode causa renderização dupla que pode causar mismatch
  reactStrictMode: false,
  // Garantir que não há problemas com server components
  poweredByHeader: false,
  // Otimização para produção
  compress: true,
  // Prevenir problemas de hydration com logging
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
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
        ],
      },
    ];
  },
};

module.exports = nextConfig;
