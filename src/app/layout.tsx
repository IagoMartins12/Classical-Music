// app/layout.tsx - Layout raiz mínimo para páginas globais
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientThemeWrapper } from './components/ClientThemeWrapper';
import AuthProvider from './providers/AuthProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Opus Atlas',
    default: 'Opus Atlas - Enciclopédia de Música Clássica',
  },
  description:
    'Explore, aprenda e pratique música clássica com nossa enciclopédia interativa.',
  keywords: [
    'música clássica',
    'compositores',
    'partituras',
    'educação musical',
    'piano',
    'estudo musical',
  ],
  authors: [{ name: 'Opus Atlas Team' }],
  creator: 'Opus Atlas',
  openGraph: {
    title: 'Opus Atlas - Enciclopédia de Música Clássica',
    description:
      'Explore, aprenda e pratique música clássica com nossa enciclopédia interativa.',
    type: 'website',
    locale: 'pt_BR',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
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
        <ClientThemeWrapper>
          <AuthProvider>{children}</AuthProvider>
        </ClientThemeWrapper>
      </body>
    </html>
  );
}
