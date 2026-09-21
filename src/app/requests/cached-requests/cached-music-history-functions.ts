// app/requests/cached-requests/cached-music-history-functions.ts
//
// A história da música vem da API (Etapa 3), com o cache do `fetch` do Next
// por tag — que a API limpa quando o dado muda. O cache híbrido no Redis do
// front saiu daqui: a revalidação por tag não chegava nele. Os nomes ficaram
// para a página não mudar.
import { Language } from '@/app/stores/useLanguageStore';
import {
  getComposersByEpochTranslated,
  getEpochsHistoricalDataTranslated,
  getComposersTimelineTranslated,
} from '../music-history-translated';

export const getCachedComposersByEpochTranslated = (language: Language) =>
  getComposersByEpochTranslated(language);

export const getCachedEpochsHistoricalDataTranslated = (language: Language) =>
  getEpochsHistoricalDataTranslated(language);

export const getCachedComposersTimelineTranslated = (language: Language) =>
  getComposersTimelineTranslated(language);
