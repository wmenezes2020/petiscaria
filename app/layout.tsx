import type { Metadata } from 'next';
import './globals.css';

// CRITICAL: Layout completamente estático - sem componentes client-side
// Nenhum componente que possa causar hydration mismatch

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // CRITICAL: Layout minimalista - apenas HTML básico
  // suppressHydrationWarning evita warnings mas NÃO resolve o problema fundamental
  // O problema é que algo está criando múltiplos elementos raiz
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
      </head>
      <body className="antialiased h-full">
        {/* CRITICAL: Nenhum wrapper adicional - apenas children direto */}
        {children}
      </body>
    </html>
  );
}
