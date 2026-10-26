/**
 * "Ballade No.1, Op.23" from a title and its catalog number. Many titles
 * already carry the number (IMSLP style), so it is only appended when missing.
 */
export function workTitle(title: string, catalog?: string | null) {
  if (!catalog) return title;
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  return normalize(title).includes(normalize(catalog))
    ? title
    : `${title}, ${catalog}`;
}

interface ComNomesPopulares {
  popularName?: string | null;
  popularNameEn?: string | null;
  famousParts?: string[] | null;
  famousPartsEn?: string[] | null;
}

/**
 * The names people know a work by, in the page language: its popular name
 * ("Sonata ao Luar") and its famous parts ("Clair de Lune"). An English page
 * shows only English names: a Portuguese one there would read as a typo.
 */
export function popularNames(work: ComNomesPopulares, language: 'pt' | 'en') {
  return language === 'pt'
    ? { name: work.popularName ?? null, parts: work.famousParts ?? [] }
    : { name: work.popularNameEn ?? null, parts: work.famousPartsEn ?? [] };
}

/** "A, B e C" / "A, B and C". */
export const listaDeNomes = (nomes: string[], language: 'pt' | 'en') =>
  new Intl.ListFormat(language === 'pt' ? 'pt-BR' : 'en', {
    type: 'conjunction',
  }).format(nomes);

/**
 * The short form for a list line: the popular name, or the first famous part
 * ("Inclui Clair de Lune"), or nothing.
 */
export function nomePopularCurto(
  work: ComNomesPopulares,
  language: 'pt' | 'en'
): string | null {
  const { name, parts } = popularNames(work, language);
  if (name) return name;
  if (!parts.length) return null;
  const primeira = parts[0].replace(/\s*\([^)]*\)\s*$/, '');
  return `${language === 'pt' ? 'Inclui' : 'Includes'} ${primeira}${parts.length > 1 ? '…' : ''}`;
}
