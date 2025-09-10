// app/instruments/page.tsx - Instrumentos históricos ULTRA otimizado
import { Metadata } from 'next';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';
import { InstrumentsPageServer } from './pageServer';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title:
        'Instrumentos Clássicos - Opus Atlas | Piano, Violino, Órgão Histórico',
      description:
        'Explore a rica história dos instrumentos de música clássica. Piano de Bach, violino Stradivarius, órgão barroco, harpa de concerto. Evolução dos instrumentos que moldaram obras de Chopin, Beethoven, Mozart e grandes mestres.',
      keywords: [
        'instrumentos música clássica',
        'piano clássico história',
        'violino Stradivarius',
        'órgão barroco',
        'harpa concerto',
        'violoncelo história',
        'cravo Bach',
        'piano Chopin',
        'violino Paganini',
        'instrumentos barrocos',
        'instrumentos românticos',
        'piano forte',
        'viola da gamba',
        'flauta traversa',
        'instrumentos período clássico',
        'evolução piano',
        'história violino',
        'instrumentos orquestra',
        'música câmara instrumentos',
        'conservatório instrumentos',
        'estudo instrumentos clássicos',
        'técnica instrumental',
        'metodologia piano',
        'escola violino',
        'repertório instrumental',
      ],
      ogTitle: 'Instrumentos Clássicos - História e Evolução Musical',
      ogDescription:
        'Descubra a fascinante evolução dos instrumentos que deram vida às obras dos grandes mestros da música clássica.',
    },
    en: {
      title:
        'Classical Instruments - Opus Atlas | Piano, Violin, Historical Organ',
      description:
        'Explore the rich history of classical music instruments. Bach piano, Stradivarius violin, baroque organ, concert harp. Evolution of instruments that shaped works by Chopin, Beethoven, Mozart and great masters.',
      keywords: [
        'classical music instruments',
        'classical piano history',
        'Stradivarius violin',
        'baroque organ',
        'concert harp',
        'cello history',
        'Bach harpsichord',
        'Chopin piano',
        'Paganini violin',
        'baroque instruments',
        'romantic instruments',
        'pianoforte',
        'viola da gamba',
        'traverso flute',
        'classical period instruments',
        'piano evolution',
        'violin history',
        'orchestra instruments',
        'chamber music instruments',
        'conservatory instruments',
        'classical instruments study',
        'instrumental technique',
        'piano methodology',
        'violin school',
        'instrumental repertoire',
      ],
      ogTitle: 'Classical Instruments - History and Musical Evolution',
      ogDescription:
        'Discover the fascinating evolution of instruments that gave life to works by the great masters of classical music.',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas Music History Team' }],
    creator: 'Opus Atlas',
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url:
        language === 'pt'
          ? 'https://opusatlas.com.br/instruments'
          : 'https://opusatlas.com.br/instruments',
      siteName: 'Opus Atlas',
      images: [
        {
          url: 'https://opusatlas.com.br/logo-opus-atlas.jpeg',
          width: 1200,
          height: 630,
          alt:
            language === 'pt'
              ? 'Instrumentos Clássicos Históricos'
              : 'Historical Classical Instruments',
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
          ? 'https://opusatlas.com.br/instruments'
          : 'https://opusatlas.com.br/instruments',
      languages: {
        'pt-BR': 'https://opusatlas.com.br/instruments',
        'en-US': 'https://opusatlas.com.br/instruments',
      },
    },
  };
}

export const revalidate = 3600;

export default async function InstrumentsPage() {
  return <InstrumentsPageServer />;
}
