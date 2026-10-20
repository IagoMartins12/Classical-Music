// app/music-history/page.tsx - História da música SUPER otimizada
import { HistoryIndex } from '@/app/components/site/history/HistoryIndex';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';
import { alternatesFor } from '@/app/utils/seoAlternates';

/** `[lang]` é quem decide o idioma desta página — ver `routeLanguage`. */
interface LangPageProps {
  params: LangParams;
}

export async function generateMetadata({ params }: LangPageProps) {
  const language = await routeLanguage(params);

  const content = {
    pt: {
      title:
        'História da Música Clássica - Opus Atlas | Medieval ao Contemporâneo',
      description:
        'A história da música erudita em sete épocas, do canto gregoriano a quem compõe hoje: o que mudou em cada uma, como a música soa e por onde começar a ouvir.',
      keywords: [
        'história música clássica',
        'períodos musicais',
        'música barroca Bach',
        'período clássico Mozart',
        'romantismo Chopin',
        'impressionismo Debussy',
        'música medieval',
        'renascimento musical',
        'compositores famosos história',
        'evolução música erudita',
        'marcos históricos música',
        'características períodos musicais',
        'escola musical alemã',
        'escola musical francesa',
        'escola musical italiana',
        'nacionalismo musical',
        'música contemporânea',
        'história conservatório',
        'desenvolvimento harmonia',
        'evolução formas musicais',
        'cronologia música clássica',
        'grandes mestres música',
        'revolução musical',
        'tradição clássica',
        'herança musical',
      ],
      ogTitle: 'História da Música Clássica - Jornada através dos Séculos',
      ogDescription:
        'Uma viagem completa pela história da música clássica, dos grandes mestres às revoluções musicais que moldaram nossa cultura.',
    },
    en: {
      title: 'Classical Music History - Opus Atlas | Medieval to Contemporary',
      description:
        'The history of classical music in seven eras, from Gregorian chant to the composers of today: what changed in each, how the music sounds and where to start listening.',
      keywords: [
        'classical music history',
        'musical periods',
        'baroque music Bach',
        'classical period Mozart',
        'romanticism Chopin',
        'impressionism Debussy',
        'medieval music',
        'musical renaissance',
        'famous composers history',
        'classical music evolution',
        'musical historical landmarks',
        'musical periods characteristics',
        'German musical school',
        'French musical school',
        'Italian musical school',
        'musical nationalism',
        'contemporary music',
        'conservatory history',
        'harmony development',
        'musical forms evolution',
        'classical music chronology',
        'great music masters',
        'musical revolution',
        'classical tradition',
        'musical heritage',
      ],
      ogTitle: 'Classical Music History - Journey through the Centuries',
      ogDescription:
        'A complete journey through classical music history, from great masters to musical revolutions that shaped our culture.',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas History Team' }],
    creator: 'Opus Atlas',
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url:
        language === 'pt'
          ? 'https://opusatlas.com.br/music-history'
          : 'https://opusatlas.com.br/music-history',
      siteName: 'Opus Atlas',
      images: [
        {
          url: 'https://opusatlas.com.br/logo-opus-atlas.jpeg',
          width: 1200,
          height: 630,
          alt:
            language === 'pt'
              ? 'História da Música Clássica'
              : 'Classical Music History',
        },
      ],
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
    alternates: alternatesFor('/music-history', language),
  };
}

export const revalidate = 3600;

export default async function MusicClassicHistoryPage({
  params,
}: LangPageProps) {
  const language = await routeLanguage(params);
  return <HistoryIndex language={language} />;
}
