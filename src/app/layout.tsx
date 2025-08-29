// app/layout.tsx - Layout raiz mínimo para páginas globais
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientThemeWrapper } from './components/ClientThemeWrapper';
import AuthProvider from './providers/AuthProvider';
import { getServerLanguageStatic } from './utils/translations/serverTranslations';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLanguageStatic();

  const content = {
    pt: {
      // title: 'Opus Atlas - Enciclopédia de Música Clássica',
      // description:
      //   'Explore, aprenda e pratique música clássica com nossa enciclopédia interativa. Descubra compositores, obras e desenvolva suas habilidades musicais.',
      notFoundTitle: 'Página não encontrada - Opus Atlas',
      notFoundDescription:
        'A página solicitada não foi encontrada em nossa enciclopédia musical.',
      errorTitle: 'Erro - Opus Atlas',
      errorDescription:
        'Ocorreu um erro inesperado. Nossa equipe foi notificada.',
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
      // title: 'Opus Atlas - Classical Music Encyclopedia',
      // description:
      //   'Explore, learn, and practice classical music with our interactive encyclopedia. Discover composers, works, and improve your musical skills.',
      notFoundTitle: 'Page not found - Opus Atlas',
      notFoundDescription:
        'The requested page was not found in our musical encyclopedia.',
      errorTitle: 'Error - Opus Atlas',
      errorDescription:
        'An unexpected error occurred. Our team has been notified.',
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
    // title: {
    //   template: `%s | Opus Atlas`,
    //   default: t.title,
    // },
    // description: t.description,

    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas Team' }],
    creator: 'Opus Atlas',
    openGraph: {
      // title: t.title,
      // description: t.description,
      type: 'website',
      locale: lang === 'pt' ? 'pt_BR' : 'en_US',
      url:
        lang === 'pt' ? 'https://opusatlas.com.br' : 'https://opusatlas.com/en',
    },
    twitter: {
      card: 'summary_large_image',
      // title: t.title,
      // description: t.description,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical:
        lang === 'pt' ? 'https://opusatlas.com.br' : 'https://opusatlas.com/en',
      languages: {
        'pt-BR': 'https://opusatlas.com.br',
        'en-US': 'https://opusatlas.com/en',
      },
    }, // Adicionar metadata customizado para páginas especiais
    other: {
      'not-found-title': t.notFoundTitle,
      'not-found-description': t.notFoundDescription,
      'error-title': t.errorTitle,
      'error-description': t.errorDescription,
    },
  };
}

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
