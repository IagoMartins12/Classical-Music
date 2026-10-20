import type { Idioma } from '../legal/tipos';

/** Copy for the composer page. */
const pt = {
  breadcrumb: 'Compositores',
  facts: {
    born: 'Nascimento',
    died: 'Morte',
    aged: (age: number) => `aos ${age} anos`,
    country: 'País',
    era: 'Época',
    wroteFor: 'Compôs para',
    alsoKnownAs: 'Também conhecido como',
    more: (n: number) => `e mais ${n}`,
    less: 'menos',
  },
  bio: {
    heading: 'Biografia',
    aiNote:
      'Texto escrito por inteligência artificial e ainda não revisado por uma pessoa.',
    aiReviewedNote:
      'Texto escrito com ajuda de inteligência artificial e revisado pela equipe do Opus Atlas.',
    translatedNote:
      'Tradução automática do texto escrito em inglês, ainda não revisada por uma pessoa.',
    writing: (name: string) => `Escrevendo a história de ${name}…`,
    writingText:
      'Leva alguns segundos. O texto aparece aqui assim que ficar pronto.',
    unavailable: (name: string) => `Ainda não temos a história de ${name}.`,
    unavailableText:
      'Não encontramos fontes confiáveis para escrever sobre esta pessoa por enquanto.',
    quota: (name: string) => `A história de ${name} ainda não foi escrita.`,
    quotaText:
      'Escrevemos algumas biografias por dia. Volte amanhã: ela estará aqui.',
    error: 'Não conseguimos escrever a biografia agora.',
    errorText: 'Pode ser uma instabilidade passageira.',
    retry: 'Tentar de novo',
  },
  startHere: {
    title: 'Por onde começar',
    curated: 'Escolhidas pela equipe do Opus Atlas',
    mixed: 'Escolhidas pela equipe, depois as mais estudadas',
    levels: {
      beginner: 'Iniciante',
      intermediate: 'Intermediário',
      advanced: 'Avançado',
    },
  },
  watch: 'Para ver',
  curiosities: 'Curiosidades',
  catalog: {
    title: 'Obras',
    search: (name: string) => `Buscar nas obras de ${name}`,
    all: 'Todas',
    category: 'Categoria',
    anyCategory: 'Todas as categorias',
    sort: 'Ordenar',
    sorts: {
      famous: 'Mais conhecidas',
      title: 'A–Z',
      'title-desc': 'Z–A',
      recent: 'Recém-chegadas',
    },
    level: 'Nível',
    anyLevel: 'Qualquer nível',
    clear: 'Limpar filtros',
    loadMore: 'Carregar mais obras',
    loading: 'Carregando…',
    empty: 'Nenhuma obra com esses filtros.',
    error: 'Não foi possível carregar as obras. Tente de novo.',
    works: (n: number) => `${n.toLocaleString('pt-BR')} obras`,
  },
  reading: { title: 'Para ler', blog: 'Ver no blog' },
  sameTime: {
    title: 'Do mesmo tempo',
    text: 'Compositores vivos na mesma época, sorteados a cada hora.',
  },
};

const en: typeof pt = {
  breadcrumb: 'Composers',
  facts: {
    born: 'Born',
    died: 'Died',
    aged: (age: number) => `aged ${age}`,
    country: 'Country',
    era: 'Era',
    wroteFor: 'Wrote for',
    alsoKnownAs: 'Also known as',
    more: (n: number) => `and ${n} more`,
    less: 'less',
  },
  bio: {
    heading: 'Biography',
    aiNote:
      'Written by artificial intelligence and not yet reviewed by a person.',
    aiReviewedNote:
      'Written with the help of artificial intelligence and reviewed by the Opus Atlas team.',
    translatedNote:
      'Machine translation of the Portuguese text, not yet reviewed by a person.',
    writing: (name: string) => `Writing the story of ${name}…`,
    writingText:
      'It takes a few seconds. The text appears here as soon as it is ready.',
    unavailable: (name: string) => `We don't have the story of ${name} yet.`,
    unavailableText:
      'We could not find reliable sources to write about this person for now.',
    quota: (name: string) => `The story of ${name} has not been written yet.`,
    quotaText:
      'We write a few biographies a day. Come back tomorrow: it will be here.',
    error: 'We could not write the biography right now.',
    errorText: 'It may be a passing hiccup.',
    retry: 'Try again',
  },
  startHere: {
    title: 'Where to start',
    curated: 'Chosen by the Opus Atlas team',
    mixed: 'Chosen by the team, then the most studied',
    levels: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },
  },
  watch: 'Watch',
  curiosities: 'Curiosities',
  catalog: {
    title: 'Works',
    search: (name: string) => `Search the works of ${name}`,
    all: 'All',
    category: 'Category',
    anyCategory: 'All categories',
    sort: 'Sort',
    sorts: {
      famous: 'Best known',
      title: 'A–Z',
      'title-desc': 'Z–A',
      recent: 'Recently added',
    },
    level: 'Level',
    anyLevel: 'Any level',
    clear: 'Clear filters',
    loadMore: 'Load more works',
    loading: 'Loading…',
    empty: 'No works match these filters.',
    error: 'Could not load the works. Try again.',
    works: (n: number) => `${n.toLocaleString('en-US')} works`,
  },
  reading: { title: 'Further reading', blog: 'See the blog' },
  sameTime: {
    title: 'Of the same time',
    text: 'Composers alive in the same years, drawn every hour.',
  },
};

export const COMPOSER: Record<Idioma, typeof pt> = { pt, en };
export type ComposerCopy = typeof pt;

/** IMSLP difficulty (1–12) as the three words the site uses. */
export function levelLabel(difficulty: number | null, copy: ComposerCopy) {
  if (!difficulty) return null;
  const { levels } = copy.startHere;
  if (difficulty <= 4) return levels.beginner;
  if (difficulty <= 8) return levels.intermediate;
  return levels.advanced;
}

/** The catalog's level filter values (`Work.difficultyLevel`). */
export const LEVEL_VALUES = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

type DateParts = {
  year: number | null;
  month: number | null;
  day: number | null;
};

/** "17 de outubro de 1849", "outubro de 1849" or "1849", as far as the record goes. */
export function formatDateParts(
  parts: DateParts | undefined,
  language: Idioma
) {
  if (!parts?.year) return null;
  const { year, month, day } = parts;
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
  return new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-GB', {
    timeZone: 'UTC',
    year: 'numeric',
    ...(month && { month: 'long' }),
    ...(month && day && { day: 'numeric' }),
  }).format(date);
}

/** Age at death, exact when both dates are complete, else by years. */
export function ageAt(
  birth: DateParts | undefined,
  death: DateParts | undefined
) {
  if (!birth?.year || !death?.year) return null;
  let age = death.year - birth.year;
  if (birth.month && death.month) {
    const before =
      death.month < birth.month ||
      (death.month === birth.month && (death.day ?? 0) < (birth.day ?? 0));
    if (before) age -= 1;
  }
  return age >= 0 && age < 120 ? age : null;
}
