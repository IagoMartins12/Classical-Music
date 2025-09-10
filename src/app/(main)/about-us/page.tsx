// app/about-us/page.tsx - Otimizado para SEO Musical
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { Metadata } from 'next';
import AboutPage from './pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Sobre Nós - Opus Atlas | Enciclopédia de Música Clássica',
      description:
        'Conheça o Opus Atlas: a enciclopédia musical que democratiza o acesso à música clássica. Partituras gratuitas de Bach, Chopin, Beethoven, Mozart e milhares de compositores. Plataforma educacional para estudantes de piano, violino e música erudita.',
      keywords: [
        'sobre opus atlas',
        'enciclopédia música clássica',
        'plataforma educacional música',
        'partituras gratuitas',
        'estudar música clássica',
        'educação musical online',
        'música erudita',
        'música romântica',
        'história música clássica',
        'democratização música',
        'estudantes música',
        'piano clássico',
        'violino clássico',
        'conservatório virtual',
        'partitura domínio público',
      ],
      ogTitle: 'Sobre o Opus Atlas - Enciclopédia Musical Gratuita',
      ogDescription:
        'Democratizando o acesso à música clássica com partituras gratuitas de grandes mestres como Chopin, Bach, Beethoven e Mozart.',
    },
    en: {
      title: 'About Us - Opus Atlas | Classical Music Encyclopedia',
      description:
        'Discover Opus Atlas: the musical encyclopedia democratizing access to classical music. Free sheet music from Bach, Chopin, Beethoven, Mozart and thousands of composers. Educational platform for piano, violin and classical music students.',
      keywords: [
        'about opus atlas',
        'classical music encyclopedia',
        'music education platform',
        'free sheet music',
        'learn classical music',
        'online music education',
        'classical music',
        'romantic music',
        'classical music history',
        'music democratization',
        'music students',
        'classical piano',
        'classical violin',
        'virtual conservatory',
        'public domain scores',
      ],
      ogTitle: 'About Opus Atlas - Free Musical Encyclopedia',
      ogDescription:
        'Democratizing access to classical music with free sheet music from great masters like Chopin, Bach, Beethoven and Mozart.',
    },
  };

  const t = content[language];

  return {
    title: t.title,
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
          ? 'https://opusatlas.com.br/about-us'
          : 'https://opusatlas.com.br/about-us',
      siteName: 'Opus Atlas',
      images: [
        {
          url: 'https://opusatlas.com.br/logo-opus-atlas.jpeg',
          width: 1200,
          height: 630,
          alt:
            language === 'pt'
              ? 'Sobre o Opus Atlas - Enciclopédia Musical'
              : 'About Opus Atlas - Musical Encyclopedia',
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
          ? 'https://opusatlas.com.br/about-us'
          : 'https://opusatlas.com.br/about-us',
      languages: {
        'pt-BR': 'https://opusatlas.com.br/about-us',
        'en-US': 'https://opusatlas.com.br/about-us',
      },
    },
  };
}

export const revalidate = 3600;

export default async function AboutPageRoute() {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/about-us',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <AboutPage />;
    </TranslationProvider>
  );
}
