import { pageLanguage } from '@/app/libs/api/client';

/**
 * Interface text written outside a component — requests, stores, a hook's
 * toast — in the page's language. Components read their copy from
 * `conteudo/` instead.
 */
export const porIdioma = (pt: string, en: string) =>
  pageLanguage() === 'en' ? en : pt;
