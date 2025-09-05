// app/music-history/page.tsx - História da música SUPER otimizada
import { Suspense } from 'react';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';
import { MusicHistoryPageServer } from './pageServer';
import LoadingSkeleton from './loading';

export async function generateMetadata() {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title:
        'História da Música Clássica - Opus Atlas | Medieval ao Contemporâneo',
      description:
        'Conheça a fascinante evolução da música clássica desde o período medieval até os tempos modernos. Bach no barroco, Mozart no clássico, Chopin no romântico, Debussy no impressionismo. Explore compositores famosos, características de cada época e marcos históricos.',
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
        'Discover the fascinating evolution of classical music from medieval period to modern times. Bach in baroque, Mozart in classical, Chopin in romantic, Debussy in impressionism. Explore famous composers, characteristics of each era and historical landmarks.',
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
          url: '/images/og/music-history.jpg',
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
    alternates: {
      canonical:
        language === 'pt'
          ? 'https://opusatlas.com.br/music-history'
          : 'https://opusatlas.com.br/music-history',
      languages: {
        'pt-BR': 'https://opusatlas.com.br/music-history',
        'en-US': 'https://opusatlas.com.br/music-history',
      },
    },
  };
}

export const revalidate = 3600;

export default async function MusicClassicHistoryPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <MusicHistoryPageServer />
    </Suspense>
  );
}
