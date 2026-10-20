import type { FamilyNames, InstrumentMeta } from './types';

/**
 * The instruments the site tells the story of, in family order. `image` is
 * a gold line drawing on a transparent background, traced from a
 * public-domain photograph; `photo` is that photograph with its background
 * removed, shown beside the text. Credits: `public/instruments/CREDITS.json`.
 */
export const INSTRUMENTS: readonly InstrumentMeta[] = [
  {
    key: 'piano',
    family: 'keyboards',
    dbNames: ['Piano'],
    since: 1700,
    image: '/instruments/drawings/piano.webp',
    photo: '/instruments/photos/piano.webp',
  },
  {
    key: 'harpsichord',
    family: 'keyboards',
    dbNames: ['Cravo', 'Clavicórdio'],
    since: 1397,
    image: '/instruments/drawings/harpsichord.webp',
    photo: '/instruments/photos/harpsichord.webp',
  },
  {
    key: 'organ',
    family: 'keyboards',
    dbNames: ['Órgão', 'Harmônio'],
    since: -250,
    image: '/instruments/drawings/organ.webp',
    photo: '/instruments/photos/organ.webp',
  },
  {
    key: 'violin',
    family: 'strings',
    dbNames: ['Violino'],
    since: 1550,
    image: '/instruments/drawings/violin.webp',
    photo: '/instruments/photos/violin.webp',
  },
  {
    key: 'viola',
    family: 'strings',
    dbNames: ['Viola'],
    since: 1550,
    image: '/instruments/drawings/viola.webp',
    photo: '/instruments/photos/viola.webp',
  },
  {
    key: 'cello',
    family: 'strings',
    dbNames: ['Violoncelo'],
    since: 1560,
    image: '/instruments/drawings/cello.webp',
    photo: '/instruments/photos/cello.webp',
  },
  {
    key: 'double-bass',
    family: 'strings',
    dbNames: ['Contrabaixo'],
    since: 1600,
    image: '/instruments/drawings/double-bass.webp',
    photo: '/instruments/photos/double-bass.webp',
  },
  {
    key: 'harp',
    family: 'strings',
    dbNames: ['Harpa'],
    since: -3000,
    image: '/instruments/drawings/harp.webp',
    photo: '/instruments/photos/harp.webp',
  },
  {
    key: 'guitar',
    family: 'strings',
    dbNames: ['Violão'],
    since: 1500,
    image: '/instruments/drawings/guitar.webp',
    photo: '/instruments/photos/guitar.webp',
  },
  {
    key: 'flute',
    family: 'woodwinds',
    dbNames: ['Flauta', 'Flautim', 'Flauta Doce'],
    since: -40000,
    image: '/instruments/drawings/flute.webp',
    photo: '/instruments/photos/flute.webp',
  },
  {
    key: 'oboe',
    family: 'woodwinds',
    dbNames: ['Oboé', 'Corne Inglês'],
    since: 1650,
    image: '/instruments/drawings/oboe.webp',
    photo: '/instruments/photos/oboe.webp',
  },
  {
    key: 'clarinet',
    family: 'woodwinds',
    dbNames: ['Clarinete'],
    since: 1700,
    image: '/instruments/drawings/clarinet.webp',
    photo: '/instruments/photos/clarinet.webp',
  },
  {
    key: 'bassoon',
    family: 'woodwinds',
    dbNames: ['Fagote'],
    since: 1550,
    image: '/instruments/drawings/bassoon.webp',
    photo: '/instruments/photos/bassoon.webp',
  },
  {
    key: 'horn',
    family: 'brass',
    dbNames: ['Trompa'],
    since: 1650,
    image: '/instruments/drawings/horn.webp',
    photo: '/instruments/photos/horn.webp',
  },
  {
    key: 'trumpet',
    family: 'brass',
    dbNames: ['Trompete'],
    since: -1300,
    image: '/instruments/drawings/trumpet.webp',
    photo: '/instruments/photos/trumpet.webp',
  },
  {
    key: 'timpani',
    family: 'percussion',
    dbNames: ['Tímpanos'],
    since: 1450,
    image: '/instruments/drawings/timpani.webp',
    photo: '/instruments/photos/timpani.webp',
  },
  {
    key: 'voice',
    family: 'voice',
    dbNames: ['Voz', 'Soprano', 'Contralto', 'Tenor', 'Barítono', 'Coro'],
    since: -40000,
    image: '/instruments/drawings/voice.webp',
    photo: '/instruments/photos/voice.webp',
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
