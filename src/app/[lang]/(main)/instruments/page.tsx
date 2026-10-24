// app/instruments/page.tsx - Instrumentos históricos ULTRA otimizado
import { imagemPadrao } from '@/app/utils/ogImagem';
import { Metadata } from 'next';
import { InstrumentsIndex } from '@/app/components/site/instruments/InstrumentsIndex';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';
import { alternatesFor } from '@/app/utils/seoAlternates';

/** `[lang]` é quem decide o idioma desta página — ver `routeLanguage`. */
interface LangPageProps {
  params: LangParams;
}

export async function generateMetadata({
  params,
}: LangPageProps): Promise<Metadata> {
  const language = await routeLanguage(params);

  const content = {
    pt: {
      title:
        'Instrumentos Clássicos - Opus Atlas | Piano, Violino, Órgão Histórico',
      description:
        'De onde vieram e como funcionam o piano, o violino, o órgão, a harpa, a flauta e os outros instrumentos da música de concerto, com o que ouvir em cada um.',
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
        'Where the piano, violin, organ, harp, flute and the other instruments of concert music came from, how they work and what to hear on each.',
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
      images: imagemPadrao(language),
    },
    twitter: {
      card: 'summary_large_image',
      title: t.ogTitle,
      description: t.ogDescription,

      images: imagemPadrao(language),
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
    alternates: alternatesFor('/instruments', language),
  };
}

export const revalidate = 3600;

export default async function InstrumentsPage({ params }: LangPageProps) {
  const language = await routeLanguage(params);
  return <InstrumentsIndex language={language} />;
}
