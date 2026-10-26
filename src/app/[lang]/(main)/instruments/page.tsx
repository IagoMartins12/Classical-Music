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
      ogTitle: 'Instrumentos Clássicos - História e Evolução Musical',
      ogDescription:
        'Descubra a fascinante evolução dos instrumentos que deram vida às obras dos grandes mestros da música clássica.',
    },
    en: {
      title:
        'Classical Instruments - Opus Atlas | Piano, Violin, Historical Organ',
      description:
        'Where the piano, violin, organ, harp, flute and the other instruments of concert music came from, how they work and what to hear on each.',
      ogTitle: 'Classical Instruments - History and Musical Evolution',
      ogDescription:
        'Discover the fascinating evolution of instruments that gave life to works by the great masters of classical music.',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
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
