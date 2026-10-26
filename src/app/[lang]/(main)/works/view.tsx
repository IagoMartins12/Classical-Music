// app/[lang]/(main)/works/view.tsx
import { imagemPadrao } from '@/app/utils/ogImagem';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { WorksList } from '@/app/components/site/lists/WorksList';
import { getCatalogFilterOptions } from '@/app/requests/catalog-lists';
import { parseWorkParams, type UrlParams } from '@/app/utils/listParams';
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

export type WorksSearchParams = UrlParams;

/** Same render for both routes; only where the parameters come from differs. */
export function WorksView({
  searchParams,
  language,
}: {
  searchParams: WorksSearchParams;
  language: Language;
}) {
  return <WorksList language={language} params={searchParams} />;
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
          'Explore obras de música clássica organizadas por compositor, instrumento e época. Partituras gratuitas de Bach, Chopin, Beethoven, Mozart. Sonata ao Luar, Valsa das Flores, estudos, sonatas e sinfonias completas.',
        searchTitle: `Buscar Obras: "${search}" - Partituras Clássicas`,
        searchDescription: `Resultados da busca por "${search}" em nossa coleção de obras clássicas e partituras gratuitas.`,
        instrumentTitle: `Obras para ${instrument} - Partituras Clássicas`,
        instrumentDescription: `Descubra obras clássicas para ${instrument}. Partituras gratuitas organizadas por compositor e dificuldade.`,
        composerTitle: `Obras de ${composer} - Partituras Completas`,
        composerDescription: `Explore todas as obras de ${composer}. Partituras gratuitas, análises e guias de estudo completos.`,
      },
      en: {
        baseTitle: 'Classical Music Works - Free Sheet Music',
        baseDescription:
          'Explore classical music works organized by composer, instrument and era. Free sheet music from Bach, Chopin, Beethoven, Mozart. Moonlight Sonata, Waltz of the Flowers, studies, sonatas and complete symphonies.',
        searchTitle: `Search Works: "${search}" - Classical Scores`,
        searchDescription: `Search results for "${search}" in our collection of classical works and free sheet music.`,
        instrumentTitle: `Works for ${instrument} - Classical Scores`,
        instrumentDescription: `Discover classical works for ${instrument}. Free sheet music organized by composer and difficulty.`,
        composerTitle: `Works by ${composer} - Complete Scores`,
        composerDescription: `Explore all works by ${composer}. Free sheet music, analyses and complete study guides.`,
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

    return { title, description };
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
  // The URL carries ids; the title needs names.
  const parsed = parseWorkParams(searchParams);
  const options =
    parsed.instrumentId || parsed.composerId
      ? await getCatalogFilterOptions()
      : null;
  const { title, description } = await getCachedMetadata(
    {
      page: String(parsed.page),
      search: parsed.search,
      instrument: options?.instruments.find((i) => i.id === parsed.instrumentId)
        ?.name,
      composer: options?.popularComposers.find(
        (c) => c.id === parsed.composerId
      )?.name,
    },
    language
  );

  return {
    title,
    description,
    authors: [{ name: 'Opus Atlas' }],
    creator: 'Opus Atlas',
    openGraph: {
      images: imagemPadrao(language),
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
