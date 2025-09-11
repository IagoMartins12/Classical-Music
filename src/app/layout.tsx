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
  const language = await getServerLanguageStatic();

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
      ogTitle: 'Opus Atlas - Enciclopédia Musical Gratuita',
      ogDescription:
        'Democratizando o acesso à música clássica com partituras gratuitas de grandes mestres como Chopin, Bach, Beethoven e Mozart.',
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
      ogTitle: 'Opus Atlas - Free Musical Encyclopedia',
      ogDescription:
        'Democratizing access to classical music with free sheet music from great masters like Chopin, Bach, Beethoven and Mozart.',
    },
  };

  const t = content[language] || content.pt;

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
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url:
        language === 'pt'
          ? 'https://opusatlas.com.br'
          : 'https://opusatlas.com',
      siteName: 'Opus Atlas',
      images: [
        {
          url: 'https://opusatlas.com.br/logo-opus-atlas.jpeg',
          width: 1200,
          height: 630,
          alt: 'Opus Atlas - Classical Music Encyclopedia',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.ogTitle,
      description: t.ogDescription,
      images: ['https://opusatlas.com.br/logo-opus-atlas.jpeg'],
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
    alternates: {
      canonical:
        language === 'pt'
          ? 'https://opusatlas.com.br'
          : 'https://opusatlas.com',
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

// 🎯 Script otimizado para evitar flash de tema/linguagem
const themeScript = `(function() {
  'use strict';
  
  function getSystemTheme() {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  function getSystemLanguage() {
    if (typeof navigator === 'undefined') return 'pt';
    const browserLang = navigator.language || navigator.languages?.[0] || 'pt';
    return browserLang.toLowerCase().startsWith('pt') ? 'pt' : 'en';
  }
  
  function getStoredData(key) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
  
  function applyBasicTheme(mode) {
    const root = document.documentElement;
    root.setAttribute('data-theme', mode);
    
    if (mode === 'dark') {
      root.style.setProperty('--bg-primary', '#0A0A0B');
      root.style.setProperty('--text-primary', '#FFFFFF');
      root.style.setProperty('--bg-secondary', '#141416');
      root.style.setProperty('--bg-elevated', '#1A1A1C');
    } else {
      root.style.setProperty('--bg-primary', '#FFFFFF');
      root.style.setProperty('--text-primary', '#1A1A1A');
      root.style.setProperty('--bg-secondary', '#F8F9FA');
      root.style.setProperty('--bg-elevated', '#FFFFFF');
    }
  }
  
  function determineTheme() {
    const themeData = getStoredData('classical-music-theme');
    if (themeData?.state?.hasUserPreference) {
      return themeData.state.mode || 'dark';
    }
    return getSystemTheme();
  }
  
  function determineLanguage() {
    const langData = getStoredData('opus-atlas-language');
    if (langData?.state?.hasUserPreference) {
      return langData.state.language || 'pt';
    }
    return getSystemLanguage();
  }
  
  // 🚀 Aplicar configurações
  try {
    const theme = determineTheme();
    const language = determineLanguage();
    
    applyBasicTheme(theme);
    document.documentElement.setAttribute('data-language', language);
    
    // 🆕 Atualizar lang do HTML dinamicamente
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en-US';
    
  } catch (error) {
    applyBasicTheme('dark');
    document.documentElement.setAttribute('data-language', 'pt');
    document.documentElement.lang = 'pt-BR';
  }
})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🆕 Obter linguagem para o HTML inicial
  const serverLanguage = await getServerLanguageStatic();
  const htmlLang = serverLanguage === 'pt' ? 'pt-BR' : 'en-US';

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <head>
        {/* 🎯 Script anti-flash - DEVE ser o primeiro */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />

        {/* Meta tags de tema */}
        <meta name="color-scheme" content="dark light" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#ffffff"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#0a0a0b"
        />

        {/* SEO e favicons */}
        <meta
          name="google-site-verification"
          content="XC9v3XyFFCT6IhoCOH1NuuhJBju232tXhlZDCcNEiFU"
        />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientThemeWrapper>
          <AuthProvider>{children}</AuthProvider>
        </ClientThemeWrapper>

        {/* 🆕 Google Analytics 4 */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-W2993PXTWQ"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-W2993PXTWQ', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
              `}
            </Script>
          </>
        )}

        {/* Umami Analytics */}
        {process.env.NODE_ENV === 'production' && (
          <Script
            src="https://analytics.opusatlas.com.br/analytics"
            data-website-id="f3475284-e507-4e7e-af4a-3a1ecd932652"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
