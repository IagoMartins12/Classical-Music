import type { Idioma } from '../legal/tipos';

/** Copy for the composer and work lists. No counts in the copy (owner's rule). */
const pt = {
  common: {
    sort: 'Ordenar',
    view: 'Modo de vista',
    cards: 'Cartões',
    list: 'Lista',
    moreFilters: 'Mais filtros',
    filters: 'Filtros',
    clear: 'Limpar',
    clearAll: 'Limpar tudo',
    remove: (label: string) => `Tirar o filtro ${label}`,
    previous: 'Anterior',
    next: 'Próxima',
    pages: 'Páginas',
    page: (n: number) => `Página ${n}`,
    search: 'Buscar',
    empty: 'Nada com esses filtros.',
    noMatch: 'Nenhum resultado',
    emptyText: 'Tente tirar um filtro ou buscar por outra grafia.',
  },
  composers: {
    title: 'Compositores',
    text: 'Da Idade Média a quem compõe hoje. Procure pelo nome, por um apelido ou pela grafia em outra língua, e filtre por época, país ou instrumento.',
    placeholder: 'Nome, apelido ou grafia (W. A. Mozart, Tchaikovsky…)',
    found: (n: number) =>
      n === 1 ? '1 compositor' : `${n.toLocaleString('pt-BR')} compositores`,
    era: 'Época',
    anyEra: 'Todas as épocas',
    country: 'País',
    anyCountry: 'Todos os países',
    wroteFor: 'Compôs para',
    anyInstrument: 'Qualquer instrumento',
    formation: 'Formação',
    anyFormation: 'Qualquer formação',
    onlyWith: 'Só com',
    portrait: 'Retrato',
    withPortrait: 'Com retrato',
    bornBetween: 'Nasceu entre',
    from: 'Ano inicial',
    to: 'Ano final',
    born: (from?: number, to?: number) =>
      from && to
        ? `Nasceu entre ${from} e ${to}`
        : from
          ? `Nasceu a partir de ${from}`
          : `Nasceu até ${to}`,
    apply: 'Ver os compositores',
    sorts: {
      featured: 'Em destaque',
      name: 'A–Z',
      'name-desc': 'Z–A',
      born: 'Mais antigos',
      'born-desc': 'Mais recentes',
    },
  },
  works: {
    title: 'Obras',
    text: 'Sonatas, noturnos, fugas e óperas, cada uma com as partituras de domínio público para baixar. Comece pelo instrumento que você toca.',
    placeholder:
      'Título, opus ou compositor (Sonata ao luar, BWV 846, Chopin…)',
    found: (n: number) =>
      n === 1 ? '1 obra' : `${n.toLocaleString('pt-BR')} obras`,
    instrument: 'Instrumento',
    anyInstrument: 'Qualquer instrumento',
    formation: 'Formação',
    anyFormation: 'Qualquer formação',
    era: 'Época',
    anyEra: 'Todas as épocas',
    genre: 'Gênero',
    anyGenre: 'Todos os gêneros',
    composer: 'Compositor',
    anyComposer: 'Qualquer compositor',
    level: 'Nível',
    anyLevel: 'Qualquer nível',
    apply: 'Ver as obras',
    sorts: { recent: 'Chegaram agora', title: 'A–Z', 'title-desc': 'Z–A' },
  },
};

const en: typeof pt = {
  common: {
    sort: 'Sort',
    view: 'View',
    cards: 'Cards',
    list: 'List',
    moreFilters: 'More filters',
    filters: 'Filters',
    clear: 'Clear',
    clearAll: 'Clear all',
    remove: (label: string) => `Remove the filter ${label}`,
    previous: 'Previous',
    next: 'Next',
    pages: 'Pages',
    page: (n: number) => `Page ${n}`,
    search: 'Search',
    empty: 'Nothing matches these filters.',
    noMatch: 'No match',
    emptyText: 'Try removing a filter or searching another spelling.',
  },
  composers: {
    title: 'Composers',
    text: 'From the Middle Ages to those composing today. Search by name, nickname or spelling in another language, and filter by era, country or instrument.',
    placeholder: 'Name, nickname or spelling (W. A. Mozart, Tchaikovsky…)',
    found: (n: number) =>
      n === 1 ? '1 composer' : `${n.toLocaleString('en-US')} composers`,
    era: 'Era',
    anyEra: 'All eras',
    country: 'Country',
    anyCountry: 'All countries',
    wroteFor: 'Wrote for',
    anyInstrument: 'Any instrument',
    formation: 'Ensemble',
    anyFormation: 'Any ensemble',
    onlyWith: 'Only with',
    portrait: 'Portrait',
    withPortrait: 'With portrait',
    bornBetween: 'Born between',
    from: 'From year',
    to: 'To year',
    born: (from?: number, to?: number) =>
      from && to
        ? `Born ${from}–${to}`
        : from
          ? `Born from ${from}`
          : `Born until ${to}`,
    apply: 'See the composers',
    sorts: {
      featured: 'Featured',
      name: 'A–Z',
      'name-desc': 'Z–A',
      born: 'Oldest',
      'born-desc': 'Most recent',
    },
  },
  works: {
    title: 'Works',
    text: 'Sonatas, nocturnes, fugues and operas, each with public-domain scores to download. Start with the instrument you play.',
    placeholder: 'Title, opus or composer (Moonlight Sonata, BWV 846, Chopin…)',
    found: (n: number) =>
      n === 1 ? '1 work' : `${n.toLocaleString('en-US')} works`,
    instrument: 'Instrument',
    anyInstrument: 'Any instrument',
    formation: 'Ensemble',
    anyFormation: 'Any ensemble',
    era: 'Era',
    anyEra: 'All eras',
    genre: 'Genre',
    anyGenre: 'All genres',
    composer: 'Composer',
    anyComposer: 'Any composer',
    level: 'Level',
    anyLevel: 'Any level',
    apply: 'See the works',
    sorts: { recent: 'Just arrived', title: 'A–Z', 'title-desc': 'Z–A' },
  },
};

export const LISTS: Record<Idioma, typeof pt> = { pt, en };
export type ListsCopy = typeof pt;
