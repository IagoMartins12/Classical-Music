import type { Idioma } from '../legal/tipos';

/**
 * The eras of Western art music, in order, as the site presents them.
 *
 * `dbNames` are the `Epoch.name` values stored in the database (Portuguese,
 * plus the variants older imports used). The history page (wave 4) adds the
 * long-form chapters on top of this list.
 *
 * Images are public-domain paintings from Wikimedia Commons, resized to WebP;
 * the credits are in `public/eras/CREDITS.json`.
 */

export type EraKey =
  | 'medieval'
  | 'renaissance'
  | 'baroque'
  | 'classical'
  | 'romantic'
  | 'modern'
  | 'contemporary';

export interface Era {
  key: EraKey;
  dbNames: readonly string[];
  /** Approximate span; `to: null` means "to this day". */
  span: { from: number; to: number | null };
  image: string;
  name: Record<Idioma, string>;
  tagline: Record<Idioma, string>;
}

export const ERAS: readonly Era[] = [
  {
    key: 'medieval',
    dbNames: ['Medieval'],
    span: { from: 500, to: 1400 },
    image: '/eras/medieval.webp',
    name: { pt: 'Medieval', en: 'Medieval' },
    tagline: {
      pt: 'O canto gregoriano e a primeira notação.',
      en: 'Gregorian chant and the first notation.',
    },
  },
  {
    key: 'renaissance',
    dbNames: ['Renascentista', 'Renascimento', 'Renaissance'],
    span: { from: 1400, to: 1600 },
    image: '/eras/renaissance.webp',
    name: { pt: 'Renascimento', en: 'Renaissance' },
    tagline: {
      pt: 'A polifonia de Josquin e Palestrina.',
      en: 'The polyphony of Josquin and Palestrina.',
    },
  },
  {
    key: 'baroque',
    dbNames: ['Barroco', 'Baroque'],
    span: { from: 1600, to: 1750 },
    image: '/eras/baroque.webp',
    name: { pt: 'Barroco', en: 'Baroque' },
    tagline: {
      pt: 'Bach, Vivaldi, Handel e a fuga.',
      en: 'Bach, Vivaldi, Handel and the fugue.',
    },
  },
  {
    key: 'classical',
    dbNames: ['Clássico', 'Classical'],
    span: { from: 1750, to: 1820 },
    image: '/eras/classical.webp',
    name: { pt: 'Clássico', en: 'Classical' },
    tagline: {
      pt: 'Haydn, Mozart e a forma sonata.',
      en: 'Haydn, Mozart and sonata form.',
    },
  },
  {
    key: 'romantic',
    dbNames: ['Romântico', 'Romantic'],
    span: { from: 1820, to: 1900 },
    image: '/eras/romantic.webp',
    name: { pt: 'Romântico', en: 'Romantic' },
    tagline: {
      pt: 'O piano de Chopin, a orquestra de Wagner.',
      en: "Chopin's piano, Wagner's orchestra.",
    },
  },
  {
    key: 'modern',
    dbNames: ['Modernismo', 'Moderno', 'Impressionismo', 'Modern'],
    span: { from: 1900, to: 1950 },
    image: '/eras/modern.webp',
    name: { pt: 'Modernismo', en: 'Modernism' },
    tagline: {
      pt: 'Debussy, Stravinsky e o fim da tonalidade.',
      en: 'Debussy, Stravinsky and the end of tonality.',
    },
  },
  {
    key: 'contemporary',
    dbNames: ['Contemporâneo', 'Contemporary'],
    span: { from: 1950, to: null },
    image: '/eras/contemporary.webp',
    name: { pt: 'Contemporâneo', en: 'Contemporary' },
    tagline: {
      pt: 'De Reich a quem escreve hoje.',
      en: 'From Reich to those writing today.',
    },
  },
];

const BY_DB_NAME = new Map(
  ERAS.flatMap((era) => era.dbNames.map((name) => [name, era] as const))
);

/** "1600–1750", or "1950–hoje" / "1950–today" for the open era. */
export const eraYears = (era: Era, language: Idioma) =>
  `${era.span.from}–${era.span.to ?? (language === 'pt' ? 'hoje' : 'today')}`;

/** The era for a database epoch name, if it is one of the seven. */
export const eraOf = (epochName: string | null | undefined) =>
  epochName ? BY_DB_NAME.get(epochName) : undefined;

/** The era's name in the page language, falling back to the raw name. */
export const eraName = (
  epochName: string | null | undefined,
  language: Idioma
) => eraOf(epochName)?.name[language] ?? epochName ?? '';
