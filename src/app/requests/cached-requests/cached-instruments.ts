// app/requests/cached-requests/cached-instruments.ts
//
// A vitrine de instrumentos vem da API (Etapa 3), com o cache do `fetch` do
// Next por tag — que a API limpa quando o dado muda. O cache híbrido no Redis
// do front saiu daqui: a revalidação por tag não chegava nele. A curadoria que
// a página passava (compositores e obras por instrumento) mora na API.
import { Language } from '@/app/stores/useLanguageStore';
import {
  getInstrumentsStatsTranslated,
  getInstrumentsWithWorksTranslated,
  getTopComposersByInstrumentTranslated,
} from '../instruments-history-translated';

export const getCachedInstrumentsStatsTranslated = () =>
  getInstrumentsStatsTranslated();

export const getCachedInstrumentsWithWorksTranslated = (language: Language) =>
  getInstrumentsWithWorksTranslated(language);

export const getCachedTopComposersByInstrumentTranslated = () =>
  getTopComposersByInstrumentTranslated();
