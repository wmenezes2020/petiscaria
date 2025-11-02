import type { Metadata } from 'next';
import './globals.css';
import { ClientOnly } from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'Petiscaria da Thay - Sistema de Gestão',
  description: 'Sistema SaaS completo para gestão de petiscarias, bares e restaurantes. Comanda digital, KDS, controle de mesas, estoque e pagamentos PIX.',
  keywords: 'petiscaria, bar, restaurante, gestão, comanda digital, KDS, PIX, estoque',
  authors: [{ name: 'Petiscaria da Thay' }],
  creator: 'Petiscaria da Thay',
  publisher: 'Petiscaria da Thay',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://petiscariadathay.com.br'),
  openGraph: {
    title: 'Petiscaria da Thay - Sistema de Gestão',
    description: 'Sistema SaaS completo para gestão de petiscarias, bares e restaurantes',
    url: 'https://petiscariadathay.com.br',
    siteName: 'Petiscaria da Thay',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Petiscaria da Thay - Sistema de Gestão',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Petiscaria da Thay - Sistema de Gestão',
    description: 'Sistema SaaS completo para gestão de petiscarias, bares e restaurantes',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

// SOLUÇÃO DEFINITIVA: Desabilitar COMPLETAMENTE SSR para páginas dinâmicas
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning>
        <ClientOnly
          fallback={
            <div className="flex h-screen items-center justify-center bg-gray-100">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
                <p className="text-sm font-medium text-gray-600">Carregando...</p>
              </div>
            </div>
          }
        >
          {children}
        </ClientOnly>
      </body>
    </html>
  );
}
