import { translateToneStatic } from '@/app/utils/translations/toneTranslation';

/** Tonalities a work can have, as stored (Portuguese is the canonical form). */
export const TONALITIES = [
  'Do maior',
  'Do# maior',
  'Reb maior',
  'Re maior',
  'Re# maior',
  'Mib maior',
  'Mi maior',
  'Fa maior',
  'Fa# maior',
  'Solb maior',
  'Sol maior',
  'Sol# maior',
  'Lab maior',
  'La maior',
  'La# maior',
  'Sib maior',
  'Si maior',
  'Do menor',
  'Do# menor',
  'Reb menor',
  'Re menor',
  'Re# menor',
  'Mib menor',
  'Mi menor',
  'Fa menor',
  'Fa# menor',
  'Solb menor',
  'Sol menor',
  'Sol# menor',
  'Lab menor',
  'La menor',
  'La# menor',
  'Sib menor',
  'Si menor',
  'Dórico',
  'Frígio',
  'Lídio',
  'Mixolídio',
  'Eólio',
  'Lócrio',
  'Atonal',
  'Politonal',
  'Modal',
  'Cromática',
  'Dodecafônica',
  'Pentatônica',
] as const;

/** `<option>`s for a tonality select, labelled in the reader's language. */
export function tonalityOptions(language: 'pt' | 'en', current?: string) {
  const options = TONALITIES.map((value) => ({
    value: value as string,
    label: translateToneStatic(value, language),
  }));
  // A value outside the list (written by hand before) must not vanish.
  if (current && !options.some((o) => o.value === current))
    options.unshift({ value: current, label: current });
  return options;
}
