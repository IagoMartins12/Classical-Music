// app/[lang]/(main)/composers/view.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import ComposersServer from './pageServer';
import { ListPageLoading } from '@/app/wrappers/SuspenseWrapper';
import type { Language } from '@/app/utils/translations/serverTranslations';
import { alternatesFor } from '@/app/utils/seoAlternates';

/**
 * O que a rota `/composers` desenha, sem saber de onde vieram os parâmetros.
 *
 * **Por que este arquivo existe.** No Next 15, ler `searchParams` em qualquer
 * ponto de uma rota a torna dinâmica: ela renderiza do zero a cada visita e o
 * `revalidate` declarado não vale nada. Mas a visita que importa — a do Google
 * e a do menu — chega sem parâmetro nenhum.
 *
 * Então a rota foi partida em duas que desenham exatamente a mesma coisa:
 * `page.tsx`, sem `searchParams`, que o Next gera e guarda; e
 * `filtered/page.tsx`, que lê os parâmetros e renderiza sob demanda, como
 * antes — inclusive o metadata, que muda com a busca e com a página. O
 * `middleware.ts` manda a visita para uma ou outra conforme haja query string,
 * sem mudar a URL que o visitante vê.
 */

export interface ComposersSearchParams {
  page?: string;
  search?: string;
  epoch?: string;
}

export function ComposersView({
  page,
  search,
  epochId,
  language,
}: {
  page: number;
  search: string;
  epochId: string;
  language: Language;
}) {
  return (
    <Suspense fallback={<ListPageLoading />}>
      <ComposersServer
        page={page}
        search={search}
        epochId={epochId}
        language={language}
      />
    </Suspense>
  );
}

export function composersMetadata(
  language: Language,
  searchParams: ComposersSearchParams = {}
): Metadata {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || '';

  const content = {
    pt: {
      baseTitle: 'Compositores Clássicos - Lista Completa',
      baseDescription:
        'Explore nossa coleção completa de compositores clássicos. Bach, Chopin, Beethoven, Mozart e centenas de mestres da música erudita. Partituras gratuitas, biografias e análises musicais organizadas por época.',
      searchTitle: `Buscar Compositores: "${search}"`,
      searchDescription: `Resultados da busca por "${search}" em nossa enciclopédia de compositores clássicos.`,
      keywords: [
        'compositores clássicos',
        'lista compositores',
        'Bach compositor',
        'Chopin biografia',
        'Beethoven obras',
        'Mozart partituras',
        'compositores barrocos',
        'compositores românticos',
        'compositores clássicos',
        'compositores impressionistas',
        'música erudita',
        'história música clássica',
        'biografias músicos',
        'enciclopédia musical',
        'educação musical',
        'conservatório',
        'estudar compositores',
        'análise compositores',
        'época musical',
        'períodos musicais',
      ],
    },
    en: {
      baseTitle: 'Classical Composers - Complete List',
      baseDescription:
        'Explore our complete collection of classical composers. Bach, Chopin, Beethoven, Mozart and hundreds of classical music masters. Free sheet music, biographies and musical analyses organized by era.',
      searchTitle: `Search Composers: "${search}"`,
      searchDescription: `Search results for "${search}" in our encyclopedia of classical composers.`,
      keywords: [
        'classical composers',
        'composers list',
        'Bach composer',
        'Chopin biography',
        'Beethoven works',
        'Mozart sheet music',
        'baroque composers',
        'romantic composers',
        'classical composers',
        'impressionist composers',
        'classical music',
        'classical music history',
        'musicians biographies',
        'musical encyclopedia',
        'music education',
        'conservatory',
        'study composers',
        'composers analysis',
        'musical era',
        'musical periods',
      ],
    },
  };

  const t = content[language];

  let title = search ? t.searchTitle : t.baseTitle;
  const description = search ? t.searchDescription : t.baseDescription;

  if (page > 1) {
    title += ` - Página ${page}`;
  }

  return {
    title,
    description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas' }],
    creator: 'Opus Atlas',
    openGraph: {
      title,
      description,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url: 'https://opusatlas.com.br/composers',
      siteName: 'Opus Atlas',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: alternatesFor('/composers', language),
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
