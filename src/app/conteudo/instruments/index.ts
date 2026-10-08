import type { Idioma } from '../legal/tipos';
import { INSTRUMENTS_EN } from './instruments.en';
import { INSTRUMENTS_PT } from './instruments.pt';
import type { InstrumentChapter, InstrumentKey } from './types';

const CHAPTERS: Record<Idioma, InstrumentChapter[]> = {
  pt: INSTRUMENTS_PT,
  en: INSTRUMENTS_EN,
};

export const instrumentChapter = (key: InstrumentKey, language: Idioma) =>
  CHAPTERS[language].find((chapter) => chapter.key === key);

export { FAMILIES, INSTRUMENTS, instrumentMeta } from './meta';
export type {
  FamilyKey,
  InstrumentChapter,
  InstrumentKey,
  InstrumentMeta,
} from './types';

/** "Trompa natural" → horn: the instrument a free-text name starts with, if any. */
export function instrumentKeyForName(
  name: string,
  language: Idioma
): InstrumentKey | undefined {
  const lower = name.toLowerCase();
  return CHAPTERS[language].find((chapter) =>
    lower.startsWith(chapter.name.toLowerCase())
  )?.key;
}
