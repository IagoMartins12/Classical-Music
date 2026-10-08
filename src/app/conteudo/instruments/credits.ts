import type { Idioma } from '../legal/tipos';
import CREDITS from '../../../../public/instruments/CREDITS.json';
import type { InstrumentKey } from './types';

const MET = 'The Metropolitan Museum of Art';

/** "Antonio Stradivari · The Metropolitan Museum of Art, CC0" for the image caption. */
export function imageCredit(key: InstrumentKey, language: Idioma) {
  const entry = (
    CREDITS as Record<string, { artist: string; license: string }>
  )[key];
  if (!entry) return undefined;
  const license =
    entry.license === 'CC0'
      ? 'CC0'
      : language === 'pt'
        ? 'domínio público'
        : 'public domain';
  const who =
    entry.artist === MET
      ? MET
      : entry.license === 'CC0'
        ? `${entry.artist} · ${MET}`
        : entry.artist;
  return `${who}, ${license}`;
}
