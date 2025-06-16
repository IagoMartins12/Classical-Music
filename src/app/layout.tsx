// app/layout.tsx (Server Component - SEM 'use client')
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientThemeWrapper } from './components/ClientThemeWrapper';
import Navbar from './components/Navbar';
import AuthProvider from './providers/AuthProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Classical Hub - Enciclopédia de Música Clássica',
  description:
    'Explore, aprenda e pratique música clássica com nossa enciclopédia interativa. Descubra compositores, obras e desenvolva suas habilidades musicais.',
  keywords: [
    'música clássica',
    'compositores',
    'partituras',
    'educação musical',
    'piano',
    'estudo musical',
  ],
  authors: [{ name: 'Classical Hub Team' }],
  creator: 'Classical Hub',
  openGraph: {
    title: 'Classical Hub - Enciclopédia de Música Clássica',
    description:
      'Explore, aprenda e pratique música clássica com nossa enciclopédia interativa.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Classical Hub - Enciclopédia de Música Clássica',
    description:
      'Explore, aprenda e pratique música clássica com nossa enciclopédia interativa.',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Preload critical fonts */}

        {/* Theme meta tags */}
        <meta name="color-scheme" content="dark light" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#ffffff"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#0a0a0a"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Client-side theme wrapper - mantém SSR */}
        <ClientThemeWrapper>
          <AuthProvider>
            {/* Navbar como client component */}
            <Navbar />

            {/* Main content - pode ser server ou client components */}
            <main className="min-h-screen">{children}</main>
          </AuthProvider>
        </ClientThemeWrapper>
      </body>
    </html>
  );
}
