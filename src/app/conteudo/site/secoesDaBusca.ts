import type { Idioma } from '../legal/tipos';
import { INSTRUMENTS } from '../instruments/meta';
import type { InstrumentKey } from '../instruments/types';
import { ERAS, eraYears, type EraKey } from './eras';

/**
 * Instruments and eras in the search: the pages that tell their story
 * (`/instruments/piano`, `/music-history/baroque`) answer a term typed in
 * either language. Names here are short on purpose: the chapters' own text
 * is long and must not reach the browser with the search box.
 */

const INSTRUMENT_NAMES: Record<
  InstrumentKey,
  { pt: string; en: string; also: readonly string[] }
> = {
  piano: { pt: 'Piano', en: 'Piano', also: ['pianoforte', 'fortepiano'] },
  harpsichord: {
    pt: 'Cravo',
    en: 'Harpsichord',
    also: ['clavicembalo', 'clavicordio', 'clavichord'],
  },
  organ: { pt: 'Órgão', en: 'Organ', also: ['pipe organ', 'orgao'] },
  violin: { pt: 'Violino', en: 'Violin', also: ['fiddle', 'rabeca'] },
  viola: { pt: 'Viola', en: 'Viola', also: [] },
  cello: {
    pt: 'Violoncelo',
    en: 'Cello',
    also: ['violoncello', 'violincelo'],
  },
  'double-bass': {
    pt: 'Contrabaixo',
    en: 'Double bass',
    also: ['contrabass', 'upright bass', 'string bass'],
  },
  harp: { pt: 'Harpa', en: 'Harp', also: [] },
  guitar: {
    pt: 'Violão',
    en: 'Classical guitar',
    also: ['guitarra', 'guitar', 'violao'],
  },
  flute: { pt: 'Flauta', en: 'Flute', also: ['flauta transversal'] },
  oboe: { pt: 'Oboé', en: 'Oboe', also: ['oboe'] },
  clarinet: { pt: 'Clarinete', en: 'Clarinet', also: ['clarineta'] },
  bassoon: { pt: 'Fagote', en: 'Bassoon', also: ['fagot'] },
  horn: { pt: 'Trompa', en: 'Horn', also: ['french horn', 'corne'] },
  trumpet: { pt: 'Trompete', en: 'Trumpet', also: ['trompeta'] },
  timpani: {
    pt: 'Tímpanos',
    en: 'Timpani',
    also: ['timpano', 'kettledrum', 'kettledrums', 'timbales'],
  },
  voice: {
    pt: 'Voz',
    en: 'Voice',
    also: ['canto', 'singing', 'voz humana', 'soprano', 'tenor', 'baritono'],
  },
};

const ERA_ALSO: Record<EraKey, readonly string[]> = {
  medieval: ['idade media', 'middle ages', 'gregoriano', 'gregorian'],
  renaissance: ['renascimento', 'renascenca', 'renascentista'],
  baroque: ['barroco', 'barroca'],
  classical: ['classico', 'classicismo', 'classicism', 'classica'],
  romantic: ['romantico', 'romantismo', 'romanticism', 'romantica'],
  modern: ['moderno', 'modernismo', 'modernism', 'moderna'],
  contemporary: ['contemporaneo', 'contemporanea', 'atual'],
};

export interface SectionHit {
  kind: 'instruments' | 'eras';
  key: string;
  name: string;
  /** Under the name: the family or the years. */
  detail: string;
  href: string;
  image: string;
}

const FAMILY: Record<string, { pt: string; en: string }> = {
  keyboards: { pt: 'Teclados', en: 'Keyboards' },
  strings: { pt: 'Cordas', en: 'Strings' },
  woodwinds: { pt: 'Madeiras', en: 'Woodwinds' },
  brass: { pt: 'Metais', en: 'Brass' },
  percussion: { pt: 'Percussão', en: 'Percussion' },
  voice: { pt: 'Voz', en: 'Voice' },
};

/** Lowercase, no accents, single spaces: "Órgão" and "orgao" are one word. */
const plain = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * A name answers a term when a word of it starts with the term ("violin" →
 * "violino", "baro" → "barroco") or the term is the name with a plural
 * ("pianos"). Whole names also match across words ("double b").
 */
function answers(term: string, names: readonly string[]) {
  return names.some((raw) => {
    const name = plain(raw);
    if (!name) return false;
    if (name.startsWith(term)) return true;
    if (name.split(' ').some((word) => word.startsWith(term))) return true;
    return term === `${name}s` || term === `${name}es`;
  });
}

/** Instruments and eras that a typed term names, in either language. */
export function findSections(term: string, language: Idioma): SectionHit[] {
  const q = plain(term);
  if (q.length < 3) return [];
  const instruments = INSTRUMENTS.flatMap((meta): SectionHit[] => {
    const names = INSTRUMENT_NAMES[meta.key];
    if (!answers(q, [names.pt, names.en, ...names.also])) return [];
    return [
      {
        kind: 'instruments',
        key: meta.key,
        name: names[language],
        detail: FAMILY[meta.family][language],
        href: `/instruments/${meta.key}`,
        image: meta.image,
      },
    ];
  });
  const eras = ERAS.flatMap((era): SectionHit[] => {
    if (!answers(q, [era.name.pt, era.name.en, ...ERA_ALSO[era.key]]))
      return [];
    return [
      {
        kind: 'eras',
        key: era.key,
        name: era.name[language],
        detail: eraYears(era, language),
        href: `/music-history/${era.key}`,
        image: era.image,
      },
    ];
  });
  return [...instruments, ...eras];
}
