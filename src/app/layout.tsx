// app/layout.tsx - Versão otimizada para performance
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
  preload: true, // 🚀 Precarregar fonte
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
  viewportFit: 'cover',
};

// 🚀 Script anti-flash OTIMIZADO - reduzido pela metade
const themeScript = `(function(){
  'use strict';
  function getSystem(){
    if(typeof window==='undefined')return{theme:'dark',lang:'pt'};
    return{
      theme:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light',
      lang:navigator.language?.toLowerCase().startsWith('pt')?'pt':'en'
    };
  }
  function getStored(key){
    try{
      const stored=localStorage.getItem(key);
      return stored?JSON.parse(stored):null;
    }catch{return null;}
  }
  function apply(mode,lang){
    const root=document.documentElement;
    root.setAttribute('data-theme',mode);
    root.setAttribute('data-language',lang);
    root.lang=lang==='pt'?'pt-BR':'en-US';
    
    if(mode==='dark'){
      root.style.setProperty('--bg-primary','#0a0a0a');
      root.style.setProperty('--text-primary','#FFFFFF');
      root.style.setProperty('--bg-secondary','#1a1a2e');
      root.style.setProperty('--bg-elevated','#2d3748');
    }else{
      root.style.setProperty('--bg-primary','#faf9f6');
      root.style.setProperty('--text-primary','#2d2a23');
      root.style.setProperty('--bg-secondary','#f4f1eb');
      root.style.setProperty('--bg-elevated','#FFFFFF');
    }
  }
  try{
    const system=getSystem();
    const themeData=getStored('classical-music-theme');
    const langData=getStored('opus-atlas-language');
    
    const theme=themeData?.state?.hasUserPreference?themeData.state.mode:system.theme;
    const language=langData?.state?.hasUserPreference?langData.state.language:system.lang;
    
    apply(theme||'dark',language||'pt');
  }catch{
    apply('dark','pt');
  }
})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const serverLanguage = await getServerLanguageStatic();
  const htmlLang = serverLanguage === 'pt' ? 'pt-BR' : 'en-US';

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <head>
        {/* 🚀 Script anti-flash otimizado */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />

        {/* 🚀 Preconnect para analytics - acelerar carregamento */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://analytics.opusatlas.com.br" />

        {/* Meta tags essenciais */}
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

        {/* SEO */}
        <meta
          name="google-site-verification"
          content="XC9v3XyFFCT6IhoCOH1NuuhJBju232tXhlZDCcNEiFU"
        />

        {/* Favicons otimizados */}
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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        <meta name="msapplication-TileColor" content="#da532c" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientThemeWrapper>
          <AuthProvider>{children}</AuthProvider>
        </ClientThemeWrapper>

        {/* 🚀 Analytics otimizados - carregamento assíncrono */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-W2993PXTWQ"
              strategy="afterInteractive"
            />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-W2993PXTWQ');`}
            </Script>
            <Script
              src="https://analytics.opusatlas.com.br/analytics"
              data-website-id="f3475284-e507-4e7e-af4a-3a1ecd932652"
              strategy="afterInteractive"
            />
          </>
        )}
      </body>
    </html>
  );
}
