// app/[lang]/(main)/composers/view.tsx
import { imagemPadrao } from '@/app/utils/ogImagem';
import { Metadata } from 'next';
import { ComposersList } from '@/app/components/site/lists/ComposersList';
import type { UrlParams } from '@/app/utils/listParams';
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

/** Same render for both routes; only where the parameters come from differs. */
export function ComposersView({
  language,
  params = {},
}: {
  language: Language;
  params?: UrlParams;
}) {
  return <ComposersList language={language} params={params} />;
}

export function composersMetadata(
  language: Language,
  searchParams: UrlParams = {}
): Metadata {
  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;
  const page = Number(first(searchParams.page)) || 1;
  const search = first(searchParams.search) || '';
  const comParametro = Object.values(searchParams).some((v) =>
    Array.isArray(v) ? v.length > 0 : !!v
  );

  const content = {
    pt: {
      baseTitle: 'Compositores de música clássica: biografias e obras',
      baseDescription:
        'Explore nossa coleção completa de compositores clássicos. Bach, Chopin, Beethoven, Mozart e os mestres da música erudita. Partituras gratuitas, biografias e análises musicais organizadas por época.',
      searchTitle: `Buscar Compositores: "${search}"`,
      searchDescription: `Resultados da busca por "${search}" em nossa enciclopédia de compositores clássicos.`,
    },
    en: {
      baseTitle: 'Classical music composers: biographies and works',
      baseDescription:
        'Explore our complete collection of classical composers. Bach, Chopin, Beethoven, Mozart and the masters of classical music. Free sheet music, biographies and musical analyses organized by era.',
      searchTitle: `Search Composers: "${search}"`,
      searchDescription: `Search results for "${search}" in our encyclopedia of classical composers.`,
    },
  };

  const t = content[language];

  let title = search ? t.searchTitle : t.baseTitle;
  const description = search ? t.searchDescription : t.baseDescription;

  if (page > 1) {
    title += language === 'pt' ? ` - Página ${page}` : ` - Page ${page}`;
  }

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
      url: 'https://opusatlas.com.br/composers',
      siteName: 'Opus Atlas',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: alternatesFor('/composers', language),
    // A search, a filter or page 2 is not a page of its own: it points to
    // the list (canonical) and stays out of the index, followed for the
    // links. Internal search results are what Google asks not to index.
    robots: {
      index: !comParametro,
      follow: true,
      googleBot: {
        index: !comParametro,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
