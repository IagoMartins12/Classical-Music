import { localizeHref, type RouteLanguage } from './localizedRoutes';
import { SITE_URL } from './seoAlternates';

/**
 * What the page templates share for search engines and AI answers: the
 * description cut at a word, dates in ISO 8601 (schema.org rejects
 * "16 December 1770"), the absolute address in the page language and the
 * breadcrumb. One place, so every composer, work and era page says it the
 * same way.
 */

/** The longest description Google shows whole on a phone or a desktop. */
const DESCRICAO_MAX = 158;

/** Plain text: Markdown marks and repeated spaces out. */
const limpo = (texto: string) =>
  texto
    .replace(/[*_#>`[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * The text up to `max` characters, ending at a sentence when one ends close
 * enough, else at a word with "…". Never cuts a word in half.
 */
export function resumo(texto: string, max = DESCRICAO_MAX): string {
  const t = limpo(texto);
  if (t.length <= max) return t;
  const corte = t.slice(0, max);
  const frase = corte.lastIndexOf('. ');
  if (frase > max * 0.6) return corte.slice(0, frase + 1);
  const palavra = corte.lastIndexOf(' ');
  return `${corte.slice(0, palavra > 0 ? palavra : max - 1).replace(/[,;:\s]+$/, '')}…`;
}

/** "1770-12-16", "1770-12" or "1770", as much as is on record. */
export function dataIso(
  partes:
    | { year?: number | null; month?: number | null; day?: number | null }
    | null
    | undefined
): string | undefined {
  if (!partes?.year) return undefined;
  const dois = (n: number) => String(n).padStart(2, '0');
  if (!partes.month) return String(partes.year);
  if (!partes.day) return `${partes.year}-${dois(partes.month)}`;
  return `${partes.year}-${dois(partes.month)}-${dois(partes.day)}`;
}

/** "1770–1827", "n. 1770" / "b. 1770", or nothing. */
export function anosDeVida(
  nascimento: number | null | undefined,
  morte: number | null | undefined,
  language: RouteLanguage
): string {
  if (nascimento && morte) return `${nascimento}–${morte}`;
  if (nascimento)
    return language === 'pt' ? `n. ${nascimento}` : `b. ${nascimento}`;
  return '';
}

/** The page's absolute address in its language (`/en/...` in English). */
export const urlDe = (caminho: string, language: RouteLanguage) =>
  `${SITE_URL}${localizeHref(caminho, language)}`.replace(/\/$/, '') ||
  SITE_URL;

/** schema.org `BreadcrumbList` from (name, path) steps, home first. */
export function trilha(
  passos: Array<[nome: string, caminho: string]>,
  language: RouteLanguage,
  id: string
) {
  return {
    '@type': 'BreadcrumbList',
    '@id': id,
    itemListElement: passos.map(([name, caminho], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: urlDe(caminho, language),
    })),
  };
}

/** The ids the site's entities share across pages (`@id`). */
export const ID_DO_SITE = `${SITE_URL}/#website`;
export const ID_DA_ORGANIZACAO = `${SITE_URL}/#organization`;

/**
 * A chapter of the site's own writing (an era of the history of music, an
 * instrument) as an `Article` about its subject, written by the Opus Atlas,
 * with the breadcrumb. These are the pages that answer "what is the Baroque"
 * or "how does a harpsichord work", the kind AI answers quote.
 */
export function capituloJsonLd({
  caminho,
  titulo,
  descricao,
  imagem,
  assunto,
  secao,
  language,
}: {
  caminho: string;
  titulo: string;
  descricao?: string;
  imagem?: string;
  assunto: string;
  secao: [nome: string, caminho: string];
  language: RouteLanguage;
}) {
  const url = urlDe(caminho, language);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: titulo,
        description: descricao,
        image: imagem ? `${SITE_URL}${imagem}` : undefined,
        url,
        mainEntityOfPage: url,
        inLanguage: language === 'pt' ? 'pt-BR' : 'en-US',
        about: { '@type': 'Thing', name: assunto },
        author: { '@id': ID_DA_ORGANIZACAO },
        publisher: { '@id': ID_DA_ORGANIZACAO },
        isPartOf: { '@id': ID_DO_SITE },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      trilha(
        [['Opus Atlas', '/'], secao, [titulo, caminho]],
        language,
        `${url}#breadcrumb`
      ),
    ],
  };
}
