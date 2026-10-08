import type { Idioma } from '../legal/tipos';

export type FamilyKey =
  | 'keyboards'
  | 'strings'
  | 'woodwinds'
  | 'brass'
  | 'percussion'
  | 'voice';

export type InstrumentKey =
  | 'piano'
  | 'harpsichord'
  | 'organ'
  | 'violin'
  | 'viola'
  | 'cello'
  | 'double-bass'
  | 'harp'
  | 'guitar'
  | 'flute'
  | 'oboe'
  | 'clarinet'
  | 'bassoon'
  | 'horn'
  | 'trumpet'
  | 'timpani'
  | 'voice';

/** What does not depend on language. */
export interface InstrumentMeta {
  key: InstrumentKey;
  family: FamilyKey;
  /** `Instrument.name` values in the catalog, to link to the works. */
  dbNames: readonly string[];
  /** Roughly how far back it goes, for the inventions ruler (negative = BC). */
  since: number;
  image: string;
}

/** One instrument's chapter, written by hand in each language. */
export interface InstrumentChapter {
  key: InstrumentKey;
  name: string;
  /** "Since about 1700, Florence" — shown on the ruler. */
  when: string;
  lede: string;
  howItWorks: string;
  story: string[];
  timeline: { year: string; text: string }[];
  repertoire: string;
  listenFirst: { composer: string; work: string; note: string }[];
  didYouKnow: string[];
}

export type FamilyNames = Record<FamilyKey, Record<Idioma, string>>;
