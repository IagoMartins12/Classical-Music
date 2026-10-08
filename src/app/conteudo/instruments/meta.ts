import type { FamilyNames, InstrumentMeta } from './types';

/**
 * The instruments the site tells the story of, in family order. Images are
 * public-domain photographs from Wikimedia Commons, resized to WebP; the
 * credits are in `public/instruments/CREDITS.json`.
 */
export const INSTRUMENTS: readonly InstrumentMeta[] = [
  {
    key: 'piano',
    family: 'keyboards',
    dbNames: ['Piano'],
    since: 1700,
    image: '/instruments/piano.webp',
  },
  {
    key: 'harpsichord',
    family: 'keyboards',
    dbNames: ['Cravo', 'Clavicórdio'],
    since: 1397,
    image: '/instruments/harpsichord.webp',
  },
  {
    key: 'organ',
    family: 'keyboards',
    dbNames: ['Órgão', 'Harmônio'],
    since: -250,
    image: '/instruments/organ.webp',
  },
  {
    key: 'violin',
    family: 'strings',
    dbNames: ['Violino'],
    since: 1550,
    image: '/instruments/violin.webp',
  },
  {
    key: 'viola',
    family: 'strings',
    dbNames: ['Viola'],
    since: 1550,
    image: '/instruments/viola.webp',
  },
  {
    key: 'cello',
    family: 'strings',
    dbNames: ['Violoncelo'],
    since: 1560,
    image: '/instruments/cello.webp',
  },
  {
    key: 'double-bass',
    family: 'strings',
    dbNames: ['Contrabaixo'],
    since: 1600,
    image: '/instruments/double-bass.webp',
  },
  {
    key: 'harp',
    family: 'strings',
    dbNames: ['Harpa'],
    since: -3000,
    image: '/instruments/harp.webp',
  },
  {
    key: 'guitar',
    family: 'strings',
    dbNames: ['Violão'],
    since: 1500,
    image: '/instruments/guitar.webp',
  },
  {
    key: 'flute',
    family: 'woodwinds',
    dbNames: ['Flauta', 'Flautim', 'Flauta Doce'],
    since: -40000,
    image: '/instruments/flute.webp',
  },
  {
    key: 'oboe',
    family: 'woodwinds',
    dbNames: ['Oboé', 'Corne Inglês'],
    since: 1650,
    image: '/instruments/oboe.webp',
  },
  {
    key: 'clarinet',
    family: 'woodwinds',
    dbNames: ['Clarinete'],
    since: 1700,
    image: '/instruments/clarinet.webp',
  },
  {
    key: 'bassoon',
    family: 'woodwinds',
    dbNames: ['Fagote'],
    since: 1550,
    image: '/instruments/bassoon.webp',
  },
  {
    key: 'horn',
    family: 'brass',
    dbNames: ['Trompa'],
    since: 1650,
    image: '/instruments/horn.webp',
  },
  {
    key: 'trumpet',
    family: 'brass',
    dbNames: ['Trompete'],
    since: -1300,
    image: '/instruments/trumpet.webp',
  },
  {
    key: 'timpani',
    family: 'percussion',
    dbNames: ['Tímpanos'],
    since: 1450,
    image: '/instruments/timpani.webp',
  },
  {
    key: 'voice',
    family: 'voice',
    dbNames: ['Voz', 'Soprano', 'Contralto', 'Tenor', 'Barítono', 'Coro'],
    since: -40000,
    image: '/instruments/voice.webp',
  },
];

export const FAMILIES: FamilyNames = {
  keyboards: { pt: 'Teclados', en: 'Keyboards' },
  strings: { pt: 'Cordas', en: 'Strings' },
  woodwinds: { pt: 'Madeiras', en: 'Woodwinds' },
  brass: { pt: 'Metais', en: 'Brass' },
  percussion: { pt: 'Percussão', en: 'Percussion' },
  voice: { pt: 'Voz', en: 'Voice' },
};

export const instrumentMeta = (key: string) =>
  INSTRUMENTS.find((i) => i.key === key);
