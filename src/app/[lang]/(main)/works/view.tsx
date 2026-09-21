// app/[lang]/(main)/works/view.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';
import WorksServer from './pageServer';
import WorksLoading from './WorksLoading';
import type { Language } from '@/app/utils/translations/serverTranslations';
import { alternatesFor } from '@/app/utils/seoAlternates';

/**
 * O que a rota `/works` desenha, sem saber de onde vieram os parâmetros.
 *
 * **Por que este arquivo existe.** No Next 15, ler `searchParams` em qualquer
 * ponto de uma rota a torna dinâmica: ela renderiza do zero a cada visita e o
 * `revalidate` declarado não vale nada. Mas a visita que importa — a do Google
 * e a do menu — chega sem filtro nenhum.
 *
 * Então a rota foi partida em duas que desenham exatamente a mesma coisa:
 * `page.tsx`, sem `searchParams`, que o Next gera e guarda; e
 * `filtered/page.tsx`, que lê os filtros e renderiza sob demanda, como antes —
 * inclusive o metadata, que muda com a busca, o instrumento e o compositor. O
 * `middleware.ts` manda a visita para uma ou outra conforme haja query string,
 * sem mudar a URL que o visitante vê.
 */

export interface WorksSearchParams {
  // Índice aberto porque `getCachedMetadata` recebe o objeto cru da URL.
  [key: string]: string | undefined;
  page?: string;
  composer?: string;
  genre?: string;
  instrument?: string;
  epoch?: string;
  search?: string;
  workGenresArr?: string;
  categoryNames?: string;
}

export function WorksView({
  searchParams,
  language,
}: {
  searchParams: WorksSearchParams;
  language: Language;
}) {
  return (
    <Suspense fallback={<WorksLoading />}>
      <WorksServer searchParams={searchParams} language={language} />
    </Suspense>
  );
}

// Cache inteligente para metadata - 2 horas
const getCachedMetadata = unstable_cache(
  async (
    searchParams: Record<string, string | undefined>,
    language: 'pt' | 'en'
  ) => {
    const page = parseInt(searchParams.page || '1');
    const search = searchParams.search;
    const instrument = searchParams.instrument;
    const composer = searchParams.composer;

    const content = {
      pt: {
        baseTitle: 'Obras de Música Clássica - Partituras Gratuitas',
        baseDescription:
          'Explore milhares de obras de música clássica organizadas por compositor, instrumento e época. Partituras gratuitas de Bach, Chopin, Beethoven, Mozart. Sonata ao Luar, Valsa das Flores, estudos, sonatas e sinfonias completas.',
        searchTitle: `Buscar Obras: "${search}" - Partituras Clássicas`,
        searchDescription: `Resultados da busca por "${search}" em nossa coleção de obras clássicas e partituras gratuitas.`,
        instrumentTitle: `Obras para ${instrument} - Partituras Clássicas`,
        instrumentDescription: `Descubra obras clássicas para ${instrument}. Partituras gratuitas organizadas por compositor e dificuldade.`,
        composerTitle: `Obras de ${composer} - Partituras Completas`,
        composerDescription: `Explore todas as obras de ${composer}. Partituras gratuitas, análises e guias de estudo completos.`,
        keywords: [
          'obras música clássica',
          'partituras gratuitas',
          'Bach obras completas',
          'Chopin partituras piano',
          'Beethoven sonatas',
          'Mozart sinfonias',
          'sonata ao luar',
          'moonlight sonata',
          'valsa das flores',
          'estudos Chopin',
          'partituras violino',
          'partituras piano',
          'obras barrocas',
          'obras românticas',
          'música clássica PDF',
          'IMSLP partituras',
          'download partituras',
          'estudar música clássica',
          'conservatório partituras',
          'educação musical',
          'análise musical',
          'interpretação clássica',
        ],
      },
      en: {
        baseTitle: 'Classical Music Works - Free Sheet Music',
        baseDescription:
          'Explore thousands of classical music works organized by composer, instrument and era. Free sheet music from Bach, Chopin, Beethoven, Mozart. Moonlight Sonata, Waltz of the Flowers, studies, sonatas and complete symphonies.',
        searchTitle: `Search Works: "${search}" - Classical Scores`,
        searchDescription: `Search results for "${search}" in our collection of classical works and free sheet music.`,
        instrumentTitle: `Works for ${instrument} - Classical Scores`,
        instrumentDescription: `Discover classical works for ${instrument}. Free sheet music organized by composer and difficulty.`,
        composerTitle: `Works by ${composer} - Complete Scores`,
        composerDescription: `Explore all works by ${composer}. Free sheet music, analyses and complete study guides.`,
        keywords: [
          'classical music works',
          'free sheet music',
          'Bach complete works',
          'Chopin piano scores',
          'Beethoven sonatas',
          'Mozart symphonies',
          'moonlight sonata',
          'waltz of the flowers',
          'Chopin etudes',
          'violin sheet music',
          'piano sheet music',
          'baroque works',
          'romantic works',
          'classical music PDF',
          'IMSLP scores',
          'sheet music download',
          'study classical music',
          'conservatory scores',
          'music education',
          'musical analysis',
          'classical interpretation',
        ],
      },
    };

    const t = content[language];

    let title = t.baseTitle;
    let description = t.baseDescription;

    if (search) {
      title = t.searchTitle;
      description = t.searchDescription;
    } else if (instrument) {
      title = t.instrumentTitle;
      description = t.instrumentDescription;
    } else if (composer) {
      title = t.composerTitle;
      description = t.composerDescription;
    }

    if (page > 1) {
      title += ` - Página ${page}`;
    }

    return { title, description, keywords: t.keywords };
  },
  ['works-metadata'],
  {
    revalidate: 7200,
    tags: ['works-metadata'],
  }
);

export async function worksMetadata(
  language: Language,
  searchParams: WorksSearchParams = {}
): Promise<Metadata> {
  const { title, description, keywords } = await getCachedMetadata(
    searchParams,
    language
  );

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'Opus Atlas' }],
    creator: 'Opus Atlas',
    openGraph: {
      title,
      description,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url: 'https://opusatlas.com.br/works',
      siteName: 'Opus Atlas',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: alternatesFor('/works', language),
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
  };
}
