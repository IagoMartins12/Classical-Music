import type { Idioma } from '../legal/tipos';
import { ERAS, type EraKey } from '../site/eras';
import { ERAS_EN } from './eras.en';
import { ERAS_PT } from './eras.pt';
import type { EraChapter } from './types';

const CHAPTERS: Record<Idioma, EraChapter[]> = { pt: ERAS_PT, en: ERAS_EN };

/** The era's chapter in the page language. */
export const eraChapter = (key: EraKey, language: Idioma) =>
  CHAPTERS[language].find((chapter) => chapter.key === key);

/** "baroque" from the URL, if it is one of the seven. */
export const eraBySlug = (slug: string) => ERAS.find((era) => era.key === slug);

export type { EraChapter };
