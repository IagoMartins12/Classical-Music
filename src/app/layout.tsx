// app/layout.tsx - Versão otimizada para performance
import { imagemPadrao } from '@/app/utils/ogImagem';
import { SITE_URL } from '@/app/utils/seoAlternates';
import type { Metadata, Viewport } from 'next';
import { EB_Garamond, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ClientThemeWrapper } from './components/ClientThemeWrapper';
import AuthProvider from './providers/AuthProvider';
import { getBuildLanguage } from './utils/translations/serverTranslations';
import Script from 'next/script';
import { CartoesQueViram } from '@/app/components/ui/CartoesQueViram';

/**
 * As três famílias do sistema, e por que são três.
 *
 * **A Inter era baixada e nunca aplicada.** Ela expunha `--font-inter`, que
 * nada consumia, enquanto o `globals.css` pedia `font-family: 'Inter'` pelo
 * nome literal — e o `next/font` registra a família sob um nome gerado. O
 * site inteiro caía na fonte do sistema.
 *
 * **Garamond** carrega o que é o acervo: nome de obra, de compositor, título.
 * Não por ser bonita: é a letra das primeiras edições impressas de música.
 * **Geist** carrega a interface. **Geist Mono** carrega dado que se compara na
 * vertical (BWV 1007, op. 27 n.º 2, 18 min), onde largura fixa alinha a coluna
 * sozinha.
 *
 * A sans e a Garamond são pré-carregadas: a sans pinta o primeiro texto de
 * qualquer tela, e a Garamond é o título de obra e de compositor — o maior
 * texto da página, o LCP. Medido em 24/10 (Lighthouse, celular, build local):
 * a obra foi de LCP 7,1 s para 4,5 s (nota 70 → 82) ao pré-carregá-la.
 */
const sans = Geist({
  subsets: ['latin'],
  variable: '--fonte-sans-next',
  display: 'swap',
  preload: true,
});

const display = EB_Garamond({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--fonte-display-next',
  display: 'swap',
  preload: true,
});

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--fonte-mono-next',
  display: 'swap',
  preload: false,
});

/**
 * **Por que o idioma aqui não vem do cookie.**
 *
 * `getServerLanguageStatic()` lê `cookies()` e `headers()`. Uma leitura dessas
 * no layout raiz é uma API dinâmica no topo da árvore: ela desliga a
 * renderização estática de **todas** as rotas do app — as 373, inclusive as do
 * blog, que já declaravam `revalidate` e não dependiam de idioma nenhum. Era o
 * motivo de o site inteiro renderizar do zero a cada visita anônima.
 *
 * O que este layout fazia com o idioma era `<html lang>` e os metadados. O
 * primeiro o script anti-flash já reescreve antes da pintura, lendo a
 * preferência do próprio navegador; os segundos passam a sair no idioma do
 * build, com o `hreflang` de sempre apontando as duas versões.
 *
 * O idioma do conteúdo continua valendo e virou dimensão de cache: as páginas
 * públicas vivem sob `[lang]`, e o middleware escolhe a variante sem mudar a
 * URL (ver `middleware.ts` e `utils/translations/routeLanguage.ts`).
 */
export async function generateMetadata(): Promise<Metadata> {
  const language = getBuildLanguage();

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
    // Relative Open Graph and Twitter images resolve against the real site,
    // not the host that rendered the page.
    metadataBase: new URL(SITE_URL),
    title: {
      template: `%s | Opus Atlas`,
      default: t.title,
    },
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas Team' }],
    creator: 'Opus Atlas',
    openGraph: {
      images: imagemPadrao(language),
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      // Um domínio para os dois idiomas — ver `defaultMetadata.ts`.
      url: 'https://opusatlas.com.br',
      siteName: 'Opus Atlas',
    },
    twitter: {
      card: 'summary_large_image',
      title: t.ogTitle,
      description: t.ogDescription,
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
      canonical: 'https://opusatlas.com.br',
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
  }
  // App instalado (tela de início): marca a página antes da primeira pintura.
  // O iPhone diz isso por navigator.standalone; a media query sozinha já
  // falhou em versões dele, e a barra do topo ficava sob o entalhe.
  try{
    if(navigator.standalone===true||matchMedia('(display-mode: standalone)').matches){
      document.documentElement.classList.add('app-instalado');
    }
  }catch{}
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

/**
 * Hides the installed app's opening (`.abertura-do-app`) once the first page
 * has fully arrived (`load`: the streamed HTML, styles and images), with a
 * ceiling so a slow image never keeps it up. Runs before React: the opening
 * must go even if the page's scripts are still on their way.
 *
 * The app opens on `public/abertura.html`, which shows the same opening at
 * once and notes when it started: here the animation goes on from that
 * point (`--abertura-atraso`) and stays up for a minimum time, so it is seen
 * instead of flashing. A reload without it keeps a shorter minimum.
 */
const aberturaScript = `(function(){
  var h=document.documentElement,inicio=0;
  try{
    var v=Number(sessionStorage.getItem('opus-atlas:abertura'));
    sessionStorage.removeItem('opus-atlas:abertura');
    if(v&&Date.now()-v<20000)inicio=v;
  }catch(e){}
  if(inicio)h.style.setProperty('--abertura-atraso',(inicio-Date.now())+'ms');
  var some=function(){h.classList.add('app-pronto');};
  var pronto=function(){
    var falta=inicio?1600-(Date.now()-inicio):900-performance.now();
    setTimeout(some,Math.max(0,falta));
  };
  if(document.readyState==='complete')pronto();
  else addEventListener('load',pronto,{once:true});
  setTimeout(some,8000);
})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // O script anti-flash abaixo sobrescreve `lang` antes da pintura, a partir
  // da preferência do navegador — este é o valor do HTML gerado.
  const htmlLang = getBuildLanguage() === 'pt' ? 'pt-BR' : 'en-US';

  return (
    // As variáveis das fontes ficam no `<html>`, não no `<body>`: o
    // `globals.css` monta `--fonte-sans` no `:root`, e uma variável só enxerga
    // o que existe no próprio elemento ou acima dele. No `<body>`, as três
    // famílias chegavam vazias e o site caía na fonte do sistema.
    <html
      lang={htmlLang}
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* 🚀 Script anti-flash otimizado */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />

        {/* Preconnect só para o que existe: o Google Analytics. */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* Meta tags essenciais */}
        <meta name="color-scheme" content="dark light" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#faf7f0"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#0c0d12"
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
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        {/* The app (PWA): the manifest link comes from `app/manifest.ts`;
            these are what iOS reads when the site is added to the home
            screen. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Opus Atlas" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        <meta name="msapplication-TileColor" content="#0c0d12" />
      </head>
      <body className="antialiased">
        {/* The installed app's opening: the seal while the first page
            arrives (`.abertura-do-app` in `globals.css`). */}
        <div className="abertura-do-app" aria-hidden="true">
          <span className="abertura-orbita">
            <span className="marca marca-simbolo abertura-selo" />
          </span>
          <span className="marca abertura-nome" />
        </div>
        <script dangerouslySetInnerHTML={{ __html: aberturaScript }} />
        <ClientThemeWrapper>
          <AuthProvider>{children}</AuthProvider>
          <CartoesQueViram />
        </ClientThemeWrapper>

        {/* Analytics wait for the page to finish loading (`lazyOnload`):
            176 kB of gtag no longer compete with the first paint. */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-W2993PXTWQ"
              strategy="lazyOnload"
            />
            <Script id="ga" strategy="lazyOnload">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-W2993PXTWQ');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
