import type { Idioma } from '../legal/tipos';

/** Copy for the search page. */
const pt = {
  title: 'Buscar',
  metaTitle: (q: string) =>
    q ? `Resultados para “${q}” · Opus Atlas` : 'Buscar · Opus Atlas',
  placeholder: 'Buscar compositor, obra, artigo',
  submit: 'Buscar',
  resultsFor: 'Resultados para',
  prompt: 'O que você procura?',
  promptText:
    'Um compositor, uma obra pelo título ou pelo número de catálogo (BWV 846, Op. 9), um artigo do blog.',
  tabs: {
    all: 'Tudo',
    works: 'Obras',
    composers: 'Compositores',
    articles: 'Artigos',
  },
  tabsLabel: 'Tipo de resultado',
  works: 'Obras',
  composers: 'Compositores',
  articles: 'No blog',
  seeAllWorks: (n: string) => `Ver as ${n} obras`,
  seeAllComposers: (n: string) => `Ver os ${n} compositores`,
  seeAllArticles: (n: string) => `Ver os ${n} artigos`,
  showing: (shown: string, total: string) => `${shown} de ${total}`,
  loadMore: 'Carregar mais',
  loadAll: 'Carregar tudo',
  narrow: 'São muitos resultados. Uma busca mais precisa encontra mais rápido.',
  none: (q: string) => `Nada encontrado para “${q}”.`,
  noneText:
    'Confira a grafia, tente o sobrenome do compositor ou o número de catálogo.',
};

const en: typeof pt = {
  title: 'Search',
  metaTitle: (q: string) =>
    q ? `Results for “${q}” · Opus Atlas` : 'Search · Opus Atlas',
  placeholder: 'Search composer, work, article',
  submit: 'Search',
  resultsFor: 'Results for',
  prompt: 'What are you looking for?',
  promptText:
    'A composer, a work by title or catalog number (BWV 846, Op. 9), a blog article.',
  tabs: {
    all: 'All',
    works: 'Works',
    composers: 'Composers',
    articles: 'Articles',
  },
  tabsLabel: 'Result type',
  works: 'Works',
  composers: 'Composers',
  articles: 'On the blog',
  seeAllWorks: (n: string) => `See all ${n} works`,
  seeAllComposers: (n: string) => `See all ${n} composers`,
  seeAllArticles: (n: string) => `See all ${n} articles`,
  showing: (shown: string, total: string) => `${shown} of ${total}`,
  loadMore: 'Load more',
  loadAll: 'Load all',
  narrow: 'That is a lot of results. A more precise search finds it faster.',
  none: (q: string) => `Nothing found for “${q}”.`,
  noneText:
    'Check the spelling, try the composer’s surname or the catalog number.',
};

export const SEARCH: Record<Idioma, typeof pt> = { pt, en };
