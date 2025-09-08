// app/layout.tsx - Layout raiz mínimo para páginas globais
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientThemeWrapper } from './components/ClientThemeWrapper';
import AuthProvider from './providers/AuthProvider';
import { getServerLanguageStatic } from './utils/translations/serverTranslations';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Opus Atlas - Enciclopédia de Música Clássica',
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
    },
    en: {
      title: 'Opus Atlas - Classical Music Encyclopedia',
      description:
        'Explore, learn, and practice classical music with our interactive encyclopedia. Discover composers, works, and improve your musical skills.',
      keywords: [
        'classical music',
        'composers',
        'sheet music',
        'music education',
        'piano',
        'music study',
      ],
    },
  };

  const t = content[lang] || content.pt;

  return {
    title: {
      template: `%s | Opus Atlas`,
      default: t.title,
    },
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas Team' }],
    creator: 'Opus Atlas',
    openGraph: {
      type: 'website',
      locale: lang === 'pt' ? 'pt_BR' : 'en_US',
      url:
        lang === 'pt' ? 'https://opusatlas.com.br' : 'https://opusatlas.com/en',
      siteName: 'Opus Atlas',
      images: [
        {
          url: '/logo-opus-atlas.jpeg',
          width: 1200,
          height: 630,
          alt: 'Opus Atlas - Classical Music Encyclopedia',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/logo-opus-atlas.jpeg'],
      title: t.title,
      description: t.description,
    },

    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical:
        lang === 'pt' ? 'https://opusatlas.com.br' : 'https://opusatlas.com',
      languages: {
        'pt-BR': 'https://opusatlas.com.br',
        'en-US': 'https://opusatlas.com',
      },
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};
export const dynamic = 'force-dynamic';

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

        {/* Umami Analytics - Movido para o body */}
        <Script
          src="https://analytics.opusatlas.com.br/analytics"
          data-website-id="f3475284-e507-4e7e-af4a-3a1ecd932652"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
