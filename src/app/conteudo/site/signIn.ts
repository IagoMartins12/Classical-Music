import type { Idioma } from '../legal/tipos';

/** What the visitor tried to do when the site asks them to sign in. */
export type GatedAction =
  | 'favorite'
  | 'study'
  | 'annotate'
  | 'report'
  | 'other';

const pt: Record<GatedAction, string> = {
  favorite: 'Entre na sua conta para guardar nos favoritos.',
  study: 'Entre na sua conta para montar a sua lista de estudos.',
  annotate: 'Entre na sua conta para escrever anotações.',
  report: 'Entre na sua conta para reportar um problema.',
  other: 'Entre na sua conta para continuar.',
};

const en: typeof pt = {
  favorite: 'Sign in to save it to your favorites.',
  study: 'Sign in to build your study list.',
  annotate: 'Sign in to write annotations.',
  report: 'Sign in to report a problem.',
  other: 'Sign in to continue.',
};

export const SIGN_IN_GATE: Record<Idioma, typeof pt> = { pt, en };
